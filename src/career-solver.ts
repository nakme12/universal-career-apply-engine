import { BrowserContext, Page, Frame } from 'playwright';
import path from 'node:path';
import fs from 'node:fs';
import { CANONICAL_PROFILE } from './config';
import { AtsResumeOptimizer } from './resume-optimizer';

const BASE_RESUME_PATH = path.resolve('data/resume.pdf');
const SCREENSHOTS_DIR = path.resolve('screenshots');

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

      // Evaluate ATS score & get optimized resume (default vs tailored)
      const pageText = await page.evaluate(() => document.body.innerText).catch(() => '');
      const optResult = await AtsResumeOptimizer.getOptimizedResume(pageText, companyName || domain);
      const activeResumePath = optResult.resumePath;

      // Step 1: Check if "Apply Now" or "Apply" button needs to be clicked to reveal form
      const initialInputs = await this.countInputs(page);

      if (initialInputs < 2) {
        const applySelectors = [
          'button:has-text("Apply Now")',
          'a:has-text("Apply Now")',
          'button:has-text("Apply for this position")',
          'a:has-text("Apply for this position")',
          'button:has-text("Apply for this job")',
          'a:has-text("Apply for this job")',
          'button:has-text("Apply Online")',
          'a:has-text("Apply Online")',
          'button:has-text("Apply")',
          'a:has-text("Apply")',
          'a[href*="apply"]',
          'button[class*="apply"]'
        ];

        for (const sel of applySelectors) {
          const btn = page.locator(sel).first();
          if (await btn.isVisible().catch(() => false)) {
            console.log(`   Found inner apply action: "${sel}", clicking...`);
            await btn.click().catch(() => null);
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

      // Step 6: Find Submit Button
      const submitSelectors = [
        'button[type="submit"]',
        'input[type="submit"]',
        'input#sub',
        'input[name="sub" i]',
        'button:has-text("Submit Application")',
        'button:has-text("Submit Resume")',
        'button:has-text("Send Application")',
        'button:has-text("Submit")',
        'input[value*="Submit" i]',
        'input[value*="Apply" i]'
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

        // STRICT DOM Confirmation Assertion
        const confirmed = await this.checkConfirmation(page);
        await page.screenshot({ path: screenshotPath }).catch(() => null);

        if (!confirmed) {
          console.log(`   ❌ Submission NOT verified on DOM (no success banner). Rejecting false positive.`);
          return {
            success: false,
            reason: `Submit clicked but no DOM confirmation received (validation error, captcha, or unverified)`,
            url: targetUrl,
            domain,
            fieldsFilled: fillCount,
            resumeAttached,
            tailoredResumeUsed: optResult.tailored,
            atsScore: optResult.finalScore,
            screenshotPath
          };
        }

        console.log(`   ✅ Confirmed application submitted on DOM!`);
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
          await page.screenshot({ path: screenshotPath }).catch(() => null);
          return {
            success: false, // Honest: Email discovered, NOT applied via web form
            reason: `HR Email detected (${hrEmail}) - application drafted locally, not submitted`,
            url: targetUrl,
            domain,
            fieldsFilled: 0,
            resumeAttached: false,
            tailoredResumeUsed: optResult.tailored,
            atsScore: optResult.finalScore,
            screenshotPath,
            recipientEmail: hrEmail
          };
        }

        await page.screenshot({ path: screenshotPath }).catch(() => null);
        return {
          success: false,
          reason: fillCount < 2 ? 'No direct form fields found (requires custom login or account creation)' : 'Submit button not located',
          url: targetUrl,
          domain,
          fieldsFilled: fillCount,
          resumeAttached,
          tailoredResumeUsed: optResult.tailored,
          atsScore: optResult.finalScore,
          screenshotPath
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

    // B. Full Name
    if (filled === 0) {
      const fullName = container.locator('input[name*="name" i]:not([name*="first" i]):not([name*="last" i]):not([name*="fname" i]):not([name*="lname" i]), input[id*="name" i]:not([id*="first" i]):not([id*="last" i]):not([id*="fname" i]):not([id*="lname" i]), input[placeholder*="full name" i], input[placeholder*="your name" i], input[autocomplete="name"]');
      if ((await fullName.count()) > 0 && (await fullName.first().isVisible().catch(() => false))) {
        await fullName.first().fill(candidate.fullName).catch(() => null);
        filled++;
      }
    }

    // C. Email
    const email = container.locator('input[type="email"], input[name*="email" i], input[id*="email" i], input[placeholder*="email" i], input[autocomplete="email"]');
    if ((await email.count()) > 0 && (await email.first().isVisible().catch(() => false))) {
      await email.first().fill(candidate.email).catch(() => null);
      filled++;
    }

    // D. Phone / Mobile / Contact
    const phone = container.locator('input[type="tel"], input[name*="phone" i], input[name*="mobile" i], input[name*="cno" i], input[name*="contact" i], input[id*="phone" i], input[id*="mobile" i], input[id*="cno" i], input[id*="contact" i], input[placeholder*="phone" i], input[placeholder*="mobile" i], input[placeholder*="contact" i], input[autocomplete="tel"]');
    if ((await phone.count()) > 0 && (await phone.first().isVisible().catch(() => false))) {
      await phone.first().fill(candidate.phone).catch(() => null);
      filled++;
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

    // H. Notice Period
    const notice = container.locator('input[name*="notice" i], input[placeholder*="notice" i]');
    if ((await notice.count()) > 0 && (await notice.first().isVisible().catch(() => false))) {
      await notice.first().fill(candidate.noticePeriodDays.toString()).catch(() => null);
      filled++;
    }

    // I. Current CTC
    const ctc = container.locator('input[name*="current_ctc" i], input[name*="currentctc" i], input[placeholder*="current ctc" i]');
    if ((await ctc.count()) > 0 && (await ctc.first().isVisible().catch(() => false))) {
      await ctc.fill(candidate.currentCtcLakhs.toString()).catch(() => null);
      filled++;
    }

    // J. Expected CTC
    const expCtc = container.locator('input[name*="expected_ctc" i], input[name*="expectedctc" i], input[placeholder*="expected ctc" i]');
    if ((await expCtc.count()) > 0 && (await expCtc.first().isVisible().catch(() => false))) {
      await expCtc.fill(candidate.expectedCtcLakhs.toString()).catch(() => null);
      filled++;
    }

    return filled;
  }

  private static async uploadResume(container: Page | Frame, resumePath: string = BASE_RESUME_PATH): Promise<boolean> {
    if (!fs.existsSync(resumePath)) return false;
    try {
      const fileInput = container.locator('input[type="file"]').first();
      if ((await fileInput.count()) > 0) {
        await fileInput.setInputFiles(resumePath).catch(() => null);
        console.log(`   📎 Resume attached: ${path.basename(resumePath)}`);
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

  private static async checkConfirmation(page: Page): Promise<boolean> {
    return page.evaluate(() => {
      const text = (document.body.innerText || '').toLowerCase();
      return (
        text.includes('thank you') ||
        text.includes('application submitted') ||
        text.includes('application has been submitted') ||
        text.includes('successfully applied') ||
        text.includes('received your application') ||
        text.includes('thanks for applying') ||
        text.includes('application received') ||
        text.includes('we will get back to you')
      );
    }).catch(() => false);
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
    const dispatchesDir = path.resolve('data/email_dispatches');
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
