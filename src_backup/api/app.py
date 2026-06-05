from fastapi import FastAPI, HTTPException
from src.data.db_utils import execute_query

app = FastAPI(title="Aeris Air Quality API", description="API untuk memantau ISPU Surabaya")

# 1. Fungsi Helper
def get_ispu_category(val: float):
    if val <= 50: return "Baik"
    elif val <= 100: return "Sedang"
    elif val <= 200: return "Tidak Sehat"
    else: return "Sangat Tidak Sehat"

# 2. Route Root (TAMBAHKAN DI SINI)
# Ini supaya saat buka http://127.0.0.1:8000/ tidak muncul 404
@app.get("/")
async def root():
    return {
        "message": "Selamat datang di API Kualitas Udara Kelompok Aeris!",
        "endpoints": {
            "cek_data": "/ispu/surabaya",
            "dokumentasi": "/docs"
        }
    }

# 3. Route Spesifik ISPU
@app.get("/ispu/surabaya")
async def get_current_ispu():
    query = "SELECT pm25, pm10, co, no2, o3, timestamp FROM air_quality_raw ORDER BY timestamp DESC LIMIT 1"
    row = execute_query(query, fetch=True)
    
    if not row:
        raise HTTPException(status_code=404, detail="Data tidak ditemukan di database")
    
    res = row[0]
    pollutant_values = [v for v in res[0:5] if v is not None]
    max_val = max(pollutant_values) if pollutant_values else 0
    
    return {
        "status": "success",
        "location": "Surabaya",
        "timestamp": res[5],
        "pollutants": {
            "pm25": res[0],
            "pm10": res[1],
            "co": res[2],
            "no2": res[3],
            "o3": res[4]
        },
        "category": get_ispu_category(max_val)
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)