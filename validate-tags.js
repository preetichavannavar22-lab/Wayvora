const fs = require('fs');
const path = require('path');

function checkTags(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  console.log('--- COMPREHENSIVE HTML TAG PAIR VALIDATION: ' + path.basename(filePath) + ' ---');

  const tagsToCheck = ['div', 'section', 'header', 'nav', 'main', 'footer', 'button', 'form', 'ul', 'ol', 'select'];

  tagsToCheck.forEach(tag => {
    const openCount = (content.match(new RegExp('<' + tag + '\\b[^>]*>', 'gi')) || []).length;
    const closeCount = (content.match(new RegExp('</' + tag + '>', 'gi')) || []).length;
    const isBalanced = openCount === closeCount;
    console.log(`${isBalanced ? '✓' : '✗'} <${tag}>: ${openCount} open, ${closeCount} close (Balanced: ${isBalanced})`);
  });
}

checkTags(path.join(__dirname, '..', 'index.html'));
