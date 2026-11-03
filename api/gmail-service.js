/**
 * WAYVORA - Gmail API OAuth2 Support Integration Service
 * 
 * Secure server-side Gmail dispatching using OAuth2 and the Gmail REST API.
 * Google Cloud Project: wayvora-gmail-integration
 * Authorized Admin Account: wayvora.admin@gmail.com
 * Minimum Required Scope: https://www.googleapis.com/auth/gmail.send
 * 
 * Never exposes Client Secrets or Refresh Tokens to frontend JavaScript.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Minimum required scope for sending emails via Gmail API
const GMAIL_SEND_SCOPE = 'https://www.googleapis.com/auth/gmail.send';
const TOKEN_FILE_PATH = path.join(__dirname, '..', 'secrets', 'gmail_tokens.json');

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
 * Sanitizes and strips extraneous JSON fragments, quotes, or whitespace
 * from environment credentials (e.g. if copied from Google Console client_secret.json).
 */
function cleanSecretValue(val) {
  if (!val) return '';
  let str = String(val).trim();
  const jsonSplit = str.indexOf('","');
  if (jsonSplit !== -1) {
    str = str.slice(0, jsonSplit).trim();
  }
  return str.replace(/^["'\[\]]+|["'\[\]]+$/g, '').trim();
}

/**
 * Retrieves environment secrets and configurations for Google OAuth
 */
function getConfig() {
  const clientId = cleanSecretValue(process.env.GOOGLE_CLIENT_ID);
  const clientSecret = cleanSecretValue(process.env.GOOGLE_CLIENT_SECRET);
  const redirectUri = cleanSecretValue(process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5500/api/auth/google/callback');
  const adminGmail = cleanSecretValue(process.env.ADMIN_GMAIL || process.env.ADMIN_EMAIL || 'wayvora.admin@gmail.com');

  const isConfigured = !!(clientId && clientSecret && !clientId.includes('your_google_client_id'));

  return {
    clientId,
    clientSecret,
    redirectUri,
    adminGmail,
    scope: GMAIL_SEND_SCOPE,
    isConfigured
  };
}

/**
 * Generates the Google OAuth 2.0 authorization URL
 * 
 * @param {string} [state] - Optional CSRF state string
 * @returns {string} Fully formed Google OAuth authorization URL
 */
function getAuthUrl(state = '') {
  const config = getConfig();
  if (!config.isConfigured) {
    throw new Error('Google OAuth credentials (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET) are not configured in environment variables.');
  }

  const csrfState = state || crypto.randomBytes(16).toString('hex');

  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: 'code',
    scope: config.scope,
    access_type: 'offline',
    prompt: 'consent',
    include_granted_scopes: 'true',
    state: csrfState
  });

  return {
    authUrl: `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`,
    state: csrfState
  };
}

/**
 * Exchanges authorization code for access and refresh tokens
 * 
 * @param {string} code - The authorization code returned by Google
 * @returns {Promise<object>} Token response
 */
async function exchangeCodeForTokens(code) {
  const config = getConfig();
  if (!config.isConfigured) {
    throw new Error('Google OAuth credentials not configured.');
  }

  const params = new URLSearchParams({
    code,
    client_id: config.clientId,
    client_secret: config.clientSecret,
    redirect_uri: config.redirectUri,
    grant_type: 'authorization_code'
  });

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString()
  });

  const data = await response.json();
  if (data.error) {
    throw new Error(`Google token exchange error: ${data.error_description || data.error}`);
  }

  // Load existing tokens to retain refresh_token if Google omitted it during re-auth
  const existingTokens = await loadTokens();
  const refreshToken = data.refresh_token || (existingTokens && existingTokens.refresh_token) || null;

  if (!refreshToken) {
    throw new Error('Google did not return a refresh token. Re-authorization with prompt=consent is required.');
  }

  const tokenPayload = {
    refresh_token: refreshToken,
    access_token: data.access_token,
    expires_at: Date.now() + (data.expires_in || 3600) * 1000,
    scope: data.scope || config.scope,
    connected_email: config.adminGmail,
    updated_at: new Date().toISOString()
  };

  await saveTokens(tokenPayload);
  return tokenPayload;
}

/**
 * Saves tokens securely to Cloud Firestore and local secrets file
 * Never exposed to frontend clients
 */
async function saveTokens(tokens) {
  // 1. Save to local secrets/ directory immediately
  try {
    const secretsDir = path.dirname(TOKEN_FILE_PATH);
    if (!fs.existsSync(secretsDir)) {
      fs.mkdirSync(secretsDir, { recursive: true });
    }
    fs.writeFileSync(TOKEN_FILE_PATH, JSON.stringify(tokens, null, 2), 'utf8');
  } catch (fsErr) {
    console.warn('[GmailService] Local token write warning (non-fatal on Vercel):', fsErr.message);
  }

  // 2. Save to Cloud Firestore system_secrets/gmail_tokens with a strict timeout (never hangs response)
  try {
    const { initFirebaseAdmin } = require('./firebase-admin.js');
    const { db } = initFirebaseAdmin();
    if (db) {
      const firestoreSet = db.collection('system_secrets').doc('gmail_tokens').set({
        ...tokens,
        lastUpdated: new Date().toISOString()
      }, { merge: true });

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Firestore sync timed out')), 2500)
      );

      await Promise.race([firestoreSet, timeoutPromise]).catch(timeoutErr => {
        console.warn('[GmailService] Firestore token sync timed out, local token retained:', timeoutErr.message);
      });
    }
  } catch (fsErr) {
    console.warn('[GmailService] Firestore token sync warning:', fsErr.message);
  }

  return true;
}

/**
 * Loads tokens from local file (fastest) or Firestore (fallback)
 */
async function loadTokens() {
  // 1. Try environment variable fallback first (e.g. if set in Vercel secrets)
  if (process.env.GOOGLE_REFRESH_TOKEN) {
    return {
      refresh_token: cleanSecretValue(process.env.GOOGLE_REFRESH_TOKEN),
      connected_email: getConfig().adminGmail,
      scope: GMAIL_SEND_SCOPE
    };
  }

  // 2. Try local file in secrets/ (instantaneous on local development server)
  if (fs.existsSync(TOKEN_FILE_PATH)) {
    try {
      const content = fs.readFileSync(TOKEN_FILE_PATH, 'utf8');
      const parsed = JSON.parse(content);
      if (parsed && parsed.refresh_token) {
        return parsed;
      }
    } catch (e) {
      // Non-fatal, check Firestore
    }
  }

  // 3. Try Cloud Firestore system_secrets/gmail_tokens with timeout
  try {
    const { initFirebaseAdmin } = require('./firebase-admin.js');
    const { db } = initFirebaseAdmin();
    if (db) {
      const firestoreGet = db.collection('system_secrets').doc('gmail_tokens').get();
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Firestore read timed out')), 2500)
      );

      const doc = await Promise.race([firestoreGet, timeoutPromise]).catch(() => null);
      if (doc && doc.exists) {
        const data = doc.data();
        if (data && data.refresh_token) {
          return data;
        }
      }
    }
  } catch (dbErr) {
    // Non-fatal
  }

  return null;
}

/**
 * Ensures a valid access token is available, refreshing if expired
 */
async function getValidAccessToken() {
  const tokens = await loadTokens();
  if (!tokens || !tokens.refresh_token) {
    return null;
  }

  // If current access_token exists and is valid for at least 60 seconds
  if (tokens.access_token && tokens.expires_at && tokens.expires_at > Date.now() + 60000) {
    return tokens.access_token;
  }

  // Refresh access token using refresh_token
  const config = getConfig();
  if (!config.isConfigured) {
    return null;
  }

  const params = new URLSearchParams({
    client_id: config.clientId,
    client_secret: config.clientSecret,
    refresh_token: tokens.refresh_token,
    grant_type: 'refresh_token'
  });

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString()
  });

  const data = await response.json();
  if (data.error) {
    console.error('[GmailService] Failed to refresh access token:', data.error_description || data.error);
    return null;
  }

  const updatedTokens = {
    ...tokens,
    access_token: data.access_token,
    expires_at: Date.now() + (data.expires_in || 3600) * 1000,
    updated_at: new Date().toISOString()
  };

  await saveTokens(updatedTokens);
  return data.access_token;
}

/**
 * Returns the public connection status for the Administrator Dashboard
 * (Never exposes refresh_token or client_secret)
 */
async function getConnectionStatus() {
  const config = getConfig();
  const tokens = await loadTokens();

  const isConnected = !!(tokens && tokens.refresh_token);

  return {
    isConfigured: config.isConfigured,
    isConnected: isConnected,
    connectedEmail: isConnected ? (tokens.connected_email || config.adminGmail) : null,
    scope: isConnected ? (tokens.scope || config.scope) : config.scope,
    redirectUri: config.redirectUri,
    lastUpdated: tokens ? (tokens.updated_at || tokens.lastUpdated || null) : null
  };
}

/**
 * Disconnects the Gmail integration by deleting stored tokens
 */
async function disconnect() {
  const tokens = await loadTokens();
  if (tokens && tokens.refresh_token) {
    try {
      await fetch(`https://oauth2.googleapis.com/revoke?token=${encodeURIComponent(tokens.refresh_token)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
    } catch (e) {
      // Non-fatal
    }
  }

  // Remove local file
  if (fs.existsSync(TOKEN_FILE_PATH)) {
    try {
      fs.unlinkSync(TOKEN_FILE_PATH);
    } catch (e) {
      // Non-fatal
    }
  }

  // Remove from Firestore
  try {
    const { initFirebaseAdmin } = require('./firebase-admin.js');
    const { db } = initFirebaseAdmin();
    if (db) {
      await db.collection('system_secrets').doc('gmail_tokens').delete();
    }
  } catch (e) {
    // Non-fatal
  }

  return { success: true, message: 'Gmail integration disconnected successfully.' };
}

/**
 * Builds an RFC 2822 compliant MIME message string and base64url encodes it
 */
function buildMimeMessage({ to, from, subject, html, text, replyTo, inReplyTo, references }) {
  const boundary = `boundary_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  const cleanSubject = (subject || 'WAYVORA Support').replace(/[\r\n]+/g, ' ');
  const encodedSubject = `=?UTF-8?B?${Buffer.from(cleanSubject, 'utf8').toString('base64')}?=`;

  const headers = [
    `From: WAYVORA Support <${from}>`,
    `To: ${to}`,
    `Subject: ${encodedSubject}`,
    `Date: ${new Date().toUTCString()}`,
    `Message-ID: <${Date.now()}.${Math.random().toString(36).slice(2)}@wayvora.com>`,
    'MIME-Version: 1.0'
  ];

  if (replyTo) {
    headers.push(`Reply-To: ${replyTo}`);
  }
  if (inReplyTo) {
    headers.push(`In-Reply-To: ${inReplyTo}`);
  }
  if (references) {
    headers.push(`References: ${references}`);
  }

  headers.push(`Content-Type: multipart/alternative; boundary="${boundary}"`);

  const plainPart = text || (html ? html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() : '');

  const mimeString = [
    headers.join('\r\n'),
    '',
    `--${boundary}`,
    'Content-Type: text/plain; charset="UTF-8"',
    'Content-Transfer-Encoding: base64',
    '',
    Buffer.from(plainPart, 'utf8').toString('base64'),
    '',
    `--${boundary}`,
    'Content-Type: text/html; charset="UTF-8"',
    'Content-Transfer-Encoding: base64',
    '',
    Buffer.from(html || plainPart, 'utf8').toString('base64'),
    '',
    `--${boundary}--`
  ].join('\r\n');

  return Buffer.from(mimeString, 'utf8').toString('base64url');
}

/**
 * Sends an email using the Gmail REST API (users.messages.send)
 * Requires scope: https://www.googleapis.com/auth/gmail.send
 * 
 * @param {object} options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject line
 * @param {string} options.html - HTML email content
 * @param {string} [options.text] - Plaintext email content
 * @param {string} [options.replyTo] - Reply-To address
 * @returns {Promise<{success: boolean, verified: boolean, id?: string, error?: string}>}
 */
async function sendEmailWithGmail({ to, subject, html, text, replyTo, inReplyTo, references }) {
  const config = getConfig();
  const accessToken = await getValidAccessToken();

  if (!accessToken) {
    return {
      success: false,
      verified: false,
      error: 'Gmail API is not connected or authorization token could not be refreshed. Please connect Gmail in the Admin Dashboard.'
    };
  }

  if (!to || !to.includes('@')) {
    return {
      success: false,
      verified: false,
      error: `Invalid recipient address: "${to}"`
    };
  }

  try {
    const rawMime = buildMimeMessage({
      to,
      from: config.adminGmail,
      subject,
      html,
      text,
      replyTo: replyTo || config.adminGmail,
      inReplyTo,
      references
    });

    const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ raw: rawMime })
    });

    const data = await response.json();

    if (data.error) {
      console.error('[GmailService] Send Error:', data.error);
      return {
        success: false,
        verified: false,
        error: data.error.message || 'Gmail API send failed',
        code: data.error.code,
        status: data.error.status
      };
    }

    if (data.id) {
      console.log(`[GmailService] Email successfully dispatched via Gmail API! Message ID: ${data.id} -> Recipient: ${to}`);
      return {
        success: true,
        verified: true,
        id: data.id,
        threadId: data.threadId,
        recipient: to,
        sender: config.adminGmail,
        provider: 'gmail',
        timestamp: new Date().toISOString()
      };
    }

    return {
      success: false,
      verified: false,
      error: 'Unexpected response from Gmail API.'
    };
  } catch (err) {
    console.error('[GmailService] Network Exception:', err);
    return {
      success: false,
      verified: false,
      error: err.message || 'Network exception communicating with Gmail API'
    };
  }
}

/**
 * Escapes HTML entities
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
 * Dispatches official support replies directly from the administrator's Gmail account
 * to the actual traveler's registered email address.
 */
async function sendAdminReplyWithGmail({ ticketId, travelerName, travelerEmail, adminReply, originalMessage, category, status = 'in_progress' }) {
  const config = getConfig();
  const safeName = escapeHtml(travelerName || 'Traveler');
  const safeCategory = escapeHtml(category || 'General Support');
  const safeReply = escapeHtml(adminReply || '').replace(/\n/g, '<br/>');
  const safeOriginal = escapeHtml(originalMessage || '').replace(/\n/g, '<br/>');
  const shortId = (ticketId || 'TICKET').slice(0, 8).toUpperCase();
  const statusLabel = status.replace('_', ' ').toUpperCase();

  const subject = `[WAYVORA Support] Official Response to Ticket #${shortId}: ${safeCategory}`;

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
    .email-body { padding: 32px 30px; }
    .greeting { font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 12px; }
    .status-badge { display: inline-block; background: #e0f2fe; color: #0284c7; padding: 4px 10px; border-radius: 9999px; font-size: 12px; font-weight: 700; margin-bottom: 16px; }
    .reply-card { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 20px; margin-bottom: 24px; }
    .reply-title { font-size: 14px; font-weight: 700; color: #166534; margin-bottom: 10px; }
    .reply-content { font-size: 15px; line-height: 1.6; color: #14532d; }
    .original-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 24px; font-size: 13px; color: #64748b; }
    .email-footer { background: #f1f5f9; padding: 20px 30px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="email-header">
      <div class="brand-title">WAYVORA</div>
      <div style="color: #94a3b8; font-size: 13px; margin-top: 4px;">Official Support Response from ${escapeHtml(config.adminGmail)}</div>
    </div>
    <div class="email-body">
      <div class="greeting">Hello ${safeName},</div>
      <span class="status-badge">Ticket Status: ${statusLabel}</span>

      <p style="font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 20px;">
        An official representative from the <strong>WAYVORA Customer Support Team</strong> has reviewed your ticket (<strong>#${shortId}</strong>) and provided the following response:
      </p>

      <div class="reply-card">
        <div class="reply-title">💬 Official Administrator Response:</div>
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
        Have additional questions? Simply <strong>reply directly to this email</strong>, and your message will be delivered to our administrator at <strong>${escapeHtml(config.adminGmail)}</strong>.
      </p>

      <p style="font-size: 14px; color: #475569; margin-top: 24px;">
        Warm regards,<br>
        <strong>WAYVORA Customer Support Concierge</strong><br>
        <span style="font-size: 12px; color: #94a3b8;">Dispatched via Gmail API (${escapeHtml(config.adminGmail)})</span>
      </p>
    </div>
    <div class="email-footer">
      WAYVORA • Intelligent Travel Platform &amp; Global Support<br>
      Ticket #${shortId} • Direct: <a href="mailto:${escapeHtml(config.adminGmail)}" style="color: #0284c7;">${escapeHtml(config.adminGmail)}</a>
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

An official representative from WAYVORA Support has responded to your inquiry:

Response:
${adminReply}

${originalMessage ? `Your Original Inquiry:\n"${originalMessage}"\n` : ''}

If you have any further questions, you can reply directly to this email (${config.adminGmail}).

Best regards,
WAYVORA Customer Support Concierge
  `.trim();

  return await sendEmailWithGmail({
    to: travelerEmail,
    subject: subject,
    html: html,
    text: text,
    replyTo: config.adminGmail
  });
}

module.exports = {
  GMAIL_SEND_SCOPE,
  getConfig,
  getAuthUrl,
  exchangeCodeForTokens,
  saveTokens,
  loadTokens,
  getValidAccessToken,
  getConnectionStatus,
  disconnect,
  buildMimeMessage,
  sendEmailWithGmail,
  sendAdminReplyWithGmail
};
