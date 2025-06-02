import os
import json
from flask import Blueprint, request, jsonify
from dotenv import load_dotenv
from supabase import create_client
import google.generativeai as genai
from utils.forecast_utils import get_lat_lon, get_forecast, CROP_KC
from datetime import datetime, timedelta
import re

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

# ✅ ATTACH DATE TO EACH DAY
def attach_real_dates(schedule):
    today = datetime.now()
    new_schedule = []

    for i, entry in enumerate(schedule):
        date = (today + timedelta(days=i)).strftime("%A, %B %d")
        new_schedule.append({
            "day": f"Day {i + 1}",
            "date": date,
            "liters": entry["liters"]
        })

    return new_schedule

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

        # 📂 Save back to Supabase if it was changed
        if json.dumps(updated_schedule, sort_keys=True) != json.dumps(schedule, sort_keys=True):
            supabase.table("plot_schedules").update({"schedule": updated_schedule}).eq("plot_id", plot_id).execute()

        return jsonify({"success": True, "reply": reply})

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

# ✅ SMART AI-DRIVEN SCHEDULE EDITING
def process_chat_command(prompt, schedule, crop, zip_code, plot_name):
    import json
    import re
    from datetime import datetime, timedelta
    from copy import deepcopy

    try:
        model = genai.GenerativeModel("models/gemini-1.5-flash-latest")

        today = datetime.now()
        today_index = today.weekday()  # 0 = Monday, 6 = Sunday

        # Add explicit context mapping index to dates
        schedule_with_dates = []
        for i, day in enumerate(schedule):
            day_date = today + timedelta(days=i)
            schedule_with_dates.append({
                "index": i,
                "day": day["day"],
                "date": day_date.strftime("%Y-%m-%d"),
                "liters": day["liters"]
            })

        context = f"""
You are FarmerBot, helping a farmer named '{plot_name}' growing {crop} in ZIP {zip_code}.
Today is {today.strftime("%A")} ({today.strftime("%Y-%m-%d")}).

Here is their current 7-day irrigation schedule:
{json.dumps(schedule_with_dates, indent=2)}

The farmer said: "{prompt}"

👉 If this is a request to change the schedule, return ONLY the modified schedule (same format), as a clean JSON array. Do not add text or explanations.
👉 If it's just a general question, answer in natural language without any JSON.
"""

        response = model.generate_content(context)
        reply = response.text.strip()

        is_json = reply.strip().startswith("[") or "{" in reply
        if is_json:
            reply_clean = re.sub(r"^```json|^```|```$", "", reply, flags=re.IGNORECASE).strip()
            reply_clean = re.sub(r"^json\s*", "", reply_clean, flags=re.IGNORECASE).strip()

            updated_schedule = json.loads(reply_clean)

            if json.dumps(updated_schedule, sort_keys=True) != json.dumps(schedule, sort_keys=True):
                return updated_schedule, "✅ Schedule updated based on your message."
            else:
                return schedule, "🧠 Got your message! But no changes were needed in the schedule."
        else:
            return schedule, reply  # regular answer

    except Exception as e:
        return schedule, f"❌ Error processing message: {e}"
