import os
import re
import io
import json
import hashlib
import asyncio
import logging
import unicodedata
from datetime import datetime, timezone
import base64
from PIL import Image
from openai import OpenAI
import openai
from supabase import create_client
from dotenv import load_dotenv
from telethon import TelegramClient
from telethon.tl.types import MessageMediaPhoto
from tenacity import retry, wait_exponential, stop_after_attempt, retry_if_exception_type

load_dotenv()

# ── Logging ───────────────────────────────────────────────────────────────────
LOG_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "cleaner.log")
log = logging.getLogger("cleaner")
log.setLevel(logging.INFO)
if not log.handlers:
    fmt = logging.Formatter("%(asctime)s [%(levelname)s] %(message)s")
    fh = logging.FileHandler(LOG_PATH, encoding="utf-8")
    fh.setFormatter(fmt)
    sh = logging.StreamHandler()
    sh.setFormatter(fmt)
    log.addHandler(fh)
    log.addHandler(sh)

# ── Env validation ────────────────────────────────────────────────────────────
def _require_env(name: str) -> str:
    value = os.getenv(name)
    if not value:
        raise EnvironmentError(f"Required environment variable '{name}' is missing or empty.")
    return value

# ── Config ────────────────────────────────────────────────────────────────────
_require_env("SUPABASE_URL")
_require_env("SUPABASE_SERVICE_ROLE_KEY")
_require_env("GOOGLE_API_KEY")
_require_env("API_ID")
_require_env("API_HASH")

supabase      = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_ROLE_KEY"))
openai_client = OpenAI(
    api_key=os.getenv("GOOGLE_API_KEY"),
    base_url="https://generativelanguage.googleapis.com/v1beta/openai/",
)

SESSION_PATH   = os.path.join(os.path.dirname(os.path.abspath(__file__)), "scraper_session")
STORAGE_BUCKET = "opportunity-images"

KHMER_DIGIT_MAP      = str.maketrans("០១២៣៤៥៦៧៨៩", "0123456789")
ZERO_WIDTH_CHARS     = re.compile(r"[\u200b\u200c\u200d\ufeff]")
MIN_TEXT_LENGTH      = 80
CONFIDENCE_THRESHOLD = 0.5
PROMPT_VERSION       = "1.5"

_TRANSIENT_ERRORS = (ConnectionError, TimeoutError, OSError)


# ── Valid tag lists (must match TagPicker.tsx exactly) ────────────────────────
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


def clean_tags(tags: list | None) -> list | None:
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

# ── Schema ────────────────────────────────────────────────────────────────────
EXTRACTION_SCHEMA = {
    "type": "object",
    "properties": {
        "is_opportunity":   {"type": "boolean"},
        "title":            {"type": "string"},
        "title_kh":         {"type": "string"},
        "description":      {"type": "string"},
        "description_kh":   {"type": "string"},
        "opportunity_type": {"type": "string", "enum": ["scholarship", "internship", "volunteer", "event", "course", "job", "other"]},
        "organization":     {"type": "string"},
        "price_range":      {"type": "string"},
        "is_free":          {"type": "boolean"},
        "location":         {"type": "string"},
        "format":           {"type": "string", "enum": ["online", "onsite", "hybrid", "unknown"]},
        "deadline":         {"type": "string"},
        "start_date":       {"type": "string"},
        "end_date":         {"type": "string"},
        "contact_info":     {"type": "string"},
        "application_link": {"type": "string"},
        "subject_tags":     {"type": "array", "items": {"type": "string", "enum": VALID_SUBJECT_TAGS}},
        "eligibility":      {"type": "string"},
        "target_group":     {"type": "array", "items": {"type": "string", "enum": VALID_TARGET_TAGS}},
        "language":         {"type": "string", "enum": ["en", "kh", "mixed"]},
        "confidence":       {"type": "number"},
        "needs_review":     {"type": "boolean"}
    },
    "required": ["title", "opportunity_type", "confidence", "needs_review", "is_opportunity"]
}


# ── Prompts ───────────────────────────────────────────────────────────────────
_SHARED_EXTRACTION_RULES = """\
- Set is_opportunity=true only if the post contains a concrete action a student can take: apply, register, attend, sign up, submit. Examples: scholarships, internships, jobs, courses, bootcamps, competitions, seminars, volunteer work, events. Set is_opportunity=false for general news, educational content, announcements with no call to action, or motivational posts.
- Dates must be ISO 8601 format (YYYY-MM-DD). Cambodia uses the Gregorian calendar.
- Return null for missing fields, never guess or infer.
- Set needs_review=true if text is ambiguous, too short, or you are unsure.
- Set confidence between 0.0 and 1.0 based on how complete and clear the post is.
- opportunity_type must be one of: scholarship, internship, volunteer, event, course, job, other.
- organization: the name of the institution, company, or NGO offering the opportunity. Extract exactly as stated in the post. Return null if not mentioned.
- format: must be one of: online, onsite, hybrid, unknown. Determine based on explicit mentions in the post.
- is_free: set to true if the opportunity is explicitly free or has no cost. Set to false if a fee is mentioned. Return null if not stated.
- deadline: the application or registration closing date (ISO 8601). This is NOT the event start date. Only extract if the post explicitly labels it as a deadline or closing date.
- start_date: the date the opportunity or event begins (ISO 8601). This is NOT the application deadline. Only extract if explicitly stated as a start or event date.
- end_date: the date the opportunity or event ends (ISO 8601). Return null if not mentioned.
- application_link: extract only direct URLs to application forms, registration pages, or official opportunity pages. Never extract Google Maps links, social media profile links, location URLs, or general website homepages.
- contact_info: extract phone numbers or email addresses only. Never extract URLs, map links, or location references as contact info.
- For price_range, extract the exact price or fee as stated in the post (e.g. "Free", "$50", "200000 KHR"). Return null if not mentioned.
- title: English title, translate from Khmer if needed.
- title_kh: Khmer title, translate from English if needed.
- description: Write 6-8 sentences in English. Cover what the opportunity is, who it is for (eligibility: age, nationality, year of study), available roles or tracks, what participants gain (benefits, certificate, experience), format (online/onsite/hybrid), and any notable requirements. Only include what is explicitly stated in the post. Do NOT repeat deadline, location, or application link.
- description_kh: Same content as description, written in Khmer.
- subject_tags: choose ONLY from the exact strings below (case-sensitive). Do NOT invent, paraphrase, or use any tag not in this list. Return at most 10 tags total.
  REQUIRED — always include at least one tag from each of these three groups:
    Opportunity Type — Internship, Volunteering, Course, Event, Competition & Hackathon, Fellowship, Exchange Program
    Target Audience — Open to All, High School Student, Undergraduate, Postgraduate, Recent Graduate, Women in STEM, Youth (Under 18), Professional
    (if "Open to All" applies, do NOT also add other audience tags — it is exclusive)
    Format — Online, In-person, Hybrid, Self-Paced
  REQUIRED — include at least one broad domain tag that fits, then add specific tags within that domain:
    Technology — Software Development, Web Development, Data & Mathematics, Cybersecurity, Mobile Development, AI & Machine Learning, Cloud Computing, UI/UX Design
    Business — Entrepreneurship, Marketing, Finance, Management, Accounting, Human Resources, E-commerce, Tourism & Hospitality, Logistics & Supply Chain
    Social Sciences — Social Work, Community Development, Public Policy, Law, Education, Psychology, Sociology
    Arts & Media — Graphic Design, Photography, Journalism, Film & Media, Music & Performance
    Science & Health — Medicine, Public Health, Biology, Agriculture, Environment & Sustainability, Chemistry, Nursing
    Engineering — Civil Engineering, Electrical Engineering, Mechanical Engineering, Architecture, Industrial Engineering
    Skills — Marketing & Social Media, Writing & Translation, Public Speaking, Photography & Videography, Event Planning, Project Management, Community Organizing
- eligibility: a single plain-text sentence describing who can apply, exactly as stated in the post (e.g. "Open to Cambodian youth aged 18-24", "Women only", "University students in their final year"). Return null if not explicitly stated.
- target_group: choose ONLY from the exact strings below (case-sensitive). Select all that apply. Do NOT invent or use any value not in this list:
  Open to All, High School Student, Undergraduate, Postgraduate, Recent Graduate, Women in STEM, Youth (Under 18), Professional
  Return null if not explicitly stated in the post."""

SYSTEM_PROMPT = f"""\
You are an expert data parser for student opportunities in Cambodia.
Posts are in English, Khmer, or mixed. Extract all fields from the provided text. Do not hallucinate, guess, or add external information.
Rules:
{_SHARED_EXTRACTION_RULES}"""

OCR_SYSTEM_PROMPT = f"""\
You are an expert data parser for student opportunities in Cambodia.
This image is a flyer or post from a Telegram channel. It may contain English, Khmer, or mixed text.
First, extract all visible text from the image (OCR).
Then, parse the extracted text and return structured opportunity data. STRICTLY base your output on the extracted text. Do not hallucinate or guess.
Apply the same rules as text extraction:
{_SHARED_EXTRACTION_RULES}"""


# ── Text helpers ──────────────────────────────────────────────────────────────
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


# ── Social-only URL patterns (these alone don't count as actionable) ──────────
_SOCIAL_URL_PATTERN = re.compile(
    r"https?://("
    r"t\.me/|telegram\.me/|"
    r"(www\.)?facebook\.com/|fb\.com/|"
    r"(www\.)?instagram\.com/|"
    r"(www\.)?twitter\.com/|"
    r"(www\.)?tiktok\.com/|"
    r"(www\.)?youtube\.com/|"
    r"(www\.)?linkedin\.com/"
    r")",
    re.IGNORECASE
)

# Phone: Cambodian format
_PHONE_PATTERN = re.compile(r"(?:\+855|0)[1-9]\d{7,8}")

# Email
_EMAIL_PATTERN = re.compile(r"[\w.+-]+@[\w-]+\.\w+")

# Telegram handle used as contact/apply instruction (e.g. @someone, not a URL)
_HANDLE_PATTERN = re.compile(r"@[A-Za-z]\w{3,}")

# Any URL
_ANY_URL_PATTERN = re.compile(r"https?://\S+")


def has_actionable_signal(text: str) -> bool:
    """
    Returns True if the post has at least one signal that suggests
    a person can take action: non-social URL, phone, email, or contact handle.
    """
    # Check for non-social URLs
    urls = _ANY_URL_PATTERN.findall(text)
    for url in urls:
        if not _SOCIAL_URL_PATTERN.match(url):
            return True

    # Check for phone number
    if _PHONE_PATTERN.search(text):
        return True

    # Check for email
    if _EMAIL_PATTERN.search(text):
        return True

    # Check for Telegram handle (used as contact, not a URL)
    if _HANDLE_PATTERN.search(text):
        return True

    return False


EXCLUDED_URL_PATTERNS = re.compile(
    r"(maps\.google\.|goo\.gl/maps|google\.com/maps|t\.me/|telegram\.me/|"
    r"facebook\.com|fb\.com|instagram\.com|twitter\.com|youtube\.com|tiktok\.com)",
    re.IGNORECASE
)


def pre_extract_rules(text: str) -> dict:
    all_urls = re.findall(r"https?://\S+", text)
    app_urls = [u for u in all_urls if not EXCLUDED_URL_PATTERNS.search(u)]
    phones   = re.findall(r"(?:\+855|0)[1-9]\d{7,8}", text)
    emails   = re.findall(r"[\w.+-]+@[\w-]+\.\w+", text)
    return {
        "application_link": app_urls[0] if app_urls else None,
        "contact_info":     phones[0] if phones else (emails[0] if emails else None),
    }


# ── AI calls ──────────────────────────────────────────────────────────────────
_OPENAI_MODEL = "gemini-2.5-flash-lite"
_OPENAI_RESPONSE_FORMAT = {
    "type": "json_schema",
    "json_schema": {"name": "opportunity_extraction", "schema": EXTRACTION_SCHEMA},
}


def _prepare_image(image_bytes: bytes, mime_type: str) -> tuple[bytes, str]:
    try:
        img = Image.open(io.BytesIO(image_bytes))
        needs_convert = mime_type != "image/jpeg" or img.format == "PNG" or len(image_bytes) > 1_500_000
        if needs_convert:
            if img.mode in ("RGBA", "P", "LA"):
                img = img.convert("RGB")
            if img.width > 1200:
                ratio = 1200 / img.width
                img = img.resize((1200, int(img.height * ratio)), Image.LANCZOS)
            buf = io.BytesIO()
            img.save(buf, format="JPEG", quality=85, optimize=True)
            converted = buf.getvalue()
            log.info(f"Image prepared: {len(image_bytes) // 1024}KB {mime_type} -> {len(converted) // 1024}KB image/jpeg")
            return converted, "image/jpeg"
    except Exception as e:
        log.warning(f"Image preparation failed, using original: {e}")
    return image_bytes, mime_type


@retry(
    wait=wait_exponential(multiplier=2, min=10, max=120),
    stop=stop_after_attempt(5),
    retry=retry_if_exception_type((openai.RateLimitError, openai.APIStatusError))
)
def call_openai(text: str) -> dict | None:
    response = openai_client.chat.completions.create(
        model=_OPENAI_MODEL,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user",   "content": f"Parse this opportunity post:\n\n{text}"},
        ],
        response_format=_OPENAI_RESPONSE_FORMAT,
        temperature=0,
    )
    try:
        content = response.choices[0].message.content
        if not content:
            log.warning("OpenAI returned empty response")
            return None
        return json.loads(content)
    except (json.JSONDecodeError, AttributeError, IndexError):
        return None


@retry(
    wait=wait_exponential(multiplier=2, min=10, max=120),
    stop=stop_after_attempt(5),
    retry=retry_if_exception_type((openai.RateLimitError, openai.APIStatusError))
)
def call_openai_vision(image_bytes: bytes, mime_type: str = "image/jpeg") -> dict | None:
    image_bytes, mime_type = _prepare_image(image_bytes, mime_type)
    b64 = base64.b64encode(image_bytes).decode()
    response = openai_client.chat.completions.create(
        model=_OPENAI_MODEL,
        messages=[
            {"role": "system", "content": OCR_SYSTEM_PROMPT},
            {"role": "user", "content": [
                {"type": "image_url", "image_url": {"url": f"data:{mime_type};base64,{b64}"}},
                {"type": "text",      "text": "Extract and parse this opportunity flyer."},
            ]},
        ],
        response_format=_OPENAI_RESPONSE_FORMAT,
        temperature=0,
    )
    try:
        content = response.choices[0].message.content
        if not content:
            log.warning("OpenAI Vision returned empty response")
            return None
        return json.loads(content)
    except (json.JSONDecodeError, AttributeError, IndexError):
        return None


# ── Image helpers ─────────────────────────────────────────────────────────────
def compress_image(image_bytes: bytes, max_width: int = 1200, quality: int = 85) -> bytes | None:
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
            log.info(f"Image compressed: {len(image_bytes) // 1024}KB -> {len(compressed) // 1024}KB")
            return compressed
        log.info(f"Image kept original: {len(image_bytes) // 1024}KB (compression would increase size)")
        return image_bytes
    except Exception as e:
        log.warning(f"Image compression failed (corrupt data?): {e}")
        return None


def get_image_hash(image_bytes: bytes) -> str:
    return hashlib.sha256(image_bytes).hexdigest()


@retry(
    wait=wait_exponential(multiplier=2, min=5, max=45),
    stop=stop_after_attempt(3),
    retry=retry_if_exception_type(_TRANSIENT_ERRORS),
    reraise=True
)
def upload_image_to_storage(image_bytes: bytes, raw_post_id: int) -> str | None:
    compressed = compress_image(image_bytes)
    if compressed is None:
        log.warning(f"Skipping image upload for {raw_post_id}: corrupt image data")
        return None

    image_hash = get_image_hash(image_bytes)

    existing = supabase.table("raw_opportunities") \
        .select("image_url") \
        .eq("image_hash", image_hash) \
        .not_.is_("image_url", "null") \
        .limit(1) \
        .execute().data
    if existing:
        log.info(f"Duplicate image for {raw_post_id}, reusing existing URL")
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


# ── Result merging & DB record ────────────────────────────────────────────────
def merge_results(rule_result: dict, ai_result: dict) -> dict:
    merged = {**ai_result}
    if rule_result.get("application_link"):
        merged["application_link"] = rule_result["application_link"]
    if rule_result.get("contact_info"):
        merged["contact_info"] = rule_result["contact_info"]
    merged["subject_tags"] = clean_tags(merged.get("subject_tags"))
    return merged


def build_db_record(merged: dict, raw_post_id: int, source: dict, image_url: str | None = None) -> dict:
    return {
        "raw_post_id":      raw_post_id,
        "title":            merged.get("title"),
        "title_kh":         merged.get("title_kh"),
        "description":      merged.get("description"),
        "description_kh":   merged.get("description_kh"),
        "type":             merged.get("opportunity_type"),
        "organization":     merged.get("organization"),
        "deadline":         sanitize_date(merged.get("deadline")),
        "start_date":       sanitize_date(merged.get("start_date")),
        "end_date":         sanitize_date(merged.get("end_date")),
        "format":           merged.get("format"),
        "price_range":      merged.get("price_range"),
        "is_free":          merged.get("is_free"),
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


def log_extraction(raw_post_id: int, confidence: float):
    supabase.table("extraction_log").insert({
        "raw_post_id":    raw_post_id,
        "model":          _OPENAI_MODEL,
        "prompt_version": PROMPT_VERSION,
        "confidence":     confidence,
        "extracted_at":   datetime.now(timezone.utc).isoformat(),
    }).execute()


# ── Telegram image download ───────────────────────────────────────────────────
async def download_image(tg_client: TelegramClient, source_chat_id: str, source_message_id: str) -> bytes | None:
    try:
        message = await tg_client.get_messages(int(source_chat_id), ids=int(source_message_id))
        if not message or not isinstance(message.media, MessageMediaPhoto):
            return None
        buf = io.BytesIO()
        await tg_client.download_media(message, file=buf)
        return buf.getvalue()
    except Exception as e:
        log.error(f"Image download failed (chat={source_chat_id}, msg={source_message_id}): {e}")
        return None


def _escape_ilike(text: str) -> str:
    return text.replace("%", "\\%").replace("_", "\\_")


# ── Main processing loop ──────────────────────────────────────────────────────
async def process_queue():
    pending_items = supabase.table("raw_opportunities") \
        .select("*, sources(name, platform)") \
        .in_("processing_status", ["pending", "pending_ocr"]) \
        .order("scraped_at") \
        .limit(50) \
        .execute().data

    if not pending_items:
        log.info("No pending items.")
        return

    log.info(f"Processing {len(pending_items)} items...")

    async with TelegramClient(SESSION_PATH, int(os.getenv("API_ID")), os.getenv("API_HASH")) as tg_client:
        for item in pending_items:
            item_id = item["id"]
            source  = item.get("sources") or {}
            is_ocr  = item["processing_status"] == "pending_ocr"

            try:
                image_url = None
                ai_result = None

                if is_ocr:
                    image_bytes = await download_image(tg_client, item["source_chat_id"], item["source_message_id"])
                    if not image_bytes:
                        supabase.table("raw_opportunities").update({
                            "processing_status": "failed",
                            "error_message":     "image_download_failed"
                        }).eq("id", item_id).execute()
                        log.warning(f"Failed {item_id}: could not download image")
                        continue

                    ai_result = await asyncio.to_thread(call_openai_vision, image_bytes)
                    if not ai_result:
                        supabase.table("raw_opportunities").update({
                            "processing_status": "skipped",
                            "skip_reason":       "vision_unreadable"
                        }).eq("id", item_id).execute()
                        log.warning(f"Skipped {item_id}: Gemini Vision could not read image")
                        continue

                    if not ai_result.get("is_opportunity", False):
                        supabase.table("raw_opportunities").update({
                            "processing_status": "skipped",
                            "skip_reason":       "not_an_opportunity"
                        }).eq("id", item_id).execute()
                        log.info(f"Skipped {item_id}: not an opportunity (OCR)")
                        continue

                    image_url = await asyncio.to_thread(upload_image_to_storage, image_bytes, item_id)
                    if image_url:
                        supabase.table("raw_opportunities").update({
                            "image_url": image_url
                        }).eq("id", item_id).execute()

                    merged = {**ai_result}
                    merged["subject_tags"] = clean_tags(merged.get("subject_tags"))

                else:
                    raw_text = item.get("raw_payload", {}).get("text", "")

                    cleaned = clean_text(raw_text)
                    if not cleaned:
                        supabase.table("raw_opportunities").update({
                            "processing_status": "skipped",
                            "skip_reason":       "too_short"
                        }).eq("id", item_id).execute()
                        log.info(f"Skipped {item_id}: too short")
                        continue

                    # ── Pre-filter: skip Gemini if no actionable signal ────────
                    if not has_actionable_signal(cleaned):
                        supabase.table("raw_opportunities").update({
                            "processing_status": "skipped",
                            "skip_reason":       "no_actionable_signal"
                        }).eq("id", item_id).execute()
                        log.info(f"Skipped {item_id}: no actionable signal (no URL, phone, email, or handle)")
                        continue

                    rule_result = pre_extract_rules(cleaned)

                    ai_result = await asyncio.to_thread(call_openai, cleaned)
                    if not ai_result:
                        supabase.table("raw_opportunities").update({
                            "processing_status": "failed",
                            "error_message":     "ai_empty_response"
                        }).eq("id", item_id).execute()
                        log.warning(f"Skipped {item_id}: AI returned empty response")
                        continue

                    if not ai_result.get("is_opportunity", False):
                        supabase.table("raw_opportunities").update({
                            "processing_status": "skipped",
                            "skip_reason":       "not_an_opportunity"
                        }).eq("id", item_id).execute()
                        log.info(f"Skipped {item_id}: not an opportunity")
                        continue

                    merged = merge_results(rule_result, ai_result)

                    if item.get("has_media"):
                        image_bytes = await download_image(tg_client, item["source_chat_id"], item["source_message_id"])
                        if image_bytes:
                            image_url = await asyncio.to_thread(upload_image_to_storage, image_bytes, item_id)
                            if image_url:
                                supabase.table("raw_opportunities").update({
                                    "image_url": image_url
                                }).eq("id", item_id).execute()

                # Duplicate detection
                title_prefix = (merged.get("title") or "")[:50]
                if title_prefix:
                    escaped_prefix = _escape_ilike(title_prefix)
                    existing = supabase.table("opportunities") \
                        .select("id, deadline") \
                        .eq("source_name", source.get("name")) \
                        .ilike("title", f"%{escaped_prefix}%") \
                        .in_("status", ["pending_review", "approved"]) \
                        .limit(1) \
                        .execute().data
                else:
                    existing = []

                if existing:
                    new_deadline = sanitize_date(merged.get("deadline"))
                    if existing[0].get("deadline") != new_deadline and new_deadline:
                        supabase.table("opportunities").update({
                            "deadline": new_deadline
                        }).eq("id", existing[0]["id"]).execute()
                        log.info(f"Updated deadline for existing opportunity {existing[0]['id']} -> {new_deadline}")
                    else:
                        log.info(f"Duplicate skipped: {item_id} matches existing {existing[0]['id']}")
                    supabase.table("raw_opportunities").update({
                        "processing_status": "skipped",
                        "skip_reason":       "duplicate_updated"
                    }).eq("id", item_id).execute()
                    continue

                record = build_db_record(merged, item_id, source, image_url)
                log_extraction(item_id, merged.get("confidence", 0))

                supabase.table("opportunities").insert(record).execute()
                supabase.table("raw_opportunities").update({
                    "processing_status": "processed"
                }).eq("id", item_id).execute()
                log.info(f"Processed: {item_id} | image={'yes' if image_url else 'no'}")

            except Exception as e:
                log.error(f"Failed {item_id}: {e}", exc_info=True)
                supabase.table("raw_opportunities").update({
                    "processing_status": "failed",
                    "error_message":     str(e)
                }).eq("id", item_id).execute()

            await asyncio.sleep(2)


if __name__ == "__main__":
    asyncio.run(process_queue())