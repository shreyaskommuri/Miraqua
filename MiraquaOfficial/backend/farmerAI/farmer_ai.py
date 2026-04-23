import os
import json
from flask import Blueprint, request, jsonify
from dotenv import load_dotenv
from supabase import create_client
from google import genai
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

gemini = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
GEMINI_MODEL = "models/gemini-2.0-flash"

ai_blueprint = Blueprint("ai", __name__)

# ✅ BASIC WATER USAGE SUMMARY
def generate_summary(crop, lat, lon, schedule):
    # Handle case where schedule is an error string instead of a list
    if not isinstance(schedule, list):
        return f"🌾 Crop: {crop}\n💧 Schedule generation failed - using default watering pattern"
    
    if not schedule:
        return f"🌾 Crop: {crop}\n💧 No schedule data available"
        
    total_liters = sum(day["liters"] for day in schedule)
    avg_liters = round(total_liters / len(schedule), 2)
    highest_day = max(schedule, key=lambda x: x["liters"])
    lowest_day = min(schedule, key=lambda x: x["liters"])

    lat_safe = lat if lat is not None else 0.0
    lon_safe = lon if lon is not None else 0.0
    
    return (
        f"🌾 Crop: {crop}, Location: ({lat_safe:.4f}, {lon_safe:.4f})\n"
        f"💧 Total water needed over {len(schedule)} days: {total_liters} liters\n"
        f"📈 Average per day: {avg_liters} liters\n"
        f"🔺 Highest usage: {highest_day['liters']}L on {highest_day['date']}\n"
        f"🔻 Lowest usage: {lowest_day['liters']}L on {lowest_day['date']}"
    )

# ✅ AI-GENERATED GEMINI SUMMARY
def generate_gem_summary(crop, lat, lon, schedule, plot_name, plot_id):
    try:
        # Initialize the model
        # If there's no schedule data, bail out immediately
        if not schedule:
            return "No irrigation schedule found for this plot."

        # Format the schedule into lines for the prompt
        schedule_lines = "\n".join(
            f"{day['date']}: {day['liters']}L at {day.get('optimal_time', 'N/A')}"
            for day in schedule
        )

        # Build the prompt
        lat_safe = lat if lat is not None else 0.0
        lon_safe = lon if lon is not None else 0.0
        prompt = f"""
You are helping a farmer with a plot called '{plot_name}' growing {crop} at coordinates ({lat_safe:.4f}, {lon_safe:.4f}).

Here is the upcoming irrigation schedule:
{schedule_lines}

Write a short, 3-sentence forecast summary. Include water usage, possible skips due to weather or season, and anything helpful based on crop water needs. Make it clear, friendly, and concise. No bullet points, no markdown.
"""

        # Generate and return the summary
        response = gemini.models.generate_content(model=GEMINI_MODEL, contents=prompt)
        return response.text.strip()

    except Exception as e:
        print(f"⚠️ Gemini summary error: {e}")
        return None



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
        # Get plot data
        plot_res = supabase.table("plots").select("*").eq("id", plot_id).single().execute()
        plot = plot_res.data if plot_res.data else {}
        
        # Get weather data (mock for now)
        daily = weather.get("daily", {})
        hourly = weather.get("hourly", {})
        
        # Get watering logs
        logs_res = supabase.table("watering_log").select("*").eq("plot_id", plot_id).order("watered_at", desc=True).limit(7).execute()
        logs = logs_res.data if logs_res.data else []
        
        # Calculate crop age
        planting_date = plot.get("planting_date")
        if planting_date:
            try:
                planting = datetime.strptime(planting_date, "%Y-%m-%d")
                age = (datetime.now() - planting).days / 30.44  # months
            except:
                age = plot.get("age_at_entry", 0)
        else:
            age = plot.get("age_at_entry", 0)

        result = process_chat_command(user_prompt, crop, lat, lon, plot_name, plot_id, weather, plot, daily, hourly, logs, age)
        reply = result["reply"]

        if result["schedule_updated"]:
            updated_schedule = supabase.table("plot_schedules").select("schedule").eq("plot_id", plot_id).execute().data[0]["schedule"]
        else:
            updated_schedule = None

        return jsonify({"success": True, "reply": reply})

    except Exception as e:
        print(f"❌ Error in chat endpoint: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

# ✅ SMART AI-DRIVEN SCHEDULE EDITING
def process_chat_command(prompt, crop, lat, lon, plot_name, plot_id, weather, plot, daily, hourly, logs, age):
    import re, json
    from datetime import datetime, timedelta
    from dateutil import parser as date_parser
    from uuid import uuid4
    from google import genai

    print(f"🤖 process_chat_command called with:")
    print(f"   crop: {crop}")
    print(f"   lat: {lat}")
    print(f"   lon: {lon}")
    print(f"   plot_name: {plot_name}")
    print(f"   plot_id: {plot_id}")
    print(f"   age: {age}")

    try:
        prompt_lower = prompt.lower().strip()

        # === 1. Load schedules ===
        # Handle general queries (no specific plot)
        if plot_id == "default" or plot_id == "general" or not plot_id:
            # Build user context from their plots
            user_plots = plot.get("user_plots", [])
            recent_chats = plot.get("recent_chats", [])
            user_location = plot.get("user_location")

            # Create plots summary
            plots_summary = "No plots found"
            if user_plots:
                plots_list = []
                for p in user_plots:
                    plots_list.append(f"  - {p.get('name', 'Unnamed')}: {p.get('crop', 'Unknown crop')}, {p.get('area', 'N/A')}m²")
                plots_summary = "\n".join(plots_list)

            # Create weather summary from hourly data
            weather_summary = "Weather data unavailable"
            if hourly and len(hourly) > 0:
                # Get current and next few hours
                weather_items = []
                for i in range(0, min(12, len(hourly)), 4):  # Next 12 hours, every 4 hours
                    item = hourly[i]
                    dt_txt = item.get('dt_txt', 'Unknown')
                    temp = item.get('main', {}).get('temp', 'N/A')
                    desc = item.get('weather', [{}])[0].get('description', 'Unknown')
                    pop = item.get('pop', 0) * 100
                    weather_items.append(f"{dt_txt}: {temp}°F, {desc}, {pop:.0f}% rain")
                weather_summary = "\n".join(weather_items)

            # Create location summary
            location_summary = f"Location: ({lat:.4f}, {lon:.4f})" if user_location else "Location: Not available"

            # Create chat history summary
            history_summary = ""
            if recent_chats:
                history_lines = []
                for chat in recent_chats[-3:]:  # Last 3 exchanges
                    history_lines.append(f"User: {chat['prompt'][:100]}")
                    history_lines.append(f"Bot: {chat['reply'][:100]}")
                history_summary = f"\n\nRecent conversation:\n" + "\n".join(history_lines)

            # Use Gemini for general gardening advice with user context
            prompt_template = f"""
You are FarmerBot. The weather forecast and plot data is shown below. You MUST use this data in your response.

=== WEATHER DATA (YOU MUST REFERENCE THIS) ===
{weather_summary}

=== USER'S PLOTS ===
{plots_summary}

{history_summary}

=== THEIR CURRENT QUESTION ===
"{prompt.strip()}"

=== YOUR RESPONSE RULES ===
1. ALWAYS quote specific numbers from the weather data above (temperature in °F, rain %)
2. Example BAD response: "check your local forecast" ❌
3. Example GOOD response: "Tomorrow shows 57°F with 0% rain chance, so water as planned" ✅
4. If they ask about watering, tell them YES/NO based on the ACTUAL rain % above
5. If they ask a follow-up question (like "what about tomorrow?"), use the conversation history above to understand context
6. Keep it SHORT (2-3 sentences max)
7. Never say "I don't have access" - the data is literally shown above

YOUR ANSWER:"""
            try:
                response = gemini.models.generate_content(model=GEMINI_MODEL, contents=prompt_template)
                return {"schedule_updated": False, "reply": response.text.strip()}
            except Exception as e:
                print(f"Gemini error: {e}")
            return {"schedule_updated": False, "reply": "I'm having trouble connecting right now. Try again in a moment."}

        # For specific plots, load schedules
        try:
            schedule_res = supabase.table("plot_schedules").select("*").eq("plot_id", plot_id).single().execute()
            schedule = schedule_res.data.get("schedule", [])
            og_schedule = schedule_res.data.get("og_schedule", [])
            original_schedule = json.loads(json.dumps(schedule))
        except Exception as schedule_error:
            print(f"⚠️ No schedule found for plot {plot_id}, using empty schedule: {schedule_error}")
            schedule = []
            og_schedule = []
            original_schedule = []

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

        if "tomorrow" in prompt_lower:
            tmr = (datetime.utcnow().date() + timedelta(days=1)).strftime("%m/%d/%y")
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
                reply_lines.append(f"Shifted {updated_schedule[idx]['day']} ({updated_schedule[idx]['date']}) to {new_time}.")
            schedule_changed = True

        # === 4. Skip or Set ===
        skip_cmd = any(word in prompt_lower for word in ["skip", "cancel", "don't water", "don't water", "no watering"])
        set_match = re.search(r"set\s*(?:to)?\s*(\d+(\.\d+)?)\s*(liters|l)?", prompt_lower)

        if target_indices and (skip_cmd or set_match):
            for idx in target_indices:
                if skip_cmd:
                    updated_schedule[idx]["liters"] = 0
                    updated_schedule[idx]["note"] = "User-skip"
                    reply_lines.append(f"Skipped {updated_schedule[idx]['day']} ({updated_schedule[idx]['date']}).")
                elif set_match:
                    new_val = float(set_match.group(1))
                    updated_schedule[idx]["liters"] = new_val
                    updated_schedule[idx]["note"] = f"User-set to {new_val}L"
                    reply_lines.append(f"Set {updated_schedule[idx]['day']} ({updated_schedule[idx]['date']}) to {new_val}L.")
            schedule_changed = True

        # === 5. Pause N Days ===
        pause_match = re.search(r"pause.*?(\d+)\s*day", prompt_lower)
        if pause_match:
            num_days = int(pause_match.group(1))
            for i in range(min(num_days, len(updated_schedule))):
                updated_schedule[i]["liters"] = 0
                updated_schedule[i]["note"] = "Paused by user"
                reply_lines.append(f"Paused {updated_schedule[i]['day']} ({updated_schedule[i]['date']}).")
            schedule_changed = True

        # === 5b. Percentage increase/decrease (requires % sign or explicit "percent") ===
        increase_pct_match = re.search(r"(?:increase|raise|bump).*?(\d+)\s*%|(\d+)\s*%.*(?:increase|more)", prompt_lower)
        decrease_pct_match = re.search(r"(?:decrease|reduce|lower|cut).*?(\d+)\s*%|(\d+)\s*%.*(?:decrease|less)", prompt_lower)
        whole_week = any(word in prompt_lower for word in ["all", "every", "week", "entire"])

        if (increase_pct_match or decrease_pct_match) and (whole_week or not target_indices):
            if not target_indices:
                target_indices = set(range(len(updated_schedule)))

            if increase_pct_match:
                percent = int(increase_pct_match.group(1) or increase_pct_match.group(2))
                for idx in target_indices:
                    old_val = updated_schedule[idx]["liters"]
                    new_val = round(old_val * (1 + percent / 100), 1)
                    updated_schedule[idx]["liters"] = new_val
                    updated_schedule[idx]["note"] = f"Increased by {percent}%"
                reply_lines.append(f"Done — increased all days by {percent}%.")
                schedule_changed = True

            elif decrease_pct_match:
                percent = int(decrease_pct_match.group(1) or decrease_pct_match.group(2))
                for idx in target_indices:
                    old_val = updated_schedule[idx]["liters"]
                    new_val = round(max(0, old_val * (1 - percent / 100)), 1)
                    updated_schedule[idx]["liters"] = new_val
                    updated_schedule[idx]["note"] = f"Decreased by {percent}%"
                reply_lines.append(f"Done — reduced all days by {percent}%.")
                schedule_changed = True

        # === 6. Revert to Original ===
        if "revert" in prompt_lower or "reset schedule" in prompt_lower:
            if og_schedule:
                supabase.table("plot_schedules").update({
                    "schedule": og_schedule
                }).eq("plot_id", plot_id).execute()
                return {"schedule_updated": True, "reply": "Reverted to the original AI schedule."}
            else:
                return {"schedule_updated": False, "reply": "No original schedule saved to revert to."}

        # === 7. Schedule Summary ===
        if "how much" in prompt_lower or "total" in prompt_lower or "my plan" in prompt_lower:
            total = sum(day.get("liters", 0) for day in schedule)
            reply = f"Your plan totals {round(total, 1)}L over {len(schedule)} days, averaging {round(total/max(len(schedule),1), 1)}L/day."
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
                    "reply": f"✅ Constraint added: {new_constraint}."
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
            return {"schedule_updated": True, "reply": " ".join(reply_lines)}

        # === 9. "Why" question — use explanation field from schedule day ===
        why_match = re.search(r"\b(why|reason|explain|how come)\b", prompt_lower)
        if why_match:
            mentioned_day = None
            for key, idx in date_map.items():
                if key in prompt_lower:
                    mentioned_day = schedule[idx] if idx < len(schedule) else None
                    break
            if not mentioned_day and target_indices:
                mentioned_day = schedule[next(iter(target_indices))]
            if mentioned_day and mentioned_day.get("explanation"):
                day_context = (
                    f"On {mentioned_day['date']}, {mentioned_day['liters']}L was scheduled at "
                    f"{mentioned_day.get('optimal_time','N/A')}. Reason: {mentioned_day['explanation']}"
                )
            elif mentioned_day:
                day_context = f"On {mentioned_day['date']}, {mentioned_day['liters']}L was scheduled at {mentioned_day.get('optimal_time','N/A')}."
            else:
                day_context = ""
        else:
            day_context = ""

        # === 10. Fallback to Gemini ===
        schedule_lines = "\n".join(
            f"  {day['date']}: {day['liters']}L at {day.get('optimal_time','N/A')}"
            + (f"  [{day['explanation']}]" if day.get('explanation') else "")
            for day in schedule
        ) if schedule else "No schedule yet."

        # Chat history for conversational context
        history_block = ""
        recent_chats = plot.get("recent_chats", [])
        if recent_chats:
            lines = []
            for c in recent_chats[-6:]:
                if c.get("prompt"): lines.append(f"User: {c['prompt'][:120]}")
                if c.get("reply"):  lines.append(f"Miraqua: {c['reply'][:120]}")
            if lines:
                history_block = "Recent conversation:\n" + "\n".join(lines) + "\n\n"

        # Weather summary
        weather_summary = ""
        if daily and len(daily) > 0:
            d = daily[0]
            t_max = d.get('temp_max_f') or d.get('temperature_2m_max') or d.get('temp_max', '?')
            t_min = d.get('temp_min_f') or d.get('temperature_2m_min') or d.get('temp_min', '?')
            rain = d.get('rain_prob') or d.get('precipitation_probability_max') or d.get('pop', '?')
            weather_summary = f"Today: high {t_max}°F, low {t_min}°F, rain {rain}%"
        elif hourly and len(hourly) > 0:
            h = hourly[0]
            temp = h.get('main', {}).get('temp') or h.get('temperature_2m', '?')
            pop = round((h.get('pop', 0) or 0) * 100)
            weather_summary = f"Current: {temp}°F, {pop}% rain chance"

        system_prompt = f"""You are Miraqua, an AI irrigation assistant. You're direct and conversational — like a knowledgeable friend, never a chatbot.

Style rules:
- Short sentences. No filler like "Certainly!" or "Great question!".
- Round numbers: "around 6L" not "6.0 liters exactly".
- 2-4 sentences for most answers. Only go longer if asked.
- No bullet points unless listing multiple schedule days.
- If asked WHY a day is scheduled a certain way, explain the evapotranspiration / weather / soil reasoning plainly.
- To change the schedule, the user can say: skip [day], set [day] to [X]L, shift [day] to [time], or pause for [N] days.
- Never reveal lat/lon.

Plot: {plot_name} | Crop: {crop} | Area: {plot.get("area","?")} m² | Age: {age} months
Constraints: {plot.get("custom_constraints") or "none"}
{f"Weather: {weather_summary}" if weather_summary else ""}

Schedule (with reasoning where available):
{schedule_lines}

{f"Day context: {day_context}" if day_context else ""}{history_block}User: {prompt.strip()}"""

        # Try chat models in order
        try:
            response = gemini.models.generate_content(model=GEMINI_MODEL, contents=system_prompt)
            return {"schedule_updated": False, "reply": response.text.strip()}
        except Exception as model_err:
            print(f"⚠️ Gemini error: {model_err}")

        return {"schedule_updated": False, "reply": "I'm having trouble connecting right now. Try again in a moment."}

    except Exception as e:
        print(f"❌ Error in process_chat_command: {e}")
        import traceback; traceback.print_exc()
        return {
            "schedule_updated": False,
            "reply": "Something went wrong on my end. Try rephrasing or ask again."
        }

        


def generate_ai_schedule(plot, daily, hourly, logs):
    from google import genai
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
    "explanation": "Watered based on ETc and soil moisture",
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
        # Try multiple times with different models and timeouts
        models_to_try = [
            "models/gemini-2.0-flash",  # Faster model
            "models/gemini-2.5-flash",  # Current model
            "models/gemini-pro-latest"   # Fallback model
        ]
        
        response = None
        last_error = None
        
        for model_name in models_to_try:
            try:
                import time
                print(f"🤖 Trying AI model: {model_name}")
                start_time = time.time()
                response = gemini.models.generate_content(model=model_name, contents=prompt)
                elapsed = time.time() - start_time
                print(f"✅ AI generation successful with {model_name} in {elapsed:.2f}s")
                break
            except Exception as e:
                last_error = e
                print(f"❌ Model {model_name} failed: {str(e)[:100]}...")
                continue

        if response is None:
            raise last_error or Exception("All AI models failed")
            
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
        
        # Generate fallback schedule when AI fails
        print("🔄 Generating AI-enhanced fallback schedule...")
        
        # Try a simpler AI prompt for fallback
        try:
            simple_prompt = f"""
Generate a 7-day irrigation schedule for {crop} crop in {area}m² area.
Today is {today}. 
Return ONLY a JSON array with 7 objects, each with: day, date (MM/DD/YY), liters (number), optimal_time (HH:MM AM/PM).
Keep it simple and practical.
"""
            
            fallback_response = gemini.models.generate_content(model=GEMINI_MODEL, contents=simple_prompt)
            fallback_text = fallback_response.text.strip()
            
            # Try to parse the simpler AI response
            clean_fallback = re.sub(r"^```(?:json)?\s*|\s*```$", "", fallback_text.strip(), flags=re.MULTILINE)
            fallback_schedule = json.loads(clean_fallback)
            
            # Add real dates
            for i, day in enumerate(fallback_schedule):
                date = (datetime.utcnow() + timedelta(days=i)).strftime("%m/%d/%y")
                day["date"] = date
                day["reason"] = "AI-enhanced fallback schedule"
            
            print("✅ AI-enhanced fallback schedule generated successfully")
            return fallback_schedule
            
        except Exception as fallback_error:
            print(f"⚠️ AI fallback also failed: {fallback_error}")
            # Ultimate fallback - basic schedule
            print("🔄 Using basic fallback schedule...")
            fallback_schedule = []
            base_liters = 2.0  # Base watering amount
            
            for i in range(7):
                date = (datetime.utcnow() + timedelta(days=i)).strftime("%m/%d/%y")
                # Simple fallback: water every other day with varying amounts
                liters = base_liters + (i % 2) * 1.0
                fallback_schedule.append({
                    "day": f"Day {i+1}",
                    "date": date,
                    "liters": round(liters, 1),
                    "optimal_time": "06:00",
                    "reason": "Basic fallback schedule - AI unavailable"
                })
            
            return fallback_schedule
