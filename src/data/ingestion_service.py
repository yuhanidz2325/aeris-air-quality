import logging
import requests
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
from src.data.db_utils import execute_query
import os

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
    """Fetch data real-time dari Open-Meteo API dan simpan ke database"""
    logging.info("Memulai fetch data lengkap...")

    # Ambil polutan dari current, ambil weather dari hourly
    url = (
        "https://air-quality-api.open-meteo.com/v1/air-quality"
        "?latitude=-7.2575&longitude=112.7521"
        "&current=pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,ozone"
        "&hourly=temperature_2m,relative_humidity_2m,"
        "wind_speed_10m,wind_direction_10m,precipitation"
        "&forecast_days=1"
    )

    try:
        r = requests.get(url, timeout=10)
        data = r.json()
        current = data['current']
        ts = current['time']

        # Ambil data hourly sesuai timestamp current
        hourly_times = data['hourly']['time']
        idx = hourly_times.index(ts) if ts in hourly_times else 0

        def get_hourly(key):
            vals = data['hourly'].get(key, [])
            return vals[idx] if vals and idx < len(vals) else None

        temperature   = get_hourly('temperature_2m')
        humidity      = get_hourly('relative_humidity_2m')
        wind_speed    = get_hourly('wind_speed_10m')
        wind_dir      = get_hourly('wind_direction_10m')
        precipitation = get_hourly('precipitation')

        # Cek duplikat
        exists = execute_query(
            "SELECT id FROM air_quality_raw WHERE timestamp = %s",
            (ts,), fetch=True
        )

        if not exists:
            query = """
                INSERT INTO air_quality_raw (
                    city_id, pm25, pm10, co, no2, o3,
                    temperature, humidity,
                    wind_speed, wind_direction, precipitation,
                    timestamp
                )
                VALUES (1, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """
            params = (
                current['pm2_5'],
                current['pm10'],
                current['carbon_monoxide'],
                current['nitrogen_dioxide'],
                current['ozone'],
                temperature,
                humidity,
                wind_speed,
                wind_dir,
                precipitation,
                ts
            )
            execute_query(query, params)
            logging.info(f"Berhasil simpan data lengkap timestamp: {ts}")
            print(f"✅ Data tersimpan: {ts}")
        else:
            logging.info(f"Data {ts} sudah ada, skip.")
            print(f"⏭️ Data {ts} sudah ada, lewati.")

    except Exception as e:
        logging.error(f"Gagal fetch data lengkap: {e}")
        print(f"❌ Error: {e}")

# Buat scheduler global (biar bisa di-start/stop)
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
    print("🚀 Menjalankan Ingestion Service (standalone mode)...")
    scheduler = BackgroundScheduler()
    scheduler.add_job(fetch_realtime_data, trigger=IntervalTrigger(hours=1), id="hourly_fetch")
    
    # Langsung fetch sekali saat start
    fetch_realtime_data()
    
    print("✅ Ingestion service running! Akan fetch data tiap 1 jam.")
    print("   Tekan Ctrl+C untuk berhenti.\n")
    
    try:
        scheduler.start()
        # Keep the script running
        import time
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n🛑 Ingestion service stopped.")
        scheduler.shutdown()