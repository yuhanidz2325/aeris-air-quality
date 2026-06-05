# --------------------------------------------------------------------
# PENTING: Gunakan tombol TAB (bukan spasi) di awal baris setiap perintah
# --------------------------------------------------------------------

# Menjalankan semua services (API + Frontend)
run-all:
	@echo "🚀 Menjalankan API dan Frontend..."
	@Start-Process powershell -ArgumentList "uvicorn src.api.main:app --reload" -WindowStyle Normal
	@Start-Process powershell -ArgumentList "cd frontend; npm run dev" -WindowStyle Normal
	@echo "✅ API: http://localhost:8000"
	@echo "✅ Frontend: http://localhost:5173"

# Menjalankan API FastAPI
run-api:
	uvicorn src.api.main:app --reload

# Menjalankan Ingestion Service (Fetch data tiap 1 jam)
run-ingestion:
	python src/data/ingestion_service.py

# Menjalankan Frontend saja
run-frontend:
	cd frontend && npm run dev

# Mengecek 5 data terbaru yang berhasil masuk ke Database
db-check:
	psql -U aeris_user -d aeris_db -c "SELECT * FROM air_quality_raw ORDER BY timestamp DESC LIMIT 5;"

# Reset database menggunakan skema (Hati-hati: Menghapus data lama)
db-reset:
	psql -U aeris_user -d aeris_db -f schema.sql

# Menjalankan fetch data historis
fetch-historical:
	python src/data/fetch_data.py

# Install semua dependencies
install:
	pip install -r requirements.txt
	cd frontend && npm install

# Membersihkan cache
clean:
	rm -rf __pycache__ src/**/__pycache__
	rm -rf frontend/node_modules frontend/dist

# Docker compose up
docker-up:
	docker-compose up --build

# Docker compose down
docker-down:
	docker-compose down