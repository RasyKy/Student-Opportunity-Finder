import re
from supabase import create_client

supabase = create_client(os.getenv('SUPABASE_URL'), os.getenv('SUPABASE_KEY'))

def parse_text(text):
    # Simple regex to find dates (like DD/MM/YYYY or similar)
    date_match = re.search(r'\d{1,2}[/-]\d{1,2}[/-]\d{2,4}', text)
    # Simple regex to find a URL
    url_match = re.search(r'(https?://\S+)', text)
    
    return {
        "title": text.split('\n')[0][:100], # First line as title
        "deadline": date_match.group(0) if date_match else None,
        "url": url_match.group(0) if url_match else None,
        "description": text[:200]
    }

def run_cleaning_pipeline():
    # Fetch raw messages that haven't been processed yet
    # Tip: You could add an 'is_processed' column to raw_messages
    raws = supabase.table("raw_messages").select("*").execute()
    
    for item in raws.data:
        parsed = parse_text(item['raw_payload']['text'])
        supabase.table("opportunities").insert({
            "raw_id": item['id'],
            **parsed
        }).execute()
        print(f"Processed message {item['id']}")