# Handover Doc – Minggu 3 | Linda Anggara Wati

**Tanggal:** 05 June 2026  
**Proyek:** Sistem Deteksi Anomali Kualitas Udara – Kelompok Aeris PENS 2026

---

## Tabel Rekap 15 Model (5 Polutan x 3 Segmen)

| Parameter | Segmen | Model Terbaik | MAE | RMSE | R2 |
|:---:|:---:|:---|:---:|:---:|:---:|
| PM25 | PAGI | Lasso | 1.0366 | 1.4168 | 0.9834 |
| PM10 | PAGI | Lasso | 1.1486 | 1.5673 | 0.9793 |
| CO | PAGI | ExtraTreesRegressor | 0.1594 | 0.1978 | 0.7180 |
| NO2 | PAGI | LGBMRegressor | 3.2362 | 4.0677 | 0.7595 |
| O3 | PAGI | ExtraTreesRegressor | 17.6389 | 22.0183 | 0.7443 |
| PM25 | SIANG | BayesianRidge | 0.6332 | 0.8947 | 0.9764 |
| PM10 | SIANG | BayesianRidge | 0.6255 | 0.8861 | 0.9752 |
| CO | SIANG | GradientBoostingRegressor | 0.1515 | 0.2057 | 0.7105 |
| NO2 | SIANG | LGBMRegressor | 3.0341 | 3.8935 | 0.7490 |
| O3 | SIANG | BayesianRidge | 11.3752 | 16.5023 | 0.7584 |
| PM25 | SORE_MALAM | Lasso | 0.6774 | 0.9176 | 0.9918 |
| PM10 | SORE_MALAM | Lasso | 0.6545 | 0.8840 | 0.9920 |
| CO | SORE_MALAM | LGBMRegressor | 0.2320 | 0.3053 | 0.7916 |
| NO2 | SORE_MALAM | ElasticNet | 3.9894 | 5.0328 | 0.7817 |
| O3 | SORE_MALAM | GradientBoostingRegressor | 12.0921 | 15.9515 | 0.3565 |


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
