import logging
import requests
from apscheduler.schedulers.blocking import BlockingScheduler
from src.data.db_utils import execute_query

logging.basicConfig(filename='reports/ingestion.log', level=logging.INFO,
                    format='%(asctime)s - %(message)s')

def fetch_realtime_data():
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
        ts = current['time']  # format: "2026-05-22T10:00"

        # ── Ambil data hourly sesuai timestamp current ──────────
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

        # ── Cek duplikat ────────────────────────────────────────
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
        else:
            logging.info(f"Data {ts} sudah ada, skip.")

    except Exception as e:
        logging.error(f"Gagal fetch data lengkap: {e}")

if __name__ == "__main__":
    scheduler = BlockingScheduler()
    scheduler.add_job(fetch_realtime_data, 'interval', hours=1)
    fetch_realtime_data()
    print("Ingestion service running (All Parameters)...")
    scheduler.start()