"""
Logger configuration untuk Aeris Air Quality System
"""

import logging
import sys
from pathlib import Path
from datetime import datetime

# Buat folder logs jika belum ada
Path("logs").mkdir(exist_ok=True)

# Nama file log dengan tanggal
log_filename = f"logs/aeris_{datetime.now().strftime('%Y%m%d')}.log"

def setup_logger(name="aeris", log_level=logging.INFO):
    """
    Setup logger dengan console dan file handler
    
    Args:
        name: Nama logger
        log_level: Level logging (DEBUG, INFO, WARNING, ERROR, CRITICAL)
    
    Returns:
        logging.Logger: Configured logger instance
    """
    
    # Formatter
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(filename)s:%(lineno)d - %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    
    # Console handler (untuk melihat di terminal)
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(formatter)
    console_handler.setLevel(log_level)
    
    # File handler (untuk menyimpan ke file)
    file_handler = logging.FileHandler(log_filename, encoding='utf-8')
    file_handler.setFormatter(formatter)
    file_handler.setLevel(log_level)
    
    # Setup logger
    logger = logging.getLogger(name)
    logger.setLevel(log_level)
    
    # Hapus handler lama jika ada (biar tidak double)
    if logger.hasHandlers():
        logger.handlers.clear()
    
    logger.addHandler(console_handler)
    logger.addHandler(file_handler)
    
    return logger


# Logger default untuk seluruh aplikasi
logger = setup_logger()

# Contoh penggunaan
if __name__ == "__main__":
    logger.debug("Debug message - untuk development")
    logger.info("Info message - untuk tracking normal")
    logger.warning("Warning message - perhatian tapi tidak error")
    logger.error("Error message - ada yang salah")
    logger.critical("Critical message - sistem bermasalah")