import pytest
import pandas as pd
import numpy as np

class TestMissingValues:
    """Test handling missing values"""
    
    def test_forward_fill_no_future_data(self):
        """Test bahwa forward fill tidak pakai data masa depan"""
        df = pd.DataFrame({
            'time': pd.date_range('2026-01-01', periods=10, freq='H'),
            'pm25': [1, 2, np.nan, 4, 5, np.nan, 7, 8, 9, 10]
        })
        
        # Split (simulasi)
        split_idx = 8
        train = df.iloc[:split_idx].copy()
        test = df.iloc[split_idx:].copy()
        
        # Forward fill
        train['pm25'] = train['pm25'].ffill()
        test['pm25'] = test['pm25'].ffill()
        
        # Test: tidak boleh ada NaN
        assert not train['pm25'].isna().any()
        assert not test['pm25'].isna().any()
        
        # Test: nilai yang di-fill hanya dari masa lalu
        assert train['pm25'].iloc[2] == 2  # dari baris sebelumnya
        
    def test_no_backward_fill(self):
        """Test bahwa tidak menggunakan bfill (data leakage)"""
        # Gunakan data dengan NaN di awal (bukan di tengah)
        df = pd.DataFrame({
            'time': pd.date_range('2026-01-01', periods=5, freq='H'),
            'value': [np.nan, np.nan, 3, np.nan, 5]  # NaN di awal
        })
        
        # Hanya pakai ffill (tanpa bfill)
        df['value'] = df['value'].ffill()
        
        # Test: nilai di awal tetap NaN (tidak terisi dari data setelahnya)
        assert pd.isna(df['value'].iloc[0])  # Tetap NaN
        assert pd.isna(df['value'].iloc[1])  # Tetap NaN
        assert df['value'].iloc[2] == 3
        assert df['value'].iloc[3] == 3  # Terisi dari baris 2
        assert df['value'].iloc[4] == 5
        
    def test_first_valid_fill(self):
        """Test pengisian NaN di awal data"""
        df = pd.DataFrame({
            'time': pd.date_range('2026-01-01', periods=5, freq='H'),
            'value': [np.nan, np.nan, 3, 4, 5]
        })
        
        # Forward fill
        df['value'] = df['value'].ffill()
        
        # Isi awal dengan first valid (simulasi real-time)
        first_valid = df['value'].first_valid_index()
        if first_valid is not None:
            first_val = df.loc[first_valid, 'value']
            df['value'] = df['value'].fillna(first_val)
        
        # Test: semua NaN harus terisi
        assert not df['value'].isna().any()
        assert df['value'].iloc[0] == 3
        assert df['value'].iloc[1] == 3


class TestDataSplit:
    """Test data splitting"""
    
    def test_time_series_split_order(self):
        """Test bahwa split menjaga urutan waktu"""
        dates = pd.date_range('2026-01-01', periods=100, freq='H')
        df = pd.DataFrame({'time': dates, 'value': range(100)})
        
        split_idx = 80
        train = df.iloc[:split_idx]
        test = df.iloc[split_idx:]
        
        # Test: semua train harus lebih awal dari test
        assert train['time'].max() < test['time'].min()
        
    def test_no_shuffle_in_split(self):
        """Test bahwa tidak ada shuffling (urutan tetap)"""
        dates = pd.date_range('2026-01-01', periods=100, freq='H')
        df = pd.DataFrame({'time': dates, 'value': range(100)})
        
        split_idx = 80
        train = df.iloc[:split_idx]
        
        # Test: urutan harus tetap
        assert train['value'].iloc[0] == 0
        assert train['value'].iloc[-1] == 79


class TestDuplicates:
    """Test duplicate handling"""
    
    def test_remove_duplicate_timestamps(self):
        """Test penghapusan duplikat timestamp"""
        df = pd.DataFrame({
            'time': ['2026-01-01 00:00', '2026-01-01 00:00', '2026-01-01 01:00'],
            'value': [1, 2, 3]
        })
        df['time'] = pd.to_datetime(df['time'])
        
        df = df.drop_duplicates(subset=['time'], keep='first')
        
        assert len(df) == 2
        assert df['value'].iloc[0] == 1