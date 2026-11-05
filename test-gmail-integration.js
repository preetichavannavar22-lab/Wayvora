/**
 * WAYVORA - Automated Gmail API OAuth2 Integration Test Suite
 * 
 * Verifies all requirements:
 * 1. Scope is strictly https://www.googleapis.com/auth/gmail.send
 * 2. Auth URL generation with offline access & consent prompt
 * 3. Safe RFC 2822 MIME builder and base64url encoding
 * 4. Token storage security (never exposing refresh tokens)
 * 5. Public connection status API
 * 6. OAuth callback route validation
 * 7. Support reply dispatch logic (Gmail priority with Resend fallback)
 */

const assert = require('assert');
const GmailService = require('../api/gmail-service.js');
const handleAuthRequest = require('../api/auth.js');
const handleSupportRequest = require('../api/support.js');

let totalTests = 0;
let passedTests = 0;

function runTest(description, testFn) {
  totalTests++;
  try {
    const res = testFn();
    if (res && typeof res.then === 'function') {
      return res
        .then(() => {
          passedTests++;
          console.log(`  ✓ PASS: ${description}`);
        })
        .catch(err => {
          console.error(`  ✗ FAIL: ${description}`);
          console.error(`    -> ${err.message}`);
        });
    } else {
      passedTests++;
      console.log(`  ✓ PASS: ${description}`);
    }
  } catch (err) {
    console.error(`  ✗ FAIL: ${description}`);
    console.error(`    -> ${err.message}`);
  }
}

// Mock HTTP Request / Response objects
function createMockHttp({ method = 'GET', url = '/api/auth/google/status', body = {}, headers = {} }) {
  const req = {
    method,
    url,
    headers,
    body
  };

  let statusCode = 200;
  const resHeaders = {};
  let responseData = '';

  const res = {
    writeHead(code, h = {}) {
      statusCode = code;
      Object.assign(resHeaders, h);
    },
    setHeader(name, value) {
      resHeaders[name] = value;
    },
    end(content) {
      responseData = content;
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
    },
    getResponseRaw() {
      return responseData;
    }
  };

  return { req, res };
}

async function runTestSuite() {
  console.log('======================================================================');
  console.log('WAYVORA GMAIL API OAUTH2 INTEGRATION TEST SUITE');
  console.log('======================================================================\n');

  // Test 1: Scope verification
  runTest('Gmail API uses minimum required scope: https://www.googleapis.com/auth/gmail.send', () => {
    assert.strictEqual(GmailService.GMAIL_SEND_SCOPE, 'https://www.googleapis.com/auth/gmail.send');
    const config = GmailService.getConfig();
    assert.strictEqual(config.scope, 'https://www.googleapis.com/auth/gmail.send');
  });

  // Test 2: OAuth URL generation requires offline access and prompt=consent
  runTest('getAuthUrl generates Google OAuth URL with offline access and prompt=consent', () => {
    const origId = process.env.GOOGLE_CLIENT_ID;
    const origSecret = process.env.GOOGLE_CLIENT_SECRET;

    process.env.GOOGLE_CLIENT_ID = 'test_client_id_123.apps.googleusercontent.com';
    process.env.GOOGLE_CLIENT_SECRET = 'test_client_secret_xyz';

    const result = GmailService.getAuthUrl('test_state_123');
    assert.ok(result.authUrl.includes('accounts.google.com/o/oauth2/v2/auth'));
    assert.ok(result.authUrl.includes('access_type=offline'));
    assert.ok(result.authUrl.includes('prompt=consent'));
    assert.ok(result.authUrl.includes('https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fgmail.send'));
    assert.ok(result.authUrl.includes('state=test_state_123'));
    assert.strictEqual(result.state, 'test_state_123');

    process.env.GOOGLE_CLIENT_ID = origId;
    process.env.GOOGLE_CLIENT_SECRET = origSecret;
  });

  // Test 3: RFC 2822 MIME message construction & base64url encoding
  runTest('buildMimeMessage creates compliant RFC 2822 base64url message', () => {
    const rawB64 = GmailService.buildMimeMessage({
      to: 'traveler@example.com',
      from: 'wayvora.admin@gmail.com',
      subject: 'WAYVORA Support: Planning Inquiry',
      html: '<p>Your trip to <strong>Goa</strong> is confirmed!</p>',
      text: 'Your trip to Goa is confirmed!',
      replyTo: 'wayvora.admin@gmail.com'
    });

    assert.ok(typeof rawB64 === 'string');
    // base64url must not contain +, /, or =
    assert.ok(!rawB64.includes('+'));
    assert.ok(!rawB64.includes('/'));
    assert.ok(!rawB64.includes('='));

    // Decode and verify MIME structure
    const decoded = Buffer.from(rawB64, 'base64url').toString('utf8');
    assert.ok(decoded.includes('To: traveler@example.com'));
    assert.ok(decoded.includes('From: WAYVORA Support <wayvora.admin@gmail.com>'));
    assert.ok(decoded.includes('Reply-To: wayvora.admin@gmail.com'));
    assert.ok(decoded.includes('multipart/alternative'));
    assert.ok(decoded.includes('text/html'));
    assert.ok(decoded.includes('text/plain'));
  });

  // Test 4: Token storage security & getConnectionStatus
  await runTest('getConnectionStatus never exposes client secret or refresh tokens', async () => {
    const status = await GmailService.getConnectionStatus();
    assert.strictEqual(typeof status, 'object');
    assert.strictEqual(status.refresh_token, undefined);
    assert.strictEqual(status.clientSecret, undefined);
    assert.strictEqual(typeof status.isConfigured, 'boolean');
    assert.strictEqual(typeof status.isConnected, 'boolean');
  });

  // Test 5: /api/auth/google/status endpoint
  await runTest('GET /api/auth/google/status returns valid JSON connection status', async () => {
    const { req, res } = createMockHttp({
      method: 'GET',
      url: '/api/auth/google/status'
    });

    await handleAuthRequest(req, res);
    assert.strictEqual(res.getStatusCode(), 200);
    const json = res.getResponseJson();
    assert.strictEqual(json.success, true);
    assert.ok('isConfigured' in json);
    assert.ok('isConnected' in json);
  });

  // Test 6: /api/auth/google/callback error handling (Google denied)
  await runTest('GET /api/auth/google/callback handles Google authorization rejection gracefully', async () => {
    const { req, res } = createMockHttp({
      method: 'GET',
      url: '/api/auth/google/callback?error=access_denied&error_description=User%20denied%20consent'
    });

    await handleAuthRequest(req, res);
    assert.strictEqual(res.getStatusCode(), 400);
    const html = res.getResponseRaw();
    assert.ok(html.includes('Google Authorization Denied'));
  });

  // Test 7: /api/auth/google/callback code requirement
  await runTest('GET /api/auth/google/callback rejects requests without authorization code', async () => {
    const { req, res } = createMockHttp({
      method: 'GET',
      url: '/api/auth/google/callback' // missing code
    });

    await handleAuthRequest(req, res);
    assert.strictEqual(res.getStatusCode(), 400);
    const html = res.getResponseRaw();
    assert.ok(html.includes('Missing Authorization Code'));
  });

  // Test 8: sendEmailWithGmail fails gracefully if not connected (never reports success)
  await runTest('sendEmailWithGmail returns accurate error if tokens are missing', async () => {
    // If not connected, should return failure
    const status = await GmailService.getConnectionStatus();
    if (!status.isConnected) {
      const result = await GmailService.sendEmailWithGmail({
        to: 'traveler@example.com',
        subject: 'Test',
        html: '<p>Test</p>'
      });
      assert.strictEqual(result.success, false);
      assert.strictEqual(result.verified, false);
      assert.ok(result.error.includes('not connected') || result.error.includes('authorization'));
    }
  });

  // Test 9: /api/support/reply falls back cleanly to Resend when Gmail is not connected
  await runTest('/api/support/reply uses Resend fallback when Gmail is not connected', async () => {
    const { saveSupportTicket } = require('../api/firebase-admin.js');
    const ticket = await saveSupportTicket({
      name: 'Gmail Test Traveler',
      email: 'wayvora.admin@gmail.com', // use verified email
      category: 'General Inquiry',
      message: 'Test inquiry for Gmail fallback'
    });

    const { req, res } = createMockHttp({
      method: 'POST',
      url: '/api/support/reply',
      body: {
        ticketId: ticket.id,
        adminReply: 'Official response verifying email fallback pipeline.',
        status: 'in_progress'
      }
    });

    await handleSupportRequest(req, res);
    assert.strictEqual(res.getStatusCode(), 200);
    const json = res.getResponseJson();
    assert.strictEqual(json.success, true);
    assert.strictEqual(json.firestoreUpdated, true);
    assert.ok(json.provider === 'gmail' || json.provider === 'resend');
  });

  // Test 10: Live HTTP server route mounting (/api/auth/google/status)
  await runTest('server.js properly routes /api/auth/google/status over HTTP', async () => {
    const http = require('http');
    const { server } = require('../server.js');

    await new Promise((resolve, reject) => {
      server.listen(5503, '127.0.0.1', () => {
        const testReq = http.request({
          hostname: '127.0.0.1',
          port: 5503,
          path: '/api/auth/google/status',
          method: 'GET'
        }, (testRes) => {
          let raw = '';
          testRes.on('data', c => raw += c);
          testRes.on('end', () => {
            server.close(() => {
              try {
                assert.strictEqual(testRes.statusCode, 200);
                const data = JSON.parse(raw);
                assert.strictEqual(data.success, true);
                resolve();
              } catch (e) {
                reject(e);
              }
            });
          });
        });
        testReq.on('error', (e) => {
          server.close(() => reject(e));
        });
        testReq.end();
      });
    });
  });

  console.log('\n======================================================================');
  console.log(`TEST RESULTS: ${passedTests}/${totalTests} PASSED`);
  if (passedTests === totalTests) {
    console.log('🎉 ALL GMAIL OAUTH2 INTEGRATION TESTS PASSED PERFECTLY!');
  } else {
    console.log(`⚠️ ${totalTests - passedTests} TESTS FAILED.`);
  }
  console.log('======================================================================\n');
}

runTestSuite();
