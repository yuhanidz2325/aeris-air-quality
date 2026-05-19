from fastapi import FastAPI, Query, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime, time
from typing import List, Optional, Dict
import pytz
import joblib

# Import fungsi query dari db_utils dan fungsi deteksi anomali
from src.data.db_utils import execute_query
from src.models.anomaly import predict_anomaly, POLLUTANTS

app = FastAPI(title="Aeris Air Quality API", version="1.0")

# Force rebuild: Railway, please update my code!
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Mengizinkan semua domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Selamat datang di Aeris Air Quality API!"}

# --- PYDANTIC SCHEMAS ---
class ISPUDetail(BaseModel):
    parameter: str
    value: float
    category: str
    color: str

class StatusResponse(BaseModel):
    timestamp: datetime
    pollutants: Dict[str, float]
    ispu_status: List[ISPUDetail]

class HistoryResponse(BaseModel):
    timestamp: datetime
    parameter: str
    value: float
    ispu_value: float

class PredictionResponse(BaseModel):
    segment: str
    predictions: Dict[str, List[float]]

class AnomalyDetail(BaseModel):
    status_anomali: bool
    skor: float

class AnomalyResponse(BaseModel):
    timestamp: datetime
    results: Dict[str, AnomalyDetail]

# --- HELPER FUNCTIONS ---
def get_time_segment(current_time: time) -> str:
    """Deteksi segmen waktu saat ini sesuai aturan MINGGU 2 (PAGI/SIANG/SORE_MALAM)."""
    if time(6, 0) <= current_time <= time(11, 59):
        return "PAGI"
    elif time(12, 0) <= current_time <= time(17, 59):
        return "SIANG"
    else:
        return "SORE_MALAM"

def save_prediction_to_db(segment: str, predictions: dict):
    """Simpan hasil prediksi ke tabel predictions di DB pakai execute_query."""
    tz = pytz.timezone('Asia/Jakarta')
    now = datetime.now(tz)
    
    # Sesuaikan dengan nama kolom yang ada di database kamu
    query = """
        INSERT INTO predictions (prediction_time, time_segment, parameter, predicted_value)
        VALUES (%s, %s, %s, %s)
    """
    for param, preds in predictions.items():
        # Karena di DB hanya ada 1 kolom 'predicted_value', 
        # kita simpan prediksi jam pertama saja (preds[0]) untuk saat ini
        if len(preds) > 0:
            params = (now, segment, param, preds[0])
            execute_query(query, params, fetch=False)
# --- ENDPOINTS ---

@app.get("/status/surabaya", response_model=StatusResponse)
async def get_status():
    """Return: timestamp, semua polutan, status ISPU, warna."""
    # TODO MINGGU 4: Tarik data ini dari DB jika query status lengkap dibutuhkan
    return {
        "timestamp": datetime.now(pytz.timezone('Asia/Jakarta')),
        "pollutants": {"pm25": 45.2, "pm10": 50.1, "co": 1200.0, "no2": 34.0, "o3": 40.5},
        "ispu_status": [
            {"parameter": "pm25", "value": 65.0, "category": "Sedang", "color": "Biru"},
            {"parameter": "pm10", "value": 40.0, "category": "Baik", "color": "Hijau"}
        ]
    }

@app.get("/history/surabaya", response_model=List[HistoryResponse])
async def get_history(
    start_date: datetime, 
    end_date: datetime, 
    parameter: Optional[str] = None
):
    """Query param: start_date, end_date, parameter. Return: historis + ISPU per jam."""
    
    # Kita menggunakan kolom 'timestamp' sebagai acuan waktu.
    # CATATAN: Jika di Supabase nama kolom waktumu adalah 'time', ganti kata 'timestamp' di bawah ini menjadi 'time'.
    query = """
        SELECT timestamp, pm25, ispu_pm25, pm10, ispu_pm10 
        FROM air_quality_raw 
        WHERE timestamp >= %s AND timestamp <= %s
        ORDER BY timestamp ASC
    """
    
    # Ambil data dari database Supabase
    records = execute_query(query, (start_date, end_date), fetch=True)
    
    history_data = []
    if records:
        for row in records:
            tstamp = row[0]
            pm25_val = row[1] if row[1] is not None else 0.0
            ispu_pm25_val = row[2] if row[2] is not None else 0.0
            pm10_val = row[3] if row[3] is not None else 0.0
            ispu_pm10_val = row[4] if row[4] is not None else 0.0
            
            # Jika Intan (Frontend) secara spesifik meminta "pm25"
            if parameter == "pm25" or parameter is None:
                history_data.append({
                    "timestamp": tstamp,
                    "parameter": "pm25",
                    "value": pm25_val,
                    "ispu_value": ispu_pm25_val
                })
                
            # Jika Intan (Frontend) secara spesifik meminta "pm10"
            if parameter == "pm10" or parameter is None:
                history_data.append({
                    "timestamp": tstamp,
                    "parameter": "pm10",
                    "value": pm10_val,
                    "ispu_value": ispu_pm10_val
                })

    return history_data

@app.get("/predict/surabaya", response_model=PredictionResponse)
async def get_predictions():
    """Load model pkl per parameter sesuai segmen waktu, return prediksi 3 jam ke depan."""
    tz = pytz.timezone('Asia/Jakarta')
    current_time = datetime.now(tz).time()
    segment = get_time_segment(current_time)
    
    predictions = {}
    for param in POLLUTANTS:
        model_filename = f"models/{param}_{segment.lower()}_best.pkl"
        try:
            # model = joblib.load(model_filename)
            # pred_3h = model.predict(current_features)
            # predictions[param] = list(pred_3h)
            predictions[param] = [40.1, 42.5, 45.0] # Mock sementara nunggu model Linda
        except FileNotFoundError:
            predictions[param] = []
            
    # Eksekusi fungsi simpan ke DB yang memanggil execute_query
    save_prediction_to_db(segment, predictions)
    
    return {"segment": segment, "predictions": predictions}

@app.get("/anomaly/surabaya", response_model=AnomalyResponse)
async def get_anomaly_status():
    """Ambil data polutan asli dari DB, lalu deteksi anomali."""
    tz = pytz.timezone('Asia/Jakarta')
    
    # Ambil nilai riil polutan terbaru dari DB untuk dideteksi modelmu
    query = "SELECT pm25, pm10, co, no2, o3 FROM air_quality_raw ORDER BY timestamp DESC LIMIT 1"
    result = execute_query(query, fetch=True)
    
    if result and len(result) > 0:
        row = result[0]
        current_data = {"pm25": row[0], "pm10": row[1], "co": row[2], "no2": row[3], "o3": row[4]}
    else:
        # Fallback jika tabel DB masih kosong
        current_data = {"pm25": 150.5, "pm10": 100.0, "co": 1200.0, "no2": 45.0, "o3": 60.0}
    
    anomaly_results = predict_anomaly(current_data)
    
    return {
        "timestamp": datetime.now(tz),
        "results": anomaly_results
    }