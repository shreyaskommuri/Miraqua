from datetime import datetime
from uuid import uuid4
from supabase import create_client
import os
from dotenv import load_dotenv

load_dotenv()
supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_ROLE_KEY"))

def log_event(plot_id, message, event_type="info"):
    try:
        supabase.table("event_log").insert({
            "id": str(uuid4()),
            "plot_id": plot_id,
            "event_type": event_type,
            "message": message,
            "timestamp": datetime.utcnow().isoformat()
        }).execute()
    except Exception as e:
        print(f"❌ Failed to log event: {e}")
