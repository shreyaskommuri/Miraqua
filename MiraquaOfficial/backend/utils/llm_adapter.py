import os
import time
import logging
try:
    import google.generativeai as genai
except Exception:
    genai = None

logger = logging.getLogger("llm_adapter")


class LLMAdapter:
    def __init__(self, provider_osenv_key="GEMINI_API_KEY"):
        self.provider = "gemini"
        self.api_key = os.getenv(provider_osenv_key)
        if genai and self.api_key:
            genai.configure(api_key=self.api_key)
        else:
            logger.warning("Gemini not configured or missing API key; adapter will fallback to deterministic methods")

    def generate(self, prompt: str, model_names=None, max_tokens=1024, temperature=0.1, timeout=20):
        """Generate text using the configured provider. Returns dict {success, text, error}"""
        if genai and self.api_key:
            models = model_names or ["models/gemini-2.5-flash", "models/gemini-2.0-flash"]
            last_err = None
            for m in models:
                try:
                    model = genai.GenerativeModel(m)
                    start = time.time()
                    resp = model.generate_content(
                        prompt,
                        generation_config=genai.types.GenerationConfig(
                            max_output_tokens=max_tokens,
                            temperature=temperature,
                        )
                    )
                    elapsed = time.time() - start
                    logger.info(f"LLM {m} success in {elapsed:.2f}s")
                    return {"success": True, "text": resp.text.strip()}
                except Exception as e:
                    last_err = e
                    logger.warning(f"LLM model {m} failed: {e}")
                    continue

            return {"success": False, "error": str(last_err)}

        # Fallback: return error for now (caller should handle deterministic fallback)
        return {"success": False, "error": "LLM not available"}


_adapter = None


def get_adapter():
    global _adapter
    if _adapter is None:
        _adapter = LLMAdapter()
    return _adapter
