import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

def get_db_connection():
    # 1. Coba ambil URL lengkap dari environment (Saat jalan di Railway)
    db_url = os.getenv("DATABASE_URL")
    
    if db_url:
        return psycopg2.connect(db_url)
        
    # 2. Fallback: Jika tidak ada, pakai cara lama (Saat jalan di laptop)
    return psycopg2.connect(
        host=os.getenv("DB_HOST"),
        port=int(os.getenv("DB_PORT", 5432)),
        database=os.getenv("DB_NAME"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD")
    )

def execute_query(query, params=None, fetch=False):
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute(query, params)
        if fetch:
            return cur.fetchall()
        conn.commit()
    except Exception as e:
        print(f"Error: {e}")
        conn.rollback()
    finally:
        cur.close()
        conn.close()