#!/usr/bin/env python3
"""
retag.py — Backfill standardized subject_tags and target_group onto existing opportunities.

Usage:
  python retag.py            # live run (updates DB)
  python retag.py --dry-run  # preview changes without writing
"""

import os
import sys
import json
import time
import logging
import argparse
from google import genai
from google.genai import types
from google.api_core import exceptions
from supabase import create_client
from dotenv import load_dotenv
from tenacity import retry, wait_exponential, stop_after_attempt, retry_if_exception_type

load_dotenv()

# ── Logging ───────────────────────────────────────────────────────────────────
LOG_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "retag.log")
log = logging.getLogger("retag")
log.setLevel(logging.INFO)
if not log.handlers:
    fmt = logging.Formatter("%(asctime)s [%(levelname)s] %(message)s")
    fh = logging.FileHandler(LOG_PATH, encoding="utf-8")
    fh.setFormatter(fmt)
    sh = logging.StreamHandler()
    sh.setFormatter(fmt)
    log.addHandler(fh)
    log.addHandler(sh)

# ── Clients ───────────────────────────────────────────────────────────────────
for _var in ("SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY", "GOOGLE_API_KEY"):
    if not os.getenv(_var):
        sys.exit(f"Missing required env var: {_var}")

supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_ROLE_KEY"))
gemini   = genai.Client(api_key=os.getenv("GOOGLE_API_KEY"))

# ── Valid tags (must match TagPicker.tsx) ─────────────────────────────────────
VALID_SUBJECT_TAGS = [
    # Opportunity Type
    "Internship", "Volunteering", "Course", "Event", "Competition & Hackathon",
    "Fellowship", "Exchange Program",
    # Technology
    "Software Development", "Web Development", "Data & Mathematics", "Cybersecurity",
    "Mobile Development", "AI & Machine Learning", "Cloud Computing", "UI/UX Design",
    # Business
    "Entrepreneurship", "Marketing", "Finance", "Management", "Accounting",
    "Human Resources", "E-commerce", "Tourism & Hospitality", "Logistics & Supply Chain",
    # Social Sciences
    "Social Work", "Community Development", "Public Policy", "Law", "Education",
    "Psychology", "Sociology",
    # Arts & Media
    "Graphic Design", "Photography", "Journalism", "Film & Media", "Music & Performance",
    # Science & Health
    "Medicine", "Public Health", "Biology", "Agriculture", "Environment & Sustainability",
    "Chemistry", "Nursing",
    # Engineering
    "Civil Engineering", "Electrical Engineering", "Mechanical Engineering",
    "Architecture", "Industrial Engineering",
    # Skills
    "Marketing & Social Media", "Writing & Translation", "Public Speaking",
    "Photography & Videography", "Event Planning", "Project Management",
    "Community Organizing",
    # Target Audience
    "Open to All", "High School Student", "Undergraduate", "Postgraduate",
    "Recent Graduate", "Women in STEM", "Youth (Under 18)", "Professional",
    # Format
    "Online", "In-person", "Hybrid", "Self-Paced",
]

VALID_TARGET_TAGS = [
    "Open to All", "High School Student", "Undergraduate", "Postgraduate",
    "Recent Graduate", "Women in STEM", "Youth (Under 18)", "Professional",
]

MAX_SUBJECT_TAGS = 10

_OPPORTUNITY_TYPE_TAGS = {
    "Internship", "Volunteering", "Course", "Event", "Competition & Hackathon",
    "Fellowship", "Exchange Program",
}
_TARGET_AUDIENCE_TAGS = set(VALID_TARGET_TAGS)
_FORMAT_TAGS = {"Online", "In-person", "Hybrid", "Self-Paced"}
_PRIORITY_TAGS = _OPPORTUNITY_TYPE_TAGS | _TARGET_AUDIENCE_TAGS | _FORMAT_TAGS


def clean_tags(tags: list[str] | None) -> list[str] | None:
    if not tags:
        return tags

    # "Open to All" is exclusive — drop all other audience tags
    if "Open to All" in tags:
        tags = [t for t in tags if t not in _TARGET_AUDIENCE_TAGS or t == "Open to All"]

    # Cap at MAX_SUBJECT_TAGS, keeping required-category tags first
    if len(tags) > MAX_SUBJECT_TAGS:
        priority = [t for t in tags if t in _PRIORITY_TAGS]
        domain   = [t for t in tags if t not in _PRIORITY_TAGS]
        slots    = MAX_SUBJECT_TAGS - len(priority)
        tags     = priority + domain[:max(slots, 0)]

    return tags

# ── Context hint converters ───────────────────────────────────────────────────
# These translate existing DB column values into human-readable hints for Gemini.

_FORMAT_HINT: dict[str, str] = {
    "online":  "Online",
    "onsite":  "In-person",
    "hybrid":  "Hybrid",
}

_TYPE_HINT: dict[str, str] = {
    "internship": "Internship",
    "volunteer":  "Volunteering",
    "course":     "Course",
    "event":      "Event",
    "scholarship": "Fellowship",   # closest match in Opportunity Type group
    "job":        "Internship",    # closest match; Gemini can override from description
}

# Old snake_case target_group values → new display strings (for target_group column migration)
_TARGET_GROUP_MAP: dict[str, str | None] = {
    "university_students": "Undergraduate",
    "high_school":         "High School Student",
    "women":               "Women in STEM",
    "youth":               "Youth (Under 18)",
    "graduates":           "Recent Graduate",
    "open_to_all":         "Open to All",
    "postgraduate":        "Postgraduate",
    "professionals":       "Professional",
    "cambodians_only":     None,
    "team_required":       None,
}


def format_hint(db_format: str | None) -> str:
    return _FORMAT_HINT.get((db_format or "").lower(), "")


def type_hint(db_type: str | None) -> str:
    return _TYPE_HINT.get((db_type or "").lower(), "")


def migrate_target_group(old_tags: list | None) -> list[str]:
    if not old_tags:
        return []
    seen: set[str] = set()
    result: list[str] = []
    for tag in old_tags:
        if not isinstance(tag, str):
            continue
        mapped = _TARGET_GROUP_MAP.get(tag.lower().strip())
        if mapped and mapped not in seen:
            seen.add(mapped)
            result.append(mapped)
    return result


# ── Gemini schema & prompt ────────────────────────────────────────────────────
_RETAG_SCHEMA = {
    "type": "object",
    "properties": {
        "subject_tags": {
            "type": "array",
            "items": {"type": "string", "enum": VALID_SUBJECT_TAGS},
        }
    },
    "required": ["subject_tags"],
}

_RETAG_SYSTEM_PROMPT = (
    "You are a tagging assistant for a student opportunity platform in Cambodia.\n"
    "You will receive an opportunity's title, post text, type, format, and target audience.\n"
    "Select the most relevant subject_tags from the allowed list. Return at most 10 tags total.\n\n"
    "REQUIRED — always include at least one tag from each of these three groups:\n"
    "  Opportunity Type — Internship, Volunteering, Course, Event, Competition & Hackathon, Fellowship, Exchange Program\n"
    "  Target Audience — Open to All, High School Student, Undergraduate, Postgraduate, Recent Graduate, Women in STEM, Youth (Under 18), Professional\n"
    "    (if 'Open to All' applies, do NOT also add other audience tags — it is exclusive)\n"
    "  Format — Online, In-person, Hybrid, Self-Paced\n"
    "  Use the provided 'Format hint' and 'Target audience hint' if these are not clear from the post.\n\n"
    "REQUIRED — include at least one broad domain tag that fits, then add specific tags within that domain:\n"
    "  Technology — Software Development, Web Development, Data & Mathematics, Cybersecurity, Mobile Development, AI & Machine Learning, Cloud Computing, UI/UX Design\n"
    "  Business — Entrepreneurship, Marketing, Finance, Management, Accounting, Human Resources, E-commerce, Tourism & Hospitality, Logistics & Supply Chain\n"
    "  Social Sciences — Social Work, Community Development, Public Policy, Law, Education, Psychology, Sociology\n"
    "  Arts & Media — Graphic Design, Photography, Journalism, Film & Media, Music & Performance\n"
    "  Science & Health — Medicine, Public Health, Biology, Agriculture, Environment & Sustainability, Chemistry, Nursing\n"
    "  Engineering — Civil Engineering, Electrical Engineering, Mechanical Engineering, Architecture, Industrial Engineering\n"
    "  Skills — Marketing & Social Media, Writing & Translation, Public Speaking, Photography & Videography, Event Planning, Project Management, Community Organizing\n\n"
    "Rules:\n"
    "- Choose ONLY exact strings from the allowed list (case-sensitive).\n"
    "- Do NOT invent tags or use values outside the allowed list.\n"
    "- Be selective — only add tags genuinely supported by the content. Max 10 tags."
)


@retry(
    wait=wait_exponential(multiplier=2, min=5, max=45),
    stop=stop_after_attempt(3),
    retry=retry_if_exception_type((exceptions.ResourceExhausted, exceptions.ServiceUnavailable)),
)
def call_gemini_retag(
    title: str,
    content_text: str,
    opp_type: str,
    fmt_hint: str,
    audience_hint: str,
) -> list[str] | None:
    content = "\n".join(filter(None, [
        f"Title: {title}",
        f"Opportunity type: {opp_type or 'unknown'}",
        f"Format hint: {fmt_hint}" if fmt_hint else None,
        f"Target audience hint: {audience_hint}" if audience_hint else None,
        f"Post text: {content_text or '(none)'}",
    ]))
    response = gemini.models.generate_content(
        model="gemini-2.5-flash-lite",
        contents=content,
        config=types.GenerateContentConfig(
            system_instruction=_RETAG_SYSTEM_PROMPT,
            response_mime_type="application/json",
            response_schema=_RETAG_SCHEMA,
            temperature=0,
        ),
    )
    if not response.text:
        return None
    return json.loads(response.text).get("subject_tags") or []


# ── DB helpers ────────────────────────────────────────────────────────────────
def fetch_all_opportunities() -> list[dict]:
    rows: list[dict] = []
    page_size = 1000
    offset = 0
    while True:
        batch = (
            supabase.table("opportunities")
            .select("id, title, description, type, format, subject_tags, target_group, raw_post_id")
            .range(offset, offset + page_size - 1)
            .execute()
            .data
        )
        rows.extend(batch)
        if len(batch) < page_size:
            break
        offset += page_size
    return rows


def fetch_raw_texts(raw_post_ids: list[int]) -> dict[int, str]:
    """Batch-fetch original Telegram post texts. Returns {raw_post_id: text}."""
    if not raw_post_ids:
        return {}
    result: dict[int, str] = {}
    page_size = 500
    for offset in range(0, len(raw_post_ids), page_size):
        chunk = raw_post_ids[offset : offset + page_size]
        rows = (
            supabase.table("raw_opportunities")
            .select("id, raw_payload")
            .in_("id", chunk)
            .execute()
            .data
        )
        for row in rows:
            text = (row.get("raw_payload") or {}).get("text", "") or ""
            if text:
                result[row["id"]] = text
    return result


# ── Main ──────────────────────────────────────────────────────────────────────
def run(dry_run: bool) -> None:
    log.info("─" * 60)
    log.info(f"retag started  |  mode={'DRY RUN' if dry_run else 'LIVE'}")

    rows = fetch_all_opportunities()
    total = len(rows)
    log.info(f"Fetched {total} opportunities")

    # Batch-fetch all original raw texts upfront (one extra query, not N+1)
    raw_post_ids = [r["raw_post_id"] for r in rows if r.get("raw_post_id")]
    raw_texts = fetch_raw_texts(raw_post_ids)
    log.info(f"Fetched raw text for {len(raw_texts)}/{len(raw_post_ids)} opportunities with raw_post_id")

    updated = skipped = errors = 0

    for i, row in enumerate(rows, start=1):
        opp_id      = row["id"]
        title       = row.get("title") or ""
        description = row.get("description") or ""
        opp_type    = row.get("type") or ""
        db_format   = row.get("format") or ""
        old_subject = sorted(row.get("subject_tags") or [])
        old_target  = row.get("target_group") or []

        # Use original raw text if available, otherwise fall back to summary description
        raw_post_id = row.get("raw_post_id")
        raw_text    = raw_texts.get(raw_post_id, "") if raw_post_id else ""
        content_text = raw_text[:1500] if raw_text else description[:600]
        source_label = "raw" if raw_text else "desc"

        # Build context hints from existing structured columns
        fmt_hint      = format_hint(db_format)
        opp_type_hint = type_hint(opp_type)
        new_target    = migrate_target_group(old_target)
        audience_hint = ", ".join(new_target) if new_target else ""

        try:
            new_subject = call_gemini_retag(
                title, content_text, opp_type_hint or opp_type,
                fmt_hint, audience_hint,
            )
            if new_subject is not None:
                new_subject = clean_tags(new_subject)
            if new_subject is None:
                log.warning(f"[{i}/{total}] {opp_id}: Gemini returned nothing — skipped")
                skipped += 1
                time.sleep(2)
                continue

            subject_changed = sorted(new_subject) != old_subject
            target_changed  = sorted(new_target) != sorted(old_target)

            if not subject_changed and not target_changed:
                log.info(f"[{i}/{total}] {opp_id} [{source_label}]: no change")
                skipped += 1
            else:
                changes: list[str] = []
                if subject_changed:
                    changes.append(f"subject_tags {old_subject} → {sorted(new_subject)}")
                if target_changed:
                    changes.append(f"target_group {sorted(old_target)} → {sorted(new_target)}")
                log.info(f"[{i}/{total}] {opp_id} [{source_label}]: {' | '.join(changes)}")

                if not dry_run:
                    update: dict = {}
                    if subject_changed:
                        update["subject_tags"] = new_subject
                    if target_changed:
                        update["target_group"] = new_target or None
                    supabase.table("opportunities").update(update).eq("id", opp_id).execute()

                updated += 1

            # ~30 req/min to stay within Gemini free-tier limits
            time.sleep(2)

        except Exception as exc:
            log.error(f"[{i}/{total}] {opp_id}: {exc}", exc_info=True)
            errors += 1
            time.sleep(2)

    suffix = "  (DRY RUN — no writes)" if dry_run else ""
    log.info(f"Done.  updated={updated}  skipped={skipped}  errors={errors}{suffix}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Standardize opportunity tags to match TagPicker.")
    parser.add_argument("--dry-run", action="store_true", help="Preview changes without writing to DB")
    args = parser.parse_args()
    run(dry_run=args.dry_run)
