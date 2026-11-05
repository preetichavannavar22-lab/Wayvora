/**
 * Explicitly saves, flushes, and updates the timestamp for all recently modified
 * files directly in the physical Desktop WAYVORA folder (C:\Users\HP\Desktop\Wayvora)
 */

const fs = require('fs');
const path = require('path');

const desktopFolder = 'C:\\Users\\HP\\Desktop\\Wayvora';

const filesToSave = [
  'index.html',
  'package.json',
  'vercel.json',
  'js/admin-dashboard.js',
  'js/app.js',
  'js/auth.js',
  'public/index.html',
  'public/js/admin-dashboard.js',
  'public/js/app.js',
  'public/js/auth.js',
  'scripts/build-static.js',
  'scripts/sync-github-repo.js',
  'scripts/test-admin-portal-navigation.js',
  'scripts/validate-html.js',
  'scripts/validate-tags.js',
  'scripts/verify-live-admin.js'
];

console.log('======================================================================');
console.log('SAVING ALL RECENT AGENT EDITS DIRECTLY TO DESKTOP FOLDER');
console.log('Folder Path: ' + desktopFolder);
console.log('======================================================================\n');

const now = new Date();
const savedFiles = [];

filesToSave.forEach(relFile => {
  const fullPath = path.join(desktopFolder, relFile);
  if (fs.existsSync(fullPath)) {
    // Read content into memory
    const content = fs.readFileSync(fullPath, 'utf8');
    
    // Explicitly write with flush
    const fd = fs.openSync(fullPath, 'w');
    fs.writeFileSync(fd, content, 'utf8');
    fs.fsyncSync(fd);
    fs.closeSync(fd);

    // Update atime and mtime to current timestamp
    fs.utimesSync(fullPath, now, now);

    const stat = fs.statSync(fullPath);
    console.log(`✓ Successfully saved: ${relFile}`);
    console.log(`  Path: ${fullPath}`);
    console.log(`  Size: ${stat.size} bytes`);
    console.log(`  Date Modified: ${stat.mtime.toLocaleString()}\n`);

    savedFiles.push({
      file: relFile,
      fullPath,
      size: stat.size,
      mtime: stat.mtime.toLocaleString()
    });
  } else {
    console.warn(`! File not found: ${fullPath}`);
  }
});

// Also run build-static to ensure public is refreshed
console.log('--- Synchronizing to public/ folder ---');
require('./build-static.js');

console.log('\n======================================================================');
console.log(`TOTAL FILES REFRESHED ON DESKTOP: ${savedFiles.length}`);
console.log('======================================================================');
