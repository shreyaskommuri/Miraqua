import os
from flask import Blueprint, request, jsonify
import google.generativeai as genai

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# ✅ Optional: print available models at startup (not inside /chat)
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
    prompt = data.get("prompt", "")
    if not prompt:
        return jsonify({"success": False, "error": "Missing prompt"}), 400

    try:
        # ✅ Replace with a working model from your list
        model = genai.GenerativeModel("models/gemini-1.5-flash-latest")
        response = model.generate_content(prompt)
        reply = response.text.strip()
        return jsonify({"success": True, "reply": reply})
    except Exception as e:
        return jsonify({"success": False, "error": f"{type(e).__name__}: {str(e)}"}), 500
