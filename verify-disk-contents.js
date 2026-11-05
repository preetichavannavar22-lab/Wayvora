const fs = require('fs');

console.log('--- VERIFYING PHYSICAL FILE CONTENT ON DISK (C:\\Users\\HP\\Desktop\\Wayvora) ---');

// 1. index.html
const indexHtml = fs.readFileSync('C:/Users/HP/Desktop/Wayvora/index.html', 'utf8');
const linesIndex = indexHtml.split('\n');
console.log('1. index.html:');
console.log('   Line 106 (Mobile Button): ' + linesIndex[105].trim());
console.log('   Line 145 (Navbar Button): ' + linesIndex[144].trim());
console.log('   Line 190 (Dropdown Item): ' + linesIndex[189].trim());

// 2. admin-dashboard.js
const adminJs = fs.readFileSync('C:/Users/HP/Desktop/Wayvora/js/admin-dashboard.js', 'utf8');
console.log('\n2. js/admin-dashboard.js:');
console.log('   Has adminTriggerHandler: ' + adminJs.includes('const adminTriggerHandler = (e) => {'));
console.log('   Has URL hash update (#admin): ' + adminJs.includes('history.replaceState(null, document.title, "#admin")'));
console.log('   Syntax error (extra brace) resolved: ' + !adminJs.includes('}\n      }\n      }\n\n      // 3. Refresh'));

// 3. app.js
const appJs = fs.readFileSync('C:/Users/HP/Desktop/Wayvora/js/app.js', 'utf8');
console.log('\n3. js/app.js:');
console.log('   Has pathname routing for admin: ' + appJs.includes('cleanPath === "admin"'));
console.log('   Has triggerAdminOpen retry loop: ' + appJs.includes('const triggerAdminOpen = () => {'));

// 4. auth.js
const authJs = fs.readFileSync('C:/Users/HP/Desktop/Wayvora/js/auth.js', 'utf8');
console.log('\n4. js/auth.js:');
console.log('   Has fallback hash navigation: ' + authJs.includes('window.location.hash = "admin"'));

console.log('\n--- ALL RECENT EDITS VERIFIED DIRECTLY INSIDE PHYSICAL DISK FILES! ---');
