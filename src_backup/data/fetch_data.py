import pandas as pd
import os
from dotenv import load_dotenv
from psycopg2 import extras
from src.data.db_utils import get_db_connection

load_dotenv()

def insert_csv_to_db(file_path):
    """Membaca CSV hasil Linda dan memasukkan ke database."""
    if not os.path.exists(file_path):
        print(f"File {file_path} tidak ditemukan!")
        return

    df = pd.read_csv(file_path)
    df["city_id"] = 1

    # Kolom yang ada di tabel DB
    kolom_db = [
        "city_id", "time", "pm25", "pm10", "co", "no2", "o3",
        "temperature_2m", "relative_humidity",
        "wind_speed_10m", "wind_direction_10m", "precipitation"
    ]
    kolom_ada = [c for c in kolom_db if c in df.columns]
    data      = df[kolom_ada].copy()
    data.rename(columns={"time": "timestamp"}, inplace=True)

    conn = get_db_connection()  # pakai db_utils, tidak duplikasi
    if conn:
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
            print(f"Berhasil insert {len(tuples)} baris ke DB.")
        except Exception as e:
            print(f"Gagal insert: {e}")
            conn.rollback()
        finally:
            cursor.close()
            conn.close()

if __name__ == "__main__":
    insert_csv_to_db("data/raw/surabaya_airquality_raw.csv")