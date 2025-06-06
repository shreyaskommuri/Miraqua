import os
import json
from flask import Blueprint, request, jsonify
from dotenv import load_dotenv
from supabase import create_client
import google.generativeai as genai
from utils.forecast_utils import get_forecast, CROP_KC
from datetime import datetime, timedelta
import re

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

ai_blueprint = Blueprint("ai", __name__)

# ✅ BASIC WATER USAGE SUMMARY
def generate_summary(crop, lat, lon, schedule):
    total_liters = sum(day["liters"] for day in schedule)
    avg_liters = round(total_liters / len(schedule), 2)
    highest_day = max(schedule, key=lambda x: x["liters"])
    lowest_day = min(schedule, key=lambda x: x["liters"])

    return (
        f"🌾 Crop: {crop}, Location: ({lat:.4f}, {lon:.4f})\n"
        f"💧 Total water needed over {len(schedule)} days: {total_liters} liters\n"
        f"📈 Average per day: {avg_liters} liters\n"
        f"🔺 Highest usage: {highest_day['liters']}L on {highest_day['day']}\n"
        f"🔻 Lowest usage: {lowest_day['liters']}L on {lowest_day['day']}"
    )

# ✅ AI-GENERATED GEMINI SUMMARY
def generate_gem_summary(crop, lat, lon, plot_name, plot_id):
    try:
        model = genai.GenerativeModel("models/gemini-1.5-flash-latest")

        response = supabase.table("plot_schedules").select("schedule").eq("plot_id", plot_id).limit(1).execute()
        schedule = response.data[0]["schedule"] if response.data else []

        context = f"You are helping a farmer named '{plot_name}' who is growing {crop} at coordinates ({lat:.4f}, {lon:.4f}).\n"
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
    plot_name = data.get("plotName", "")
    plot_id = data.get("plotId", "")
    lat = data.get("lat")
    lon = data.get("lon")
    weather = data.get("weather", {})

    if not user_prompt:
        return jsonify({"success": False, "error": "Missing prompt"}), 400

    try:
        result = process_chat_command(user_prompt, crop, lat, lon, plot_name, plot_id, weather)
        reply = result["reply"]

        if result["schedule_updated"]:
            updated_schedule = supabase.table("plot_schedules").select("schedule").eq("plot_id", plot_id).execute().data[0]["schedule"]
        else:
            updated_schedule = None

        return jsonify({"success": True, "reply": reply})

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

# ✅ SMART AI-DRIVEN SCHEDULE EDITING
def process_chat_command(user_prompt, crop, lat, lon, plot_name, plot_id, weather):
    try:
        if weather and "main" in weather and "wind" in weather:
            temp = weather["main"].get("temp")
            humidity = weather["main"].get("humidity")
            wind = weather["wind"].get("speed")
            desc = weather["weather"][0].get("description", "unknown conditions")

            weather_summary = (
                f"The current temperature is {temp}°F with {desc}, "
                f"humidity is {humidity}%, and wind speed is {wind} mph."
            )
        else:
            weather_summary = "Unfortunately, I don't have any weather data for your location right now."

        past_res = supabase.table("farmerAI_chatlog") \
            .select("prompt, reply, is_user_message") \
            .eq("plot_id", plot_id) \
            .order("created_at", desc=False) \
            .limit(10) \
            .execute()

        history = past_res.data or []

        conversation = f"You are an AI assistant called FarmerBot helping a farmer growing {crop} at ({lat:.4f}, {lon:.4f}) on plot '{plot_name}'.\n"
        conversation += f"{weather_summary}\n\n"

        for entry in history:
            if entry["is_user_message"]:
                conversation += f"👤 User: {entry['prompt']}\n"
                conversation += f"🤖 FarmerBot: {entry['reply']}\n"

        conversation += f"👤 User: {user_prompt}\n"
        conversation += f"🤖 FarmerBot:"

        model = genai.GenerativeModel("gemini-1.5-flash")
        response = model.generate_content(conversation)
        ai_reply = response.text.strip()

        updated_schedule = None
        if "skip" in ai_reply.lower():
            for day in range(1, 15):
                if f"day {day}" in ai_reply.lower() or f"tomorrow" in ai_reply.lower():
                    existing = supabase.table("plot_schedules").select("schedule").eq("plot_id", plot_id).execute()
                    if existing.data and len(existing.data) > 0:
                        current_schedule = existing.data[0]["schedule"]
                        day_index = 1 if "tomorrow" in ai_reply.lower() else day - 1
                        if 0 <= day_index < len(current_schedule):
                            current_schedule[day_index]["liters"] = 0
                            updated_schedule = current_schedule
                            supabase.table("plot_schedules").update({
                                "schedule": updated_schedule
                            }).eq("plot_id", plot_id).execute()
                            print(f"✅ Skipped Day {day_index + 1} in schedule for plot {plot_id}")
                    break

        final_reply = ai_reply
        if updated_schedule:
            final_reply += "\n\n✅ Schedule updated."

        return {
            "schedule_updated": updated_schedule is not None,
            "reply": final_reply
        }

    except Exception as e:
        print(f"❌ Error in process_chat_command: {e}")
        return {
            "reply": "Sorry, something went wrong while processing your request.",
            "schedule_updated": False
        }
