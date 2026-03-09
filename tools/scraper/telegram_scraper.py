import os
from telethon import TelegramClient
from supabase import create_client
from dotenv import load_dotenv
import traceback

load_dotenv()

client = TelegramClient('scraper_session', os.getenv('API_ID'), os.getenv('API_HASH'))
supabase = create_client(os.getenv('SUPABASE_URL'), os.getenv('SUPABASE_KEY'))

async def fetch_and_store(chat_id):
    print(f"--- Starting sync for chat: {chat_id} ---")
    
    # 1. Get source DB ID
    source = supabase.table("sources").select("id").eq("external_id", str(chat_id)).single().execute()
    if not source.data:
        print(f"ERROR: Chat {chat_id} not found in 'sources' table. Did you add it?")
        return
    
    source_id = source.data['id']
    
    # 2. Get the highest ID already in raw_messages
    last_msg = supabase.table("raw_messages").select("source_message_id").eq("source_id", source_id).order("source_message_id", desc=True).limit(1).execute()
    last_id = int(last_msg.data[0]['source_message_id']) if last_msg.data else 0
    print(f"Last message ID in DB for source {source_id} is: {last_id}")

    # 3. Fetch from Telegram
    count = 0
    async for message in client.iter_messages(chat_id, min_id=last_id, reverse=True):
        if message.text:
            count += 1
            try:
                result = supabase.table("raw_messages").upsert({
                    "source_id": source_id,
                    "source_message_id": str(message.id),
                    "raw_payload": {"text": message.text, "date": str(message.date)}
                }, on_conflict="source_id, source_message_id").execute()
                
                print(f"Success: Stored message {message.id}")
            except Exception as e:
                print(f"CRITICAL ERROR on message {message.id}:")
                traceback.print_exc() # This prints exactly which line caused the crash
    
    if count == 0:
        print(f"No new messages found for source {source_id} (Last ID was {last_id})")
    else:
        # 4. Update last_scraped_at
        supabase.table("sources").update({"last_scraped_at": "now()"}).eq("id", source_id).execute()
        print(f"Finished: {count} new messages processed.")