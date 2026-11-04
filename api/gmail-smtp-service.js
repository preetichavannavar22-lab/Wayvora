/**
 * WAYVORA - Gmail SMTP Email Integration Service (Nodemailer)
 * 
 * Provides secure server-side email dispatching via Gmail SMTP using a Google App Password.
 * Sender Email: wayvora.admin@gmail.com
 * Never exposes credentials to frontend JavaScript.
 */

const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

/**
 * Lightweight local environment file loader (.env / .env.local)
 */
function loadEnvFile(envPath) {
  if (!fs.existsSync(envPath)) return;
  try {
    const content = fs.readFileSync(envPath, 'utf8');
    for (const line of content.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx <= 0) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      let val = trimmed.slice(eqIdx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (process.env[key] === undefined) {
        process.env[key] = val;
      }
    }
  } catch (e) {
    // Non-fatal
  }
}

loadEnvFile(path.join(__dirname, '..', '.env'));
loadEnvFile(path.join(__dirname, '..', '.env.local'));

/**
 * Retrieves environment secrets and configurations for Gmail SMTP
 */
function getConfig() {
  const user = (process.env.GMAIL_USER || process.env.ADMIN_GMAIL || 'wayvora.admin@gmail.com').trim();
  const pass = (process.env.GMAIL_APP_PASSWORD || '').replace(/\s+/g, '').trim();

  return {
    user,
    pass,
    fromEmail: `WAYVORA Support <${user}>`,
    adminEmail: user,
    isConfigured: !!(user && pass && pass.length >= 16)
  };
}

/**
 * Creates and returns a Nodemailer transporter configured for Gmail SMTP
 */
function createTransporter() {
  const config = getConfig();
  if (!config.isConfigured) {
    return null;
  }

  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // Port 465 SSL
    auth: {
      user: config.user,
      pass: config.pass
    },
    // Pool settings for efficiency
    pool: false,
    maxConnections: 3,
    maxMessages: 100
  });
}

/**
 * Verifies Gmail SMTP connection and credentials
 * 
 * @returns {Promise<{isConnected: boolean, error?: string, connectedEmail: string, provider: string}>}
 */
async function verifySmtpConnection() {
  const config = getConfig();
  if (!config.isConfigured) {
    return {
      isConnected: false,
      isConfigured: false,
      connectedEmail: config.user,
      provider: 'gmail_smtp',
      error: 'GMAIL_APP_PASSWORD is not configured in environment variables (requires 16-character Gmail App Password).'
    };
  }

  const transporter = createTransporter();
  if (!transporter) {
    return {
      isConnected: false,
      isConfigured: false,
      connectedEmail: config.user,
      provider: 'gmail_smtp',
      error: 'Could not initialize Nodemailer transporter.'
    };
  }

  try {
    await transporter.verify();
    return {
      isConnected: true,
      isConfigured: true,
      connectedEmail: config.user,
      provider: 'gmail_smtp',
      method: 'smtp'
    };
  } catch (err) {
    let friendlyError = err.message || 'SMTP connection verification failed.';
    if (err.code === 'EAUTH') {
      friendlyError = 'Gmail SMTP authentication failed. Please verify that your GMAIL_USER and 16-character GMAIL_APP_PASSWORD are valid.';
    }
    return {
      isConnected: false,
      isConfigured: true,
      connectedEmail: config.user,
      provider: 'gmail_smtp',
      error: friendlyError,
      code: err.code
    };
  }
}

/**
 * Escapes HTML entities to ensure safe rendering in email templates
 */
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Sends an email via Gmail SMTP using Nodemailer
 * 
 * @param {object} options
 * @param {string|string[]} options.to
 * @param {string} options.subject
 * @param {string} options.html
 * @param {string} [options.text]
 * @param {string} [options.replyTo]
 * @param {string} [options.from]
 * @returns {Promise<{success: boolean, verified: boolean, id?: string, error?: string, recipient?: string}>}
 */
async function sendEmailWithSmtp(options) {
  const { to, subject, html, text, replyTo, from } = options;
  const config = getConfig();

  if (!config.isConfigured) {
    const errorMsg = 'GMAIL_APP_PASSWORD is not configured in server environment variables. Please configure GMAIL_USER and GMAIL_APP_PASSWORD.';
    console.warn(`[GmailSmtpService] Delivery skipped: ${errorMsg}`);
    return {
      success: false,
      verified: false,
      error: errorMsg,
      notConfigured: true
    };
  }

  const transporter = createTransporter();
  if (!transporter) {
    return {
      success: false,
      verified: false,
      error: 'Failed to create Nodemailer SMTP transporter.'
    };
  }

  const sender = from || config.fromEmail;
  const recipient = Array.isArray(to) ? to.join(', ') : to;

  const mailOptions = {
    from: sender,
    to: recipient,
    subject: subject,
    html: html,
    text: text,
    replyTo: replyTo || config.adminEmail
  };

  try {
    const info = await transporter.sendMail(mailOptions);

    // Verify Gmail SMTP acceptance
    const isAccepted = Array.isArray(info.accepted) && info.accepted.length > 0;
    if (isAccepted && info.messageId) {
      console.log(`[GmailSmtpService] Email successfully dispatched via Gmail SMTP! Message ID: ${info.messageId} -> Recipient: ${recipient}`);
      return {
        success: true,
        verified: true,
        id: info.messageId,
        recipient: recipient,
        sender: config.user,
        provider: 'gmail_smtp',
        response: info.response,
        timestamp: new Date().toISOString()
      };
    }

    const rejectionMsg = (Array.isArray(info.rejected) && info.rejected.length > 0)
      ? `Recipient rejected by Gmail SMTP: ${info.rejected.join(', ')}`
      : 'Gmail SMTP did not confirm acceptance of the email.';

    console.warn(`[GmailSmtpService] Delivery unconfirmed: ${rejectionMsg}`);
    return {
      success: false,
      verified: false,
      error: rejectionMsg,
      provider: 'gmail_smtp',
      recipient: recipient
    };

  } catch (err) {
    console.error('[GmailSmtpService] SMTP Send Error:', err);
    let friendlyError = err.message || 'Error sending email via Gmail SMTP.';
    if (err.code === 'EAUTH') {
      friendlyError = 'Gmail SMTP authentication failed. Please verify that your GMAIL_USER and 16-character GMAIL_APP_PASSWORD are valid.';
    } else if (err.code === 'EENVELOPE') {
      friendlyError = `Invalid recipient address: ${recipient}`;
    }

    return {
      success: false,
      verified: false,
      error: friendlyError,
      code: err.code,
      provider: 'gmail_smtp',
      recipient: recipient,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Sends official administrator reply to customer via Gmail SMTP
 * 
 * @param {object} params
 * @param {string} params.ticketId
 * @param {string} params.travelerName
 * @param {string} params.travelerEmail - Registered email address from Firebase Auth
 * @param {string} params.adminReply
 * @param {string} [params.originalMessage]
 * @param {string} [params.category]
 * @param {string} [params.status]
 * @returns {Promise<{success: boolean, verified: boolean, id?: string, error?: string, recipient: string}>}
 */
async function sendAdminReplyWithSmtp({
  ticketId,
  travelerName,
  travelerEmail,
  adminReply,
  originalMessage = '',
  category = 'General Support',
  status = 'in_progress'
}) {
  if (process.env.SUPPORT_REPLY_KILL_SWITCH === 'true') {
    console.warn('[GmailSmtpService] KILL-SWITCH ACTIVE: sendAdminReplyWithSmtp suppressed.');
    return {
      success: false,
      error: 'Outgoing support replies are disabled via server-side kill switch (SUPPORT_REPLY_KILL_SWITCH=true).',
      killSwitchActive: true
    };
  }

  const config = getConfig();
  const safeName = escapeHtml(travelerName || 'Traveler');
  const safeCategory = escapeHtml(category || 'General Support');
  const safeReply = escapeHtml(adminReply || '').replace(/\n/g, '<br/>');
  const safeOriginal = escapeHtml(originalMessage || '').replace(/\n/g, '<br/>');
  const shortId = (ticketId || 'TICKET').slice(0, 8).toUpperCase();
  const statusLabel = status.replace('_', ' ').toUpperCase();

  const subject = `[WAYVORA Update] Response to Ticket #${shortId}: ${safeCategory}`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>WAYVORA Official Support Response</title>
  <style>
    body { margin: 0; padding: 0; background-color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #334155; }
    .email-container { max-width: 600px; margin: 30px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15); }
    .email-header { background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 30px; text-align: center; border-bottom: 3px solid #38bdf8; }
    .brand-title { color: #ffffff; font-size: 24px; font-weight: 800; letter-spacing: 2px; margin: 0; }
    .brand-subtitle { color: #94a3b8; font-size: 13px; margin-top: 4px; }
    .email-body { padding: 32px 30px; }
    .greeting { font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 12px; }
    .status-badge { display: inline-block; background: #e0f2fe; color: #0284c7; padding: 4px 10px; border-radius: 9999px; font-size: 12px; font-weight: 700; margin-bottom: 16px; }
    .reply-card { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 20px; margin-bottom: 24px; }
    .reply-title { font-size: 14px; font-weight: 700; color: #166534; margin-bottom: 10px; display: flex; align-items: center; }
    .reply-content { font-size: 15px; line-height: 1.6; color: #14532d; }
    .original-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 24px; font-size: 13px; color: #64748b; }
    .email-footer { background: #f1f5f9; padding: 20px 30px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="email-header">
      <div class="brand-title">WAYVORA</div>
      <div class="brand-subtitle">Official Customer Support Concierge</div>
    </div>
    <div class="email-body">
      <div class="greeting">Hello ${safeName},</div>
      <span class="status-badge">Ticket Status: ${statusLabel}</span>

      <p style="font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 20px;">
        An official representative from the <strong>WAYVORA Customer Support Team</strong> has reviewed your inquiry (<strong>#${shortId}</strong>) and provided the following response:
      </p>

      <div class="reply-card">
        <div class="reply-title">💬 Official Response from WAYVORA:</div>
        <div class="reply-content">
          ${safeReply}
        </div>
      </div>

      ${originalMessage ? `
      <div class="original-card">
        <strong style="color: #475569; display: block; margin-bottom: 6px;">Your Original Inquiry:</strong>
        ${safeOriginal}
      </div>
      ` : ''}

      <p style="font-size: 14px; color: #475569; line-height: 1.6;">
        Have additional questions or need further assistance? Simply <strong>reply directly to this email</strong>, and your message will be routed directly to our support desk.
      </p>

      <p style="font-size: 14px; color: #475569; margin-top: 24px;">
        Best regards,<br>
        <strong>WAYVORA Support Team</strong><br>
        <span style="font-size: 12px; color: #94a3b8;">${escapeHtml(config.user)}</span>
      </p>
    </div>
    <div class="email-footer">
      WAYVORA • Intelligent Travel Platform &amp; Global Support Desk<br>
      Ticket #${shortId} • Direct Email: <a href="mailto:${escapeHtml(config.user)}" style="color: #0284c7;">${escapeHtml(config.user)}</a>
    </div>
  </div>
</body>
</html>
  `.trim();

  const text = `
WAYVORA Official Support Response
Ticket: #${shortId}
Status: ${statusLabel}

Hello ${travelerName || 'Traveler'},

An official representative from WAYVORA Support has reviewed and answered your inquiry:

Response:
${adminReply}

${originalMessage ? `Your Original Inquiry:\n"${originalMessage}"\n` : ''}
If you have any further questions, you can reply directly to this email.

Best regards,
WAYVORA Support Team
${config.user}
  `.trim();

  return await sendEmailWithSmtp({
    to: travelerEmail,
    subject: subject,
    html: html,
    text: text,
    replyTo: config.user,
    from: `WAYVORA Support <${config.user}>`
  });
}

/**
 * Sends a verification test email via Gmail SMTP
 */
async function sendTestEmailWithSmtp({ to }) {
  const config = getConfig();
  const targetEmail = to || config.user;

  const subject = 'WAYVORA - Gmail SMTP Verification Test';
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 550px; margin: auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 10px;">
      <div style="background: #0f172a; padding: 18px 20px; border-radius: 8px 8px 0 0; text-align: center;">
        <h2 style="color: #ffffff; margin: 0; font-size: 20px; letter-spacing: 1px;">WAYVORA GMAIL SMTP TEST</h2>
      </div>
      <div style="padding: 20px 0;">
        <p style="font-size: 15px; color: #1e293b;">Hello Administrator,</p>
        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 15px; border-radius: 6px; margin: 15px 0;">
          <strong style="color: #166534;">✓ Gmail SMTP Connection Verified!</strong>
          <p style="margin: 6px 0 0 0; color: #14532d; font-size: 13px;">This email confirms that WAYVORA has securely established an authenticated Gmail SMTP connection via Nodemailer using <strong>${escapeHtml(config.user)}</strong>.</p>
        </div>
        <p style="font-size: 13px; color: #64748b;">Support ticket replies sent from the WAYVORA Admin Dashboard will be delivered directly to travelers' registered email addresses from <strong>${escapeHtml(config.user)}</strong>.</p>
      </div>
      <div style="border-top: 1px solid #e2e8f0; padding-top: 15px; font-size: 12px; color: #94a3b8; text-align: center;">
        Dispatched at ${new Date().toUTCString()} via Gmail SMTP (Nodemailer)
      </div>
    </div>
  `;
  const text = `WAYVORA Gmail SMTP Test\n\nGmail SMTP Connection Verified!\nDispatched from ${config.user} via Nodemailer.`;

  return await sendEmailWithSmtp({
    to: targetEmail,
    subject: subject,
    html: html,
    text: text,
    replyTo: config.user,
    from: `WAYVORA Support <${config.user}>`
  });
}

function getAdminEmail() {
  return getConfig().user;
}

module.exports = {
  getConfig,
  getAdminEmail,
  createTransporter,
  verifySmtpConnection,
  sendEmailWithSmtp,
  sendAdminReplyWithSmtp,
  sendTestEmailWithSmtp,
  escapeHtml
};
