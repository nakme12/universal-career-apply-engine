import { chromium } from 'playwright';
import path from 'node:path';
import fs from 'node:fs';
import { VARIANTS, generateHtml } from '../src/generate_4_resumes';

async function main() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage();
  
  // Set viewport to A4 dimensions at 96 DPI: 794 x 1123
  await page.setViewportSize({ width: 794, height: 1123 });

  for (const variant of VARIANTS) {
    const html = generateHtml(variant);
    await page.setContent(html, { waitUntil: 'load' });
    
    // Evaluate total height of content
    const dimensions = await page.evaluate(() => {
      const body = document.body;
      const htmlEl = document.documentElement;
      const height = Math.max(
        body.scrollHeight, body.offsetHeight,
        htmlEl.clientHeight, htmlEl.scrollHeight, htmlEl.offsetHeight
      );
      return {
        bodyScrollHeight: body.scrollHeight,
        totalHeight: height,
        viewportHeight: window.innerHeight
      };
    });

    console.log(`Variant ${variant.key}:`);
    console.log(`  Content Height: ${dimensions.bodyScrollHeight}px / 1123px (${Math.round((dimensions.bodyScrollHeight / 1123) * 100)}% of page)`);
    console.log(`  Remaining empty space at bottom: ${1123 - dimensions.bodyScrollHeight}px (~${Math.round(((1123 - dimensions.bodyScrollHeight) / 1123) * 297)} mm)`);

    // Take screenshot
    const ssPath = path.resolve(`scratch/resume_${variant.key}.png`);
    await page.screenshot({ path: ssPath, fullPage: false });
    console.log(`  Screenshot saved to: ${ssPath}`);
  }

  await browser.close();
}

main().catch(console.error);
