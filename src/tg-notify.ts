import https from 'node:https';

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
          console.log(`   📱 Telegram notification sent for ${params.company}!`);
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
