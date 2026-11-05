const fs = require('fs');
const path = require('path');

function validateHtml(filePath) {
  console.log('======================================================================');
  console.log('VALIDATING HTML: ' + path.basename(filePath));
  console.log('Path: ' + filePath);
  console.log('======================================================================\n');

  const content = fs.readFileSync(filePath, 'utf8');

  // 1. Check all IDs for duplicates
  const idRegex = /\bid=["']([^"']+)["']/g;
  const idCounts = {};
  const idLines = {};
  const lines = content.split('\n');

  lines.forEach((line, idx) => {
    let m;
    const lineIdRegex = /\bid=["']([^"']+)["']/g;
    while ((m = lineIdRegex.exec(line)) !== null) {
      const id = m[1];
      idCounts[id] = (idCounts[id] || 0) + 1;
      if (!idLines[id]) idLines[id] = [];
      idLines[id].push(idx + 1);
    }
  });

  const duplicates = Object.entries(idCounts).filter(([id, count]) => count > 1);
  console.log('--- 1. DUPLICATE ID CHECK ---');
  if (duplicates.length === 0) {
    console.log('✓ Zero duplicate IDs found across the entire document!');
  } else {
    console.log(`✗ Found ${duplicates.length} duplicate IDs:`);
    duplicates.forEach(([id, count]) => {
      console.log(`  - #${id} appears ${count} times on lines: ${idLines[id].join(', ')}`);
    });
  }

  // 2. Check Admin Portal Button IDs specifically
  const targetIds = [
    'mobile-admin-dashboard-btn',
    'nav-admin-dashboard-btn',
    'user-menu-admin-item'
  ];

  console.log('\n--- 2. ADMIN PORTAL BUTTON ID SPECIFIC CHECK ---');
  targetIds.forEach(id => {
    const count = idCounts[id] || 0;
    if (count === 1) {
      console.log(`✓ Exactly ONE element with id="${id}" (Line ${idLines[id][0]})`);
    } else if (count === 0) {
      console.log(`✗ Missing element with id="${id}"`);
    } else {
      console.log(`✗ Duplicate element with id="${id}" (Count: ${count}, Lines: ${idLines[id].join(', ')})`);
    }
  });

  // 3. Button tag balance and nesting check
  console.log('\n--- 3. BUTTON TAGS NESTING & BALANCE CHECK ---');
  const openButtons = (content.match(/<button\b/gi) || []).length;
  const closeButtons = (content.match(/<\/button>/gi) || []).length;
  console.log(`Total <button> opening tags: ${openButtons}`);
  console.log(`Total </button> closing tags: ${closeButtons}`);

  if (openButtons === closeButtons) {
    console.log('✓ Total button opening and closing tag counts match perfectly!');
  } else {
    console.log(`✗ Tag mismatch: ${openButtons} opening vs ${closeButtons} closing tags!`);
  }

  // Deep parse button stack to detect nested buttons or missing closing tags
  const tagRegex = /<\/?button\b[^>]*>/gi;
  let match;
  let depth = 0;
  let hasNesting = false;
  let hasNegativeDepth = false;
  const nestingIssues = [];

  // Match line numbers
  let lineNum = 1;
  let lastIndex = 0;

  while ((match = tagRegex.exec(content)) !== null) {
    const matchedTag = match[0];
    const isClosing = matchedTag.startsWith('</');
    
    // Count newlines up to this match
    const textBefore = content.substring(lastIndex, match.index);
    lineNum += (textBefore.match(/\n/g) || []).length;
    lastIndex = match.index;

    if (isClosing) {
      depth--;
      if (depth < 0) {
        hasNegativeDepth = true;
        nestingIssues.push(`Unexpected closing </button> at line ${lineNum} without matching opening tag`);
        depth = 0;
      }
    } else {
      depth++;
      if (depth > 1) {
        hasNesting = true;
        nestingIssues.push(`Nested <button> detected at line ${lineNum}: ${matchedTag.slice(0, 80)}...`);
      }
    }
  }

  if (!hasNesting && !hasNegativeDepth && depth === 0) {
    console.log('✓ Zero nested buttons! Every button is properly opened and closed.');
  } else {
    console.log('✗ Nesting or closure issues detected:');
    nestingIssues.forEach(iss => console.log('  - ' + iss));
  }

  console.log('\n======================================================================\n');
}

validateHtml(path.join(__dirname, '..', 'index.html'));
validateHtml(path.join(__dirname, '..', 'public', 'index.html'));
