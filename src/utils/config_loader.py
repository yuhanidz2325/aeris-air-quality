"""
Configuration loader untuk Aeris Air Quality System
"""

import os
import yaml
from pathlib import Path

class Config:
    """Class untuk mengelola konfigurasi"""
    
    def __init__(self, config_path="config/config.yaml"):
        self.config_path = config_path
        self.config = self._load_config()
    
    def _load_config(self):
        """Load konfigurasi dari file YAML"""
        if not os.path.exists(self.config_path):
            raise FileNotFoundError(f"Config file not found: {self.config_path}")
        
        with open(self.config_path, 'r', encoding='utf-8') as f:
            config = yaml.safe_load(f)
        return config
    
    def get(self, key, default=None):
        """
        Get value from config using dot notation.
        Example: config.get("data.raw_path")
        """
        keys = key.split('.')
        value = self.config
        for k in keys:
            if isinstance(value, dict):
                value = value.get(k, default)
            else:
                return default
        return value
    
    def get_all(self):
        """Get all configuration"""
        return self.config
    
    def get_polutans(self):
        """Get list of polutans"""
        return self.get("features.polutan", ["pm25", "pm10", "co", "no2", "o3"])
    
    def get_segments(self):
        """Get list of segments"""
        return self.get("features.segmen", ["PAGI", "SIANG", "SORE_MALAM"])
    
    def get_lag_windows(self):
        """Get lag windows"""
        return self.get("features.lag_windows", [1, 3, 24])


# Singleton instance
config = Config()


if __name__ == "__main__":
    # Test config
    print("=" * 50)
    print("Testing Configuration Loader")
    print("=" * 50)
    print(f"Raw path: {config.get('data.raw_path')}")
    print(f"Polutans: {config.get_polutans()}")
    print(f"Segments: {config.get_segments()}")
    print(f"Lag windows: {config.get_lag_windows()}")
    print(f"CV fold: {config.get('model.cv_fold')}")
    print(f"Fold strategy: {config.get('model.fold_strategy')}")