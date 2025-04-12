# unified_aw_model.py
import pandas as pd
from sklearn.linear_model import LinearRegression
from weather_fetcher import get_weekly_forecast
import warnings

warnings.filterwarnings("ignore", category=UserWarning)

model = None
features = []
crop_columns = []

def train_model():
    global model, features, crop_columns
    df = pd.read_csv("All_data_dwr.csv")
    df.columns = df.columns.str.strip()
    df = df.dropna(subset=["AW", "Total_Land1", "Crop"])

    df = pd.get_dummies(df, columns=["Crop"])
    crop_columns = [col for col in df.columns if col.startswith("Crop_")]

    df["avg_temp"] = 25
    df["avg_humidity"] = 50
    df["total_rain"] = 0

    features = ["Total_Land1", "avg_temp", "avg_humidity", "total_rain"] + crop_columns
    X = df[features]
    y = df["AW"]

    model = LinearRegression()
    model.fit(X, y)
    print("✅ Model trained.")

def predict_aw_liters(city, crop, land_area):
    global model, features, crop_columns
    if model is None:
        print("⚠️ Model not trained. Run train_model() first.")
        return None

    forecast = get_weekly_forecast(city)
    if not forecast:
        print(f"[SKIP] Could not get weather forecast for {city}")
        return None

    row = {
        "Total_Land1": land_area,
        "avg_temp": forecast["avg_temp"],
        "avg_humidity": forecast["avg_humidity"],
        "total_rain": forecast["total_rain"]
    }

    for col in crop_columns:
        row[col] = 1 if col == f"Crop_{crop}" else 0

    X_input = pd.DataFrame([row])
    predicted_aw = model.predict(X_input)[0]
    predicted_liters = round(predicted_aw * 1233480, 2)

    print(f"📍 City: {city} | 🌱 Crop: {crop} | 📐 Land: {land_area} acres")
    print(f"💧 Predicted Water Need: {predicted_liters:,} liters (7-day total)")
    return predicted_liters

# === Example Usage ===
if __name__ == "__main__":
    train_model()
    predict_aw_liters(city="Merced", crop="Tomato Fresh", land_area=1.5)
