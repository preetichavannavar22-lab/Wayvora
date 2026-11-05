const http = require('http');

console.log('--- DIAGNOSTIC SCRIPT START ---');

// Check port 5500
const req = http.request({
  hostname: '127.0.0.1',
  port: 5500,
  path: '/api/auth/google/status',
  method: 'GET',
  timeout: 3000
}, (res) => {
  let body = '';
  res.on('data', c => body += c);
  res.on('end', () => {
    console.log(`Port 5500 Status: HTTP ${res.statusCode}`);
    console.log(`Body: ${body}`);
    testCallback();
  });
});

req.on('error', (err) => {
  console.log(`Port 5500 is NOT reachable: ${err.message}`);
  testCallback();
});

req.on('timeout', () => {
  console.log('Port 5500 timed out!');
  req.destroy();
  testCallback();
});

req.end();

function testCallback() {
  const cbReq = http.request({
    hostname: '127.0.0.1',
    port: 5500,
    path: '/api/auth/google/callback?code=mock_code_12345',
    method: 'GET',
    timeout: 5000
  }, (res) => {
    let body = '';
    res.on('data', c => body += c);
    res.on('end', () => {
      console.log(`Callback Status: HTTP ${res.statusCode}`);
      console.log(`Headers:`, res.headers);
      console.log(`Body Length: ${body.length}`);
      console.log(`Body Sample: ${body.slice(0, 150)}...`);
      process.exit(0);
    });
  });

  cbReq.on('error', (err) => {
    console.log(`Callback request error: ${err.message}`);
    process.exit(0);
  });

  cbReq.on('timeout', () => {
    console.log('Callback request timed out! (Server hung waiting on Firestore/token exchange!)');
    cbReq.destroy();
    process.exit(1);
  });

  cbReq.end();
}
