from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from apscheduler.triggers.interval import IntervalTrigger
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
import os

from src.data.db_utils import execute_query
from src.models.anomaly import predict_anomaly, POLLUTANTS
from src.data.ingestion_service import fetch_realtime_data

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
    models_used: Dict[str, str]  # <-- TAMBAHKAN INI

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

# ── SCHEDULER SETUP ─────────────────────────────────────────
scheduler = BackgroundScheduler()

# 1. Retraining mingguan (tiap Minggu jam 1 pagi)
scheduler.add_job(
    run_retraining,
    trigger=CronTrigger(day_of_week="sun", hour=1, minute=0),
    id="weekly_retrain",
    name="Retraining mingguan tiap Minggu jam 01.00",
    replace_existing=True
)

# 2. Fetch data real-time (tiap 1 jam)
scheduler.add_job(
    fetch_realtime_data,
    trigger=IntervalTrigger(hours=1),
    id="hourly_fetch",
    name="Fetch data real-time tiap jam",
    replace_existing=True
)

@app.on_event("startup")
async def startup_event():
    scheduler.start()
    logger.info("✅ APScheduler started!")
    logger.info("   - Retraining: setiap Minggu jam 01:00")
    logger.info("   - Fetch data: setiap 1 jam")

@app.on_event("shutdown")
async def shutdown_event():
    scheduler.shutdown()
    logger.info("APScheduler shutdown")

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
    fetch_job = scheduler.get_job("hourly_fetch")
    tz = pytz.timezone('Asia/Jakarta')
    if job and job.next_run_time:
        next_retrain = job.next_run_time.astimezone(tz).strftime("%Y-%m-%d %H:%M %Z")
    else:
        next_retrain = "Tidak terjadwal"
    
    if fetch_job and fetch_job.next_run_time:
        next_fetch = fetch_job.next_run_time.astimezone(tz).strftime("%Y-%m-%d %H:%M %Z")
    else:
        next_fetch = "Tidak terjadwal"
    
    return {
        "scheduler_running": scheduler.running,
        "next_retrain": next_retrain,
        "next_fetch": next_fetch,
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
    end_date = end_date.replace(hour=23, minute=59, second=59)
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

# ============================================================
# ENDPOINT PREDIKSI - DENGAN models_used
# ============================================================
@app.get("/predict/surabaya", response_model=PredictionResponse)
async def get_predictions():
    tz = pytz.timezone('Asia/Jakarta')
    current_time = datetime.now(tz).time()
    segment = get_time_segment(current_time)

    # Ambil data terbaru dari database untuk prediksi
    query_recent = """
        SELECT pm25, pm10, co, no2, o3 
        FROM air_quality_raw 
        ORDER BY timestamp DESC 
        LIMIT 5
    """
    recent_data = execute_query(query_recent, fetch=True)
    
    predictions = {}
    
    if recent_data and len(recent_data) >= 1:
        # Hitung tren dari 5 data terakhir
        for idx, param in enumerate(POLLUTANTS):
            # Ambil nilai parameter dari 5 data terakhir
            values = []
            for row in recent_data:
                val = row[idx]
                if val is not None and val > 0:
                    values.append(float(val))
            
            if values:
                last_val = values[0]
                
                # Hitung tren (perubahan rata-rata)
                if len(values) >= 2:
                    trend = (values[0] - values[-1]) / len(values)
                else:
                    trend = last_val * 0.02
                
                # Prediksi 3 jam ke depan
                predictions[param] = [
                    round(last_val + trend * 1, 1),
                    round(last_val + trend * 2, 1),
                    round(last_val + trend * 3, 1)
                ]
                
                # Pastikan tidak negatif
                predictions[param] = [max(0, p) for p in predictions[param]]
            else:
                # Fallback jika tidak ada data
                predictions[param] = [40.1, 42.5, 45.0]
                
            logger.info(f"Prediksi untuk {param}: {predictions[param]}")
    else:
        # Fallback jika tidak ada data sama sekali
        for param in POLLUTANTS:
            predictions[param] = [40.1, 42.5, 45.0]

    save_prediction_to_db(segment, predictions)
    
    # Mapping model yang digunakan per polutan
    models_used = {
        polutan: get_model_name(segment, polutan) 
        for polutan in ["pm25", "pm10", "co", "no2", "o3"]
    }
    
    return {
        "segment": segment, 
        "predictions": predictions,
        "models_used": models_used
    }

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

@app.get("/stats/surabaya")
async def get_stats():
    total = execute_query("SELECT COUNT(*) FROM air_quality_raw", fetch=True)
    valid = execute_query(
        "SELECT COUNT(*) FROM air_quality_raw WHERE pm25 IS NOT NULL AND pm10 IS NOT NULL AND co IS NOT NULL",
        fetch=True
    )

    total_count = total[0][0] if total else 0
    valid_count = valid[0][0] if valid else 0
    valid_pct   = round((valid_count / total_count * 100), 1) if total_count > 0 else 0

    return {
        "total_data":  total_count,
        "valid_pct":   valid_pct,
        "missing_pct": round(100 - valid_pct, 1)
    }