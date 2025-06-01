import os
import json
from flask import Blueprint, request, jsonify
from dotenv import load_dotenv
from supabase import create_client
import google.generativeai as genai
from utils.forecast_utils import get_lat_lon, get_forecast, CROP_KC

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

ai_blueprint = Blueprint("ai", __name__)

# ✅ BASIC WATER USAGE SUMMARY
def generate_summary(crop, zip_code, schedule):
    total_liters = sum(day["liters"] for day in schedule)
    avg_liters = round(total_liters / len(schedule), 2)
    highest_day = max(schedule, key=lambda x: x["liters"])
    lowest_day = min(schedule, key=lambda x: x["liters"])

    return (
        f"🌾 Crop: {crop}, ZIP Code: {zip_code}\n"
        f"💧 Total water needed over {len(schedule)} days: {total_liters} liters\n"
        f"📈 Average per day: {avg_liters} liters\n"
        f"🔺 Highest usage: {highest_day['liters']}L on {highest_day['day']}\n"
        f"🔻 Lowest usage: {lowest_day['liters']}L on {lowest_day['day']}"
    )

# ✅ AI-GENERATED GEMINI SUMMARY
def generate_gem_summary(crop, zip_code, plot_name, plot_id):
    try:
        model = genai.GenerativeModel("models/gemini-1.5-flash-latest")

        response = supabase.table("plot_schedules").select("schedule").eq("plot_id", plot_id).limit(1).execute()
        schedule = response.data[0]["schedule"] if response.data else []

        lat, lon = get_lat_lon(zip_code)

        context = f"You are helping a farmer named '{plot_name}' who is growing {crop} in ZIP code {zip_code}.\n"
        context += f"They have this upcoming irrigation schedule:\n{json.dumps(schedule, indent=2)}\n"
        context += "Give a helpful forecast-based summary with risks, recommendations, and what to expect based on soil moisture, temperature, and crop water needs."

        response = model.generate_content(context)
        return response.text.strip()

    except Exception as e:
        return f"Gemini summary generation failed: {str(e)}"

# ✅ GEMINI CHAT ENDPOINT
@ai_blueprint.route("/chat", methods=["POST"])
def chat():
    data = request.get_json()
    user_prompt = data.get("prompt", "")
    crop = data.get("crop", "")
    zip_code = data.get("zip", "")
    plot_name = data.get("plotName", "")
    plot_id = data.get("plotId", "")

    if not user_prompt:
        return jsonify({"success": False, "error": "Missing prompt"}), 400

    try:
        # 🔄 Get schedule from Supabase
        response = supabase.table("plot_schedules").select("schedule").eq("plot_id", plot_id).single().execute()
        schedule = response.data["schedule"] if response.data else []

        # 🧠 Process prompt and maybe update schedule
        updated_schedule, reply = process_chat_command(user_prompt, schedule, crop, zip_code, plot_name)

        # 💾 Save back to Supabase if it was changed
        if json.dumps(updated_schedule, sort_keys=True) != json.dumps(schedule, sort_keys=True):
            supabase.table("plot_schedules").update({"schedule": updated_schedule}).eq("plot_id", plot_id).execute()

        return jsonify({"success": True, "reply": reply})

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

# ✅ SMART AI-DRIVEN SCHEDULE EDITING
def process_chat_command(prompt, schedule, crop, zip_code, plot_name):
    from copy import deepcopy
    import json
    import re

    try:
        model = genai.GenerativeModel("models/gemini-1.5-flash-latest")
        context = f"""
You are a smart assistant for a farmer named '{plot_name}' who is growing {crop} in ZIP code {zip_code}.
Here is their current 7-day irrigation schedule in JSON format:
{json.dumps(schedule, indent=2)}

The farmer said: "{prompt}"

Update the schedule according to their intent. Return only the updated schedule as raw JSON (no explanation, no markdown, no formatting).
"""

        response = model.generate_content(context)
        raw = response.text.strip()

        # 🧹 Strip markdown fences or stray "json" keyword
        raw = re.sub(r"^```json|^```|```$", "", raw, flags=re.IGNORECASE).strip()
        raw = re.sub(r"^json\s*", "", raw, flags=re.IGNORECASE).strip()

        if not raw:
            raise ValueError("Gemini returned empty or malformed output.")

        print("🔎 Cleaned Gemini JSON:", raw[:200])

        updated_schedule = json.loads(raw)

        if json.dumps(updated_schedule, sort_keys=True) != json.dumps(schedule, sort_keys=True):
            return updated_schedule, "✅ Schedule updated based on your message."
        else:
            return schedule, "🟢 No changes were needed."

    except Exception as e:
        return schedule, f"❌ Could not apply your request: {e}"
