import os
import json
from flask import Blueprint, request, jsonify
from dotenv import load_dotenv
from supabase import create_client
import google.generativeai as genai
from utils.forecast_utils import get_forecast, CROP_KC
from datetime import datetime, timedelta
import re
from dateutil import parser as date_parser



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
        f"🔺 Highest usage: {highest_day['liters']}L on {highest_day['date']}\n"
        f"🔻 Lowest usage: {lowest_day['liters']}L on {lowest_day['date']}"
    )

# ✅ AI-GENERATED GEMINI SUMMARY
def generate_gem_summary(crop, lat, lon, plot_name, plot_id):
    try:
        model = genai.GenerativeModel("models/gemini-1.5-flash-latest")

        # Get schedule
        response = supabase.table("plot_schedules").select("schedule").eq("plot_id", plot_id).limit(1).execute()
        schedule = response.data[0]["schedule"] if response.data else []

        if not schedule:
            return "No irrigation schedule found for this plot."

        # Convert schedule to short summary
        schedule_lines = "\n".join(
            f"{day['date']}: {day['liters']}L at {day.get('optimal_time', 'N/A')}"
            for day in schedule
        )

        prompt = f"""
You are helping a farmer with a plot called '{plot_name}' growing {crop} at coordinates ({lat:.4f}, {lon:.4f}).

Here is the upcoming irrigation schedule:
{schedule_lines}

Write a short, 3-sentence forecast summary. Include water usage, possible skips due to weather, season, bugs(if theres any in that area, that is what YOU are for), and anything helpful based on crop water needs. Make it clear, friendly, and concise. No bullet points, no markdown.
"""

        response = model.generate_content(prompt)
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
        # ✅ Build weather summary
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
            weather_summary = "Unfortunately, I don't have any weather data for this location right now."

        # ✅ Get current schedule
        schedule_res = supabase.table("plot_schedules").select("schedule").eq("plot_id", plot_id).limit(1).execute()
        schedule = schedule_res.data[0]["schedule"] if schedule_res.data else []

        # ✅ Get past chat history
        past_res = supabase.table("farmerAI_chatlog") \
            .select("prompt, reply, is_user_message") \
            .eq("plot_id", plot_id) \
            .order("created_at", desc=False) \
            .limit(10) \
            .execute()
        history = past_res.data or []

        # ✅ Build conversation prompt
        conversation = f"You are an AI assistant named FarmerBot helping a farmer grow {crop} at ({lat:.4f}, {lon:.4f}) on plot '{plot_name}'.\n"
        conversation += f"{weather_summary}\n"
        if schedule:
            conversation += "\nCurrent irrigation schedule:\n"
            for i, day in enumerate(schedule):
                conversation += f"- Day {i + 1} ({day['date']}): {round(day['liters'])}L at {day.get('optimal_time', 'N/A')}\n"
        conversation += "\nChat history:\n"
        for entry in history:
            if entry["is_user_message"]:
                conversation += f"👤 User: {entry['prompt']}\n"
                conversation += f"🤖 FarmerBot: {entry['reply']}\n"
        conversation += f"👤 User: {user_prompt}\n"
        conversation += f"🤖 FarmerBot:"

        # ✅ Get AI reply
        model = genai.GenerativeModel("gemini-1.5-flash")
        response = model.generate_content(conversation)
        ai_reply = response.text.strip()

        # ✅ Look for structured SKIP commands
        skip_matches = re.findall(r"✅\s*SKIP:\s*(.*?)\n?", ai_reply, re.IGNORECASE)
        updated_schedule = None
        skipped_days = []

        if skip_matches:
            for match in skip_matches:
                days_to_skip = []

                # Match "Day 3", "Day 1 and Day 2", "Monday", "June 12"
                if "day" in match.lower():
                    numbers = re.findall(r'\d+', match)
                    days_to_skip += [int(n) - 1 for n in numbers if 0 < int(n) <= len(schedule)]
                else:
                    for i, day in enumerate(schedule):
                        date_str = day["date"].lower()
                        if match.lower() in date_str:
                            days_to_skip.append(i)
                            break
                        try:
                            parsed = date_parser.parse(match)
                            sched_date = date_parser.parse(day["date"])
                            if parsed.date() == sched_date.date():
                                days_to_skip.append(i)
                                break
                        except:
                            continue

                # Apply valid skip changes
                if days_to_skip:
                    updated_schedule = [day.copy() for day in schedule]  # deep copy
                    for idx in days_to_skip:
                        updated_schedule[idx]["liters"] = 0
                        skipped_days.append(idx + 1)

        # ✅ Save change if something was updated
        if updated_schedule:
            timestamp = datetime.utcnow().isoformat()

            # Backup to schedule_changes table
            supabase.table("schedule_changes").insert({
                "plot_id": plot_id,
                "timestamp": timestamp,
                "old_schedule": schedule,
                "new_schedule": updated_schedule,
                "reason": f"Skipped days {', '.join(str(d) for d in skipped_days)} via AI chat"
            }).execute()

            # Update plot_schedules
            supabase.table("plot_schedules").update({
                "schedule": updated_schedule
            }).eq("plot_id", plot_id).execute()

            print(f"✅ Skipped Days: {skipped_days}")
            ai_reply += f"\n\n✅ Schedule updated. Skipped days: {', '.join(['Day ' + str(d) for d in skipped_days])}"

        return {
            "schedule_updated": updated_schedule is not None,
            "reply": ai_reply
        }

    except Exception as e:
        print(f"❌ Error in process_chat_command: {e}")
        return {
            "reply": "Sorry, something went wrong while processing your request.",
            "schedule_updated": False
        }
