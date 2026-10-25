# Universal Career Apply Engine

Standalone, reusable auto-apply engine for company career pages and ATS portals (Greenhouse, Lever, Zoho, BambooHR, and custom company career sites).

## Architecture

- **CLI Mode**: Apply directly to any career page URL
  ```bash
  npm run apply:url -- --url <career_url> --company <company_name>
  ```

- **Shared Queue Worker Mode**: Consumes leads discovered by any job portal scraper (Naukri, Hirist, Wellfound, LinkedIn) from `C:\mcp\shared-data\leads_queue.db`
  ```bash
  npm run worker:queue
  ```

## Features

- **2-Step Career Page Automation**: Automatically detects and triggers "Apply Now" / "Apply" action buttons to reveal hidden forms.
- **Embedded ATS Frame Traversal**: Operates inside embedded Zoho, Greenhouse, Lever, and SmartRecruiters iframes.
- **Intelligent Form Autofill**: Populates Candidate Name, Email, Phone, Experience, Company, CTC, and Notice Period.
- **Resume Attachment**: Automatically uploads `data/resume.pdf` to detected file inputs.
- **DOM Confirmation & Screenshot Proof**: Captures submission verification screenshots into `screenshots/`.
