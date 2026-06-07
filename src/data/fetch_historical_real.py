import sys
import os

# Tambahkan root ke path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

import requests
from src.data.db_utils import execute_query
from datetime import datetime, timedelta
import time

def fetch_historical_data(start_date, end_date):
    """Fetch historical data dari Open-Meteo API"""
    
    url = (
        "https://air-quality-api.open-meteo.com/v1/air-quality"
        f"?latitude=-7.2575&longitude=112.7521"
        f"&start_date={start_date}&end_date={end_date}"
        "&hourly=pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,ozone"
        "&timezone=Asia/Jakarta"
    )
    
    print(f"📥 Mengambil data dari {start_date} sampai {end_date}...")
    
    try:
        response = requests.get(url, timeout=30)
        data = response.json()
        
        if 'hourly' not in data:
            print(f"❌ Error: {data}")
            return 0
        
        hourly = data['hourly']
        timestamps = hourly['time']
        pm25_list = hourly.get('pm2_5', [])
        pm10_list = hourly.get('pm10', [])
        co_list = hourly.get('carbon_monoxide', [])
        no2_list = hourly.get('nitrogen_dioxide', [])
        o3_list = hourly.get('ozone', [])
        
        inserted = 0
        for i, ts in enumerate(timestamps):
            query = """
                INSERT INTO air_quality_raw 
                (city_id, timestamp, pm25, pm10, co, no2, o3)
                VALUES (1, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (city_id, timestamp) DO NOTHING
            """
            params = (
                ts,
                pm25_list[i] if i < len(pm25_list) else None,
                pm10_list[i] if i < len(pm10_list) else None,
                co_list[i] if i < len(co_list) else None,
                no2_list[i] if i < len(no2_list) else None,
                o3_list[i] if i < len(o3_list) else None,
            )
            execute_query(query, params, fetch=False)
            inserted += 1
            
            if inserted % 100 == 0:
                print(f"   Inserted {inserted} records...")
        
        print(f"✅ Selesai! {inserted} data ditambahkan")
        return inserted
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return 0

if __name__ == "__main__":
    # Ambil data dari 22 Mei sampai kemarin
    end_date = (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d")
    start_date = "2026-05-22"
    
    fetch_historical_data(start_date, end_date)
    
    # Cek hasil
    result = execute_query("SELECT COUNT(*) FROM air_quality_raw", fetch=True)
    print(f"\n📊 Total data di DB: {result[0][0]} baris")