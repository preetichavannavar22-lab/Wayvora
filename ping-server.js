const http = require('http');

let attempts = 0;
function check() {
  attempts++;
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
      console.log(`\nSUCCESS: Server running on port 5500 (HTTP ${res.statusCode})`);
      console.log(`Status payload: ${body}\n`);

      // Test callback error page rendering over live HTTP
      testLiveCallback();
    });
  });

  req.on('error', (err) => {
    if (attempts < 15) {
      process.stdout.write('.');
      setTimeout(check, 2000);
    } else {
      console.error(`\nFailed to connect to port 5500 after 15 attempts: ${err.message}`);
      process.exit(1);
    }
  });

  req.end();
}

function testLiveCallback() {
  const cbReq = http.request({
    hostname: '127.0.0.1',
    port: 5500,
    path: '/api/auth/google/callback?error=access_denied&error_description=Live%20Callback%20Test',
    method: 'GET'
  }, (cbRes) => {
    let html = '';
    cbRes.on('data', c => html += c);
    cbRes.on('end', () => {
      console.log(`Live Callback HTTP Status: ${cbRes.statusCode}`);
      console.log(`Content-Type: ${cbRes.headers['content-type']}`);
      console.log(`Content-Length: ${cbRes.headers['content-length']}`);
      console.log(`Has dark theme card: ${html.includes('class="card"')}`);
      console.log(`Has Admin Return button: ${html.includes('Return to Admin Dashboard')}`);
      console.log(`Has BroadcastChannel sync: ${html.includes('wayvora_gmail_oauth')}`);
      console.log('\nLIVE SERVER VERIFICATION COMPLETE!\n');
      process.exit(0);
    });
  });

  cbReq.on('error', (e) => {
    console.error('Callback test failed:', e.message);
    process.exit(1);
  });

  cbReq.end();
}

console.log('Checking port 5500 status...');
check();
