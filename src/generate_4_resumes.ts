import { chromium } from 'playwright';
import path from 'node:path';
import fs from 'node:fs';

export interface ResumeVariantConfig {
  roleKey: 'FE' | 'FULL_STACK' | 'REACT' | 'MERN';
  fileNameUnderscore: string;
  fileNameHyphen: string;
  headlineTitle: string;
  summary: string;
  skills: {
    category1Title: string;
    category1Skills: string[];
    category2Title: string;
    category2Skills: string[];
    category3Title: string;
    category3Skills: string[];
    category4Title: string;
    category4Skills: string[];
  };
  experienceBulletsFE: string[];
  experienceBulletsIntern: string[];
  projects: Array<{
    name: string;
    tagline: string;
    stack: string;
    bullets: string[];
  }>;
}

export const COMMON_CANDIDATE = {
  fullName: "PRATIK PATIDAR",
  location: "Indore, India",
  email: "pratikpatidar7990@gmail.com",
  phone: "+91-8269647990",
  linkedin: "https://www.linkedin.com/in/pratik-patidar",
  github: "https://github.com/nakme12",
  portfolio: "https://pratik-portfolio-nine-orcin.vercel.app",
  company: "Techstuff Private Limited",
  feDuration: "May 2025 – Present",
  internDuration: "Feb 2025 – May 2025",
  education: {
    degree: "B.Tech, Computer Science & Engineering",
    institution: "Barkatullah University Institute of Technology (BUIT), Bhopal",
    score: "CGPA: 7.89",
    year: "2020 – 2024"
  }
};

export const RESUME_VARIANTS: ResumeVariantConfig[] = [
  // 1. FRONTEND ENGINEER
  {
    roleKey: 'FE',
    fileNameUnderscore: 'Pratik_Patidar_Resume_Frontend_Engineer.pdf',
    fileNameHyphen: 'Pratik Patidar Resume - Frontend Engineer.pdf',
    headlineTitle: 'Frontend Engineer • React.js • Next.js • SvelteKit • TypeScript',
    summary: 'Frontend Engineer with 1.5+ years of production experience across React.js, Next.js, and SvelteKit, building high-performance, accessible web applications and owning features end to end — from Figma handoff to API integration and production release. Backend exposure with Node.js/NestJS and MongoDB. Measurable win: cut initial JS bundle size by ~40% through lazy loading, code splitting, dynamic imports, and virtualization.',
    skills: {
      category1Title: 'Frontend & UI Frameworks',
      category1Skills: ['React.js', 'Next.js (App Router / SSR)', 'SvelteKit', 'TypeScript', 'JavaScript (ES6+)', 'HTML5', 'CSS3', 'Tailwind CSS'],
      category2Title: 'State & Client Architecture',
      category2Skills: ['Redux Toolkit', 'Context API', 'React Hook Form', 'Zod', 'Svelte Stores', 'Component-Driven Development'],
      category3Title: 'Backend & Integration',
      category3Skills: ['Node.js', 'NestJS', 'MongoDB', 'RESTful API Integration', 'JWT Authentication', 'Postman'],
      category4Title: 'Testing, Performance & Tools',
      category4Skills: ['Jest', 'React Testing Library', 'Lighthouse', 'Web Vitals', 'Code Splitting', 'Virtualization', 'Git', 'GitLab CI/CD', 'Vite']
    },
    experienceBulletsFE: [
      'Core contributor to Mercanis (B2B SaaS Procurement Platform) and enterprise portals; own frontend features end to end across SvelteKit, Next.js, and TypeScript.',
      'Collaborated with backend engineers to establish robust REST API contracts, payload schemas, and validation rules prior to UI development, accelerating integration velocity across SvelteKit and Next.js applications.',
      'Engineered a 20+ reusable UI component library (forms, modals, responsive tables, navigation) adopted across all company product suites.',
      'Optimized client performance cutting initial JS bundle by ~40% via route-based code splitting and dynamic imports; implemented virtualized scrolling for high-density datasets.'
    ],
    experienceBulletsIntern: [
      'Standardized team Git/GitLab version control workflows across feature branching, merge requests, and code reviews, independently reviewing and deploying production code into releases.',
      'Architected modular, reusable UI components integrated directly into the core production component library, establishing standardized UI consistency across applications.',
      'Integrated REST APIs into production screens and resolved critical cross-browser UI/UX issues, reducing QA reopen tickets.'
    ],
    projects: [
      {
        name: 'Mercanis — B2B SaaS Procurement Platform',
        tagline: 'Client Enterprise Project',
        stack: 'SvelteKit · TypeScript · NestJS · MongoDB',
        bullets: [
          'Daily driver for enterprise procurement teams; owned design-to-production implementation from Figma handoffs to API integrations.',
          'Engineered shared design system components and eliminated rendering bottlenecks using memoization and virtualized lists.'
        ]
      },
      {
        name: 'Payroll & HR Platform',
        tagline: 'Internal Enterprise SaaS',
        stack: 'Next.js · TypeScript · NestJS · MongoDB · MCP (Model Context Protocol)',
        bullets: [
          'Built responsive Next.js frontend with Redux/Context state management against a NestJS backend for company-wide HR operations.',
          'Designed OAuth-style token exchange and built an MCP (Model Context Protocol) server exposing payroll & calendar tools for AI assistant workflows.'
        ]
      },
      {
        name: 'EduMiracle — Student ERP Portal',
        tagline: 'Full-Stack EdTech Platform',
        stack: 'Next.js · TypeScript · Tailwind CSS · MongoDB · Gemini AI',
        bullets: [
          'Built solo full-stack ERP for a coaching institute: live attendance, Recharts mock test analytics, and CBT exam simulator.',
          'Integrated Gemini AI for real-time automated doubt solving with role-based administrative control.'
        ]
      }
    ]
  },

  // 2. FULL STACK DEVELOPER
  {
    roleKey: 'FULL_STACK',
    fileNameUnderscore: 'Pratik_Patidar_Resume_Full_Stack_Developer.pdf',
    fileNameHyphen: 'Pratik Patidar Resume - Full Stack Developer.pdf',
    headlineTitle: 'Full Stack Developer • React.js • Node.js • Next.js • NestJS • MongoDB',
    summary: 'Full Stack Developer with 1.5+ years of production experience architecting end-to-end web applications with React.js/Next.js frontends and Node.js/NestJS/MongoDB backends. Proven ability to design RESTful APIs, implement secure JWT authentication, and deploy scalable database schemas while maintaining high frontend performance (cut JS bundles by ~40% via code splitting).',
    skills: {
      category1Title: 'Full Stack Engineering',
      category1Skills: ['React.js', 'Next.js', 'Node.js', 'NestJS', 'Express.js', 'TypeScript', 'JavaScript (ES6+)', 'Tailwind CSS'],
      category2Title: 'Backend, APIs & Databases',
      category2Skills: ['MongoDB', 'Mongoose', 'REST API Design & Architecture', 'JWT Authentication (HttpOnly)', 'OAuth Flows', 'Postman'],
      category3Title: 'State & Frontend Architecture',
      category3Skills: ['Redux Toolkit', 'Context API', 'React Hook Form', 'Zod Schema Validation', 'SvelteKit', 'Micro-interactions'],
      category4Title: 'DevOps, Testing & Quality',
      category4Skills: ['Git', 'GitLab CI/CD', 'Jest', 'React Testing Library', 'Lighthouse Optimization', 'Vercel', 'Vite', 'Webpack']
    },
    experienceBulletsFE: [
      'Architected end-to-end full stack features across Mercanis (B2B SaaS platform) and internal enterprise systems using Next.js, SvelteKit, and NestJS.',
      'Collaborated with backend engineers to establish robust REST API contracts, payload schemas, and validation rules prior to UI development, accelerating integration velocity across SvelteKit and Next.js applications.',
      'Engineered NestJS backend REST endpoints and MongoDB aggregation pipelines handling high-concurrency enterprise queries.',
      'Optimized client performance cutting initial JS bundle by ~40% via route-based code splitting and dynamic imports; implemented virtualized scrolling for high-density datasets.'
    ],
    experienceBulletsIntern: [
      'Standardized team Git/GitLab version control workflows across feature branching, merge requests, and code reviews, independently reviewing and deploying production code into releases.',
      'Architected modular, reusable UI components integrated directly into the core production component library, establishing standardized UI consistency across applications.',
      'Integrated REST APIs into production screens and resolved critical cross-browser UI/UX issues, reducing QA reopen tickets.'
    ],
    projects: [
      {
        name: 'Mercanis — B2B SaaS Procurement Platform',
        tagline: 'Client Enterprise Project',
        stack: 'React.js · Next.js · TypeScript · NestJS · MongoDB',
        bullets: [
          'Full-stack contributor for enterprise procurement platform; built reactive user interfaces and connected NestJS/MongoDB backend microservices.',
          'Engineered shared design system components and eliminated rendering bottlenecks using memoization and virtualized lists.'
        ]
      },
      {
        name: 'Payroll & HR Platform',
        tagline: 'Internal Enterprise SaaS',
        stack: 'Next.js · TypeScript · NestJS · MongoDB · MCP (Model Context Protocol)',
        bullets: [
          'Built responsive Next.js frontend with Redux/Context state management against a NestJS backend for company-wide HR operations.',
          'Designed OAuth-style token exchange and built an MCP (Model Context Protocol) server exposing payroll & calendar tools for AI assistant workflows.'
        ]
      },
      {
        name: 'EduMiracle — Student ERP Portal',
        tagline: 'Full-Stack EdTech Platform',
        stack: 'Next.js · TypeScript · Tailwind CSS · MongoDB · Gemini AI',
        bullets: [
          'Built solo full-stack ERP for a coaching institute: live attendance, Recharts mock test analytics, and CBT exam simulator.',
          'Integrated Gemini AI for real-time automated doubt solving with role-based administrative control.'
        ]
      }
    ]
  },

  // 3. REACT DEVELOPER
  {
    roleKey: 'REACT',
    fileNameUnderscore: 'Pratik_Patidar_Resume_React_Developer.pdf',
    fileNameHyphen: 'Pratik Patidar Resume - React Developer.pdf',
    headlineTitle: 'React Developer • React.js • Next.js • TypeScript • Redux Toolkit',
    summary: 'React Developer with 1.5+ years of specialized experience building high-performance SPAs and SSR applications with React.js, Next.js, and TypeScript. Expert in component lifecycle, React Hooks, Redux Toolkit state architecture, and UI performance optimization (reduced bundle sizes by ~40%). Experienced in translating complex Figma prototypes into production-grade, pixel-perfect user interfaces.',
    skills: {
      category1Title: 'React Ecosystem & Core',
      category1Skills: ['React.js (Hooks, Virtual DOM, Custom Hooks)', 'Next.js (App Router, SSR, SSG)', 'TypeScript', 'JavaScript (ES6+)', 'JSX / TSX'],
      category2Title: 'State Management & Forms',
      category2Skills: ['Redux Toolkit', 'React Context API', 'React Hook Form', 'Zod', 'State Normalization', 'Async Thunks'],
      category3Title: 'UI & Styling Libraries',
      category3Skills: ['Tailwind CSS', 'CSS3 / CSS Modules', 'HTML5 Semantic Markup', 'Material UI (MUI)', 'Responsive Design', 'Figma to Code'],
      category4Title: 'Build, Test & Optimization',
      category4Skills: ['Vite', 'Webpack', 'Jest', 'React Testing Library', 'Lighthouse 95+ Audits', 'Lazy Loading', 'Code Splitting', 'GitLab CI/CD']
    },
    experienceBulletsFE: [
      'Led frontend UI engineering for flagship web modules using React.js, Next.js, and TypeScript, delivering 100% responsive, accessible experiences.',
      'Collaborated with backend engineers to establish robust REST API contracts, payload schemas, and validation rules prior to UI development, accelerating integration velocity across SvelteKit and Next.js applications.',
      'Engineered a 20+ reusable React component library (custom inputs, interactive modals, data tables) that slashed development turnaround by 35%.',
      'Optimized client performance cutting initial JS bundle by ~40% via route-based code splitting and dynamic imports; implemented virtualized scrolling for high-density datasets.'
    ],
    experienceBulletsIntern: [
      'Standardized team Git/GitLab version control workflows across feature branching, merge requests, and code reviews, independently reviewing and deploying production code into releases.',
      'Architected modular, reusable UI components integrated directly into the core production component library, establishing standardized UI consistency across applications.',
      'Integrated REST APIs into production screens and resolved critical cross-browser UI/UX issues, reducing QA reopen tickets.'
    ],
    projects: [
      {
        name: 'Mercanis — B2B SaaS Procurement Platform',
        tagline: 'Client Enterprise Project',
        stack: 'React.js · Next.js · TypeScript · NestJS · MongoDB',
        bullets: [
          'Built core UI workflows for procurement teams; owned design-to-production implementation from Figma handoffs to API integrations.',
          'Engineered shared design system components and eliminated rendering bottlenecks using memoization and virtualized lists.'
        ]
      },
      {
        name: 'Payroll & HR Platform',
        tagline: 'Internal Enterprise SaaS',
        stack: 'Next.js · TypeScript · NestJS · MongoDB · MCP (Model Context Protocol)',
        bullets: [
          'Built responsive Next.js frontend with Redux/Context state management against a NestJS backend for company-wide HR operations.',
          'Designed OAuth-style token exchange and built an MCP (Model Context Protocol) server exposing payroll & calendar tools for AI assistant workflows.'
        ]
      },
      {
        name: 'EduMiracle — Student ERP Portal',
        tagline: 'Full-Stack EdTech Platform',
        stack: 'Next.js · TypeScript · Tailwind CSS · MongoDB · Gemini AI',
        bullets: [
          'Built solo full-stack ERP for a coaching institute: live attendance, Recharts mock test analytics, and CBT exam simulator.',
          'Integrated Gemini AI for real-time automated doubt solving with role-based administrative control.'
        ]
      }
    ]
  },

  // 4. MERN STACK DEVELOPER
  {
    roleKey: 'MERN',
    fileNameUnderscore: 'Pratik_Patidar_Resume_MERN_Stack_Developer.pdf',
    fileNameHyphen: 'Pratik Patidar Resume - MERN Full Stack.pdf',
    headlineTitle: 'MERN Stack Developer • MongoDB • Express.js • React.js • Node.js',
    summary: 'MERN Stack Developer with 1.5+ years of production experience building scalable, database-driven web applications across MongoDB, Express.js/NestJS, React.js, and Node.js. Strong proficiency in asynchronous JavaScript, REST API design, JWT authentication, and responsive frontend interfaces with Next.js and Tailwind CSS.',
    skills: {
      category1Title: 'MERN Core Technologies',
      category1Skills: ['MongoDB', 'Express.js', 'React.js', 'Node.js', 'TypeScript', 'JavaScript (ES6+)', 'Next.js', 'NestJS'],
      category2Title: 'Backend Architecture & APIs',
      category2Skills: ['RESTful API Design', 'Mongoose ODM', 'MongoDB Aggregation Pipelines', 'JWT Authentication (HttpOnly)', 'Middleware', 'Postman'],
      category3Title: 'Frontend & State Management',
      category3Skills: ['Redux Toolkit', 'Context API', 'React Hook Form', 'Zod', 'Tailwind CSS', 'Responsive UI', 'Figma Integration'],
      category4Title: 'Tooling, Testing & Deployment',
      category4Skills: ['Git', 'GitLab CI/CD', 'Jest', 'React Testing Library', 'Vercel', 'Vite', 'npm', 'Lighthouse Optimization']
    },
    experienceBulletsFE: [
      'Developed and maintained MERN-based enterprise software modules, writing robust React frontends and Node.js/NestJS API services.',
      'Collaborated with backend engineers to establish robust REST API contracts, payload schemas, and validation rules prior to UI development, accelerating integration velocity across SvelteKit and Next.js applications.',
      'Implemented full MERN authentication flows including JWT token signing, refresh rotation, and protected React client routes.',
      'Optimized client performance cutting initial JS bundle by ~40% via route-based code splitting and dynamic imports; implemented virtualized scrolling for high-density datasets.'
    ],
    experienceBulletsIntern: [
      'Standardized team Git/GitLab version control workflows across feature branching, merge requests, and code reviews, independently reviewing and deploying production code into releases.',
      'Architected modular, reusable UI components integrated directly into the core production component library, establishing standardized UI consistency across applications.',
      'Integrated REST APIs into production screens and resolved critical cross-browser UI/UX issues, reducing QA reopen tickets.'
    ],
    projects: [
      {
        name: 'Mercanis — B2B SaaS Procurement Platform',
        tagline: 'Client Enterprise Project',
        stack: 'MongoDB · Express/NestJS · React.js · Node.js',
        bullets: [
          'Full-stack MERN contributor for enterprise procurement platform; built reactive user interfaces and connected NestJS/MongoDB backend microservices.',
          'Engineered shared design system components and eliminated rendering bottlenecks using memoization and virtualized lists.'
        ]
      },
      {
        name: 'Payroll & HR Platform',
        tagline: 'Internal Enterprise SaaS',
        stack: 'Next.js · TypeScript · NestJS · MongoDB · MCP (Model Context Protocol)',
        bullets: [
          'Built responsive Next.js frontend with Redux/Context state management against a NestJS backend for company-wide HR operations.',
          'Designed OAuth-style token exchange and built an MCP (Model Context Protocol) server exposing payroll & calendar tools for AI assistant workflows.'
        ]
      },
      {
        name: 'EduMiracle — Student ERP Portal',
        tagline: 'Full-Stack EdTech Platform',
        stack: 'MongoDB · Express/Next.js · React.js · Node.js · Gemini AI',
        bullets: [
          'Built solo full-stack ERP for a coaching institute: live attendance, Recharts mock test analytics, and CBT exam simulator.',
          'Integrated Gemini AI for real-time automated doubt solving with role-based administrative control.'
        ]
      }
    ]
  }
];

export function generateHtmlForVariant(v: ResumeVariantConfig): string {
  const c = COMMON_CANDIDATE;
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    @page {
      size: A4;
      margin: 9mm 13mm 9mm 13mm;
    }
    * {
      box-sizing: border-box;
    }
    body {
      font-family: 'Segoe UI', Arial, Helvetica, sans-serif;
      font-size: 9.6pt;
      line-height: 1.30;
      color: #111;
      margin: 0;
      padding: 0;
    }
    .header {
      text-align: center;
      border-bottom: 1.5px solid #1e293b;
      padding-bottom: 4px;
      margin-bottom: 5px;
    }
    .name {
      font-size: 17.5pt;
      font-weight: 700;
      letter-spacing: 0.8px;
      margin: 0;
      text-transform: uppercase;
      color: #0f172a;
    }
    .headline {
      font-size: 10pt;
      font-weight: 600;
      color: #334155;
      margin: 2px 0;
    }
    .contacts {
      font-size: 8.9pt;
      color: #475569;
      margin-top: 2px;
    }
    .contacts a {
      color: #0284c7;
      text-decoration: underline;
      text-underline-offset: 2px;
      font-weight: 500;
    }
    .section-title {
      font-size: 9.8pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      border-bottom: 1px solid #94a3b8;
      padding-bottom: 1.5px;
      margin-top: 5px;
      margin-bottom: 3px;
      color: #0f172a;
    }
    p.summary {
      margin: 2px 0 3px 0;
      font-size: 9.1pt;
      text-align: justify;
      color: #1e293b;
      line-height: 1.32;
    }
    .skills-block {
      font-size: 9.1pt;
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
      font-size: 9.4pt;
      font-weight: 700;
      margin-top: 3.5px;
      color: #0f172a;
    }
    .entry-sub {
      display: flex;
      justify-content: space-between;
      font-size: 8.8pt;
      font-style: italic;
      color: #475569;
      margin-bottom: 1.5px;
    }
    ul {
      margin: 1px 0 3.5px 15px;
      padding: 0;
    }
    li {
      font-size: 8.8pt;
      margin-bottom: 1.5px;
      line-height: 1.28;
      color: #1e293b;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="name">${c.fullName}</div>
    <div class="headline">${v.headlineTitle}</div>
    <div class="contacts">
      ${c.location} &nbsp;•&nbsp; 
      <a href="mailto:${c.email}">${c.email}</a> &nbsp;•&nbsp; 
      <a href="tel:${c.phone.replace(/[^0-9+]/g, '')}">${c.phone}</a> &nbsp;•&nbsp; 
      <a href="${c.linkedin}" target="_blank">LinkedIn</a> &nbsp;•&nbsp; 
      <a href="${c.github}" target="_blank">GitHub</a> &nbsp;•&nbsp; 
      <a href="${c.portfolio}" target="_blank">Portfolio</a>
    </div>
  </div>

  <div class="section-title">Professional Summary</div>
  <p class="summary">${v.summary}</p>

  <div class="section-title">Technical Skills</div>
  <div class="skills-block"><span class="skills-category">${v.skills.category1Title}:</span> ${v.skills.category1Skills.join(', ')}</div>
  <div class="skills-block"><span class="skills-category">${v.skills.category2Title}:</span> ${v.skills.category2Skills.join(', ')}</div>
  <div class="skills-block"><span class="skills-category">${v.skills.category3Title}:</span> ${v.skills.category3Skills.join(', ')}</div>
  <div class="skills-block"><span class="skills-category">${v.skills.category4Title}:</span> ${v.skills.category4Skills.join(', ')}</div>

  <div class="section-title">Work Experience</div>
  <div class="entry-header">
    <span>${c.company}</span>
    <span>${c.feDuration}</span>
  </div>
  <div class="entry-sub">
    <span>Frontend Engineer</span>
    <span>${c.location}</span>
  </div>
  <ul>
    ${v.experienceBulletsFE.map(b => `<li>${b}</li>`).join('')}
  </ul>

  <div class="entry-header">
    <span>${c.company}</span>
    <span>${c.internDuration}</span>
  </div>
  <div class="entry-sub">
    <span>Frontend Developer Intern</span>
    <span>${c.location}</span>
  </div>
  <ul>
    ${v.experienceBulletsIntern.map(b => `<li>${b}</li>`).join('')}
  </ul>

  <div class="section-title">Key Production Projects</div>
  ${v.projects.map(proj => `
    <div class="entry-header">
      <span>${proj.name}</span>
      <span>${proj.tagline}</span>
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
    <span>${c.education.degree}</span>
    <span>${c.education.year}</span>
  </div>
  <div class="entry-sub">
    <span>${c.education.institution}</span>
    <span>${c.education.score}</span>
  </div>
</body>
</html>
  `;
}

export async function compileAllVariants() {
  const outputDir = path.resolve('data/canonical_resumes');
  fs.mkdirSync(outputDir, { recursive: true });

  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const compiledPaths: string[] = [];

  for (const variant of RESUME_VARIANTS) {
    const html = generateHtmlForVariant(variant);
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'load' });

    // Output with clean underscore name
    const outUnderscore = path.join(outputDir, variant.fileNameUnderscore);
    await page.pdf({
      path: outUnderscore,
      format: 'A4',
      printBackground: true,
      margin: { top: '8mm', bottom: '8mm', left: '11mm', right: '11mm' }
    });
    compiledPaths.push(outUnderscore);

    // Also copy to hyphen name
    const outHyphen = path.join(outputDir, variant.fileNameHyphen);
    fs.copyFileSync(outUnderscore, outHyphen);

    console.log(`✅ Compiled: ${variant.fileNameUnderscore}`);
    await page.close();
  }

  await browser.close();
  return compiledPaths;
}

if (process.argv[1] && process.argv[1].includes('generate_4_resumes')) {
  compileAllVariants().catch(err => {
    console.error('Fatal build error:', err);
    process.exit(1);
  });
}
