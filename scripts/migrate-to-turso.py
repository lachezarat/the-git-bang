import sqlite3
import os
import sys
import subprocess
import json
from pathlib import Path

# Load environment variables
env_path = Path(__file__).parent.parent / '.env'
if env_path.exists():
    with open(env_path) as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                key, value = line.split('=', 1)
                os.environ[key] = value.strip('"')

def migrate_to_turso():
    print("🚀 Starting migration to Turso...")

    # Connect to local SQLite
    db_path = 'server/db/repositories.db'
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    print("✅ Connected to local SQLite database")

    # Get all repositories
    cursor.execute("SELECT * FROM repositories")
    repositories = cursor.fetchall()
    columns = [desc[0] for desc in cursor.description]
    print(f"📦 Found {len(repositories)} repositories to migrate")

    # Process in batches
    BATCH_SIZE = 100
    total = len(repositories)

    for i in range(0, total, BATCH_SIZE):
        batch = repositories[i:i + BATCH_SIZE]

        # Build multi-row INSERT statement
        values_list = []
        for repo in batch:
            # Escape single quotes for SQL
            escaped_values = []
            for val in repo:
                if val is None:
                    escaped_values.append('NULL')
                elif isinstance(val, str):
                    # Escape single quotes
                    escaped = val.replace("'", "''")
                    escaped_values.append(f"'{escaped}'")
                else:
                    escaped_values.append(str(val))
            values_list.append(f"({', '.join(escaped_values)})")

        sql = f"""INSERT OR REPLACE INTO repositories ({', '.join(columns)})
                  VALUES {', '.join(values_list)};"""

        # Execute via turso db shell
        result = subprocess.run(
            ['turso', 'db', 'shell', 'the-git-bang'],
            input=sql,
            text=True,
            capture_output=True
        )

        if result.returncode != 0:
            print(f"\n❌ Error executing batch {i//BATCH_SIZE + 1}:")
            print(result.stderr)
            sys.exit(1)

        processed = min(i + BATCH_SIZE, total)
        percentage = (processed / total) * 100
        print(f"\r⏳ Progress: {processed}/{total} ({percentage:.1f}%)", end='', flush=True)

    print("\n✅ Migration completed successfully!")

    # Verify count
    result = subprocess.run(
        ['turso', 'db', 'shell', 'the-git-bang'],
        input='SELECT COUNT(*) FROM repositories;',
        text=True,
        capture_output=True
    )

    if result.returncode == 0:
        # Parse the output to get the count
        lines = result.stdout.strip().split('\n')
        if len(lines) > 0:
            count = lines[-1].strip()
            print(f"📊 Total repositories in Turso: {count}")

    conn.close()

if __name__ == '__main__':
    try:
        migrate_to_turso()
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        sys.exit(1)
