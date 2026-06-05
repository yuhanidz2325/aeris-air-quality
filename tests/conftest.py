import pytest
import pandas as pd
import numpy as np
from datetime import datetime, timedelta

@pytest.fixture
def sample_data():
    """Sample data untuk testing"""
    dates = pd.date_range('2026-01-01', periods=100, freq='H')
    df = pd.DataFrame({
        'time': dates,
        'pm25': np.random.randint(0, 150, 100),
        'pm10': np.random.randint(0, 200, 100),
        'co': np.random.randint(0, 50, 100),
        'no2': np.random.randint(0, 100, 100),
        'o3': np.random.randint(0, 120, 100),
        'temperature_2m': np.random.randint(20, 35, 100),
        'relative_humidity': np.random.randint(40, 90, 100),
        'wind_speed_10m': np.random.randint(0, 20, 100),
        'wind_direction_10m': np.random.randint(0, 360, 100),
        'precipitation': np.random.uniform(0, 10, 100)
    })
    return df

@pytest.fixture
def sample_train_test_data():
    """Sample train test split data"""
    dates = pd.date_range('2026-01-01', periods=100, freq='H')
    df = pd.DataFrame({
        'time': dates,
        'value': range(100)
    })
    split_idx = 80
    train = df.iloc[:split_idx].copy()
    test = df.iloc[split_idx:].copy()
    return train, test