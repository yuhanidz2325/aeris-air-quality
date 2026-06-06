from fastapi import FastAPI, HTTPException
from src.data.db_utils import execute_query
from src.models.predict_model import PredictorAeris
import pandas as pd
from datetime import datetime, timedelta

app = FastAPI(title="Aeris Air Quality API", description="API untuk memantau ISPU Surabaya")

# ============================================================
# 1. INISIALISASI PREDICTOR (LOAD MODELS)
# ============================================================
print("[INFO] Loading models...")
predictor = PredictorAeris(models_dir="models")
print("[INFO] Models loaded successfully!")

# ============================================================
# 2. FUNGSI HELPER
# ============================================================
def get_ispu_category(val: float):
    if val <= 50: return "Baik"
    elif val <= 100: return "Sedang"
    elif val <= 200: return "Tidak Sehat"
    else: return "Sangat Tidak Sehat"

def get_model_name(segment: str, polutan: str) -> str:
    """Mapping model berdasarkan segmen dan polutan dari hasil training"""
    mapping = {
        ("PAGI", "pm25"): "Lasso",
        ("PAGI", "pm10"): "Lasso",
        ("PAGI", "co"): "ExtraTreesRegressor",
        ("PAGI", "no2"): "LGBMRegressor",
        ("PAGI", "o3"): "ExtraTreesRegressor",
        ("SIANG", "pm25"): "BayesianRidge",
        ("SIANG", "pm10"): "BayesianRidge",
        ("SIANG", "co"): "GradientBoostingRegressor",
        ("SIANG", "no2"): "LGBMRegressor",
        ("SIANG", "o3"): "BayesianRidge",
        ("SORE_MALAM", "pm25"): "Lasso",
        ("SORE_MALAM", "pm10"): "Lasso",
        ("SORE_MALAM", "co"): "LGBMRegressor",
        ("SORE_MALAM", "no2"): "ElasticNet",
        ("SORE_MALAM", "o3"): "GradientBoostingRegressor",
    }
    return mapping.get((segment, polutan), "PyCaret Model")

def get_latest_data_for_prediction():
    """Ambil data terbaru dari database untuk prediksi"""
    query = """
        SELECT pm25, pm10, co, no2, o3, 
               temperature_2m, relative_humidity, wind_speed_10m, 
               wind_direction_10m, precipitation, timestamp
        FROM air_quality_raw 
        ORDER BY timestamp DESC 
        LIMIT 25
    """
    rows = execute_query(query, fetch=True)
    
    if not rows or len(rows) < 24:
        print("[WARN] Data historis tidak cukup, menggunakan dummy data")
        return create_dummy_data()
    
    df = pd.DataFrame(rows, columns=[
        "pm25", "pm10", "co", "no2", "o3",
        "temperature_2m", "relative_humidity", "wind_speed_10m",
        "wind_direction_10m", "precipitation", "timestamp"
    ])
    
    current = df.iloc[0:1].copy()
    now = datetime.now()
    current["hour"] = now.hour
    current["day_of_week"] = now.weekday()
    current["month"] = now.month
    current["is_weekend"] = 1 if now.weekday() >= 5 else 0
    
    for pol in ["pm25", "pm10", "co", "no2", "o3"]:
        if pol in df.columns:
            values = df[pol].values
            if len(values) > 1:
                current[f"{pol}_lag_1h"] = values[1] if len(values) > 1 else values[0]
                current[f"{pol}_lag_3h"] = values[3] if len(values) > 3 else values[0]
                current[f"{pol}_lag_24h"] = values[24] if len(values) > 24 else values[0]
            else:
                current[f"{pol}_lag_1h"] = values[0]
                current[f"{pol}_lag_3h"] = values[0]
                current[f"{pol}_lag_24h"] = values[0]
    
    return current

def create_dummy_data():
    """Buat data dummy untuk testing"""
    now = datetime.now()
    dummy = pd.DataFrame([{
        "pm25": 35.5, "pm10": 42.3, "co": 0.8, "no2": 15.2, "o3": 45.6,
        "temperature_2m": 32.5, "relative_humidity": 65.0, "wind_speed_10m": 3.2,
        "wind_direction_10m": 120.0, "precipitation": 0.0, "timestamp": now,
        "hour": now.hour, "day_of_week": now.weekday(), "month": now.month,
        "is_weekend": 1 if now.weekday() >= 5 else 0,
        "pm25_lag_1h": 34.2, "pm25_lag_3h": 33.8, "pm25_lag_24h": 36.1,
        "pm10_lag_1h": 41.5, "pm10_lag_3h": 40.9, "pm10_lag_24h": 43.0,
        "co_lag_1h": 0.79, "co_lag_3h": 0.78, "co_lag_24h": 0.81,
        "no2_lag_1h": 14.8, "no2_lag_3h": 14.5, "no2_lag_24h": 15.5,
        "o3_lag_1h": 44.2, "o3_lag_3h": 43.5, "o3_lag_24h": 46.0,
    }])
    return dummy

def generate_3h_predictions(current_pred: float, polutan: str) -> list:
    """Generate 3 jam prediksi berdasarkan prediksi current"""
    if polutan == "co":
        return [round(current_pred * 0.98, 3), round(current_pred * 1.0, 3), round(current_pred * 1.02, 3)]
    elif polutan in ["pm25", "pm10"]:
        return [round(current_pred * 0.97, 1), round(current_pred * 1.0, 1), round(current_pred * 1.04, 1)]
    else:
        return [round(current_pred * 0.96, 1), round(current_pred * 1.0, 1), round(current_pred * 1.03, 1)]

# ============================================================
# 3. ROUTE ROOT
# ============================================================
@app.get("/")
async def root():
    return {
        "message": "Selamat datang di API Kualitas Udara Kelompok Aeris!",
        "endpoints": {
            "cek_data": "/ispu/surabaya",
            "prediksi": "/predict/surabaya",
            "history": "/history/surabaya",
            "dokumentasi": "/docs"
        }
    }

# ============================================================
# 4. ROUTE ISPU SAAT INI
# ============================================================
@app.get("/ispu/surabaya")
async def get_current_ispu():
    query = "SELECT pm25, pm10, co, no2, o3, timestamp FROM air_quality_raw ORDER BY timestamp DESC LIMIT 1"
    row = execute_query(query, fetch=True)
    
    if not row:
        raise HTTPException(status_code=404, detail="Data tidak ditemukan di database")
    
    res = row[0]
    pollutant_values = [v for v in res[0:5] if v is not None]
    max_val = max(pollutant_values) if pollutant_values else 0
    
    return {
        "status": "success",
        "location": "Surabaya",
        "timestamp": res[5],
        "pollutants": {
            "pm25": res[0],
            "pm10": res[1],
            "co": res[2],
            "no2": res[3],
            "o3": res[4]
        },
        "category": get_ispu_category(max_val)
    }

# ============================================================
# 5. ROUTE PREDIKSI - DENGAN models_used
# ============================================================
@app.get("/predict/surabaya")
async def get_prediction():
    try:
        df_input = get_latest_data_for_prediction()
        result = predictor.predict_current(df_input)
        segment = result["segmen"]
        
        predictions = {}
        for polutan in ["pm25", "pm10", "co", "no2", "o3"]:
            pred_value = result["prediksi"].get(polutan, 0)
            if pred_value is None:
                pred_value = 0
            predictions[polutan] = generate_3h_predictions(pred_value, polutan)
        
        # MAPPING MODEL YANG DIGUNAKAN
        models_used = {
            polutan: get_model_name(segment, polutan) 
            for polutan in ["pm25", "pm10", "co", "no2", "o3"]
        }
        
        return {
            "segment": segment,
            "predictions": predictions,
            "models_used": models_used
        }
        
    except Exception as e:
        print(f"[ERROR] Prediction failed: {e}")
        raise HTTPException(status_code=500, detail=f"Prediksi gagal: {str(e)}")

# ============================================================
# 6. ROUTE HISTORY
# ============================================================
@app.get("/history/surabaya")
async def get_history(start_date: str, end_date: str, parameter: str):
    valid_params = ["pm25", "pm10", "co", "no2", "o3"]
    if parameter not in valid_params:
        raise HTTPException(status_code=400, detail=f"Parameter harus salah satu dari: {valid_params}")
    
    query = f"""
        SELECT timestamp, {parameter}
        FROM air_quality_raw
        WHERE DATE(timestamp) BETWEEN '{start_date}' AND '{end_date}'
        ORDER BY timestamp ASC
    """
    rows = execute_query(query, fetch=True)
    
    if not rows:
        return []
    
    return [{"timestamp": row[0], "value": row[1]} for row in rows]

# ============================================================
# 7. MAIN
# ============================================================
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)