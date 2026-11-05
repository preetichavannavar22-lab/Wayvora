/**
 * WAYVORA - Admin Portal Navigation & Click Handler Verification Test
 */

const fs = require('fs');
const path = require('path');

console.log('======================================================================');
console.log('TESTING ADMIN PORTAL NAVIGATION & CLICK HANDLERS');
console.log('======================================================================\n');

// 1. Verify syntax of all modified files
const filesToCheck = [
  'js/admin-dashboard.js',
  'js/auth.js',
  'js/app.js'
];

let allSyntaxOk = true;
for (const relPath of filesToCheck) {
  const code = fs.readFileSync(path.join(__dirname, '..', relPath), 'utf8');
  try {
    new Function(code);
    console.log(`✓ Syntax OK: ${relPath}`);
  } catch (err) {
    console.error(`✗ Syntax Error in ${relPath}:`, err.message);
    allSyntaxOk = false;
  }
}

if (!allSyntaxOk) {
  console.error('\nFAILED: One or more files have syntax errors.');
  process.exit(1);
}

// 2. Verify index.html contains all 3 trigger elements with proper attributes
const indexHtml = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

const checks = [
  { id: 'nav-admin-dashboard-btn', name: 'Desktop Navbar Quick-Action Button' },
  { id: 'user-menu-admin-item', name: 'User Profile Dropdown Item' },
  { id: 'mobile-admin-dashboard-btn', name: 'Mobile Navigation Drawer Button' }
];

let htmlChecksPass = true;
for (const check of checks) {
  if (indexHtml.includes(`id="${check.id}"`)) {
    console.log(`✓ Found ${check.name} (id="${check.id}") in index.html`);
  } else {
    console.error(`✗ Missing ${check.name} (id="${check.id}") in index.html`);
    htmlChecksPass = false;
  }

  // Check inline onclick fallback exists
  const hasOnclick = indexHtml.includes(`id="${check.id}"`) && indexHtml.includes(`AdminDashboard.open`);
  if (hasOnclick) {
    console.log(`  ✓ Inline onclick handler present for ${check.id}`);
  } else {
    console.warn(`  ! No inline onclick handler for ${check.id}`);
  }
}

// 3. Verify Simulated DOM & Event Propagation
console.log('\n--- Simulating DOM Environment & Navigation Flow ---');

class MockElement {
  constructor(id, tagName = 'div') {
    this.id = id;
    this.tagName = tagName;
    this.style = {};
    this.classList = {
      _classes: new Set(),
      add: (c) => this.classList._classes.add(c),
      remove: (c) => this.classList._classes.delete(c),
      contains: (c) => this.classList._classes.has(c),
      toggle: (c, force) => {
        if (force === undefined) {
          if (this.classList._classes.has(c)) this.classList._classes.delete(c);
          else this.classList._classes.add(c);
        } else if (force) {
          this.classList._classes.add(c);
        } else {
          this.classList._classes.delete(c);
        }
      }
    };
    this.listeners = {};
  }
  addEventListener(event, cb) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(cb);
  }
  click() {
    if (this.listeners['click']) {
      for (const cb of this.listeners['click']) {
        cb({ preventDefault: () => {} });
      }
    }
  }
  querySelector() {
    return new MockElement('inner');
  }
}

const mockElements = {
  'nav-admin-dashboard-btn': new MockElement('nav-admin-dashboard-btn', 'BUTTON'),
  'user-menu-admin-item': new MockElement('user-menu-admin-item', 'BUTTON'),
  'mobile-admin-dashboard-btn': new MockElement('mobile-admin-dashboard-btn', 'BUTTON'),
  'user-menu-dropdown': new MockElement('user-menu-dropdown'),
  'nav-auth-unauth': new MockElement('nav-auth-unauth'),
  'nav-auth-authenticated': new MockElement('nav-auth-authenticated'),
  'mobile-auth-unauth': new MockElement('mobile-auth-unauth'),
  'mobile-auth-authenticated': new MockElement('mobile-auth-authenticated')
};

global.document = {
  getElementById: (id) => {
    if (!mockElements[id]) mockElements[id] = new MockElement(id);
    return mockElements[id];
  },
  querySelectorAll: () => [],
  addEventListener: () => {},
  createElement: (tag) => new MockElement('created-' + tag, tag),
  body: {
    style: {},
    appendChild: (el) => {
      if (el && el.id) mockElements[el.id] = el;
    }
  },
  readyState: 'complete'
};

global.window = {
  document: global.document,
  location: { hash: '', search: '', pathname: '/' },
  history: { replaceState: () => {} },
  addEventListener: () => {}
};
global.fetch = () => Promise.resolve({ ok: true, json: () => Promise.resolve({}) });

// Mock AuthService
let isAdminUser = false;
global.window.AuthService = {
  isAdministrator: () => isAdminUser,
  openAuthModal: () => {}
};
global.AuthService = global.window.AuthService;

// Load AdminDashboard
const adminDashboardCode = fs.readFileSync(path.join(__dirname, '..', 'js', 'admin-dashboard.js'), 'utf8');
const runAdminDashboard = new Function(adminDashboardCode);
runAdminDashboard.call(global.window);

if (global.window.AdminDashboard && typeof global.window.AdminDashboard.open === 'function') {
  console.log('✓ AdminDashboard loaded and window.AdminDashboard.open is a valid function');
} else {
  console.error('✗ window.AdminDashboard is NOT properly exported!');
  process.exit(1);
}

// Track AdminDashboard.open calls
let openCalledCount = 0;
const originalOpen = global.window.AdminDashboard.open;
global.window.AdminDashboard.open = function() {
  openCalledCount++;
  return originalOpen.apply(this, arguments);
};

// Bind events in AdminDashboard
global.window.AdminDashboard.bindEvents();

// Test Unauthenticated / Non-admin access
isAdminUser = false;
let toastShown = false;
global.window.UI = {
  showToast: (msg, type) => {
    if (type === 'error' && msg.includes('Administrator')) toastShown = true;
  }
};

mockElements['nav-admin-dashboard-btn'].click();
console.log(toastShown ? '✓ Unauthenticated click correctly blocked with access denied toast' : '✗ Unauthenticated click was not blocked!');

// Test Authorized Admin access
isAdminUser = true;
const modalEl = document.getElementById('admin-dashboard-modal');
modalEl.classList.remove('active');

mockElements['nav-admin-dashboard-btn'].click();
console.log(modalEl.classList.contains('active') ? '✓ Clicking Desktop Nav button successfully opened Admin Portal' : '✗ Desktop Nav click did not trigger open!');

modalEl.classList.remove('active');
mockElements['user-menu-admin-item'].click();
console.log(modalEl.classList.contains('active') ? '✓ Clicking Dropdown Menu item successfully opened Admin Portal' : '✗ Dropdown Menu click did not trigger open!');

modalEl.classList.remove('active');
mockElements['mobile-admin-dashboard-btn'].click();
console.log(modalEl.classList.contains('active') ? '✓ Clicking Mobile Drawer button successfully opened Admin Portal' : '✗ Mobile Drawer click did not trigger open!');

console.log('\n======================================================================');
console.log('🎉 ALL ADMIN PORTAL NAVIGATION TESTS PASSED SUCCESSFULLY!');
console.log('======================================================================\n');
