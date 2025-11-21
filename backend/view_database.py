import sqlite3

db_path = 'trading_journal.db'

try:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Get all tables
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = cursor.fetchall()
    
    print("=" * 60)
    print(f"DATABASE: {db_path}")
    print("=" * 60)
    
    for table in tables:
        table_name = table[0]
        print(f"\n📊 TABLE: {table_name}")
        print("-" * 60)
        
        # Get table schema
        cursor.execute(f"PRAGMA table_info({table_name});")
        columns = cursor.fetchall()
        print("\nColumns:")
        for col in columns:
            print(f"  - {col[1]} ({col[2]})")
        
        # Get row count
        cursor.execute(f"SELECT COUNT(*) FROM {table_name};")
        count = cursor.fetchone()[0]
        print(f"\nRow count: {count}")
        
        # Show first 5 rows if any exist
        if count > 0:
            cursor.execute(f"SELECT * FROM {table_name} LIMIT 5")
            rows = cursor.fetchall()
            col_names = [desc[0] for desc in cursor.description]
            
            print(f"\nFirst {min(count, 5)} rows:")
            print("  " + " | ".join(col_names))
            print("  " + "-" * 50)
            for row in rows:
                print("  " + " | ".join(str(val) for val in row))
        
        print("\n" + "=" * 60)
    
    conn.close()
    print("\n✅ Database inspection complete!")
    
except Exception as e:
    print(f"❌ Error: {e}")
