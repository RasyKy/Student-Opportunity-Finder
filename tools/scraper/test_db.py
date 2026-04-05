import os
import asyncio
from telethon import TelegramClient
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

# Setup clients
# NOTE: Use the Service Role Key for backend scripts to bypass RLS
client = TelegramClient('scraper_session', int(os.getenv('API_ID')), os.getenv('API_HASH'))
supabase = create_client(os.getenv('SUPABASE_URL'), os.getenv('SUPABASE_SERVICE_ROLE_KEY'))

async def fetch_and_store():
    # 1. Fetch active sources from Supabase
    response = supabase.table("sources").select("external_id", "name").eq("is_active", True).execute()
    sources = response.data
    
    if not sources:
        print("No active sources found in Supabase.")
        return

    async with client:
        for source in sources:
            chat_id_str = source['external_id']
            source_name = source['name']
            
            print(f"--- Processing chat: {chat_id_str} ({source_name}) ---")
            
            try:
                entity = await client.get_entity(int(chat_id_str))
                
                # Fetch 3 most recent messages
                async for message in client.iter_messages(entity, limit=3):
                    if message.text:
                        data = {
                            "source": source_name,
                            "source_chat_id": chat_id_str,
                            "source_message_id": str(message.id),
                            "raw_payload": {"text": message.text, "date": str(message.date)}
                        }
                        
                        # Push to Supabase
                        # Make sure to point this to the correct table (raw_opportunities based on your schema)
                        supabase.table("raw_opportunities").insert(data).execute()
                        print(f"Stored message {message.id} from {source_name}")
                        
            except Exception as e:
                print(f"Failed to process {chat_id_str}: {e}")

if __name__ == '__main__':
    asyncio.run(fetch_and_store())