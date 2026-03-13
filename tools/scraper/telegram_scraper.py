import os
import asyncio
import hashlib
from datetime import datetime, timezone
from telethon import TelegramClient
from telethon.tl.types import MessageMediaPhoto
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

client = TelegramClient('scraper_session', int(os.getenv('API_ID')), os.getenv('API_HASH'))
supabase = create_client(os.getenv('SUPABASE_URL'), os.getenv('SUPABASE_SERVICE_ROLE_KEY'))


def make_content_hash(text: str, source_chat_id: str) -> str:
    normalized = text.strip().lower() if text else ""
    return hashlib.sha256(f"{source_chat_id}:{normalized}".encode()).hexdigest()


async def fetch_and_store():
    response = supabase.table("sources").select("*").eq("is_active", True).execute()
    sources = response.data

    if not sources:
        print("No active sources found.")
        return

    async with client:
        for source in sources:
            chat_id_str = source['external_id']
            source_name = source['name']
            source_id = source['id']
            last_id = source.get('last_message_id')

            print(f"--- Processing: {source_name} ---")

            try:
                entity = await client.get_entity(int(chat_id_str))
                msgs_to_save = []

                min_id = int(last_id) if last_id and last_id != "None" else 0
                limit = 10 if min_id == 0 else None

                async for message in client.iter_messages(entity, min_id=min_id, limit=limit):
                    has_text = bool(message.text and message.text.strip())
                    has_photo = isinstance(message.media, MessageMediaPhoto)

                    if not has_text and not has_photo:
                        continue

                    msgs_to_save.append({
                        "message": message,
                        "has_text": has_text,
                        "has_photo": has_photo,
                    })

                if not msgs_to_save:
                    supabase.table("sources").update({
                        "last_scraped_at": datetime.now(timezone.utc).isoformat()
                    }).eq("id", source_id).execute()
                    continue

                bulk_data = []
                for item in msgs_to_save:
                    msg = item["message"]
                    text = msg.text or ""
                    content_hash = make_content_hash(text, chat_id_str)

                    bulk_data.append({
                        "source_id":          source_id,
                        "source_chat_id":     chat_id_str,
                        "source_message_id":  str(msg.id),
                        "content_hash":       content_hash,
                        "raw_payload":        {"text": text, "date": str(msg.date)},
                        "has_media":          item["has_photo"],
                        "processing_status":  "pending" if item["has_text"] else "pending_ocr",
                    })

                supabase.table("raw_opportunities").upsert(
                    bulk_data,
                    on_conflict="source_chat_id,source_message_id"
                ).execute()

                highest_id = max(item["message"].id for item in msgs_to_save)
                supabase.table("sources").update({
                    "last_message_id": str(highest_id),
                    "last_scraped_at": datetime.now(timezone.utc).isoformat()
                }).eq("id", source_id).execute()

                print(f"[+] Saved {len(bulk_data)} messages. Checkpoint: {highest_id}")

            except Exception as e:
                print(f"Error with {source_name}: {e}")


if __name__ == '__main__':
    asyncio.run(fetch_and_store())