/**
 * WAYVORA - Static Build & Asset Synchronization Script
 * Ensures all static assets (index.html, css/, js/, images/) exist in BOTH
 * the repository root and public/ directory for 100% Vercel compatibility
 * regardless of whether Output Directory is set to 'public' or root.
 */

const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const publicDir = path.join(rootDir, 'public');

function copyDirRecursive(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name === '.git' || entry.name.endsWith('.vsidx') || entry.name.includes('.vs')) {
      continue;
    }
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

console.log('--- Ensuring static assets are deployed to both root and public/ ---');

// 1. Ensure public/ directory exists
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// 2. Sync index.html to public/
const rootIndexHtml = path.join(rootDir, 'index.html');
const publicIndexHtml = path.join(publicDir, 'index.html');
if (fs.existsSync(rootIndexHtml)) {
  fs.copyFileSync(rootIndexHtml, publicIndexHtml);
  console.log('  ✓ Synced index.html -> public/index.html');
}

// 3. Sync css/ to public/css/
const rootCss = path.join(rootDir, 'css');
const publicCss = path.join(publicDir, 'css');
if (fs.existsSync(rootCss)) {
  copyDirRecursive(rootCss, publicCss);
  console.log('  ✓ Synced css/ -> public/css/');
}

// 4. Sync js/ to public/js/
const rootJs = path.join(rootDir, 'js');
const publicJs = path.join(publicDir, 'js');
if (fs.existsSync(rootJs)) {
  copyDirRecursive(rootJs, publicJs);
  console.log('  ✓ Synced js/ -> public/js/');
}

// 5. Sync images/ to public/images/
const rootImages = path.join(rootDir, 'images');
const publicImages = path.join(publicDir, 'images');
if (fs.existsSync(rootImages)) {
  copyDirRecursive(rootImages, publicImages);
  console.log('  ✓ Synced images/ -> public/images/');
}

console.log('Static asset preparation complete!\n');
