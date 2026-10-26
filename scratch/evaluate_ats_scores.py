import pypdf
import re
import json

COMMON_JDS = {
  "Frontend Engineer": {
    "role": "Frontend Engineer / Senior Frontend Engineer",
    "required_skills": [
      "react", "next.js", "typescript", "javascript", "html5", "css3", "tailwind css",
      "redux toolkit", "context api", "react hook form", "zod", "rest api", "axios",
      "performance", "code splitting", "lazy loading", "lighthouse", "responsive",
      "git", "gitlab", "vite", "webpack", "agile", "cross-browser", "ui/ux", "figma"
    ]
  },
  "React Developer": {
    "role": "React Developer / React.js Engineer",
    "required_skills": [
      "react.js", "react", "next.js", "redux toolkit", "typescript", "javascript",
      "hooks", "custom hooks", "context api", "tailwind css", "rest api", "axios",
      "virtual dom", "component lifecycle", "zod", "react hook form", "vite",
      "responsive", "git", "github", "performance", "code splitting", "agile"
    ]
  },
  "Full Stack Developer": {
    "role": "Full Stack Developer (React / Node / Mongo)",
    "required_skills": [
      "react.js", "next.js", "node.js", "nestjs", "express.js", "mongodb", "mongoose",
      "typescript", "javascript", "rest api", "jwt", "authentication", "tailwind css",
      "redux toolkit", "zod", "aggregation", "indexing", "git", "postman", "vite", "agile"
    ]
  },
  "MERN Stack Developer": {
    "role": "MERN Stack Developer (MongoDB, Express, React, Node)",
    "required_skills": [
      "mongodb", "express.js", "react.js", "node.js", "typescript", "javascript",
      "mongoose", "rest api", "jwt", "authentication", "middleware", "tailwind css",
      "redux toolkit", "crud", "aggregation", "git", "postman", "vite", "agile"
    ]
  }
}

ACTION_VERBS = [
  "developed", "engineered", "built", "implemented", "architected", "configured",
  "structured", "integrated", "improved", "designed", "collaborated", "tested",
  "participated", "eliminated", "added", "optimized", "constructed"
]

def evaluate_resume(pdf_path, jd_key):
  jd_info = COMMON_JDS[jd_key]
  reader = pypdf.PdfReader(pdf_path)
  page_count = len(reader.pages)
  
  text = ""
  for page in reader.pages:
    text += page.extract_text() or ""
    
  text_lower = text.lower()
  
  # 1. Structure & Parsability (Max 25 pts)
  structure_score = 0
  checks = {
    "Single Page": page_count == 1,
    "Summary Present": "summary" in text_lower,
    "Skills Section": "skills" in text_lower,
    "Experience Section": "experience" in text_lower,
    "Projects Section": "project" in text_lower or "projects" in text_lower,
    "Education Section": "education" in text_lower,
    "Contact Info (Email/Phone)": bool(re.search(r'[\w\.-]+@[\w\.-]+', text)) and bool(re.search(r'\+?\d{10,}', text)),
    "Links Detected": ("linkedin" in text_lower) and ("github" in text_lower)
  }
  structure_passed = sum(1 for v in checks.values() if v)
  structure_score = round((structure_passed / len(checks)) * 25, 1)

  # 2. Keyword & Hard Skill Match (Max 35 pts)
  req_skills = jd_info["required_skills"]
  matched_skills = []
  missing_skills = []
  for s in req_skills:
    # word boundary match
    pattern = r'\b' + re.escape(s) + r'\b'
    if re.search(pattern, text_lower) or s in text_lower:
      matched_skills.append(s)
    else:
      missing_skills.append(s)
      
  skill_match_rate = len(matched_skills) / len(req_skills)
  keyword_score = round(skill_match_rate * 35, 1)

  # 3. Action Verb & Engineering Quality (Max 20 pts)
  verb_matches = [v for v in ACTION_VERBS if v in text_lower]
  verb_score = min(20.0, round((len(verb_matches) / 10) * 20, 1))

  # 4. ATS Layout & Readability Hygiene (Max 20 pts)
  # Standard single-column flow, zero scanned OCR errors, clean text length (400-800 words)
  word_count = len(text.split())
  hygiene_score = 20.0
  if word_count < 350 or word_count > 900:
    hygiene_score -= 3.0
  if page_count > 1:
    hygiene_score -= 10.0

  total_score = round(structure_score + keyword_score + verb_score + hygiene_score, 1)

  return {
    "variant": jd_key,
    "pdf": pdf_path.split("/")[-1].split("\\")[-1],
    "page_count": page_count,
    "word_count": word_count,
    "total_ats_score": total_score,
    "breakdown": {
      "format_parsability": f"{structure_score} / 25",
      "keyword_skill_match": f"{keyword_score} / 35 ({round(skill_match_rate*100)}%)",
      "action_verb_strength": f"{verb_score} / 20",
      "layout_hygiene": f"{hygiene_score} / 20"
    },
    "matched_keywords": matched_skills,
    "missing_keywords": missing_skills
  }

resumes = [
  ("C:/mcp/job-search-mcp-engine/resumes/Pratik_Patidar_Resume_Frontend_Engineer.pdf", "Frontend Engineer"),
  ("C:/mcp/job-search-mcp-engine/resumes/Pratik_Patidar_Resume_React_Developer.pdf", "React Developer"),
  ("C:/mcp/job-search-mcp-engine/resumes/Pratik_Patidar_Resume_Full_Stack_Developer.pdf", "Full Stack Developer"),
  ("C:/mcp/job-search-mcp-engine/resumes/Pratik_Patidar_Resume_MERN_Stack_Developer.pdf", "MERN Stack Developer")
]

results = []
for p, k in resumes:
  res = evaluate_resume(p, k)
  results.append(res)

print(json.dumps(results, indent=2))
