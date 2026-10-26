import { chromium } from 'playwright';
import path from 'node:path';
import fs from 'node:fs';
import { VARIANTS, generateHtml } from '../src/generate_4_resumes';

async function main() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage();
  
  // A4 standard at 96 DPI: 794 x 1123
  // Let us set viewport to 794 x 1123
  await page.setViewportSize({ width: 794, height: 1123 });

  for (const variant of VARIANTS) {
    const html = generateHtml(variant);
    await page.setContent(html, { waitUntil: 'load' });

    // Measure bounding box of the last element on the page (Education block)
    const metrics = await page.evaluate(() => {
      const edu = document.querySelector('.edu-block');
      const eduRect = edu ? edu.getBoundingClientRect() : null;
      const body = document.body;
      const bodyRect = body.getBoundingClientRect();

      return {
        viewportHeight: window.innerHeight,
        bodyScrollHeight: body.scrollHeight,
        eduBottom: eduRect ? eduRect.bottom : 0,
        eduTop: eduRect ? eduRect.top : 0,
        eduHeight: eduRect ? eduRect.height : 0
      };
    });

    const bottomGapPx = 1123 - metrics.eduBottom;
    const bottomGapMm = Math.round((bottomGapPx / 1123) * 297);
    const usedPercentage = Math.round((metrics.eduBottom / 1123) * 100);

    console.log(`\n========================================`);
    console.log(`Variant: ${variant.key} (${variant.fileName})`);
    console.log(`Education Section Bottom: ${metrics.eduBottom.toFixed(1)}px / 1123px`);
    console.log(`Page Utilized: ${usedPercentage}%`);
    console.log(`Bottom Margin / Gap: ${bottomGapPx.toFixed(1)}px (~${bottomGapMm} mm)`);
    console.log(`========================================`);

    // Capture screenshot of exact A4 canvas
    const ssPath = path.resolve(`scratch/visual_${variant.key}.png`);
    await page.screenshot({ path: ssPath, clip: { x: 0, y: 0, width: 794, height: 1123 } });
  }

  await page.close();
  await browser.close();
}

main().catch(console.error);
