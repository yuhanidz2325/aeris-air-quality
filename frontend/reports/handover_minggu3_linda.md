# Handover Doc – Minggu 3 | Linda Anggara Wati

**Tanggal:** 22 May 2026  
**Proyek:** Sistem Deteksi Anomali Kualitas Udara – Kelompok Aeris PENS 2026

---

## Tabel Rekap 15 Model (5 Polutan x 3 Segmen)

| Parameter | Segmen | Model Terbaik | MAE | RMSE | R2 |
|:---:|:---:|:---|:---:|:---:|:---:|
| PM25 | PAGI | BayesianRidge | 0.7309 | 0.9533 | 0.9981 |
| PM10 | PAGI | BayesianRidge | 0.7340 | 0.9780 | 0.9980 |
| CO | PAGI | CatBoostRegressor | 1.1555 | 0.2177 | 0.8602 |
| NO2 | PAGI | CatBoostRegressor | 4.2171 | 4.4011 | 0.9176 |
| O3 | PAGI | CatBoostRegressor | 11.5413 | 13.8503 | 0.9050 |
| PM25 | SIANG | BayesianRidge | 0.3801 | 0.5223 | 0.9976 |
| PM10 | SIANG | BayesianRidge | 0.3832 | 0.5410 | 0.9975 |
| CO | SIANG | CatBoostRegressor | 1.1345 | 0.1870 | 0.8442 |
| NO2 | SIANG | CatBoostRegressor | 3.2503 | 3.2758 | 0.8581 |
| O3 | SIANG | CatBoostRegressor | 12.6033 | 15.1596 | 0.8674 |
| PM25 | SORE_MALAM | Ridge | 0.5204 | 0.6937 | 0.9989 |
| PM10 | SORE_MALAM | BayesianRidge | 0.5190 | 0.6938 | 0.9989 |
| CO | SORE_MALAM | CatBoostRegressor | 1.2301 | 0.3112 | 0.8633 |
| NO2 | SORE_MALAM | CatBoostRegressor | 4.2531 | 5.0616 | 0.9304 |
| O3 | SORE_MALAM | CatBoostRegressor | 6.4484 | 7.7429 | 0.8672 |


## File Output

| File | Keterangan |
|---|---|
| `models/{polutan}_{segmen}_best.pkl` | 15 model tersimpan |
| `reports/rekap_15_model.csv` | Tabel rekap CSV |
| `reports/rekap_15_model.xlsx` | Tabel rekap Excel (untuk Intan) |
| `reports/viz_r2_heatmap.png` | Heatmap R2 |
| `reports/viz_mae_heatmap.png` | Heatmap MAE |
| `reports/viz_model_frekuensi.png` | Frekuensi model terbaik |
| `reports/viz_before_after_tuning.png` | Before vs After tuning |

## Cara Load Model di FastAPI (untuk Yuhanidz)

```python
from pycaret.regression import load_model, predict_model
import pandas as pd

# Load model sesuai segmen jam saat ini
model = load_model('models/pm25_pagi_best')  # tanpa .pkl

# Prediksi
df_input = pd.DataFrame([{...fitur...}])
hasil    = predict_model(model, data=df_input)
prediksi = hasil['prediction_label'].values[0]
```

## Segmentasi Waktu
- **PAGI**: jam 06:00-11:59 -> load `models/{polutan}_pagi_best.pkl`
- **SIANG**: jam 12:00-17:59 -> load `models/{polutan}_siang_best.pkl`
- **SORE_MALAM**: jam 18:00-05:59 -> load `models/{polutan}_sore_malam_best.pkl`
