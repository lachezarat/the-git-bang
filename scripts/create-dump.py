import sqlite3
import os

db_path = 'server/db/repositories.db'
dump_path = 'repositories_dump.sql'

try:
    conn = sqlite3.connect(db_path)
    with open(dump_path, 'w') as f:
        for line in conn.iterdump():
            f.write(f'{line}\n')
    conn.close()
    
    file_size = os.path.getsize(dump_path) / (1024 * 1024)
    print(f'✅ SQL dump created: {dump_path}')
    print(f'📦 File size: {file_size:.2f} MB')
except Exception as e:
    print(f'❌ Error: {e}')
    exit(1)
