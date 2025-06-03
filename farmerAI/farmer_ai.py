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
   
    print("📥 /chat received data:", data)

    user_prompt = data.get("prompt", "")
    crop = data.get("crop", "")
    plot_info = data.get("plot", {})
    zip_code = data.get("zip_code") or plot_info.get("zip_code", "")
    plot_name = data.get("plotName", "")
    plot_id = data.get("plotId", "")
    weather = data.get("weather", {})          # ✅ ADDED
    plot_info = data.get("plot", {})           # ✅ ADDED

    if not user_prompt:
        return jsonify({"success": False, "error": "Missing prompt"}), 400

    try:
        # 🔄 Get schedule from Supabase
        response = supabase.table("plot_schedules").select("schedule").eq("plot_id", plot_id).single().execute()
        # schedule = response.data["schedule"] if response.data else []

        # 🧠 Process prompt with weather & plot info
        result = process_chat_command(
            user_prompt, crop, zip_code, plot_name, plot_id, weather
        )

        if result["schedule_updated"]:
            print("🛠️ Schedule was modified, saving to Supabase...")

        return jsonify({"success": True, "reply": result["reply"]})


    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ✅ SMART AI-DRIVEN SCHEDULE EDITING
def process_chat_command(user_prompt, crop, zip_code, plot_name, plot_id, weather):
    try:
        # 🔍 Try summarizing the weather data
        if weather:
            current = weather.get("current", {})
            temp = current.get("temp")
            humidity = current.get("humidity")
            wind = current.get("wind_speed")
            desc = current.get("weather", [{}])[0].get("description", "unknown conditions")

            weather_summary = (
                f"The current temperature is {temp}°F with {desc}, "
                f"humidity is {humidity}%, and wind speed is {wind} mph."
            )
        else:
            weather_summary = "Unfortunately, I don't have any weather data for your location right now."

        # 📦 Prepare full prompt for Gemini
        prompt = (
            f"You are an AI assistant for smart farming called FarmerBot. The user is growing {crop} in ZIP code {zip_code} "
            f"on a plot named {plot_name}.\n\n"
            f"{weather_summary}\n\n"
            f"The user said: \"{user_prompt}\"\n\n"
            f"Respond naturally and help them with farming tips, irrigation changes, or anything related. "
            f"If they ask to update the irrigation schedule, clearly say what change you are making (e.g., 'skipping Day 3', or 'increasing Day 1 to 2000L'). "
            f"Keep responses short and helpful."
        )

        print("🧠 Gemini Prompt:\n", prompt)

        model = genai.GenerativeModel("gemini-1.5-flash")
        chat = model.start_chat()
        gem_response = chat.send_message(prompt)
        ai_reply = gem_response.text.strip()

        print("📬 Gemini returned:\n", ai_reply)

        # Check for changes (example: user wants to skip a day)
        updated_schedule = None
        if "skip" in ai_reply.lower():
            for day in range(1, 15):
                if f"day {day}" in ai_reply.lower():
                    existing = supabase.table("plot_schedules").select("schedule").eq("plot_id", plot_id).execute()
                    if existing.data and len(existing.data) > 0:
                        current_schedule = existing.data[0]["schedule"]
                        current_schedule[day - 1]["liters"] = 0
                        updated_schedule = current_schedule

                        supabase.table("plot_schedules").update({
                            "schedule": updated_schedule
                        }).eq("plot_id", plot_id).execute()

                        print(f"✅ Skipped Day {day} in schedule for plot {plot_id}")
                    break
        final_reply = ai_reply
        if updated_schedule:
            final_reply += "\n\n✅ Schedule updated."
        return {
            
            updated_schedule is not None: "schedule_updated",
            final_reply:"reply",
        }

    except Exception as e:
        print(f"❌ Error in process_chat_command: {e}")
        return {
            "reply": "Sorry, something went wrong while processing your request.",
            "schedule_updated": False
        }
