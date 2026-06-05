## Machine Learning – PyCaret AutoML

### Metodologi

Sistem menggunakan **PyCaret AutoML** untuk membandingkan 20+ algoritma ML
secara otomatis pada setiap kombinasi parameter x segmen waktu.

**Total model:** 5 polutan x 3 segmen = **15 kombinasi**

**Alur training:**
```
setup() -> compare_models() -> tune_model() -> save_model()
```

**Segmentasi waktu:**
| Segmen | Jam | Karakteristik |
|:---:|:---:|:---|
| PAGI | 06:00-11:59 | Rush hour pagi, inversi suhu, polutan tinggi |
| SIANG | 12:00-17:59 | Suhu tinggi, dispersi baik, O3 meningkat |
| SORE_MALAM | 18:00-05:59 | Rush hour sore, inversi malam, polutan menumpuk |

### Hasil 15 Model Terbaik

| Parameter | PAGI | SIANG | SORE/MALAM |
|:---:|:---:|:---:|:---:|
| PM25 | Lasso (R2=0.995) | BayesianRidge (R2=0.987) | Lasso (R2=0.997) |
| PM10 | Lasso (R2=0.993) | BayesianRidge (R2=0.987) | Lasso (R2=0.997) |
| CO | ExtraTrees (R2=0.718) | GradientBoostingRegressor (R2=0.711) | LightGBM (R2=0.792) |
| NO2 | LightGBM (R2=0.759) | LightGBM (R2=0.762) | ElasticNet (R2=0.782) |
| O3 | ExtraTrees (R2=0.815) | BayesianRidge (R2=0.758) | GradientBoostingRegressor (R2=0.551) |


### Metrik Evaluasi
- **MAE** – rata-rata kesalahan absolut
- **RMSE** – penalti untuk error besar
- **R2** – proporsi variansi yang dijelaskan model (mendekati 1 = bagus)

### Catatan Teknis
- CO menggunakan **log1p transform** sebelum training dan **expm1** saat inferensi
- Model dipilih berdasarkan MAE terkecil (before vs after tuning)
- Model tersimpan di `models/{polutan}_{segmen}_best.pkl`

### Cara Training Ulang
```bash
# Training ulang semua 15 model
python src/models/train_model.py

# Training ulang 1 kombinasi
python src/models/train_model.py --polutan pm25 --segmen PAGI
```

### Cara Inferensi
```python
from src.models.predict_model import PredictorAeris

predictor = PredictorAeris()
hasil = predictor.predict_current(df_input)
# Output: {'segmen': 'SORE_MALAM', 'prediksi': {'pm25': 45.2, ...}}
```
