import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

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

    kolom_db = [
        "city_id", "pm25", "pm10", "co", "no2", "o3", "timestamp"
    ]
    
    if 'time' in df.columns:
        df.rename(columns={"time": "timestamp"}, inplace=True)
    
    kolom_ada = [c for c in kolom_db if c in df.columns]
    data = df[kolom_ada].copy()
    data = data.dropna(subset=['timestamp'])

    conn = get_db_connection()
    if conn:
        cursor = conn.cursor()
        kolom_str = ", ".join(data.columns)
        query = f"""
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