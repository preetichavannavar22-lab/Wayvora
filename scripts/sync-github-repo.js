const fs = require('fs');
const path = require('path');

const srcDir = 'C:/Users/HP/Desktop/Wayvora';
const destDir = 'C:/Users/HP/Documents/GitHub/Wayvora';

// 1. Stray root files to clean up from GitHub repo root
const strayRootFiles = [
  'admin-dashboard.js',
  'ai-engine.js',
  'app.js',
  'auth.js',
  'chat.js',
  'chatbot.js',
  'components.css',
  'currency.js',
  'data.js',
  'firebase-config.js',
  'firestore-service.js',
  'india-data.js',
  'planner.js',
  'responsive.css',
  'state.js',
  'style.css',
  'ui.js',
  'weather.js'
];

console.log('--- Cleaning up stray root files in GitHub repo ---');
strayRootFiles.forEach(f => {
  const target = path.join(destDir, f);
  if (fs.existsSync(target)) {
    fs.unlinkSync(target);
    console.log('  Removed stray root file:', f);
  }
});

// 2. Directories to synchronize
const syncDirs = ['api', 'css', 'js', 'images', 'public', 'scripts'];

function copyRecursive(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'secrets' || entry.name.endsWith('.vsidx') || entry.name.includes('.vs')) {
      continue;
    }
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
      console.log('  Copied:', path.relative(destDir, destPath));
    }
  }
}

console.log('\n--- Synchronizing directories to GitHub repo ---');
syncDirs.forEach(d => {
  const sPath = path.join(srcDir, d);
  const dPath = path.join(destDir, d);
  if (fs.existsSync(sPath)) {
    console.log(`Syncing ${d}/...`);
    copyRecursive(sPath, dPath);
  }
});

// 3. Root files to synchronize (never secrets or .env)
const rootFiles = [
  'index.html',
  'vercel.json',
  'package.json',
  'package-lock.json',
  'server.js',
  '.env.example',
  'firestore.rules',
  '.gitignore',
  'README.md'
];

console.log('\n--- Synchronizing root files ---');
rootFiles.forEach(f => {
  const sPath = path.join(srcDir, f);
  const dPath = path.join(destDir, f);
  if (fs.existsSync(sPath)) {
    fs.copyFileSync(sPath, dPath);
    console.log('  Copied root file:', f);
  }
});

console.log('\nSynchronization complete!');
