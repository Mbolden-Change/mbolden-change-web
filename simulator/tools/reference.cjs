// Reference build lines, with the approved display fixes applied
// (simulator/tools/display-fixes.json). Shared by the inliner, the verbatim
// test and the equality harness so all three agree on what "verbatim" means.
'use strict';
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..', '..');
const REF = fs.readFileSync(path.join(root, 'simulator/reference/index.html'), 'utf8').split('\n');
const { fixes: FIXES } = JSON.parse(fs.readFileSync(path.join(__dirname, 'display-fixes.json'), 'utf8'));

/** Reference lines a..b (1-based, inclusive), each with any fix whose range covers it applied. */
function referenceLines(a, b) {
  return REF.slice(a - 1, b).map((line, i) => {
    const n = a + i;
    return FIXES.filter((f) => n >= f.lines[0] && n <= f.lines[1]).reduce((l, f) => l.split(f.from).join(f.to), line);
  });
}

/** Applies every fix to a block of reference text (the harness reads rendered text, not lines). */
function fixText(text) {
  return FIXES.reduce((t, f) => t.split(f.from).join(f.to), text);
}

module.exports = { referenceLines, fixText, FIXES };
