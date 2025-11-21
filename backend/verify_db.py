import sqlite3
import os

db_path = 'c:/journal/backend/trading_journal.db'
if not os.path.exists(db_path):
    print(f"Database file not found at {db_path}")
    exit(1)

try:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = cursor.fetchall()
    print("Tables found:", tables)
    conn.close()
except Exception as e:
    print(f"Error: {e}")
