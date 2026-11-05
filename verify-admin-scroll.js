/**
 * WAYVORA - Admin Dashboard Scrolling & Layout Verification Suite
 * 
 * Verifies:
 * 1. CSS overflow rules: No fixed-height scroll traps or overflow:hidden preventing scrolling.
 * 2. Sticky header ensures header actions (refresh, close) remain accessible during scrolling.
 * 3. Inquiry stat cards have data-filter, cursor: pointer, hover/active states, and click filtering.
 * 4. Entire modal content flows naturally with smooth scrolling on desktop and mobile.
 * 5. Tickets container allows clicking anywhere on inquiry cards to view/respond.
 * 6. Responsive media queries exist for tablet and mobile viewports.
 * 7. Gmail Support Dispatch section remains intact with Send Test Email & Disconnect buttons.
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

let passedTests = 0;
let totalTests = 0;

function test(name, fn) {
  totalTests++;
  try {
    fn();
    passedTests++;
    console.log(`  ✓ PASS: ${name}`);
  } catch (err) {
    console.error(`  ✗ FAIL: ${name}`);
    console.error(`    -> ${err.message}`);
  }
}

console.log('======================================================================');
console.log('WAYVORA ADMIN DASHBOARD SCROLLING & LAYOUT VERIFICATION');
console.log('======================================================================');

const cssPath = path.join(__dirname, '../css/components.css');
const jsPath = path.join(__dirname, '../js/admin-dashboard.js');

const cssContent = fs.readFileSync(cssPath, 'utf8');
const jsContent = fs.readFileSync(jsPath, 'utf8');

// 1. Check CSS rules for .admin-modal-overlay
test('.admin-modal-overlay has overflow-y: auto and align-items: flex-start', () => {
  const match = cssContent.match(/\.admin-modal-overlay\s*\{([^}]+)\}/);
  assert.ok(match, 'Found .admin-modal-overlay rule');
  assert.ok(match[1].includes('overflow-y: auto'), '.admin-modal-overlay must have overflow-y: auto');
  assert.ok(match[1].includes('align-items: flex-start'), '.admin-modal-overlay must have align-items: flex-start to prevent top/bottom clipping');
});

// 2. Check CSS rules for .admin-modal-content
test('.admin-modal-content has overflow-y: auto and no overflow: hidden', () => {
  const match = cssContent.match(/\.admin-modal-content\s*\{([^}]+)\}/);
  assert.ok(match, 'Found .admin-modal-content rule');
  assert.ok(match[1].includes('overflow-y: auto'), '.admin-modal-content must have overflow-y: auto');
  assert.ok(!match[1].includes('overflow: hidden'), '.admin-modal-content must NOT have overflow: hidden');
});

// 3. Check CSS rules for .admin-modal-header
test('.admin-modal-header has position: sticky so close/refresh remain accessible', () => {
  const match = cssContent.match(/\.admin-modal-header\s*\{([^}]+)\}/);
  assert.ok(match, 'Found .admin-modal-header rule');
  assert.ok(match[1].includes('position: sticky'), '.admin-modal-header must have position: sticky');
  assert.ok(match[1].includes('top: 0'), '.admin-modal-header must stick to top: 0');
});

// 4. Check CSS rules for .admin-stat-card
test('.admin-stat-card has cursor: pointer and hover/active states', () => {
  const match = cssContent.match(/\.admin-stat-card\s*\{([^}]+)\}/);
  assert.ok(match, 'Found .admin-stat-card rule');
  assert.ok(match[1].includes('cursor: pointer'), '.admin-stat-card must have cursor: pointer');
  assert.ok(cssContent.includes('.admin-stat-card:hover'), 'Must have hover styling');
  assert.ok(cssContent.includes('.admin-stat-card.active'), 'Must have active styling');
});

// 5. Check CSS rules for .admin-tickets-scroll-area
test('.admin-tickets-scroll-area has overflow: visible to eliminate nested scroll trap', () => {
  const match = cssContent.match(/\.admin-tickets-scroll-area\s*\{([^}]+)\}/);
  assert.ok(match, 'Found .admin-tickets-scroll-area rule');
  assert.ok(match[1].includes('overflow: visible'), '.admin-tickets-scroll-area must have overflow: visible');
});

// 6. Check responsive styles
test('Responsive media queries exist for tablet and mobile', () => {
  assert.ok(cssContent.includes('@media (max-width: 900px)'), 'Must have tablet breakpoint @media (max-width: 900px)');
  assert.ok(cssContent.includes('@media (max-width: 600px)'), 'Must have mobile breakpoint @media (max-width: 600px)');
});

// 7. Check js/admin-dashboard.js stat cards template
test('createDashboardDOM generates data-filter on stat cards', () => {
  assert.ok(jsContent.includes('data-filter="all"'), 'Must have data-filter="all" on Total Inquiries card');
  assert.ok(jsContent.includes('data-filter="open"'), 'Must have data-filter="open" on Open Tickets card');
  assert.ok(jsContent.includes('data-filter="in_progress"'), 'Must have data-filter="in_progress" on In Progress card');
  assert.ok(jsContent.includes('data-filter="resolved"'), 'Must have data-filter="resolved" on Resolved card');
});

// 8. Check js/admin-dashboard.js setFilter implementation
test('setFilter method synchronizes pills, stat cards, and triggers smooth scroll', () => {
  assert.ok(jsContent.includes('setFilter(filterKey, scrollToSection = false)'), 'Must define setFilter method');
  assert.ok(jsContent.includes('scrollIntoView'), 'Must scroll into view when scrollToSection is true');
});

// 9. Check ticket click delegation
test('Ticket cards are clickable to open manage/reply modal', () => {
  assert.ok(jsContent.includes('e.target.closest(".admin-ticket-card")'), 'Must delegate click on inquiry card');
  assert.ok(jsContent.includes('openManageTicketModal'), 'Must open manage ticket modal on inquiry card click');
});

// 10. Check Gmail Support Dispatch section buttons
test('Gmail Support Dispatch buttons and status remain intact', () => {
  assert.ok(jsContent.includes('btn-gmail-test'), 'Send Test Email button handler must exist');
  assert.ok(jsContent.includes('btn-gmail-disconnect'), 'Disconnect Gmail button handler must exist');
  assert.ok(jsContent.includes('testGmailConnection'), 'testGmailConnection method must exist');
  assert.ok(jsContent.includes('disconnectGmail'), 'disconnectGmail method must exist');
});

console.log('======================================================================');
console.log(`TEST RESULTS: ${passedTests}/${totalTests} PASSED`);
if (passedTests === totalTests) {
  console.log('🎉 ALL ADMIN DASHBOARD SCROLLING & LAYOUT TESTS PASSED!');
} else {
  console.log(`⚠️ ${totalTests - passedTests} TESTS FAILED.`);
  process.exit(1);
}
console.log('======================================================================\n');
