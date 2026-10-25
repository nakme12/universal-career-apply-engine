import { chromium } from 'playwright';
import path from 'node:path';
import fs from 'node:fs';

const RESUME_PATH = path.resolve('data/resume.pdf');

async function testKrazyApply() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage();
  console.log('Navigating to krazymantra.com/jobdetails.php?id=212 ...');
  await page.goto('https://www.krazymantra.com/jobdetails.php?id=212', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(3000);

  // Click Apply button to reveal modal
  const applyBtn = page.locator('button:has-text("Apply"), a:has-text("Apply")').first();
  console.log('Clicking Apply button...');
  await applyBtn.click({ force: true });
  await page.waitForTimeout(2000);

  // Check inputs visibility now
  const fName = page.locator('#fname, input[name="fname"]');
  console.log('fname visible:', await fName.isVisible());

  if (await fName.isVisible()) {
    console.log('Filling form fields...');
    await fName.fill('Pratik');
    await page.locator('#lname, input[name="lname"]').fill('Patidar');
    await page.locator('#cno, input[name="cno"]').fill('8269647990');
    await page.locator('#email, input[name="email"]').fill('pratikpatidar7990@gmail.com');

    // Attach resume
    const fileInput = page.locator('input[type="file"], #cv');
    if ((await fileInput.count()) > 0) {
      await fileInput.setInputFiles(RESUME_PATH);
      console.log('Attached resume to #cv');
    }

    await page.screenshot({ path: 'screenshots/krazy_pre_submit.png' });
    console.log('Saved pre-submit screenshot!');

    // Click submit
    const submitBtn = page.locator('input[type="submit"]#sub, button:has-text("Submit"), input[value*="Submit" i]').first();
    console.log('Clicking Submit button...');
    await submitBtn.click({ force: true });
    await page.waitForTimeout(5000);

    await page.screenshot({ path: 'screenshots/krazy_post_submit.png' });
    console.log('Saved post-submit screenshot! Confirmation check:');
    const text = await page.evaluate(() => document.body.innerText.slice(0, 500));
    console.log(text);
  }

  await browser.close();
}

testKrazyApply().catch(e => console.error(e.message));
