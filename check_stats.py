import sqlite3

def check_db(name, path):
    print(f"\n==================== {name} ====================")
    try:
        conn = sqlite3.connect(path)
        c = conn.cursor()
        c.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = [r[0] for r in c.fetchall()]
        print("Tables:", tables)
        for t in tables:
            c.execute(f"SELECT count(*) FROM {t}")
            cnt = c.fetchone()[0]
            print(f"  Table '{t}': {cnt} total rows")
            
            # Check columns
            cols = [col[1] for col in c.execute(f"PRAGMA table_info({t})").fetchall()]
            if 'platform' in cols:
                c.execute(f"SELECT platform, count(*) FROM {t} GROUP BY platform")
                print("    By Platform:", c.fetchall())
            if 'status' in cols:
                c.execute(f"SELECT status, count(*) FROM {t} GROUP BY status")
                print("    By Status:", c.fetchall())
                
        conn.close()
    except Exception as e:
        print("Error reading db:", e)

check_db("Naukri & Hirist Tracker DB", "C:/mcp/naukri-auto-apply-engine/data/applied_jobs.db")
check_db("Universal Solver Shared Queue DB", "C:/mcp/shared-data/leads_queue.db")
