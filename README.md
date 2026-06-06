# 🌫️ Aeris - Sistem Deteksi Anomali & Prediksi Kualitas Udara

[![Python 3.11](https://img.shields.io/badge/Python-3.11-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-green.svg)](https://fastapi.tiangolo.com/)
[![PyCaret](https://img.shields.io/badge/PyCaret-3.0+-orange.svg)](https://pycaret.org/)
[![Docker](https://img.shields.io/badge/Docker-20.10+-blue.svg)](https://www.docker.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-lightblue.svg)](https://www.postgresql.org/)
[![MAE](https://img.shields.io/badge/MAE-0.74-success.svg)](https://github.com/kelompok-aeris/capstone-air-quality)
[![R2](https://img.shields.io/badge/R2-0.996-success.svg)](https://github.com/kelompok-aeris/capstone-air-quality)
[![Tests](https://img.shields.io/badge/Tests-28%20passed-brightgreen.svg)](https://github.com/kelompok-aeris/capstone-air-quality)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Kelompok Aeris | D4 Sains Data Terapan PENS 2026 | Capstone Project**

> Sistem cerdas untuk memprediksi polusi udara 3 jam ke depan dan mendeteksi anomali kualitas udara secara real-time, mengacu pada standar resmi ISPU KLHK dengan pendekatan *time-segmented machine learning*.

---

## 📋 Daftar Isi

- [Tentang Proyek](#-tentang-proyek)
- [Latar Belakang Masalah](#-latar-belakang-masalah)
- [Tim Pengembang](#-tim-pengembang)
- [Fitur Unggulan](#-fitur-unggulan)
- [Arsitektur Sistem](#-arsitektur-sistem)
- [Metodologi Machine Learning](#-metodologi-machine-learning)
- [Hasil Evaluasi Model](#-hasil-evaluasi-model)
- [Teknologi yang Digunakan](#-teknologi-yang-digunakan)
- [Cara Menjalankan Proyek](#-cara-menjalankan-proyek)
- [Struktur Proyek](#-struktur-proyek)
- [Skema Database](#-skema-database)
- [API Documentation](#-api-documentation)
- [Lisensi](#-lisensi)

---

## 🎯 Tentang Proyek

**Aeris** adalah sistem deteksi anomali dan prediksi kualitas udara yang dirancang khusus untuk Kota Surabaya. Berbeda dengan sistem konvensional yang menggunakan satu model untuk semua kondisi, Aeris menggunakan **3 model berbeda** yang disesuaikan dengan karakteristik unik setiap segmen waktu: pagi, siang, dan sore/malam.

**Sumber Data:** Open-Meteo Air Quality API (gratis, tanpa API key)
**Lokasi:** Surabaya (latitude -7.2575, longitude 112.7521)
**Periode Data:** 1 Januari 2026 – H-1 sebelum demo

Sistem ini mengintegrasikan:
- **Prediksi regresi** menggunakan PyCaret AutoML (15 model terbaik)
- **Deteksi anomali** menggunakan Isolation Forest
- **Standar resmi** ISPU dari Kementerian LHK (Permen LHK No. 14 Tahun 2020)
- **Visualisasi real-time** dengan dashboard interaktif

---

## ⚠️ Latar Belakang Masalah

Kualitas udara di perkotaan seperti Surabaya sangat dinamis dan memiliki pola yang berbeda-beda setiap waktunya:

| Waktu | Rentang Jam | Karakteristik | Dampak |
|-------|-------------|---------------|--------|
| 🌅 **PAGI** | 06:00 - 11:59 | Rush hour pagi + inversi suhu | Polutan terperangkap di permukaan, PM2.5 tinggi |
| ☀️ **SIANG** | 12:00 - 17:59 | Suhu tinggi + UV kuat + angin aktif | Ozon (O3) meningkat drastis, PM2.5 terdispersi |
| 🌙 **SORE/MALAM** | 18:00 - 05:59 | Rush hour sore + inversi malam | Polutan menumpuk di lapisan bawah |

**Kenyataan:** Satu model ML tidak cukup untuk menangkap semua pola ini.

**Solusi Aeris:** 3 model terpisah per parameter polutan = 15 model total yang bekerja secara otomatis sesuai jam.

---

## 👥 Tim Pengembang

| No | Peran | Nama | NRP | Tanggung Jawab |
|:---|:---|:---|:---|:---|
| 1 | **Data & ML Engineer** | Linda Anggara Wati | 3324600008 | EDA, Feature Engineering, PyCaret (15 model), Isolation Forest |
| 2 | **Backend & DevOps Engineer** | Yuhanidz Habibah | 3324600020 | Database, Backend API, Deployment, Retraining System |
| 3 | **UI/UX Designer & Frontend Developer** | Intan Azzuhra Permadani | 3324600028 | UI/UX Design, Frontend Dashboard, Visualisasi Data |

---

## ✨ Fitur Unggulan

### Untuk Masyarakat Umum
- 🏠 **Dashboard Real-time**: ISPU terkini dengan kode warna (Hijau-Biru-Kuning-Merah-Hitam)
- 🔮 **Prediksi 3 Jam**: Tahu kapan polusi akan memburuk
- 📊 **Grafik Historis**: Lihat tren polusi 7 hari terakhir
- 🔔 **Notifikasi Peringatan**: Pop-up otomatis saat ISPU Tidak Sehat atau Berbahaya
- 📱 **Responsif**: Akses dari desktop, tablet, maupun smartphone

### Untuk Peneliti & Pemerintah
- 🤖 **AutoML PyCaret**: Bandingkan 15 model otomatis per parameter per segmen
- 🕒 **Segmentasi Waktu Dinamis**: Model berganti sesuai jam (06-11, 12-17, 18-05)
- 📈 **MLflow Integration**: Tracking semua eksperimen dan performa model
- 🐳 **Dockerized Deployment**: Siap deploy di server manapun dengan satu perintah
- 🔄 **Retraining Otomatis**: Model diperbarui setiap minggu dengan data terbaru
- 📡 **REST API Lengkap**: 7+ endpoint untuk integrasi dengan sistem lain

---

## 🏗️ Arsitektur Sistem

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           USER INTERFACE (Frontend)                          │
│                    HTML/CSS/JS + Chart.js + Auto-refresh 5 menit             │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         BACKEND API (FastAPI)                                │
│            /status │ /history │ /predict │ /anomaly │ /retrain               │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
              ┌───────────────────────┼───────────────────────┐
              ▼                       ▼                       ▼
┌──────────────────────────┐ ┌──────────────────────────┐ ┌──────────────────────────┐
│      DATA LAYER          │ │      ML LAYER            │ │      SCHEDULER           │
│      PostgreSQL          │ │   • PyCaret              │ │      APScheduler         │
│   • cities               │ │     (15 models)          │ │   • Fetch data           │
│   • air_quality_raw      │ │   • Isolation Forest     │ │     setiap jam           │
│   • predictions          │ │   • MLflow               │ │   • Retrain model        │
│   • anomaly_results      │ │   • Model versioning     │ │     setiap minggu        │
└──────────────────────────┘ └──────────────────────────┘ └──────────────────────────┘
```

---

## 🧠 Metodologi Machine Learning

### 1. Standar ISPU KLHK
Mengacu pada **Peraturan Menteri LHK No. 14 Tahun 2020** (BUKAN standar BMKG atau internasional).

| Rentang ISPU | Kategori | Warna | Dampak Kesehatan |
|:---:|:---:|:---:|:---|
| 0 - 50 | Baik | 🟢 Hijau | Tidak ada risiko kesehatan |
| 51 - 100 | Sedang | 🔵 Biru | Kelompok sensitif mulai terdampak |
| 101 - 200 | Tidak Sehat | 🟡 Kuning | Setiap orang mulai mengalami efek kesehatan |
| 201 - 300 | Sangat Tidak Sehat | 🔴 Merah | Peringatan darurat kesehatan |
| > 300 | Berbahaya | ⚫ Hitam | Kondisi darurat, seluruh penduduk terdampak |

### 2. Segmentasi Waktu
```python
def get_time_segment(hour):
    if 6 <= hour < 12:
        return "PAGI"        # rush hour pagi + inversi suhu
    elif 12 <= hour < 18:
        return "SIANG"       # suhu tinggi + UV meningkat + O3 naik
    else:
        return "SORE_MALAM"  # rush hour sore + inversi malam
```
### 3. Hasil 15 Model PyCaret

| Parameter | PAGI (06:00-11:59) | SIANG (12:00-17:59) | SORE/MALAM (18:00-05:59) |
|:---|:---|:---|:---|
| **PM2.5** | Lasso (MAE=0.85, R2=0.995) | BayesianRidge (MAE=0.58, R2=0.987) | Lasso (MAE=0.59, R2=0.997) |
| **PM10** | Lasso (MAE=0.90, R2=0.993) | BayesianRidge (MAE=0.57, R2=0.987) | Lasso (MAE=0.55, R2=0.997) |
| **CO** | ExtraTrees (MAE=0.16, R2=0.718) | GradientBoosting (MAE=0.15, R2=0.711) | LGBM (MAE=0.23, R2=0.792) |
| **NO2** | LGBM (MAE=3.24, R2=0.760) | LGBM (MAE=3.03, R2=0.762) | ElasticNet (MAE=3.99, R2=0.782) |
| **O3** | ExtraTrees (MAE=14.90, R2=0.815) | BayesianRidge (MAE=11.38, R2=0.758) | GradientBoosting (MAE=10.60, R2=0.551) |


### 4. Isolation Forest (Anomaly Detection)

| Komponen | Tugas | Output |
|:---|:---|:---|
| **PyCaret (Regresi)** | "Berapa nilai PM2.5 3 jam lagi?" | Prediksi nilai numerik |
| **Isolation Forest** | "Apakah nilai PM2.5 saat ini anomali?" | Status Anomali / Normal + Skor |

---

## 📊 Hasil Evaluasi Model

**Model terbaik: PM2.5 - PAGI (BayesianRidge)**

| Metrik | Nilai | Evaluasi |
|:---|:---|:---|
| **MAE** | 0.7441 | ✅ Sangat baik (error < 1 µg/m³) |
| **R²** | 0.9959 | ✅ 99.6% variansi terjelaskan |
| **Overfitting Gap** | -0.0954 | ✅ Tidak overfitting |
| **Mean Residual** | -0.2349 | ✅ Mendekati 0 |

**Kesimpulan:** Model sangat akurat dan siap digunakan untuk prediksi real-time.

---

## 📊 Ringkasan Hasil Notebook 1-5

### 📈 Statistik Data
| Metrik | Nilai |
|--------|-------|
| Total data | 3,696 jam |
| Rentang waktu | 1 Jan - 31 Mei 2026 |
| Polutan | PM2.5, PM10, CO, NO2, O3 |

### 🕐 Segmentasi Waktu
| Segmen | Jam | Jumlah Data | Persentase Anomali |
|--------|-----|-------------|-------------------|
| PAGI | 06:00-11:59 | 924 jam | 3.14% |
| SIANG | 12:00-17:59 | 924 jam | 1.41% |
| SORE_MALAM | 18:00-05:59 | 1,848 jam | 7.74% |

### 🔍 Deteksi Anomali (Isolation Forest)
| Metrik | Nilai | Evaluasi |
|--------|-------|----------|
| Silhouette Score | 0.6970 | ✅ Sangat baik |
| Detected Rate | 5.01% | ✅ Sesuai target |
| Gap Separation | 0.1660 | ✅ Baik |
| Top-10 PM2.5 | 116 vs 35 | ✅ 3x lebih tinggi |

### 🕐 Top 5 Jam Anomali Tertinggi
| Jam | Jumlah Anomali |
|-----|----------------|
| 20:00 | 18 jam |
| 19:00 | 17 jam |
| 06:00 | 16 jam |
| 22:00 | 14 jam |
| 00:00 | 12 jam |

---

## 🛠️ Teknologi yang Digunakan

| Kategori | Teknologi | Versi | Kegunaan |
|:---|:---|:---|:---|
| **Bahasa** | Python | 3.11 | Bahasa utama |
| **Web Framework** | FastAPI | 0.100+ | REST API backend |
| **Database** | PostgreSQL | 15+ | Penyimpanan data |
| **AutoML** | PyCaret | 3.0+ | Perbandingan 15 model |
| **Anomaly Detection** | Scikit-learn | 1.3+ | Isolation Forest |
| **Experiment Tracking** | MLflow | 2.5+ | Logging eksperimen |
| **Scheduler** | APScheduler | 3.10+ | Fetch & retraining |
| **Frontend** | HTML/CSS/JS | - | Dashboard |
| **Charting** | Chart.js | 4.4+ | Grafik historis |
| **Container** | Docker | 20.10+ | Deployment |

---

## 💻 Cara Menjalankan Proyek

### Prasyarat

**Untuk Production (Docker):**
- ✅ Docker Engine 20.10+
- ✅ Docker Compose 2.20+
- ✅ Minimal 4GB RAM & 2GB storage

**Untuk Development (Manual):**
- ✅ Python 3.11+
- ✅ PostgreSQL 15+
- ✅ Git

### Menjalankan dengan Docker (Production)

```bash
# 1. Clone repository
git clone https://github.com/yuhanidz2325/aeris-air-quality.git
cd capstone-air-quality

# 2. Setup environment variables
cp .env.example .env
# Edit file .env dengan kredensial database Anda

# 3. Build dan jalankan semua service
docker-compose up --build

# 4. Akses aplikasi
# Frontend    : http://localhost:8888
# API Docs    : http://localhost:8000/docs
# Database    : localhost:5432
```

### Menjalankan Manual (Development)

```bash
# 1. Setup virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
# atau
.\venv\Scripts\activate   # Windows

# 2. Install dependencies
pip install -r requirements.txt

# 3. Setup database
psql -U postgres -d aeris_db -f database/schema.sql

# 4. Jalankan backend
uvicorn src.api.main:app --reload --port 8000

# 5. Sajikan frontend (terminal terpisah)
cd frontend && python -m http.server 8888
```
### Menjalankan via Docker Hub (Tanpa Build)

Cara ini cocok siapapun yang ingin menjalankan
aplikasi tanpa perlu build image sendiri.

**Prasyarat:**
- ✅ Docker Desktop terinstall
- ✅ Git terinstall
- ✅ File `surabaya_airquality_raw.csv` (minta ke tim pengembang)

```bash
# 1. Clone repository
git clone https://github.com/yuhanidz2325/aeris-air-quality.git
cd aeris-air-quality

# 2. Buat file docker-compose.env
DB_HOST=db
DB_PORT=5432
DB_NAME=aeris_air_quality
DB_USER=postgres
DB_PASSWORD=postgres

# 3. Jalankan semua container (image otomatis di-pull dari Docker Hub)
docker-compose up -d

# 4. Tunggu semua container healthy, lalu import data historis
docker exec aeris_backend mkdir -p /app/data/raw
docker cp data/raw/surabaya_airquality_raw.csv aeris_backend:/app/data/raw/
docker exec -it aeris_backend python -m src.data.fetch_data

# 5. Akses aplikasi
# Frontend : http://localhost:8888
# API Docs : http://localhost:8000/docs
```

> ⚠️ File `docker-compose.env` tidak ikut di GitHub karena berisi kredensial.
> Minta file ini ke tim pengembang atau buat manual sesuai langkah di atas.

---

## 📁 Struktur Proyek

```
aeris-air-quality/
│
├── config/                        # Konfigurasi
│   └── config.yaml                # Parameter terpusat
│
├── data/                          # Data storage
│   ├── raw/                       # Data mentah (CSV)
│   └── processed/                 # Data setelah feature engineering
│
├── frontend/
│   ├── index.html                 # Dashboard utama
│   ├── style.css                  # Styling
│   └── script.js                  # Logic + API calls
│
├── models/                        # Saved models (15+ files)
│   ├── pm25_pagi_best.pkl
│   ├── isolation_forest.pkl
│   └── ...
│
├── notebooks/
│   ├── 01_data_collection.ipynb
│   ├── 02_preprocessing.ipynb
│   ├── 03_pycaret_comparison.ipynb
│   ├── 04_pipeline_testing.ipynb
│   └── 05_finalisasi.ipynb
│
├── reports/
│   └── slide_viz/                 # Visualisasi slide
│
├── src/
│   ├── api/                       # FastAPI
│   │   └── main.py
│   ├── data/                      # Data pipeline
│   │   ├── fetch_data.py
│   │   ├── ingestion_service.py
│   │   └── db_utils.py
│   ├── models/                    # ML logic
│   │   ├── train_model.py
│   │   ├── predict_model.py
│   │   └── anomaly.py
│   └── utils/                     # Utilities
│       ├── logger.py
│       └── config_loader.py
│
├── tests/                         # Unit testing (28 tests)
│   ├── test_preprocessing.py
│   ├── test_features.py
│   ├── test_model.py
│   └── test_pipeline.py
│
├── docker-compose.yml
├── Dockerfile
├── requirements.txt
└── README.md
```

---

## 🗄️ Skema Database

```sql
-- 1. Tabel cities
CREATE TABLE cities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL
);

-- 2. Tabel air_quality_raw
CREATE TABLE air_quality_raw (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMP NOT NULL,
    city_id INTEGER REFERENCES cities(id),
    pm25 DECIMAL, pm10 DECIMAL, co DECIMAL, no2 DECIMAL, o3 DECIMAL,
    temperature DECIMAL, humidity DECIMAL, wind_speed DECIMAL,
    wind_direction DECIMAL, precipitation DECIMAL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabel predictions
CREATE TABLE predictions (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMP NOT NULL,
    predict_for TIMESTAMP NOT NULL,
    city_id INTEGER REFERENCES cities(id),
    time_segment VARCHAR(20) NOT NULL,
    parameter VARCHAR(10) NOT NULL,
    predicted_value DECIMAL NOT NULL,
    model_version VARCHAR(50)
);

-- 4. Tabel anomaly_results
CREATE TABLE anomaly_results (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMP NOT NULL,
    city_id INTEGER REFERENCES cities(id),
    parameter VARCHAR(10) NOT NULL,
    anomaly_score DECIMAL,
    is_anomaly BOOLEAN NOT NULL
);

-- Insert Surabaya
INSERT INTO cities (name, latitude, longitude) 
VALUES ('Surabaya', -7.2575, 112.7521);
```

---

## 📡 API Documentation

**Base URL:** `http://localhost:8000`

| Method | Endpoint | Deskripsi |
|:---|:---|:---|
| `GET` | `/` | Root welcome message |
| `GET` | `/status/surabaya` | Data terkini + ISPU + warna + anomali |
| `GET` | `/history/surabaya` | Data historis (filter date & parameter) |
| `GET` | `/predict/surabaya` | Prediksi 3 jam ke depan |
| `GET` | `/anomaly/surabaya` | Status anomali per parameter |
| `GET` | `/retrain/status` | Status scheduler & next run |
| `POST` | `/retrain` | Manual trigger retraining |

> 📖 **Interactive API Docs:** `http://localhost:8000/docs`

---

## 📄 Lisensi

**MIT License** - Silakan digunakan, dimodifikasi, dan didistribusikan dengan mencantumkan atribusi kepada **Kelompok Aeris - PENS 2026**.

---

## 🙏 Ucapan Terima Kasih

- **Open-Meteo API** - Data kualitas udara gratis
- **PyCaret** - AutoML untuk 15 model
- **FastAPI** - Backend framework
- **Docker** - Containerization
- **Dosen Pembimbing** - Bimbingan selama 5 minggu

---

**Dibangun dengan ❤️ oleh Kelompok Aeris**  
*D4 Sains Data Terapan - Politeknik Elektronika Negeri Surabaya (PENS)*  
*Tahun Akademik 2025/2026*

---

> *"Udara Bersih, Masa Depan Cerah - Deteksi Dini untuk Langkah Cerdas"*
