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
def generate_gem_summary(crop, lat, lon, schedule, plot_name, plot_id):
    try:
        # Initialize the model
        model = genai.GenerativeModel("models/gemini-1.5-flash-latest")

        # If there's no schedule data, bail out immediately
        if not schedule:
            return "No irrigation schedule found for this plot."

        # Format the schedule into lines for the prompt
        schedule_lines = "\n".join(
            f"{day['date']}: {day['liters']}L at {day.get('optimal_time', 'N/A')}"
            for day in schedule
        )

        # Build the prompt
        prompt = f"""
You are helping a farmer with a plot called '{plot_name}' growing {crop} at coordinates ({lat:.4f}, {lon:.4f}).

Here is the upcoming irrigation schedule:
{schedule_lines}

Write a short, 3-sentence forecast summary. Include water usage, possible skips due to weather or season, and anything helpful based on crop water needs. Make it clear, friendly, and concise. No bullet points, no markdown.
"""

        # Generate and return the summary
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
def process_chat_command(prompt, crop, lat, lon, plot_name, plot_id, weather, plot, daily, hourly, logs, age, chat_history=None):
    import re, json
    from datetime import datetime, timedelta
    from dateutil import parser as date_parser
    from uuid import uuid4
    import google.generativeai as genai

    try:
        prompt_lower = prompt.lower().strip()

        # === 1. Load schedules ===
        schedule_res = supabase.table("plot_schedules").select("*").eq("plot_id", plot_id).maybe_single().execute()
        sched_data = schedule_res.data or {}
        schedule = sched_data.get("schedule") or []
        og_schedule = sched_data.get("og_schedule") or []
        original_schedule = json.loads(json.dumps(schedule))

        updated_schedule = [d.copy() for d in schedule]
        reply_lines = []
        schedule_changed = False

        # === 2. Build date/day index ===
        date_map = {}
        for i, day in enumerate(schedule):
            try:
                parsed = date_parser.parse(day["date"]).date()
                date_map[parsed.strftime("%m/%d/%y")] = i
                date_map[parsed.strftime("%A").lower()] = i
                date_map[f"day {i + 1}"] = i
            except:
                continue

        target_indices = set()

        # === Extract frontend context date if present ===
        context_match = re.search(r"\[context:.*?(\d{4}-\d{2}-\d{2})", prompt_lower)
        if context_match:
            ctx_date_str = context_match.group(1)
            try:
                ctx_date = date_parser.parse(ctx_date_str).date()
                ctx_key = ctx_date.strftime("%m/%d/%y")
                if ctx_key in date_map:
                    target_indices.add(date_map[ctx_key])
            except:
                pass
            # Strip the context prefix from the prompt before further processing
            prompt_lower = re.sub(r"\[context:[^\]]*\]\s*", "", prompt_lower)

        if "tomorrow" in prompt_lower:
            tmr = (datetime.now().date() + timedelta(days=1)).strftime("%m/%d/%y")
            if tmr in date_map:
                target_indices.add(date_map[tmr])

        for key in date_map:
            if key in prompt_lower:
                target_indices.add(date_map[key])

        matches = re.findall(r"day\s*(\d+)", prompt_lower)
        for m in matches:
            idx = int(m) - 1
            if 0 <= idx < len(schedule):
                target_indices.add(idx)

        date_matches = re.findall(r"\b(\d{1,2}/\d{1,2}(?:/\d{2})?)\b", prompt_lower)
        for match in date_matches:
            try:
                dt = date_parser.parse(match).strftime("%m/%d/%y")
                if dt in date_map:
                    target_indices.add(date_map[dt])
            except:
                continue

        # === 3. Time Shift ===
        time_match = re.search(r"(?:move|shift|change).*to\s*(\d{1,2}(:\d{2})?\s*(am|pm))", prompt_lower)
        if target_indices and time_match:
            new_time = time_match.group(1).upper()
            for idx in target_indices:
                updated_schedule[idx]["optimal_time"] = new_time
                updated_schedule[idx]["note"] = f"Time moved to {new_time}"
                reply_lines.append(f"✅ Shifted {updated_schedule[idx]['day']} to {new_time}.")
            schedule_changed = True

        # === 4. Skip or Set ===
        skip_cmd = any(word in prompt_lower for word in ["skip", "cancel", "don’t water", "don’t water", "no watering"])
        set_match = re.search(r"set\s*(?:to)?\s*(\d+(\.\d+)?)\s*(liters|l)?", prompt_lower)
        add_match = re.search(r"add\s+(\d+(\.\d+)?)\s*(liters?|l)\b", prompt_lower)
        subtract_match = re.search(r"(?:subtract|remove|reduce\s+by)\s+(\d+(\.\d+)?)\s*(liters?|l)\b", prompt_lower)

        if target_indices and (skip_cmd or set_match or add_match or subtract_match):
            for idx in target_indices:
                day_label = f"{updated_schedule[idx][‘day’]} ({updated_schedule[idx][‘date’]})"
                if skip_cmd:
                    updated_schedule[idx]["liters"] = 0
                    updated_schedule[idx]["note"] = "User-skip"
                    reply_lines.append(f"Done — skipped {day_label}.")
                elif set_match:
                    new_val = round(float(set_match.group(1)), 1)
                    updated_schedule[idx]["liters"] = new_val
                    updated_schedule[idx]["note"] = f"User-set to {new_val}L"
                    reply_lines.append(f"Set to {new_val}L on {day_label}.")
                elif add_match:
                    added = round(float(add_match.group(1)), 1)
                    current = updated_schedule[idx].get("liters", 0)
                    new_val = round(current + added, 1)
                    updated_schedule[idx]["liters"] = new_val
                    updated_schedule[idx]["note"] = f"User added {added}L"
                    reply_lines.append(f"Added {added}L on {day_label} — now {new_val}L total.")
                elif subtract_match:
                    removed = round(float(subtract_match.group(1)), 1)
                    current = updated_schedule[idx].get("liters", 0)
                    new_val = max(0, round(current - removed, 1))
                    updated_schedule[idx]["liters"] = new_val
                    updated_schedule[idx]["note"] = f"User removed {removed}L"
                    reply_lines.append(f"Reduced by {removed}L on {day_label} — now {new_val}L.")
            schedule_changed = True

        # === 5. Pause N Days ===
        pause_match = re.search(r"pause.*?(\d+)\s*day", prompt_lower)
        if pause_match:
            num_days = int(pause_match.group(1))
            for i in range(min(num_days, len(updated_schedule))):
                updated_schedule[i]["liters"] = 0
                updated_schedule[i]["note"] = "Paused by user"
                reply_lines.append(f"⏸️ Paused watering on {updated_schedule[i]['day']} ({updated_schedule[i]['date']}).")
            schedule_changed = True

        # === 6. Revert to Original ===
        if "revert" in prompt_lower or "reset schedule" in prompt_lower:
            if og_schedule:
                supabase.table("plot_schedules").update({
                    "schedule": og_schedule
                }).eq("plot_id", plot_id).execute()
                return {
                    "schedule_updated": True,
                    "reply": "🔄 Reverted to the original schedule."
                }
            else:
                return {
                    "schedule_updated": False,
                    "reply": "⚠️ No original schedule found to revert to."
                }

        # === 7. Schedule Summary ===
        if "how much" in prompt_lower or "total" in prompt_lower or "my plan" in prompt_lower:
            total = sum(day.get("liters", 0) for day in schedule)
            reply = f"📊 Your plan includes {round(total, 2)} liters over {len(schedule)} days."
            return {"schedule_updated": False, "reply": reply}

        # === 8. Constraint Editing ===
        if "constraint" in prompt_lower and any(k in prompt_lower for k in ["add", "update", "change"]):
            constraint_match = re.search(r"(?:add|update|change).*constraint[s]?:?\s*(.+)", prompt_lower)
            if constraint_match:
                new_constraint = constraint_match.group(1).strip()
                current = plot.get("custom_constraints", "")
                updated = current + "; " + new_constraint if current else new_constraint
                supabase.table("plots").update({
                    "custom_constraints": updated
                }).eq("id", plot_id).execute()
                return {
                    "schedule_updated": False,
                    "reply": f"✅ Constraint added: “{new_constraint}”."
                }

        # === Save if changed ===
        if schedule_changed:
            supabase.table("plot_schedules").update({
                "schedule": updated_schedule
            }).eq("plot_id", plot_id).execute()
            supabase.table("schedule_changes").insert({
                "id": str(uuid4()),
                "plot_id": plot_id,
                "timestamp": datetime.utcnow().isoformat(),
                "old_schedule": original_schedule,
                "new_schedule": updated_schedule,
                "reason": prompt.strip()
            }).execute()
            return {"schedule_updated": True, "reply": "\n".join(reply_lines)}

        # === 9. "Why" question — pull explanation from schedule day ===
        why_match = re.search(r"\b(why|reason|explain|how come|what.*reason)\b", prompt_lower)
        if why_match:
            # Find which day they're asking about
            mentioned_day = None
            for key, idx in date_map.items():
                if key in prompt_lower:
                    mentioned_day = schedule[idx] if idx < len(schedule) else None
                    break
            if not mentioned_day and target_indices:
                mentioned_day = schedule[next(iter(target_indices))]

            if mentioned_day and mentioned_day.get("explanation"):
                day_context = (
                    f"On {mentioned_day['date']}, the schedule called for {mentioned_day['liters']}L "
                    f"at {mentioned_day.get('optimal_time','N/A')}. "
                    f"Reason: {mentioned_day['explanation']}"
                )
            elif mentioned_day:
                day_context = (
                    f"On {mentioned_day['date']}, the schedule called for {mentioned_day['liters']}L "
                    f"at {mentioned_day.get('optimal_time','N/A')}."
                )
            else:
                day_context = ""

        else:
            day_context = ""

        # === 10. Fallback to Gemini (with conversation history) ===
        schedule_lines = "\n".join(
            f"  {day['date']}: {day['liters']}L at {day.get('optimal_time','N/A')}"
            + (f"  [reason: {day['explanation']}]" if day.get('explanation') else "")
            for day in schedule
        )

        history_block = ""
        if chat_history:
            history_lines = []
            for msg in chat_history[-8:]:
                role = "User" if msg.get("sender") == "user" else "Miraqua"
                history_lines.append(f"{role}: {msg.get('text','')}")
            history_block = "Recent conversation:\n" + "\n".join(history_lines) + "\n\n"

        weather_summary = ""
        if daily:
            d = daily[0]
            weather_summary = (
                f"Today: high {d.get('temp_max_f', d.get('temp_max','?'))}°F, "
                f"low {d.get('temp_min_f', d.get('temp_min','?'))}°F, "
                f"rain prob {d.get('rain_prob', d.get('precipitation_prob','?'))}%"
            )

        system_prompt = f"""You are Miraqua, an AI irrigation assistant. Be like a knowledgeable friend — direct, warm, never robotic.

Rules:
- Short sentences. No filler phrases like "Certainly!" or "Great question!".
- Round numbers. Say "around 6L", not "6.0 liters".
- 2-4 sentences for simple questions. More only when the user explicitly asks for detail.
- No bullet points unless listing multiple schedule days.
- If asked WHY a certain amount was scheduled, explain the ET₀/weather/soil reasoning in plain English.
- If the user wants to change the schedule, tell them what you can do: skip a day, set to a specific amount, shift the time, or pause for N days.
- Never reveal lat/lon coordinates.

Plot: {plot_name} | Crop: {crop} | Area: {plot.get("area")} m² | Age: {age} months
Constraints: {plot.get("custom_constraints") or "none"}
Weather today: {weather_summary or "unavailable"}

Upcoming schedule (with reasons where available):
{schedule_lines}

{f"Day context: {day_context}" if day_context else ""}
Recent watering logs: {json.dumps([{{"date": l.get("watered_at","")[:10], "minutes": l.get("duration_minutes")}} for l in (logs[-3:] if logs else [])], separators=(',',':'))}

{history_block}User: {prompt.strip()}"""

        model = genai.GenerativeModel("gemini-1.5-flash")
        response = model.generate_content(system_prompt)
        return {"schedule_updated": False, "reply": response.text.strip()}

    except Exception as e:
        print(f"❌ Error in process_chat_command: {e}")
        return {
            "schedule_updated": False,
            "reply": "Something went wrong on my end. Try rephrasing or ask again."
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
Your job is to generate a precise, weather-aware, and cost-saving 14-day irrigation schedule tailored to this specific plot.

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

Respond with only a valid JSON array containing **exactly 14 objects** (one per day), like this:

[
  {{
    "day": "Day 1",
    "date": "06/16/25",
    "liters": 6.5,
    "explanation": "Watered based on ETc and soil moisture",
    "optimal_time": "05:00 AM"
  }},
  ...
]

### Rules for format:
- `"day"` must be: `"Day 1"`, `"Day 2"`, ..., `"Day 14"`
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

        # ✅ Enforce correct dates & day names (14 days)
        for i in range(min(14, len(schedule))):
            date_obj = datetime.now().date() + timedelta(days=i)
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
