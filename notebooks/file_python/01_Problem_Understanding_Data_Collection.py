# # 01 – Problem Understanding & Data Collection
# **Proyek Capstone – Sistem Prediksi Kualitas Udara & Deteksi Anomali (Aeris)**
# **Kelompok Aeris | SDT PENS 2026**
# **PIC: Linda Anggara Wati – Data, EDA, Feature Engineering & ML**
#
# ---
# **Minggu 1 | 27 April – 3 Mei 2026**
# Fase: Phase 1 – Problem Understanding & Data Collection

# %% [markdown]
# ## 1. Problem Understanding

# %% [markdown]
# ### 1.1 Latar Belakang & Identifikasi Masalah Bisnis Nyata
#
# Kualitas udara di kota-kota besar Indonesia, khususnya Surabaya, semakin mengkhawatirkan
# akibat pertumbuhan industri, kepadatan kendaraan bermotor, dan aktivitas pembakaran.
# Surabaya sebagai kota terbesar kedua di Indonesia dengan populasi >3 juta jiwa menghadapi
# risiko paparan polutan udara yang tinggi setiap harinya.
#
# **Masalah bisnis yang diidentifikasi:**
#
# 1. **Tidak ada sistem peringatan dini (early warning system)**: Masyarakat dan pemerintah
#    tidak memiliki akses terhadap prediksi kualitas udara 1-3 jam ke depan untuk antisipasi.
#
# 2. **Keterlambatan deteksi anomali**: Pemantauan kualitas udara saat ini bersifat reaktif —
#    peringatan baru dikeluarkan setelah kondisi sudah memburuk.
#
# 3. **Dampak kesehatan masyarakat**: Paparan PM2.5 di atas 55 µg/m³ (ISPU > 100)
#    meningkatkan risiko penyakit pernapasan, kardiovaskular, dan kematian dini.
#
# **Stakeholder yang terdampak:**
# - Dinas Lingkungan Hidup Kota Surabaya
# - Dinas Kesehatan & rumah sakit
# - Sekolah dan institusi pendidikan
# - Masyarakat umum (terutama kelompok rentan)

# %% [markdown]
# ### 1.2 Pertanyaan Bisnis Terukur (Business Questions)
#
# Proyek ini dirancang untuk menjawab **dua jenis pertanyaan bisnis**: Regresi Prediksi dan Deteksi Anomali.
#
# #### A. Pertanyaan Regresi Prediksi (3 Jam ke Depan)
# | # | Pertanyaan Bisnis | Metrik Keberhasilan |
# |---|---|---|
# | 1 | Berapa konsentrasi **PM2.5** dalam 3 jam ke depan? | MAE < 15%, R² > 0.85 |
# | 2 | Berapa konsentrasi **PM10** dalam 3 jam ke depan? | MAE < 15%, R² > 0.85 |
# | 3 | Berapa konsentrasi **CO** dalam 3 jam ke depan? | MAE < 15%, R² > 0.85 |
# | 4 | Berapa konsentrasi **NO2** dalam 3 jam ke depan? | MAE < 15%, R² > 0.85 |
# | 5 | Berapa konsentrasi **O3** dalam 3 jam ke depan? | MAE < 15%, R² > 0.85 |
# | 6 | Model regresi mana yang terbaik per polutan & segmen waktu? | Lasso, Ridge, LGBM, ElasticNet, ExtraTrees |
#
# #### B. Pertanyaan Deteksi Anomali
# | # | Pertanyaan Bisnis | Metrik Keberhasilan |
# |---|---|---|
# | 7 | Apakah kondisi kualitas udara saat ini anomali? | F1-score ≥ 0.80 |
# | 8 | Polutan mana yang paling sering menjadi penyebab anomali? | Frekuensi polutan dominan |
# | 9 | Pada jam/segmen waktu berapa anomali paling sering terjadi? | Distribusi temporal |

# %% [markdown]
# ### 1.3 Pendekatan Pemodelan: Regresi (Bukan Time Series Forecasting)
#
# **Mengapa regresi, bukan forecasting?**
# - Time series forecasting (ARIMA, LSTM) membutuhkan data berurutan dan lebih kompleks
# - Regresi dengan **feature engineering** lebih sederhana dan interpretable
# - Model regresi (Random Forest, Lasso, LGBM) sudah terbukti akurat (R² > 0.85)
#
# **Cara kerja regresi untuk prediksi 3 jam:**
# 1. **Target (y)**: Nilai polutan **3 jam ke depan** (shift -3)
# 2. **Fitur (X)**: 
#    - Nilai polutan saat ini (pm25, pm10, co, no2, o3)
#    - Lag features (1h, 3h, 24h yang lalu)
#    - Rolling features (mean_3h, mean_24h, std_24h, max_24h)
#    - Diff features (perubahan 1 jam)
#    - Fitur waktu (hour, day_of_week, month, is_weekend, time_segment)
# 3. Model regresi belajar memetakan fitur → target 3 jam ke depan

# %% [markdown]
# ### 1.4 Definisi Sukses Proyek
#
# | Komponen | Target Keberhasilan |
# |----------|---------------------|
# | ✅ **Regresi Prediksi 3 jam** | MAE < 15%, R² > 0.85 untuk 5 polutan |
# | ✅ **Deteksi Anomali** | F1-score ≥ 0.80 |
# | ✅ **Kecepatan API** | Latensi < 1 detik per request |
# | ✅ **Dashboard Frontend** | Real-time, interaktif, user-friendly |

# %% [markdown]
# ### 1.5 Literature Review
#
# #### A. Regulasi: Indeks Standar Pencemar Udara (ISPU)
# Dasar hukum: **Peraturan Menteri LHK No. 14 Tahun 2020**
#
# | Rentang ISPU | Kategori | Warna |
# |:---:|:---|:---:|
# | 0 – 50 | Baik | 🟢 Hijau |
# | 51 – 100 | Sedang | 🔵 Biru |
# | 101 – 200 | Tidak Sehat | 🟡 Kuning |
# | 201 – 300 | Sangat Tidak Sehat | 🔴 Merah |
# | > 300 | Berbahaya | ⚫ Hitam |
#
# #### B. Referensi Jurnal
#
# **Regresi Prediksi Kualitas Udara:**
# 1. **Kumar & Goyal (2022)** – Perbandingan Random Forest dan XGBoost untuk prediksi AQI.
#    *Relevansi*: Justifikasi pemilihan model ensemble.
#
# **Deteksi Anomali:**
# 2. **Zhang et al. (2023)** – Isolation Forest untuk deteksi anomali PM2.5. F1-score 0.87.
#    *Relevansi*: Justifikasi penggunaan Isolation Forest.

# %% [markdown]
# ### 1.6 Definisi Formal "Anomali"
#
# > **Anomali:** ISPU final ≥ 101 ATAU spike ≥ mean_24h + 2×std_24h
#
# **Metode:** Isolation Forest (contamination_rate = 0.05)
# - `1` = Anomali
# - `0` = Normal

# %% [markdown]
# ### 1.7 Ruang Lingkup Proyek
#
# | Modul | Fungsi | Output |
# |-------|--------|--------|
# | **Regresi Prediksi** | Prediksi 3 jam ke depan | PM2.5, PM10, CO, NO2, O3 (µg/m³) |
# | **Deteksi Anomali** | Identifikasi pola tidak normal | Status anomali (True/False) |
# | **ISPU** | Konversi ke indeks standar | Kategori + Warna |
# | **REST API** | Endpoint untuk frontend | JSON response |
# | **Dashboard** | Visualisasi interaktif | Grafik + insight |

# %% [markdown]
# ---
# ## 2. Setup Environment

# %%
import os
import requests
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from datetime import datetime, timedelta

sns.set_theme(style="whitegrid", palette="muted")
plt.rcParams["figure.dpi"] = 110

ROOT = os.path.abspath(os.path.join(os.getcwd(), ".."))
os.chdir(ROOT)

for folder in ["data/raw", "data/processed", "models", "reports"]:
    os.makedirs(folder, exist_ok=True)

print("✅ Environment siap")
print(f"📂 Working directory: {os.getcwd()}")

# %% [markdown]
# ---
# ## 3. Data Collection
#
# **Sumber:** Open-Meteo Air Quality API
# **Koordinat Surabaya:** -7.2575, 112.7521
# **Rentang data:** 1 Januari 2026 – sekarang

# %% [markdown]
# ### 3.1 Fetch Data Polutan

# %%
LAT = -7.2575
LON = 112.7521
START_DATE = "2026-01-01"
END_DATE = (datetime.today() - timedelta(days=1)).strftime("%Y-%m-%d")

print(f"📍 Koordinat: {LAT}, {LON}")
print(f"📅 Rentang  : {START_DATE} → {END_DATE}")

resp_aq = requests.get(
    "https://air-quality-api.open-meteo.com/v1/air-quality",
    params={
        "latitude": LAT, "longitude": LON,
        "hourly": ["pm2_5", "pm10", "carbon_monoxide", "nitrogen_dioxide", "ozone"],
        "timezone": "Asia/Jakarta",
        "start_date": START_DATE, "end_date": END_DATE,
    }
)
resp_aq.raise_for_status()

df_aq = pd.DataFrame(resp_aq.json()["hourly"])
df_aq["time"] = pd.to_datetime(df_aq["time"])

print(f"✅ Data polutan: {df_aq.shape[0]:,} baris")
df_aq.head(3)

# %% [markdown]
# ### 3.2 Simpan Raw Data

# %%
df_aq.rename(columns={
    "pm2_5": "pm25", "carbon_monoxide": "co",
    "nitrogen_dioxide": "no2", "ozone": "o3"
}, inplace=True)

raw_path = "data/raw/surabaya_airquality_raw.csv"
df_aq.to_csv(raw_path, index=False)

print(f"✅ Raw data tersimpan → {raw_path}")
print(f"   Shape: {df_aq.shape[0]:,} baris × {df_aq.shape[1]} kolom")
print(f"   Kolom: {list(df_aq.columns)}")

# %% [markdown]
# ### 3.3 Struktur Data untuk Pemodelan

# %%
print("""
| Kolom | Satuan | Deskripsi |
|-------|--------|-----------|
| time | timestamp | Waktu pengukuran (WIB, hourly) |
| pm25 | µg/m³ | Particulate Matter < 2.5 µm |
| pm10 | µg/m³ | Particulate Matter < 10 µm |
| co | µg/m³ | Carbon Monoxide |
| no2 | µg/m³ | Nitrogen Dioxide |
| o3 | µg/m³ | Ozone |

Catatan: Data meteorologi tidak digunakan karena model regresi dengan fitur lag
dan rolling dari polutan itu sendiri sudah cukup akurat.
""")

# %% [markdown]
# ---
# ## 4. Preview Dataset

# %%
print("=" * 60)
print("PREVIEW DATASET")
print("=" * 60)
print(f"\nShape   : {df_aq.shape[0]:,} baris × {df_aq.shape[1]} kolom")
print(f"Rentang : {df_aq['time'].min()} → {df_aq['time'].max()}")
print(f"\nStatistik awal:")
df_aq.describe()

# %%
print("\n5 baris pertama:")
df_aq.head()

# %% [markdown]
# ---
# ## 5. Ringkasan Notebook 01

# %%
print("=" * 60)
print("RINGKASAN NOTEBOOK 01")
print("=" * 60)
print(f"""
✅ Problem Understanding:
   - Masalah: Tidak ada early warning system polusi udara Surabaya
   - Pendekatan: Regresi (bukan time series forecasting)
   - Target: Prediksi 3 jam ke depan + deteksi anomali
   - Metrik: MAE < 15%, R² > 0.85, F1-score ≥ 0.80

✅ Data Collection:
   - Sumber: Open-Meteo Air Quality API
   - Rentang: {START_DATE} → {END_DATE}
   - Shape: {df_aq.shape[0]:,} baris × {df_aq.shape[1]} kolom
   - Kolom: time, pm25, pm10, co, no2, o3

📌 Next → Notebook 02: Exploratory Data Analysis (EDA)
""")