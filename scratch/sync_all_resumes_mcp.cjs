const fs = require('fs');
const path = require('path');

const CANONICAL_SRC_DIR = 'C:\\mcp\\universal-career-apply-engine\\data\\canonical_resumes';
const DEFAULT_RESUME_SRC = path.join(CANONICAL_SRC_DIR, 'Pratik_Patidar_Resume_Frontend_Engineer.pdf');

const CANONICAL_NAMES = [
  'Pratik_Patidar_Resume_Frontend_Engineer.pdf',
  'Pratik_Patidar_Resume_Full_Stack_Developer.pdf',
  'Pratik_Patidar_Resume_React_Developer.pdf',
  'Pratik_Patidar_Resume_MERN_Stack_Developer.pdf'
];

// Target directories for the 4 canonical resumes
const MULTI_RESUME_DIRS = [
  'C:\\mcp\\job-search-mcp-engine\\resumes',
  'C:\\mcp\\profile-rank-engine\\resumes',
  'C:\\mcp\\naukri-auto-apply-engine\\data\\resumes',
  'C:\\mcp\\shared-data\\resumes'
];

// Target destinations for the canonical default resume.pdf
const SINGLE_RESUME_FILES = [
  'C:\\mcp\\universal-career-apply-engine\\data\\resume.pdf',
  'C:\\mcp\\hirist-auto-apply-engine\\data\\resume.pdf',
  'C:\\mcp\\instahyre-auto-apply-engine\\data\\resume.pdf',
  'C:\\mcp\\wellfound-auto-apply-engine\\data\\resume.pdf',
  'C:\\mcp\\naukri-auto-apply-engine\\data\\resume.pdf',
  'C:\\mcp\\shared-data\\resume.pdf',
  'C:\\mcp\\profile-rank-engine\\resumes\\Pratik_Patidar_Resume.pdf'
];

console.log('=== STEP 1: Verifying Canonical Sources ===');
for (const name of CANONICAL_NAMES) {
  const src = path.join(CANONICAL_SRC_DIR, name);
  if (!fs.existsSync(src)) {
    throw new Error(`Canonical resume missing: ${src}`);
  }
  const stat = fs.statSync(src);
  console.log(`  Source: ${name} (${stat.size} bytes)`);
}

console.log('\n=== STEP 2: Updating Default resume.pdf Across All Engines ===');
for (const dest of SINGLE_RESUME_FILES) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(DEFAULT_RESUME_SRC, dest);
  console.log(`  Updated: ${dest}`);
}

console.log('\n=== STEP 3: Cleaning & Syncing 4 Resumes in Multi-Resume Dirs ===');
for (const dir of MULTI_RESUME_DIRS) {
  fs.mkdirSync(dir, { recursive: true });

  // 1. Remove all old/extraneous pdf files
  const existing = fs.readdirSync(dir);
  for (const f of existing) {
    if (f.endsWith('.pdf')) {
      // In profile-rank-engine, Pratik_Patidar_Resume.pdf is allowed
      if (dir.includes('profile-rank-engine') && f === 'Pratik_Patidar_Resume.pdf') {
        continue;
      }
      if (!CANONICAL_NAMES.includes(f)) {
        const toDelete = path.join(dir, f);
        fs.unlinkSync(toDelete);
        console.log(`  Deleted old/stale file: ${toDelete}`);
      }
    }
  }

  // 2. Copy the 4 updated canonical files
  for (const name of CANONICAL_NAMES) {
    const src = path.join(CANONICAL_SRC_DIR, name);
    const dest = path.join(dir, name);
    fs.copyFileSync(src, dest);
    console.log(`  Synced: ${dest}`);
  }
}

console.log('\n=== STEP 4: Cleaning Tailored Resumes Cache in universal-career ===');
const tailoredDir = 'C:\\mcp\\universal-career-apply-engine\\data\\tailored_resumes';
if (fs.existsSync(tailoredDir)) {
  const oldTailored = fs.readdirSync(tailoredDir);
  for (const f of oldTailored) {
    if (f.endsWith('.pdf')) {
      fs.unlinkSync(path.join(tailoredDir, f));
      console.log(`  Purged stale tailored resume: ${f}`);
    }
  }
}

console.log('\n=== STEP 5: Scratch Artifacts Cleanup ===');
const scratchDir = 'C:\\mcp\\universal-career-apply-engine\\scratch';
if (fs.existsSync(scratchDir)) {
  const scratchFiles = fs.readdirSync(scratchDir);
  for (const f of scratchFiles) {
    if (f.endsWith('.pdf') && (f.startsWith('test_') || f.startsWith('Pratik_'))) {
      fs.unlinkSync(path.join(scratchDir, f));
    }
  }
}

console.log('\n🎉 ALL RESUMES UPDATED & OBSOLETE FILES PURGED ACROSS C:\\mcp!');
