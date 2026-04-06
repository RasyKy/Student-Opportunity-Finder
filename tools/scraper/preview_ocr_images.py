import os
import io
import asyncio
import logging
from supabase import create_client
from telethon import TelegramClient
from telethon.tl.types import MessageMediaPhoto
from dotenv import load_dotenv

load_dotenv()

log = logging.getLogger("preview_ocr")
log.setLevel(logging.INFO)
sh = logging.StreamHandler()
sh.setFormatter(logging.Formatter("%(asctime)s [%(levelname)s] %(message)s"))
log.addHandler(sh)

SESSION_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "scraper_session")
OUTPUT_DIR   = os.path.join(os.path.dirname(os.path.abspath(__file__)), "ocr_preview")
SAMPLE_LIMIT = 10

supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_ROLE_KEY"))


async def preview():
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    rows = supabase.table("raw_opportunities") \
        .select("id, source_chat_id, raw_payload") \
        .eq("processing_status", "pending_ocr") \
        .eq("raw_payload->>text", "") \
        .not_.is_("raw_payload->msg_id", "null") \
        .limit(SAMPLE_LIMIT) \
        .execute().data

    if not rows:
        log.info("No rows found.")
        return

    log.info(f"Downloading {len(rows)} images to: {OUTPUT_DIR}")

    api_id   = int(os.getenv("API_ID"))
    api_hash = os.getenv("API_HASH")

    async with TelegramClient(SESSION_PATH, api_id, api_hash) as tg_client:
        for row in rows:
            row_id  = row["id"]
            chat_id = row["source_chat_id"]
            msg_id  = row["raw_payload"].get("msg_id")

            if not msg_id:
                log.warning(f"  Row {row_id}: missing msg_id, skipping.")
                continue

            try:
                message = await tg_client.get_messages(int(chat_id), ids=int(msg_id))
                if not message or not isinstance(message.media, MessageMediaPhoto):
                    log.warning(f"  Row {row_id}: no photo found.")
                    continue

                buf = io.BytesIO()
                await tg_client.download_media(message, file=buf)

                out_path = os.path.join(OUTPUT_DIR, f"row_{row_id}_msg_{msg_id}.jpg")
                with open(out_path, "wb") as f:
                    f.write(buf.getvalue())

                log.info(f"  Saved: {out_path}")

            except Exception as e:
                log.error(f"  Row {row_id}: failed — {e}")

    log.info("Done. Open the ocr_preview folder to review.")


if __name__ == "__main__":
    asyncio.run(preview())
