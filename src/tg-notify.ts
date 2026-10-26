import https from 'node:https';
import fs from 'node:fs';

const BOT_TOKEN = '8886749244:AAFr2fKujeYXXieaOFsDlyf4OVDCHjqj-to';
const CHAT_ID = '5704543454';

export async function sendJobAppliedNotification(params: {
  platform: string;
  jobTitle: string;
  company: string;
  location?: string;
  experience?: string;
  jobUrl?: string;
  atsScore?: number;
  resumeUsed?: string;
  type?: 'WEB_FORM';
  screenshotPath?: string;
}): Promise<boolean> {
  const istTime = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' });

  const text = `🎯 *Verified Career Job Applied!*
━━━━━━━━━━━━━━━━━━━━━━
🏢 *Company:* ${params.company}
💼 *Job Title:* ${params.jobTitle}
🌐 *Source / Portal:* ${params.platform}
📊 *ATS Match Score:* \`${params.atsScore || 85}/100\`
📎 *Attached Resume:* \`${params.resumeUsed || 'Pratik_Patidar_Resume.pdf'}\`
🕒 *Applied At:* \`${istTime} IST\`
${params.jobUrl ? `🔗 *Portal URL:* [View Career Page](${params.jobUrl})` : ''}
━━━━━━━━━━━━━━━━━━━━━━`;

  // If a screenshot proof exists, send as photo with post caption!
  if (params.screenshotPath && fs.existsSync(params.screenshotPath)) {
    try {
      const fileBlob = await fs.openAsBlob(params.screenshotPath);
      const formData = new FormData();
      formData.append('chat_id', CHAT_ID);
      formData.append('caption', text);
      formData.append('parse_mode', 'Markdown');
      formData.append('photo', fileBlob, 'proof.png');

      const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, {
        method: 'POST',
        body: formData
      });

      const json: any = await res.json().catch(() => null);
      if (json && json.ok) {
        console.log(`📸 Telegram Photo Notification dispatched: Message ID #${json.result.message_id}`);
        return true;
      }
    } catch (e: any) {
      console.log(`⚠️ Failed to send photo: ${e.message}, falling back to text`);
    }
  }

  // Fallback text-only notification
  return new Promise<boolean>((resolve) => {
    const postData = JSON.stringify({
      chat_id: CHAT_ID,
      text: text,
      parse_mode: 'Markdown',
      disable_web_page_preview: true
    });

    const options = {
      hostname: 'api.telegram.org',
      port: 443,
      path: `/bot${BOT_TOKEN}/sendMessage`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.ok) {
            console.log(`📱 Telegram Text Notification dispatched: Message ID #${json.result.message_id}`);
            resolve(true);
          } else {
            console.error(`Telegram API Error: ${json.description}`);
            resolve(false);
          }
        } catch {
          resolve(false);
        }
      });
    });

    req.on('error', (err) => {
      console.error(`Telegram Network Error: ${err.message}`);
      resolve(false);
    });

    req.write(postData);
    req.end();
  });
}
