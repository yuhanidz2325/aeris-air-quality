import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

import requests
from datetime import datetime, timedelta
from src.data.db_utils import get_db_connection
import pandas as pd

def fetch_and_save_data():
    """Fetch data dari Open-Meteo dan simpan ke database"""
    LAT = -7.2575
    LON = 112.7521
    
    # Ambil data 2 hari terakhir
    end_date = datetime.now().strftime("%Y-%m-%d")
    start_date = (datetime.now() - timedelta(days=2)).strftime("%Y-%m-%d")
    
    url = (
        "https://air-quality-api.open-meteo.com/v1/air-quality"
        f"?latitude={LAT}&longitude={LON}"
        f"&start_date={start_date}&end_date={end_date}"
        "&hourly=pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,ozone"
        "&timezone=Asia/Jakarta"
    )
    
    print(f"Fetching data from {start_date} to {end_date}...")
    
    try:
        response = requests.get(url, timeout=30)
        data = response.json()
        
        if 'hourly' not in data:
            print(f"Error: {data}")
            return
        
        hourly = data['hourly']
        timestamps = hourly['time']
        pm25_list = hourly.get('pm2_5', [])
        pm10_list = hourly.get('pm10', [])
        co_list = hourly.get('carbon_monoxide', [])
        no2_list = hourly.get('nitrogen_dioxide', [])
        o3_list = hourly.get('ozone', [])
        
        conn = get_db_connection()
        if conn:
            cursor = conn.cursor()
            inserted = 0
            for i, ts in enumerate(timestamps):
                query = """
                    INSERT INTO air_quality_raw (city_id, timestamp, pm25, pm10, co, no2, o3)
                    VALUES (1, %s, %s, %s, %s, %s, %s)
                    ON CONFLICT (city_id, timestamp) DO NOTHING
                """
                cursor.execute(query, (
                    ts,
                    pm25_list[i] if i < len(pm25_list) else None,
                    pm10_list[i] if i < len(pm10_list) else None,
                    co_list[i] if i < len(co_list) else None,
                    no2_list[i] if i < len(no2_list) else None,
                    o3_list[i] if i < len(o3_list) else None,
                ))
                if cursor.rowcount > 0:
                    inserted += 1
            
            conn.commit()
            print(f"✅ Inserted {inserted} new records")
            cursor.close()
            conn.close()
        else:
            print("❌ Database connection failed")
            
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    fetch_and_save_data()