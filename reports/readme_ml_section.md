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
| PM25 | BayesianRidge (R2=0.998) | BayesianRidge (R2=0.997) | Ridge (R2=0.999) |
| PM10 | BayesianRidge (R2=0.998) | BayesianRidge (R2=0.998) | BayesianRidge (R2=0.999) |
| CO | CatBoost (R2=0.860) | CatBoost (R2=0.844) | CatBoost (R2=0.863) |
| NO2 | CatBoost (R2=0.918) | CatBoost (R2=0.858) | CatBoost (R2=0.930) |
| O3 | CatBoost (R2=0.905) | CatBoost (R2=0.867) | CatBoost (R2=0.867) |


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
