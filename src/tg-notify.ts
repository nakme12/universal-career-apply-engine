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
  type?: 'WEB_FORM' | 'EMAIL_DISPATCH';
  recipientEmail?: string;
  screenshotPath?: string;
}): Promise<boolean> {
  const istTime = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' });

  let text = '';
  if (params.type === 'EMAIL_DISPATCH') {
    text = `📨 *Direct HR Application Dispatched!*
━━━━━━━━━━━━━━━━━━━━━━
🏢 *Company:* ${params.company}
💼 *Job Title:* ${params.jobTitle}
📧 *Recipient HR:* \`${params.recipientEmail}\`
📊 *ATS Match Score:* \`${params.atsScore || 85}/100\`
📎 *Attached Resume:* \`${params.resumeUsed || 'Pratik_Patidar_Resume.pdf'}\`
🕒 *Timestamp:* \`${istTime} IST\`
${params.jobUrl ? `🔗 *Source JD:* [View Job](${params.jobUrl})` : ''}
━━━━━━━━━━━━━━━━━━━━━━`;
  } else {
    text = `🎯 *Universal Career Job Applied!*
━━━━━━━━━━━━━━━━━━━━━━
🏢 *Company:* ${params.company}
💼 *Job Title:* ${params.jobTitle}
🌐 *Source / Portal:* ${params.platform}
📊 *ATS Match Score:* \`${params.atsScore || 85}/100\`
📎 *Attached Resume:* \`${params.resumeUsed || 'Pratik_Patidar_Resume.pdf'}\`
🕒 *Applied At:* \`${istTime} IST\`
${params.jobUrl ? `🔗 *Portal URL:* [View Career Page](${params.jobUrl})` : ''}
━━━━━━━━━━━━━━━━━━━━━━`;
  }

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
      const data = await res.json();
      if (data.ok) {
        console.log(`   📱 Telegram photo alert with proof sent for ${params.company}!`);
        return true;
      }
    } catch (photoErr: any) {
      console.log(`   Notice on sendPhoto: ${photoErr.message}, falling back to sendMessage...`);
    }
  }

  const payload = JSON.stringify({
    chat_id: CHAT_ID,
    text,
    parse_mode: 'Markdown',
    disable_web_page_preview: true
  });

  return new Promise((resolve) => {
    const req = https.request(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload)
        }
      },
      (res) => {
        if (res.statusCode === 200) {
          console.log(`   📱 Telegram text alert sent for ${params.company}!`);
          resolve(true);
        } else {
          console.log(`   ⚠️ Telegram response code: ${res.statusCode}`);
          resolve(false);
        }
      }
    );

    req.on('error', (err) => {
      console.log(`   ⚠️ Telegram network error: ${err.message}`);
      resolve(false);
    });

    req.write(payload);
    req.end();
  });
}

export async function sendLoginRequiredNotification(portal: string, queuedCount: number): Promise<boolean> {
  const istTime = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' });

  const text = `⚠️ *[${portal}] Login Required / Session Saved*
━━━━━━━━━━━━━━━━━━━━━━
🏢 *Portal:* ${portal}
📋 *Jobs Saved in Queue:* \`${queuedCount}\`
🕒 *Time:* \`${istTime} IST\`
💡 *Note:* Active session not found or expired. All matching jobs are securely queued in database. As soon as login is available, they will be auto-applied.
━━━━━━━━━━━━━━━━━━━━━━`;

  const payload = JSON.stringify({
    chat_id: CHAT_ID,
    text,
    parse_mode: 'Markdown',
    disable_web_page_preview: true
  });

  return new Promise((resolve) => {
    const req = https.request(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload)
        }
      },
      (res) => {
        resolve(res.statusCode === 200);
      }
    );
    req.on('error', () => resolve(false));
    req.write(payload);
    req.end();
  });
}
