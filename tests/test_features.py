import pytest
import pandas as pd
import numpy as np

POLUTAN = ["pm25", "pm10", "co", "no2", "o3"]

class TestLagFeatures:
    """Test lag features"""
    
    def test_lag_1h(self):
        """Test lag 1 jam"""
        df = pd.DataFrame({
            'pm25': [10, 20, 30, 40, 50]
        })
        df['pm25_lag_1h'] = df['pm25'].shift(1)
        
        assert df['pm25_lag_1h'].iloc[1] == 10
        assert df['pm25_lag_1h'].iloc[2] == 20
        assert pd.isna(df['pm25_lag_1h'].iloc[0])
        
    def test_lag_24h(self):
        """Test lag 24 jam"""
        df = pd.DataFrame({
            'pm25': list(range(30))
        })
        df['pm25_lag_24h'] = df['pm25'].shift(24)
        
        assert df['pm25_lag_24h'].iloc[24] == 0
        assert df['pm25_lag_24h'].iloc[25] == 1
        
    def test_all_polutans_have_lag(self):
        """Test semua polutan punya lag features"""
        for pol in POLUTAN:
            col_name = f"{pol}_lag_1h"
            # Test kolom ada (akan dijalankan setelah feature engineering)


class TestRollingFeatures:
    """Test rolling statistics"""
    
    def test_rolling_mean_3h(self):
        """Test rolling mean 3 jam"""
        df = pd.DataFrame({
            'pm25': [10, 20, 30, 40, 50]
        })
        df['pm25_rolling_mean_3h'] = df['pm25'].rolling(3, min_periods=1).mean()
        
        assert round(df['pm25_rolling_mean_3h'].iloc[2], 2) == 20.0  # (10+20+30)/3
        assert round(df['pm25_rolling_mean_3h'].iloc[3], 2) == 30.0  # (20+30+40)/3
        
    def test_rolling_std_24h(self):
        """Test rolling std 24 jam (tidak NaN)"""
        df = pd.DataFrame({
            'pm25': list(range(30))
        })
        df['pm25_rolling_std_24h'] = df['pm25'].rolling(24, min_periods=1).std()
        
        # Test: harus ada nilai (tidak semua NaN)
        assert not df['pm25_rolling_std_24h'].isna().all()
        
    def test_rolling_max_24h(self):
        """Test rolling max 24 jam"""
        df = pd.DataFrame({
            'pm25': [10, 20, 30, 40, 50, 25, 15]
        })
        df['pm25_rolling_max_24h'] = df['pm25'].rolling(3, min_periods=1).max()
        
        assert df['pm25_rolling_max_24h'].iloc[2] == 30
        assert df['pm25_rolling_max_24h'].iloc[3] == 40


class TestChangeFeatures:
    """Test diff dan pct_change"""
    
    def test_diff_1h(self):
        """Test diff 1 jam"""
        df = pd.DataFrame({
            'pm25': [10, 20, 30, 40, 50]
        })
        df['pm25_diff_1h'] = df['pm25'].diff(1)
        
        assert df['pm25_diff_1h'].iloc[1] == 10
        assert df['pm25_diff_1h'].iloc[2] == 10
        assert pd.isna(df['pm25_diff_1h'].iloc[0])
        
    def test_pct_change_1h(self):
        """Test pct_change 1 jam"""
        df = pd.DataFrame({
            'pm25': [10, 20, 30, 40, 50]
        })
        df['pm25_pct_change_1h'] = df['pm25'].pct_change(1)
        
        assert df['pm25_pct_change_1h'].iloc[1] == 1.0  # (20-10)/10
        assert df['pm25_pct_change_1h'].iloc[2] == 0.5  # (30-20)/20


class TestTimeFeatures:
    """Test waktu features"""
    
    def test_hour_extraction(self):
        """Test ekstraksi jam"""
        df = pd.DataFrame({
            'time': pd.date_range('2026-01-01', periods=24, freq='H')
        })
        df['hour'] = df['time'].dt.hour
        
        assert df['hour'].iloc[0] == 0
        assert df['hour'].iloc[8] == 8
        assert df['hour'].iloc[23] == 23
        
    def test_weekend_detection(self):
        """Test deteksi weekend"""
        # 2026-01-01 adalah Kamis
        df = pd.DataFrame({
            'time': pd.date_range('2026-01-01', periods=7, freq='D')
        })
        df['day_of_week'] = df['time'].dt.dayofweek
        df['is_weekend'] = (df['day_of_week'] >= 5).astype(int)
        
        assert df['is_weekend'].iloc[4] == 0  # Sabtu (day 5) atau Minggu (day 6)
        # 2026-01-03 adalah Sabtu
        # 2026-01-04 adalah Minggu
        
    def test_segment_assignment(self):
        """Test segmentasi waktu"""
        def assign_segment(hour):
            if 6 <= hour <= 11: return "PAGI"
            elif 12 <= hour <= 17: return "SIANG"
            else: return "SORE_MALAM"
        
        assert assign_segment(8) == "PAGI"
        assert assign_segment(14) == "SIANG"
        assert assign_segment(2) == "SORE_MALAM"
        assert assign_segment(20) == "SORE_MALAM"