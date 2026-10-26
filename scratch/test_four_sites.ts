import { chromium } from 'playwright';
import { UniversalCareerSolver } from '../src/career-solver';
import fs from 'node:fs';

const SITES = [
  { name: 'Relinns', url: 'https://careers.relinns.com/apply/engineering/full-time/React-Developer' },
  { name: 'Add Technologies', url: 'https://addtechno.com/careers/' },
  { name: 'Thex Techvent', url: 'https://thex.biz/apply%20now.html' },
  { name: 'Appic Softwares', url: 'https://appicsoftwares.com/careers/' }
];

async function run() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 950 } });

  for (const s of SITES) {
    console.log(`\n============================================================`);
    console.log(`🚀 TESTING: ${s.name} (${s.url})`);
    try {
      const res = await UniversalCareerSolver.applyToUrl(context, s.url, s.name);
      console.log(`   Outcome: ${res.success ? '✅ APPLIED' : '❌ NOT APPLIED'}`);
      console.log(`   Reason: ${res.reason}`);
      console.log(`   Fields Filled: ${res.fieldsFilled}`);
      console.log(`   Resume Attached: ${res.resumeAttached}`);
      console.log(`   Screenshot: ${res.screenshotPath}`);
    } catch (e: any) {
      console.error(`   Error on ${s.name}:`, e.message);
    }
  }

  await browser.close();
}

run().catch(console.error);
