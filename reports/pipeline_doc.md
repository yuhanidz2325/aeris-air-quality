# Pipeline Documentation – Aeris Air Quality System

**Tanggal:** 05 June 2026  
**Proyek:** Sistem Deteksi Anomali Kualitas Udara – Kelompok Aeris PENS 2026  
**PIC:** Linda Anggara Wati

---

## Alur Pipeline Lengkap

```
Open-Meteo API
     |
     v
[FETCH] src/data/fetch_data.py
  - Polutan: PM2.5, PM10, CO, NO2, O3
  - Meteorologi: suhu, kelembaban, angin, hujan
  - Frekuensi: tiap 1 jam (APScheduler)
     |
     v
[PREPROCESS] notebooks/02_preprocessing.ipynb
  - Handle missing values (interpolasi linear)
  - Feature engineering: lag, rolling, diff
  - Segmentasi waktu: PAGI / SIANG / SORE_MALAM
  - Hitung ISPU (Permen LHK 14/2020)
  - StandardScaler normalisasi
     |
     v
[PREDICT] src/models/predict_model.py
  - Deteksi segmen waktu saat ini
  - Load model .pkl sesuai segmen
  - Prediksi 5 polutan sekaligus
  - Inverse transform CO (expm1)
     |
     v
[ANOMALY] src/models/anomaly.py
  - Isolation Forest (contamination=0.05)
  - Output: is_anomaly + anomaly_score
     |
     v
[SAVE] PostgreSQL (Supabase)
  - Tabel: air_quality_raw
  - Tabel: predictions
  - Tabel: anomaly_results
     |
     v
[API] FastAPI src/api/main.py
  - GET /status/surabaya
  - GET /ispu/surabaya
  - GET /predict/surabaya
  - GET /anomaly/surabaya
  - GET /history/surabaya
     |
     v
[FRONTEND] Dashboard HTML/CSS/JS
  - Panel ISPU real-time
  - Prediksi 3 jam ke depan
  - Grafik historis
  - Notifikasi anomali
```

---

## Segmentasi Waktu

| Segmen | Jam | Model yang Diload |
|---|---|---|
| PAGI | 06:00–11:59 | `models/{polutan}_pagi_best.pkl` |
| SIANG | 12:00–17:59 | `models/{polutan}_siang_best.pkl` |
| SORE_MALAM | 18:00–05:59 | `models/{polutan}_sore_malam_best.pkl` |

---

## 15 Model PyCaret

| Polutan | PAGI | SIANG | SORE_MALAM |
|---|---|---|---|
| PM25 | BayesianRidge | BayesianRidge | BayesianRidge |
| PM10 | BayesianRidge | BayesianRidge | BayesianRidge |
| CO | LGBMRegressor | LGBMRegressor | ExtraTreesRegressor |
| NO2 | LGBMRegressor | ExtraTreesRegressor | ExtraTreesRegressor |
| O3 | LGBMRegressor | LGBMRegressor | ExtraTreesRegressor |

---

## Cara Menjalankan Pipeline

### Training ulang semua model:
```bash
python src/models/train_model.py
```

### Training ulang 1 kombinasi:
```bash
python src/models/train_model.py --polutan pm25 --segmen PAGI
```

### Prediksi dari Python:
```python
from src.models.predict_model import PredictorAeris
predictor = PredictorAeris()
hasil = predictor.predict_current(df_input)
print(hasil)
```

### Jalankan API:
```bash
uvicorn src.api.main:app --reload
```

### Jalankan dengan Docker:
```bash
docker-compose up --build
```

---

## Catatan Teknis

- CO menggunakan **log1p transform** sebelum training dan **expm1** saat inferensi
- Semua model dipilih berdasarkan MAE terkecil (before tune vs after tune)
- Isolation Forest contamination rate = 0.05 (5% data dianggap anomali)
- Data di-fetch tiap 1 jam via APScheduler
- Retrain otomatis tiap Minggu jam 01:00 WIB
