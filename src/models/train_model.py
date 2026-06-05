"""
train_model.py – Script standalone untuk training ulang 15 model PyCaret
Kelompok Aeris | PENS 2026

Cara pakai:
    python src/models/train_model.py
    python src/models/train_model.py --polutan pm25 --segmen PAGI
"""

import os
import sys
import argparse
import pandas as pd
import numpy as np
import mlflow
import warnings
warnings.filterwarnings("ignore")

from pycaret.regression import setup, compare_models, pull, tune_model, save_model

# Tambahkan root path ke sys.path
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if ROOT not in sys.path:
    sys.path.insert(0, ROOT)

from src.utils.logger import logger
from src.utils.config_loader import config

# Allow MLflow file store
os.environ["MLFLOW_ALLOW_FILE_STORE"] = "true"

# Load dari config
POLUTAN = config.get_polutans()
SEGMEN = config.get_segments()
LAG_WINDOWS = config.get_lag_windows()

# Build BASE_FEATURES dari config
BASE_FEATURES = config.get("features.time_features", []) + config.get("features.meteo_features", [])
for p in POLUTAN:
    for lag in LAG_WINDOWS:
        BASE_FEATURES.append(f"{p}_lag_{lag}h")
    for roll_name, window in config.get("features.rolling_windows", {}).items():
        BASE_FEATURES.append(f"{p}_{roll_name}")
    BASE_FEATURES.append(f"{p}_diff_1h")
    BASE_FEATURES.append(f"{p}_pct_change_1h")

# Model config
CV_FOLD = config.get("model.cv_fold", 5)
FOLD_STRATEGY = config.get("model.fold_strategy", "timeseries")
SESSION_ID = config.get("model.session_id", 42)
SORT_METRIC = config.get("model.sort_metric", "MAE")
OPTIMIZE_METRIC = config.get("model.optimize_metric", "MAE")


def train_single(df, polutan, segmen):
    """Train satu kombinasi polutan x segmen."""
    combo_key = f"{polutan}_{segmen.lower()}"
    model_path = f"models/{combo_key}_best"

    logger.info(f"Training: {combo_key.upper()}")

    data_seg = df[df["time_segment"] == segmen].copy()
    feat_avail = [
        c for c in BASE_FEATURES
        if c in data_seg.columns
        and c != polutan
        and not c.startswith(f"{polutan}_")
    ]
    df_model = data_seg[feat_avail + [polutan]].dropna()

    # Log-transform CO (sesuai config)
    if polutan == "co" and config.get("model.co_log_transform", True):
        df_model = df_model.copy()
        df_model["co"] = np.log1p(df_model["co"])
        logger.info("  [INFO] CO di-log-transform")

    logger.info(f"  Data: {df_model.shape[0]:,} baris x {len(feat_avail)} fitur")

    # PyCaret Setup
    exp = setup(
        data=df_model,
        target=polutan,
        fold=CV_FOLD,
        fold_strategy=FOLD_STRATEGY,
        fold_shuffle=False,
        data_split_shuffle=False,
        session_id=SESSION_ID,
        verbose=False,
        html=False,
        log_experiment=False
    )
    
    top3 = compare_models(n_select=config.get("model.n_select", 3), 
                          sort=SORT_METRIC, 
                          verbose=False)
    best_model = top3[0] if isinstance(top3, list) else top3
    best_name = type(best_model).__name__

    compare_df = pull()
    best_row = compare_df.iloc[0]
    mae_val = round(float(best_row.get("MAE", 0)), 4)
    rmse_val = round(float(best_row.get("RMSE", 0)), 4)
    r2_val = round(float(best_row.get("R2", 0)), 4)

    tuned = tune_model(best_model, optimize=OPTIMIZE_METRIC, 
                       n_iter=config.get("model.n_iter_tune", 50), 
                       verbose=False)
    tuned_df = pull()
    tuned_row = tuned_df.iloc[0] if len(tuned_df) > 0 else best_row
    mae_tuned = round(float(tuned_row.get("MAE", mae_val)), 4)

    # Pilih model terbaik
    final_model = best_model if mae_tuned > mae_val else tuned
    mae_final = mae_val if mae_tuned > mae_val else mae_tuned

    save_model(final_model, model_path)
    logger.info(f"  Model: {best_name} | MAE={mae_final:.4f} | R2={r2_val:.4f}")
    logger.info(f"  Disimpan: {model_path}.pkl")

    # Log ke MLflow
    with mlflow.start_run(run_name=f"retrain_{combo_key}"):
        mlflow.log_params({"polutan": polutan, "segmen": segmen,
                           "model_name": best_name})
        mlflow.log_metrics({"mae_final": mae_final, "r2": r2_val})
        mlflow.log_artifact(f"{model_path}.pkl")

    return {"polutan": polutan, "segmen": segmen,
            "model": best_name, "mae": mae_final, "r2": r2_val}


def train_all():
    """Train ulang semua 15 kombinasi model."""
    logger.info("=" * 55)
    logger.info("RETRAINING 15 MODEL")
    logger.info("=" * 55)

    data_path = config.get("data.processed_path", "data/processed/surabaya_processed.csv")
    df = pd.read_csv(data_path, parse_dates=["time"])
    
    mlflow.set_tracking_uri(config.get("mlflow.tracking_uri", "sqlite:///mlflow.db"))
    mlflow.set_experiment(config.get("mlflow.experiment_name", "aeris-air-quality-retrain"))

    rekap = []
    for segmen in SEGMEN:
        for polutan in POLUTAN:
            result = train_single(df, polutan, segmen)
            rekap.append(result)

    logger.info("\n" + "=" * 55)
    logger.info("RETRAINING SELESAI!")
    logger.info("=" * 55)

    df_rekap = pd.DataFrame(rekap)
    df_rekap.to_csv("reports/rekap_retrain.csv", index=False)
    logger.info(f"Rekap disimpan -> reports/rekap_retrain.csv")
    return df_rekap


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train ulang model PyCaret")
    parser.add_argument("--polutan", type=str, default=None,
                        choices=POLUTAN, help="Polutan tertentu")
    parser.add_argument("--segmen", type=str, default=None,
                        choices=SEGMEN, help="Segmen tertentu")
    args = parser.parse_args()

    if args.polutan and args.segmen:
        data_path = config.get("data.processed_path", "data/processed/surabaya_processed.csv")
        df = pd.read_csv(data_path, parse_dates=["time"])
        train_single(df, args.polutan, args.segmen)
    else:
        train_all()