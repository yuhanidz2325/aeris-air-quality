"""
Menjalankan semua notebook 01-06 secara berurutan
Proyek Capstone – Aeris Air Quality System
"""

import subprocess
import sys
import os

# Pindah ke root project
os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
print(f"Working directory: {os.getcwd()}")

# Nama file notebook yang benar (sesuai struktur baru)
notebooks = [
    "notebooks/01_Problem_Understanding_Data_Collection.ipynb",
    "notebooks/02_EDA.ipynb",
    "notebooks/03_Preprocessing_Feature_Engineering.ipynb",
    "notebooks/04_Regresi_Prediksi_PyCaret.ipynb",
    "notebooks/05_Deteksi_Anomali_Isolation_Forest.ipynb",
    "notebooks/06_Finalisasi_Slide.ipynb",
]

# Cek semua file ada
print("\n" + "="*60)
print("CHECKING NOTEBOOKS")
print("="*60)

notebooks_found = []
notebooks_missing = []

for nb in notebooks:
    if os.path.exists(nb):
        print(f"  ✅ {nb}")
        notebooks_found.append(nb)
    else:
        print(f"  ❌ {nb} NOT FOUND")
        notebooks_missing.append(nb)

if notebooks_missing:
    print(f"\n⚠️  Peringatan: {len(notebooks_missing)} notebook tidak ditemukan!")
    print("   Pastikan semua file .ipynb sudah ada di folder notebooks/")

print("\n" + "="*60)
print("STARTING BATCH EXECUTION")
print("="*60)
print(f"Total notebook: {len(notebooks_found)} dari {len(notebooks)}")
print()

# Jalankan notebook yang ditemukan
for i, nb in enumerate(notebooks_found, 1):
    print(f"\n{'='*60}")
    print(f"[{i}/{len(notebooks_found)}] Running: {os.path.basename(nb)}")
    print('='*60)
    
    try:
        result = subprocess.run([
            sys.executable, "-m", "jupyter", "nbconvert",
            "--to", "notebook", "--execute", nb,
            "--output", os.path.basename(nb),
            "--ExecutePreprocessor.timeout=3600"
        ], capture_output=False, text=True)
        
        if result.returncode == 0:
            print(f"✅ Selesai: {os.path.basename(nb)}")
        else:
            print(f"❌ Gagal: {os.path.basename(nb)}")
            print(f"   Error code: {result.returncode}")
            print("\n⚠️  Berhenti karena error. Cek notebook tersebut secara manual.")
            break
    except Exception as e:
        print(f"❌ Error saat menjalankan {nb}: {e}")
        break

print("\n" + "="*60)
print("PROSES SELESAI!")
print("="*60)

# Ringkasan
print(f"\n📊 Ringkasan:")
print(f"   Notebook berhasil dijalankan: {i if 'i' in locals() else 0}")
print(f"   Total notebook: {len(notebooks_found)}")
print("\n📌 Catatan:")
print("   - Pastikan semua dependency sudah terinstall (pycaret, mlflow, dll)")
print("   - Jika ada notebook yang gagal, jalankan secara manual di Jupyter")
print("   - Untuk melihat MLflow: mlflow ui --backend-store-uri sqlite:///mlflow.db")