import pandas as pd
from sklearn.ensemble import IsolationForest
import mlflow
import mlflow.sklearn
import joblib
import os

# Menyesuaikan dengan nama kolom dari output prapemrosesan Linda (huruf kecil)
POLLUTANTS = ['pm25', 'pm10', 'co', 'no2', 'o3']

def train_isolation_forest(df: pd.DataFrame, contamination_rate: float = 0.05):
    """Train Isolation Forest per polutan dan log ke MLflow."""
    mlflow.set_experiment("Aeris_Isolation_Forest")
    
    os.makedirs("models", exist_ok=True)
    
    with mlflow.start_run():
        mlflow.log_param("contamination_rate", contamination_rate)
        
        models = {}
        for param in POLLUTANTS:
            if param in df.columns:
                X = df[[param]].dropna()
                
                # Inisialisasi dan train model
                model = IsolationForest(contamination=contamination_rate, random_state=42)
                model.fit(X)
                
                # Prediksi untuk melihat hasil training
                preds = model.predict(X)
                anomaly_count = list(preds).count(-1)
                
                mlflow.log_metric(f"{param}_anomalies_found", anomaly_count)
                
                # Simpan model per polutan
                model_path = f"models/iforest_{param}.pkl"
                joblib.dump(model, model_path)
                models[param] = model
                
        mlflow.sklearn.log_model(models, "isolation_forest_models")
        print("✅ Model Isolation Forest berhasil dilatih dan dicatat di MLflow.")

def predict_anomaly(current_data: dict) -> dict:
    """Prediksi anomali per polutan untuk endpoint API."""
    results = {}
    for param in POLLUTANTS:
        model_path = f"models/iforest_{param}.pkl"
        if os.path.exists(model_path) and param in current_data:
            model = joblib.load(model_path)
            # Konversi dictionary ke DataFrame agar sesuai dengan skema saat training
            val = pd.DataFrame([{param: current_data[param]}])
            
            pred = model.predict(val)[0]
            score = model.decision_function(val)[0]
            
            results[param] = {
                "status_anomali": bool(pred == -1),
                "skor": float(score)
            }
    return results
# Tambahkan ini di baris paling bawah src/models/anomaly.py

if __name__ == "__main__":
    print("Mulai membaca data processed...")
    # Baca data dari output notebook Linda
    file_path = "data/processed/surabaya_processed.csv"
    
    if os.path.exists(file_path):
        df_processed = pd.read_csv(file_path)
        print(f"Data berhasil dimuat dengan {len(df_processed)} baris. Memulai training...")
        
        # Panggil fungsi training
        train_isolation_forest(df_processed, contamination_rate=0.05)
    else:
        print(f"File tidak ditemukan di path: {file_path}. Pastikan kamu menjalankan script dari root folder proyek.")