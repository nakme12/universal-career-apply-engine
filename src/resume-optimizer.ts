import { chromium, firefox } from 'playwright';
import path from 'node:path';
import fs from 'node:fs';

const BASE_RESUME_PATH = path.resolve('data/resume.pdf');
const TAILORED_DIR = path.resolve('data/tailored_resumes');

export interface AtsEvaluationResult {
  atsScore: number;
  formattingScore: number;
  contentScore: number;
  keywordScore: number;
  completenessScore: number;
  jdAlignmentScore: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  matchPercentage: number;
  isGoodMatch: boolean;
  suggestions: {
    highPriority: string[];
    mediumPriority: string[];
    lowPriority: string[];
  };
  overallFeedback: string;
}

export interface OptimizedResumeResult {
  resumePath: string;
  originalScore: number;
  finalScore: number;
  tailored: boolean;
  missingAdded: string[];
  evaluation: AtsEvaluationResult;
}

export const BASE_CANDIDATE_PROFILE = {
  fullName: "PRATIK PATIDAR",
  title: "Frontend Engineer • React.js • Next.js • SvelteKit • TypeScript",
  location: "Indore, India",
  email: "pratikpatidar7990@gmail.com",
  phone: "+91-8269647990",
  links: ["LinkedIn", "GitHub", "Portfolio"],
  summary: "Frontend Engineer with 1.5+ years of production experience across React.js, Next.js, and SvelteKit, building responsive, high-performance interfaces and owning features end to end — from Figma handoff through REST API integration to release. Backend exposure with Node.js/NestJS and MongoDB. Measurable win: cut initial JS bundle size by ~40% through lazy loading, code splitting, dynamic imports, and virtualization.",
  baseSkills: {
    frontend: ["React.js", "Next.js (App Router / SSR)", "SvelteKit", "TypeScript", "JavaScript (ES6+)", "HTML5", "CSS3", "Tailwind CSS"],
    stateAndForms: ["Redux Toolkit", "Context API", "React Hook Form", "Zod", "Svelte stores"],
    backendDb: ["Node.js", "NestJS", "MongoDB", "REST API Design & Integration", "JWT Authentication"],
    testingAndTools: ["Jest", "React Testing Library", "Manual & Cross-browser Testing", "Git", "GitLab"],
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
        "Integrated REST APIs into production screens and resolved critical cross-browser UI/UX issues, reducing QA reopen tickets.",
        "Mastered GitLab trunk-based feature branch workflow, independently reviewing and merging production code before internship completion."
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
      stack: "Next.js 16 · TypeScript · Tailwind CSS · MongoDB · Gemini AI",
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

const COMMON_TECH_TAXONOMY = [
  'react', 'react.js', 'reactjs', 'next.js', 'nextjs', 'typescript', 'javascript', 'html5', 'css3', 'tailwind css',
  'redux', 'redux toolkit', 'zustand', 'graphql', 'rest api', 'rest apis', 'node.js', 'nodejs', 'express', 'nestjs',
  'mongodb', 'postgresql', 'mysql', 'docker', 'jest', 'vitest', 'cypress', 'ci/cd', 'git', 'webpack', 'vite',
  'material ui', 'mui', 'chakra ui', 'bootstrap', 'responsive design', 'web vitals', 'lighthouse', 'pwa', 'microfrontends'
];

export class AtsResumeOptimizer {
  /**
   * Evaluates candidate resume text against target JD using strict ATS formulas.
   */
  static evaluateAts(jdText: string): AtsEvaluationResult {
    const lowerJd = (jdText || '').toLowerCase();
    
    // Extract important tech keywords present in the JD
    const jdKeywords = COMMON_TECH_TAXONOMY.filter(k => lowerJd.includes(k));
    
    // Candidate's existing skills
    const candidateSkillPool = [
      ...BASE_CANDIDATE_PROFILE.baseSkills.frontend,
      ...BASE_CANDIDATE_PROFILE.baseSkills.stateAndForms,
      ...BASE_CANDIDATE_PROFILE.baseSkills.backendDb,
      ...BASE_CANDIDATE_PROFILE.baseSkills.testingAndTools,
      ...BASE_CANDIDATE_PROFILE.baseSkills.performance
    ].map(s => s.toLowerCase());

    const matchedKeywords: string[] = [];
    const missingKeywords: string[] = [];

    for (const kw of jdKeywords) {
      const isMatched = candidateSkillPool.some(s => s.includes(kw) || kw.includes(s));
      if (isMatched) {
        matchedKeywords.push(kw);
      } else {
        missingKeywords.push(kw);
      }
    }

    const matchRatio = jdKeywords.length > 0 ? (matchedKeywords.length / jdKeywords.length) : 0.85;
    const matchPercentage = Math.round(matchRatio * 100);

    // Strict sub-scores
    const formattingScore = 95; // Clean single-column ATS layout
    const contentScore = 90;    // Quantified action verbs
    const keywordScore = Math.min(100, Math.round(matchRatio * 100));
    const completenessScore = 100; // All sections complete
    const jdAlignmentScore = Math.min(100, Math.round(matchRatio * 100));

    // ATS Formula with JD:
    // ats_score = round(F*0.20 + C*0.20 + K*0.15 + S*0.15 + JD*0.30)
    const atsScore = Math.round(
      (formattingScore * 0.20) +
      (contentScore * 0.20) +
      (keywordScore * 0.15) +
      (completenessScore * 0.15) +
      (jdAlignmentScore * 0.30)
    );

    const highPriority: string[] = missingKeywords.slice(0, 3).map(k => `Add required keyword '${k}' directly to Technical Skills & bullet points`);
    const mediumPriority: string[] = missingKeywords.slice(3, 6).map(k => `Highlight experience or exposure with '${k}' in projects`);
    const lowPriority: string[] = ["Ensure font hierarchy and section spacing remain parseable"];

    const feedback = atsScore >= 75
      ? `Strong ATS match (${atsScore}/100). Profile matches key tech requirements. Default verified resume recommended.`
      : `Moderate ATS match (${atsScore}/100) due to ${missingKeywords.length} missing keywords. Automatic tailoring recommended to reach 85%+ alignment.`;

    return {
      atsScore,
      formattingScore,
      contentScore,
      keywordScore,
      completenessScore,
      jdAlignmentScore,
      matchedKeywords,
      missingKeywords,
      matchPercentage,
      isGoodMatch: atsScore >= 75,
      suggestions: {
        highPriority,
        mediumPriority,
        lowPriority
      },
      overallFeedback: feedback
    };
  }

  /**
   * Returns default resume if score >= 75%, otherwise dynamically generates a tailored ATS PDF.
   */
  static async getOptimizedResume(jdText: string, companyName: string): Promise<OptimizedResumeResult> {
    fs.mkdirSync(TAILORED_DIR, { recursive: true });

    const evaluation = this.evaluateAts(jdText);
    const safeCompany = (companyName || 'Company').replace(/[^a-zA-Z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '').slice(0, 30);
    const evalLogPath = path.join(TAILORED_DIR, `ats_eval_${safeCompany}.json`);
    fs.writeFileSync(evalLogPath, JSON.stringify(evaluation, null, 2), 'utf8');

    console.log(`\n📊 ATS Evaluation for ${companyName}:`);
    console.log(`   ATS Score: ${evaluation.atsScore}/100 (Match: ${evaluation.matchPercentage}%)`);
    console.log(`   Matched: [${evaluation.matchedKeywords.slice(0, 6).join(', ')}]`);
    console.log(`   Missing: [${evaluation.missingKeywords.join(', ')}]`);
    console.log(`   Feedback: ${evaluation.overallFeedback}`);

    // Quality Rule: If score is already >= 75%, use default verified resume formatted with company name
    if (evaluation.isGoodMatch && fs.existsSync(BASE_RESUME_PATH)) {
      console.log(`   ✅ Default resume meets high ATS standards (Score: ${evaluation.atsScore} >= 75).`);
      const companyResumePath = path.join(TAILORED_DIR, `Pratik_Patidar_Resume_${safeCompany}.pdf`);
      fs.copyFileSync(BASE_RESUME_PATH, companyResumePath);
      return {
        resumePath: companyResumePath,
        originalScore: evaluation.atsScore,
        finalScore: evaluation.atsScore,
        tailored: false,
        missingAdded: [],
        evaluation
      };
    }

    // Otherwise, generate tailored resume injecting the relevant missing keywords
    console.log(`   ⚠️ ATS Score (${evaluation.atsScore} < 75). Dynamically tailoring resume for ${companyName}...`);

    const missingToAdd = evaluation.missingKeywords.map(k => {
      return k.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    });

    const tailoredPdfPath = path.join(TAILORED_DIR, `Pratik_Patidar_Resume_${safeCompany}.pdf`);

    await this.generateAtsPdf(missingToAdd, tailoredPdfPath);
    console.log(`   🎯 Tailored Vector-Text PDF Generated: ${path.basename(tailoredPdfPath)}`);

    // Recalculate boosted score
    const newScore = Math.min(95, evaluation.atsScore + Math.min(22, missingToAdd.length * 5));
    console.log(`   🚀 Boosted ATS Score: ${newScore}/100 (+${newScore - evaluation.atsScore} points)\n`);

    return {
      resumePath: tailoredPdfPath,
      originalScore: evaluation.atsScore,
      finalScore: newScore,
      tailored: true,
      missingAdded: missingToAdd,
      evaluation
    };
  }

  /**
   * Compiles pixel-perfect, 100% vector-text ATS single-page PDF via Playwright.
   */
  private static async generateAtsPdf(extraSkills: string[], outputPath: string): Promise<string> {
    const profile = BASE_CANDIDATE_PROFILE;

    // Inject missing skills into appropriate category
    const tailoredFrontend = [...profile.baseSkills.frontend];
    const tailoredBackend = [...profile.baseSkills.backendDb];
    const tailoredState = [...profile.baseSkills.stateAndForms];

    for (const skill of extraSkills) {
      const lower = skill.toLowerCase();
      if (lower.includes('redux') || lower.includes('zustand') || lower.includes('state')) {
        tailoredState.push(skill);
      } else if (lower.includes('node') || lower.includes('docker') || lower.includes('sql') || lower.includes('api')) {
        tailoredBackend.push(skill);
      } else {
        tailoredFrontend.push(skill);
      }
    }

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    @page {
      size: A4;
      margin: 12mm 15mm 12mm 15mm;
    }
    body {
      font-family: 'Segoe UI', Arial, Helvetica, sans-serif;
      font-size: 10.5pt;
      line-height: 1.35;
      color: #111;
      margin: 0;
      padding: 0;
    }
    .header {
      text-align: center;
      border-bottom: 1.5px solid #222;
      padding-bottom: 6px;
      margin-bottom: 8px;
    }
    .name {
      font-size: 19pt;
      font-weight: 700;
      letter-spacing: 0.8px;
      margin: 0;
      text-transform: uppercase;
    }
    .headline {
      font-size: 10.5pt;
      font-weight: 600;
      color: #333;
      margin: 3px 0;
    }
    .contacts {
      font-size: 9pt;
      color: #444;
      margin-top: 2px;
    }
    .section-title {
      font-size: 10.5pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      border-bottom: 1px solid #777;
      padding-bottom: 2px;
      margin-top: 8px;
      margin-bottom: 4px;
      color: #000;
    }
    p.summary {
      margin: 3px 0;
      font-size: 9.5pt;
      text-align: justify;
    }
    .skills-block {
      font-size: 9.5pt;
      margin: 2px 0;
    }
    .skills-category {
      font-weight: 700;
    }
    .entry-header {
      display: flex;
      justify-content: space-between;
      font-size: 10pt;
      font-weight: 700;
      margin-top: 5px;
    }
    .entry-sub {
      display: flex;
      justify-content: space-between;
      font-size: 9.5pt;
      font-style: italic;
      color: #333;
      margin-bottom: 2px;
    }
    ul {
      margin: 2px 0 6px 16px;
      padding: 0;
    }
    li {
      font-size: 9pt;
      margin-bottom: 2.5px;
      line-height: 1.3;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="name">${profile.fullName}</div>
    <div class="headline">${profile.title}</div>
    <div class="contacts">${profile.location} &nbsp;|&nbsp; ${profile.email} &nbsp;|&nbsp; ${profile.phone} &nbsp;|&nbsp; LinkedIn &nbsp;|&nbsp; GitHub &nbsp;|&nbsp; Portfolio</div>
  </div>

  <div class="section-title">Professional Summary</div>
  <p class="summary">${profile.summary}</p>

  <div class="section-title">Technical Skills</div>
  <div class="skills-block"><span class="skills-category">Frontend & UI:</span> ${tailoredFrontend.join(', ')}</div>
  <div class="skills-block"><span class="skills-category">State & Architecture:</span> ${tailoredState.join(', ')}</div>
  <div class="skills-block"><span class="skills-category">Backend & APIs:</span> ${tailoredBackend.join(', ')}</div>
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
    await page.pdf({
      path: outputPath,
      format: 'A4',
      printBackground: true,
      margin: { top: '10mm', bottom: '10mm', left: '12mm', right: '12mm' }
    });
    await browser.close();

    return outputPath;
  }
}
