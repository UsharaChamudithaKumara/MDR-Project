import mysql.connector
import sys

# --- CONFIGURATION ---
# Local MySQL (Source)
SOURCE_DB = {
    'host': 'localhost',
    'port': 3306,
    'user': 'root',
    'password': 'root', # Update if your local MySQL has a password
    'database': 'mdr_system'
}

# Docker MySQL (Target)
TARGET_DB = {
    'host': 'localhost',
    'port': 3307, # Matches the updated docker-compose.yml
    'user': 'root',
    'password': 'root',
    'database': 'mdr_system'
}

TABLES = ['uom', 'mdr_headers', 'mdr_items', 'mdr_attachments', 'users']

def migrate():
    src_conn = None
    tgt_conn = None
    try:
        # Connect to Source
        print(f"Connecting to Source DB ({SOURCE_DB['host']}:{SOURCE_DB['port']})...")
        src_conn = mysql.connector.connect(**SOURCE_DB)
        src_cursor = src_conn.cursor(dictionary=True)

        # Connect to Target
        print(f"Connecting to Target DB ({TARGET_DB['host']}:{TARGET_DB['port']})...")
        tgt_conn = mysql.connector.connect(**TARGET_DB)
        tgt_cursor = tgt_conn.cursor()

        # Disable foreign key checks for clean migration
        tgt_cursor.execute("SET FOREIGN_KEY_CHECKS = 0;")

        for table in TABLES:
            print(f"Migrating table: {table}...")
            
            # Fetch data from source
            src_cursor.execute(f"SELECT * FROM {table}")
            rows = src_cursor.fetchall()
            
            if not rows:
                print(f"  - No data found in {table}. Skipping.")
                continue

            # Clear target table
            tgt_cursor.execute(f"DELETE FROM {table}")
            
            # Prepare Insert Statement
            columns = rows[0].keys()
            placeholders = ", ".join(["%s"] * len(columns))
            cols_str = ", ".join(columns)
            insert_query = f"INSERT INTO {table} ({cols_str}) VALUES ({placeholders})"
            
            # Insert data
            data = [tuple(row.values()) for row in rows]
            tgt_cursor.executemany(insert_query, data)
            print(f"  - Successfully migrated {len(rows)} rows to {table}.")

        # Re-enable foreign key checks
        tgt_cursor.execute("SET FOREIGN_KEY_CHECKS = 1;")
        tgt_conn.commit()
        print("\nMigration completed successfully!")

    except mysql.connector.Error as err:
        print(f"Error: {err}")
    finally:
        if src_conn and src_conn.is_connected():
            src_conn.close()
        if tgt_conn and tgt_conn.is_connected():
            tgt_conn.close()

if __name__ == "__main__":
    migrate()
