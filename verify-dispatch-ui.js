/**
 * Verification test for Gmail Support Dispatch UI and Backend Integration
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const http = require('http');

console.log('========================================================');
console.log('VERIFYING GMAIL SUPPORT DISPATCH SECTION & INTEGRATION');
console.log('========================================================\n');

// 1. Verify CSS rules in css/components.css
const css = fs.readFileSync(path.join(__dirname, '..', 'css', 'components.css'), 'utf8');
assert.ok(css.includes('.admin-dispatch-section'), 'Missing .admin-dispatch-section CSS');
assert.ok(css.includes('.btn-dispatch-test'), 'Missing .btn-dispatch-test CSS');
assert.ok(css.includes('.btn-dispatch-disconnect'), 'Missing .btn-dispatch-disconnect CSS');
assert.ok(css.includes('.btn-dispatch-connect'), 'Missing .btn-dispatch-connect CSS');
assert.ok(css.includes('.admin-test-feedback'), 'Missing .admin-test-feedback CSS');
console.log('  ✓ CSS rules for Gmail Support Dispatch section verified in css/components.css');

// 2. Verify DOM elements in js/admin-dashboard.js
const js = fs.readFileSync(path.join(__dirname, '..', 'js', 'admin-dashboard.js'), 'utf8');
assert.ok(js.includes('admin-gmail-dispatch-section'), 'Missing admin-gmail-dispatch-section ID');
assert.ok(js.includes('Gmail Support Dispatch'), 'Missing "Gmail Support Dispatch" title');
assert.ok(js.includes('admin-gmail-connected-email'), 'Missing admin-gmail-connected-email element');
assert.ok(js.includes('admin-gmail-badge'), 'Missing admin-gmail-badge element');
assert.ok(js.includes('btn-gmail-test'), 'Missing btn-gmail-test element');
assert.ok(js.includes('btn-gmail-disconnect'), 'Missing btn-gmail-disconnect element');
assert.ok(js.includes('admin-gmail-test-banner'), 'Missing admin-gmail-test-banner element');
assert.ok(js.includes('btn-dispatch-test'), 'Missing btn-dispatch-test class');
assert.ok(js.includes('btn-dispatch-disconnect'), 'Missing btn-dispatch-disconnect class');
console.log('  ✓ DOM template and dynamic bindings verified in js/admin-dashboard.js');

// 3. Verify live status from port 5500
const req = http.request({
  hostname: '127.0.0.1',
  port: 5500,
  path: '/api/auth/google/status',
  method: 'GET'
}, (res) => {
  let body = '';
  res.on('data', c => body += c);
  res.on('end', () => {
    assert.strictEqual(res.statusCode, 200, 'Status endpoint returned HTTP ' + res.statusCode);
    const data = JSON.parse(body);
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.isConfigured, true);
    assert.strictEqual(data.isConnected, true);
    assert.strictEqual(data.connectedEmail, 'wayvora.admin@gmail.com');
    assert.strictEqual(data.scope, 'https://www.googleapis.com/auth/gmail.send');
    console.log(`  ✓ Live Status Endpoint: isConnected = ${data.isConnected}, connectedEmail = ${data.connectedEmail}`);
    console.log('\n========================================================');
    console.log('🎉 ALL GMAIL SUPPORT DISPATCH UI VERIFICATIONS PASSED!');
    console.log('========================================================\n');
    process.exit(0);
  });
});

req.on('error', (err) => {
  console.error('Failed to query port 5500:', err.message);
  process.exit(1);
});

req.end();
