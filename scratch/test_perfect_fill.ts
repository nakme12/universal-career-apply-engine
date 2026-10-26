import { chromium } from 'playwright';
import path from 'node:path';
import fs from 'node:fs';
import { VARIANTS, generateHtml } from '../src/generate_4_resumes';

async function testFill() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 794, height: 1123 });

  // Symmetrical margin configuration:
  // Top: 10mm (~38px), Bottom: 12mm (~45px)
  // Printable content height = 1123 - 38 - 45 = 1040px.
  // When content finishes at 1055-1065px, it sits exactly 15mm from the physical bottom edge of A4!

  for (const variant of VARIANTS) {
    let html = generateHtml(variant);
    
    // Calibrated typography for 100% full coverage
    html = html.replace('font-size: 9.35pt;', 'font-size: 9.5pt;');
    html = html.replace('line-height: 1.38;', 'line-height: 1.44;');
    html = html.replace('margin-bottom: 2.6px;', 'margin-bottom: 4.8px;');
    html = html.replace('margin-top: 9px;', 'margin-top: 13.5px;');
    html = html.replace('margin-bottom: 5px;', 'margin-bottom: 6px;');
    html = html.replace('margin-bottom: 7px;', 'margin-bottom: 11px;');

    await page.setContent(html, { waitUntil: 'load' });

    const metrics = await page.evaluate(() => {
      const edu = document.querySelector('.edu-block');
      const eduRect = edu ? edu.getBoundingClientRect() : null;
      return {
        eduBottom: eduRect ? eduRect.bottom : 0
      };
    });

    const pdfPath = path.resolve(`scratch/test_fill_${variant.key}.pdf`);
    await page.pdf({
      path: pdfPath,
      format: 'A4',
      printBackground: true,
      margin: { top: '8mm', bottom: '8mm', left: '10mm', right: '10mm' }
    });

    const bottomGapPx = 1123 - metrics.eduBottom;
    const bottomGapMm = Math.round((bottomGapPx / 1123) * 297);
    console.log(`Variant ${variant.key}: Bottom at ${metrics.eduBottom.toFixed(1)}px / 1123px (Bottom gap: ${bottomGapPx.toFixed(1)}px / ~${bottomGapMm}mm)`);
  }

  await page.close();
  await browser.close();
}

testFill().catch(console.error);
