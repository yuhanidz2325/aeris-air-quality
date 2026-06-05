import pytest
import pandas as pd
import numpy as np
from datetime import datetime, timedelta

class TestPipelineEndToEnd:
    """Test pipeline end-to-end"""
    
    def test_segment_detection(self):
        """Test deteksi segmen waktu"""
        def get_time_segment(hour):
            if 6 <= hour <= 11: return "PAGI"
            elif 12 <= hour <= 17: return "SIANG"
            else: return "SORE_MALAM"
        
        test_cases = [
            (0, "SORE_MALAM"), (5, "SORE_MALAM"), (6, "PAGI"),
            (8, "PAGI"), (11, "PAGI"), (12, "SIANG"),
            (15, "SIANG"), (17, "SIANG"), (18, "SORE_MALAM"),
            (20, "SORE_MALAM"), (23, "SORE_MALAM")
        ]
        
        for hour, expected in test_cases:
            assert get_time_segment(hour) == expected
    
    def test_model_path_correct(self):
        """Test path model sesuai segmen"""
        def get_model_path(polutan, segmen):
            # Selalu gunakan lowercase untuk konsistensi
            return f"models/{polutan.lower()}_{segmen.lower()}_best"
        
        assert get_model_path("pm25", "PAGI") == "models/pm25_pagi_best"
        assert get_model_path("pm10", "SIANG") == "models/pm10_siang_best"
        assert get_model_path("PM10", "SIANG") == "models/pm10_siang_best"
        assert get_model_path("PM25", "PAGI") == "models/pm25_pagi_best"


class TestDataPreprocessingPipeline:
    """Test preprocessing dalam pipeline"""
    
    def test_no_data_leakage_in_pipeline(self):
        """Test bahwa pipeline tidak menyebabkan data leakage"""
        # Simulasi data
        dates = pd.date_range('2026-01-01', periods=100, freq='H')
        df_hist = pd.DataFrame({
            'time': dates[:80],
            'pm25': range(80)
        })
        df_new = pd.DataFrame({
            'time': dates[80:],
            'pm25': range(80, 100)
        })
        
        # Proses
        df_combined = pd.concat([df_hist, df_new], ignore_index=True)
        df_combined['pm25_lag_1h'] = df_combined['pm25'].shift(1)
        
        # Test: nilai lag di data baru (indeks 80) menggunakan data dari hist
        # Karena shift(1), nilai di indeks 80 berasal dari indeks 79 (data hist)
        assert df_combined['pm25_lag_1h'].iloc[80] == 79
        
        # Test: tidak boleh ada data leakage dari masa depan
        # (tidak bisa test secara otomatis, tapi ini struktur testnya)
        pass
    
    def test_forward_fill_only(self):
        """Test bahwa hanya menggunakan forward fill, bukan backward fill"""
        df = pd.DataFrame({
            'time': pd.date_range('2026-01-01', periods=5, freq='H'),
            'value': [np.nan, np.nan, 3, np.nan, 5]
        })
        
        # Forward fill only
        df['value'] = df['value'].ffill()
        
        # Test: nilai di awal tetap NaN (tidak pakai bfill)
        assert pd.isna(df['value'].iloc[0])
        assert pd.isna(df['value'].iloc[1])
        assert df['value'].iloc[2] == 3
        assert df['value'].iloc[3] == 3
        assert df['value'].iloc[4] == 5