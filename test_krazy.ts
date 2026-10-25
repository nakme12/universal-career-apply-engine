import { chromium } from 'playwright';
import path from 'node:path';
import fs from 'node:fs';

async function testKrazy() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage();
  console.log('Navigating to krazymantra.com/jobdetails.php?id=212 ...');
  await page.goto('https://www.krazymantra.com/jobdetails.php?id=212', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(4000);

  const title = await page.title();
  console.log('Title:', title);

  const inputs = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('input:not([type="hidden"]), textarea, select')).map(el => ({
      tag: el.tagName,
      type: (el as any).type,
      name: (el as any).name,
      id: el.id,
      placeholder: (el as any).placeholder,
      isVisible: (el as any).offsetParent !== null
    }));
  });
  console.log(`Inputs found (${inputs.length}):`, inputs);

  const applyBtn = page.locator('button:has-text("Apply"), input[value*="Apply" i], a:has-text("Apply")').first();
  console.log('Apply btn visible:', await applyBtn.isVisible().catch(() => false));

  await page.screenshot({ path: 'screenshots/krazymantra_inspect.png' });
  console.log('Screenshot saved to screenshots/krazymantra_inspect.png');

  await browser.close();
}

testKrazy().catch(e => console.error(e.message));
