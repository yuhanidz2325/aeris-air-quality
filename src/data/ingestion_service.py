import logging
import requests
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
from src.data.db_utils import execute_query
import os
from datetime import datetime

# Setup logging
log_dir = "reports"
if not os.path.exists(log_dir):
    os.makedirs(log_dir)

logging.basicConfig(
    filename='reports/ingestion.log', 
    level=logging.INFO,
    format='%(asctime)s - %(message)s'
)

def fetch_realtime_data():
    """Fetch data real-time dari Open-Meteo API dan simpan ke database (HANYA POLUTAN)"""
    logging.info("Memulai fetch data polutan...")

    # Ambil hanya polutan (tanpa meteorologi)
    url = (
        "https://air-quality-api.open-meteo.com/v1/air-quality"
        "?latitude=-7.2575&longitude=112.7521"
        "&current=pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,ozone"
        "&forecast_days=1"
    )

    try:
        r = requests.get(url, timeout=10)
        data = r.json()
        current = data['current']
        ts = current['time']
        
        # Konversi timestamp ke datetime
        timestamp = pd.to_datetime(ts)

        # Cek duplikat
        exists = execute_query(
            "SELECT timestamp FROM air_quality_raw WHERE timestamp = %s",
            (timestamp,), fetch=True
        )

        if not exists:
            query = """
                INSERT INTO air_quality_raw (timestamp, pm25, pm10, co, no2, o3)
                VALUES (%s, %s, %s, %s, %s, %s)
            """
            params = (
                timestamp,
                current['pm2_5'],
                current['pm10'],
                current['carbon_monoxide'],
                current['nitrogen_dioxide'],
                current['ozone']
            )
            execute_query(query, params, fetch=False)
            logging.info(f"Berhasil simpan data timestamp: {ts}")
            print(f"✅ Data tersimpan: {ts}")
        else:
            logging.info(f"Data {ts} sudah ada, skip.")
            print(f"⏭️ Data {ts} sudah ada, lewati.")

    except Exception as e:
        logging.error(f"Gagal fetch data: {e}")
        print(f"❌ Error: {e}")

# Buat scheduler global
_scheduler = None

def start_scheduler():
    """Start scheduler untuk fetch data tiap jam (dipanggil dari main.py)"""
    global _scheduler
    if _scheduler is None:
        _scheduler = BackgroundScheduler()
        _scheduler.add_job(
            fetch_realtime_data,
            trigger=IntervalTrigger(hours=1),
            id="hourly_fetch",
            name="Fetch data real-time tiap jam",
            replace_existing=True
        )
        _scheduler.start()
        logging.info("✅ Scheduler fetch data started (tiap 1 jam)")
        print("✅ Scheduler fetch data started (tiap 1 jam)")
    return _scheduler

def stop_scheduler():
    """Stop scheduler (dipanggil dari main.py saat shutdown)"""
    global _scheduler
    if _scheduler:
        _scheduler.shutdown()
        logging.info("Scheduler fetch data stopped")
        print("Scheduler fetch data stopped")

# Jika dijalankan sebagai script standalone
if __name__ == "__main__":
    import pandas as pd
    print("🚀 Menjalankan Ingestion Service (standalone mode)...")
    scheduler = BackgroundScheduler()
    scheduler.add_job(fetch_realtime_data, trigger=IntervalTrigger(hours=1), id="hourly_fetch")
    
    # Langsung fetch sekali saat start
    fetch_realtime_data()
    
    print("✅ Ingestion service running! Akan fetch data tiap 1 jam.")
    print("   Tekan Ctrl+C untuk berhenti.\n")
    
    try:
        scheduler.start()
        import time
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n🛑 Ingestion service stopped.")
        scheduler.shutdown()