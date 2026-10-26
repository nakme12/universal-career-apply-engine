import { chromium } from 'playwright';
import { generateHtmlForVariant, RESUME_VARIANTS } from '../src/generate_4_resumes';
import path from 'node:path';

async function previewHtml() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage({
    viewport: { width: 794, height: 1123 }
  });

  const variant = RESUME_VARIANTS[0]; // Frontend Engineer
  const html = generateHtmlForVariant(variant);
  await page.setContent(html, { waitUntil: 'load' });

  const outPath = path.resolve('scratch/fe_visual.png');
  await page.screenshot({ path: outPath, fullPage: true });
  console.log('Saved visual to:', outPath);

  await browser.close();
}

previewHtml().catch(console.error);
