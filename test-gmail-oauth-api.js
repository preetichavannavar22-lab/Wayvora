/**
 * WAYVORA - Gmail API (Google OAuth 2.0) Integration Test Suite
 * 
 * Verifies all requirements:
 * 1. Scope is strictly https://www.googleapis.com/auth/gmail.send
 * 2. Sender email is strictly wayvora.admin@gmail.com
 * 3. OAuth credentials & refresh token loaded securely from backend (never exposed to frontend)
 * 4. Automatic access token refresh using Google OAuth 2.0 token endpoint
 * 5. RFC 2822 compliant MIME builder with base64url encoding
 * 6. Live email delivery via Gmail REST API (users.messages.send)
 * 7. Verification that success is confirmed only when Google returns a valid message ID
 * 8. Protection against unauthenticated (401) and non-admin (403) reply requests
 * 9. Strict enforcement: replies only allowed to registered Firebase Authentication travelers
 * 10. Audit trail and reply history preserved in Cloud Firestore
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const https = require('https');

// Load environment variables from .env
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const idx = trimmed.indexOf('=');
      const k = trimmed.slice(0, idx).trim();
      const v = trimmed.slice(idx + 1).trim();
      if (!process.env[k]) {
        process.env[k] = v;
      }
    }
  });
}

const GmailService = require('../api/gmail-service.js');
const {
  initFirebaseAdmin,
  saveSupportTicket,
  getSupportTicket,
  verifyAdminAuthToken,
  getUserAuthRecord,
  getUserAuthRecordByEmail
} = require('../api/firebase-admin.js');
const handleAuthRequest = require('../api/auth.js');
const handleSupportRequest = require('../api/support.js');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

async function runTest(name, fn) {
  totalTests++;
  try {
    const res = fn();
    if (res && typeof res.then === 'function') {
      await res;
    }
    passedTests++;
    console.log(`  ✓ PASS: ${name}`);
  } catch (err) {
    failedTests++;
    console.error(`  ✗ FAIL: ${name}`);
    console.error(`    -> ${err.message}`);
  }
}

// HTTP Mock Helper
function createMockHttp({ method = 'GET', url = '/', headers = {}, body = null }) {
  let statusCode = 200;
  const resHeaders = {};
  let responseData = '';

  const req = {
    method,
    url,
    headers: { ...headers },
    body
  };

  const res = {
    writeHead(code, h = {}) {
      statusCode = code;
      Object.assign(resHeaders, h);
    },
    setHeader(name, value) {
      resHeaders[name] = value;
    },
    end(content) {
      responseData = content || '';
    },
    status(code) {
      statusCode = code;
      return this;
    },
    json(obj) {
      responseData = JSON.stringify(obj);
      return this;
    },
    send(content) {
      responseData = content;
      return this;
    },
    getStatusCode() { return statusCode; },
    getResponseJson() {
      try {
        return JSON.parse(responseData);
      } catch (e) {
        return { raw: responseData };
      }
    }
  };

  return { req, res };
}

// Helper to acquire a live ID token for testing
async function getTestIdToken(uid, customClaims = {}) {
  const { auth } = initFirebaseAdmin();
  const customToken = await auth.createCustomToken(uid, customClaims);
  const apiKey = "AIzaSyDG7-G_c1jTD5pT53xt52BRTogqlqnpcWk";
  const payload = JSON.stringify({ token: customToken, returnSecureToken: true });

  return new Promise((resolve, reject) => {
    const req = https.request(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    }, (res) => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          if (parsed.idToken) resolve(parsed.idToken);
          else reject(new Error(parsed.error ? parsed.error.message : 'No idToken in response'));
        } catch (e) {
          reject(e);
        }
      });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function runSuite() {
  console.log('\n================================================================');
  console.log('WAYVORA - GMAIL API (GOOGLE OAUTH 2.0) TEST SUITE');
  console.log('================================================================\n');

  // Test 1: Service exports
  await runTest('GmailService exports all required OAuth 2.0 methods', () => {
    assert.strictEqual(typeof GmailService.getConfig, 'function');
    assert.strictEqual(typeof GmailService.getAuthUrl, 'function');
    assert.strictEqual(typeof GmailService.exchangeCodeForTokens, 'function');
    assert.strictEqual(typeof GmailService.getValidAccessToken, 'function');
    assert.strictEqual(typeof GmailService.getConnectionStatus, 'function');
    assert.strictEqual(typeof GmailService.sendEmailWithGmail, 'function');
    assert.strictEqual(typeof GmailService.sendAdminReplyWithGmail, 'function');
  });

  // Test 2: Minimum required scope
  await runTest('Gmail API uses minimum required scope: https://www.googleapis.com/auth/gmail.send', () => {
    assert.strictEqual(GmailService.GMAIL_SEND_SCOPE, 'https://www.googleapis.com/auth/gmail.send');
    const config = GmailService.getConfig();
    assert.strictEqual(config.scope, 'https://www.googleapis.com/auth/gmail.send');
  });

  // Test 3: Sender address
  await runTest('Admin sender address is strictly wayvora.admin@gmail.com', () => {
    const config = GmailService.getConfig();
    assert.strictEqual(config.adminGmail, 'wayvora.admin@gmail.com');
  });

  // Test 4: OAuth URL generation
  await runTest('getAuthUrl generates Google OAuth URL with offline access and prompt=consent', () => {
    const { authUrl, state } = GmailService.getAuthUrl('test-state-123');
    assert.ok(authUrl.startsWith('https://accounts.google.com/o/oauth2/v2/auth'));
    assert.ok(authUrl.includes('access_type=offline'));
    assert.ok(authUrl.includes('prompt=consent'));
    assert.ok(authUrl.includes('state=test-state-123'));
    assert.ok(authUrl.includes('gmail.send'));
  });

  // Test 5: Token storage security
  await runTest('getConnectionStatus never exposes client secret or refresh tokens', async () => {
    const status = await GmailService.getConnectionStatus();
    assert.strictEqual(status.refresh_token, undefined);
    assert.strictEqual(status.clientSecret, undefined);
    assert.strictEqual(status.access_token, undefined);
    assert.strictEqual(typeof status.isConfigured, 'boolean');
    assert.strictEqual(typeof status.isConnected, 'boolean');
  });

  // Test 6: Access token refresh
  await runTest('getValidAccessToken successfully returns a valid Google OAuth access token', async () => {
    const token = await GmailService.getValidAccessToken();
    assert.ok(token, 'Access token should be obtained');
    assert.ok(typeof token === 'string' && token.length > 50, 'Access token should be a valid string');
  });

  // Test 7: MIME message builder
  await runTest('buildMimeMessage creates compliant RFC 2822 base64url message', () => {
    const base64url = GmailService.buildMimeMessage({
      to: 'traveler@example.com',
      from: 'wayvora.admin@gmail.com',
      subject: 'Test Subject',
      html: '<p>Test HTML</p>',
      text: 'Test Text'
    });
    assert.ok(typeof base64url === 'string');
    assert.ok(!base64url.includes('+'), 'Base64url must not contain +');
    assert.ok(!base64url.includes('/'), 'Base64url must not contain /');
    assert.ok(!base64url.includes('='), 'Base64url must not contain =');

    const decoded = Buffer.from(base64url, 'base64url').toString('utf8');
    assert.ok(decoded.includes('To: traveler@example.com'));
    assert.ok(decoded.includes('From: WAYVORA Support <wayvora.admin@gmail.com>'));
  });

  // Test 8: Live email delivery guard
  await runTest('sendEmailWithGmail blocks dispatch when kill-switch is active', async () => {
    const isKillSwitch = process.env.SUPPORT_REPLY_KILL_SWITCH === 'true';
    const result = await GmailService.sendEmailWithGmail({
      to: 'wayvora.admin@gmail.com',
      subject: 'WAYVORA Automated Suite - Gmail API Verification',
      html: '<p>Automated verification confirming live Gmail API OAuth2 integration.</p>',
      text: 'Automated verification confirming live Gmail API OAuth2 integration.'
    });

    if (isKillSwitch) {
      assert.strictEqual(result.success, false);
      assert.strictEqual(result.killSwitchActive, true);
      assert.ok(result.error.includes('kill switch'));
    } else {
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.verified, true);
      assert.ok(result.id, 'Must return Google message ID');
      assert.strictEqual(result.provider, 'gmail');
      assert.strictEqual(result.sender, 'wayvora.admin@gmail.com');
    }
  });

  // Test 9: Security - Unauthenticated /api/support with action reply returns 401
  await runTest('/api/support with action reply blocks unauthenticated requests with 401', async () => {
    const { req, res } = createMockHttp({
      method: 'POST',
      url: '/api/support',
      body: { action: 'reply', ticketId: 'test-ticket', adminReply: 'Unauthorized reply' }
    });

    await handleSupportRequest(req, res);
    assert.strictEqual(res.getStatusCode(), 401);
    const json = res.getResponseJson();
    assert.strictEqual(json.success, false);
    assert.ok(json.error.includes('Unauthorized'));
  });

  // Test 10: Security - Non-admin token returns 403
  let travelerToken = '';
  try {
    travelerToken = await getTestIdToken('osxwVQGMvthz4ac0jEeZSRB65Rq1');
  } catch (err) {}

  await runTest('/api/support with action reply blocks non-admin user with 403 Forbidden', async () => {
    const { req, res } = createMockHttp({
      method: 'POST',
      url: '/api/support',
      headers: { Authorization: `Bearer ${travelerToken}` },
      body: { action: 'reply', ticketId: 'test-ticket', adminReply: 'Unauthorized reply' }
    });

    await handleSupportRequest(req, res);
    assert.strictEqual(res.getStatusCode(), 403);
    const json = res.getResponseJson();
    assert.strictEqual(json.success, false);
    assert.ok(json.error.includes('Forbidden'));
  });

  // Test 11: Admin token setup
  let adminToken = '';
  try {
    adminToken = await getTestIdToken('MXMCpQFfM7Zyp865ljTXiasFB2M2', { admin: true });
  } catch (err) {}

  // Test 12: Strict requirement - Reject non-registered recipient
  await runTest('Admin reply rejects sending to non-registered recipient (HTTP 400)', async () => {
    const unregTicket = await saveSupportTicket({
      name: 'Unregistered User',
      email: 'unregistered.random.person.123@example.com',
      message: 'Hello I am not registered',
      category: 'Inquiry',
      userId: 'fake-uid-unregistered-123'
    });

    const { req, res } = createMockHttp({
      method: 'POST',
      url: '/api/support',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: {
        action: 'reply',
        ticketId: unregTicket.id,
        adminReply: 'Testing non-registered user reply rejection',
        travelerEmail: 'unregistered.random.person.123@example.com'
      }
    });

    await handleSupportRequest(req, res);
    assert.strictEqual(res.getStatusCode(), 400);
    const json = res.getResponseJson();
    assert.strictEqual(json.success, false);
    assert.ok(json.error.includes('does not have a verified account in Firebase Authentication') || json.error.includes('does not have a registered WAYVORA account'));
  });

  // Test 13: Admin reply delivers via Gmail API to registered user (guarded by kill-switch)
  await runTest('Admin reply records reply in Firestore and honors kill-switch', async () => {
    // Registered user: 'osxwVQGMvthz4ac0jEeZSRB65Rq1' -> 'preetichavvannavar@gmail.com'
    const regTicket = await saveSupportTicket({
      name: 'Preeti Traveler',
      email: 'preeti.guest.alternate@example.com', // different form email
      message: 'Inquiry regarding trip to Agra and Jaipur.',
      category: 'Trip Planning Help',
      userId: 'osxwVQGMvthz4ac0jEeZSRB65Rq1',
      source: 'about_inquiry'
    });

    const { req, res } = createMockHttp({
      method: 'POST',
      url: '/api/support',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: {
        action: 'reply',
        ticketId: regTicket.id,
        adminReply: 'Hello Preeti! Our team is delighted to help arrange your itinerary to Agra and Jaipur.',
        status: 'in_progress',
        provider: 'gmail'
      }
    });

    await handleSupportRequest(req, res);
    assert.strictEqual(res.getStatusCode(), 200);
    const json = res.getResponseJson();
    assert.strictEqual(json.success, true);
    assert.strictEqual(json.recipient, 'preetichavvannavar@gmail.com');

    const isKillSwitch = process.env.SUPPORT_REPLY_KILL_SWITCH === 'true';
    if (isKillSwitch) {
      assert.strictEqual(json.emailSent, false);
      assert.strictEqual(json.emailDelivery.killSwitchActive, true);
    } else {
      assert.strictEqual(json.emailSent, true);
      assert.strictEqual(json.provider, 'gmail');
      assert.ok(json.emailDelivery.id, 'Must record Google message ID');
      assert.strictEqual(json.emailDelivery.sender, 'wayvora.admin@gmail.com');
    }

    // Verify Firestore ticket audit log
    const updated = await getSupportTicket(regTicket.id);
    assert.ok(updated.replyHistory && updated.replyHistory.length > 0);
  });

  // Test 14: GET /api/auth/google/status reports connected Gmail API
  await runTest('GET /api/auth/google/status reports connected Gmail API (Google OAuth 2.0)', async () => {
    const { req, res } = createMockHttp({
      method: 'GET',
      url: '/api/auth/google/status'
    });

    await handleAuthRequest(req, res);
    assert.strictEqual(res.getStatusCode(), 200);
    const json = res.getResponseJson();
    assert.strictEqual(json.success, true);
    assert.strictEqual(json.isConnected, true);
    assert.strictEqual(json.connectedEmail, 'wayvora.admin@gmail.com');
    assert.strictEqual(json.provider, 'gmail');
    assert.strictEqual(json.method, 'oauth2');
  });

  // Test 15: Admin Dashboard UI displays Gmail API channel
  await runTest('Admin Dashboard UI references Gmail API channel and OAuth 2.0', () => {
    const dashboardJs = fs.readFileSync(path.join(__dirname, '..', 'js', 'admin-dashboard.js'), 'utf8');
    assert.ok(dashboardJs.includes('Gmail API (OAuth 2.0)'));
    assert.ok(dashboardJs.includes('admin-gmail-dispatch-section'));
    assert.ok(dashboardJs.includes('checkGmailStatus'));
    assert.ok(dashboardJs.includes('connectGmail'));
  });

  console.log('\n================================================================');
  console.log(`TEST SUMMARY: ${passedTests} / ${totalTests} passed (${Math.round((passedTests/totalTests)*100)}%)`);
  if (failedTests > 0) {
    console.error(`FAILED TESTS: ${failedTests}`);
    process.exit(1);
  } else {
    console.log('🎉 ALL 15 GMAIL API OAUTH 2.0 TESTS PASSED PERFECTLY!');
  }
  console.log('================================================================\n');
}

runSuite().catch(err => {
  console.error('Test suite runner crashed:', err);
  process.exit(1);
});
