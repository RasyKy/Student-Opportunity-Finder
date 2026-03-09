import asyncio
from telethon import TelegramClient
import os
from dotenv import load_dotenv

# Load variables from .env into the environment
load_dotenv()

# Access them safely
api_id = os.getenv('API_ID')
api_hash = os.getenv('API_HASH')
phone = os.getenv('TELEGRAM_PHONE')

async def main():
    # Create the client and connect
    client = TelegramClient('session_name', api_id, api_hash)
    await client.start(phone)

    print("Fetching your chats...")
    
    # Iterate through all dialogs (chats/channels/groups)
    async for dialog in client.iter_dialogs():
        # Print the title and the unique ID
        print(f"Title: {dialog.title} | ID: {dialog.id}")

if __name__ == '__main__':
    asyncio.run(main())