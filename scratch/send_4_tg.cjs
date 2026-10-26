const fs = require('fs');
const path = require('path');

const BOT_TOKEN = '8886749244:AAFr2fKujeYXXieaOFsDlyf4OVDCHjqj-to';
const CHAT_ID = '5704543454';

const resumes = [
  { name: 'Pratik_Patidar_Resume_React_Developer.pdf', caption: '✅ React Developer (96% Coverage, Symmetrical 10mm Margin, 0 Void)' },
  { name: 'Pratik_Patidar_Resume_Frontend_Engineer.pdf', caption: '✅ Frontend Engineer (96% Coverage, Symmetrical 10mm Margin, 0 Void)' },
  { name: 'Pratik_Patidar_Resume_Full_Stack_Developer.pdf', caption: '✅ Full Stack Developer (96% Coverage, Symmetrical 10mm Margin, 0 Void)' },
  { name: 'Pratik_Patidar_Resume_MERN_Stack_Developer.pdf', caption: '✅ MERN Stack Developer (97% Coverage, Symmetrical 10mm Margin, 0 Void)' }
];

async function sendTelegramDoc(filePath, caption) {
  const form = new FormData();
  form.append('chat_id', CHAT_ID);
  form.append('caption', caption);
  const buffer = fs.readFileSync(filePath);
  const blob = new Blob([buffer], { type: 'application/pdf' });
  form.append('document', blob, path.basename(filePath));

  const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendDocument`, {
    method: 'POST',
    body: form
  });
  const data = await res.json();
  console.log(`Telegram sent: ${path.basename(filePath)} -> ok=${data.ok}`);
}

(async () => {
  for (const r of resumes) {
    const fullPath = path.join('C:/mcp/job-search-mcp-engine/resumes', r.name);
    await sendTelegramDoc(fullPath, r.caption);
  }
})();
