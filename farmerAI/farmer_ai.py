import os
from flask import Blueprint, request, jsonify
from utils.forecast_utils import get_lat_lon, get_forecast, CROP_KC
import google.generativeai as genai

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))


try:
    print("🔍 Available Gemini models:")
    for model in genai.list_models():
        print(f"- {model.name} | methods: {model.supported_generation_methods}")
except Exception as e:
    print("❌ Error listing models:", e)

ai_blueprint = Blueprint("ai", __name__)

@ai_blueprint.route("/chat", methods=["POST"])
def chat():
    data = request.get_json()
    user_prompt = data.get("prompt", "")
    crop = data.get("crop", "")
    zip_code = data.get("zip", "")
    plot_name = data.get("plotName", "")
    area = 100

    if not user_prompt:
        return jsonify({"success": False, "error": "Missing prompt"}), 400

    try:
        lat, lon = get_lat_lon(zip_code)
        if not lat:
            forecast_summary = "Weather data could not be retrieved due to an invalid ZIP code.\n"
        else:
            forecast = get_forecast(lat, lon)
            kc = CROP_KC.get(crop, CROP_KC["default"])
            total_liters = 0
            summary_lines = []
            for i in range(5):
                tmax = float(forecast["tmax"][i])
                tmin = float(forecast["tmin"][i])
                tmean = float(forecast["tmean"][i])
                rain = float(forecast["rain"][i])
                soil = float(forecast["soils"][i])
                et0 = max(0.5, 0.0023 * (tmean + 17.8) * ((tmax - tmin) ** 0.5) * 0.408)
                etc = et0 * kc
                net_et = max(0, etc - rain - (soil * 2))
                liters = max(0, net_et * area)
                total_liters += liters
                summary_lines.append(
                    f"Day {i+1}: Temp = {round(tmean,1)}°C, Rain = {round(rain,1)}mm, "
                    f"Soil = {round(soil,2)}, ET₀ = {round(et0,2)}, Liters Needed ≈ {int(liters)}"
                )
            forecast_summary = "\n".join(summary_lines)
            forecast_summary += f"\nTotal water needed (5-day): {int(total_liters)} liters.\n"

        model = genai.GenerativeModel("models/gemini-1.5-flash-latest")
        context = (
            f"The user is managing a plot called '{plot_name}' growing {crop} in ZIP code {zip_code}.\n"
            f"Here is the 5-day weather and irrigation forecast:\n{forecast_summary}"
        )
        system_prompt = (
            "You are a precise and helpful assistant for farmers. "
            "Use the weather and irrigation forecast to answer questions. "
            "Keep responses practical and tailored to the crop.\n\n"
            f"{context}\nUser question: {user_prompt}"
        )
        response = model.generate_content(system_prompt)
        reply = response.text.strip()
        return jsonify({"success": True, "reply": reply})
    except Exception as e:
        return jsonify({"success": False, "error": f"{type(e).__name__}: {str(e)}"}), 500
