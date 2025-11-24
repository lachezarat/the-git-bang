import sqlite3
import json
import os

db_path = os.path.join(os.path.dirname(__file__), '../server/db/repositories.db')
output_path = os.path.join(os.path.dirname(__file__), '../public/repositories_details.json')

try:
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM repositories")
    rows = cursor.fetchall()
    
    formatted = {}
    for row in rows:
        repo_dict = dict(row)
        repo_id = repo_dict['id']
        
        # Convert pipe-separated strings to arrays
        repo_dict['topics'] = repo_dict['topics'].split('|') if repo_dict.get('topics') else []
        repo_dict['languages'] = repo_dict['languages'].split('|') if repo_dict.get('languages') else []
        
        formatted[repo_id] = repo_dict
    
    with open(output_path, 'w') as f:
        json.dump(formatted, f, indent=2)
    
    file_size = os.path.getsize(output_path) / 1024
    print(f"✅ Exported {len(rows)} repositories to {output_path}")
    print(f"📦 File size: {file_size:.2f} KB")
    
    conn.close()
except Exception as error:
    print(f"❌ Error exporting database: {error}")
    exit(1)
