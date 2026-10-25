import { chromium } from 'playwright';

async function testFastThex() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage();
  const start = Date.now();
  console.log('Navigating with Chrome to thex.biz ...');
  await page.goto('https://thex.biz/apply%20now.html', { waitUntil: 'domcontentloaded', timeout: 15000 });
  console.log(`Loaded in ${Date.now() - start}ms! Page title: "${await page.title()}"`);
  const inputs = await page.evaluate(() => document.querySelectorAll('input').length);
  console.log(`Inputs found: ${inputs}`);
  await browser.close();
}

testFastThex().catch(e => console.error('Error:', e.message));
