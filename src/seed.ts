import Database from 'better-sqlite3';
import path from 'node:path';
import fs from 'node:fs';

const AUDIT_FILE = path.resolve('C:/mcp/naukri-auto-apply-engine/data/external_audit_20.json');
const SHARED_DB_PATH = path.resolve('C:/mcp/shared-data/leads_queue.db');

fs.mkdirSync(path.dirname(SHARED_DB_PATH), { recursive: true });
const db = new Database(SHARED_DB_PATH);

db.exec(`
  CREATE TABLE IF NOT EXISTS leads_queue (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source_portal TEXT NOT NULL,
    job_title TEXT NOT NULL,
    company TEXT NOT NULL,
    destination_url TEXT NOT NULL UNIQUE,
    status TEXT DEFAULT 'PENDING',
    screenshot_path TEXT,
    reason TEXT,
    discovered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    applied_at DATETIME
  )
`);

const raw = fs.readFileSync(AUDIT_FILE, 'utf8');
const jobs = JSON.parse(raw);

const insert = db.prepare(`
  INSERT OR IGNORE INTO leads_queue (source_portal, job_title, company, destination_url)
  VALUES ('Naukri', ?, ?, ?)
`);

let count = 0;
for (const j of jobs) {
  if (j.destinationUrl && !j.destinationUrl.includes('naukri.com')) {
    const res = insert.run(j.jobTitle, j.company, j.destinationUrl);
    if (res.changes > 0) count++;
  }
}

console.log(`✅ Seeded ${count} pending career page leads into shared queue: ${SHARED_DB_PATH}`);
const total = db.prepare('SELECT COUNT(*) as count FROM leads_queue').get() as { count: number };
console.log(`Total leads in shared queue: ${total.count}`);
