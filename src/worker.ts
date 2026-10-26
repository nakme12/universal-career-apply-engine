import { chromium } from 'playwright';
import path from 'node:path';
import fs from 'node:fs';
import Database from 'better-sqlite3';
import { UniversalCareerSolver } from './career-solver';
import { sendJobAppliedNotification } from './tg-notify';

const SHARED_DB_PATH = path.resolve('C:/mcp/shared-data/leads_queue.db');

export class CareerQueueWorker {
  private db: Database.Database;

  constructor() {
    fs.mkdirSync(path.dirname(SHARED_DB_PATH), { recursive: true });
    this.db = new Database(SHARED_DB_PATH);
    this.init();
  }

  private init() {
    this.db.exec(`
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
  }

  async runQueue(limit: number = 20) {
    console.log(`🚀 Starting Universal Career Queue Worker (Limit: ${limit})...`);
    const pending = this.db.prepare("SELECT * FROM leads_queue WHERE status = 'PENDING' LIMIT ?").all(limit) as any[];

    if (pending.length === 0) {
      console.log('No pending leads in shared queue. Waiting for portal discovery...');
      return;
    }

    console.log(`Found ${pending.length} pending career page leads in queue.`);

    const browser = await chromium.launch({
      channel: 'chrome',
      headless: process.env.HEADLESS !== 'false',
      args: ['--disable-dev-shm-usage', '--disable-gpu']
    });

    const context = await browser.newContext({
      viewport: { width: 1440, height: 950 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:132.0) Gecko/20100101 Firefox/132.0'
    });

    let appliedCount = 0;

    try {
      for (const lead of pending) {
        console.log(`\n--------------------------------------------------`);
        console.log(`Processing Queue Lead #${lead.id}: ${lead.job_title} @ ${lead.company}`);
        console.log(`URL: ${lead.destination_url}`);

        const result = await UniversalCareerSolver.applyToUrl(context, lead.destination_url, lead.company);

        const newStatus = result.success ? 'APPLIED' : (result.recipientEmail ? 'HR_EMAIL_DRAFTED' : 'MANUAL_REQUIRED');
        this.db.prepare(`
          UPDATE leads_queue 
          SET status = ?, screenshot_path = ?, reason = ?, applied_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).run(newStatus, result.screenshotPath || '', result.reason, lead.id);

        // STRICT ASSERTION: ONLY send Telegram alert if result.success is TRUE (confirmed on DOM)
        if (result.success === true) {
          appliedCount++;
          const safeCompany = lead.company.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 20);
          await sendJobAppliedNotification({
            platform: 'Universal Career Portal (Verified Submission)',
            jobTitle: lead.job_title,
            company: lead.company,
            jobUrl: lead.destination_url,
            atsScore: result.atsScore || 85,
            resumeUsed: `Pratik_Patidar_Resume_${safeCompany}.pdf`,
            type: 'WEB_FORM',
            screenshotPath: result.screenshotPath
          }).catch(() => null);
        }
        console.log(`Outcome: ${newStatus} (${result.reason})`);

        // Anti-ban cooldown between jobs
        const waitMs = Math.floor(Math.random() * 8000) + 12000;
        console.log(`Safety cooldown: waiting ${(waitMs / 1000).toFixed(1)}s...`);
        await new Promise(r => setTimeout(r, waitMs));
      }
    } finally {
      await browser.close();
    }

    console.log(`\n==================================================`);
    console.log(`Worker Finished Batch. Applied: ${appliedCount}/${pending.length}`);
    console.log(`==================================================\n`);
  }
}

if (process.argv[1] && process.argv[1].includes('worker')) {
  const worker = new CareerQueueWorker();
  const limit = parseInt(process.env.LIMIT || process.argv[2] || '10', 10);
  worker.runQueue(limit).then(() => process.exit(0)).catch(err => {
    console.error('Worker error:', err);
    process.exit(1);
  });
}
