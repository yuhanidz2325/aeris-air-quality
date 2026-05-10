# Handover Doc – Minggu 2 | Linda Anggara Wati

**Tanggal:** 10 May 2026  
**Proyek:** Sistem Deteksi Anomali Kualitas Udara – Kelompok Aeris PENS 2026  

---

## Output yang Dihasilkan

| File | Keterangan |
|---|---|
| `data/processed/surabaya_processed.csv` | Data final berfitur lengkap, siap untuk ML |
| `data/processed/surabaya_scaled.csv` | Data yang sudah di-StandardScaler |
| `models/standard_scaler.pkl` | Scaler tersimpan, dipakai saat inference |
| `reports/ispu_kategori_distribusi.png` | Distribusi kategori ISPU |
| `reports/ispu_per_segmen.png` | Boxplot ISPU per segmen waktu |

## Format Data Processed

- **Shape:** 3,072 baris × 69 kolom  
- **Timestamp kolom:** `time` (dtype: datetime64, timezone WIB)  
- **Total fitur engineered:** 69 kolom  

## Daftar Fitur

### Fitur Waktu
`hour`, `day_of_week`, `month`, `is_weekend`, `time_segment`

### Fitur Lag (× 5 polutan)
`[polutan]_lag_1h`, `[polutan]_lag_3h`, `[polutan]_lag_24h`

### Fitur Rolling (× 5 polutan)
`[polutan]_rolling_mean_3h`, `_mean_24h`, `_std_24h`, `_max_24h`

### Fitur Perubahan (× 5 polutan)
`[polutan]_diff_1h`, `[polutan]_pct_change_1h`

### Fitur ISPU
`ispu_pm25`, `ispu_pm10`, `ispu_co`, `ispu_no2`, `ispu_o3`, `ispu_final`, `ispu_category`, `ispu_color`

## Cara Jalankan Ulang

```bash
# Aktifkan venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows

# Jalankan notebook
jupyter notebook notebooks/02_preprocessing.ipynb
# Kernel → Restart & Run All
```

## Catatan untuk Tim

**→ Intan:** Tolong validasi nilai `ispu_category` di kolom output — pastikan cocok 
dengan tabel kategori ISPU KLHK (Baik/Sedang/Tidak Sehat/Sangat Tidak Sehat/Berbahaya).  

**→ Yuhanidz:** File CSV processed siap di-import ke PostgreSQL.  
Kolom `time` bisa langsung jadi primary key timestamp. 
Kolom `ispu_final` dan `ispu_category` sudah siap untuk endpoint `/ispu/surabaya`.
