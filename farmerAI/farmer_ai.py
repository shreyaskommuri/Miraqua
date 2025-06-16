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
from datetime import datetime
import re, json





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
def process_chat_command(prompt, crop, lat, lon, plot_name, plot_id, weather, plot, daily, hourly, logs, age):
    try:
        # ✅ Extract plot metadata
        area = plot.get("area", 1.0)
        flex_type = plot.get("flex_type", "daily")
        zip_code = plot.get("zip_code", "00000")
        planting_date = plot.get("planting_date", "unknown")
        user_id = plot.get("user_id", "unknown")
        ph_level = plot.get("ph_level", "N/A")
        custom_constraints = plot.get("custom_constraints", "")
        plot_name = plot.get("name", f"Plot {plot_id[:5]}")

        # 📅 Fetch existing schedule
        schedule_res = supabase.table("plot_schedules").select("schedule").eq("plot_id", plot_id).limit(1).execute()
        schedule = schedule_res.data[0]["schedule"] if schedule_res.data else []

        # 💬 Fetch recent chat history
        history_res = supabase.table("farmerAI_chatlog") \
            .select("prompt, reply, is_user_message") \
            .eq("plot_id", plot_id).order("created_at", desc=False).limit(10).execute()
        history = history_res.data or []

        # 🧾 Format schedule
        schedule_lines = "\n".join(
            f"{day['date']}: {day['liters']}L at {day.get('optimal_time', 'N/A')}"
            for day in schedule
        )

        # ✅ Build Gemini prompt (no slicing issues)
        prompt_template = f"""
Plot Summary:
You are helping a farmer with a plot named "{plot_name}" located in ZIP code {zip_code} at coordinates ({lat:.4f}, {lon:.4f}). The plot area is {area} square meters and the crop being grown is {crop}. It was planted on {planting_date} and is currently {age} months old. The preferred irrigation schedule is '{flex_type}', and the soil pH is {ph_level}. Custom constraints are: {custom_constraints or 'none provided'}.

Here is the upcoming irrigation schedule:
{schedule_lines}

Weather forecast (daily):
{json.dumps(daily, indent=2)}

Weather forecast (hourly):
{json.dumps(hourly, indent=2)}

Recent watering logs:
{json.dumps(logs, indent=2)}

Instructions:
- You are a smart irrigation assistant named FarmerBot.
- If the user asks “what do you know about my plot,” summarize the full plot information above in natural language. DO NOT ask them to rephrase — respond confidently.
- If the user asks about temperature, return the forecasted value (e.g., "The current forecast shows 82°F at 2 PM today").
- Use hourly and daily data for questions about watering, soil, pests, and evapotranspiration (ET).
- Do not assume data is missing unless it’s clearly empty.
- Avoid vague phrases like “I’m ready to assist” or “Ask me anything.” Give real answers using the data provided.
- Use a friendly, helpful tone like a confident field advisor — not like a weather bot.

Generate a concise, relevant response to the user's specific question or command.

"""

        # 💬 Generate Gemini response
        model = genai.GenerativeModel("gemini-1.5-flash")
        response = model.generate_content(prompt_template)
        ai_reply = response.text.strip()

        # ✅ Detect SKIP commands
        skip_matches = re.findall(r"✅\s*SKIP:\s*(.*?)\n?", ai_reply, re.IGNORECASE)
        updated_schedule = None
        skipped_days = []

        if skip_matches:
            for match in skip_matches:
                days_to_skip = []

                for i, day in enumerate(schedule):
                    date_str = day["date"].lower()
                    if match.lower() in date_str or match.lower() in day["day"].lower():
                        days_to_skip.append(i)

                    try:
                        parsed = date_parser.parse(match)
                        sched_date = date_parser.parse(day["date"])
                        if parsed.date() == sched_date.date():
                            days_to_skip.append(i)
                    except:
                        continue

                    if "day" in match.lower():
                        numbers = re.findall(r'\d+', match)
                        days_to_skip += [int(n) - 1 for n in numbers if 0 < int(n) <= len(schedule)]

                if days_to_skip:
                    updated_schedule = [d.copy() for d in schedule]
                    for idx in set(days_to_skip):
                        updated_schedule[idx]["liters"] = 0
                        skipped_days.append(idx + 1)

        # 💾 Save updated schedule
        if updated_schedule:
            timestamp = datetime.utcnow().isoformat()

            supabase.table("schedule_changes").insert({
                "plot_id": plot_id,
                "timestamp": timestamp,
                "old_schedule": schedule,
                "new_schedule": updated_schedule,
                "reason": f"Skipped days: {', '.join(['Day ' + str(i) for i in skipped_days])} via AI chat"
            }).execute()

            supabase.table("plot_schedules").update({
                "schedule": updated_schedule
            }).eq("plot_id", plot_id).execute()

            ai_reply += f"\n\n✅ Schedule updated. Skipped: {', '.join(['Day ' + str(i) for i in skipped_days])}"

        return {
            "schedule_updated": updated_schedule is not None,
            "reply": ai_reply
        }

    except Exception as e:
        print(f"❌ Error in process_chat_command: {e}")
        return {
            "schedule_updated": False,
            "reply": "Sorry, something went wrong while processing your request."
        }


def generate_ai_schedule(plot, daily, hourly, logs):
    import google.generativeai as genai
    from datetime import datetime, timedelta
    import json, re

    crop = plot["crop"]
    area = plot.get("area", 1.0)
    zip_code = plot.get("zip_code", "00000")
    planting_date = plot.get("planting_date", "unknown")
    flex_type = plot.get("flex_type", "daily")
    age = plot.get("age_at_entry", 0.0)
    lat = plot.get("lat")
    lon = plot.get("lon")
    today = datetime.utcnow().date().isoformat()

    prompt = f"""
You are Miraqua, a smart irrigation assistant designed to save farmers water and money — while keeping their crops healthy.

Today is {today}.
Your job is to generate a precise, weather-aware, and cost-saving 7-day irrigation schedule tailored to this specific plot.

---

📍 **Plot Information**
- Crop: {crop}
- Area: {area} m²
- Latitude: {lat}
- Longitude: {lon}
- Flex Type: {flex_type}
- Crop Age: {age} months
- Planting Date: {planting_date}

---

🌦️ **Weather Forecast**
Daily Forecast:
{json.dumps(daily, indent=2)}

Hourly Forecast:
{json.dumps(hourly, indent=2)}

---

💧 **Recent Watering Logs**
{json.dumps(logs, indent=2)}

---

🧠 **Irrigation Strategy and Rules**

1. Your #1 goal is to **minimize water usage and save money** — while providing enough irrigation to support healthy crop growth.

2. Use **two evapotranspiration (ET₀) models** to estimate daily crop water needs:
   - **Penman-Monteith** (preferred): based on temperature, humidity, wind, and solar radiation/cloud cover
   - **Hargreaves** (fallback): based on high/low temperature and estimated solar radiation

3. For each day:
   - Compute ET₀ using both models
   - Adjust by the crop coefficient (Kc) to get ETc:  
     \[ ETc = ET₀ × Kc \]
   - If the models differ by >20%, explain the difference and choose the one that results in **less water use without harming the crop**

4. Check soil moisture and forecast conditions:
   - **Skip irrigation** if:
     - Soil moisture forecast > 35%
     - Rain probability > 40%
     - The crop was watered within the last 48 hours and moisture remains high

5. Choose the **optimal irrigation time** for each day based on:
   - Early morning (4:00–6:00 AM)
   - Lowest wind and sunlight hours
   - Avoidance of runoff, evaporation, and disease risk

6. Vary daily irrigation — **do not use the same liters every day**

7. Optional: If helpful, include a short `"explanation"` field in each day’s object to justify why it was watered or skipped.

---

✅ **Return Format**

Respond with only a valid JSON array containing **exactly 7 objects** (one per day), like this:

[
  {{
    "day": "Day 1",
    "date": "06/16/25",
    "liters": 6.5,
    "optimal_time": "05:00 AM"
  }},
  ...
]

### Rules for format:
- `"day"` must be: `"Day 1"`, `"Day 2"`, ..., `"Day 7"`
- `"date"` format must be: **MM/DD/YY** (e.g., `"06/16/25"`)
- `"liters"` must be a numeric value (float or int)
- `"optimal_time"` must be in **HH:MM AM/PM** format (e.g., `"04:00 AM"`)
- Do NOT wrap the JSON in markdown, quotes, or code blocks
"""


    try:
        response = genai.GenerativeModel("gemini-1.5-flash").generate_content(prompt)
        text = response.text.strip()

        # ✅ Strip triple backticks if present
        clean_text = re.sub(r"^```(?:json)?\s*|\s*```$", "", text.strip(), flags=re.MULTILINE)

        # ✅ Parse JSON
        schedule = json.loads(clean_text)

        # ✅ Enforce correct dates & day names
        for i in range(7):
            date_obj = datetime.utcnow().date() + timedelta(days=i)
            schedule[i]["date"] = date_obj.strftime("%m/%d/%y")

            schedule[i]["day"] = f"Day {i + 1}"


        print("✅ AI schedule parsed and fixed successfully")
        return schedule

    except Exception as e:
        print("⚠️ AI Schedule Output:", {
            "error": "Could not parse response",
            "raw": text if 'text' in locals() else "no response",
            "exception": str(e)
        })
        return {
            "error": "Could not parse response",
            "raw": text if 'text' in locals() else "no response",
            "exception": str(e)
        }
