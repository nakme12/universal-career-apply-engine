import { chromium } from 'playwright';
import path from 'node:path';
import fs from 'node:fs';

export const UPDATED_CANDIDATE_PROFILE = {
  fullName: "PRATIK PATIDAR",
  title: "Frontend Engineer • React.js • Next.js • SvelteKit • TypeScript",
  location: "Indore, India",
  email: "pratikpatidar7990@gmail.com",
  phone: "+91-8269647990",
  linkedin: "https://www.linkedin.com/in/pratik-patidar",
  github: "https://github.com/nakme12",
  portfolio: "https://pratik-portfolio-nine-orcin.vercel.app",
  summary: "Frontend Engineer with 1.5+ years of production experience across React.js, Next.js, and SvelteKit, building responsive, high-performance interfaces and owning features end to end — from Figma handoff through REST API integration to release. Backend exposure with Node.js/NestJS and MongoDB. Measurable win: cut initial JS bundle size by ~40% through lazy loading, code splitting, dynamic imports, and virtualization.",
  baseSkills: {
    frontend: ["React.js", "Next.js (App Router / SSR)", "SvelteKit", "TypeScript", "JavaScript (ES6+)", "HTML5", "CSS3", "Tailwind CSS"],
    stateAndForms: ["Redux Toolkit", "Context API", "React Hook Form", "Zod", "Svelte stores"],
    backendDb: ["Node.js", "NestJS", "MongoDB", "REST API Design & Integration", "JWT Authentication"],
    testingAndTools: ["Jest", "React Testing Library", "Manual & Cross-browser Testing", "Git", "GitLab CI/CD"],
    performance: ["Lazy Loading", "Code Splitting", "Dynamic Imports", "Virtualization", "Lighthouse", "Web Vitals"]
  },
  experience: [
    {
      company: "Techstuff Private Limited",
      role: "Frontend Engineer",
      duration: "May 2025 – Present",
      location: "Indore, India",
      bullets: [
        "Core contributor to Mercanis (B2B SaaS Procurement Platform) and internal enterprise systems; own frontend features end to end across SvelteKit, Next.js, and TypeScript.",
        "Collaborated with backend engineers to establish robust REST API contracts, payload schemas, and validation rules prior to UI development, accelerating integration velocity across SvelteKit and Next.js applications.",
        "Engineered a 20+ reusable UI component library (forms, modals, responsive tables, navigation) adopted across all company product suites.",
        "Optimized client performance cutting initial JS bundle by ~40% via route-based code splitting and dynamic imports; implemented virtualized scrolling for high-density datasets."
      ]
    },
    {
      company: "Techstuff Private Limited",
      role: "Frontend Developer Intern",
      duration: "Feb 2025 – May 2025",
      location: "Indore, India",
      bullets: [
        "Standardized team Git/GitLab version control workflows across feature branching, merge requests, and code reviews, independently reviewing and deploying production code into releases.",
        "Architected modular, reusable UI components integrated directly into the core production component library, establishing standardized UI consistency across applications.",
        "Integrated REST APIs into production screens and resolved critical cross-browser UI/UX issues, reducing QA reopen tickets."
      ]
    }
  ],
  projects: [
    {
      name: "Mercanis — B2B SaaS Procurement Platform",
      stack: "SvelteKit · TypeScript · NestJS · MongoDB",
      bullets: [
        "Daily driver for enterprise procurement teams; owned design-to-production implementation from Figma handoffs to API integrations.",
        "Engineered shared design system components and eliminated rendering bottlenecks using memoization and virtualized lists."
      ]
    },
    {
      name: "Payroll & HR Platform",
      stack: "Next.js · TypeScript · NestJS · MongoDB · MCP (Model Context Protocol)",
      bullets: [
        "Built responsive Next.js frontend with Redux/Context state management against a NestJS backend for company-wide HR operations.",
        "Designed OAuth-style token exchange and built an MCP (Model Context Protocol) server exposing payroll & calendar tools for AI assistant workflows."
      ]
    },
    {
      name: "EduMiracle — Student ERP Portal",
      stack: "Next.js · TypeScript · Tailwind CSS · MongoDB · Gemini AI",
      bullets: [
        "Built solo full-stack ERP for a real coaching institute: live attendance, Recharts mock test analytics, and CBT exam simulator.",
        "Integrated Gemini AI for real-time automated doubt solving with role-based administrative control."
      ]
    }
  ],
  education: {
    degree: "B.Tech, Computer Science & Engineering",
    institution: "Barkatullah University, Bhopal",
    score: "CGPA: 7.89",
    year: "2020 – 2024"
  }
};

export async function buildPdf(outputPath: string) {
  const profile = UPDATED_CANDIDATE_PROFILE;

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    @page {
      size: A4;
      margin: 10mm 13mm 10mm 13mm;
    }
    * {
      box-sizing: border-box;
    }
    body {
      font-family: 'Segoe UI', Arial, Helvetica, sans-serif;
      font-size: 9.8pt;
      line-height: 1.32;
      color: #111;
      margin: 0;
      padding: 0;
    }
    .header {
      text-align: center;
      border-bottom: 1.5px solid #222;
      padding-bottom: 5px;
      margin-bottom: 6px;
    }
    .name {
      font-size: 18pt;
      font-weight: 700;
      letter-spacing: 0.8px;
      margin: 0;
      text-transform: uppercase;
      color: #0f172a;
    }
    .headline {
      font-size: 10.2pt;
      font-weight: 600;
      color: #334155;
      margin: 2px 0;
    }
    .contacts {
      font-size: 9pt;
      color: #475569;
      margin-top: 3px;
    }
    .contacts a {
      color: #0284c7;
      text-decoration: underline;
      text-underline-offset: 2px;
      font-weight: 500;
    }
    .contacts a:hover {
      color: #0369a1;
    }
    .section-title {
      font-size: 10pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      border-bottom: 1px solid #94a3b8;
      padding-bottom: 2px;
      margin-top: 6px;
      margin-bottom: 4px;
      color: #0f172a;
    }
    p.summary {
      margin: 2px 0 4px 0;
      font-size: 9.2pt;
      text-align: justify;
      color: #1e293b;
      line-height: 1.35;
    }
    .skills-block {
      font-size: 9.2pt;
      margin: 1.5px 0;
      color: #1e293b;
    }
    .skills-category {
      font-weight: 700;
      color: #0f172a;
    }
    .entry-header {
      display: flex;
      justify-content: space-between;
      font-size: 9.6pt;
      font-weight: 700;
      margin-top: 4px;
      color: #0f172a;
    }
    .entry-sub {
      display: flex;
      justify-content: space-between;
      font-size: 9pt;
      font-style: italic;
      color: #475569;
      margin-bottom: 2px;
    }
    ul {
      margin: 1.5px 0 4px 16px;
      padding: 0;
    }
    li {
      font-size: 8.9pt;
      margin-bottom: 2px;
      line-height: 1.3;
      color: #1e293b;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="name">${profile.fullName}</div>
    <div class="headline">${profile.title}</div>
    <div class="contacts">
      ${profile.location} &nbsp;•&nbsp; 
      <a href="mailto:${profile.email}">${profile.email}</a> &nbsp;•&nbsp; 
      <a href="tel:${profile.phone.replace(/[^0-9+]/g, '')}">${profile.phone}</a> &nbsp;•&nbsp; 
      <a href="${profile.linkedin}" target="_blank">LinkedIn</a> &nbsp;•&nbsp; 
      <a href="${profile.github}" target="_blank">GitHub</a> &nbsp;•&nbsp; 
      <a href="${profile.portfolio}" target="_blank">Portfolio</a>
    </div>
  </div>

  <div class="section-title">Professional Summary</div>
  <p class="summary">${profile.summary}</p>

  <div class="section-title">Technical Skills</div>
  <div class="skills-block"><span class="skills-category">Frontend & UI:</span> ${profile.baseSkills.frontend.join(', ')}</div>
  <div class="skills-block"><span class="skills-category">State & Architecture:</span> ${profile.baseSkills.stateAndForms.join(', ')}</div>
  <div class="skills-block"><span class="skills-category">Backend & APIs:</span> ${profile.baseSkills.backendDb.join(', ')}</div>
  <div class="skills-block"><span class="skills-category">Testing & Performance:</span> ${profile.baseSkills.testingAndTools.concat(profile.baseSkills.performance).join(', ')}</div>

  <div class="section-title">Work Experience</div>
  ${profile.experience.map(exp => `
    <div class="entry-header">
      <span>${exp.company}</span>
      <span>${exp.duration}</span>
    </div>
    <div class="entry-sub">
      <span>${exp.role}</span>
      <span>${exp.location}</span>
    </div>
    <ul>
      ${exp.bullets.map(b => `<li>${b}</li>`).join('')}
    </ul>
  `).join('')}

  <div class="section-title">Key Production Projects</div>
  ${profile.projects.map(proj => `
    <div class="entry-header">
      <span>${proj.name}</span>
      <span>Enterprise / Production</span>
    </div>
    <div class="entry-sub">
      <span>Stack: ${proj.stack}</span>
      <span></span>
    </div>
    <ul>
      ${proj.bullets.map(b => `<li>${b}</li>`).join('')}
    </ul>
  `).join('')}

  <div class="section-title">Education</div>
  <div class="entry-header">
    <span>${profile.education.degree}</span>
    <span>${profile.education.year}</span>
  </div>
  <div class="entry-sub">
    <span>${profile.education.institution}</span>
    <span>${profile.education.score}</span>
  </div>
</body>
</html>
  `;

  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage();
  await page.setContent(htmlContent, { waitUntil: 'load' });
  
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  await page.pdf({
    path: outputPath,
    format: 'A4',
    printBackground: true,
    margin: { top: '8mm', bottom: '8mm', left: '11mm', right: '11mm' }
  });
  
  await browser.close();
  console.log(`Generated: ${outputPath}`);
}

async function main() {
  const targetPath = path.resolve(__dirname, '../data/resume.pdf');
  await buildPdf(targetPath);
}

if (process.argv[1] && process.argv[1].includes('compile_updated_resume')) {
  main().catch(err => {
    console.error(err);
    process.exit(1);
  });
}
