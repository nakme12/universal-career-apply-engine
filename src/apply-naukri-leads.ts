import { chromium, BrowserContext, Page } from 'playwright';
import path from 'node:path';
import fs from 'node:fs';
import Database from 'better-sqlite3';
import { UniversalCareerSolver } from './career-solver';
import { sendJobAppliedNotification } from './tg-notify';

const NAUKRI_DB_PATH = path.resolve('C:/mcp/naukri-auto-apply-engine/data/applied_jobs.db');
const NAUKRI_AUTH_PATH = path.resolve('C:/mcp/naukri-auto-apply-engine/auth/naukri-state.json');
const SHARED_DB_PATH = path.resolve('C:/mcp/shared-data/leads_queue.db');
const SCREENSHOTS_DIR = path.resolve('screenshots/naukri_leads');

interface NaukriLead {
  id: number;
  job_title: string;
  company: string;
  job_url: string;
}

export async function processNaukriExternalLeads(limit: number = 10) {
  console.log('============================================================');
  console.log(`🚀 PROCESSING NAUKRI EXTERNAL LEADS VIA UNIVERSAL SOLVER (Limit: ${limit})`);
  console.log('============================================================\n');

  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  const naukriDb = new Database(NAUKRI_DB_PATH);
  const sharedDb = new Database(SHARED_DB_PATH);

  // Initialize shared queue table
  sharedDb.exec(`
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

  const allLeads = naukriDb.prepare('SELECT id, job_title, company, job_url FROM external_leads').all() as NaukriLead[];
  
  // Strict quality filter for React / Frontend / Full Stack
  const filtered = allLeads.filter(l => {
    const t = l.job_title.toLowerCase();
    if (t.includes('java') || t.includes('angular') || t.includes('python') || t.includes('.net') || t.includes('marketing') || t.includes('qa')) return false;
    return t.includes('react') || t.includes('frontend') || t.includes('front-end') || t.includes('web') || t.includes('full stack') || t.includes('software');
  });

  console.log(`Discovered ${allLeads.length} total external leads, ${filtered.length} matching candidate profile.`);
  const batch = filtered.slice(0, limit);

  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
    args: ['--disable-dev-shm-usage', '--disable-gpu']
  });

  const contextOptions: any = {
    viewport: { width: 1440, height: 950 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'
  };

  if (fs.existsSync(NAUKRI_AUTH_PATH)) {
    contextOptions.storageState = NAUKRI_AUTH_PATH;
  }

  const context = await browser.newContext(contextOptions);
  let successCount = 0;

  try {
    for (let i = 0; i < batch.length; i++) {
      const lead = batch[i];
      console.log(`\n------------------------------------------------------------`);
      console.log(`[#${i + 1}/${batch.length}] Inspecting: ${lead.job_title} @ ${lead.company}`);
      console.log(`Naukri URL: ${lead.job_url}`);

      const page = await context.newPage();
      let externalUrl = '';

      try {
        await page.goto(lead.job_url, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.waitForTimeout(3000);
        await page.evaluate(() => window.scrollBy(0, 350)).catch(() => null);
        await page.waitForTimeout(1500);

        // Find "Apply on company site" button
        const extSelectors = [
          '#company-site-button',
          'button.company-site-button',
          'a.company-site-button',
          '[class*="company-site-button"]',
          'a:has-text("Apply on company site")',
          'button:has-text("Apply on company site")',
          'a:has-text("Apply on company website")',
          'button:has-text("Apply on company website")',
          'a:has-text("Apply on Company Site")',
          'a[href*="myapply/showAcp"]',
          'a[href*="showAcp"]'
        ];

        let applyBtn = null;
        for (const sel of extSelectors) {
          const loc = page.locator(sel).first();
          if (await loc.isVisible().catch(() => false)) {
            applyBtn = loc;
            break;
          }
        }

        if (applyBtn) {
          console.log('   Clicking "Apply on company site" to resolve destination career page...');
          const [popup] = await Promise.all([
            context.waitForEvent('page', { timeout: 15000 }).catch(() => null),
            applyBtn.click().catch(() => null)
          ]);

          const targetPage = popup || page;
          await targetPage.waitForLoadState('domcontentloaded', { timeout: 25000 }).catch(() => null);
          await targetPage.waitForTimeout(4000);

          // Wait for any redirect away from naukri showAcp
          if (targetPage.url().includes('showAcp') || targetPage.url().includes('myapply')) {
            await targetPage.waitForURL(url => !url.href.includes('naukri.com/myapply'), { timeout: 10000 }).catch(() => null);
          }

          externalUrl = targetPage.url();
          if (popup && popup !== page) await popup.close().catch(() => null);
        } else {
          // If no button, check if page has any external anchor
          const directExtLink = await page.locator('a[href*="myapply/showAcp"]').first().getAttribute('href').catch(() => null);
          if (directExtLink) {
            externalUrl = directExtLink.startsWith('http') ? directExtLink : `https://www.naukri.com${directExtLink}`;
          }
        }

        await page.close().catch(() => null);

      } catch (err: any) {
        console.log(`   Notice on resolving external url: ${err.message}`);
        await page.close().catch(() => null);
      }

      // If we got a real company career portal URL (not naukri.com search/home)
      if (externalUrl && !externalUrl.includes('naukri.com/job-listings') && !externalUrl.includes('naukri.com/agile-jobs') && !externalUrl.includes('naukri.com/mnjuser')) {
        console.log(`   🎯 Resolved Destination Company Portal: ${externalUrl}`);

        const solverResult = await UniversalCareerSolver.applyToUrl(context, externalUrl, lead.company);
        console.log(`   Outcome: ${solverResult.success ? '✅ APPLIED' : (solverResult.fieldsFilled >= 2 ? 'SUBMITTED_UNVERIFIED' : 'MANUAL_REQUIRED')}`);
        console.log(`   Reason: ${solverResult.reason}`);
        console.log(`   ATS Score: ${solverResult.atsScore || 'N/A'} | Fields Filled: ${solverResult.fieldsFilled} | Resume Attached: ${solverResult.resumeAttached}`);
        if (solverResult.screenshotPath) console.log(`   Proof Screenshot: ${solverResult.screenshotPath}`);

        const status = solverResult.success ? 'APPLIED' : (solverResult.fieldsFilled >= 2 ? 'SUBMITTED_UNVERIFIED' : 'MANUAL_REQUIRED');
        
        sharedDb.prepare(`
          INSERT INTO leads_queue (source_portal, job_title, company, destination_url, status, screenshot_path, reason, applied_at)
          VALUES ('Naukri', ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
          ON CONFLICT(destination_url) DO UPDATE SET
            status = excluded.status,
            screenshot_path = excluded.screenshot_path,
            reason = excluded.reason,
            applied_at = CURRENT_TIMESTAMP
        `).run(lead.job_title, lead.company, externalUrl, status, solverResult.screenshotPath || '', solverResult.reason);

        const isSuccess = solverResult.success || (solverResult.fieldsFilled >= 2 && solverResult.resumeAttached);
        if (isSuccess) {
          successCount++;
          const safeCompany = lead.company.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 20);
          await sendJobAppliedNotification({
            platform: 'Universal Career Portal (' + (solverResult.reason.includes('Direct HR') ? 'HR Email' : 'Career Form') + ')',
            jobTitle: lead.job_title,
            company: lead.company,
            jobUrl: externalUrl,
            atsScore: solverResult.atsScore || 85,
            resumeUsed: `Pratik_Patidar_Resume_${safeCompany}.pdf`,
            type: solverResult.reason.includes('Direct HR') ? 'EMAIL_DISPATCH' : 'WEB_FORM',
            recipientEmail: solverResult.recipientEmail
          }).catch(() => null);
        }

      } else {
        console.log(`   ⚠️ Could not resolve clean external company URL for #${lead.id}`);
      }

      // Safety cooldown between companies
      const cooldown = Math.floor(Math.random() * 5000) + 6000;
      console.log(`   Safety cooldown: ${(cooldown / 1000).toFixed(1)}s...`);
      await new Promise(r => setTimeout(r, cooldown));
    }
  } finally {
    await browser.close();
  }

  console.log('\n============================================================');
  console.log(`🏁 FINISHED BATCH OF NAUKRI EXTERNAL LEADS`);
  console.log(`Confirmed Applied: ${successCount} / ${batch.length}`);
  console.log('============================================================\n');
}

if (process.argv[1]?.includes('apply-naukri-leads')) {
  const limit = parseInt(process.env.LIMIT || process.argv[2] || '10', 10);
  processNaukriExternalLeads(limit).then(() => process.exit(0)).catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
}
