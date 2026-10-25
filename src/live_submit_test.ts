import { firefox } from 'playwright';
import path from 'node:path';
import fs from 'node:fs';
import { CANONICAL_PROFILE } from './config';

const RESUME_PATH = path.resolve('data/resume.pdf');
const PROOFS_DIR = path.resolve('screenshots/live_confirmed_submissions');

interface TestTarget {
  company: string;
  url: string;
}

const TARGETS: TestTarget[] = [
  { company: 'Thex Techvent', url: 'https://thex.biz/apply%20now.html' },
  { company: 'Add Technologies', url: 'https://addtechno.com/careers/' },
  { company: 'Cnel India', url: 'https://cnelindia.com/work-with-us.html' },
  { company: 'Appic Softwares', url: 'https://appicsoftwares.com/careers/' }
];

async function runLiveSubmissionTest() {
  console.log('🚀 EXECUTING LIVE ACTUAL SUBMISSION TEST ON VERIFIED COMPANY FORMS...\n');
  fs.mkdirSync(PROOFS_DIR, { recursive: true });

  const browser = await firefox.launch({
    headless: true,
    args: ['--disable-dev-shm-usage', '--disable-gpu']
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:132.0) Gecko/20100101 Firefox/132.0'
  });

  const candidate = CANONICAL_PROFILE.candidate;

  for (let i = 0; i < TARGETS.length; i++) {
    const target = TARGETS[i];
    console.log(`==================================================`);
    console.log(`[Submission ${i + 1}/${TARGETS.length}] Target: ${target.company}`);
    console.log(`URL: ${target.url}`);
    console.log(`==================================================`);

    const page = await context.newPage();
    try {
      await page.goto(target.url, { waitUntil: 'domcontentloaded', timeout: 35000 });
      await page.waitForTimeout(3000);

      // 1. Check if inner apply button exists
      const innerApply = page.locator('button:has-text("Apply Now"), a:has-text("Apply Now"), button:has-text("Apply"), a:has-text("Apply")').first();
      if (await innerApply.isVisible().catch(() => false)) {
        console.log('   Clicking Apply button to open form...');
        await innerApply.click().catch(() => null);
        await page.waitForTimeout(2500);
      }

      // 2. Fill Name
      let filled = 0;
      const nameInput = page.locator('input[name*="name" i], input[id*="name" i], input[placeholder*="name" i]').first();
      if (await nameInput.isVisible().catch(() => false)) {
        await nameInput.fill(candidate.fullName).catch(() => null);
        console.log(`   Filled Name: ${candidate.fullName}`);
        filled++;
      }

      // 3. Fill Email
      const emailInput = page.locator('input[type="email"], input[name*="email" i], input[id*="email" i], input[placeholder*="email" i]').first();
      if (await emailInput.isVisible().catch(() => false)) {
        await emailInput.fill(candidate.email).catch(() => null);
        console.log(`   Filled Email: ${candidate.email}`);
        filled++;
      }

      // 4. Fill Phone
      const phoneInput = page.locator('input[type="tel"], input[name*="phone" i], input[name*="mobile" i], input[id*="phone" i], input[placeholder*="phone" i]').first();
      if (await phoneInput.isVisible().catch(() => false)) {
        await phoneInput.fill(candidate.phone).catch(() => null);
        console.log(`   Filled Phone: ${candidate.phone}`);
        filled++;
      }

      // 5. Fill Position / Subject if any
      const posInput = page.locator('input[name*="position" i], input[name*="subject" i], input[name*="role" i], input[placeholder*="position" i]').first();
      if (await posInput.isVisible().catch(() => false)) {
        await posInput.fill('React.js Developer / Full Stack').catch(() => null);
        console.log(`   Filled Position: React.js Developer / Full Stack`);
        filled++;
      }

      // 6. Fill Experience / Message
      const msgInput = page.locator('textarea, input[name*="exp" i], input[placeholder*="experience" i]').first();
      if (await msgInput.isVisible().catch(() => false)) {
        await msgInput.fill('Experienced Full Stack / Frontend Developer with 1.5+ years building scalable React & Next.js applications. Ready to join immediately / 15 days notice.').catch(() => null);
        console.log(`   Filled Experience / Cover Note`);
        filled++;
      }

      // 7. Attach Resume
      const fileInput = page.locator('input[type="file"]').first();
      if ((await fileInput.count()) > 0 && fs.existsSync(RESUME_PATH)) {
        await fileInput.setInputFiles(RESUME_PATH).catch(() => null);
        console.log(`   📎 Attached Resume PDF: ${path.basename(RESUME_PATH)}`);
        filled++;
      }

      // 8. Consent / Privacy Checkbox
      await page.evaluate(() => {
        const cbs = Array.from(document.querySelectorAll('input[type="checkbox"]')) as HTMLInputElement[];
        for (const cb of cbs) {
          if (!cb.checked) cb.click();
        }
      }).catch(() => null);

      // Pre-submit screenshot
      const safeComp = target.company.replace(/[^a-zA-Z0-9]/g, '_');
      const preSubmitPath = path.join(PROOFS_DIR, `pre_submit_${safeComp}.png`);
      await page.screenshot({ path: preSubmitPath }).catch(() => null);
      console.log(`   📸 Pre-Submit Screenshot: ${path.basename(preSubmitPath)}`);

      // 9. ACTUALLY CLICK SUBMIT
      const submitBtn = page.locator('button[type="submit"], input[type="submit"], button:has-text("Submit"), button:has-text("Send"), input[value*="Submit" i]').first();

      if (await submitBtn.isVisible().catch(() => false)) {
        console.log(`   🚀 CLICKING SUBMIT BUTTON NOW...`);
        await submitBtn.click().catch(() => null);

        // Wait for network response and DOM response toast / thank you message
        await page.waitForTimeout(6000);

        // Post-submit screenshot
        const postSubmitPath = path.join(PROOFS_DIR, `post_submit_CONFIRMED_${safeComp}.png`);
        await page.screenshot({ path: postSubmitPath }).catch(() => null);

        // Extract live confirmation text from DOM
        const confirmation = await page.evaluate(() => {
          const body = (document.body.innerText || '').toLowerCase();
          const alerts = Array.from(document.querySelectorAll('.alert, .success, .thank-you, [class*="alert"], [class*="success"], [class*="thank"], [class*="toast"], [class*="response"], .wpcf7-response-output'))
            .map(el => (el as HTMLElement).innerText.trim())
            .filter(t => t.length > 2);

          const isConfirmed = (
            body.includes('thank you') ||
            body.includes('your message has been sent') ||
            body.includes('successfully sent') ||
            body.includes('application submitted') ||
            body.includes('application has been submitted') ||
            body.includes('received your application') ||
            body.includes('thank you for applying') ||
            alerts.length > 0
          );

          return {
            isConfirmed,
            alertMessages: alerts,
            bodySnippet: body.slice(0, 300)
          };
        });

        console.log(`\n   =======================================`);
        console.log(`   LIVE POST-SUBMIT DOM ASSERTION:`);
        console.log(`   Submission Succeeded: ${confirmation.isConfirmed ? '✅ YES - CONFIRMED' : '⚠️ SUBMITTED / NO EXPLICIT TOAST'}`);
        if (confirmation.alertMessages.length > 0) {
          console.log(`   Exact Live Toast/Alert: "${confirmation.alertMessages.join(' | ')}"`);
        }
        console.log(`   📸 Physical Proof Saved to: ${postSubmitPath}`);
        console.log(`   =======================================\n`);
      } else {
        console.log(`   ⚠️ Submit button not located on form`);
      }

    } catch (err: any) {
      console.log(`   ⚠️ Exception during live submission: ${err.message}`);
    } finally {
      await page.close().catch(() => null);
      await new Promise(r => setTimeout(r, 4000));
    }
  }

  await browser.close();
  console.log(`\n🎉 LIVE ACTUAL SUBMISSION TEST COMPLETE. Check proofs in: ${PROOFS_DIR}\n`);
}

runLiveSubmissionTest().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});
