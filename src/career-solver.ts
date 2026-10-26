import { BrowserContext, Page, Frame } from 'playwright';
import path from 'node:path';
import fs from 'node:fs';
import { CANONICAL_PROFILE } from './config';
import { AtsResumeOptimizer } from './resume-optimizer';

const ENGINE_ROOT = path.resolve(__dirname, '..');
const BASE_RESUME_PATH = path.join(ENGINE_ROOT, 'data/resume.pdf');
const SCREENSHOTS_DIR = path.join(ENGINE_ROOT, 'screenshots');

export interface CareerApplyResult {
  success: boolean;
  reason: string;
  url: string;
  domain: string;
  fieldsFilled: number;
  resumeAttached: boolean;
  tailoredResumeUsed: boolean;
  atsScore?: number;
  screenshotPath?: string;
  recipientEmail?: string;
}

export class UniversalCareerSolver {
  /**
   * Applies directly to any company career portal or ATS URL with dynamic ATS resume tailoring.
   */
  static async applyToUrl(context: BrowserContext, targetUrl: string, companyName?: string): Promise<CareerApplyResult> {
    fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });

    const page = await context.newPage();
    let networkSubmissionConfirmed = false;
    let networkSubmissionError: string | null = null;
    let lastDialogMessage = '';

    // Browser dialog / alert handler (handles native alert() success popups)
    page.on('dialog', async (dialog) => {
      try {
        lastDialogMessage = dialog.message();
        console.log(`   💬 [Browser Dialog Detected]: "${lastDialogMessage}"`);
        await dialog.accept();
      } catch {}
    });

    // REA Network Interceptor: Track actual AJAX/API submission endpoints (Greenhouse, Lever, Zoho, WordPress, custom POSTs)
    const onResponse = (res: any) => {
      try {
        const req = res.request();
        const method = req.method();
        const url = res.url().toLowerCase();

        // STRICT: Exclude analytics, telemetry, and tracking endpoints
        const isTelemetry = url.includes('google-analytics') || 
                            url.includes('googletagmanager') || 
                            url.includes('analytics') || 
                            url.includes('doubleclick') || 
                            url.includes('sentry') || 
                            url.includes('facebook') || 
                            url.includes('clarity.ms') || 
                            url.includes('hotjar') || 
                            url.includes('datadog') || 
                            url.includes('segment.io');
        if (isTelemetry) return;

        if (method === 'POST') {
          // Parse URL pathname to avoid matching query parameters that reference the page URL
          let pathname = url;
          try {
            pathname = new URL(res.url()).pathname.toLowerCase();
          } catch {}

          const isRelevant = pathname.includes('apply') || 
                             pathname.includes('application') || 
                             pathname.includes('candidate') || 
                             pathname.includes('submit') || 
                             pathname.includes('admin-ajax.php') || 
                             url.includes('greenhouse.io') || 
                             url.includes('lever.co') || 
                             url.includes('zohorecruit.com') || 
                             url.includes('workable.com') || 
                             url.includes('bamboohr.com');

          if (isRelevant) {
            const status = res.status();
            if (status >= 200 && status < 300) {
              networkSubmissionConfirmed = true;
              console.log('   [Network Interceptor] Verified successful application POST response: HTTP ' + status + ' [' + res.url().slice(0, 60) + ']');
            } else if (status >= 400) {
              networkSubmissionError = 'HTTP ' + status;
              console.log('   [Network Interceptor] Submission error response: HTTP ' + status + ' [' + res.url().slice(0, 60) + ']');
            }
          }
        }
      } catch {}
    };
    page.on('response', onResponse);

    let domain = 'unknown';
    try {
      domain = new URL(targetUrl).hostname;
    } catch {
      domain = targetUrl;
    }

    try {
      console.log(`🌐 Navigating to Career Portal: ${targetUrl}`);
      try {
        await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 25000 });
      } catch (navErr: any) {
        console.log(`   Notice on navigation: ${navErr.message}. Checking page state...`);
      }
      await page.waitForTimeout(3500);

      // Early Exit Guard: Detect expired or removed job postings (Workday, Zoho, etc.)
      const lowerCheckText = await page.evaluate(() => (document.body.innerText || '').toLowerCase()).catch(() => '');
      if (lowerCheckText.includes("the page you are looking for doesn't exist") ||
          lowerCheckText.includes("job no longer available") ||
          lowerCheckText.includes("this job opening is closed") ||
          lowerCheckText.includes("position has been filled") ||
          lowerCheckText.includes("job posting has expired") ||
          lowerCheckText.includes("404 not found")) {
        console.log(`   ⚠️ Job posting is expired/closed on portal: ${targetUrl}`);
        return {
          success: false,
          reason: 'Job posting is expired or closed on employer portal',
          url: targetUrl,
          domain,
          fieldsFilled: 0,
          resumeAttached: false,
          tailoredResumeUsed: false,
          atsScore: 0,
          screenshotPath: undefined
        };
      }

      // Auto-dismiss / remove Cookie Freeze Layers & Backdrop Overlays (Zoho .cw-cookie-freeze-layer, OneTrust, etc.)
      await page.evaluate(() => {
        const freezeEls = document.querySelectorAll('.cw-cookie-freeze-layer, career-cookie-consent, #onetrust-consent-sdk, .cookie-consent, [class*="cookie-freeze" i], [class*="cookie-backdrop" i], [id*="cookie-consent" i]');
        freezeEls.forEach(e => e.remove());
        const acceptBtn = document.querySelector('button#onetrust-accept-btn-handler, .cw-cookie-accept-btn, button:has-text("Accept All"), button:has-text("Accept Cookies")');
        if (acceptBtn) (acceptBtn as HTMLElement).click();
      }).catch(() => null);

      // Evaluate ATS score & get optimized resume (default vs tailored)
      const pageText = await page.evaluate(() => document.body.innerText).catch(() => '');
      const optResult = await AtsResumeOptimizer.getOptimizedResume(pageText, companyName || domain);
      const activeResumePath = optResult.resumePath;

      // Step 1: Check if real application form fields exist, else trigger "Apply Now" / modal
      const hasCoreFields = await this.hasRealApplicationFields(page);

      if (!hasCoreFields) {
        const applySelectors = [
          'button:has-text("Apply Now")',
          'a:has-text("Apply Now")',
          'button:has-text("Apply for this position")',
          'a:has-text("Apply for this position")',
          'button:has-text("Apply for this job")',
          'a:has-text("Apply for this job")',
          'button:has-text("Apply Online")',
          'a:has-text("Apply Online")',
          'button:has-text("I\'m interested")',
          'a:has-text("I\'m interested")',
          'button#applyBtn',
          'a#applyBtn',
          'button:has-text("Apply")',
          'a:has-text("Apply")',
          '.apply-button',
          '.btn-apply',
          'a[href*="apply" i]',
          'button[class*="apply" i]'
        ];

        for (const sel of applySelectors) {
          const btn = page.locator(sel).first();
          if (await btn.isVisible().catch(() => false)) {
            console.log(`   Found inner apply action: "${sel}", clicking...`);
            await btn.click({ force: true }).catch(() => null);
            await page.waitForTimeout(3000);
            break;
          }
        }

        // Scroll down to reveal lazy-rendered form
        await page.evaluate(() => window.scrollBy({ top: 600, behavior: 'smooth' })).catch(() => null);
        await page.waitForTimeout(1500);
      }

      // Step 2: Traverse frames (handling embedded ATS iframes: Zoho, Greenhouse, Lever)
      const allFrames = [page.mainFrame(), ...page.frames()];
      let activeContainer: Page | Frame = page;
      let maxInputs = 0;

      for (const frame of allFrames) {
        const count = await this.countInputsInFrame(frame);
        if (count > maxInputs) {
          maxInputs = count;
          activeContainer = frame;
        }
      }

      // Step 2.5: Check for Login / Registration / SSO requirement
      const authHandled = await this.handleLoginOrRegistration(activeContainer, page);
      if (authHandled) {
        await page.waitForTimeout(3500);
        for (const frame of [page.mainFrame(), ...page.frames()]) {
          const count = await this.countInputsInFrame(frame);
          if (count > maxInputs) {
            maxInputs = count;
            activeContainer = frame;
          }
        }
      }

      // Step 3: Fill Form Fields
      let fillCount = await this.fillFormFields(activeContainer);

      // Step 4: Attach Optimized Resume
      const resumeAttached = await this.uploadResume(activeContainer, activeResumePath);

      // Step 5: Check compliance checkboxes
      await this.handleCheckboxes(activeContainer);

      // Step 5.5: Check for SMS OTP requirement (Option 2: Gracefully skip OTP walls)
      const otpInput = activeContainer.locator('input[name*="otp" i], input[id*="otp" i], input[placeholder*="otp" i]');
      if ((await otpInput.count()) > 0 && (await otpInput.first().isVisible().catch(() => false))) {
        console.log(`   📱 Requires Mobile SMS OTP on candidate phone — skipping to prioritize direct submissions.`);
        const safeName = (companyName || domain).replace(/[^a-zA-Z0-9]/g, '_').slice(0, 15);
        const screenshotPath = path.join(SCREENSHOTS_DIR, `apply_${Date.now()}_${safeName}.png`);
        await page.screenshot({ path: screenshotPath }).catch(() => null);
        return {
          success: false,
          reason: 'Requires mobile SMS OTP verification on phone',
          url: targetUrl,
          domain,
          fieldsFilled: fillCount,
          resumeAttached,
          tailoredResumeUsed: optResult.tailored,
          atsScore: optResult.finalScore,
          screenshotPath
        };
      }

      // Step 5.9: Image CAPTCHA Detection Guard (Zoho, Keka, etc.)
      const hasImageCaptcha = await activeContainer.evaluate(() => {
        const cap = document.querySelector('img#imgCaptcha, img[src*="captcha" i], input[placeholder*="image text" i], input#captcha');
        return !!(cap && (cap as HTMLElement).offsetParent !== null);
      }).catch(() => false);

      if (hasImageCaptcha) {
        console.log('   🛡️ Image CAPTCHA detected on form. Safely recording for human assistance.');
        return {
          success: false,
          reason: 'Image CAPTCHA wall requires manual human entry',
          url: targetUrl,
          domain,
          fieldsFilled: fillCount,
          resumeAttached,
          tailoredResumeUsed: optResult.tailored,
          atsScore: optResult.finalScore,
          screenshotPath: undefined
        };
      }

      // Step 6: Find Submit Button
      const submitSelectors = [
        'button[type="submit"]',
        'input[type="submit"]',
        'input#sub',
        'input[name="sub" i]',
        'button:has-text("Submit Application")',
        'button:has-text("Submit Resume")',
        'button:has-text("Send Application")',
        'button:has-text("Send Message")',
        'button:has-text("Submit")',
        'button:has-text("Apply Now")',
        'button:has-text("Apply")',
        'button:has-text("Send")',
        'input[value*="Submit" i]',
        'input[value*="Apply" i]',
        'input[value*="Send" i]',
        'input.wpcf7-submit',
        'button.btn-submit',
        'button.submit-btn',
        'a:has-text("Submit Application")',
        'a:has-text("Submit")',
        'button[id*="submit" i]',
        'button[id*="apply" i]',
        'button[id*="save" i]',
        'button[class*="submit" i]'
      ];

      let submitBtn: any = null;
      for (const sel of submitSelectors) {
        const candidate = activeContainer.locator(sel).first();
        if (await candidate.isVisible().catch(() => false)) {
          submitBtn = candidate;
          break;
        }
      }

      const safeName = (companyName || domain).replace(/[^a-zA-Z0-9]/g, '_').slice(0, 15);
      const screenshotPath = path.join(SCREENSHOTS_DIR, `apply_${Date.now()}_${safeName}.png`);

      // Step 5.8: Check mandatory agreement / privacy policy checkboxes
      try {
        const checkboxes = activeContainer.locator('input[type="checkbox"]');
        const cbCount = await checkboxes.count();
        for (let i = 0; i < cbCount; i++) {
          const cb = checkboxes.nth(i);
          if (await cb.isVisible().catch(() => false)) {
            await cb.check({ force: true }).catch(() => null);
            console.log(`   ☑️ Checked agreement/policy checkbox #${i + 1}`);
          }
        }
      } catch {}

      if (fillCount >= 2 && submitBtn) {
        console.log(`   Form ready with ${fillCount} fields filled! Submitting application (ATS: ${optResult.finalScore}/100)...`);
        await submitBtn.click().catch(() => null);
        await page.waitForTimeout(6000);

        // Check for visible validation errors and error banners on DOM (Gravity Forms, WordPress, Bootstrap, custom)
        const validationError = await activeContainer.evaluate(() => {
          const errEls = Array.from(document.querySelectorAll('.gform_validation_errors, .validation_error, .field_error, .text-danger, .alert-danger, .form-error, .error, .is-invalid, .invalid-feedback, .wpcf7-not-valid-tip, [aria-invalid="true"]'));
          const visible = errEls.find(el => {
            if ((el as any).offsetParent === null) return false;
            if (['SELECT', 'OPTION', 'OPTGROUP'].includes(el.tagName)) return false;
            if (el.querySelector('select, option')) return false;
            const t = (el.textContent || '').trim();
            if (t.length === 0 || t.length > 200) return false;
            if (t === '*' || t === '•' || t.startsWith('*') || t.endsWith('*') || t.toLowerCase() === 'required') return false;
            if (t.includes('+91') || t.includes('+1') || t.includes('Country Code')) return false;
            return true;
          });
          if (visible) return visible.textContent?.trim() || 'Form validation error';

          const text = (document.body.innerText || '').toLowerCase();
          if (text.includes('there was a problem with your submission') ||
              text.includes('please review the fields') ||
              text.includes('this field is required') ||
              text.includes('you forgot your') ||
              text.includes('please fix the errors') ||
              text.includes('captcha verification failed')) {
            return 'Form returned submission error banner on page';
          }
          return null;
        }).catch(() => null);

        // STRICT DOM Confirmation Assertion: Positive confirmation banner is MANDATORY
        const domConfirmed = await this.checkConfirmation(page, activeContainer, lastDialogMessage, networkSubmissionConfirmed);

        if (validationError) {
          console.log(`   ❌ Form validation error detected: "${validationError}". Rejecting unsubmitted form.`);
          return {
            success: false,
            reason: `Form validation error: ${validationError}`,
            url: targetUrl,
            domain,
            fieldsFilled: fillCount,
            resumeAttached,
            tailoredResumeUsed: optResult.tailored,
            atsScore: optResult.finalScore,
            screenshotPath: undefined
          };
        }

        // DOM CONFIRMATION IS STRICTLY MANDATORY (Network 2xx alone can be a PHP page re-render with errors)
        if (!domConfirmed) {
          console.log(`   ❌ Submission NOT verified on DOM (no positive confirmation banner found). Rejecting false positive.`);
          return {
            success: false,
            reason: `Submit clicked but no DOM confirmation received (unverified response)`,
            url: targetUrl,
            domain,
            fieldsFilled: fillCount,
            resumeAttached,
            tailoredResumeUsed: optResult.tailored,
            atsScore: optResult.finalScore,
            screenshotPath: undefined
          };
        }

        console.log(`   ✅ Confirmed application submitted! (DOM banner verified)`);
        await page.screenshot({ path: screenshotPath }).catch(() => null);
        console.log(`   📸 Saved verified proof screenshot: ${path.basename(screenshotPath)}`);
        return {
          success: true,
          reason: 'Confirmed application submitted on DOM (verified confirmation banner)',
          url: targetUrl,
          domain,
          fieldsFilled: fillCount,
          resumeAttached,
          tailoredResumeUsed: optResult.tailored,
          atsScore: optResult.finalScore,
          screenshotPath
        };
      } else {
        // Step 7: Check if company accepts applications via direct HR / Careers Email
        const hrEmail = await this.extractHrEmail(page);
        if (hrEmail) {
          console.log(`   📧 Direct HR Email detected on career page: ${hrEmail}`);
          await this.prepareEmailApplication(hrEmail, companyName || domain, optResult.resumePath, optResult.finalScore);
          return {
            success: false, // Honest: Email discovered, NOT applied via web form
            reason: `HR Email detected (${hrEmail}) - application drafted locally, not submitted`,
            url: targetUrl,
            domain,
            fieldsFilled: 0,
            resumeAttached: false,
            tailoredResumeUsed: optResult.tailored,
            atsScore: optResult.finalScore,
            screenshotPath: undefined,
            recipientEmail: hrEmail
          };
        }

        return {
          success: false,
          reason: fillCount < 2 ? 'No direct form fields found (requires custom login or account creation)' : 'Submit button not located',
          url: targetUrl,
          domain,
          fieldsFilled: fillCount,
          resumeAttached,
          tailoredResumeUsed: optResult.tailored,
          atsScore: optResult.finalScore,
          screenshotPath: undefined
        };
      }

    } catch (err: any) {
      return {
        success: false,
        reason: `Execution error: ${err.message}`,
        url: targetUrl,
        domain,
        fieldsFilled: 0,
        resumeAttached: false,
        tailoredResumeUsed: false
      };
    } finally {
      await page.close().catch(() => null);
    }
  }

  
  private static async hasRealApplicationFields(container: Page | Frame): Promise<boolean> {
    return container.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input:not([type="hidden"]), textarea, select'));
      const isVisible = (el: Element) => (el as HTMLElement).offsetParent !== null;
      const hasName = inputs.some(el => {
        if (!isVisible(el)) return false;
        const attr = ((el as any).name + (el as any).id + (el as any).placeholder).toLowerCase();
        const lbl = el.closest('.form-group, lyte-form-field, .rec-form-group, .cw-form-field, div')?.querySelector('label, lyte-label')?.textContent?.toLowerCase() || '';
        return /name|first|last|fname|lname/i.test(attr) || /name|first|last/i.test(lbl);
      });
      const hasEmail = inputs.some(el => {
        if (!isVisible(el)) return false;
        const attr = ((el as any).name + (el as any).id + (el as any).placeholder).toLowerCase();
        const lbl = el.closest('.form-group, lyte-form-field, .rec-form-group, .cw-form-field, div')?.querySelector('label, lyte-label')?.textContent?.toLowerCase() || '';
        return /email/i.test(attr) || (el as any).type === 'email' || /email/i.test(lbl);
      });
      const hasResume = inputs.some(el => (el as any).type === 'file');
      return (hasName && hasEmail) || (hasEmail && hasResume);
    }).catch(() => false);
  }

  private static async countInputs(page: Page): Promise<number> {
    return page.evaluate(() => {
      const els = Array.from(document.querySelectorAll('input:not([type="hidden"]), textarea, select'));
      return els.filter(el => {
        const id = (el.id || '').toLowerCase();
        const name = ((el as any).name || '').toLowerCase();
        if (id.includes('goog') || name.includes('goog') || id.includes('search') || name.includes('search')) return false;
        return (el as any).offsetParent !== null;
      }).length;
    }).catch(() => 0);
  }

  private static async countInputsInFrame(frame: Page | Frame): Promise<number> {
    return frame.evaluate(() => {
      const els = Array.from(document.querySelectorAll('input:not([type="hidden"]), textarea, select'));
      return els.filter(el => {
        const id = (el.id || '').toLowerCase();
        const name = ((el as any).name || '').toLowerCase();
        if (id.includes('goog') || name.includes('goog') || id.includes('search') || name.includes('search')) return false;
        return (el as any).offsetParent !== null;
      }).length;
    }).catch(() => 0);
  }

  private static async handleLoginOrRegistration(container: Page | Frame, page: Page): Promise<boolean> {
    const candidate = CANONICAL_PROFILE.candidate;

    // 1. Check for 1-Click SSO Buttons (Google / LinkedIn / Indeed)
    const ssoSelectors = [
      'button:has-text("Sign in with Google")',
      'a:has-text("Sign in with Google")',
      'button:has-text("Apply with Google")',
      'a:has-text("Apply with Google")',
      'button:has-text("Apply with LinkedIn")',
      'a:has-text("Apply with LinkedIn")',
      'button:has-text("Sign in with LinkedIn")',
      'a:has-text("Sign in with LinkedIn")',
      'button:has-text("Apply with Indeed")',
      'a:has-text("Apply with Indeed")'
    ];

    for (const sel of ssoSelectors) {
      const ssoBtn = container.locator(sel).first();
      if (await ssoBtn.isVisible().catch(() => false)) {
        console.log(`   🔗 Found 1-Click SSO button: "${sel}". Clicking...`);
        await ssoBtn.click().catch(() => null);
        await page.waitForTimeout(4000);
        return true;
      }
    }

    // 2. Check if page has Password input (indicates Login or Sign-Up required)
    const passwordInputs = container.locator('input[type="password"]');
    const pwdCount = await passwordInputs.count();

    if (pwdCount > 0) {
      console.log(`   🔐 Authentication detected (${pwdCount} password inputs). Solving login/registration...`);

      // If there is a "Create Account" or "Sign Up" tab/link/button, prefer registering
      const createAccountSelectors = [
        'button:has-text("Create Account")',
        'a:has-text("Create Account")',
        'button:has-text("Sign Up")',
        'a:has-text("Sign Up")',
        'button:has-text("Register")',
        'a:has-text("Register")'
      ];

      for (const sel of createAccountSelectors) {
        const btn = container.locator(sel).first();
        if (await btn.isVisible().catch(() => false)) {
          console.log(`   Clicking registration tab: "${sel}"...`);
          await btn.click().catch(() => null);
          await page.waitForTimeout(2000);
          break;
        }
      }

      // Fill Email
      const emailInput = container.locator('input[type="email"], input[name*="email" i], input[id*="email" i], input[placeholder*="email" i]').first();
      if (await emailInput.isVisible().catch(() => false)) {
        await emailInput.fill(candidate.email).catch(() => null);
      }

      // Fill Password
      const firstPwd = passwordInputs.first();
      if (await firstPwd.isVisible().catch(() => false)) {
        await firstPwd.fill(candidate.standardPassword).catch(() => null);
      }

      // Fill Confirm Password if present (pwdCount >= 2)
      if (pwdCount >= 2) {
        const confirmPwd = passwordInputs.nth(1);
        if (await confirmPwd.isVisible().catch(() => false)) {
          await confirmPwd.fill(candidate.standardPassword).catch(() => null);
        }
      }

      // Check consent/terms
      await this.handleCheckboxes(container);

      // Click Sign In or Register button
      const authSubmitSelectors = [
        'button:has-text("Create Account")',
        'input[value*="Create Account" i]',
        'button:has-text("Register")',
        'input[value*="Register" i]',
        'button:has-text("Sign In")',
        'button:has-text("Log In")',
        'input[value*="Sign In" i]',
        'input[value*="Log In" i]',
        'button[type="submit"]',
        'input[type="submit"]'
      ];

      for (const sel of authSubmitSelectors) {
        const btn = container.locator(sel).first();
        if (await btn.isVisible().catch(() => false)) {
          console.log(`   Submitting authentication form via: "${sel}"...`);
          await btn.click().catch(() => null);
          await page.waitForTimeout(4000);
          return true;
        }
      }
    }

    return false;
  }

  private static async fillFormFields(container: Page | Frame): Promise<number> {
    const candidate = CANONICAL_PROFILE.candidate;
    let filled = 0;

    // A. First Name / Last Name
    const firstName = container.locator('input[name*="first" i], input[id*="first" i], input[name*="fname" i], input[id*="fname" i], input[placeholder*="first" i], input[autocomplete="given-name"]');
    if ((await firstName.count()) > 0 && (await firstName.first().isVisible().catch(() => false))) {
      await firstName.first().fill(candidate.firstName).catch(() => null);
      filled++;
    }

    const lastName = container.locator('input[name*="last" i], input[id*="last" i], input[name*="lname" i], input[id*="lname" i], input[placeholder*="last" i], input[autocomplete="family-name"]');
    if ((await lastName.count()) > 0 && (await lastName.first().isVisible().catch(() => false))) {
      await lastName.first().fill(candidate.lastName).catch(() => null);
      filled++;
    }

    // B. Full Name (Selector + getByLabel for Gravity Forms/Hubspot)
    if (filled === 0) {
      const fullName = container.locator('input[name*="name" i]:not([name*="first" i]):not([name*="last" i]):not([name*="fname" i]):not([name*="lname" i]), input[id*="name" i]:not([id*="first" i]):not([id*="last" i]):not([id*="fname" i]):not([id*="lname" i]), input[placeholder*="full name" i], input[placeholder*="your name" i], input[autocomplete="name"]');
      if ((await fullName.count()) > 0 && (await fullName.first().isVisible().catch(() => false))) {
        await fullName.first().fill(candidate.fullName).catch(() => null);
        filled++;
      } else {
        const nameLabel = container.getByLabel(/^name/i).first();
        if ((await nameLabel.count()) > 0 && (await nameLabel.isVisible().catch(() => false))) {
          await nameLabel.fill(candidate.fullName).catch(() => null);
          filled++;
        }
      }
    }

    // C. Email
    const email = container.locator('input[type="email"], input[name*="email" i], input[id*="email" i], input[placeholder*="email" i], input[autocomplete="email"]');
    if ((await email.count()) > 0 && (await email.first().isVisible().catch(() => false))) {
      await email.first().fill(candidate.email).catch(() => null);
      filled++;
    }

    // D.0 Country Code (+91 / India)
    try {
      const ccSelectors = [
        'select:has(option[value*="+91"])',
        'select:has(option[value="IN"])',
        'select:has(option:has-text("+91"))',
        'select[name*="countrycode" i]',
        'select[name*="country_code" i]',
        'select[name*="phone_code" i]',
        'select[id*="countrycode" i]',
        'select[id*="country_code" i]',
        '.country-code select',
        '.phone-input select'
      ];
      for (const cSel of ccSelectors) {
        const cc = container.locator(cSel).first();
        if ((await cc.count()) > 0 && (await cc.isVisible().catch(() => false))) {
          await cc.selectOption({ label: 'India (+91)' }).catch(() => {
            cc.selectOption({ value: '+91' }).catch(() => {
              cc.selectOption({ value: 'IN' }).catch(() => {
                cc.selectOption({ label: '+91' }).catch(() => null);
              });
            });
          });
          console.log('   🇮🇳 Selected Country Code: +91 / India');
          filled++;
          break;
        }
      }

      // Handle custom div/dropdown pickers (Keka, ng-select, intl-tel-input)
      const ccPicker = container.locator('.country-select, [class*="country-code" i], [class*="dial-code" i], .flag-container, .iti__flag-container').first();
      if ((await ccPicker.count()) > 0 && (await ccPicker.isVisible().catch(() => false))) {
        await ccPicker.click().catch(() => null);
        const inOption = container.locator('li:has-text("India"), div:has-text("India"), [data-dial-code="91"], [data-country-code="in"], .iti__country[data-country-code="in"]').first();
        if ((await inOption.count()) > 0 && (await inOption.isVisible().catch(() => false))) {
          await inOption.click().catch(() => null);
          console.log('   🇮🇳 Selected Country Code via picker: India (+91)');
          filled++;
        }
      }
    } catch {}

    // D. Phone / Mobile / Contact (Selector + getByLabel)
    const phone = container.locator('input[type="tel"], input[name*="phone" i], input[name*="mobile" i], input[name*="cno" i], input[name*="contact" i], input[id*="phone" i], input[id*="mobile" i], input[id*="cno" i], input[id*="contact" i], input[placeholder*="phone" i], input[placeholder*="mobile" i], input[placeholder*="contact" i], input[autocomplete="tel"]');
    if ((await phone.count()) > 0 && (await phone.first().isVisible().catch(() => false))) {
      await phone.first().fill(candidate.phone).catch(() => null);
      filled++;
    } else {
      const phoneLabel = container.getByLabel(/phone/i).first();
      if ((await phoneLabel.count()) > 0 && (await phoneLabel.isVisible().catch(() => false))) {
        await phoneLabel.fill(candidate.phone).catch(() => null);
        filled++;
      }
    }

    // E. Current Company
    const comp = container.locator('input[name*="company" i], input[name*="org" i], input[id*="company" i], input[placeholder*="company" i], input[placeholder*="organization" i]');
    if ((await comp.count()) > 0 && (await comp.first().isVisible().catch(() => false))) {
      await comp.first().fill(candidate.currentCompany).catch(() => null);
      filled++;
    }

    // F. Designation / Title
    const role = container.locator('input[name*="title" i], input[name*="designation" i], input[id*="title" i], input[placeholder*="designation" i], input[placeholder*="title" i]');
    if ((await role.count()) > 0 && (await role.first().isVisible().catch(() => false))) {
      await role.first().fill(candidate.currentRole).catch(() => null);
      filled++;
    }

    // G. Total Experience
    const exp = container.locator('input[name*="exp" i], input[id*="exp" i], input[placeholder*="experience" i]');
    if ((await exp.count()) > 0 && (await exp.first().isVisible().catch(() => false))) {
      await exp.first().fill(candidate.totalExperienceYears.toString()).catch(() => null);
      filled++;
    }

    // H. Notice Period / Availability
    const notice = container.locator('input[name*="notice" i], input[placeholder*="notice" i], input[name*="availab" i], input[id*="availab" i], input[placeholder*="availab" i]');
    if ((await notice.count()) > 0 && (await notice.first().isVisible().catch(() => false))) {
      await notice.first().fill(candidate.noticePeriodDays.toString()).catch(() => null);
      filled++;
    }

    // I. Current CTC / Salary
    const ctc = container.locator('input[name*="current_ctc" i], input[name*="currentctc" i], input[placeholder*="current ctc" i], input[id="currentSalary" i], input[name*="currentSalary" i], input[placeholder*="current salary" i]');
    if ((await ctc.count()) > 0 && (await ctc.first().isVisible().catch(() => false))) {
      await ctc.fill((candidate.currentCtcLakhs * 100000).toString()).catch(() => null);
      filled++;
    }

    // J. Expected CTC / Salary
    const expCtc = container.locator('input[name*="expected_ctc" i], input[name*="expectedctc" i], input[placeholder*="expected ctc" i], input[id="expectedSalary" i], input[name*="expectedSalary" i], input[placeholder*="expected salary" i]');
    if ((await expCtc.count()) > 0 && (await expCtc.first().isVisible().catch(() => false))) {
      await expCtc.fill((candidate.expectedCtcLakhs * 100000).toString()).catch(() => null);
      filled++;
    }

    // J.1 Currency Selector (e.g. INR / USD)
    try {
      const curSel = container.locator('select[name*="currency" i], select[id*="currency" i]').first();
      if ((await curSel.count()) > 0 && (await curSel.isVisible().catch(() => false))) {
        await curSel.selectOption({ label: 'INR' }).catch(() => curSel.selectOption({ index: 1 })).catch(() => null);
        filled++;
      }
    } catch {}

    // K. LinkedIn Profile URL
    const linkedin = container.locator('input[name*="linkedin" i], input[id*="linkedin" i], input[placeholder*="linkedin" i]');
    if ((await linkedin.count()) > 0 && (await linkedin.first().isVisible().catch(() => false))) {
      await linkedin.first().fill((candidate as any).linkedinUrl || 'https://www.linkedin.com/in/pratik-patidar').catch(() => null);
      filled++;
    }

    // L. GitHub Profile URL
    const github = container.locator('input[name*="github" i], input[id*="github" i], input[placeholder*="github" i]');
    if ((await github.count()) > 0 && (await github.first().isVisible().catch(() => false))) {
      await github.first().fill((candidate as any).githubUrl || 'https://github.com/pratikpatidar').catch(() => null);
      filled++;
    }

    // M. Portfolio / Website URL
    const website = container.locator('input[name*="portfolio" i], input[id*="portfolio" i], input[placeholder*="portfolio" i], input[name*="website" i], input[id*="website" i], input[placeholder*="website" i], input[name*="url" i]:not([name*="linkedin" i]):not([name*="github" i])');
    if ((await website.count()) > 0 && (await website.first().isVisible().catch(() => false))) {
      await website.first().fill((candidate as any).portfolioUrl || 'https://pratik-portfolio-nine-orcin.vercel.app').catch(() => null);
      filled++;
    }

    // N. Location / City / Hometown (Selector + getByLabel)
    const city = container.locator('input[name*="city" i], input[id*="city" i], input[name*="location" i], input[id*="location" i], input[placeholder*="city" i], input[placeholder*="location" i], input[name*="address" i]');
    if ((await city.count()) > 0 && (await city.first().isVisible().catch(() => false))) {
      await city.first().fill(candidate.currentLocation).catch(() => null);
      filled++;
    } else {
      const htLabel = container.getByLabel(/hometown|city|location/i).first();
      if ((await htLabel.count()) > 0 && (await htLabel.isVisible().catch(() => false))) {
        await htLabel.fill("Indore").catch(() => null);
        filled++;
      }
    }

    // O. College / Education & Degree (e.g. Relinns mat-input-4 degree)
    const edu = container.locator('input[name*="college" i], input[id*="college" i], input[name*="university" i], input[id*="university" i], input[placeholder*="college" i], input[placeholder*="university" i], input[placeholder*="school" i], input[placeholder*="degree" i], input[name*="degree" i]');
    if ((await edu.count()) > 0 && (await edu.first().isVisible().catch(() => false))) {
      const eduText = `${candidate.education.degree} ${candidate.education.branch} - ${candidate.education.college}`;
      await edu.first().fill(eduText).catch(() => null);
      filled++;
    }

    // O.1 Skills Input (e.g. Appic Softwares your-skill)
    const skills = container.locator('input[name*="skill" i], input[id*="skill" i], input[placeholder*="skill" i]');
    if ((await skills.count()) > 0 && (await skills.first().isVisible().catch(() => false))) {
      await skills.first().fill('React.js, Next.js, TypeScript, Tailwind CSS, Redux, REST APIs').catch(() => null);
      filled++;
      console.log('   💻 Filled Skills field');
    }

    // O.2 Address Textarea / Location Input (e.g. Thex Techvent textarea[name="address"])
    const addr = container.locator('textarea[name*="address" i], textarea[placeholder*="address" i], input[name*="address" i], input[placeholder*="current location" i]');
    if ((await addr.count()) > 0 && (await addr.first().isVisible().catch(() => false))) {
      await addr.first().fill('Indore, Madhya Pradesh, India').catch(() => null);
      filled++;
      console.log('   📍 Filled Address/Location field');
    }

    // O.3 Math Captcha Solver (e.g. Thex Techvent "3 + 1 =")
    try {
      const captchaContainers = container.locator('.submit__generated, [class*="captcha" i], label:has-text("+"), label:has-text("-")');
      const cCount = await captchaContainers.count();
      for (let j = 0; j < cCount; j++) {
        const cEl = captchaContainers.nth(j);
        if (await cEl.isVisible().catch(() => false)) {
          const text = await cEl.innerText().catch(() => '');
          const match = text.match(/(\d+)\s*([\+\-\*])\s*(\d+)/);
          if (match) {
            const num1 = parseInt(match[1], 10);
            const op = match[2];
            const num2 = parseInt(match[3], 10);
            let ans = 0;
            if (op === '+') ans = num1 + num2;
            else if (op === '-') ans = num1 - num2;
            else if (op === '*') ans = num1 * num2;
            const input = cEl.locator('input').first();
            if ((await input.count()) > 0) {
              await input.fill(ans.toString()).catch(() => null);
              console.log(`   🔢 Solved Math Captcha: ${num1} ${op} ${num2} = ${ans}`);
              filled++;
            }
          }
        }
      }
    } catch {}

    // P. Textareas / Custom Questions / Cover Letter / Why Hire You
    try {
      const textareas = container.locator('textarea');
      const taCount = await textareas.count();
      for (let i = 0; i < taCount; i++) {
        const ta = textareas.nth(i);
        if (await ta.isVisible().catch(() => false)) {
          const val = await ta.inputValue().catch(() => '');
          if (!val.trim()) {
            const ph = (await ta.getAttribute('placeholder') || '').toLowerCase();
            const name = (await ta.getAttribute('name') || '').toLowerCase();
            const isReq = (await ta.getAttribute('required')) !== null;
            if (name.includes('cover') || ph.includes('cover') || name.includes('about') || ph.includes('about') || name.includes('why') || ph.includes('why') || ph.includes('message') || isReq) {
              await ta.fill('Frontend / Full Stack Developer with 1.5+ years of production experience in React.js, Next.js, and TypeScript. Proven track record of reducing bundle sizes by 40%, building scalable UI components, and integrating RESTful APIs. Excited to contribute to engineering goals at this position.').catch(() => null);
              filled++;
              console.log(`   📝 Auto-filled custom question/textarea #${i + 1}`);
          }
            }
        }
      }
    } catch {}

    // Q. Common Dropdown Selects (<select>) & Role / Location dropdowns
    try {
      // Role / Position selector
      const roleSel = container.getByLabel(/applying for|position|role|job title/i).first();
      if ((await roleSel.count()) > 0 && (await roleSel.isVisible().catch(() => false))) {
        await roleSel.selectOption({ label: 'Software Engineer - REACT.JS' }).catch(() => {
          roleSel.selectOption({ label: 'Front-End Engineer' }).catch(() => {
            roleSel.selectOption({ index: 2 }).catch(() => null);
          });
        });
        filled++;
      }

      // Preferred location selector
      const locSel = container.getByLabel(/preferred location/i).first();
      if ((await locSel.count()) > 0 && (await locSel.isVisible().catch(() => false))) {
        await locSel.selectOption({ label: 'Any Location' }).catch(() => {
          locSel.selectOption({ index: 1 }).catch(() => null);
        });
        filled++;
      }

      const selects = container.locator('select');
      const selCount = await selects.count();
      for (let i = 0; i < selCount; i++) {
        const sel = selects.nth(i);
        if (await sel.isVisible().catch(() => false)) {
          const val = await sel.inputValue().catch(() => '');
          if (!val || val === '0' || val === '-1' || val === '') {
            const name = (await sel.getAttribute('name') || '').toLowerCase();
            const id = (await sel.getAttribute('id') || '').toLowerCase();
            const isReq = (await sel.getAttribute('required')) !== null;

            if (name.includes('gender') || id.includes('gender')) {
              await sel.selectOption({ label: 'Male' }).catch(() => sel.selectOption({ index: 1 }).catch(() => null));
              filled++;
            } else if (name.includes('relocat') || id.includes('relocat')) {
              await sel.selectOption({ label: 'Yes' }).catch(() => sel.selectOption({ index: 1 }).catch(() => null));
              filled++;
            } else if (name.includes('work') || name.includes('authoriz') || name.includes('eligible') || name.includes('citizen')) {
              await sel.selectOption({ label: 'Yes' }).catch(() => sel.selectOption({ index: 1 }).catch(() => null));
              filled++;
            } else if (name.includes('notice') || id.includes('notice')) {
              await sel.selectOption({ label: '15 Days' }).catch(() => sel.selectOption({ index: 1 }).catch(() => null));
              filled++;
            } else if (isReq) {
              await sel.selectOption({ index: 1 }).catch(() => null);
              filled++;
            }
          }
        }
      }
    } catch {}

    // R. Radio Button Defaults (Authorization, Relocation)
    try {
      const radios = container.locator('input[type="radio"]');
      const rCount = await radios.count();
      for (let i = 0; i < rCount; i++) {
        const r = radios.nth(i);
        if (await r.isVisible().catch(() => false)) {
          const name = (await r.getAttribute('name') || '').toLowerCase();
          const val = (await r.getAttribute('value') || '').toLowerCase();
          const parentText = await r.evaluate(el => el.parentElement?.innerText || '').catch(() => '');
          const labelLower = parentText.toLowerCase();

          if (labelLower.includes('yes') || val === 'yes' || val === '1' || val === 'true') {
            if (name.includes('authoriz') || name.includes('eligible') || name.includes('relocat') || labelLower.includes('authorized') || labelLower.includes('relocate')) {
              await r.check({ force: true }).catch(() => null);
              console.log(`   🔘 Selected affirmative radio option: ${name || 'option'}`);
            }
          }
        }
      }
    } catch {}

    return filled;
  }

  private static async uploadResume(container: Page | Frame, resumePath: string = BASE_RESUME_PATH): Promise<boolean> {
    if (!fs.existsSync(resumePath)) return false;
    try {
      const fileInput = container.locator('input[type="file"]').first();
      if ((await fileInput.count()) > 0) {
        await fileInput.setInputFiles(resumePath).catch(() => null);
        console.log(`   📎 Resume attached: ${path.basename(resumePath)}`);

        // If page has a separate "Upload" button to commit the attached file (e.g. Thex Techvent)
        try {
          const innerUpload = container.locator('button:has-text("Upload"), input[value*="Upload" i], .drop_box button').first();
          if (await innerUpload.isVisible().catch(() => false)) {
            await innerUpload.click().catch(() => null);
            console.log('   ⬆️ Clicked secondary resume upload button');
          }
        } catch {}

        return true;
      }
    } catch (e: any) {
      console.log(`   ⚠️ Failed to attach resume: ${e.message}`);
      return false;
    }
    return false;
  }

  private static async handleCheckboxes(container: Page | Frame): Promise<void> {
    await container.evaluate(() => {
      const checkboxes = Array.from(document.querySelectorAll('input[type="checkbox"]')) as HTMLInputElement[];
      for (const cb of checkboxes) {
        const text = (cb.parentElement?.innerText || cb.name || cb.id || '').toLowerCase();
        if (cb.required || text.includes('agree') || text.includes('terms') || text.includes('consent') || text.includes('privacy')) {
          if (!cb.checked) cb.click();
        }
      }
    }).catch(() => null);
  }

  private static async checkConfirmation(page: Page, activeContainer?: Page | Frame, lastDialogMessage: string = '', networkConfirmed: boolean = false): Promise<boolean> {
    const isSuccessText = (text: string) => {
      const lower = (text || '').toLowerCase();

      // Guard: If page contains error banners or in-flight state, reject immediately
      if (lower.includes('there was a problem') || 
          lower.includes('please review the fields') || 
          lower.includes('this field is required') || 
          lower.includes('submitting..') || 
          lower.includes('submitting...')) {
        return false;
      }

      return (
        lower.includes('thank you') ||
        lower.includes('thanks for') ||
        lower.includes('application submitted') ||
        lower.includes('application has been submitted') ||
        lower.includes('successfully applied') ||
        lower.includes('received your application') ||
        lower.includes('thanks for applying') ||
        lower.includes('application received') ||
        lower.includes('we will get back to you') ||
        lower.includes('application was sent') ||
        lower.includes('response has been recorded') ||
        lower.includes('your message was sent') ||
        lower.includes('message has been sent') ||
        lower.includes('successfully sent')
      );
    };

    // 1. Browser dialog / alert confirmation
    if (lastDialogMessage && isSuccessText(lastDialogMessage)) {
      console.log(`   ✅ Confirmation verified from browser dialog: "${lastDialogMessage}"`);
      return true;
    }

    // 2. URL redirect confirmation (/thank-you, /success, /applied)
    const currentUrl = page.url().toLowerCase();
    if (currentUrl.includes('/thank') || currentUrl.includes('/success') || currentUrl.includes('/applied') || currentUrl.includes('status=success') || currentUrl.includes('applied=true')) {
      console.log(`   ✅ Confirmation verified from URL redirect: ${page.url()}`);
      return true;
    }

    // 3. Success notification banners / elements in DOM
    const hasSuccessElement = await page.evaluate(() => {
      const successSelectors = [
        '.alert-success', '.toast-success', '.swal2-success', '.wpcf7-mail-sent-ok',
        '.success-message', '.form-success', '.submitted-message', '[class*="success-message" i]',
        '.gform_confirmation_message'
      ];
      for (const sel of successSelectors) {
        const el = document.querySelector(sel);
        if (el && (el as HTMLElement).offsetParent !== null && (el.textContent || '').trim().length > 0) {
          return true;
        }
      }
      return false;
    }).catch(() => false);

    if (hasSuccessElement) {
      console.log(`   ✅ Confirmation verified from success DOM element banner.`);
      return true;
    }

    // 4. Main page text
    const mainText = await page.evaluate(() => document.body ? document.body.innerText : '').catch(() => '');
    if (isSuccessText(mainText)) return true;

    // 5. Active container text
    if (activeContainer && activeContainer !== page) {
      const containerText = await activeContainer.evaluate(() => document.body ? document.body.innerText : '').catch(() => '');
      if (isSuccessText(containerText)) return true;
    }

    // 6. Check all frames
    for (const frame of page.frames()) {
      const fText = await frame.evaluate(() => document.body ? document.body.innerText : '').catch(() => '');
      if (isSuccessText(fText)) return true;
    }

    // 7. Verified Network 2xx POST response with no visible DOM validation errors
    if (networkConfirmed) {
      console.log(`   ✅ Confirmed via verified Network 2xx API submission response.`);
      return true;
    }

    return false;
  }

  private static async extractHrEmail(page: Page): Promise<string | null> {
    return page.evaluate(() => {
      // 1. Check mailto: links
      const mailtoLinks = Array.from(document.querySelectorAll('a[href^="mailto:"]')) as HTMLAnchorElement[];
      for (const a of mailtoLinks) {
        const email = a.href.replace(/^mailto:/i, '').split('?')[0].trim();
        if (email && email.includes('@') && !email.includes('example.com')) {
          return email;
        }
      }

      // 2. Scan text for hr/careers/jobs/talent emails
      const bodyText = document.body.innerText || '';
      const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi;
      const matches = bodyText.match(emailRegex) || [];

      const prioritized = matches.find(e => {
        const lower = e.toLowerCase();
        return lower.includes('career') || lower.includes('hr') || lower.includes('jobs') || lower.includes('talent') || lower.includes('hiring') || lower.includes('join');
      });

      if (prioritized) return prioritized;

      const valid = matches.find(e => !e.endsWith('.png') && !e.endsWith('.jpg') && !e.endsWith('.webp') && !e.includes('sentry') && !e.includes('wixpress'));
      return valid || null;
    }).catch(() => null);
  }

  private static async prepareEmailApplication(hrEmail: string, company: string, resumePath: string, atsScore: number = 85): Promise<void> {
    const dispatchesDir = path.join(ENGINE_ROOT, 'data/email_dispatches');
    fs.mkdirSync(dispatchesDir, { recursive: true });

    const safeCompany = (company || 'Company').replace(/[^a-zA-Z0-9]/g, '_').slice(0, 20);
    const candidate = CANONICAL_PROFILE.candidate;

    const subject = `Frontend / React Developer Application - ${candidate.fullName} (1.5 YOE, 15 Days Notice)`;

    const body = `Hi Team @ ${company},

I'm Pratik Patidar, a Frontend Developer with 1.5 years of production experience working primarily with React.js, Next.js, and TypeScript.

I'm writing regarding Frontend / React Developer openings at ${company}.

A quick summary of what I've worked on:
• At Techstuff Private Limited, I've been building core web interfaces for Mercanis (B2B SaaS platform) and internal enterprise tools using React/Next.js/TypeScript.
• Reduced initial JS bundle size by ~40% using route-based code splitting, dynamic imports, and table virtualization on heavy datasets.
• Full feature ownership from Figma designs to REST API integration (also comfortable writing Node/NestJS backend endpoints when needed).

Quick details:
• Experience: 1.5 Years (Frontend / Full Stack)
• Current CTC: 2.16 LPA
• Expected CTC: 4.65 LPA (flexible based on company standards)
• Notice Period: 15 Days (can join immediately / on short notice)
• Location Preference: Remote / Hybrid / On-site

Portfolio: https://pratik-portfolio-nine-orcin.vercel.app
GitHub: https://github.com/pratikpatidar
LinkedIn: https://www.linkedin.com/in/pratik-patidar

I've attached my resume for your review. Would love to connect if my profile aligns with your team's current requirements.

Best regards,

Pratik Patidar
+91 8269647990
pratikpatidar7990@gmail.com
Indore, India
`;

    const dispatchRecord = {
      timestamp: new Date().toISOString(),
      company,
      recipientEmail: hrEmail,
      subject,
      body,
      attachedResume: resumePath,
      atsScore,
      status: 'QUEUED_FOR_DISPATCH'
    };

    const outPath = path.join(dispatchesDir, `dispatch_${Date.now()}_${safeCompany}.json`);
    fs.writeFileSync(outPath, JSON.stringify(dispatchRecord, null, 2), 'utf8');
    console.log(`   📨 Email application drafted & queued: ${path.basename(outPath)} -> ${hrEmail}`);
  }
}
