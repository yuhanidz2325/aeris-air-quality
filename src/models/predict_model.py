"""
predict_model.py – Script inferensi untuk prediksi polutan
Kelompok Aeris | PENS 2026

Cara pakai:
    from src.models.predict_model import PredictorAeris
    predictor = PredictorAeris()
    hasil = predictor.predict_current(df_input)
"""

import os
import pandas as pd
import numpy as np
from datetime import datetime
import warnings
warnings.filterwarnings("ignore")

from pycaret.regression import load_model, predict_model

POLUTAN = ["pm25", "pm10", "co", "no2", "o3"]

# HANYA FITUR YANG TERSEDIA (meteorologi tidak ada)
BASE_FEATURES = [
    "hour", "day_of_week", "month", "is_weekend",
]
for p in POLUTAN:
    for lag in [1, 3, 24]:
        BASE_FEATURES.append(f"{p}_lag_{lag}h")
    for roll in ["rolling_mean_3h", "rolling_mean_24h",
                 "rolling_std_24h", "rolling_max_24h"]:
        BASE_FEATURES.append(f"{p}_{roll}")
    BASE_FEATURES.append(f"{p}_diff_1h")
    BASE_FEATURES.append(f"{p}_pct_change_1h")


def get_time_segment(hour=None):
    """Deteksi segmen waktu berdasarkan jam."""
    if hour is None:
        hour = datetime.now().hour
    if 6 <= hour <= 11:    return "PAGI"
    elif 12 <= hour <= 17: return "SIANG"
    else:                  return "SORE_MALAM"


class PredictorAeris:
    """Class untuk inferensi model polutan udara."""

    def __init__(self, models_dir="models"):
        self.models_dir = models_dir
        self.models     = {}
        self._load_all_models()

    def _load_all_models(self):
        """Load semua 15 model ke memori."""
        SEGMEN = ["PAGI", "SIANG", "SORE_MALAM"]
        for seg in SEGMEN:
            for pol in POLUTAN:
                key  = f"{pol}_{seg.lower()}"
                path = os.path.join(self.models_dir, f"{key}_best")
                try:
                    self.models[key] = load_model(path, verbose=False)
                except Exception as e:
                    print(f"[WARN] Gagal load {path}: {e}")
        print(f"[INFO] {len(self.models)} model berhasil di-load")

    def predict_current(self, df_input, hour=None):
        """
        Prediksi semua polutan berdasarkan data input.

        Args:
            df_input: DataFrame dengan fitur input (1 baris)
            hour: jam override (opsional, default jam sekarang)

        Returns:
            dict: prediksi per polutan + segmen waktu
        """
        segmen = get_time_segment(hour)
        result = {
            "timestamp" : datetime.now().isoformat(),
            "segmen"    : segmen,
            "prediksi"  : {}
        }

        for pol in POLUTAN:
            key        = f"{pol}_{segmen.lower()}"
            feat_avail = [
                c for c in BASE_FEATURES
                if c in df_input.columns
                and c != pol
                and not c.startswith(f"{pol}_")
            ]

            if key not in self.models:
                result["prediksi"][pol] = None
                continue

            try:
                X = df_input[feat_avail].copy()

                # Log-transform CO sebelum prediksi
                if pol == "co" and "co" in X.columns:
                    X["co"] = np.log1p(X["co"])

                pred = predict_model(self.models[key],
                                     data=X, verbose=False)
                pred_val = float(pred["prediction_label"].values[0])

                # Inverse log-transform CO
                if pol == "co":
                    pred_val = float(np.expm1(pred_val))

                result["prediksi"][pol] = round(pred_val, 4)
            except Exception as e:
                print(f"[WARN] Gagal prediksi {pol}: {e}")
                result["prediksi"][pol] = None

        return result

    def predict_batch(self, df_batch):
        """
        Prediksi batch untuk banyak baris sekaligus.

        Args:
            df_batch: DataFrame dengan kolom hour + fitur input

        Returns:
            DataFrame: hasil prediksi semua baris
        """
        results = []
        for _, row in df_batch.iterrows():
            hour   = int(row["hour"]) if "hour" in row else None
            result = self.predict_current(
                pd.DataFrame([row]), hour=hour
            )
            row_result = {"timestamp": row.get("time", None),
                          "segmen": result["segmen"]}
            row_result.update({f"{p}_pred": result["prediksi"][p]
                               for p in POLUTAN})
            results.append(row_result)

        return pd.DataFrame(results)