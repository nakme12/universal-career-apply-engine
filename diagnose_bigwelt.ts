import { chromium } from 'playwright';

async function testBigwelt() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage();
  try {
    console.log('Navigating to bigwelt.com/job ...');
    await page.goto('https://www.bigwelt.com/job', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(4000);

    const title = await page.title();
    console.log('Title:', title);
    const inputs = await page.evaluate(() => {
      const els = Array.from(document.querySelectorAll('input, select, textarea, button, a[href*="apply"], button[class*="apply"]'));
      return els.map(e => ({
        tag: e.tagName,
        type: (e as any).type,
        name: (e as any).name,
        id: e.id,
        placeholder: (e as any).placeholder,
        text: e.textContent?.trim().slice(0, 30),
        className: e.className
      }));
    });
    console.log(`Total elements: ${inputs.length}`);
    console.log(inputs.filter(i => ['INPUT', 'TEXTAREA', 'SELECT'].includes(i.tag)).slice(0, 15));
  } catch (err: any) {
    console.error('Bigwelt error:', err.message);
  } finally {
    await browser.close();
  }
}

testBigwelt();
