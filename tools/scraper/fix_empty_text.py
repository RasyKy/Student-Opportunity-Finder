import os
import asyncio
import logging
from supabase import create_client
from telethon import TelegramClient
from dotenv import load_dotenv

load_dotenv()

log = logging.getLogger("fix_empty_text")
log.setLevel(logging.INFO)
sh = logging.StreamHandler()
sh.setFormatter(logging.Formatter("%(asctime)s [%(levelname)s] %(message)s"))
log.addHandler(sh)

SESSION_PATH   = os.path.join(os.path.dirname(os.path.abspath(__file__)), "scraper_session")
GROUP_SEARCH_RANGE = 10  # how many surrounding msg IDs to check for grouped caption
supabase       = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_ROLE_KEY"))


async def find_group_caption(tg_client: TelegramClient, chat_id: int, msg_id: int, grouped_id: int) -> str | None:
    """Search surrounding messages for the sibling that carries the group caption."""
    ids_to_check = list(range(msg_id - GROUP_SEARCH_RANGE, msg_id + GROUP_SEARCH_RANGE + 1))
    siblings = await tg_client.get_messages(chat_id, ids=ids_to_check)
    for sibling in siblings:
        if sibling and sibling.grouped_id == grouped_id and sibling.text and sibling.text.strip():
            return sibling.text.strip()
    return None


async def fix_empty_text():
    rows = supabase.table("raw_opportunities") \
        .select("id, source_chat_id, source_message_id, raw_payload") \
        .eq("processing_status", "pending_ocr") \
        .eq("raw_payload->>text", "") \
        .not_.is_("raw_payload->msg_id", "null") \
        .execute().data

    if not rows:
        log.info("No pending_ocr rows with empty text found.")
        return

    log.info(f"Found {len(rows)} rows to check.")

    api_id   = int(os.getenv("API_ID"))
    api_hash = os.getenv("API_HASH")

    fixed       = 0
    still_empty = 0
    failed      = 0

    async with TelegramClient(SESSION_PATH, api_id, api_hash) as tg_client:
        for row in rows:
            row_id  = row["id"]
            chat_id = int(row["source_chat_id"])
            msg_id  = row["raw_payload"].get("msg_id")

            if not msg_id:
                log.warning(f"  Row {row_id}: missing msg_id, skipping.")
                failed += 1
                continue

            try:
                message = await tg_client.get_messages(chat_id, ids=int(msg_id))
                if not message:
                    log.warning(f"  Row {row_id}: message not found on Telegram.")
                    failed += 1
                    continue

                text = (message.text or "").strip()

                # If no text, check if it's part of a group and find the caption
                if not text and message.grouped_id:
                    log.info(f"  Row {row_id}: grouped message (grouped_id={message.grouped_id}), searching for caption...")
                    text = await find_group_caption(tg_client, chat_id, int(msg_id), message.grouped_id) or ""

                if not text:
                    log.info(f"  Row {row_id}: still empty, leaving as pending_ocr.")
                    still_empty += 1
                    continue

                payload = row["raw_payload"]
                payload["text"] = text

                supabase.table("raw_opportunities").update({
                    "raw_payload":       payload,
                    "processing_status": "pending",
                }).eq("id", row_id).execute()

                fixed += 1
                log.info(f"  Row {row_id}: found text ({len(text)} chars), updated to pending.")

            except Exception as e:
                log.error(f"  Row {row_id}: failed — {e}")
                failed += 1

    log.info(f"Done. Fixed={fixed} | Still empty={still_empty} | Failed={failed}")


if __name__ == "__main__":
    asyncio.run(fix_empty_text())