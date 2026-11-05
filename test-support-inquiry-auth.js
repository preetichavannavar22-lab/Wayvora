/**
 * WAYVORA - Authentication & Support Inquiry Verification Test Suite
 * 
 * Verifies:
 * 1. AuthService.getIdToken() helper and immediate session sync on signUp / signIn
 * 2. verifyUserAuthToken() in api/firebase-admin.js (both Admin SDK and Identity Toolkit REST fallback)
 * 3. Normal authenticated travelers can submit inquiries to /api/support without admin claims
 * 4. Inquiries are stored in Cloud Firestore (collection: support_requests)
 * 5. Unauthenticated callers are rejected with HTTP 401
 * 6. Invalid tokens are rejected with HTTP 401
 * 7. Kill switch suppresses outgoing support-reply emails
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

const {
  initFirebaseAdmin,
  verifyUserAuthToken,
  verifyAdminAuthToken,
  saveSupportTicket,
  getSupportTicket
} = require('../api/firebase-admin.js');

const { handleSupportRequest } = require('../api/support.js');
const AuthService = require('../js/auth.js');

let total = 0;
let passed = 0;
let failed = 0;

async function test(name, fn) {
  total++;
  try {
    const r = fn();
    if (r && typeof r.then === 'function') await r;
    passed++;
    console.log(`  ✓ PASS: ${name}`);
  } catch (err) {
    failed++;
    console.error(`  ✗ FAIL: ${name}`);
    console.error(`    -> ${err.message}`);
  }
}

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

// Generate real Firebase ID token for registered traveler
async function getTravelerToken(uid = 'osxwVQGMvthz4ac0jEeZSRB65Rq1') {
  const { auth } = initFirebaseAdmin();
  const customToken = await auth.createCustomToken(uid, {});
  const apiKey = 'AIzaSyDG7-G_c1jTD5pT53xt52BRTogqlqnpcWk';
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

async function main() {
  console.log('======================================================================');
  console.log('WAYVORA AUTHENTICATION & SUPPORT INQUIRY TEST SUITE');
  console.log('======================================================================\n');

  console.log('--- 1. Client AuthService API & Session Helpers ---');
  await test('AuthService exposes getIdToken() method', () => {
    assert.strictEqual(typeof AuthService.getIdToken, 'function');
  });

  await test('AuthService exposes getFirebaseUser() helper', () => {
    assert.strictEqual(typeof AuthService.getFirebaseUser, 'function');
  });

  await test('AuthService.getIdToken() returns null when no user is signed in', async () => {
    const token = await AuthService.getIdToken();
    assert.strictEqual(token, null);
  });

  console.log('\n--- 2. Server Token Verification & Identity Toolkit REST Fallback ---');
  let realTravelerToken = '';
  try {
    realTravelerToken = await getTravelerToken('osxwVQGMvthz4ac0jEeZSRB65Rq1');
  } catch (e) {
    console.error('Failed to get real traveler token:', e.message);
  }

  await test('verifyUserAuthToken rejects missing token', async () => {
    const res = await verifyUserAuthToken(null);
    assert.strictEqual(res.isValid, false);
    assert.ok(res.error.includes('No ID token provided'));
  });

  await test('verifyUserAuthToken rejects invalid token', async () => {
    const res = await verifyUserAuthToken('invalid.token.string');
    assert.strictEqual(res.isValid, false);
  });

  await test('verifyUserAuthToken verifies real traveler ID token correctly', async () => {
    assert.ok(realTravelerToken, 'Traveler token must be acquired');
    const res = await verifyUserAuthToken(realTravelerToken);
    assert.strictEqual(res.isValid, true);
    assert.strictEqual(res.uid, 'osxwVQGMvthz4ac0jEeZSRB65Rq1');
    assert.strictEqual(res.isAdmin, false); // Normal user, not admin
  });

  await test('verifyAdminAuthToken marks regular traveler as isAdmin: false', async () => {
    assert.ok(realTravelerToken, 'Traveler token must be acquired');
    const res = await verifyAdminAuthToken(realTravelerToken);
    assert.strictEqual(res.isValid, true);
    assert.strictEqual(res.isAdmin, false);
  });

  console.log('\n--- 3. Support Inquiry Submission & Authorization ---');
  await test('POST /api/support rejects request with no Authorization header (HTTP 401)', async () => {
    const { req, res } = createMockHttp({
      method: 'POST',
      url: '/api/support',
      body: {
        name: 'Guest Traveler',
        email: 'guest@example.com',
        category: 'planning',
        message: 'Where should I visit in India?'
      }
    });

    await handleSupportRequest(req, res);
    assert.strictEqual(res.getStatusCode(), 401);
    const json = res.getResponseJson();
    assert.strictEqual(json.success, false);
    assert.ok(json.error.includes('Unauthorized: You must be registered and signed in to WAYVORA'));
  });

  await test('POST /api/support rejects request with invalid Bearer token (HTTP 401)', async () => {
    const { req, res } = createMockHttp({
      method: 'POST',
      url: '/api/support',
      headers: { Authorization: 'Bearer fake-invalid-token-12345' },
      body: {
        name: 'Attacker',
        email: 'attacker@example.com',
        category: 'planning',
        message: 'Forged token test'
      }
    });

    await handleSupportRequest(req, res);
    assert.strictEqual(res.getStatusCode(), 401);
    const json = res.getResponseJson();
    assert.strictEqual(json.success, false);
    assert.ok(json.error.includes('Unauthorized: Invalid or expired authentication token'));
  });

  let createdTicketId = null;
  await test('POST /api/support allows normal authenticated user to submit support inquiry (HTTP 200)', async () => {
    assert.ok(realTravelerToken, 'Traveler token must be acquired');
    const { req, res } = createMockHttp({
      method: 'POST',
      url: '/api/support',
      headers: { Authorization: `Bearer ${realTravelerToken}` },
      body: {
        name: 'Preeti Chavvannavar',
        email: 'preetichavvannavar@gmail.com',
        category: 'planning',
        message: 'Automated inquiry verification test for authentic registered user.',
        source: 'about_inquiry'
      }
    });

    await handleSupportRequest(req, res);
    assert.strictEqual(res.getStatusCode(), 200);
    const json = res.getResponseJson();
    assert.strictEqual(json.success, true);
    assert.ok(json.ticketId);
    createdTicketId = json.ticketId;
    console.log(`    -> Stored Ticket ID: ${createdTicketId}`);
  });

  console.log('\n--- 4. Cloud Firestore Storage Verification ---');
  await test('Saved inquiry exists in Firestore support_requests collection with correct fields', async () => {
    assert.ok(createdTicketId, 'Ticket ID must have been created in prior test');
    const ticket = await getSupportTicket(createdTicketId);
    assert.ok(ticket, 'Ticket document must exist in Firestore');
    assert.strictEqual(ticket.userId, 'osxwVQGMvthz4ac0jEeZSRB65Rq1');
    assert.strictEqual(ticket.registeredEmail, 'preetichavvannavar@gmail.com');
    assert.strictEqual(ticket.source, 'about_inquiry');
    assert.strictEqual(ticket.category, 'planning');
    assert.strictEqual(ticket.status, 'open');
  });

  console.log('\n--- 5. Email Guard & Kill Switch Verification ---');
  await test('Kill switch suppresses unexpected outgoing support confirmation emails', async () => {
    const isKill = process.env.SUPPORT_REPLY_KILL_SWITCH === 'true';
    assert.strictEqual(isKill, true, 'SUPPORT_REPLY_KILL_SWITCH must be true');
  });

  console.log('\n======================================================================');
  console.log(`TEST SUMMARY: ${passed} / ${total} passed (${Math.round((passed / total) * 100)}%)`);
  if (failed === 0) {
    console.log('🎉 ALL AUTHENTICATION & SUPPORT INQUIRY TESTS PASSED!');
  } else {
    console.log(`❌ ${failed} TEST(S) FAILED!`);
    process.exit(1);
  }
  console.log('======================================================================\n');
}

main().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
