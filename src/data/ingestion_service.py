import logging
import requests
import pandas as pd
from datetime import datetime, timedelta
from apscheduler.schedulers.blocking import BlockingScheduler
from psycopg2 import extras
from src.data.db_utils import get_db_connection

# Setup logging
logging.basicConfig(
    filename="reports/ingestion.log",
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s"
)
log = logging.getLogger(__name__)

LAT, LON = -7.2575, 112.7521

def fetch_realtime_data():
    """Fetch data polutan + meteorologi terbaru dari Open-Meteo."""
    log.info("Memulai fetch data...")

    end_date   = datetime.today().strftime("%Y-%m-%d")
    start_date = (datetime.today() - timedelta(days=1)).strftime("%Y-%m-%d")

    try:
        # Fetch polutan (endpoint berbeda dengan meteorologi!)
        resp_aq = requests.get(
            "https://air-quality-api.open-meteo.com/v1/air-quality",
            params={
                "latitude": LAT, "longitude": LON,
                "hourly": ["pm2_5", "pm10", "carbon_monoxide",
                           "nitrogen_dioxide", "ozone"],
                "timezone": "Asia/Jakarta",
                "start_date": start_date, "end_date": end_date
            }, timeout=30
        )

        # Fetch meteorologi (endpoint berbeda!)
        resp_w = requests.get(
            "https://api.open-meteo.com/v1/forecast",
            params={
                "latitude": LAT, "longitude": LON,
                "hourly": ["temperature_2m", "relative_humidity_2m",
                           "wind_speed_10m", "wind_direction_10m",
                           "precipitation"],
                "timezone": "Asia/Jakarta",
                "start_date": start_date, "end_date": end_date
            }, timeout=30
        )

        resp_aq.raise_for_status()
        resp_w.raise_for_status()

        # Gabungkan kedua response
        df_aq = pd.DataFrame(resp_aq.json()["hourly"])
        df_w  = pd.DataFrame(resp_w.json()["hourly"])
        df_aq["time"] = pd.to_datetime(df_aq["time"])
        df_w["time"]  = pd.to_datetime(df_w["time"])
        df_w.rename(columns={"relative_humidity_2m": "relative_humidity"},
                    inplace=True)

        df = pd.merge(df_aq, df_w, on="time", how="inner")
        df.rename(columns={
            "pm2_5": "pm25", "carbon_monoxide": "co",
            "nitrogen_dioxide": "no2", "ozone": "o3"
        }, inplace=True)

        log.info(f"Fetch berhasil: {len(df)} baris")
        return df

    except Exception as e:
        log.error(f"Fetch gagal: {e}")
        return None

def insert_to_db(df):
    """Insert data ke tabel air_quality_raw."""
    if df is None or len(df) == 0:
        return

    df = df.copy()
    df["city_id"] = 1

    kolom_db  = [
        "city_id", "time", "pm25", "pm10", "co", "no2", "o3",
        "temperature_2m", "relative_humidity",
        "wind_speed_10m", "wind_direction_10m", "precipitation"
    ]
    kolom_ada = [c for c in kolom_db if c in df.columns]
    data      = df[kolom_ada].copy()
    data.rename(columns={"time": "timestamp"}, inplace=True)

    conn = get_db_connection()
    if not conn:
        log.error("Koneksi DB gagal")
        return

    cursor    = conn.cursor()
    kolom_str = ", ".join(data.columns)
    query     = f"""
        INSERT INTO air_quality_raw ({kolom_str})
        VALUES %s
        ON CONFLICT (city_id, timestamp) DO NOTHING
    """
    tuples = [tuple(x) for x in data.to_numpy()]

    try:
        extras.execute_values(cursor, query, tuples)
        conn.commit()
        log.info(f"Insert berhasil: {len(tuples)} baris")
        print(f"Insert berhasil: {len(tuples)} baris")
    except Exception as e:
        log.error(f"Insert gagal: {e}")
        conn.rollback()
    finally:
        cursor.close()
        conn.close()

def job_fetch_and_insert():
    """Job utama yang dijalankan scheduler tiap 1 jam."""
    log.info("=== Scheduler job mulai ===")
    df = fetch_realtime_data()
    insert_to_db(df)
    log.info("=== Scheduler job selesai ===")

if __name__ == "__main__":
    # Langsung fetch sekali saat pertama start
    print("Fetch pertama kali...")
    job_fetch_and_insert()

    # Setup scheduler
    scheduler = BlockingScheduler(timezone="Asia/Jakarta")
    scheduler.add_job(
        job_fetch_and_insert,
        trigger       = "interval",
        hours         = 1,
        id            = "fetch_air_quality",
        max_instances = 1
    )

    print("Scheduler berjalan — fetch tiap 1 jam")
    print("Tekan Ctrl+C untuk stop")

    try:
        scheduler.start()
    except (KeyboardInterrupt, SystemExit):
        log.info("Scheduler dihentikan.")
        print("Scheduler dihentikan.")