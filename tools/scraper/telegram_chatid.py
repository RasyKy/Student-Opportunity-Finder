import asyncio
from telethon import TelegramClient
import os
from dotenv import load_dotenv

load_dotenv()

api_id = os.getenv('API_ID')
api_hash = os.getenv('API_HASH')
phone = os.getenv('TELEGRAM_PHONE')

async def main():
    client = TelegramClient('session_name', api_id, api_hash)
    await client.start(phone)
    print("Fetching channels and groups...\n")

    async for dialog in client.iter_dialogs():
        if dialog.is_channel:
            print(f"[CHANNEL] {dialog.title} | ID: {dialog.id}")
        elif dialog.is_group:
            print(f"[GROUP]   {dialog.title} | ID: {dialog.id}")

if __name__ == '__main__':
    asyncio.run(main())