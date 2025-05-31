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
        if updated_schedule != schedule:
            supabase.table("plot_schedules").update({"schedule": updated_schedule}).eq("plot_id", plot_id).execute()

        return jsonify({"success": True, "reply": reply})

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500





def process_chat_command(prompt, schedule, crop, zip_code, plot_name):
    import re

    prompt_lower = prompt.lower()
    new_schedule = schedule.copy()
    modified = False
    action_description = ""

    # Try to extract day and liters
    day_match = re.search(r"day\s*(\d+)", prompt_lower)
    liters_match = re.search(r"(\d{2,5})\s*(l|liters)?", prompt_lower)

    if day_match and liters_match:
        day_index = int(day_match.group(1)) - 1
        amount = float(liters_match.group(1))
        if 0 <= day_index < len(schedule):
            if "add" in prompt_lower:
                new_schedule[day_index]["liters"] += amount
                modified = True
                action_description = f"✅ Added {amount} liters to Day {day_index+1}. New total: {new_schedule[day_index]['liters']} liters."
            elif "set" in prompt_lower or "change" in prompt_lower:
                new_schedule[day_index]["liters"] = amount
                modified = True
                action_description = f"✅ Set Day {day_index+1} to {amount} liters."
    elif "today" in prompt_lower and liters_match:
        amount = float(liters_match.group(1))
        new_schedule[0]["liters"] += amount
        modified = True
        action_description = f"✅ Added {amount} liters to today (Day 1). New total: {new_schedule[0]['liters']} liters."

    # Format schedule string for Gemini
    schedule_text = "\n".join([f"{day['day']}: {day['liters']} liters" for day in new_schedule])

    # Prompt for Gemini
    system_prompt = (
        f"You are a helpful AI assistant for a farmer growing {crop} in ZIP code {zip_code}. "
        f"The plot is named {plot_name}. Based on the user input, here is the updated schedule:\n\n{schedule_text}\n\n"
        "Give a friendly confirmation of the change and any helpful reminders or follow-up questions."
    )

    chat = genai.GenerativeModel("models/gemini-1.5-flash-latest").start_chat()
    response = chat.send_message(prompt)

    # Return updated schedule + assistant reply
    final_reply = action_description if modified else response.text.strip()
    return (new_schedule if modified else schedule), final_reply
