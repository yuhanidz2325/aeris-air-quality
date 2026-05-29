# --------------------------------------------------------------------
# PENTING: Gunakan tombol TAB (bukan spasi) di awal baris setiap perintah
# --------------------------------------------------------------------

# Menjalankan Ingestion Service (Fetch data tiap 1 jam)
run-ingestion:
	python src/data/ingestion_service.py

# Menjalankan Flask API (Endpoint ISPU Surabaya)
run-api:
	python src/api/app.py

# Mengecek 5 data terbaru yang berhasil masuk ke Database
db-check:
	psql -U postgres -d aeris_air_quality -c "SELECT * FROM air_quality_raw ORDER BY timestamp DESC LIMIT 5;"

# Reset database menggunakan skema (Hati-hati: Menghapus data lama)
db-reset:
	psql -U postgres -d aeris_air_quality -f schema.sql

# Menjalankan fetch data historis (skrip Minggu 1)
fetch-historical:
	python src/data/fetch_data.py