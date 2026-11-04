const http = require('http');
const assert = require('assert');

function httpGet(path) {
  return new Promise((resolve, reject) => {
    http.get(`http://127.0.0.1:5500${path}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, raw: data });
        }
      });
    }).on('error', reject);
  });
}

function httpPost(path, body = {}, headers = {}) {
  const payload = JSON.stringify(body);
  return new Promise((resolve, reject) => {
    const req = http.request(`http://127.0.0.1:5500${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
        ...headers
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, raw: data });
        }
      });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function runTests() {
  console.log('--- TESTING CONSOLIDATED ROUTES ON HTTP SERVER ---');

  // 1. /api/auth/google/status
  const statusRes = await httpGet('/api/auth/google/status');
  console.log('1. GET /api/auth/google/status:', statusRes.status, statusRes.body?.channel || statusRes.body?.provider);
  assert.strictEqual(statusRes.status, 200);
  assert.strictEqual(statusRes.body.success, true);
  assert.strictEqual(statusRes.body.isConnected, true);

  // 2. /api/auth/google/url
  const urlRes = await httpGet('/api/auth/google/url');
  console.log('2. GET /api/auth/google/url:', urlRes.status, urlRes.body?.authUrl?.slice(0, 40) + '...');
  assert.strictEqual(statusRes.status, 200);
  assert.ok(urlRes.body.authUrl);

  // 3. /api/auth/status
  const authStatusRes = await httpGet('/api/auth/status');
  console.log('3. GET /api/auth/status:', authStatusRes.status, authStatusRes.body?.channel);
  assert.strictEqual(authStatusRes.status, 200);
  assert.strictEqual(authStatusRes.body.isConnected, true);

  // 4. /api/weather?location=Goa
  const weatherRes = await httpGet('/api/weather?location=Goa');
  console.log('4. GET /api/weather?location=Goa:', weatherRes.status, weatherRes.body?.place, weatherRes.body?.tempC + '°C');
  assert.strictEqual(weatherRes.status, 200);
  assert.ok(weatherRes.body.place || weatherRes.body.tempC !== undefined);

  // 5. /api/currency
  const currencyRes = await httpGet('/api/currency');
  console.log('5. GET /api/currency:', currencyRes.status, 'Rates available:', !!currencyRes.body?.rates);
  assert.strictEqual(currencyRes.status, 200);
  assert.ok(currencyRes.body.rates);

  // 6. /api/support unauthenticated should return 401
  const supportUnauth = await httpPost('/api/support', { name: 'Test', email: 'test@example.com', message: 'Hi' });
  console.log('6. POST /api/support (unauth):', supportUnauth.status, supportUnauth.body?.error);
  assert.strictEqual(supportUnauth.status, 401);

  // 7. /api/support/reply unauthenticated should return 401
  const replyUnauth = await httpPost('/api/support/reply', { ticketId: 'test-123', adminReply: 'Hi' });
  console.log('7. POST /api/support/reply (unauth):', replyUnauth.status, replyUnauth.body?.error);
  assert.strictEqual(replyUnauth.status, 401);

  // 8. /api/chat POST
  const chatRes = await httpPost('/api/chat', { message: 'Hello' });
  console.log('8. POST /api/chat:', chatRes.status, 'Reply received:', !!chatRes.body?.reply);
  assert.strictEqual(chatRes.status, 200);
  assert.ok(chatRes.body.reply);

  console.log('\n🎉 ALL 8 CONSOLIDATED ENDPOINTS RETURNED EXPECTED STATUSES AND DATA!\n');
}

runTests().catch(err => {
  console.error('Route tests failed:', err);
  process.exit(1);
});
