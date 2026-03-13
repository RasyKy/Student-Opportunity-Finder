import os
import re
import io
import json
import hashlib
import asyncio
import unicodedata
from datetime import datetime, timezone
from PIL import Image
from google import genai
from google.genai import types
from google.api_core import exceptions
from supabase import create_client
from dotenv import load_dotenv
from telethon import TelegramClient
from telethon.tl.types import MessageMediaPhoto
from tenacity import retry, wait_exponential, stop_after_attempt, retry_if_exception_type

load_dotenv()

supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_ROLE_KEY"))
gemini = genai.Client(api_key=os.getenv("GOOGLE_API_KEY"))

SESSION_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "scraper_session")
STORAGE_BUCKET = "opportunity-images"

KHMER_DIGIT_MAP = str.maketrans("០១២៣៤៥៦៧៨៩", "0123456789")
ZERO_WIDTH_CHARS = re.compile(r"[\u200b\u200c\u200d\ufeff]")
MIN_TEXT_LENGTH = 80
CONFIDENCE_THRESHOLD = 0.5
PROMPT_VERSION = "1.2"

EXTRACTION_SCHEMA = {
    "type": "object",
    "properties": {
        "is_opportunity":   {"type": "boolean"},
        "title":            {"type": "string"},
        "title_km":         {"type": "string"},
        "description":      {"type": "string"},
        "description_km":   {"type": "string"},
        "opportunity_type": {"type": "string", "enum": ["scholarship", "internship", "volunteer", "event", "course", "job", "other"]},
        "price_range":      {"type": "string"},
        "location":         {"type": "string"},
        "deadline":         {"type": "string"},
        "contact_info":     {"type": "string"},
        "application_link": {"type": "string"},
        "subject_tags":     {"type": "array", "items": {"type": "string"}},
        "eligibility":      {"type": "string"},
        "target_group":     {"type": "array", "items": {"type": "string"}},
        "language":         {"type": "string", "enum": ["en", "kh", "mixed"]},
        "confidence":       {"type": "number"},
        "needs_review":     {"type": "boolean"}
    },
    "required": ["title", "opportunity_type", "confidence", "needs_review", "is_opportunity"]
}

SYSTEM_PROMPT = """You are an expert data parser for student opportunities in Cambodia.
Posts are in English, Khmer, or mixed. Extract all fields from the provided text. Do not hallucinate, guess, or add external information.
Rules:
- Set is_opportunity=true only if the post contains a concrete action a student can take: apply, register, attend, sign up, submit. Examples: scholarships, internships, jobs, courses, bootcamps, competitions, seminars, volunteer work, events. Set is_opportunity=false for general news, educational content, announcements with no call to action, or motivational posts.
- Dates must be ISO 8601 format (YYYY-MM-DD). Cambodia uses the Gregorian calendar.
- Return null for missing fields, never guess or infer.
- Set needs_review=true if text is ambiguous, too short, or you are unsure.
- Set confidence between 0.0 and 1.0 based on how complete and clear the post is.
- opportunity_type must be one of: scholarship, internship, volunteer, event, course, job, other.
- application_link: extract only direct URLs to application forms, registration pages, or official opportunity pages. Never extract Google Maps links, social media profile links, location URLs, or general website homepages.
- contact_info: extract phone numbers or email addresses only. Never extract URLs, map links, or location references as contact info.
- For price_range, extract the exact price or fee as stated in the post (e.g. "Free", "$50", "200000 KHR"). Return null if not mentioned.
- title: English title, translate from Khmer if needed.
- title_km: Khmer title, translate from English if needed.
- description: Write 6-8 sentences in English. Cover what the opportunity is, who it is for (eligibility: age, nationality, year of study), available roles or tracks, what participants gain (benefits, certificate, experience), format (online/onsite/hybrid), and any notable requirements. Only include what is explicitly stated in the post. Do NOT repeat deadline, location, or application link.
- description_km: Same content as description, written in Khmer.
- subject_tags: choose only from this fixed list, select all that apply:
  scholarship, internship, volunteer, event, workshop, seminar, training,
  course, bootcamp, competition, job, exchange, grant, conference, hackathon,
  leadership, environment, technology, health, education, arts, law, business,
  community, research, sports, media, agriculture, finance
- eligibility: a single plain-text sentence describing who can apply, exactly as stated in the post (e.g. "Open to Cambodian youth aged 18-24", "Women only", "University students in their final year"). Return null if not explicitly stated.
- target_group: choose only from this fixed list, select all that apply:
  university_students, high_school, women, youth, professionals,
  graduates, cambodians_only, open_to_all, team_required
  Return null if not explicitly stated in the post."""

OCR_SYSTEM_PROMPT = """You are an expert data parser for student opportunities in Cambodia.
This image is a flyer or post from a Telegram channel. It may contain English, Khmer, or mixed text.
First, extract all visible text from the image (OCR).
Then, parse the extracted text and return structured opportunity data. STRICTLY base your output on the extracted text. Do not hallucinate or guess.
Apply the same rules as text extraction:
- Set is_opportunity=true only if the post contains a concrete action a student can take.
- Dates must be ISO 8601 format (YYYY-MM-DD).
- Return null for missing fields, never guess or infer.
- Set needs_review=true if image is unclear, low quality, or you are unsure.
- Set confidence between 0.0 and 1.0 based on image clarity and completeness.
- opportunity_type must be one of: scholarship, internship, volunteer, event, course, job, other.
- application_link: extract only direct URLs to application forms or registration pages. Never extract Google Maps links, social media profiles, or location URLs.
- contact_info: extract phone numbers or email addresses only. Never extract URLs or map links.
- title: English title, translate from Khmer if needed.
- title_km: Khmer title, translate from English if needed.
- description: Write 6-8 sentences in English. Cover what the opportunity is, who it is for (eligibility: age, nationality, year of study), available roles or tracks, what participants gain (benefits, certificate, experience), format (online/onsite/hybrid), and any notable requirements. Only include what is explicitly stated in the post. Do NOT repeat deadline, location, or application link.
- description_km: Same content as description, written in Khmer.
- subject_tags: choose only from this fixed list, select all that apply:
  scholarship, internship, volunteer, event, workshop, seminar, training,
  course, bootcamp, competition, job, exchange, grant, conference, hackathon,
  leadership, environment, technology, health, education, arts, law, business,
  community, research, sports, media, agriculture, finance
- eligibility: a single plain-text sentence describing who can apply, exactly as stated in the post. Return null if not explicitly stated.
- target_group: choose only from this fixed list, select all that apply:
  university_students, high_school, women, youth, professionals,
  graduates, cambodians_only, open_to_all, team_required
  Return null if not explicitly stated in the post."""


def sanitize_date(value) -> str | None:
    if not value:
        return None
    value = str(value).strip()
    if re.match(r"^\d{4}-\d{2}-\d{2}$", value):
        return value
    return None


def clean_text(text: str) -> str | None:
    text = unicodedata.normalize("NFKC", text)
    text = ZERO_WIDTH_CHARS.sub("", text)
    text = text.translate(KHMER_DIGIT_MAP)
    text = re.sub(r"<[^>]+>", "", text)
    text = re.sub(r"\s{3,}", "\n\n", text)
    text = text.strip()
    if len(text) < MIN_TEXT_LENGTH:
        return None
    return text[:2000]


EXCLUDED_URL_PATTERNS = re.compile(
    r"(maps\.google\.|goo\.gl/maps|google\.com/maps|t\.me/|telegram\.me/|"
    r"facebook\.com|fb\.com|instagram\.com|twitter\.com|youtube\.com|tiktok\.com)",
    re.IGNORECASE
)


def pre_extract_rules(text: str) -> dict:
    all_urls = re.findall(r"https?://\S+", text)
    app_urls = [u for u in all_urls if not EXCLUDED_URL_PATTERNS.search(u)]
    phones = re.findall(r"(?:\+855|0)[1-9]\d{7,8}", text)
    emails = re.findall(r"[\w.+-]+@[\w-]+\.\w+", text)
    return {
        "application_link": app_urls[0] if app_urls else None,
        "contact_info": phones[0] if phones else (emails[0] if emails else None),
    }


@retry(
    wait=wait_exponential(multiplier=2, min=5, max=45),
    stop=stop_after_attempt(3),
    retry=retry_if_exception_type((exceptions.ResourceExhausted, exceptions.ServiceUnavailable))
)
def call_gemini(text: str) -> dict | None:
    response = gemini.models.generate_content(
        model="gemini-2.5-flash-lite",
        contents=f"Parse this opportunity post:\n\n{text}",
        config=types.GenerateContentConfig(
            system_instruction=SYSTEM_PROMPT,
            response_mime_type="application/json",
            response_schema=EXTRACTION_SCHEMA,
            temperature=0,
        )
    )
    try:
        return json.loads(response.text)
    except (json.JSONDecodeError, AttributeError):
        return None


@retry(
    wait=wait_exponential(multiplier=2, min=5, max=45),
    stop=stop_after_attempt(3),
    retry=retry_if_exception_type((exceptions.ResourceExhausted, exceptions.ServiceUnavailable))
)
def call_gemini_vision(image_bytes: bytes, mime_type: str = "image/jpeg") -> dict | None:
    response = gemini.models.generate_content(
        model="gemini-2.5-flash-lite",
        contents=[
            types.Part.from_bytes(data=image_bytes, mime_type=mime_type),
            "Extract and parse this opportunity flyer."
        ],
        config=types.GenerateContentConfig(
            system_instruction=OCR_SYSTEM_PROMPT,
            response_mime_type="application/json",
            response_schema=EXTRACTION_SCHEMA,
            temperature=0,
        )
    )
    try:
        return json.loads(response.text)
    except (json.JSONDecodeError, AttributeError):
        return None


def compress_image(image_bytes: bytes, max_width: int = 1200, quality: int = 85) -> bytes:
    try:
        img = Image.open(io.BytesIO(image_bytes))
        if img.mode in ("RGBA", "P"):
            img = img.convert("RGB")
        if img.width > max_width:
            ratio = max_width / img.width
            img = img.resize((max_width, int(img.height * ratio)), Image.LANCZOS)
        buf = io.BytesIO()
        img.save(buf, format="JPEG", quality=quality, optimize=True)
        compressed = buf.getvalue()
        if len(compressed) < len(image_bytes):
            print(f"Image compressed: {len(image_bytes) // 1024}KB -> {len(compressed) // 1024}KB")
            return compressed
        print(f"Image kept original: {len(image_bytes) // 1024}KB (compression would increase size)")
        return image_bytes
    except Exception as e:
        print(f"Image compression failed, using original: {e}")
        return image_bytes


def get_image_hash(image_bytes: bytes) -> str:
    return hashlib.md5(image_bytes).hexdigest()


@retry(
    wait=wait_exponential(multiplier=2, min=5, max=45),
    stop=stop_after_attempt(3),
    retry=retry_if_exception_type(Exception)
)
def upload_image_to_storage(image_bytes: bytes, raw_post_id: int) -> str | None:
    compressed = compress_image(image_bytes)
    image_hash = get_image_hash(image_bytes)

    existing = supabase.table("raw_opportunities") \
        .select("image_url") \
        .eq("image_hash", image_hash) \
        .not_.is_("image_url", "null") \
        .limit(1) \
        .execute().data
    if existing:
        print(f"Duplicate image for {raw_post_id}, reusing existing URL")
        return existing[0]["image_url"]

    path = f"{raw_post_id}/photo.jpg"
    supabase.storage.from_(STORAGE_BUCKET).upload(
        path=path,
        file=compressed,
        file_options={"content-type": "image/jpeg", "upsert": "true"}
    )
    public_url = supabase.storage.from_(STORAGE_BUCKET).get_public_url(path)

    supabase.table("raw_opportunities").update({
        "image_hash": image_hash
    }).eq("id", raw_post_id).execute()

    return public_url


TAG_SYNONYMS = {
    "workshop":     ["workshop", "workshops"],
    "seminar":      ["seminar", "seminars"],
    "training":     ["training", "trainings"],
    "course":       ["course", "courses", "class", "classes"],
    "scholarship":  ["scholarship", "scholarships", "grant", "grants", "fellowship", "fellowships"],
    "internship":   ["internship", "internships", "intern"],
    "volunteer":    ["volunteer", "volunteering", "volunteers", "voluntary"],
    "event":        ["event", "events"],
    "competition":  ["competition", "competitions", "contest", "contests"],
    "bootcamp":     ["bootcamp", "boot camp", "bootcamps"],
    "job":          ["job", "jobs", "hiring", "vacancy", "vacancies", "career"],
    "exchange":     ["exchange", "exchanges", "student exchange"],
}

_TAG_LOOKUP = {variant: canonical for canonical, variants in TAG_SYNONYMS.items() for variant in variants}


def normalize_tags(tags: list | None) -> list | None:
    if not tags:
        return tags
    seen = set()
    result = []
    for tag in tags:
        normalized = _TAG_LOOKUP.get(tag.lower().strip(), tag.lower().strip())
        if normalized not in seen:
            seen.add(normalized)
            result.append(normalized)
    return result


def merge_results(rule_result: dict, ai_result: dict) -> dict:
    merged = {**ai_result}
    if rule_result.get("application_link"):
        merged["application_link"] = rule_result["application_link"]
    if rule_result.get("contact_info"):
        merged["contact_info"] = rule_result["contact_info"]
    merged["subject_tags"] = normalize_tags(merged.get("subject_tags"))
    return merged


def build_db_record(merged: dict, raw_post_id: int, source: dict, image_url: str | None = None) -> dict:
    return {
        "raw_post_id":      raw_post_id,
        "title":            merged.get("title"),
        "title_km":         merged.get("title_km"),
        "description":      merged.get("description"),
        "description_km":   merged.get("description_km"),
        "type":             merged.get("opportunity_type"),
        "deadline":         sanitize_date(merged.get("deadline")),
        "price_range":      merged.get("price_range"),
        "location":         merged.get("location"),
        "application_link": merged.get("application_link"),
        "contact_info":     merged.get("contact_info"),
        "subject_tags":     merged.get("subject_tags"),
        "eligibility":      merged.get("eligibility"),
        "target_group":     merged.get("target_group"),
        "language":         merged.get("language"),
        "source_name":      source.get("name"),
        "source_platform":  source.get("platform", "telegram"),
        "confidence":       merged.get("confidence"),
        "image_url":        image_url,
        "status":           "pending_review",
    }


def is_valid(structured: dict) -> bool:
    if not structured.get("title"):
        return False
    if structured.get("confidence", 0) < CONFIDENCE_THRESHOLD:
        return False
    return True


def log_extraction(raw_post_id: int, confidence: float):
    supabase.table("extraction_log").insert({
        "raw_post_id":    raw_post_id,
        "model":          "gemini-2.5-flash-lite",
        "prompt_version": PROMPT_VERSION,
        "confidence":     confidence,
        "extracted_at":   datetime.now(timezone.utc).isoformat(),
    }).execute()


async def download_image(tg_client: TelegramClient, source_chat_id: str, source_message_id: str) -> bytes | None:
    try:
        message = await tg_client.get_messages(int(source_chat_id), ids=int(source_message_id))
        if not message or not isinstance(message.media, MessageMediaPhoto):
            return None
        buf = io.BytesIO()
        await tg_client.download_media(message, file=buf)
        return buf.getvalue()
    except Exception as e:
        print(f"Image download failed (chat={source_chat_id}, msg={source_message_id}): {e}")
        return None


async def process_queue():
    pending_items = supabase.table("raw_opportunities") \
        .select("*, sources(name, platform)") \
        .in_("processing_status", ["pending", "pending_ocr"]) \
        .order("scraped_at") \
        .limit(50) \
        .execute().data

    if not pending_items:
        print("No pending items.")
        return

    print(f"Processing {len(pending_items)} items...")

    async with TelegramClient(SESSION_PATH, int(os.getenv("API_ID")), os.getenv("API_HASH")) as tg_client:
        for item in pending_items:
            item_id = item["id"]
            source = item.get("sources") or {}
            is_ocr = item["processing_status"] == "pending_ocr"

            try:
                image_url = None
                ai_result = None

                if is_ocr:
                    image_bytes = await download_image(tg_client, item["source_chat_id"], item["source_message_id"])
                    if not image_bytes:
                        supabase.table("raw_opportunities").update({
                            "processing_status": "failed",
                            "error_message": "image_download_failed"
                        }).eq("id", item_id).execute()
                        print(f"Failed {item_id}: could not download image")
                        continue

                    ai_result = call_gemini_vision(image_bytes)
                    if not ai_result:
                        raise ValueError("Gemini Vision returned no result")

                    if not ai_result.get("is_opportunity", False):
                        supabase.table("raw_opportunities").update({
                            "processing_status": "skipped",
                            "skip_reason": "not_an_opportunity"
                        }).eq("id", item_id).execute()
                        print(f"Skipped {item_id}: not an opportunity (OCR)")
                        continue

                    image_url = upload_image_to_storage(image_bytes, item_id)
                    if image_url:
                        supabase.table("raw_opportunities").update({
                            "image_url": image_url
                        }).eq("id", item_id).execute()

                    merged = {**ai_result}
                    merged["subject_tags"] = normalize_tags(merged.get("subject_tags"))

                else:
                    raw_text = item.get("raw_payload", {}).get("text", "")

                    cleaned = clean_text(raw_text)
                    if not cleaned:
                        supabase.table("raw_opportunities").update({
                            "processing_status": "skipped",
                            "skip_reason": "too_short"
                        }).eq("id", item_id).execute()
                        print(f"Skipped {item_id}: too short")
                        continue

                    rule_result = pre_extract_rules(cleaned)

                    ai_result = call_gemini(cleaned)
                    if not ai_result:
                        raise ValueError("AI returned no result")

                    if not ai_result.get("is_opportunity", False):
                        supabase.table("raw_opportunities").update({
                            "processing_status": "skipped",
                            "skip_reason": "not_an_opportunity"
                        }).eq("id", item_id).execute()
                        print(f"Skipped {item_id}: not an opportunity")
                        continue

                    merged = merge_results(rule_result, ai_result)

                    if item.get("has_media"):
                        image_bytes = await download_image(tg_client, item["source_chat_id"], item["source_message_id"])
                        if image_bytes:
                            image_url = upload_image_to_storage(image_bytes, item_id)
                            if image_url:
                                supabase.table("raw_opportunities").update({
                                    "image_url": image_url
                                }).eq("id", item_id).execute()

                # Duplicate detection
                title_prefix = (merged.get("title") or "")[:50]
                existing = supabase.table("opportunities") \
                    .select("id, deadline") \
                    .eq("source_name", source.get("name")) \
                    .ilike("title", f"%{title_prefix}%") \
                    .in_("status", ["pending_review", "approved"]) \
                    .limit(1) \
                    .execute().data

                if existing:
                    new_deadline = sanitize_date(merged.get("deadline"))
                    if existing[0].get("deadline") != new_deadline and new_deadline:
                        supabase.table("opportunities").update({
                            "deadline": new_deadline
                        }).eq("id", existing[0]["id"]).execute()
                        print(f"Updated deadline for existing opportunity {existing[0]['id']} -> {new_deadline}")
                    else:
                        print(f"Duplicate skipped: {item_id} matches existing {existing[0]['id']}")
                    supabase.table("raw_opportunities").update({
                        "processing_status": "skipped",
                        "skip_reason": "duplicate_updated"
                    }).eq("id", item_id).execute()
                    continue

                record = build_db_record(merged, item_id, source, image_url)
                log_extraction(item_id, merged.get("confidence", 0))

                supabase.table("opportunities").insert(record).execute()
                supabase.table("raw_opportunities").update({
                    "processing_status": "processed"
                }).eq("id", item_id).execute()
                print(f"Processed: {item_id} | image={'yes' if image_url else 'no'}")

            except Exception as e:
                print(f"Failed {item_id}: {e}")
                supabase.table("raw_opportunities").update({
                    "processing_status": "failed",
                    "error_message": str(e)
                }).eq("id", item_id).execute()


if __name__ == "__main__":
    asyncio.run(process_queue())