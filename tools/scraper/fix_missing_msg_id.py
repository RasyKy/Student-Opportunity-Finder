import os
import logging
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

log = logging.getLogger("fix_msg_id")
log.setLevel(logging.INFO)
fmt = logging.Formatter("%(asctime)s [%(levelname)s] %(message)s")
sh = logging.StreamHandler()
sh.setFormatter(fmt)
log.addHandler(sh)

supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_ROLE_KEY"))

def fix_missing_msg_ids():
    rows = supabase.table("raw_opportunities") \
        .select("id, source_message_id, raw_payload") \
        .is_("raw_payload->msg_id", "null") \
        .not_.is_("source_message_id", "null") \
        .execute().data

    if not rows:
        log.info("No rows to fix.")
        return

    log.info(f"Found {len(rows)} rows with missing msg_id.")

    fixed = 0
    failed = 0
    for row in rows:
        try:
            msg_id = int(row["source_message_id"])
            payload = row["raw_payload"]
            payload["msg_id"] = msg_id

            supabase.table("raw_opportunities").update({
                "raw_payload": payload
            }).eq("id", row["id"]).execute()

            fixed += 1
            log.info(f"  Fixed row {row['id']} -> msg_id={msg_id}")
        except Exception as e:
            failed += 1
            log.error(f"  Failed row {row['id']}: {e}")

    log.info(f"Done. Fixed={fixed}, Failed={failed}")

if __name__ == "__main__":
    fix_missing_msg_ids()