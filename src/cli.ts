import { chromium } from 'playwright';
import { UniversalCareerSolver } from './career-solver';

async function main() {
  const args = process.argv.slice(2);
  let targetUrl = '';
  let company = 'Target Company';

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--url' && args[i + 1]) {
      targetUrl = args[i + 1];
    } else if (args[i] === '--company' && args[i + 1]) {
      company = args[i + 1];
    }
  }

  if (!targetUrl) {
    console.error('Usage: npx tsx src/cli.ts --url <career_url> [--company <name>]');
    process.exit(1);
  }

  console.log(`🚀 Starting Universal Career Apply for: ${company}`);
  console.log(`Target: ${targetUrl}`);

  const browser = await chromium.launch({
    channel: 'chrome',
    headless: process.env.HEADLESS !== 'false',
    args: ['--disable-dev-shm-usage', '--disable-gpu']
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 950 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:132.0) Gecko/20100101 Firefox/132.0'
  });

  try {
    const result = await UniversalCareerSolver.applyToUrl(context, targetUrl, company);
    console.log('\n==================================================');
    console.log(`Apply Result: ${result.success ? '✅ SUCCESS' : '⚠️ INCOMPLETE / NEEDS MANUAL'}`);
    console.log(`Reason: ${result.reason}`);
    console.log(`Fields Filled: ${result.fieldsFilled}`);
    console.log(`Resume Attached: ${result.resumeAttached}`);
    if (result.screenshotPath) console.log(`Screenshot: ${result.screenshotPath}`);
    console.log('==================================================\n');

    process.exit(result.success ? 0 : 2);
  } finally {
    await browser.close();
  }
}

main().catch(err => {
  console.error('Fatal CLI Error:', err);
  process.exit(1);
});
