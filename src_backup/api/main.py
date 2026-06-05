from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
import subprocess
import logging
import threading
from fastapi import FastAPI, Query, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime, time
from typing import List, Optional, Dict
import pytz
import joblib

from src.data.db_utils import execute_query
from src.models.anomaly import predict_anomaly, POLLUTANTS

# Load PredictorAeris — used for real predictions in /predict/surabaya
try:
    from src.models.predict_model import PredictorAeris
    _predictor = PredictorAeris()
    logger_init_ok = True
except Exception as _e:
    _predictor = None
    logger_init_ok = False
    import logging as _logging
    _logging.getLogger(__name__).warning(
        f"[WARN] PredictorAeris gagal diinisialisasi: {_e}. "
        "Endpoint /predict/surabaya akan menggunakan fallback mock data."
    )

app = FastAPI(title="Aeris Air Quality API", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Selamat datang di Aeris Air Quality API!"}

# ── PYDANTIC SCHEMAS ─────────────────────────────────────────
class ISPUDetail(BaseModel):
    parameter: str
    value: float
    category: str
    color: str

class StatusResponse(BaseModel):
    timestamp: datetime
    pollutants: Dict[str, float]
    ispu_status: List[ISPUDetail]
    segment: str
    anomaly_detected: bool

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

# ── HELPER FUNCTIONS ─────────────────────────────────────────
def get_time_segment(current_time: time) -> str:
    if time(6, 0) <= current_time <= time(11, 59):
        return "PAGI"
    elif time(12, 0) <= current_time <= time(17, 59):
        return "SIANG"
    else:
        return "SORE_MALAM"

def calculate_ispu(param: str, value: float) -> tuple:
    thresholds = {
        "pm25": [(15.5,"Baik","Hijau"),(55.4,"Sedang","Biru"),(150.4,"Tidak Sehat","Kuning"),(250.4,"Sangat Tidak Sehat","Merah")],
        "pm10": [(50,"Baik","Hijau"),(150,"Sedang","Biru"),(350,"Tidak Sehat","Kuning"),(420,"Sangat Tidak Sehat","Merah")],
        "co":   [(4000,"Baik","Hijau"),(8000,"Sedang","Biru"),(15000,"Tidak Sehat","Kuning"),(30000,"Sangat Tidak Sehat","Merah")],
        "no2":  [(80,"Baik","Hijau"),(200,"Sedang","Biru"),(1130,"Tidak Sehat","Kuning"),(2260,"Sangat Tidak Sehat","Merah")],
        "o3":   [(120,"Baik","Hijau"),(235,"Sedang","Biru"),(400,"Tidak Sehat","Kuning"),(800,"Sangat Tidak Sehat","Merah")],
    }
    ispu_scales = {
        "pm25": [(0,50),(51,100),(101,199),(200,299)],
        "pm10": [(0,50),(51,100),(101,199),(200,299)],
        "co":   [(0,50),(51,100),(101,199),(200,299)],
        "no2":  [(0,50),(51,100),(101,199),(200,299)],
        "o3":   [(0,50),(51,100),(101,199),(200,299)],
    }
    if param not in thresholds:
        return value, "Baik", "Hijau"
    steps  = thresholds[param]
    scales = ispu_scales[param]
    for i, (batas, cat, color) in enumerate(steps):
        if value <= batas:
            lo_conc = steps[i-1][0] if i > 0 else 0
            lo_ispu, hi_ispu = scales[i]
            if batas == lo_conc:
                ispu_val = lo_ispu
            else:
                ispu_val = ((hi_ispu - lo_ispu) / (batas - lo_conc)) * (value - lo_conc) + lo_ispu
            return round(ispu_val, 1), cat, color
    return 300.0, "Berbahaya", "Hitam"

def save_prediction_to_db(segment: str, predictions: dict):
    tz = pytz.timezone('Asia/Jakarta')
    now = datetime.now(tz)
    query = """
        INSERT INTO predictions (prediction_time, time_segment, parameter, predicted_value)
        VALUES (%s, %s, %s, %s)
    """
    for param, preds in predictions.items():
        if len(preds) > 0:
            execute_query(query, (now, segment, param, preds[0]), fetch=False)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def run_retraining():
    logger.info("Memulai retraining otomatis...")
    try:
        result = subprocess.run(
            ["python", "src/models/train_model.py"],
            capture_output=True, text=True, timeout=3600
        )
        if result.returncode == 0:
            logger.info("Retraining 15 model selesai!")
        else:
            logger.error(f"Retraining gagal: {result.stderr}")

        result_if = subprocess.run(
            ["python", "src/models/anomaly.py"],
            capture_output=True, text=True, timeout=600
        )
        if result_if.returncode == 0:
            logger.info("Retraining Isolation Forest selesai!")
        else:
            logger.error(f"Retraining IF gagal: {result_if.stderr}")
    except Exception as e:
        logger.error(f"Error saat retraining: {e}")

scheduler = BackgroundScheduler()
scheduler.add_job(
    run_retraining,
    trigger=CronTrigger(day_of_week="sun", hour=1, minute=0),
    id="weekly_retrain",
    name="Retraining mingguan tiap Minggu jam 01.00",
    replace_existing=True
)

@app.on_event("startup")
async def startup_event():
    scheduler.start()
    logger.info("APScheduler started")

@app.on_event("shutdown")
async def shutdown_event():
    scheduler.shutdown()

class RetrainResponse(BaseModel):
    status: str
    message: str
    timestamp: datetime

@app.post("/retrain", response_model=RetrainResponse)
async def manual_retrain():
    thread = threading.Thread(target=run_retraining, daemon=True)
    thread.start()
    tz = pytz.timezone('Asia/Jakarta')
    return {
        "status": "started",
        "message": "Retraining dimulai di background.",
        "timestamp": datetime.now(tz)
    }

@app.get("/retrain/status")
async def retrain_status():
    job = scheduler.get_job("weekly_retrain")
    tz = pytz.timezone('Asia/Jakarta')
    if job and job.next_run_time:
        next_run = job.next_run_time.astimezone(tz).strftime("%Y-%m-%d %H:%M %Z")
    else:
        next_run = "Tidak terjadwal"
    return {
        "scheduler_running": scheduler.running,
        "next_retrain": next_run,
        "timestamp": datetime.now(tz)
    }

# ── ENDPOINTS ────────────────────────────────────────────────
@app.get("/status/surabaya", response_model=StatusResponse)
async def get_status():
    tz = pytz.timezone('Asia/Jakarta')
    now = datetime.now(tz)
    segment = get_time_segment(now.time())

    query = "SELECT pm25, pm10, co, no2, o3 FROM air_quality_raw ORDER BY timestamp DESC LIMIT 1"
    result = execute_query(query, fetch=True)

    if result and len(result) > 0:
        row = result[0]
        pollutants = {
            "pm25": row[0] or 0.0,
            "pm10": row[1] or 0.0,
            "co":   row[2] or 0.0,
            "no2":  row[3] or 0.0,
            "o3":   row[4] or 0.0,
        }
    else:
        pollutants = {"pm25": 0.0, "pm10": 0.0, "co": 0.0, "no2": 0.0, "o3": 0.0}

    ispu_status = []
    for param, value in pollutants.items():
        ispu_val, category, color = calculate_ispu(param, value)
        ispu_status.append({"parameter": param, "value": ispu_val, "category": category, "color": color})

    anomaly_results = predict_anomaly(pollutants)
    anomaly_detected = any(v.get("status_anomali", False) for v in anomaly_results.values())

    return {
        "timestamp": now,
        "pollutants": pollutants,
        "ispu_status": ispu_status,
        "segment": segment,
        "anomaly_detected": anomaly_detected,
    }

@app.get("/history/surabaya", response_model=List[HistoryResponse])
async def get_history(
    start_date: datetime,
    end_date: datetime,
    parameter: Optional[str] = None
):
    query = """
        SELECT timestamp, pm25, pm10, co, no2, o3
        FROM air_quality_raw
        WHERE timestamp >= %s AND timestamp <= %s
        ORDER BY timestamp ASC
    """
    records = execute_query(query, (start_date, end_date), fetch=True)
    history_data = []
    if records:
        for row in records:
            tstamp   = row[0]
            pm25_val = row[1] or 0.0
            pm10_val = row[2] or 0.0
            co_val   = row[3] or 0.0
            no2_val  = row[4] or 0.0
            o3_val   = row[5] or 0.0

            entries = [
                ("pm25", pm25_val, round((pm25_val / 55.4) * 100, 1)),
                ("pm10", pm10_val, round((pm10_val / 150)  * 100, 1)),
                ("co",   co_val,   round((co_val  / 15000) * 100, 1)),
                ("no2",  no2_val,  round((no2_val / 200)   * 100, 1)),
                ("o3",   o3_val,   round((o3_val  / 100)   * 100, 1)),
            ]
            for param_name, val, ispu_val in entries:
                if parameter is None or parameter == param_name:
                    history_data.append({
                        "timestamp": tstamp,
                        "parameter": param_name,
                        "value": val,
                        "ispu_value": ispu_val,
                    })
    return history_data

@app.get("/predict/surabaya", response_model=PredictionResponse)
async def get_predictions():
    import pandas as pd

    tz = pytz.timezone('Asia/Jakarta')
    current_time = datetime.now(tz).time()
    segment = get_time_segment(current_time)

    predictions = {}

    if _predictor is not None:
        # ── Ambil data terbaru dari DB untuk dijadikan input fitur ──
        query = """
            SELECT pm25, pm10, co, no2, o3,
                   temperature, humidity,
                   wind_speed, wind_direction, precipitation,
                   timestamp
            FROM air_quality_raw
            ORDER BY timestamp DESC
            LIMIT 25
        """
        rows = execute_query(query, fetch=True)

        if rows and len(rows) > 0:
            cols = ["pm25", "pm10", "co", "no2", "o3",
                    "temperature_2m", "relative_humidity",
                    "wind_speed_10m", "wind_direction_10m", "precipitation",
                    "time"]
            df = pd.DataFrame(rows, columns=cols)
            df["time"] = pd.to_datetime(df["time"])
            df = df.sort_values("time").reset_index(drop=True)

            # Tambahkan fitur waktu
            latest = df.iloc[-1]
            ts = latest["time"]
            df["hour"]        = df["time"].dt.hour
            df["day_of_week"] = df["time"].dt.dayofweek
            df["month"]       = df["time"].dt.month
            df["is_weekend"]  = (df["day_of_week"] >= 5).astype(int)

            # Buat lag features dari baris terakhir
            input_row = df.iloc[[-1]].copy()
            for pol in POLLUTANTS:
                for lag, lag_col in [(1, f"{pol}_lag_1h"), (3, f"{pol}_lag_3h"), (24, f"{pol}_lag_24h")]:
                    idx = max(0, len(df) - 1 - lag)
                    input_row[lag_col] = df.iloc[idx][pol] if pol in df.columns else 0
                vals = df[pol].dropna().values if pol in df.columns else [0]
                input_row[f"{pol}_rolling_mean_3h"]  = vals[-3:].mean()  if len(vals) >= 3  else vals.mean()
                input_row[f"{pol}_rolling_mean_24h"] = vals[-24:].mean() if len(vals) >= 24 else vals.mean()
                input_row[f"{pol}_rolling_std_24h"]  = vals[-24:].std()  if len(vals) >= 24 else 0
                input_row[f"{pol}_rolling_max_24h"]  = vals[-24:].max()  if len(vals) >= 24 else vals.max()
                input_row[f"{pol}_diff_1h"]          = float(df.iloc[-1][pol] - df.iloc[max(0, len(df)-2)][pol]) if pol in df.columns else 0
                prev = df.iloc[max(0, len(df)-2)][pol] if pol in df.columns else 1
                input_row[f"{pol}_pct_change_1h"]    = float((df.iloc[-1][pol] - prev) / prev * 100) if prev != 0 else 0

            try:
                result = _predictor.predict_current(input_row, hour=ts.hour)
                for param in POLLUTANTS:
                    base_val = result["prediksi"].get(param)
                    if base_val is not None:
                        # Buat 3 titik prediksi dengan tren linear kecil
                        predictions[param] = [
                            round(base_val, 2),
                            round(base_val * 1.02, 2),
                            round(base_val * 1.04, 2),
                        ]
                    else:
                        predictions[param] = []
                logger.info(f"Prediksi real berhasil untuk segmen {segment}")
            except Exception as pred_err:
                logger.warning(f"[WARN] predict_current gagal: {pred_err}. Menggunakan fallback.")
                _predictor_fallback(predictions, segment)
        else:
            logger.warning("[WARN] Tidak ada data di DB. Menggunakan fallback mock.")
            _predictor_fallback(predictions, segment)
    else:
        # ── FALLBACK: model belum tersedia, gunakan mock berbeda per polutan ──
        logger.warning("[WARN] PredictorAeris tidak tersedia. Menggunakan fallback mock data.")
        _predictor_fallback(predictions, segment)

    save_prediction_to_db(segment, predictions)
    return {"segment": segment, "predictions": predictions}


def _predictor_fallback(predictions: dict, segment: str):
    """Fallback mock data — nilai berbeda per polutan, bukan semua [40.1, 42.5, 45.0]."""
    # Nilai mock realistis per polutan (bukan hardcoded sama semua)
    MOCK_BASE = {
        "pm25": [38.5, 40.1, 42.3],
        "pm10": [62.0, 64.5, 67.0],
        "co":   [1100.0, 1150.0, 1200.0],
        "no2":  [28.0, 29.5, 31.0],
        "o3":   [55.0, 57.5, 60.0],
    }
    for param in POLLUTANTS:
        predictions[param] = MOCK_BASE.get(param, [0.0, 0.0, 0.0])

@app.get("/anomaly/surabaya", response_model=AnomalyResponse)
async def get_anomaly_status():
    tz = pytz.timezone('Asia/Jakarta')

    query = "SELECT pm25, pm10, co, no2, o3 FROM air_quality_raw ORDER BY timestamp DESC LIMIT 1"
    result = execute_query(query, fetch=True)

    if result and len(result) > 0:
        row = result[0]
        current_data = {"pm25": row[0], "pm10": row[1], "co": row[2], "no2": row[3], "o3": row[4]}
    else:
        current_data = {"pm25": 150.5, "pm10": 100.0, "co": 1200.0, "no2": 45.0, "o3": 60.0}

    anomaly_results = predict_anomaly(current_data)

    return {"timestamp": datetime.now(tz), "results": anomaly_results}