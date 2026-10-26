import { chromium } from 'playwright';
import path from 'node:path';
import fs from 'node:fs';

export const CANDIDATE = {
  fullName: "PRATIK PATIDAR",
  titleFE: "Frontend Engineer • React.js • Next.js • TypeScript",
  titleFS: "Full Stack Developer • React.js • Node.js • NestJS • MongoDB",
  titleReact: "React Developer • React.js • Next.js • Redux Toolkit • TypeScript",
  titleMERN: "MERN Stack Developer • MongoDB • Express.js • React.js • Node.js",
  location: "Indore, India",
  email: "pratikpatidar7990@gmail.com",
  phone: "+91 8269647990",
  linkedin: "https://www.linkedin.com/in/pratik-patidar",
  github: "https://github.com/nakme12",
  portfolio: "https://pratik-portfolio-nine-orcin.vercel.app",
  company: "Techstuff Private Limited",
  education: {
    degree: "B.Tech in Computer Science & Engineering",
    college: "Barkatullah University Institute of Technology (BUIT), Bhopal",
    year: "2020 – 2024",
    grade: "CGPA: 7.89 / 10"
  }
};

export interface VariantConfig {
  key: 'FE' | 'FS' | 'REACT' | 'MERN';
  fileNameUnderscore: string;
  fileNameHyphen: string;
  title: string;
  summary: string;
  skillsRows: Array<{ label: string; value: string }>;
  feBullets: string[];
  internBullets: string[];
  project1Bullets: string[];
  project2Bullets: string[];
  project3Bullets: string[];
}

export const VARIANTS: VariantConfig[] = [
  // 1. FRONTEND ENGINEER
  {
    key: 'FE',
    fileNameUnderscore: 'Pratik_Patidar_Resume_Frontend_Engineer.pdf',
    fileNameHyphen: 'Pratik Patidar Resume - Frontend Engineer.pdf',
    title: 'Frontend Engineer • React.js • Next.js • TypeScript',
    summary: 'Frontend Engineer with 1.5+ years of production experience building responsive, high-performance web applications using React.js, Next.js, and TypeScript. Core contributor to B2B enterprise SaaS products and client portals, taking features from Figma designs to production deployment. Reduced initial bundle size by 40% using code splitting, dynamic imports, and virtualized lists. Strong eye for UI/UX consistency, clean component architecture, and seamless RESTful API integration.',
    skillsRows: [
      { label: 'Languages & Core:', value: 'TypeScript, JavaScript (ES6+), HTML5, CSS3, JSON' },
      { label: 'Frontend & Frameworks:', value: 'React.js (v18), Next.js (App Router, SSR/SSG), SvelteKit, Tailwind CSS, CSS Modules' },
      { label: 'State & Forms:', value: 'Redux Toolkit, Context API, React Hook Form, Zod, Svelte Stores' },
      { label: 'Backend & APIs:', value: 'RESTful API Integration, Node.js, Express.js basics, Postman, JWT handling' },
      { label: 'Tools & Performance:', value: 'Git, GitLab CI/CD, Vite, Webpack, Lighthouse, Web Vitals, Virtualization, Figma' }
    ],
    feBullets: [
      "Engineered core frontend features for Mercanis (B2B SaaS Procurement platform) using SvelteKit, Next.js, and TypeScript, delivering accessible and responsive user interfaces.",
      "Collaborated closely with backend engineers to define REST API contracts, request payloads, and error-handling schemas prior to implementation, reducing integration friction.",
      "Built a 20+ reusable UI component system (data tables, filter drawers, search bars, modals) utilized across 3 enterprise applications, standardizing design consistency.",
      "Optimized frontend performance and Lighthouse score from 68 to 94 by implementing route-based lazy loading, image optimization, dynamic imports, and DOM virtualization on large data grids.",
      "Handled complex client-side state transitions with Redux Toolkit and React Hook Form, ensuring real-time form validation with Zod and zero UI stutter."
    ],
    internBullets: [
      "Built modular, accessible UI components from Figma design specs using React.js, Tailwind CSS, and CSS Modules.",
      "Integrated third-party RESTful APIs and authentication endpoints, implementing secure token handling and persistent login sessions.",
      "Conducted cross-browser compatibility testing across Chrome, Firefox, and Safari, fixing layout glitches and reducing QA bug tickets by 25%."
    ],
    project1Bullets: [
      "Built interactive procurement workflows, catalog management, and supplier evaluation modules used by enterprise procurement teams.",
      "Created high-density data tables with multi-column sorting, debounced global search, and virtualized scrolling handling 5,000+ line items seamlessly.",
      "Integrated secure REST API endpoints with optimistic UI updates and toast notifications for asynchronous actions."
    ],
    project2Bullets: [
      "Developed responsive frontend modules for internal company HR operations: employee directory, leave tracker, and salary disbursement records.",
      "Designed clean client-side state architecture using Context API and Redux Toolkit with persistent local caching for offline capability.",
      "Built a custom Model Context Protocol (MCP) tool integration connecting internal employee calendar events to assistant workflows."
    ],
    project3Bullets: [
      "Architected and deployed a full-stack coaching institute ERP managing student registrations, fee tracking, and live classroom attendance.",
      "Integrated interactive exam performance analytics using Recharts, giving students graphical score breakdowns and percentile comparisons.",
      "Implemented automated AI doubt-clearing assistant powered by Gemini API with rate-limiting and administrative monitoring."
    ]
  },

  // 2. FULL STACK DEVELOPER
  {
    key: 'FS',
    fileNameUnderscore: 'Pratik_Patidar_Resume_Full_Stack_Developer.pdf',
    fileNameHyphen: 'Pratik Patidar Resume - Full Stack Developer.pdf',
    title: 'Full Stack Developer • React.js • Node.js • NestJS • MongoDB',
    summary: 'Full Stack Developer with 1.5+ years of hands-on experience building production web applications using React.js/Next.js frontends and Node.js/NestJS/MongoDB backends. Proven track record in designing scalable REST APIs, implementing secure JWT authentication, and optimizing database queries. Experienced in end-to-end delivery from database schema modeling to reactive, accessible UI deployment.',
    skillsRows: [
      { label: 'Frontend:', value: 'React.js, Next.js (App Router), TypeScript, JavaScript (ES6+), Tailwind CSS, Redux Toolkit' },
      { label: 'Backend:', value: 'Node.js, NestJS, Express.js, REST API Architecture, JWT (HttpOnly Cookies), Middleware' },
      { label: 'Databases:', value: 'MongoDB, Mongoose ODM, Schema Design, Aggregation Pipelines, Indexing' },
      { label: 'State & Validation:', value: 'Redux Toolkit, React Hook Form, Zod Schema Validation, Context API' },
      { label: 'DevOps & Tools:', value: 'Git, GitLab CI/CD, Vite, Postman, Vercel, Docker basics, Lighthouse Performance' }
    ],
    feBullets: [
      "Architected full-stack features for Mercanis (B2B SaaS Procurement platform) and enterprise tools using Next.js on the frontend and NestJS/Node.js on the backend.",
      "Designed and deployed 15+ RESTful API endpoints with DTO validation, error interceptors, and JWT-based role authorization (Admin, Manager, Employee).",
      "Engineered MongoDB aggregation pipelines and compound indexes, decreasing query response times by 35% on multi-tenant reporting queries.",
      "Built reusable UI components with React/TypeScript and integrated complex forms with Zod validation, delivering smooth validation feedback.",
      "Optimized full-stack performance cutting client bundle sizes by 40% via dynamic imports and implementing server-side caching on frequently queried endpoints."
    ],
    internBullets: [
      "Assisted in developing Node.js/Express API services and connected MongoDB models for internal project management tooling.",
      "Built responsive client screens in React.js and Tailwind CSS, collaborating with senior developers on Git feature-branch workflows.",
      "Resolved cross-browser styling issues and wrote unit tests using Jest, achieving 80%+ test coverage on core utility modules."
    ],
    project1Bullets: [
      "Contributed across frontend and backend for enterprise procurement: built supplier management UI and associated NestJS CRUD microservices.",
      "Implemented MongoDB schemas with Mongoose hooks for audit logging and timestamping on high-value procurement requests.",
      "Designed responsive tables with server-side pagination, debounced search, and CSV export functionality."
    ],
    project2Bullets: [
      "Engineered internal payroll management web application with Next.js frontend and NestJS/MongoDB backend.",
      "Built token-based authentication flow with secure refresh token rotation and role-based route guards.",
      "Integrated Model Context Protocol (MCP) server exposing backend calendar and payroll inspection tools."
    ],
    project3Bullets: [
      "Solo engineered comprehensive student management ERP: fee management, attendance tracker, and computer-based test simulator.",
      "Built MongoDB database schemas with relational indexing across student, batch, and test result collections.",
      "Integrated Gemini AI API for real-time automated homework and doubt assistance with role-based admin oversight."
    ]
  },

  // 3. REACT DEVELOPER
  {
    key: 'REACT',
    fileNameUnderscore: 'Pratik_Patidar_Resume_React_Developer.pdf',
    fileNameHyphen: 'Pratik Patidar Resume - React Developer.pdf',
    title: 'React Developer • React.js • Next.js • Redux Toolkit • TypeScript',
    summary: 'React Developer with 1.5+ years of specialized experience engineering high-performance Single Page Applications (SPAs) and SSR web apps using React.js, Next.js, TypeScript, and Redux Toolkit. Deep expertise in React hooks, state normalization, component lifecycles, and translating Figma designs into modular, pixel-perfect interfaces. Passionate about bundle optimization, accessibility (a11y), and zero-friction user experiences.',
    skillsRows: [
      { label: 'Core React:', value: 'React.js (v18), Custom Hooks, Virtual DOM, Component Lifecycle, JSX / TSX, Concurrent Features' },
      { label: 'Frameworks & Styling:', value: 'Next.js (App Router, SSR, SSG), TypeScript, Tailwind CSS, CSS Modules, Styled Components' },
      { label: 'State Management:', value: 'Redux Toolkit (RTK Query, Thunks), Context API, React Hook Form, Zod Validation' },
      { label: 'API Integration:', value: 'RESTful APIs, Axios, Fetch, Optimistic UI Updates, JWT Auth Flow, Postman' },
      { label: 'Build & Performance:', value: 'Vite, Webpack, Lighthouse Audits (90+), Code Splitting, Virtualization, Git, GitLab CI/CD' }
    ],
    feBullets: [
      "Led frontend development of core interactive modules using React.js, Next.js, and TypeScript, delivering 100% mobile-responsive interfaces.",
      "Collaborated with backend engineers to establish robust REST API contracts, payload schemas, and validation rules prior to UI development.",
      "Engineered a library of 20+ accessible, reusable React components (date pickers, data tables, modals, dropdowns) cutting feature turnaround by 35%.",
      "Slashed client bundle size by 40% and improved Largest Contentful Paint (LCP) from 3.4s to 1.3s via code splitting, dynamic imports, and lazy loading.",
      "Implemented global state architecture using Redux Toolkit and Context API, eliminating prop drilling and optimizing component re-renders."
    ],
    internBullets: [
      "Translated Figma prototypes into clean, responsive React components using Tailwind CSS and modern CSS3 flex/grid layouts.",
      "Integrated REST APIs into production screens with proper loading skeletons, error states, and empty-state placeholders.",
      "Standardized team Git version control practices across branching, pull requests, and code reviews, reducing deployment defects."
    ],
    project1Bullets: [
      "Built core user interfaces for B2B procurement portal; owned feature implementation from Figma specs to production release.",
      "Engineered complex multi-step requisition forms with real-time field validation, draft autosaving, and dynamic row addition.",
      "Implemented table virtualization for large catalogs, keeping render times under 16ms even with 5,000+ items."
    ],
    project2Bullets: [
      "Developed responsive Next.js frontend with Redux Toolkit for centralized employee records, leave requests, and payroll tracking.",
      "Implemented client-side route protection and JWT authentication with automatic silent token refresh.",
      "Built custom Model Context Protocol (MCP) server bridging internal calendar data with developer productivity workflows."
    ],
    project3Bullets: [
      "Designed and built complete frontend for coaching institute ERP using Next.js, Tailwind CSS, and Recharts.",
      "Created interactive student exam dashboard with real-time countdown timer, question palette, and score analysis.",
      "Integrated Gemini AI API for automated student doubt clarification with clean chat interface and markdown rendering."
    ]
  },

  // 4. MERN STACK DEVELOPER
  {
    key: 'MERN',
    fileNameUnderscore: 'Pratik_Patidar_Resume_MERN_Stack_Developer.pdf',
    fileNameHyphen: 'Pratik Patidar Resume - MERN Full Stack.pdf',
    title: 'MERN Stack Developer • MongoDB • Express.js • React.js • Node.js',
    summary: 'MERN Stack Developer with 1.5+ years of production experience building full-stack web applications with MongoDB, Express.js, React.js, and Node.js. Proficient in architecting RESTful services, implementing JWT authentication with refresh tokens, designing scalable MongoDB schemas, and developing reactive frontends with Next.js and Tailwind CSS.',
    skillsRows: [
      { label: 'MERN Core:', value: 'MongoDB, Express.js, React.js, Node.js, TypeScript, JavaScript (ES6+)' },
      { label: 'Frontend & UI:', value: 'Next.js (App Router), Tailwind CSS, Redux Toolkit, React Hook Form, HTML5, CSS3' },
      { label: 'Backend & APIs:', value: 'RESTful API Architecture, Mongoose ODM, NestJS, Middleware, Express Routing' },
      { label: 'Auth & Security:', value: 'JWT Authentication (HttpOnly cookies), Password Hashing (bcrypt), CORS, Role-Based Access' },
      { label: 'DevOps & Tooling:', value: 'Git, GitLab CI/CD, Vite, Postman, Vercel, npm/yarn, Lighthouse Performance' }
    ],
    feBullets: [
      "Developed full-stack MERN software modules for enterprise client platforms, writing modular React frontends and Node.js/Express API services.",
      "Designed and implemented 20+ REST API endpoints with Mongoose schema validation, error-handling middleware, and JWT authentication.",
      "Engineered MongoDB aggregation queries for data filtering, sorting, and reporting, reducing server-side payload sizes and response latency.",
      "Built responsive, accessible user interfaces in React.js and Next.js, adhering strictly to Figma design specifications.",
      "Reduced frontend bundle size by 40% using route-based code splitting and lazy loading; implemented client caching with Redux Toolkit."
    ],
    internBullets: [
      "Assisted in developing Node.js backend endpoints and connected Mongoose models for internal company productivity tools.",
      "Built responsive UI views in React.js with Tailwind CSS, ensuring clean cross-device rendering on mobile, tablet, and desktop.",
      "Followed standard Git/GitLab workflows including branch protection, merge request reviews, and continuous integration deployments."
    ],
    project1Bullets: [
      "Full-stack MERN contributor for B2B procurement platform; built reactive user interfaces and connected Node.js/MongoDB microservices.",
      "Created supplier onboarding forms with dynamic document uploads, field validation, and status tracking dashboards.",
      "Optimized catalog browsing with server-side pagination, index-backed search, and virtualized list rendering."
    ],
    project2Bullets: [
      "Engineered internal enterprise SaaS application for company payroll, leave tracking, and attendance records.",
      "Built secure authentication flow using JWT with HttpOnly cookies, refresh token rotation, and role-based permissions.",
      "Integrated Model Context Protocol (MCP) server for automated calendar and scheduling integrations."
    ],
    project3Bullets: [
      "Built complete full-stack ERP for education institute: student enrollment, fee records, attendance, and exam simulator.",
      "Structured MongoDB database with relational referencing across student, course, and exam performance collections.",
      "Integrated Gemini AI API for intelligent doubt resolution and automated query assistance with admin oversight."
    ]
  }
];

export function generateHtml(v: VariantConfig): string {
  const c = CANDIDATE;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${c.fullName} - Resume</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 7mm 11mm 7mm 11mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      font-size: 8.8pt;
      line-height: 1.28;
      color: #1e293b;
      background: #ffffff;
      -webkit-font-smoothing: antialiased;
    }
    
    /* Header */
    .header {
      text-align: center;
      padding-bottom: 4px;
      margin-bottom: 4px;
      border-bottom: 1.8px solid #0f172a;
    }
    .name {
      font-size: 18pt;
      font-weight: 800;
      letter-spacing: 0.8px;
      color: #0f172a;
      text-transform: uppercase;
      line-height: 1.05;
      margin-bottom: 2px;
    }
    .headline {
      font-size: 9.8pt;
      font-weight: 600;
      color: #2563eb;
      margin-bottom: 3px;
    }
    .contact-bar {
      font-size: 8.5pt;
      color: #475569;
      display: flex;
      justify-content: center;
      flex-wrap: wrap;
      gap: 5px;
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

    /* Section Headers */
    .section-header {
      font-size: 9.4pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.7px;
      color: #0f172a;
      border-bottom: 1px solid #cbd5e1;
      padding-bottom: 1.5px;
      margin-top: 5px;
      margin-bottom: 3px;
    }

    /* Summary */
    .summary-text {
      font-size: 8.6pt;
      color: #334155;
      line-height: 1.30;
      text-align: justify;
      margin-bottom: 2px;
    }

    /* Skills Table */
    .skills-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 8.6pt;
      margin-bottom: 2px;
    }
    .skills-table td {
      padding: 1px 0;
      vertical-align: top;
      line-height: 1.26;
    }
    .skill-cat {
      width: 21%;
      font-weight: 700;
      color: #0f172a;
      white-space: nowrap;
    }

    /* Experience & Projects */
    .job-block {
      margin-bottom: 3.5px;
    }
    .job-row-1 {
      display: flex;
      justify-content: space-between;
      font-size: 9.1pt;
      font-weight: 700;
      color: #0f172a;
    }
    .job-row-2 {
      display: flex;
      justify-content: space-between;
      font-size: 8.5pt;
      font-style: italic;
      color: #475569;
      margin-bottom: 1.5px;
    }
    .company-title {
      color: #1e40af;
      font-style: normal;
      font-weight: 600;
    }

    ul.bullet-list {
      margin-left: 14px;
      margin-top: 1px;
      margin-bottom: 1px;
    }
    ul.bullet-list li {
      font-size: 8.5pt;
      color: #334155;
      line-height: 1.26;
      margin-bottom: 1.2px;
    }

    /* Education */
    .edu-row-1 {
      display: flex;
      justify-content: space-between;
      font-size: 9pt;
      font-weight: 700;
      color: #0f172a;
    }
    .edu-row-2 {
      display: flex;
      justify-content: space-between;
      font-size: 8.5pt;
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
    ${v.skillsRows.map(r => `<tr><td class="skill-cat">${r.label}</td><td>${r.value}</td></tr>`).join('')}
  </table>

  <!-- EXPERIENCE -->
  <div class="section-header">Professional Experience</div>
  <div class="job-block">
    <div class="job-row-1">
      <span>${c.company}</span>
      <span>May 2025 – Present</span>
    </div>
    <div class="job-row-2">
      <span class="company-title">Frontend Engineer</span>
      <span>Indore, India</span>
    </div>
    <ul class="bullet-list">
      ${v.feBullets.map(b => `<li>${b}</li>`).join('')}
    </ul>
  </div>

  <div class="job-block">
    <div class="job-row-1">
      <span>${c.company}</span>
      <span>Feb 2025 – May 2025</span>
    </div>
    <div class="job-row-2">
      <span class="company-title">Frontend Developer Intern</span>
      <span>Indore, India</span>
    </div>
    <ul class="bullet-list">
      ${v.internBullets.map(b => `<li>${b}</li>`).join('')}
    </ul>
  </div>

  <!-- PROJECTS -->
  <div class="section-header">Key Production Projects</div>
  <div class="job-block">
    <div class="job-row-1">
      <span>Mercanis — B2B Procurement Platform</span>
      <span style="font-size: 8.2pt; font-weight: 500; color: #64748b;">Enterprise Client Project</span>
    </div>
    <div class="job-row-2">
      <span>Stack: SvelteKit · Next.js · TypeScript · NestJS · MongoDB</span>
      <span></span>
    </div>
    <ul class="bullet-list">
      ${v.project1Bullets.map(b => `<li>${b}</li>`).join('')}
    </ul>
  </div>

  <div class="job-block">
    <div class="job-row-1">
      <span>Payroll & HR Management Platform</span>
      <span style="font-size: 8.2pt; font-weight: 500; color: #64748b;">Internal Enterprise SaaS</span>
    </div>
    <div class="job-row-2">
      <span>Stack: Next.js · TypeScript · NestJS · MongoDB · MCP</span>
      <span></span>
    </div>
    <ul class="bullet-list">
      ${v.project2Bullets.map(b => `<li>${b}</li>`).join('')}
    </ul>
  </div>

  <div class="job-block">
    <div class="job-row-1">
      <span>EduMiracle — Coaching ERP Portal</span>
      <span style="font-size: 8.2pt; font-weight: 500; color: #64748b;">Full-Stack EdTech</span>
    </div>
    <div class="job-row-2">
      <span>Stack: Next.js · TypeScript · Tailwind CSS · MongoDB · Gemini AI</span>
      <span></span>
    </div>
    <ul class="bullet-list">
      ${v.project3Bullets.map(b => `<li>${b}</li>`).join('')}
    </ul>
  </div>

  <!-- EDUCATION -->
  <div class="section-header">Education</div>
  <div class="edu-row-1">
    <span>${c.education.degree}</span>
    <span>${c.education.year}</span>
  </div>
  <div class="edu-row-2">
    <span>${c.education.college}</span>
    <span style="font-weight: 600; color: #0f172a;">${c.education.grade}</span>
  </div>

</body>
</html>`;
}

export async function compileAllResumes() {
  const outputDirs = [
    path.resolve('data/canonical_resumes'),
    path.resolve('../profile-rank-engine/resumes'),
    path.resolve('../job-search-mcp-engine/resumes')
  ];

  for (const d of outputDirs) {
    fs.mkdirSync(d, { recursive: true });
  }

  const browser = await chromium.launch({ channel: 'chrome', headless: true });

  for (const variant of VARIANTS) {
    const html = generateHtml(variant);
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'load' });

    for (const dir of outputDirs) {
      const outUnderscore = path.join(dir, variant.fileNameUnderscore);
      await page.pdf({
        path: outUnderscore,
        format: 'A4',
        printBackground: true,
        margin: { top: '7mm', bottom: '7mm', left: '10mm', right: '10mm' }
      });

      const outHyphen = path.join(dir, variant.fileNameHyphen);
      fs.copyFileSync(outUnderscore, outHyphen);
      console.log(`✅ Saved: ${outUnderscore}`);
    }

    // If Frontend Engineer, copy as default resume.pdf in key engine repos
    if (variant.key === 'FE') {
      fs.copyFileSync(
        path.join(outputDirs[0], variant.fileNameUnderscore),
        path.resolve('data/resume.pdf')
      );
      fs.copyFileSync(
        path.join(outputDirs[0], variant.fileNameUnderscore),
        path.resolve('../hirist-auto-apply-engine/data/resume.pdf')
      );
      fs.copyFileSync(
        path.join(outputDirs[0], variant.fileNameUnderscore),
        path.resolve('../profile-rank-engine/resumes/Pratik_Patidar_Resume.pdf')
      );
      console.log('✅ Synchronized default resume.pdf across all engine repositories');
    }

    await page.close();
  }

  await browser.close();
  console.log('\n🎉 ALL 4 RESUME VARIANTS SUCCESSFULLY COMPILED & DISTRIBUTED!');
}

if (process.argv[1] && process.argv[1].includes('generate_4_resumes')) {
  compileAllResumes().catch(err => {
    console.error('Fatal compilation error:', err);
    process.exit(1);
  });
}
