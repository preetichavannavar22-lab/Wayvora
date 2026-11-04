/**
 * WAYVORA - Google OAuth2 Authentication & Callback Handler
 * Handles OAuth2 authorization initiation, callback handling, status, test email, and disconnection.
 * Works as a Vercel Serverless Function and is mounted in server.js.
 */

const {
  getAuthUrl,
  exchangeCodeForTokens,
  getConnectionStatus,
  disconnect,
  sendEmailWithGmail,
  getConfig
} = require('./gmail-service.js');

const { verifyAdminAuthToken } = require('./firebase-admin.js');

/**
 * Main HTTP Handler for /api/auth/* routes
 */
async function handleAuthRequest(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    if (typeof res.status === 'function') return res.status(204).end();
    res.writeHead(204);
    res.end();
    return;
  }

  let pathname = '/';
  let searchParams = new URLSearchParams();
  try {
    const parsedUrl = new URL(req.url, 'http://localhost');
    pathname = parsedUrl.pathname;
    searchParams = parsedUrl.searchParams;
  } catch (e) {
    const qIdx = (req.url || '').indexOf('?');
    pathname = qIdx >= 0 ? req.url.slice(0, qIdx) : (req.url || '/');
    if (qIdx >= 0) {
      searchParams = new URLSearchParams(req.url.slice(qIdx + 1));
    }
  }

  const cleanPath = (pathname || '').replace(/\/+$/, '').toLowerCase();

  try {
    // -------------------------------------------------------------------------
    // 1. GET /api/auth/google/url - Generate OAuth Authorization URL
    // -------------------------------------------------------------------------
    if ((cleanPath === '/api/auth/google/url' || cleanPath === '/api/auth/url') && req.method === 'GET') {
      const stateParam = searchParams.get('state') || '';
      try {
        const result = getAuthUrl(stateParam);
        return sendJsonResponse(res, 200, { success: true, ...result });
      } catch (err) {
        return sendJsonResponse(res, 400, {
          success: false,
          error: err.message,
          isConfigured: false
        });
      }
    }

    // -------------------------------------------------------------------------
    // 2. GET /api/auth/google/callback - OAuth2 Callback from Google
    // -------------------------------------------------------------------------
    const isCallback = (
      cleanPath === '/api/auth/google/callback' ||
      cleanPath === '/api/auth/callback' ||
      cleanPath === '/callback' ||
      cleanPath.endsWith('/google/callback') ||
      ((cleanPath === '' || cleanPath === '/' || cleanPath === '/index.html') && (searchParams.has('code') || searchParams.has('error')))
    );

    if (isCallback && req.method === 'GET') {
      const code = searchParams.get('code');
      const error = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');

      if (error) {
        return renderHtmlResponse(res, 400, renderErrorPage('Google Authorization Denied', errorDescription || error));
      }

      if (!code) {
        return renderHtmlResponse(res, 400, renderErrorPage('Missing Authorization Code', 'Google redirected without an authorization code. Please return to the Admin Dashboard and try connecting again.'));
      }

      try {
        await exchangeCodeForTokens(code);
        return renderHtmlResponse(res, 200, renderSuccessPage());
      } catch (tokenErr) {
        console.error('[GoogleAuth] Token exchange failed:', tokenErr);
        return renderHtmlResponse(res, 500, renderErrorPage('Authorization Exchange Failed', tokenErr.message));
      }
    }

    // -------------------------------------------------------------------------
    // 3. GET /api/auth/google/status - Connection Status (Admin Dashboard)
    // -------------------------------------------------------------------------
    if ((cleanPath === '/api/auth/google/status' || cleanPath === '/api/auth/status' || cleanPath === '/api/auth/smtp/status') && req.method === 'GET') {
      const status = await getConnectionStatus();
      if (status.isConnected) {
        return sendJsonResponse(res, 200, {
          success: true,
          ...status,
          method: 'oauth2',
          provider: 'gmail',
          scope: status.scope || 'https://www.googleapis.com/auth/gmail.send',
          channel: `Gmail API (Google OAuth 2.0) • ${status.connectedEmail || 'wayvora.admin@gmail.com'}`
        });
      }
      const { getConfig: getSmtpConfig } = require('./gmail-smtp-service.js');
      const smtpConfig = getSmtpConfig();
      if (smtpConfig.isConfigured) {
        return sendJsonResponse(res, 200, {
          success: true,
          isConnected: true,
          isConfigured: true,
          connectedEmail: smtpConfig.user,
          method: 'smtp',
          provider: 'gmail_smtp',
          scope: 'smtp.gmail.com:465 (SSL)',
          channel: 'Gmail SMTP (Nodemailer) • wayvora.admin@gmail.com'
        });
      }
      return sendJsonResponse(res, 200, { success: true, ...status });
    }

    // -------------------------------------------------------------------------
    // 4. POST /api/auth/google/disconnect - Disconnect Gmail Integration
    // -------------------------------------------------------------------------
    if ((cleanPath === '/api/auth/google/disconnect' || cleanPath === '/api/auth/disconnect') && req.method === 'POST') {
      // Admin verification
      const authHeader = req.headers ? (req.headers.authorization || req.headers.Authorization) : null;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split('Bearer ')[1].trim();
        const verification = await verifyAdminAuthToken(token);
        if (!verification.isValid || !verification.isAdmin) {
          return sendJsonResponse(res, 403, { success: false, error: 'Unauthorized: Admin privileges required.' });
        }
      }

      const result = await disconnect();
      return sendJsonResponse(res, 200, result);
    }

    // -------------------------------------------------------------------------
    // 5. POST /api/auth/google/test - Send Test Email via Gmail API (OAuth 2.0)
    // -------------------------------------------------------------------------
    if ((cleanPath === '/api/auth/google/test' || cleanPath === '/api/auth/test' || cleanPath === '/api/auth/smtp/test') && req.method === 'POST') {
      // Admin verification
      const authHeader = req.headers ? (req.headers.authorization || req.headers.Authorization) : null;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split('Bearer ')[1].trim();
        const verification = await verifyAdminAuthToken(token);
        if (!verification.isValid || !verification.isAdmin) {
          return sendJsonResponse(res, 403, { success: false, error: 'Unauthorized: Admin privileges required.' });
        }
      }

      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
      const targetEmail = body.to || 'wayvora.admin@gmail.com';

      const config = getConfig();
      const status = await getConnectionStatus();

      // Primary: Gmail API via Google OAuth 2.0
      if (status.isConnected) {
        const testResult = await sendEmailWithGmail({
          to: targetEmail,
          subject: 'WAYVORA - Gmail API OAuth2 Verification Test',
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 550px; margin: auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 10px;">
              <div style="background: #0f172a; padding: 18px 20px; border-radius: 8px 8px 0 0; text-align: center;">
                <h2 style="color: #ffffff; margin: 0; font-size: 20px; letter-spacing: 1px;">WAYVORA GMAIL API TEST</h2>
              </div>
              <div style="padding: 20px 0;">
                <p style="font-size: 15px; color: #1e293b;">Hello Administrator,</p>
                <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 15px; border-radius: 6px; margin: 15px 0;">
                  <strong style="color: #166534;">✓ Gmail Connection Verified!</strong>
                  <p style="margin: 6px 0 0 0; color: #14532d; font-size: 13px;">This email confirms that WAYVORA has securely established an authenticated connection with Gmail via Google OAuth 2.0 without requiring any App Password.</p>
                </div>
                <p style="font-size: 13px; color: #64748b;">Support ticket replies sent from the WAYVORA Admin Dashboard will now be delivered directly from <strong>${config.adminGmail}</strong>.</p>
              </div>
              <div style="border-top: 1px solid #e2e8f0; padding-top: 15px; font-size: 12px; color: #94a3b8; text-align: center;">
                Dispatched at ${new Date().toUTCString()} via Gmail REST API
              </div>
            </div>
          `,
          text: `WAYVORA Gmail API Test\n\nGmail Connection Verified!\nDispatched from ${config.adminGmail} via Google OAuth 2.0.`
        });

        if (!testResult.success) {
          return sendJsonResponse(res, 400, {
            success: false,
            error: testResult.error,
            provider: 'gmail'
          });
        }

        return sendJsonResponse(res, 200, {
          success: true,
          verified: true,
          messageId: testResult.id,
          recipient: targetEmail,
          provider: 'gmail',
          timestamp: testResult.timestamp,
          message: `Verification test email sent to ${targetEmail} via Gmail API (Google OAuth 2.0)!`
        });
      }

      // Alternate fallback to SMTP if configured
      const { getConfig: getSmtpConfig, sendTestEmailWithSmtp } = require('./gmail-smtp-service.js');
      const smtpConfig = getSmtpConfig();

      if (smtpConfig.isConfigured) {
        const smtpTest = await sendTestEmailWithSmtp({ to: targetEmail });
        if (!smtpTest.success) {
          return sendJsonResponse(res, 400, {
            success: false,
            error: smtpTest.error,
            provider: 'gmail_smtp'
          });
        }
        return sendJsonResponse(res, 200, {
          success: true,
          verified: true,
          messageId: smtpTest.id,
          recipient: targetEmail,
          provider: 'gmail_smtp',
          timestamp: smtpTest.timestamp,
          message: `Verification test email delivered to ${targetEmail} via Gmail SMTP (Nodemailer)!`
        });
      }

      return sendJsonResponse(res, 400, {
        success: false,
        error: 'Gmail API is not connected. Please connect your Gmail account in the Admin Dashboard or configure GOOGLE_REFRESH_TOKEN.'
      });
    }

    return sendJsonResponse(res, 404, { error: 'Not found: Invalid auth endpoint' });

  } catch (err) {
    console.error('[GoogleAuth] Internal Handler Error:', err);
    return sendJsonResponse(res, 500, {
      success: false,
      error: 'Internal server error processing Google Auth request',
      details: err.message
    });
  }
}

function sendJsonResponse(res, statusCode, data) {
  if (typeof res.status === 'function') {
    return res.status(statusCode).json(data);
  }
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

function renderHtmlResponse(res, statusCode, html) {
  const buf = Buffer.from(html, 'utf8');
  if (typeof res.status === 'function') {
    res.setHeader('Content-Type', 'text/html; charset=UTF-8');
    res.setHeader('Content-Length', buf.length);
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    return res.status(statusCode).send(html);
  }
  res.writeHead(statusCode, {
    'Content-Type': 'text/html; charset=UTF-8',
    'Content-Length': buf.length,
    'Cache-Control': 'no-store, no-cache, must-revalidate'
  });
  res.end(buf);
}

function renderSuccessPage() {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>WAYVORA - Gmail Connected Successfully</title>
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 20px;
      background-color: #0b1120;
      background-image: radial-gradient(ellipse at top, #1e293b 0%, #0b1120 100%);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      color: #f8fafc;
    }
    .card {
      background: #1e293b;
      border: 1px solid rgba(56, 189, 248, 0.25);
      border-radius: 16px;
      padding: 44px 36px;
      max-width: 500px;
      width: 100%;
      text-align: center;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
    }
    .icon-badge {
      width: 76px;
      height: 76px;
      border-radius: 50%;
      background: rgba(34, 197, 94, 0.15);
      border: 2px solid #22c55e;
      color: #22c55e;
      font-size: 38px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 22px;
      box-shadow: 0 0 25px rgba(34, 197, 94, 0.25);
    }
    h1 {
      margin: 0 0 10px 0;
      font-size: 24px;
      font-weight: 700;
      color: #ffffff;
      letter-spacing: -0.3px;
    }
    .badge {
      display: inline-block;
      background: rgba(34, 197, 94, 0.18);
      color: #4ade80;
      font-size: 12px;
      font-weight: 600;
      padding: 4px 12px;
      border-radius: 9999px;
      margin-bottom: 18px;
      border: 1px solid rgba(74, 222, 128, 0.3);
    }
    p {
      margin: 0 0 26px 0;
      color: #94a3b8;
      font-size: 14.5px;
      line-height: 1.6;
    }
    .account-pill {
      background: #0f172a;
      border: 1px solid #334155;
      padding: 10px 14px;
      border-radius: 8px;
      font-family: monospace;
      color: #38bdf8;
      font-size: 13.5px;
      margin-bottom: 24px;
      word-break: break-all;
    }
    .btn {
      display: inline-block;
      width: 100%;
      background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
      color: #ffffff;
      padding: 13px 24px;
      border-radius: 10px;
      text-decoration: none;
      font-weight: 600;
      font-size: 15px;
      transition: all 0.2s ease;
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 14px rgba(2, 132, 199, 0.35);
    }
    .btn:hover {
      background: linear-gradient(135deg, #0369a1 0%, #075985 100%);
      transform: translateY(-1px);
    }
    .subtext {
      font-size: 12.5px;
      color: #64748b;
      margin-top: 20px;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon-badge">✓</div>
    <div class="badge">OAuth2 Authorization Complete</div>
    <h1>Admin Gmail Connected!</h1>
    <div class="account-pill">wayvora.admin@gmail.com</div>
    <p>WAYVORA is now securely authenticated with Google Cloud. All customer support replies dispatched from the Admin Portal will be delivered directly from your verified Gmail address.</p>
    
    <button type="button" class="btn" id="btn-return" onclick="returnToAdmin()">
      Return to Admin Dashboard
    </button>
    <div class="subtext">
      Automatically syncing with dashboard in <span id="countdown">2</span>s...
    </div>
  </div>

  <script>
    // 1. Post message to opener window if accessible
    try {
      if (window.opener && !window.opener.closed) {
        window.opener.postMessage({ type: 'GMAIL_AUTH_SUCCESS', email: 'wayvora.admin@gmail.com' }, '*');
      }
    } catch (e) {}

    // 2. BroadcastChannel: Notifies Admin Dashboard across tabs/windows even if COOP blocks opener
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        const bc = new BroadcastChannel('wayvora_gmail_oauth');
        bc.postMessage({ type: 'GMAIL_AUTH_SUCCESS', email: 'wayvora.admin@gmail.com', timestamp: Date.now() });
        setTimeout(() => bc.close(), 1000);
      }
    } catch (e) {}

    // 3. LocalStorage event for cross-tab notification
    try {
      localStorage.setItem('wayvora_gmail_oauth_event', JSON.stringify({
        type: 'GMAIL_AUTH_SUCCESS',
        email: 'wayvora.admin@gmail.com',
        timestamp: Date.now()
      }));
    } catch (e) {}

    function returnToAdmin() {
      // If running inside popup window, attempt to close
      if (window.opener || window.name === 'wayvora_gmail_oauth') {
        try { window.close(); } catch (e) {}
      }
      // Navigate to admin dashboard
      window.location.href = '/?gmail_status=connected#admin';
    }

    let secondsLeft = 2;
    const cdEl = document.getElementById('countdown');
    const timer = setInterval(() => {
      secondsLeft--;
      if (cdEl) cdEl.textContent = secondsLeft;
      if (secondsLeft <= 0) {
        clearInterval(timer);
        returnToAdmin();
      }
    }, 1000);
  </script>
</body>
</html>
  `.trim();
}

function renderErrorPage(title, message) {
  const safeTitle = (title || 'Authorization Error').replace(/[<>&"]/g, '');
  const safeMessage = (message || 'Unable to complete Google OAuth authorization.').replace(/[<>&"]/g, '');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>WAYVORA - ${safeTitle}</title>
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 20px;
      background-color: #0b1120;
      background-image: radial-gradient(ellipse at top, #1e293b 0%, #0b1120 100%);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      color: #f8fafc;
    }
    .card {
      background: #1e293b;
      border: 1px solid rgba(239, 68, 68, 0.3);
      border-radius: 16px;
      padding: 44px 36px;
      max-width: 500px;
      width: 100%;
      text-align: center;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
    }
    .icon-badge {
      width: 76px;
      height: 76px;
      border-radius: 50%;
      background: rgba(239, 68, 68, 0.15);
      border: 2px solid #ef4444;
      color: #ef4444;
      font-size: 38px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 22px;
      box-shadow: 0 0 25px rgba(239, 68, 68, 0.25);
    }
    h1 {
      margin: 0 0 10px 0;
      font-size: 24px;
      font-weight: 700;
      color: #ffffff;
      letter-spacing: -0.3px;
    }
    .badge {
      display: inline-block;
      background: rgba(239, 68, 68, 0.18);
      color: #f87171;
      font-size: 12px;
      font-weight: 600;
      padding: 4px 12px;
      border-radius: 9999px;
      margin-bottom: 18px;
      border: 1px solid rgba(248, 113, 113, 0.3);
    }
    p {
      margin: 0 0 24px 0;
      color: #94a3b8;
      font-size: 14.5px;
      line-height: 1.6;
    }
    .error-box {
      background: #0f172a;
      border: 1px solid #334155;
      padding: 12px 16px;
      border-radius: 8px;
      font-family: monospace;
      color: #fca5a5;
      font-size: 13px;
      margin-bottom: 26px;
      word-break: break-all;
      text-align: left;
    }
    .btn {
      display: inline-block;
      width: 100%;
      background: #334155;
      color: #ffffff;
      padding: 13px 24px;
      border-radius: 10px;
      text-decoration: none;
      font-weight: 600;
      font-size: 15px;
      transition: all 0.2s ease;
      border: none;
      cursor: pointer;
    }
    .btn:hover {
      background: #475569;
    }
    .subtext {
      font-size: 12.5px;
      color: #64748b;
      margin-top: 18px;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon-badge">!</div>
    <div class="badge">Connection Incomplete</div>
    <h1>${safeTitle}</h1>
    <p>Google OAuth could not complete token authorization.</p>
    <div class="error-box">${safeMessage}</div>
    
    <button type="button" class="btn" onclick="returnToAdmin()">
      Return to Admin Dashboard
    </button>
    <div class="subtext">
      Please check your Google Cloud Redirect URI settings or try connecting again.
    </div>
  </div>

  <script>
    try {
      if (window.opener && !window.opener.closed) {
        window.opener.postMessage({ type: 'GMAIL_AUTH_FAILED', error: ${JSON.stringify(safeMessage)} }, '*');
      }
    } catch (e) {}

    try {
      if (typeof BroadcastChannel !== 'undefined') {
        const bc = new BroadcastChannel('wayvora_gmail_oauth');
        bc.postMessage({ type: 'GMAIL_AUTH_FAILED', error: ${JSON.stringify(safeMessage)}, timestamp: Date.now() });
        setTimeout(() => bc.close(), 1000);
      }
    } catch (e) {}

    try {
      localStorage.setItem('wayvora_gmail_oauth_event', JSON.stringify({
        type: 'GMAIL_AUTH_FAILED',
        error: ${JSON.stringify(safeMessage)},
        timestamp: Date.now()
      }));
    } catch (e) {}

    function returnToAdmin() {
      if (window.opener || window.name === 'wayvora_gmail_oauth') {
        try { window.close(); } catch (e) {}
      }
      window.location.href = '/?gmail_status=failed#admin';
    }
  </script>
</body>
</html>
  `.trim();
}

module.exports = handleAuthRequest;
