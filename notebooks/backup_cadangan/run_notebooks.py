"""
Menjalankan semua notebook 1-5 secara berurutan
"""

import subprocess
import sys
import os

# Pindah ke root project
os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
print(f"Working directory: {os.getcwd()}")

# Nama file notebook yang benar
notebooks = [
    "notebooks/01_data_collection.ipynb",
    "notebooks/02_preprocessing.ipynb",
    "notebooks/03_pycaret_comparison.ipynb",
    "notebooks/04_pipeline_testing.ipynb",
    "notebooks/05_finalisasi.ipynb",
]

# Cek semua file ada
print("\nChecking notebooks:")
for nb in notebooks:
    if os.path.exists(nb):
        print(f"  ✅ {nb}")
    else:
        print(f"  ❌ {nb} NOT FOUND")

print("\n" + "="*60)
print("STARTING BATCH EXECUTION")
print("="*60)

for nb in notebooks:
    if os.path.exists(nb):
        print(f"\n{'='*60}")
        print(f"Running: {nb}")
        print('='*60)
        
        result = subprocess.run([
            sys.executable, "-m", "jupyter", "nbconvert",
            "--to", "notebook", "--execute", nb,
            "--output", os.path.basename(nb),
            "--ExecutePreprocessor.timeout=3600"
        ])
        
        if result.returncode == 0:
            print(f"✅ Selesai: {nb}")
        else:
            print(f"❌ Gagal: {nb}")
            print("Berhenti karena error. Cek notebook tersebut secara manual.")
            break
    else:
        print(f"⚠️ File tidak ditemukan: {nb}")

print("\n" + "="*60)
print("Proses selesai!")
print("="*60)