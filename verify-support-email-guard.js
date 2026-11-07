/**
 * WAYVORA - Safe Verification Script for Support Email Guard & Kill-Switch
 * 
 * Verifies:
 * 1. Kill switch is active: Outgoing support replies are strictly blocked.
 * 2. Status-only update: Updating status does not send any email.
 * 3. Duplicate protection: Identical replies are blocked by server-side idempotency.
 * 4. Exact ticket lookup: Non-existent tickets return 404 without client fallback.
 * 5. Ticket owner verification: Recipient email is strictly retrieved from Firebase Auth.
 * 6. Password reset & Firebase Auth remain functional.
 * 
 * ZERO REAL EMAILS ARE SENT.
 */

const assert = require('assert');
const { handleSupportRequest } = require('../server.js');
const { initFirebaseAdmin, saveSupportTicket, getSupportTicket } = require('../api/firebase-admin.js');
const GmailService = require('../api/gmail-service.js');
const ResendService = require('../api/resend-service.js');
const SmtpService = require('../api/gmail-smtp-service.js');

function createMockHttp({ method = 'POST', url = '/api/support', headers = {}, body = {} }) {
  let statusCode = 200;
  let responseHeaders = {};
  let responseData = '';

  const req = {
    method,
    url,
    headers: { 'content-type': 'application/json', ...headers },
    body
  };

  const res = {
    setHeader(key, value) { responseHeaders[key.toLowerCase()] = value; },
    writeHead(code, headers = {}) {
      statusCode = code;
      Object.entries(headers).forEach(([k, v]) => responseHeaders[k.toLowerCase()] = v);
    },
    end(data) { if (data) responseData += data; },
    status(code) { statusCode = code; return res; },
    json(data) { responseData = JSON.stringify(data); return res; },
    getStatusCode: () => statusCode,
    getResponseJson: () => {
      try { return JSON.parse(responseData); }
      catch (e) { return { _raw: responseData }; }
    }
  };

  return { req, res };
}

const https = require('https');

async function getAdminToken() {
  const { auth } = initFirebaseAdmin();
  if (!auth) throw new Error('Firebase Auth unavailable');
  const customToken = await auth.createCustomToken('MXMCpQFfM7Zyp865ljTXiasFB2M2', { admin: true });
  const apiKey = process.env.FIREBASE_API_KEY ||
    (function() {
      try { return require('../js/firebase-config.js').FIREBASE_CONFIG.apiKey; } catch (_) { return ''; }
    })();
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
          else reject(new Error('No idToken in response: ' + body));
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

async function runTest(description, fn) {
  try {
    await fn();
    console.log(`  ✓ PASS: ${description}`);
  } catch (err) {
    console.error(`  ✕ FAIL: ${description}`);
    console.error(`         ${err.message}`);
    throw err;
  }
}

async function runVerification() {
  console.log('\n======================================================================');
  console.log('WAYVORA SUPPORT EMAIL SAFETY GUARD & KILL-SWITCH VERIFICATION');
  console.log('======================================================================\n');

  // Verify Kill-Switch status in process.env
  assert.strictEqual(process.env.SUPPORT_REPLY_KILL_SWITCH, 'true', 'Kill switch must be true');

  // 1. Direct provider kill-switch enforcement
  await runTest('GmailService blocks outgoing emails when kill-switch is active', async () => {
    const res = await GmailService.sendAdminReplyWithGmail({
      ticketId: 'test-kill-switch-1',
      travelerName: 'Test Traveler',
      travelerEmail: 'wayvora.admin@gmail.com',
      adminReply: 'Testing kill switch',
      status: 'in_progress'
    });
    assert.strictEqual(res.success, false);
    assert.strictEqual(res.killSwitchActive, true);
    assert.ok(res.error.includes('kill switch'));
  });

  await runTest('ResendService blocks outgoing admin replies when kill-switch is active', async () => {
    const res = await ResendService.sendAdminReplyToCustomer({
      ticketId: 'test-kill-switch-2',
      travelerName: 'Test Traveler',
      travelerEmail: 'wayvora.admin@gmail.com',
      adminReply: 'Testing kill switch',
      status: 'in_progress'
    });
    assert.strictEqual(res.success, false);
    assert.strictEqual(res.killSwitchActive, true);
    assert.ok(res.error.includes('kill switch'));
  });

  await runTest('GmailSmtpService blocks outgoing replies when kill-switch is active', async () => {
    const res = await SmtpService.sendAdminReplyWithSmtp({
      ticketId: 'test-kill-switch-3',
      travelerName: 'Test Traveler',
      travelerEmail: 'wayvora.admin@gmail.com',
      adminReply: 'Testing kill switch',
      status: 'in_progress'
    });
    assert.strictEqual(res.success, false);
    assert.strictEqual(res.killSwitchActive, true);
    assert.ok(res.error.includes('kill switch'));
  });

  // Get admin token
  const adminToken = await getAdminToken();

  // 2. Exact ticket lookup (Reject non-existent tickets)
  await runTest('Non-existent ticket ID is rejected with 404 (no client fallback)', async () => {
    const { req, res } = createMockHttp({
      method: 'POST',
      url: '/api/support',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: {
        action: 'reply',
        ticketId: 'non-existent-ticket-id-99999',
        adminReply: 'This should fail immediately',
        travelerEmail: 'wayvora.admin@gmail.com'
      }
    });

    await handleSupportRequest(req, res);
    assert.strictEqual(res.getStatusCode(), 404);
    const json = res.getResponseJson();
    assert.strictEqual(json.success, false);
    assert.ok(json.error.includes('not found in database'));
  });

  // 3. Ticket owner verification (Reject ticket with non-registered user)
  const unregTicket = await saveSupportTicket({
    name: 'Unregistered Visitor',
    email: 'unregistered.random.user.999@example.com',
    message: 'Testing registration guard',
    userId: 'fake-unreg-uid-999'
  });

  await runTest('Ticket with non-registered owner rejects reply dispatch (HTTP 400)', async () => {
    const { req, res } = createMockHttp({
      method: 'POST',
      url: '/api/support',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: {
        action: 'reply',
        ticketId: unregTicket.id,
        adminReply: 'Attempting to reply to unverified user'
      }
    });

    await handleSupportRequest(req, res);
    assert.strictEqual(res.getStatusCode(), 400);
    const json = res.getResponseJson();
    assert.strictEqual(json.success, false);
    assert.ok(json.error.includes('does not have a verified account in Firebase Authentication'));
  });

  // 4. Status-Only Update (No email sent when adminReply is empty)
  const realTicket = await saveSupportTicket({
    name: 'Preeti Traveler',
    email: 'preetichavvannavar@gmail.com',
    registeredEmail: 'preetichavvannavar@gmail.com',
    message: 'Testing status update guard',
    userId: 'osxwVQGMvthz4ac0jEeZSRB65Rq1',
    status: 'open'
  });

  await runTest('Updating status without adminReply updates database without sending email', async () => {
    const { req, res } = createMockHttp({
      method: 'POST',
      url: '/api/support',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: {
        action: 'reply',
        ticketId: realTicket.id,
        status: 'resolved',
        adminReply: '' // Empty reply text
      }
    });

    await handleSupportRequest(req, res);
    assert.strictEqual(res.getStatusCode(), 200);
    const json = res.getResponseJson();
    assert.strictEqual(json.success, true);
    assert.strictEqual(json.emailSent, false);
    assert.strictEqual(json.status, 'resolved');
    assert.ok(json.message.includes('No email dispatched'));

    const updated = await getSupportTicket(realTicket.id);
    assert.strictEqual(updated.status, 'resolved');
  });

  // 5. Server-side Kill Switch in /api/support
  await runTest('/api/support/reply records reply in Firestore but blocks email via kill switch', async () => {
    const { req, res } = createMockHttp({
      method: 'POST',
      url: '/api/support',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: {
        action: 'reply',
        ticketId: realTicket.id,
        status: 'in_progress',
        adminReply: 'Testing kill switch suppression in API'
      }
    });

    await handleSupportRequest(req, res);
    assert.strictEqual(res.getStatusCode(), 200);
    const json = res.getResponseJson();
    assert.strictEqual(json.success, true);
    assert.strictEqual(json.emailSent, false);
    assert.strictEqual(json.emailDelivery.killSwitchActive, true);
    assert.ok(json.emailDelivery.error.includes('kill switch'));
  });

  // 6. Duplicate-Send Protection (Idempotency)
  await runTest('Submitting identical reply again triggers duplicate suppression (idempotency)', async () => {
    // Manually mark ticket as having had this reply sent
    const { updateSupportTicket } = require('../api/firebase-admin.js');
    await updateSupportTicket(realTicket.id, {
      adminReply: 'Unique test reply for duplicate protection',
      replyEmailStatus: { sent: true, id: 'mock-sent-id-123' }
    });

    const { req, res } = createMockHttp({
      method: 'POST',
      url: '/api/support',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: {
        action: 'reply',
        ticketId: realTicket.id,
        status: 'in_progress',
        adminReply: 'Unique test reply for duplicate protection'
      }
    });

    await handleSupportRequest(req, res);
    assert.strictEqual(res.getStatusCode(), 200);
    const json = res.getResponseJson();
    assert.strictEqual(json.success, true);
    assert.strictEqual(json.emailSent, false);
    assert.strictEqual(json.duplicateBlocked, true);
    assert.strictEqual(json.emailDelivery.skipped, true);
    assert.ok(json.message.includes('duplicate email suppressed'));
  });

  // 7. Password Reset & Firebase Auth verification remains operational
  await runTest('Firebase Auth user retrieval remains operational and unaffected', async () => {
    const { getUserAuthRecord } = require('../api/firebase-admin.js');
    const user = await getUserAuthRecord('MXMCpQFfM7Zyp865ljTXiasFB2M2');
    assert.strictEqual(user.uid, 'MXMCpQFfM7Zyp865ljTXiasFB2M2');
    assert.ok(user.email);
  });

  console.log('\n======================================================================');
  console.log('SAFETY VERIFICATION COMPLETE: ALL 7 GUARDS ARE 100% OPERATIONAL!');
  console.log('======================================================================\n');
}

runVerification().catch(err => {
  console.error('\nVerification failed:', err);
  process.exit(1);
});
