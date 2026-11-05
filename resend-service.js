/**
 * WAYVORA - Resend Support Email Service
 * 
 * Provides secure server-side email dispatching via the Resend API.
 * Never expose RESEND_API_KEY to frontend JavaScript.
 */

const fs = require('fs');
const path = require('path');
const { Resend } = require('resend');

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
 * Retrieves environment secrets and configurations
 */
function getConfig() {
  const apiKey = (process.env.RESEND_API_KEY || '').trim();
  const fromEmail = (process.env.RESEND_FROM_EMAIL || 'WAYVORA Support <onboarding@resend.dev>').trim();
  const adminEmail = (process.env.ADMIN_EMAIL || 'wayvora.admin@gmail.com').trim();
  const testEmail = (process.env.RESEND_TEST_EMAIL || '').trim();

  return {
    apiKey,
    fromEmail,
    adminEmail,
    testEmail,
    isConfigured: !!(apiKey && apiKey.startsWith('re_'))
  };
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
 * Formats a clean ISO or Date timestamp for email display
 */
function formatEmailDate(date) {
  try {
    const d = date ? new Date(date) : new Date();
    return d.toUTCString();
  } catch (e) {
    return new Date().toUTCString();
  }
}

/**
 * Sends a single email via the Resend API
 * 
 * @param {object} options
 * @param {string|string[]} options.to
 * @param {string} options.subject
 * @param {string} options.html
 * @param {string} [options.text]
 * @param {string} [options.replyTo]
 * @param {string} [options.from]
 * @returns {Promise<{success: boolean, id?: string, error?: string, isSandboxRestriction?: boolean}>}
 */
async function sendEmail(options) {
  const { to, subject, html, text, replyTo, from, _isRetry } = options;
  const config = getConfig();

  if (!config.isConfigured) {
    const msg = 'RESEND_API_KEY is not configured in server environment secrets.';
    console.warn(`[ResendService] Delivery skipped: ${msg}`);
    return {
      success: false,
      error: msg,
      notConfigured: true
    };
  }

  const sender = from || config.fromEmail;
  const resend = new Resend(config.apiKey);

  const payload = {
    from: sender,
    to: Array.isArray(to) ? to : [to],
    subject: subject,
    html: html
  };

  if (text) {
    payload.text = text;
  }

  if (replyTo) {
    payload.reply_to = replyTo;
  }

  try {
    const response = await resend.emails.send(payload);

    if (response.error) {
      const err = response.error;
      const errMsg = err.message || 'Resend API error';
      const isSandbox = (
        err.statusCode === 403 ||
        err.statusCode === 422 ||
        (errMsg && (
          errMsg.includes('only send testing emails') ||
          errMsg.includes('resend.com/domains') ||
          errMsg.includes('testing email address') ||
          errMsg.includes('verify a domain')
        ))
      );

      console.error('[ResendService] API Error:', {
        statusCode: err.statusCode,
        name: err.name,
        message: errMsg,
        isSandboxRestriction: isSandbox,
        recipient: to
      });

      const humanError = isSandbox
        ? `Resend sandbox mode restriction: emails can only be delivered to your registered Resend account (${config.testEmail || config.adminEmail}). To deliver directly to customer addresses (${Array.isArray(to) ? to.join(', ') : to}), verify your custom domain at https://resend.com/domains.`
        : errMsg;

      return {
        success: false,
        verified: false,
        error: humanError,
        statusCode: err.statusCode,
        name: err.name,
        isSandboxRestriction: isSandbox,
        recipient: to,
        timestamp: new Date().toISOString()
      };
    }

    if (response.data && response.data.id) {
      console.log(`[ResendService] Email successfully accepted by Resend. ID: ${response.data.id} -> Recipient: ${Array.isArray(to) ? to.join(', ') : to}`);
      return {
        success: true,
        verified: true,
        id: response.data.id,
        to: to,
        from: sender,
        status: 'sent',
        timestamp: new Date().toISOString()
      };
    }

    return {
      success: false,
      verified: false,
      error: 'Unexpected empty response from Resend API.'
    };
  } catch (networkErr) {
    console.error('[ResendService] Network/Transport exception:', networkErr);
    return {
      success: false,
      verified: false,
      error: networkErr.message || 'Network error communicating with Resend API.'
    };
  }
}

/**
 * Checks email delivery status using Resend API if API key permits read access.
 * If the API key is restricted to send-only, returns the last known status safely.
 */
async function checkEmailStatus(emailId) {
  if (!emailId) return null;
  const config = getConfig();
  if (!config.isConfigured) return null;

  try {
    const resend = new Resend(config.apiKey);
    const result = await resend.emails.get(emailId);
    if (result && result.data) {
      return {
        id: result.data.id,
        status: result.data.last_event || 'sent', // 'sent', 'delivered', 'bounced', 'complained', 'delivery_delayed'
        to: result.data.to,
        from: result.data.from,
        createdAt: result.data.created_at
      };
    }
    if (result && result.error && result.error.name === 'restricted_api_key') {
      // Send-only key: Resend API disallows status reading; email was accepted on send
      return {
        id: emailId,
        status: 'sent',
        isSendOnlyKey: true
      };
    }
  } catch (e) {
    // Graceful fallback
  }
  return {
    id: emailId,
    status: 'sent'
  };
}

/**
 * 1. Traveler Acknowledgement Email
 * Sent to the customer immediately when their support inquiry is submitted.
 */
async function sendCustomerAcknowledgement({ ticketId, name, email, category, message, createdAt }) {
  const config = getConfig();
  const safeName = escapeHtml(name || 'Traveler');
  const safeEmail = escapeHtml(email);
  const safeCategory = escapeHtml(category || 'General Support');
  const safeMessage = escapeHtml(message || '').replace(/\n/g, '<br/>');
  const formattedDate = formatEmailDate(createdAt);
  const shortId = (ticketId || 'TICKET').slice(0, 8).toUpperCase();

  const subject = `[WAYVORA #${shortId}] We've received your request: ${safeCategory}`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>WAYVORA Support Request Confirmation</title>
  <style>
    body { margin: 0; padding: 0; background-color: #0b1120; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #334155; }
    .email-container { max-width: 600px; margin: 30px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15); }
    .email-header { background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 32px 30px; text-align: center; border-bottom: 3px solid #38bdf8; }
    .brand-title { color: #ffffff; font-size: 26px; font-weight: 800; letter-spacing: 2px; margin: 0; text-transform: uppercase; }
    .brand-subtitle { color: #94a3b8; font-size: 13px; margin-top: 6px; letter-spacing: 0.5px; }
    .email-body { padding: 36px 32px; }
    .greeting { font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 12px; }
    .lead-text { font-size: 15px; line-height: 1.6; color: #475569; margin-bottom: 24px; }
    .ticket-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 24px; }
    .ticket-row { display: flex; margin-bottom: 10px; font-size: 14px; }
    .ticket-label { width: 130px; font-weight: 700; color: #64748b; }
    .ticket-value { font-weight: 600; color: #0f172a; }
    .ticket-badge { background: #e0f2fe; color: #0284c7; padding: 3px 8px; border-radius: 4px; font-family: monospace; font-size: 12px; }
    .message-box { background: #ffffff; border-left: 3px solid #38bdf8; padding: 14px 16px; margin-top: 14px; font-style: italic; color: #334155; font-size: 14px; border-radius: 0 6px 6px 0; }
    .support-promise { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin-bottom: 24px; font-size: 14px; color: #166534; line-height: 1.5; }
    .portal-note { font-size: 13px; color: #64748b; line-height: 1.6; margin-bottom: 28px; }
    .email-footer { background: #f1f5f9; padding: 24px 30px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; line-height: 1.6; }
    .footer-links a { color: #0284c7; text-decoration: none; margin: 0 8px; font-weight: 600; }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="email-header">
      <div class="brand-title">WAYVORA</div>
      <div class="brand-subtitle">Help &amp; Customer Support Concierge</div>
    </div>
    <div class="email-body">
      <div class="greeting">Hello ${safeName},</div>
      <p class="lead-text">
        Thank you for contacting <strong>WAYVORA Support</strong>. We have securely received your inquiry and a support ticket has been created. Our team is already reviewing the details.
      </p>

      <div class="ticket-card">
        <div class="ticket-row">
          <span class="ticket-label">Ticket Reference:</span>
          <span class="ticket-value"><span class="ticket-badge">#${shortId}</span></span>
        </div>
        <div class="ticket-row">
          <span class="ticket-label">Category:</span>
          <span class="ticket-value">${safeCategory}</span>
        </div>
        <div class="ticket-row">
          <span class="ticket-label">Date Submitted:</span>
          <span class="ticket-value">${formattedDate}</span>
        </div>
        <div class="ticket-row" style="margin-bottom: 0;">
          <span class="ticket-label">Your Message:</span>
        </div>
        <div class="message-box">
          ${safeMessage}
        </div>
      </div>

      <div class="support-promise">
        ⏱️ <strong>Typical Response Time:</strong> Our customer support specialists personally respond to every traveler inquiry within <strong>24–48 hours</strong> (Monday through Friday).
      </div>

      <div class="portal-note">
        💡 <strong>Track Your Inquiries Live:</strong> If you are registered on WAYVORA, you can check ticket status and read official administrator responses anytime under the <strong>My Submitted Inquiries</strong> section of the Contact &amp; Support tab.
      </div>

      <p style="font-size: 14px; color: #475569; margin: 0;">
        Warm regards,<br>
        <strong>The WAYVORA Support Team</strong>
      </p>
    </div>
    <div class="email-footer">
      <p style="margin: 0 0 8px 0;">WAYVORA • Intelligent Travel Platform &amp; Global Itinerary Planner</p>
      <p style="margin: 0; color: #94a3b8; font-size: 11px;">This automated acknowledgement was dispatched via Resend. To reply to our support desk, you can respond directly to this email or reach us at <a href="mailto:${escapeHtml(config.adminEmail)}" style="color: #0284c7;">${escapeHtml(config.adminEmail)}</a>.</p>
    </div>
  </div>
</body>
</html>
  `.trim();

  const text = `
WAYVORA Help & Support Confirmation
Ticket: #${shortId}

Hello ${name || 'Traveler'},

Thank you for reaching out to WAYVORA Support. We have received your inquiry regarding "${category || 'General Support'}".

Ticket Reference: #${shortId}
Date Submitted: ${formattedDate}
Category: ${category || 'General Support'}

Your Message:
"${message}"

Our customer support team responds to traveler inquiries within 24-48 hours. If you have an account on WAYVORA, you can also track this ticket in real time under "My Submitted Inquiries".

Sincerely,
The WAYVORA Support Team
  `.trim();

  return await sendEmail({
    to: email,
    subject: subject,
    html: html,
    text: text,
    replyTo: config.adminEmail
  });
}

/**
 * 2. Administrator Notification Email
 * Alerts the administrator with traveler details and inquiry content.
 * CRITICAL: Sets reply_to to traveler's email, enabling direct email client reply!
 */
async function sendAdminNotification({ ticketId, name, email, category, message, userId = null, createdAt }) {
  const config = getConfig();
  const safeName = escapeHtml(name || 'Traveler');
  const safeEmail = escapeHtml(email);
  const safeCategory = escapeHtml(category || 'General Inquiry');
  const safeMessage = escapeHtml(message || '').replace(/\n/g, '<br/>');
  const formattedDate = formatEmailDate(createdAt);
  const shortId = (ticketId || 'TICKET').slice(0, 8).toUpperCase();
  const accountType = userId ? `Registered Account (UID: ${escapeHtml(userId)})` : 'Guest Visitor';

  const subject = `[WAYVORA Support] New Ticket #${shortId}: ${safeCategory} (${safeName})`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>New Support Request</title>
  <style>
    body { margin: 0; padding: 0; background-color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #334155; }
    .email-container { max-width: 600px; margin: 30px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2); }
    .email-header { background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%); padding: 28px 30px; text-align: left; border-bottom: 3px solid #818cf8; }
    .brand-title { color: #ffffff; font-size: 22px; font-weight: 800; letter-spacing: 1px; margin: 0; }
    .brand-subtitle { color: #c7d2fe; font-size: 13px; margin-top: 4px; }
    .email-body { padding: 32px 30px; }
    .alert-badge { display: inline-block; background: #fee2e2; color: #991b1b; padding: 4px 10px; border-radius: 9999px; font-size: 12px; font-weight: 700; text-transform: uppercase; margin-bottom: 16px; }
    .info-grid { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px; margin-bottom: 22px; }
    .info-row { margin-bottom: 8px; font-size: 14px; }
    .info-row:last-child { margin-bottom: 0; }
    .info-label { font-weight: 700; color: #64748b; width: 120px; display: inline-block; }
    .info-val { font-weight: 600; color: #0f172a; }
    .inquiry-quote { background: #ffffff; border-left: 4px solid #6366f1; padding: 16px; border-radius: 0 8px 8px 0; font-size: 14px; line-height: 1.6; color: #1e293b; margin-bottom: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
    .action-card { background: #eef2ff; border: 1px solid #c7d2fe; border-radius: 8px; padding: 18px; text-align: center; }
    .reply-btn { display: inline-block; background: #4f46e5; color: #ffffff !important; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 700; font-size: 14px; margin-top: 8px; }
    .email-footer { background: #f1f5f9; padding: 20px 30px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="email-header">
      <div class="brand-title">WAYVORA ADMIN INBOX</div>
      <div class="brand-subtitle">Customer Support Dispatch</div>
    </div>
    <div class="email-body">
      <span class="alert-badge">🔔 New Customer Inquiry</span>
      <h2 style="font-size: 18px; color: #0f172a; margin: 0 0 16px 0;">New inquiry submitted by ${safeName}</h2>

      <div class="info-grid">
        <div class="info-row"><span class="info-label">Ticket ID:</span> <span class="info-val">#${shortId} (${escapeHtml(ticketId)})</span></div>
        <div class="info-row"><span class="info-label">Traveler Name:</span> <span class="info-val">${safeName}</span></div>
        <div class="info-row"><span class="info-label">Email Address:</span> <span class="info-val"><a href="mailto:${safeEmail}" style="color: #4f46e5;">${safeEmail}</a></span></div>
        <div class="info-row"><span class="info-label">Category:</span> <span class="info-val">${safeCategory}</span></div>
        <div class="info-row"><span class="info-label">Account:</span> <span class="info-val">${accountType}</span></div>
        <div class="info-row"><span class="info-label">Timestamp:</span> <span class="info-val">${formattedDate}</span></div>
      </div>

      <div style="font-weight: 700; font-size: 13px; color: #64748b; margin-bottom: 8px; text-transform: uppercase;">Message Content:</div>
      <div class="inquiry-quote">
        ${safeMessage}
      </div>

      <div class="action-card">
        <div style="font-size: 13px; color: #4338ca; font-weight: 600;">Direct Email Reply Enabled</div>
        <p style="font-size: 13px; color: #475569; margin: 6px 0 12px 0;">
          Simply click <strong>Reply</strong> in your email client to send your message directly to <strong>${safeEmail}</strong>, or click the button below.
        </p>
        <a href="mailto:${safeEmail}?subject=Re:%20WAYVORA%20Support%20[#${shortId}]%20-${encodeURIComponent(' ' + category)}" class="reply-btn">
          ✉️ Reply to Traveler via Email
        </a>
      </div>
    </div>
    <div class="email-footer">
      Dispatched by WAYVORA Notification Engine via Resend API.<br>
      To manage support tickets in real-time, visit the WAYVORA Admin Dashboard.
    </div>
  </div>
</body>
</html>
  `.trim();

  const text = `
[WAYVORA ADMIN INBOX] New Support Ticket #${shortId}

A new customer support inquiry has been submitted.

Ticket ID: #${shortId}
Traveler: ${name}
Email: ${email}
Category: ${category}
Account: ${userId ? 'UID ' + userId : 'Guest'}
Submitted: ${formattedDate}

Message:
"${message}"

To reply to this traveler directly, simply hit Reply in your email client (Reply-To is pre-configured to ${email}).
  `.trim();

  return await sendEmail({
    to: config.adminEmail,
    subject: subject,
    html: html,
    text: text,
    replyTo: `${name} <${email}>`
  });
}

/**
 * 3. Administrator Official Response Email
 * Dispatched to the traveler when the administrator answers from the Admin Dashboard.
 */
async function sendAdminReplyToCustomer({ ticketId, travelerName, travelerEmail, adminReply, originalMessage, category, status = 'in_progress' }) {
  if (process.env.SUPPORT_REPLY_KILL_SWITCH === 'true') {
    console.warn('[ResendService] KILL-SWITCH ACTIVE: sendAdminReplyToCustomer suppressed.');
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
  <title>WAYVORA Support Response</title>
  <style>
    body { margin: 0; padding: 0; background-color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #334155; }
    .email-container { max-width: 600px; margin: 30px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15); }
    .email-header { background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 30px; text-align: center; border-bottom: 3px solid #38bdf8; }
    .brand-title { color: #ffffff; font-size: 24px; font-weight: 800; letter-spacing: 2px; margin: 0; }
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
      <div style="color: #94a3b8; font-size: 13px; margin-top: 4px;">Official Support Response</div>
    </div>
    <div class="email-body">
      <div class="greeting">Hello ${safeName},</div>
      <span class="status-badge">Ticket Status: ${statusLabel}</span>

      <p style="font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 20px;">
        An official representative from the <strong>WAYVORA Customer Support Team</strong> has reviewed your ticket (<strong>#${shortId}</strong>) and provided the following response:
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
        Have additional questions or need further assistance? Simply <strong>reply directly to this email</strong>, and your message will be routed to our support team.
      </p>

      <p style="font-size: 14px; color: #475569; margin-top: 24px;">
        Best regards,<br>
        <strong>WAYVORA Support Concierge</strong>
      </p>
    </div>
    <div class="email-footer">
      WAYVORA • Intelligent Travel Platform &amp; Global Support<br>
      Ticket #${shortId} • Contact: <a href="mailto:${escapeHtml(config.adminEmail)}" style="color: #0284c7;">${escapeHtml(config.adminEmail)}</a>
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

An official representative from WAYVORA Support has answered your inquiry:

Response:
${adminReply}

${originalMessage ? `Your Original Inquiry:\n"${originalMessage}"\n` : ''}
If you have any further questions, you can reply directly to this email.

Best regards,
WAYVORA Support Concierge
  `.trim();

  return await sendEmail({
    to: travelerEmail,
    subject: subject,
    html: html,
    text: text,
    replyTo: config.adminEmail
  });
}

module.exports = {
  getConfig,
  escapeHtml,
  sendEmail,
  checkEmailStatus,
  sendCustomerAcknowledgement,
  sendAdminNotification,
  sendAdminReplyToCustomer
};
