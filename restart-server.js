const { execSync, spawn } = require('child_process');
const http = require('http');

console.log('--- Restarting Wayvora Server on Port 5500 ---');

try {
  // Find PID on port 5500
  const netstat = execSync('netstat -ano | findstr :5500', { encoding: 'utf8' });
  const lines = netstat.trim().split(/\r?\n/);
  for (const line of lines) {
    if (line.includes('LISTENING')) {
      const parts = line.trim().split(/\s+/);
      const pid = parts[parts.length - 1];
      if (pid && !isNaN(pid) && parseInt(pid, 10) > 0) {
        console.log(`Killing old server process (PID ${pid})...`);
        try {
          execSync(`taskkill /F /PID ${pid}`);
        } catch (e) {
          console.log(`Could not kill PID ${pid}: ${e.message}`);
        }
      }
    }
  }
} catch (e) {
  console.log('No existing process on port 5500.');
}

console.log('Spawning updated node server.js...');
const child = spawn('node', ['server.js'], {
  detached: true,
  stdio: 'ignore'
});
child.unref();

console.log('Waiting 2 seconds for server to start...');
setTimeout(() => {
  const req = http.request({
    hostname: '127.0.0.1',
    port: 5500,
    path: '/api/auth/google/status',
    method: 'GET'
  }, (res) => {
    let body = '';
    res.on('data', c => body += c);
    res.on('end', () => {
      console.log(`Server responded HTTP ${res.statusCode}: ${body}`);
      process.exit(0);
    });
  });

  req.on('error', (err) => {
    console.error(`Server ping failed: ${err.message}`);
    process.exit(1);
  });

  req.end();
}, 2000);
