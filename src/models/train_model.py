"""
train_model.py – Script standalone untuk training ulang 15 model PyCaret
Kelompok Aeris | PENS 2026

Cara pakai:
    python src/models/train_model.py
    python src/models/train_model.py --polutan pm25 --segmen PAGI
"""

import os
import argparse
import pandas as pd
import numpy as np
import mlflow
import warnings
warnings.filterwarnings("ignore")

from pycaret.regression import setup, compare_models, pull, tune_model, save_model

# Allow MLflow file store (untuk menghindari error)
os.environ["MLFLOW_ALLOW_FILE_STORE"] = "true"

# ── Konstanta ────────────────────────────────────────────────────
POLUTAN = ["pm25", "pm10", "co", "no2", "o3"]
SEGMEN  = ["PAGI", "SIANG", "SORE_MALAM"]

BASE_FEATURES = [
    "hour", "day_of_week", "month", "is_weekend",
    "temperature_2m", "relative_humidity",
    "wind_speed_10m", "wind_direction_10m", "precipitation",
]
for p in POLUTAN:
    for lag in [1, 3, 24]:
        BASE_FEATURES.append(f"{p}_lag_{lag}h")
    for roll in ["rolling_mean_3h", "rolling_mean_24h",
                 "rolling_std_24h", "rolling_max_24h"]:
        BASE_FEATURES.append(f"{p}_{roll}")
    BASE_FEATURES.append(f"{p}_diff_1h")
    BASE_FEATURES.append(f"{p}_pct_change_1h")


def train_single(df, polutan, segmen):
    """Train satu kombinasi polutan x segmen."""
    combo_key  = f"{polutan}_{segmen.lower()}"
    model_path = f"models/{combo_key}_best"

    print(f"\nTraining: {combo_key.upper()}")

    data_seg   = df[df["time_segment"] == segmen].copy()
    feat_avail = [
        c for c in BASE_FEATURES
        if c in data_seg.columns
        and c != polutan
        and not c.startswith(f"{polutan}_")
    ]
    df_model = data_seg[feat_avail + [polutan]].dropna()

    # Log-transform CO
    if polutan == "co":
        df_model = df_model.copy()
        df_model["co"] = np.log1p(df_model["co"])
        print("  [INFO] CO di-log-transform")

    print(f"  Data: {df_model.shape[0]:,} baris x {len(feat_avail)} fitur")

    # PyCaret Setup dengan TIME SERIES VALIDATION
    exp = setup(
        data=df_model, 
        target=polutan, 
        fold=5,
        fold_strategy='timeseries',
        fold_shuffle=False,
        data_split_shuffle=False,
        session_id=42, 
        verbose=False, 
        html=False,
        log_experiment=False
    )
    
    top3       = compare_models(n_select=3, sort="MAE", verbose=False)
    best_model = top3[0] if isinstance(top3, list) else top3
    best_name  = type(best_model).__name__

    compare_df = pull()
    best_row   = compare_df.iloc[0]
    mae_val    = round(float(best_row.get("MAE", 0)), 4)
    rmse_val   = round(float(best_row.get("RMSE", 0)), 4)
    r2_val     = round(float(best_row.get("R2", 0)), 4)

    tuned      = tune_model(best_model, optimize="MAE", verbose=False)
    tuned_df   = pull()
    tuned_row  = tuned_df.iloc[0] if len(tuned_df) > 0 else best_row
    mae_tuned  = round(float(tuned_row.get("MAE", mae_val)), 4)

    # Pilih model terbaik
    final_model = best_model if mae_tuned > mae_val else tuned
    mae_final   = mae_val if mae_tuned > mae_val else mae_tuned

    save_model(final_model, model_path)
    print(f"  Model: {best_name} | MAE={mae_final:.4f} | R2={r2_val:.4f}")
    print(f"  Disimpan: {model_path}.pkl")

    # Log ke MLflow
    with mlflow.start_run(run_name=f"retrain_{combo_key}"):
        mlflow.log_params({"polutan": polutan, "segmen": segmen,
                           "model_name": best_name})
        mlflow.log_metrics({"mae_final": mae_final, "r2": r2_val})
        mlflow.log_artifact(f"{model_path}.pkl")

    return {"polutan": polutan, "segmen": segmen,
            "model": best_name, "mae": mae_final, "r2": r2_val}


def train_all(data_path="data/processed/surabaya_processed.csv"):
    """Train ulang semua 15 kombinasi model."""
    print("=" * 55)
    print("RETRAINING 15 MODEL")
    print("=" * 55)

    df = pd.read_csv(data_path, parse_dates=["time"])
    mlflow.set_tracking_uri("sqlite:///mlflow.db")
    mlflow.set_experiment("aeris-air-quality-retrain")

    rekap = []
    for segmen in SEGMEN:
        for polutan in POLUTAN:
            result = train_single(df, polutan, segmen)
            rekap.append(result)

    print("\n" + "=" * 55)
    print("RETRAINING SELESAI!")
    print("=" * 55)

    df_rekap = pd.DataFrame(rekap)
    df_rekap.to_csv("reports/rekap_retrain.csv", index=False)
    print(f"Rekap disimpan -> reports/rekap_retrain.csv")
    return df_rekap


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train ulang model PyCaret")
    parser.add_argument("--polutan", type=str, default=None,
                        choices=POLUTAN, help="Polutan tertentu")
    parser.add_argument("--segmen", type=str, default=None,
                        choices=SEGMEN, help="Segmen tertentu")
    args = parser.parse_args()

    df = pd.read_csv("data/processed/surabaya_processed.csv",
                     parse_dates=["time"])
    mlflow.set_tracking_uri("sqlite:///mlflow.db")
    mlflow.set_experiment("aeris-air-quality-retrain")

    if args.polutan and args.segmen:
        train_single(df, args.polutan, args.segmen)
    else:
        train_all()