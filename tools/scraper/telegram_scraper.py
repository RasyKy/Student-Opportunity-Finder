import os
import asyncio
import hashlib
import logging
import time
from datetime import datetime, timezone
from telethon import TelegramClient
from telethon.tl.types import MessageMediaPhoto
from telethon.errors import FloodWaitError, UsernameInvalidError, ChannelPrivateError
from supabase import create_client
from dotenv import load_dotenv
from tenacity import retry, wait_exponential, stop_after_attempt, retry_if_exception_type
try:
    from postgrest.exceptions import APIError as PostgrestAPIError
except ImportError:
    PostgrestAPIError = OSError  # fallback if not available

load_dotenv()

# ── Logging ───────────────────────────────────────────────────────────────────
# Scoped logger so Telethon/httpx logs don't flood the log file
LOG_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "scraper.log")
log = logging.getLogger("telegram_scraper")
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
SESSION_PATH         = os.path.join(os.path.dirname(os.path.abspath(__file__)), "scraper_session")
MAX_MESSAGES_PER_RUN = 200
CHUNK_SIZE           = 50
RATE_LIMIT_SLEEP     = 1.0

# Transient errors worth retrying — includes Supabase HTTP-level errors (5xx)
_TRANSIENT_ERRORS = (ConnectionError, TimeoutError, OSError, PostgrestAPIError)


def make_content_hash(text: str, source_chat_id: str, msg_id: int = None) -> str:
    normalized = text.strip().lower() if text else ""
    # Photo-only messages have no text — include msg_id so each gets a unique hash
    if not normalized and msg_id:
        normalized = f"__media_only_{msg_id}__"
    return hashlib.sha256(f"{source_chat_id}:{normalized}".encode()).hexdigest()


def parse_last_id(last_id) -> int:
    if not last_id:
        return 0
    try:
        return int(last_id)
    except (ValueError, TypeError):
        log.warning(f"  last_message_id has unexpected value '{last_id}', resetting to 0 (will re-scrape as new channel).")
        return 0


@retry(
    wait=wait_exponential(multiplier=2, min=2, max=30),
    stop=stop_after_attempt(3),
    retry=retry_if_exception_type(_TRANSIENT_ERRORS),
    reraise=True
)
def upsert_chunk(chunk: list):
    supabase.table("raw_opportunities").upsert(
        chunk,
        on_conflict="source_chat_id,source_message_id"
    ).execute()


@retry(
    wait=wait_exponential(multiplier=2, min=2, max=30),
    stop=stop_after_attempt(3),
    retry=retry_if_exception_type(_TRANSIENT_ERRORS),
    reraise=True
)
def update_source_checkpoint(source_id: str, highest_id: str):
    supabase.table("sources").update({
        "last_message_id": highest_id,
        "last_scraped_at": datetime.now(timezone.utc).isoformat()
    }).eq("id", source_id).execute()


@retry(
    wait=wait_exponential(multiplier=2, min=2, max=30),
    stop=stop_after_attempt(3),
    retry=retry_if_exception_type(_TRANSIENT_ERRORS),
    reraise=True
)
def touch_source_timestamp(source_id: str):
    supabase.table("sources").update({
        "last_scraped_at": datetime.now(timezone.utc).isoformat()
    }).eq("id", source_id).execute()


async def get_entity_safe(tg_client: TelegramClient, chat_id_str: str):
    """Try int first, fall back to username string if not numeric."""
    try:
        return await tg_client.get_entity(int(chat_id_str))
    except ValueError:
        log.warning(f"  external_id '{chat_id_str}' is not an integer, trying as username.")
        return await tg_client.get_entity(chat_id_str)


async def fetch_and_store():
    run_start    = time.monotonic()
    total_saved  = 0
    total_errors = 0

    response = supabase.table("sources").select("*").eq("is_active", True).execute()
    sources  = response.data

    if not sources:
        log.info("No active sources found.")
        return

    log.info(f"Starting scrape run for {len(sources)} source(s).")

    async with tg_client:
        try:
            for source in sources:
                chat_id_str = source["external_id"]
                source_name = source["name"]
                source_id   = source["id"]
                last_id     = source.get("last_message_id")

                log.info(f"--- Processing: {source_name} ---")

                # Guard: skip sources with missing external_id
                if not chat_id_str:
                    log.warning(f"  Skipping '{source_name}': missing external_id.")
                    total_errors += 1
                    continue

                try:
                    entity = await get_entity_safe(tg_client, chat_id_str)

                    msgs_to_save = []
                    min_id         = parse_last_id(last_id)
                    is_new_channel = min_id == 0

                    # New channel: fetch only 10 most recent to avoid backfilling
                    # old history on first run. Subsequent runs fetch up to
                    # MAX_MESSAGES_PER_RUN messages since the last checkpoint.
                    limit = 10 if is_new_channel else MAX_MESSAGES_PER_RUN

                    log.info(f"  {'New channel' if is_new_channel else 'Incremental'} scrape | limit={limit} | min_id={min_id}")

                    try:
                        async for message in tg_client.iter_messages(entity, min_id=min_id, limit=limit):
                            has_text  = bool(message.text and message.text.strip())
                            has_photo = isinstance(message.media, MessageMediaPhoto)
                            if not has_text and not has_photo:
                                continue
                            msgs_to_save.append({
                                "message":   message,
                                "has_text":  has_text,
                                "has_photo": has_photo,
                            })
                    except FloodWaitError as e:
                        log.warning(f"  FloodWaitError on iter_messages for {source_name}: waiting {e.seconds}s")
                        await asyncio.sleep(e.seconds)
                        # Fall through — process whatever messages were already collected

                    if not msgs_to_save:
                        log.info(f"  No new messages for {source_name}.")
                        await asyncio.to_thread(touch_source_timestamp, source_id)
                        await asyncio.sleep(RATE_LIMIT_SLEEP)
                        continue

                    # Build bulk data
                    bulk_data = []
                    for item in msgs_to_save:
                        msg  = item["message"]
                        text = msg.text or ""
                        content_hash = make_content_hash(text, chat_id_str, msg.id)
                        bulk_data.append({
                            "source_id":          source_id,
                            "source_chat_id":     chat_id_str,
                            "source_message_id":  str(msg.id),
                            "content_hash":       content_hash,
                            "raw_payload":        {
                                "text":      text,
                                "date":      str(msg.date),
                                "msg_id":    msg.id,
                                "has_media": item["has_photo"],
                            },
                            "has_media":          item["has_photo"],
                            "processing_status":  "pending" if item["has_text"] else "pending_ocr",
                        })

                    # Upsert in chunks with retry
                    source_saved = 0
                    for i in range(0, len(bulk_data), CHUNK_SIZE):
                        chunk = bulk_data[i:i + CHUNK_SIZE]
                        await asyncio.to_thread(upsert_chunk, chunk)
                        source_saved += len(chunk)

                    highest_id   = max(item["message"].id for item in msgs_to_save)
                    total_saved += source_saved
                    await asyncio.to_thread(update_source_checkpoint, source_id, str(highest_id))

                    log.info(f"  Saved {source_saved} messages. Checkpoint: {highest_id}")

                except (UsernameInvalidError, ChannelPrivateError) as e:
                    log.warning(f"  Channel '{source_name}' is inaccessible: {e}. Deactivating source.")
                    supabase.table("sources").update({"is_active": False}).eq("id", source_id).execute()
                    total_errors += 1
                except FloodWaitError as e:
                    log.warning(f"  FloodWaitError on get_entity for {source_name}: waiting {e.seconds}s")
                    await asyncio.sleep(e.seconds)
                    total_errors += 1
                except Exception as e:
                    log.error(f"  Error with {source_name}: {e}", exc_info=True)
                    total_errors += 1

                await asyncio.sleep(RATE_LIMIT_SLEEP)

        finally:
            elapsed = time.monotonic() - run_start
            log.info(
                f"Run complete | sources={len(sources)} | saved={total_saved} | "
                f"errors={total_errors} | duration={elapsed:.1f}s"
            )


def main():
    try:
        api_id = int(_require_env("API_ID"))
    except ValueError:
        raise EnvironmentError("API_ID must be a valid integer.")

    api_hash = _require_env("API_HASH")
    _require_env("SUPABASE_URL")
    _require_env("SUPABASE_SERVICE_ROLE_KEY")

    global tg_client, supabase
    tg_client = TelegramClient(SESSION_PATH, api_id, api_hash)
    supabase  = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_ROLE_KEY"))

    asyncio.run(fetch_and_store())


if __name__ == "__main__":
    main()