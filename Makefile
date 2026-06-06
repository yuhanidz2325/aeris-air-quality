# ====================================================================
# MAKEFILE - Aeris Air Quality System
# ====================================================================
# PENTING: Gunakan tombol TAB (bukan spasi) di awal baris setiap perintah
# ====================================================================

# Variables - Load dari .env (jika ada)
ifneq (,$(wildcard ./.env))
    include .env
    export
endif

# Default variables (akan override oleh .env jika ada)
POSTGRES_USER ?= postgres
POSTGRES_DB ?= aeris_air_quality
POSTGRES_PASSWORD ?= 12345
DB_HOST ?= localhost

# ====================================================================
# RUN SERVICES
# ====================================================================

# Menjalankan semua services (API + Frontend) - Versi Windows
run-all:
	@echo "🚀 Menjalankan API dan Frontend..."
	@start cmd /c "python -m uvicorn src.api.main:app --reload"
	@timeout /t 2 > nul
	@start cmd /c "cd frontend && npm run dev"
	@echo "✅ API: http://localhost:8000"
	@echo "✅ Frontend: http://localhost:5173"
	@echo "⚠️  Tutup terminal masing-masing untuk berhenti"

# Menjalankan API FastAPI
run-api:
	python -m uvicorn src.api.main:app --reload

# Menjalankan API dengan host 0.0.0.0 (untuk akses dari luar)
run-api-public:
	python -m uvicorn src.api.main:app --host 0.0.0.0 --port 8000 --reload

# Menjalankan Ingestion Service (Fetch data tiap 1 jam)
run-ingestion:
	python src/data/ingestion_service.py

# Menjalankan Frontend saja
run-frontend:
	cd frontend && npm run dev

# ====================================================================
# DATABASE (sesuai dengan .env-mu)
# ====================================================================

# Mengecek 5 data terbaru yang berhasil masuk ke Database
db-check:
	psql -U $(POSTGRES_USER) -d $(POSTGRES_DB) -h $(DB_HOST) -c "SELECT * FROM air_quality_raw ORDER BY timestamp DESC LIMIT 5;"

# Reset database menggunakan skema (Hati-hati: Menghapus data lama)
db-reset:
	psql -U $(POSTGRES_USER) -d $(POSTGRES_DB) -h $(DB_HOST) -f database/schema.sql

# ====================================================================
# DATA FETCHING
# ====================================================================

# Menjalankan fetch data historis (pertama kali setup)
fetch-historical:
	python src/data/fetch_data.py

# Fetch data real-time sekarang
fetch-now:
	python -c "from src.data.ingestion_service import fetch_realtime_data; fetch_realtime_data()"

# ====================================================================
# MACHINE LEARNING
# ====================================================================

# Training semua 15 model
train:
	python src/models/train_model.py

# Training 1 model spesifik
# Usage: make train-one POLUTAN=pm25 SEGMEN=PAGI
train-one:
	python src/models/train_model.py --polutan $(POLUTAN) --segmen $(SEGMEN)

# Menjalankan unit testing
test:
	pytest tests/ -v

# Menjalankan testing dengan coverage
test-cov:
	pytest tests/ -v --cov=src --cov-report=html

# Menjalankan MLflow UI
mlflow-ui:
	mlflow ui --backend-store-uri sqlite:///mlflow.db

# ====================================================================
# INSTALLATION & CLEANUP
# ====================================================================

# Install semua dependencies
install:
	pip install -r requirements.txt
	cd frontend && npm install

# Install untuk development (include testing tools)
install-dev:
	pip install -r requirements.txt
	pip install pytest pytest-cov black flake8 isort
	cd frontend && npm install

# Format code dengan black
format:
	black src/ tests/

# Lint code dengan flake8
lint:
	flake8 src/ --max-line-length=100 --ignore=E203,W503

# Membersihkan cache
clean:
	rm -rf __pycache__ src/**/__pycache__ tests/__pycache__
	rm -rf frontend/node_modules frontend/dist
	rm -rf .pytest_cache .coverage htmlcov

# ====================================================================
# DOCKER
# ====================================================================

# Docker compose up (build & start)
docker-up:
	docker-compose up --build

# Docker compose up di background
docker-up-d:
	docker-compose up -d --build

# Docker compose down (stop & remove containers)
docker-down:
	docker-compose down

# Docker compose down + hapus volumes (reset database)
docker-down-v:
	docker-compose down -v

# ====================================================================
# HELP
# ====================================================================

help:
	@echo "=========================================="
	@echo "Aeris Air Quality System - Makefile Commands"
	@echo "=========================================="
	@echo ""
	@echo "RUN SERVICES:"
	@echo "  make run-all        - Jalankan API + Frontend"
	@echo "  make run-api        - Jalankan API saja"
	@echo "  make run-frontend   - Jalankan Frontend saja"
	@echo "  make run-ingestion  - Jalankan ingestion service"
	@echo ""
	@echo "DATABASE:"
	@echo "  make db-check       - Cek 5 data terbaru"
	@echo "  make db-reset       - Reset database"
	@echo ""
	@echo "MACHINE LEARNING:"
	@echo "  make train          - Training semua 15 model"
	@echo "  make train-one      - Training 1 model (POLUTAN=pm25 SEGMEN=PAGI)"
	@echo "  make test           - Jalankan unit tests"
	@echo "  make mlflow-ui      - Buka MLflow UI"
	@echo ""
	@echo "DOCKER:"
	@echo "  make docker-up      - Start Docker containers"
	@echo "  make docker-down    - Stop Docker containers"
	@echo ""
	@echo "OTHER:"
	@echo "  make install        - Install dependencies"
	@echo "  make clean          - Hapus cache"
	@echo "  make format         - Format code dengan black"
	@echo "=========================================="