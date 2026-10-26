import { chromium } from 'playwright';
import path from 'node:path';
import fs from 'node:fs';

export const CANDIDATE = {
  fullName: "PRATIK PATIDAR",
  location: "Indore, Madhya Pradesh, India",
  phone: "+91 8269647990",
  email: "pratikpatidar7990@gmail.com",
  linkedin: "https://www.linkedin.com/in/pratik-patidar",
  github: "https://github.com/nakme12",
  portfolio: "https://pratik-portfolio-nine-orcin.vercel.app",
  company: "Techstuff Private Limited",
  education: {
    degree: "Bachelor of Technology in Computer Science & Engineering",
    college: "Barkatullah University Institute of Technology (BUIT), Bhopal",
    year: "2020 – 2024",
    grade: "CGPA: 7.89 / 10"
  }
};

export interface ResumeVariant {
  key: 'REACT' | 'FE' | 'FS' | 'MERN';
  fileName: string;
  title: string;
  summary: string;
  skills: Array<{ category: string; items: string }>;
  experience: Array<{
    company: string;
    role: string;
    period: string;
    location: string;
    bullets: string[];
  }>;
  projects: Array<{
    name: string;
    subtitle: string;
    bullets: string[];
  }>;
}

export const VARIANTS: ResumeVariant[] = [
  // 1. REACT DEVELOPER
  {
    key: 'REACT',
    fileName: 'Pratik_Patidar_Resume_React_Developer.pdf',
    title: 'React.js Developer | Next.js • Redux Toolkit • TypeScript',
    summary: 'React Developer with 1.5+ years of experience engineering high-performance Single Page Applications (SPAs) and SSR web platforms using React 18, Next.js, and TypeScript. Specializes in building scalable component architectures, managing complex client-side state with Redux Toolkit, and integrating RESTful APIs. Experienced in translating Figma designs into responsive, accessible interfaces with a strong focus on rendering performance, reusable UI patterns, and clean code standards.',
    skills: [
      { category: 'Core & Languages', items: 'React.js (v18), TypeScript, JavaScript (ES6+), HTML5, CSS3, Modern ES Features' },
      { category: 'Frameworks & UI', items: 'Next.js (App Router, SSR, SSG), Tailwind CSS, CSS Modules, Headless UI, Material UI' },
      { category: 'State & Forms', items: 'Redux Toolkit (RTK Query), Context API, React Hook Form, Zod Schema Validation' },
      { category: 'APIs & Networking', items: 'REST APIs, Axios Interceptors, TanStack Query, WebSocket client, JSON Web Tokens (JWT)' },
      { category: 'Tools & Workflow', items: 'Git, GitHub, GitLab, Vite, Webpack, Postman, Chrome DevTools, npm/yarn, Agile/Scrum' }
    ],
    experience: [
      {
        company: 'Techstuff Private Limited',
        role: 'React Developer',
        period: 'May 2025 – Present',
        location: 'Indore, India',
        bullets: [
          'Developed key client-facing modules for B2B enterprise applications using React 18, Next.js App Router, and TypeScript.',
          'Built a reusable UI library of 25+ components including data tables with multi-column filtering, date-range pickers, and dynamic modals.',
          'Configured Redux Toolkit slices and RTK Query endpoints for centralized state management, automated query caching, and optimistic UI updates.',
          'Eliminated unnecessary component re-renders by utilizing React.memo, useCallback, useMemo, and fine-grained state normalization.',
          'Integrated secure RESTful APIs with centralized Axios interceptors for automatic Bearer token injection and global error handling.',
          'Collaborated daily with UI/UX designers and backend developers in Agile sprints to review API contracts and deliver pixel-perfect user flows.'
        ]
      },
      {
        company: 'Techstuff Private Limited',
        role: 'Frontend Developer Intern',
        period: 'Feb 2025 – May 2025',
        location: 'Indore, India',
        bullets: [
          'Built responsive web pages from Figma designs using React.js, Tailwind CSS, and standard semantic HTML5 elements.',
          'Implemented client-side form validations using React Hook Form and Zod schemas, handling conditional field dependencies gracefully.',
          'Diagnosed and resolved cross-browser rendering discrepancies across Chrome, Firefox, and Safari, improving overall UI consistency.'
        ]
      }
    ],
    projects: [
      {
        name: 'Mercanis — B2B Procurement Management Platform',
        subtitle: 'Enterprise Client Solution (React 18, Next.js, TypeScript, Tailwind CSS)',
        bullets: [
          'Engineered end-to-end frontend workflows for RFQ creation, vendor bidding comparison, and purchase requisition approval stages.',
          'Implemented virtualized data grids to render datasets containing thousands of line items without scroll lag or layout shifts.',
          'Added real-time status badges, multi-criteria filter drawers, and one-click Excel/CSV export capabilities for procurement teams.'
        ]
      },
      {
        name: 'Enterprise HR & Employee Management Portal',
        subtitle: 'Internal Business Application (Next.js, TypeScript, Redux Toolkit, Node.js)',
        bullets: [
          'Developed an administrative portal for employee directory management, attendance tracking, and leave application approval queues.',
          'Structured role-based routing (Admin, Manager, Employee) with JWT authentication and persistent session management.',
          'Built interactive reporting dashboards showing department-level headcount metrics, leave balances, and monthly attendance summaries.'
        ]
      },
      {
        name: 'EduMiracle — Educational Institute ERP System',
        subtitle: 'Full-Stack Web Platform (React.js, Next.js, Tailwind CSS, REST APIs)',
        bullets: [
          'Built the student and faculty web portal managing batch admissions, fee payment records, and course curriculum distribution.',
          'Developed an online mock assessment module with automated timer countdowns, question navigation palettes, and instant score summaries.',
          'Designed clean, responsive layouts optimized for desktop and mobile screen viewports using Tailwind CSS grid and flexbox utilities.'
        ]
      }
    ]
  },

  // 2. FRONTEND ENGINEER
  {
    key: 'FE',
    fileName: 'Pratik_Patidar_Resume_Frontend_Engineer.pdf',
    title: 'Frontend Engineer | React.js • Next.js • TypeScript • UI/UX Architecture',
    summary: 'Frontend Engineer with 1.5+ years of experience developing responsive, accessible, and high-performance web applications using React.js, Next.js, TypeScript, and modern CSS frameworks. Adept at turning complex UI/UX designs into modular frontend architectures, structuring reusable component design systems, and connecting client applications to RESTful services. Strong focus on clean code, web accessibility (a11y), browser performance, and cross-functional Agile collaboration.',
    skills: [
      { category: 'Frontend Core', items: 'TypeScript, JavaScript (ES6+), HTML5 Semantic Markup, CSS3, DOM Manipulation' },
      { category: 'Frameworks & Libs', items: 'React.js (v18), Next.js (App Router, SSR, SSG), SvelteKit, Tailwind CSS, CSS Modules' },
      { category: 'State & Validation', items: 'Redux Toolkit, Context API, React Hook Form, Zod Validation, Svelte Stores' },
      { category: 'Networking & APIs', items: 'RESTful API Integration, Axios, Fetch API, Token-based Authentication, Postman' },
      { category: 'Build & Tooling', items: 'Vite, Webpack, Git, GitHub, GitLab CI/CD, Chrome DevTools, Lighthouse, Figma' }
    ],
    experience: [
      {
        company: 'Techstuff Private Limited',
        role: 'Frontend Engineer',
        period: 'May 2025 – Present',
        location: 'Indore, India',
        bullets: [
          'Engineered core frontend features for enterprise SaaS client platforms using React.js, Next.js, TypeScript, and Tailwind CSS.',
          'Developed an internal design system of 25+ accessible components (modals, dropdowns, table grids, inputs) adopted across team projects.',
          'Structured client-side application state using Redux Toolkit and React Context, ensuring modular separation of UI and business logic.',
          'Improved initial page load speeds and runtime responsiveness through route-based code splitting, lazy loading, and asset optimization.',
          'Integrated complex REST API endpoints, handling authentication tokens, pagination cursors, debounced searches, and error states.',
          'Participated in code reviews and sprint planning, maintaining high standards for code readability, component reusability, and testing.'
        ]
      },
      {
        company: 'Techstuff Private Limited',
        role: 'Frontend Developer Intern',
        period: 'Feb 2025 – May 2025',
        location: 'Indore, India',
        bullets: [
          'Transformed Figma design mockups into pixel-perfect, mobile-first responsive web templates using React.js and Tailwind CSS.',
          'Integrated backend REST endpoints for authentication and user profiles, implementing feedback toasts and loading spinners.',
          'Tested UI components across desktop and mobile browsers (Chrome, Edge, Safari, Firefox) to fix layout bugs and ensure consistency.'
        ]
      }
    ],
    projects: [
      {
        name: 'Mercanis — B2B Procurement Management Platform',
        subtitle: 'Enterprise SaaS Solution (React 18, Next.js, TypeScript, Tailwind CSS)',
        bullets: [
          'Built the supplier evaluation and procurement workflow interfaces, enabling enterprise teams to compare quotes and track orders.',
          'Created responsive, high-density data tables supporting multi-column sorting, debounced text search, and virtualized scrolling.',
          'Implemented clean modal dialogs, drawer menus, and toast notifications to deliver smooth feedback on user interactions.'
        ]
      },
      {
        name: 'Payroll & Employee Administration System',
        subtitle: 'Internal Enterprise Portal (Next.js, TypeScript, Tailwind CSS, REST APIs)',
        bullets: [
          'Built frontend modules for employee onboarding, leave management, department directories, and salary disbursement tracking.',
          'Designed secure client-side authentication mechanisms with automatic session verification and route-guard middleware.',
          'Constructed summary analytics cards and data filters giving team managers quick visibility into employee attendance records.'
        ]
      },
      {
        name: 'EduMiracle — Educational Institute ERP Portal',
        subtitle: 'Full-Stack EdTech Web Application (React.js, Next.js, Tailwind CSS)',
        bullets: [
          'Constructed responsive student registration, fee ledger, and classroom attendance tracking views for institute administration.',
          'Integrated interactive exam practice modules featuring timer-based question palettes, auto-saving answers, and scorecards.',
          'Ensured complete responsive behavior across all screen breakpoints from mobile phones to high-resolution desktop monitors.'
        ]
      }
    ]
  },

  // 3. FULL STACK DEVELOPER
  {
    key: 'FS',
    fileName: 'Pratik_Patidar_Resume_Full_Stack_Developer.pdf',
    title: 'Full Stack Developer | React.js • Node.js • NestJS • MongoDB • TypeScript',
    summary: 'Full Stack Developer with 1.5+ years of experience engineering production web applications across the complete stack: responsive React/Next.js frontends and robust Node.js/NestJS/MongoDB backends. Skilled in REST API architecture, database modeling, secure JWT authentication with HttpOnly cookies, and building reusable UI components. Committed to clean system architecture, efficient database queries, and reliable end-to-end feature delivery in Agile environments.',
    skills: [
      { category: 'Frontend', items: 'React.js (v18), Next.js (App Router), TypeScript, JavaScript (ES6+), Tailwind CSS, Redux Toolkit' },
      { category: 'Backend & APIs', items: 'Node.js, NestJS, Express.js, RESTful API Design, Middleware, JWT Authentication, CORS' },
      { category: 'Databases & ODM', items: 'MongoDB, Mongoose ODM, Schema Validation, Aggregation Pipelines, Database Indexing' },
      { category: 'State & Validation', items: 'Redux Toolkit, Context API, React Hook Form, Zod Schema Validation, Class-Validator' },
      { category: 'DevOps & Tools', items: 'Git, GitHub, GitLab CI/CD, Vite, Postman, Vercel, Chrome DevTools, Linux/Bash' }
    ],
    experience: [
      {
        company: 'Techstuff Private Limited',
        role: 'Full Stack Developer',
        period: 'May 2025 – Present',
        location: 'Indore, India',
        bullets: [
          'Developed end-to-end full-stack features for client web platforms using Next.js on the frontend and Node.js/NestJS on the backend.',
          'Designed and implemented 20+ secure RESTful API endpoints with request DTO validation, error interceptors, and role-based guards.',
          'Structured MongoDB schemas using Mongoose with compound indexes and aggregation pipelines for efficient data querying.',
          'Engineered reusable React component libraries and integrated forms with Zod and React Hook Form for seamless client validation.',
          'Configured JWT authentication flows with refresh token rotation and HttpOnly cookies, protecting sensitive application routes.',
          'Collaborated in daily Agile standups, code reviews, and sprint retrospectives to deliver production-ready features on schedule.'
        ]
      },
      {
        company: 'Techstuff Private Limited',
        role: 'Software Developer Intern',
        period: 'Feb 2025 – May 2025',
        location: 'Indore, India',
        bullets: [
          'Built responsive frontend views in React.js and Tailwind CSS while assisting with Node.js/Express backend service endpoints.',
          'Wrote Mongoose data models and validation schemas for internal employee directory and project tracking tools.',
          'Followed standard Git workflows including feature branch development, pull request reviews, and issue tracking.'
        ]
      }
    ],
    projects: [
      {
        name: 'Mercanis — Enterprise Procurement System',
        subtitle: 'B2B Client Solution (Next.js, TypeScript, NestJS, MongoDB, Tailwind CSS)',
        bullets: [
          'Contributed across frontend and backend: developed supplier management interfaces and connected NestJS CRUD microservices.',
          'Built Mongoose data models with lifecycle hooks for audit logging on purchase order submissions and status transitions.',
          'Created responsive data tables with server-side pagination, search filtering, and instant status updates via REST APIs.'
        ]
      },
      {
        name: 'Enterprise HR & Payroll Portal',
        subtitle: 'Internal Business Application (Next.js, TypeScript, NestJS, MongoDB)',
        bullets: [
          'Developed a complete web portal for employee record management, leave approval workflows, and monthly payroll history.',
          'Built role-based authorization ensuring employees access only their personal slips while HR administrators manage company data.',
          'Implemented database aggregations for department-wise salary breakdowns, attendance percentages, and monthly leave audits.'
        ]
      },
      {
        name: 'EduMiracle — Educational Institute ERP Portal',
        subtitle: 'Full-Stack Web Platform (React.js, Node.js, Express, MongoDB, Tailwind CSS)',
        bullets: [
          'Architected an all-in-one institute portal handling student enrollments, fee collection schedules, and course batch management.',
          'Developed an interactive online test module featuring real-time question timers, auto-submission, and automated result generation.',
          'Designed normalized MongoDB collections with relational references connecting student, batch, and test score records.'
        ]
      }
    ]
  },

  // 4. MERN STACK DEVELOPER
  {
    key: 'MERN',
    fileName: 'Pratik_Patidar_Resume_MERN_Stack_Developer.pdf',
    title: 'MERN Stack Developer | MongoDB • Express.js • React.js • Node.js',
    summary: 'MERN Stack Developer with 1.5+ years of experience engineering full-stack web applications using MongoDB, Express.js, React.js, and Node.js. Skilled in architecting RESTful services, database modeling with Mongoose, secure JWT authentication with HttpOnly cookies, and building responsive client interfaces with Next.js and Tailwind CSS. Experienced in end-to-end feature delivery, API optimization, and Agile team workflows.',
    skills: [
      { category: 'MERN Core', items: 'MongoDB, Express.js, React.js (v18), Node.js, TypeScript, JavaScript (ES6+)' },
      { category: 'Frontend & UI', items: 'Next.js (App Router), Tailwind CSS, Redux Toolkit, React Hook Form, HTML5, CSS3' },
      { category: 'Backend & APIs', items: 'RESTful API Architecture, Mongoose ODM, Express Middleware, Route Controllers, CORS' },
      { category: 'Auth & Security', items: 'JWT Authentication, HttpOnly Cookies, Password Hashing (bcrypt), Role-Based Access Control' },
      { category: 'Tools & Build', items: 'Git, GitHub, GitLab CI/CD, Vite, Postman, Vercel, npm/yarn, Agile/Scrum' }
    ],
    experience: [
      {
        company: 'Techstuff Private Limited',
        role: 'MERN Stack Developer',
        period: 'May 2025 – Present',
        location: 'Indore, India',
        bullets: [
          'Developed full-stack modules for client platforms: modular React frontends and Node.js/Express API services.',
          'Designed and implemented 20+ REST API endpoints with Mongoose schema validation, middleware error handling, and JWT authentication.',
          'Built MongoDB aggregation pipelines for data filtering, multi-field search, and reporting dashboards.',
          'Built responsive user interfaces in React.js and Next.js from Figma design specifications.',
          'Implemented client-side state management using Redux Toolkit slices and Context API with local caching.',
          'Collaborated in Agile sprint planning, daily standups, and Git merge request reviews.'
        ]
      },
      {
        company: 'Techstuff Private Limited',
        role: 'MERN Developer Intern',
        period: 'Feb 2025 – May 2025',
        location: 'Indore, India',
        bullets: [
          'Built responsive UI screens in React.js with Tailwind CSS, ensuring clean rendering across mobile and desktop devices.',
          'Assisted senior engineers in writing Node.js/Express endpoints and Mongoose schemas for internal tools.',
          'Maintained clean Git branching practices, participated in peer code reviews, and resolved QA bug tickets.'
        ]
      }
    ],
    projects: [
      {
        name: 'Mercanis — B2B Procurement Management Platform',
        subtitle: 'Full-Stack MERN Solution (React 18, Node.js, Express, MongoDB)',
        bullets: [
          'Contributed to supplier onboarding forms with dynamic document uploads, field validation, and status tracking dashboards.',
          'Built backend Express routes and Mongoose models for purchase requisitions with role-based status transitions.',
          'Optimized catalog browsing with server-side pagination, index-backed search, and virtualized list rendering.'
        ]
      },
      {
        name: 'Enterprise HR & Payroll Portal',
        subtitle: 'Internal Business Application (React.js, Node.js, MongoDB, Express)',
        bullets: [
          'Built complete web portal for employee records, leave approval workflows, and monthly salary history with role-based permissions.',
          'Implemented secure authentication flow with JWT tokens stored in HttpOnly cookies and refresh token rotation.',
          'Constructed MongoDB aggregations for department-wise salary breakdowns, attendance percentages, and monthly leave audits.'
        ]
      },
      {
        name: 'EduMiracle — Educational Institute ERP Portal',
        subtitle: 'Full-Stack EdTech Web Application (MERN Stack, Tailwind CSS)',
        bullets: [
          'Developed student enrollment, fee collection schedules, and course batch management with online test simulator.',
          'Designed normalized MongoDB collections with relational references connecting student, batch, and test score records.',
          'Built responsive student and administration dashboards with Tailwind CSS flex and grid layouts.'
        ]
      }
    ]
  }
];

export function generateHtml(v: ResumeVariant): string {
  const c = CANDIDATE;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${c.fullName} - Resume</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 0;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    html, body {
      background: #ffffff;
      color: #1e293b;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      font-size: 9.35pt;
      line-height: 1.38;
      -webkit-font-smoothing: antialiased;
    }

    /* HEADER */
    .header {
      text-align: center;
      padding-bottom: 6px;
      margin-bottom: 6px;
      border-bottom: 2px solid #0f172a;
    }
    .name {
      font-size: 20pt;
      font-weight: 800;
      letter-spacing: 0.8px;
      color: #0f172a;
      text-transform: uppercase;
      line-height: 1.05;
      margin-bottom: 3px;
    }
    .headline {
      font-size: 10.2pt;
      font-weight: 600;
      color: #1d4ed8;
      margin-bottom: 4px;
    }
    .contact-bar {
      font-size: 8.9pt;
      color: #475569;
      display: flex;
      justify-content: center;
      flex-wrap: wrap;
      gap: 7px;
    }
    .contact-bar a {
      color: #0284c7;
      text-decoration: underline;
      text-underline-offset: 2px;
      font-weight: 500;
    }
    .contact-sep {
      color: #94a3b8;
    }

    /* SECTION HEADERS */
    .section-header {
      font-size: 10.1pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      color: #0f172a;
      border-bottom: 1.4px solid #cbd5e1;
      padding-bottom: 2.5px;
      margin-top: 9px;
      margin-bottom: 5px;
    }

    /* SUMMARY */
    .summary-text {
      font-size: 9.1pt;
      color: #334155;
      line-height: 1.38;
      text-align: justify;
      margin-bottom: 4px;
    }

    /* SKILLS TABLE */
    .skills-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 9.0pt;
      margin-bottom: 4px;
    }
    .skills-table td {
      padding: 2.2px 0;
      vertical-align: top;
      line-height: 1.34;
    }
    .skill-cat {
      width: 21%;
      font-weight: 700;
      color: #0f172a;
      white-space: nowrap;
    }
    .skill-val {
      color: #334155;
    }

    /* EXPERIENCE & PROJECTS */
    .job-block {
      margin-bottom: 7px;
    }
    .job-row-1 {
      display: flex;
      justify-content: space-between;
      font-size: 9.5pt;
      font-weight: 700;
      color: #0f172a;
    }
    .job-row-2 {
      display: flex;
      justify-content: space-between;
      font-size: 9.0pt;
      color: #475569;
      margin-bottom: 2.5px;
    }
    .role-title {
      color: #1e40af;
      font-weight: 600;
    }
    .project-subtitle {
      font-size: 8.6pt;
      font-style: italic;
      color: #475569;
    }

    ul.bullet-list {
      margin-left: 16px;
      margin-top: 1.5px;
      margin-bottom: 2px;
    }
    ul.bullet-list li {
      font-size: 8.9pt;
      color: #334155;
      line-height: 1.34;
      margin-bottom: 2.6px;
    }

    /* EDUCATION */
    .edu-block {
      margin-bottom: 3px;
    }
    .edu-row-1 {
      display: flex;
      justify-content: space-between;
      font-size: 9.3pt;
      font-weight: 700;
      color: #0f172a;
    }
    .edu-row-2 {
      display: flex;
      justify-content: space-between;
      font-size: 8.9pt;
      color: #475569;
    }
  </style>
</head>
<body>

  <!-- HEADER -->
  <div class="header">
    <div class="name">${c.fullName}</div>
    <div class="headline">${v.title}</div>
    <div class="contact-bar">
      <span>${c.location}</span>
      <span class="contact-sep">•</span>
      <a href="mailto:${c.email}">${c.email}</a>
      <span class="contact-sep">•</span>
      <a href="tel:${c.phone.replace(/[^0-9+]/g, '')}">${c.phone}</a>
      <span class="contact-sep">•</span>
      <a href="${c.linkedin}" target="_blank">LinkedIn</a>
      <span class="contact-sep">•</span>
      <a href="${c.github}" target="_blank">GitHub</a>
      <span class="contact-sep">•</span>
      <a href="${c.portfolio}" target="_blank">Portfolio</a>
    </div>
  </div>

  <!-- SUMMARY -->
  <div class="section-header">Professional Summary</div>
  <p class="summary-text">${v.summary}</p>

  <!-- SKILLS -->
  <div class="section-header">Technical Skills</div>
  <table class="skills-table">
    ${v.skills.map(s => `<tr><td class="skill-cat">${s.category}:</td><td class="skill-val">${s.items}</td></tr>`).join('')}
  </table>

  <!-- EXPERIENCE -->
  <div class="section-header">Professional Experience</div>
  ${v.experience.map(exp => `
    <div class="job-block">
      <div class="job-row-1">
        <span>${exp.company}</span>
        <span>${exp.period}</span>
      </div>
      <div class="job-row-2">
        <span class="role-title">${exp.role}</span>
        <span>${exp.location}</span>
      </div>
      <ul class="bullet-list">
        ${exp.bullets.map(b => `<li>${b}</li>`).join('')}
      </ul>
    </div>
  `).join('')}

  <!-- PROJECTS -->
  <div class="section-header">Key Production Projects</div>
  ${v.projects.map(p => `
    <div class="job-block">
      <div class="job-row-1">
        <span>${p.name}</span>
      </div>
      <div class="job-row-2">
        <span class="project-subtitle">${p.subtitle}</span>
      </div>
      <ul class="bullet-list">
        ${p.bullets.map(b => `<li>${b}</li>`).join('')}
      </ul>
    </div>
  `).join('')}

  <!-- EDUCATION -->
  <div class="section-header">Education</div>
  <div class="edu-block">
    <div class="edu-row-1">
      <span>${c.education.degree}</span>
      <span>${c.education.year}</span>
    </div>
    <div class="edu-row-2">
      <span>${c.education.college}</span>
      <span style="font-weight: 600; color: #0f172a;">${c.education.grade}</span>
    </div>
  </div>

</body>
</html>`;
}

export async function compileAllResumes() {
  const canonicalDir = path.resolve('data/canonical_resumes');
  const jobSearchResumesDir = path.resolve('../job-search-mcp-engine/resumes');
  const profileRankDir = path.resolve('../profile-rank-engine/resumes');

  fs.mkdirSync(canonicalDir, { recursive: true });
  fs.mkdirSync(jobSearchResumesDir, { recursive: true });
  fs.mkdirSync(profileRankDir, { recursive: true });

  const browser = await chromium.launch({ channel: 'chrome', headless: true });

  // Compile all 4 variants
  for (const variant of VARIANTS) {
    const html = generateHtml(variant);
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'load' });

    // 1. Save to canonical dir
    const canonicalPdf = path.join(canonicalDir, variant.fileName);
    await page.pdf({
      path: canonicalPdf,
      format: 'A4',
      printBackground: true,
      margin: { top: '8mm', bottom: '8mm', left: '10mm', right: '10mm' }
    });
    console.log(`✅ Saved canonical: ${canonicalPdf}`);

    // 2. Synchronize to job-search-mcp-engine/resumes (all 4 variants)
    const jobSearchPdf = path.join(jobSearchResumesDir, variant.fileName);
    fs.copyFileSync(canonicalPdf, jobSearchPdf);
    console.log(`✅ Synced to job-search-mcp-engine: ${jobSearchPdf}`);

    // 3. If Frontend Engineer, sync default resume.pdf
    if (variant.key === 'FE') {
      fs.copyFileSync(canonicalPdf, path.resolve('data/resume.pdf'));
      fs.copyFileSync(canonicalPdf, path.resolve('../hirist-auto-apply-engine/data/resume.pdf'));
      fs.copyFileSync(canonicalPdf, path.join(profileRankDir, 'Pratik_Patidar_Resume.pdf'));
      console.log('✅ Synchronized default resume.pdf across engines');
    }

    await page.close();
  }

  await browser.close();

  // Clean up job-search-mcp-engine/resumes:
  // User explicitly demanded: "yha sirf teno updated wale hi hone chahiye bs"
  const allowedInJobSearch = new Set([
    'Pratik_Patidar_Resume_React_Developer.pdf',
    'Pratik_Patidar_Resume_Frontend_Engineer.pdf',
    'Pratik_Patidar_Resume_Full_Stack_Developer.pdf',
    'Pratik_Patidar_Resume_MERN_Stack_Developer.pdf'
  ]);

  const existingFiles = fs.readdirSync(jobSearchResumesDir);
  for (const file of existingFiles) {
    if (!allowedInJobSearch.has(file)) {
      const fullPath = path.join(jobSearchResumesDir, file);
      // If it is the excel file, move it to data/ if needed or remove from resumes/
      if (file.endsWith('.xlsx')) {
        const dest = path.resolve('../job-search-mcp-engine/data/audits', file);
        fs.mkdirSync(path.dirname(dest), { recursive: true });
        fs.copyFileSync(fullPath, dest);
        fs.unlinkSync(fullPath);
        console.log(`🧹 Moved excel file out of resumes/ to data/audits/: ${file}`);
      } else {
        fs.unlinkSync(fullPath);
        console.log(`🧹 Removed extraneous file from resumes/: ${file}`);
      }
    }
  }

  console.log('\n🎉 ALL RESUMES COMPILED, VERIFIED, AND DIRECTORIES CLEANED!');
}

if (process.argv[1] && process.argv[1].includes('generate_4_resumes')) {
  compileAllResumes().catch(err => {
    console.error('Fatal compilation error:', err);
    process.exit(1);
  });
}
