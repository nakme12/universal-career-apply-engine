import { chromium } from 'playwright';
import path from 'node:path';
import fs from 'node:fs';
import { UniversalCareerSolver } from './src/career-solver';
import Database from 'better-sqlite3';

const AUDIT_FILE = path.resolve('C:/mcp/naukri-auto-apply-engine/data/external_audit_20.json');
const SHARED_DB_PATH = path.resolve('C:/mcp/shared-data/leads_queue.db');
const RESULTS_OUT = path.resolve('data/batch_apply_results_20.json');

interface BatchResult {
  index: number;
  company: string;
  jobTitle: string;
  url: string;
  status: 'APPLIED' | 'SUBMITTED_UNVERIFIED' | 'MANUAL_REQUIRED' | 'INTERNAL_NAUKRI' | 'ERROR';
  atsScore?: number;
  tailoredResumeUsed?: boolean;
  fieldsFilled: number;
  resumeAttached: boolean;
  reason: string;
  screenshotPath?: string;
}

async function runBatch() {
  console.log('============================================================');
  console.log('🚀 RUNNING ALL 20 LEADS - UNIVERSAL CAREER AUTO-APPLY');
  console.log('============================================================\n');

  const raw = fs.readFileSync(AUDIT_FILE, 'utf8');
  const leads = JSON.parse(raw);
  const db = new Database(SHARED_DB_PATH);

  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
    args: ['--disable-dev-shm-usage', '--disable-gpu']
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 950 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:132.0) Gecko/20100101 Firefox/132.0'
  });

  const results: BatchResult[] = [];

  try {
    for (const lead of leads) {
      console.log(`\n------------------------------------------------------------`);
      console.log(`[#${lead.index}/20] ${lead.company} — ${lead.jobTitle}`);
      console.log(`Destination: ${lead.destinationUrl}`);

      if (!lead.destinationUrl || lead.destinationUrl.includes('naukri.com/mnjuser')) {
        console.log(`⏩ Skipping: Internal Naukri Job (handled by naukri engine)`);
        results.push({
          index: lead.index,
          company: lead.company,
          jobTitle: lead.jobTitle,
          url: lead.destinationUrl,
          status: 'INTERNAL_NAUKRI',
          fieldsFilled: 0,
          resumeAttached: false,
          reason: 'Internal Naukri 1-Click apply posting'
        });
        continue;
      }

      try {
        const solverResult = await UniversalCareerSolver.applyToUrl(context, lead.destinationUrl, lead.company);
        
        let status: BatchResult['status'] = 'MANUAL_REQUIRED';
        if (solverResult.success) {
          status = 'APPLIED';
        } else if (solverResult.fieldsFilled >= 2) {
          status = 'SUBMITTED_UNVERIFIED';
        }

        console.log(`Outcome: ${status} | Fields: ${solverResult.fieldsFilled} | Resume: ${solverResult.resumeAttached} | ATS: ${solverResult.atsScore || 'N/A'}`);
        console.log(`Reason: ${solverResult.reason}`);
        if (solverResult.screenshotPath) console.log(`Proof: ${solverResult.screenshotPath}`);

        results.push({
          index: lead.index,
          company: lead.company,
          jobTitle: lead.jobTitle,
          url: lead.destinationUrl,
          status,
          atsScore: solverResult.atsScore,
          tailoredResumeUsed: solverResult.tailoredResumeUsed,
          fieldsFilled: solverResult.fieldsFilled,
          resumeAttached: solverResult.resumeAttached,
          reason: solverResult.reason,
          screenshotPath: solverResult.screenshotPath
        });

        // Update database if present
        db.prepare(`
          UPDATE leads_queue
          SET status = ?, screenshot_path = ?, reason = ?, applied_at = CURRENT_TIMESTAMP
          WHERE destination_url = ?
        `).run(status, solverResult.screenshotPath || '', solverResult.reason, lead.destinationUrl);

      } catch (err: any) {
        console.log(`❌ Error processing #${lead.index}: ${err.message}`);
        results.push({
          index: lead.index,
          company: lead.company,
          jobTitle: lead.jobTitle,
          url: lead.destinationUrl,
          status: 'ERROR',
          fieldsFilled: 0,
          resumeAttached: false,
          reason: err.message
        });
      }

      // Small cooldown between submissions
      await new Promise(r => setTimeout(r, 2000));
    }
  } finally {
    await browser.close();
  }

  fs.mkdirSync(path.dirname(RESULTS_OUT), { recursive: true });
  fs.writeFileSync(RESULTS_OUT, JSON.stringify(results, null, 2), 'utf8');

  console.log('\n============================================================');
  console.log(`🏁 FINISHED BATCH OF 20 LEADS`);
  console.log(`Results saved to: ${RESULTS_OUT}`);
  console.log('============================================================\n');
}

runBatch().catch(err => {
  console.error('Fatal batch error:', err);
  process.exit(1);
});
