import { chromium } from 'playwright';
import path from 'node:path';
import fs from 'node:fs';
import { RESUME_DATA, generateCalibratedHtml } from './calibrate_resume';

async function testCalibrate() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage();
  
  // A4 at 96 DPI
  await page.setViewportSize({ width: 794, height: 1123 });

  for (const variant of RESUME_DATA) {
    const html = generateCalibratedHtml(variant);
    await page.setContent(html, { waitUntil: 'load' });

    const pdfPath = path.resolve(`scratch/${variant.fileName}`);
    await page.pdf({
      path: pdfPath,
      format: 'A4',
      printBackground: true,
      margin: { top: '8mm', bottom: '8mm', left: '10mm', right: '10mm' }
    });

    const dimensions = await page.evaluate(() => {
      const body = document.body;
      return {
        scrollHeight: body.scrollHeight,
        offsetHeight: body.offsetHeight
      };
    });

    console.log(`\n=== Variant ${variant.key} ===`);
    console.log(`Rendered scrollHeight: ${dimensions.scrollHeight}px / 1123px`);
    console.log(`Fill ratio: ${Math.round((dimensions.scrollHeight / 1123) * 100)}%`);
    console.log(`PDF saved: ${pdfPath}`);
  }

  await page.close();
  await browser.close();
}

testCalibrate().catch(console.error);
