import pytest
import pandas as pd
import numpy as np
import os
from pycaret.regression import load_model

POLUTAN = ["pm25", "pm10", "co", "no2", "o3"]
SEGMEN = ["PAGI", "SIANG", "SORE_MALAM"]

class TestModelFiles:
    """Test keberadaan file model"""
    
    def test_all_models_exist(self):
        """Test bahwa semua 15 model tersimpan"""
        missing_models = []
        
        for pol in POLUTAN:
            for seg in SEGMEN:
                path = f"models/{pol}_{seg.lower()}_best.pkl"
                if not os.path.exists(path):
                    missing_models.append(path)
        
        assert len(missing_models) == 0, f"Missing models: {missing_models}"
    
    def test_model_files_not_empty(self):
        """Test bahwa file model tidak kosong"""
        for pol in POLUTAN:
            for seg in SEGMEN:
                path = f"models/{pol}_{seg.lower()}_best.pkl"
                if os.path.exists(path):
                    size = os.path.getsize(path)
                    assert size > 1000, f"Model {path} is too small ({size} bytes)"
    
    def test_scaler_exists(self):
        """Test bahwa scaler tersimpan"""
        assert os.path.exists("models/standard_scaler.pkl"), "Scaler not found"


class TestModelLoading:
    """Test loading model"""
    
    def test_can_load_all_models(self):
        """Test bahwa semua model bisa di-load"""
        failed_models = []
        
        for pol in POLUTAN:
            for seg in SEGMEN:
                path = f"models/{pol}_{seg.lower()}_best"
                try:
                    model = load_model(path, verbose=False)
                    assert model is not None
                except Exception as e:
                    failed_models.append(f"{path}: {e}")
        
        assert len(failed_models) == 0, f"Failed to load: {failed_models}"
    
    def test_model_has_predict_method(self):
        """Test bahwa model memiliki method predict"""
        model = load_model("models/pm25_pagi_best", verbose=False)
        assert hasattr(model, 'predict')
        assert callable(getattr(model, 'predict'))


class TestPrediction:
    """Test prediksi model"""
    
    def test_prediction_returns_number(self):
        """Test bahwa prediksi mengembalikan angka"""
        # Ini contoh, sesuaikan dengan fitur yang ada
        pass
        
    def test_co_log_transform(self):
        """Test log transform untuk CO"""
        # Test bahwa CO pakai log1p
        pass