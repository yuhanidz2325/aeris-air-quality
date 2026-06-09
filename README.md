# 🌬️ AERIS — Sistem Deteksi Anomali & Prediksi Kualitas Udara

[![Python 3.11](https://img.shields.io/badge/Python-3.11-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-green.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18+-61DAFB.svg)](https://react.dev/)
[![PyCaret](https://img.shields.io/badge/PyCaret-3.0+-orange.svg)](https://pycaret.org/)
[![Docker](https://img.shields.io/badge/Docker-20.10+-blue.svg)](https://www.docker.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-lightblue.svg)](https://www.postgresql.org/)
[![MAE](https://img.shields.io/badge/MAE-0.74-success.svg)](https://github.com/yuhanidz2325/aeris-air-quality)
[![R2](https://img.shields.io/badge/R2-0.996-success.svg)](https://github.com/yuhanidz2325/aeris-air-quality)
[![Tests](https://img.shields.io/badge/Tests-28%20passed-brightgreen.svg)](https://github.com/yuhanidz2325/aeris-air-quality)
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

**AERIS** (Air Quality Monitoring System) adalah sistem deteksi anomali dan prediksi kualitas udara yang dirancang khusus untuk Kota Surabaya. Berbeda dengan sistem konvensional yang menggunakan satu model untuk semua kondisi, AERIS menggunakan **3 model berbeda** yang disesuaikan dengan karakteristik unik setiap segmen waktu: pagi, siang, dan sore/malam.

**Sumber Data:** Open-Meteo Air Quality API (gratis, tanpa API key)  
**Lokasi:** Surabaya (latitude -7.2575, longitude 112.7521)  
**Periode Data:** 1 Januari 2026 – real-time (update setiap jam)

Sistem ini mengintegrasikan:
- **Prediksi regresi** menggunakan PyCaret AutoML (15 model terbaik)
- **Deteksi anomali** menggunakan Isolation Forest
- **Standar resmi** ISPU dari Kementerian LHK (Permen LHK No. 14 Tahun 2020)
- **Dashboard interaktif** dengan React 18 + Vite + Recharts

---

## ⚠️ Latar Belakang Masalah

Kualitas udara di perkotaan seperti Surabaya sangat dinamis dan memiliki pola yang berbeda-beda setiap waktunya:

| Waktu | Rentang Jam | Karakteristik | Dampak |
|-------|-------------|---------------|--------|
| 🌅 **PAGI** | 06:00 – 11:59 | Rush hour pagi + inversi suhu | Polutan terperangkap di permukaan, PM2.5 tinggi |
| ☀️ **SIANG** | 12:00 – 17:59 | Suhu tinggi + UV kuat + angin aktif | Ozon (O₃) meningkat drastis, PM2.5 terdispersi |
| 🌙 **SORE/MALAM** | 18:00 – 05:59 | Rush hour sore + inversi malam | Polutan menumpuk di lapisan bawah |

**Kenyataan:** Satu model ML tidak cukup untuk menangkap semua pola ini.

**Solusi AERIS:** 3 model terpisah per parameter polutan = **15 model total** yang bekerja secara otomatis sesuai jam.

---

## 👥 Tim Pengembang

| No | Peran | Nama | NRP | Tanggung Jawab |
|:---|:---|:---|:---|:---|
| 1 | **Data & ML Engineer** | Linda Anggara Wati | 3324600008 | EDA, Feature Engineering, PyCaret (15 model), Isolation Forest |
| 2 | **Backend & DevOps Engineer** | Yuhanidz Habibah | 3324600020 | Database, Backend API, Deployment, Retraining System |
| 3 | **UI/UX & Frontend Developer** | Intan Azzuhra Permadani | 3324600028 | UI/UX Design, Frontend Dashboard (React + Vite), Visualisasi Data |

---

## ✨ Fitur Unggulan

### Untuk Masyarakat Umum
- 🏠 **Dashboard Real-time** — ISPU terkini dengan kode warna (Baik/Sedang/Tidak Sehat/Sangat Tidak Sehat/Berbahaya)
- 🔮 **Prediksi 3 Jam** — Tahu kapan polusi akan memburuk sebelum terjadi
- 📊 **Grafik Historis** — Lihat tren polusi 1 hari / 7 hari / 1 bulan dengan 3 mode tampilan
- ⚠️ **Deteksi Anomali** — Hero dashboard berubah merah otomatis saat anomali terdeteksi
- 📱 **Responsif** — Akses dari desktop maupun mobile

### Untuk Peneliti & Pemerintah
- 🤖 **AutoML PyCaret** — Bandingkan 15 model otomatis per parameter per segmen waktu
- 🕒 **Segmentasi Waktu Dinamis** — Model berganti sesuai jam (06–11, 12–17, 18–05)
- 📈 **MLflow Integration** — Tracking semua eksperimen dan performa model
- 🐳 **Dockerized Deployment** — Siap deploy di server manapun dengan satu perintah
- 🔄 **Retraining Otomatis** — Model diperbarui setiap minggu dengan data terbaru
- 📡 **REST API Lengkap** — 6 endpoint untuk integrasi dengan sistem lain

---

## 🏗️ Arsitektur Sistem

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     USER INTERFACE (Frontend)                                │
│           React 18 + Vite + Recharts + Auto-refresh 60 menit                │
│    Landing Page | Beranda | Grafik & Tren | Anomali | Prediksi | Edukasi    │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         BACKEND API (FastAPI)                                │
│         /status │ /history │ /predict │ /anomaly │ /retrain                 │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
              ┌───────────────────────┼───────────────────────┐
              ▼                       ▼                       ▼
┌──────────────────────────┐ ┌──────────────────────────┐ ┌──────────────────────────┐
│      DATA LAYER          │ │      ML LAYER            │ │      SCHEDULER           │
│      PostgreSQL          │ │   • PyCaret (15 model)   │ │      APScheduler         │
│   • cities               │ │   • Isolation Forest     │ │   • Fetch data           │
│   • air_quality_raw      │ │   • MLflow               │ │     setiap jam           │
│   • predictions          │ │   • Model versioning     │ │   • Retrain model        │
│   • anomaly_results      │ │                          │ │     setiap minggu        │
└──────────────────────────┘ └──────────────────────────┘ └──────────────────────────┘
              ▲
              │
┌──────────────────────────┐
│   Open-Meteo Air Quality │
│         API              │
│  (gratis, tanpa API key) │
└──────────────────────────┘
```

### Alur Data:
1. **Fetch** → Open-Meteo API setiap jam via APScheduler
2. **Preprocess** → Feature engineering (21 fitur dari data mentah)
3. **Segment** → Tentukan PAGI / SIANG / SORE_MALAM berdasarkan jam
4. **Predict** → Load model sesuai segmen → Prediksi 3 jam ke depan
5. **Detect** → Isolation Forest → Status anomali per parameter
6. **Store** → Simpan ke PostgreSQL (Railway)
7. **Display** → Dashboard React auto-refresh 60 menit

---

## 🧠 Metodologi Machine Learning

### 1. Standar ISPU KLHK
Mengacu pada **Peraturan Menteri LHK No. 14 Tahun 2020** (BUKAN standar BMKG atau internasional).

| Rentang ISPU | Kategori | Warna | Dampak Kesehatan |
|:---:|:---:|:---:|:---|
| 0 – 50 | Baik | 🟢 Hijau | Tidak ada risiko kesehatan |
| 51 – 100 | Sedang | 🔵 Biru | Kelompok sensitif mulai terdampak |
| 101 – 200 | Tidak Sehat | 🟡 Kuning | Setiap orang mulai mengalami efek kesehatan |
| 201 – 300 | Sangat Tidak Sehat | 🔴 Merah | Peringatan darurat kesehatan, semua terdampak serius |
| > 300 | Berbahaya | ⚫ Hitam | Kondisi darurat, seluruh penduduk terdampak berat |

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

| Parameter | PAGI (06:00–11:59) | SIANG (12:00–17:59) | SORE/MALAM (18:00–05:59) |
|:---|:---|:---|:---|
| **PM2.5** | Lasso (MAE=0.85, R²=0.995) | BayesianRidge (MAE=0.58, R²=0.987) | Lasso (MAE=0.59, R²=0.997) |
| **PM10** | Lasso (MAE=0.90, R²=0.993) | BayesianRidge (MAE=0.57, R²=0.987) | Lasso (MAE=0.55, R²=0.997) |
| **CO** | ExtraTrees (MAE=0.16, R²=0.718) | GradientBoosting (MAE=0.15, R²=0.711) | LGBM (MAE=0.23, R²=0.792) |
| **NO₂** | LGBM (MAE=3.24, R²=0.760) | LGBM (MAE=3.03, R²=0.762) | ElasticNet (MAE=3.99, R²=0.782) |
| **O₃** | ExtraTrees (MAE=14.90, R²=0.815) | BayesianRidge (MAE=11.38, R²=0.758) | GradientBoosting (MAE=10.60, R²=0.551) |

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

---

## 📊 Ringkasan Hasil Notebook 1–5

### 📈 Statistik Data
| Metrik | Nilai |
|--------|-------|
| Total data | 3.696 jam |
| Rentang waktu | 1 Jan – 31 Mei 2026 |
| Polutan | PM2.5, PM10, CO, NO₂, O₃ |

### 🕐 Segmentasi Waktu
| Segmen | Jam | Jumlah Data | Persentase Anomali |
|--------|-----|-------------|-------------------|
| PAGI | 06:00–11:59 | 924 jam | 3.14% |
| SIANG | 12:00–17:59 | 924 jam | 1.41% |
| SORE_MALAM | 18:00–05:59 | 1.848 jam | 7.74% |

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
| **Bahasa** | Python | 3.11 | Bahasa utama backend & ML |
| **Frontend** | React | 18+ | Framework JavaScript UI komponen |
| **Build Tool** | Vite | 5+ | Build tool modern, hot reload |
| **Charting** | Recharts | Latest | Grafik interaktif dashboard |
| **Icons** | Tabler Icons | Latest | Ikon UI (via npm) |
| **Web Framework** | FastAPI | 0.100+ | REST API backend |
| **Database** | PostgreSQL | 15+ | Penyimpanan data historis & prediksi |
| **AutoML** | PyCaret | 3.0+ | Perbandingan 15 model otomatis |
| **Anomaly Detection** | Scikit-learn | 1.3+ | Isolation Forest |
| **Experiment Tracking** | MLflow | 2.5+ | Logging & tracking eksperimen |
| **Scheduler** | APScheduler | 3.10+ | Fetch data tiap jam & retrain mingguan |
| **Data Source** | Open-Meteo API | — | Data kualitas udara gratis real-time |
| **Container** | Docker | 20.10+ | Deployment & containerisasi |
| **Deployment** | Railway | Cloud | Hosting backend + database |

---

## 💻 Cara Menjalankan Proyek

### Prasyarat

**Untuk Development (Manual):**
- ✅ Python 3.11+
- ✅ Node.js 18+
- ✅ PostgreSQL 15+ (atau gunakan Railway)
- ✅ Git

### 1. Clone Repository

```bash
git clone https://github.com/yuhanidz2325/aeris-air-quality.git
cd aeris-air-quality
```

### 2. Menjalankan Backend

```bash
# Install dependencies Python
pip install -r requirements.txt

# Setup environment variables
cp .env.example .env
# Edit .env dengan kredensial database

# Setup database (buat tabel)
python -c "
from src.data.db_utils import get_db_connection
conn = get_db_connection()
cur = conn.cursor()
with open('database_schema.sql', 'r') as f:
    cur.execute(f.read())
conn.commit()
print('Database ready!')
"

# Fetch data historis dari CSV
python -m src.data.fetch_data

# Fetch data terbaru dari Open-Meteo (backfill)
python -m src.data.fetch_historical_real

# Jalankan backend
python -m uvicorn src.api.main:app --reload --host 0.0.0.0 --port 8000
```

### 3. Menjalankan Frontend

```bash
cd frontend

# Install dependencies
npm install

# Setup environment
echo "VITE_API_URL=http://localhost:8000" > .env

# Jalankan development server
npm run dev
```

### 4. Akses Aplikasi

| Service | URL |
|:---|:---|
| **Dashboard** | http://localhost:5173 |
| **API Docs** | http://localhost:8000/docs |
| **API Base** | http://localhost:8000 |

> ⚠️ Pastikan **dua terminal** berjalan bersamaan: satu untuk backend (port 8000) dan satu untuk frontend (port 5173).

---

### Menjalankan via Docker

**Prasyarat:**
- ✅ Docker Engine 20.10+
- ✅ Docker Compose 2.20+
- ✅ Minimal 4GB RAM & 2GB storage
- ✅ Git

```bash
# 1. Clone repository
git clone https://github.com/yuhanidz2325/aeris-air-quality.git
cd aeris-air-quality

# 2. Setup environment variables
cp .env.example .env
# Edit .env dengan kredensial database

# 3. Build dan jalankan semua service
docker-compose up --build

# 4. Akses aplikasi
# Frontend    : http://localhost:5173
# API Docs    : http://localhost:8000/docs
# Database    : localhost:5432
```

### Menjalankan via Docker Hub (Tanpa Build)

**Prasyarat:**
- ✅ Docker Desktop terinstall
- ✅ Git
- ✅ File `surabaya_airquality_raw.csv` (minta ke tim pengembang)

```bash
# 1. Clone repository
git clone https://github.com/yuhanidz2325/aeris-air-quality.git
cd aeris-air-quality

# 2. Buat file .env
DB_HOST=db
DB_PORT=5432
DB_NAME=aeris_air_quality
DB_USER=postgres
DB_PASSWORD=postgres

# 3. Jalankan semua container (image otomatis di-pull dari Docker Hub)
docker-compose up -d

# 4. Import data historis
docker exec aeris_backend mkdir -p /app/data/raw
docker cp data/raw/surabaya_airquality_raw.csv aeris_backend:/app/data/raw/
docker exec -it aeris_backend python -m src.data.fetch_data

# 5. Akses aplikasi
# Frontend : http://localhost:5173
# API Docs : http://localhost:8000/docs
```

> ⚠️ File `.env` tidak ikut di GitHub karena berisi kredensial. Buat manual sesuai langkah di atas.

---

## 📁 Struktur Proyek

```
aeris-air-quality/
│
├── data/
│   ├── raw/                        # Data CSV mentah
│   └── processed/                  # Data setelah preprocessing
│
├── frontend/                       # React + Vite Dashboard
│   ├── src/
│   │   ├── components/             # Komponen UI
│   │   │   ├── CardPredict.jsx     # Kartu prediksi 3 jam
│   │   │   ├── TrendChart.jsx      # Grafik tren PM2.5
│   │   │   ├── GrafikTrenChart.jsx # Tab Grafik & Tren
│   │   │   ├── DeteksiAnomali.jsx  # Tab Anomali
│   │   │   ├── Prediksi.jsx        # Tab Prediksi
│   │   │   ├── KondisiData.jsx     # Tab Kondisi Data
│   │   │   └── Edukasi.jsx         # Tab Edukasi
│   │   ├── pages/
│   │   │   └── LandingPage.jsx     # Halaman landing
│   │   ├── App.jsx                 # Root component + sidebar
│   │   ├── constants.js            # Konfigurasi polutan & ISPU
│   │   ├── index.css               # Global styles + animasi wave
│   │   └── main.jsx                # Entry point
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── models/                         # Model ML tersimpan (15+ file .pkl)
│   ├── pm25_pagi_best.pkl
│   ├── pm25_siang_best.pkl
│   ├── pm25_sore_malam_best.pkl
│   ├── iforest_pm25.pkl
│   ├── standard_scaler.pkl
│   └── ...
│
├── notebooks/
│   ├── 01_data_collection.ipynb
│   ├── 02_preprocessing.ipynb
│   ├── 03_pycaret_comparison.ipynb
│   ├── 04_pipeline_testing.ipynb
│   └── 05_finalisasi.ipynb
│
├── reports/                        # Laporan & visualisasi
│   └── slide_viz/
│
├── src/
│   ├── api/
│   │   ├── main.py                 # FastAPI app + semua endpoint
│   │   └── app.py
│   ├── data/
│   │   ├── db_utils.py             # Koneksi & query database
│   │   ├── fetch_data.py           # Import data dari CSV
│   │   ├── fetch_historical_real.py # Backfill dari Open-Meteo
│   │   └── ingestion_service.py    # Scheduler fetch real-time
│   └── models/
│       ├── anomaly.py              # Isolation Forest
│       ├── predict_model.py        # PredictorAeris class
│       └── train_model.py          # Training pipeline
│
├── tests/                          # Unit testing (28 tests)
│   ├── test_preprocessing.py
│   ├── test_features.py
│   ├── test_model.py
│   └── test_pipeline.py
│
├── database_schema.sql             # DDL database
├── docker-compose.yml
├── Dockerfile
├── requirements.txt
├── .env.example
└── README.md
```

---

## 🗄️ Skema Database

```sql
-- 1. Tabel cities
CREATE TABLE cities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

-- 2. Tabel air_quality_raw
CREATE TABLE air_quality_raw (
    id SERIAL PRIMARY KEY,
    city_id INTEGER REFERENCES cities(id),
    pm25 FLOAT,
    pm10 FLOAT,
    co FLOAT,
    no2 FLOAT,
    o3 FLOAT,
    temperature FLOAT,
    humidity FLOAT,
    temperature_2m FLOAT,
    relative_humidity FLOAT,
    wind_speed_10m FLOAT,
    wind_direction_10m FLOAT,
    precipitation FLOAT,
    timestamp TIMESTAMP,
    is_processed BOOLEAN DEFAULT FALSE,
    UNIQUE (city_id, timestamp)
);

-- 3. Tabel predictions
CREATE TABLE predictions (
    id SERIAL PRIMARY KEY,
    parameter VARCHAR(50),
    time_segment VARCHAR(50),
    predicted_value FLOAT,
    prediction_time TIMESTAMP
);

-- 4. Tabel anomaly_results
CREATE TABLE anomaly_results (
    id SERIAL PRIMARY KEY,
    parameter VARCHAR(50),
    is_anomaly BOOLEAN,
    anomaly_score FLOAT,
    detection_time TIMESTAMP
);

-- Insert Surabaya
INSERT INTO cities (name) VALUES ('Surabaya');
```

---

## 📡 API Documentation

**Base URL:** `http://localhost:8000`

| Method | Endpoint | Deskripsi |
|:---|:---|:---|
| `GET` | `/` | Root welcome message |
| `GET` | `/status/surabaya` | Data terkini + ISPU + status anomali |
| `GET` | `/history/surabaya` | Data historis (filter date & parameter) |
| `GET` | `/predict/surabaya` | Prediksi 3 jam ke depan |
| `GET` | `/anomaly/surabaya` | Status anomali per parameter |
| `GET` | `/retrain/status` | Status scheduler & next run |
| `POST` | `/retrain` | Manual trigger retraining model |

> 📖 **Interactive API Docs:** `http://localhost:8000/docs`

---

## 📄 Lisensi

**MIT License** — Silakan digunakan, dimodifikasi, dan didistribusikan dengan mencantumkan atribusi kepada **Kelompok Aeris - PENS 2026**.

---

## 🙏 Ucapan Terima Kasih

- **Open-Meteo API** — Data kualitas udara gratis dan real-time
- **PyCaret** — AutoML untuk perbandingan 15 model
- **FastAPI** — Backend framework modern
- **React + Vite + Recharts** — Frontend dashboard interaktif
- **MLflow** — Experiment tracking & model versioning
- **Railway** — Platform deployment cloud
- **Docker** — Containerisasi
- **Dosen Pembimbing** — Bimbingan selama pengerjaan capstone

---

**Dibangun dengan ❤️ oleh Kelompok Aeris**
*D4 Sains Data Terapan — Politeknik Elektronika Negeri Surabaya (PENS)*
*Tahun Akademik 2025/2026*

---

> *"Udara Bersih, Masa Depan Cerah — Deteksi Dini untuk Langkah Cerdas"*