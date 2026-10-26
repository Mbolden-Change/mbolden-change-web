/**
 * Copy check: every line of visible text on a reference screen must still be
 * on the same website screen. Lines are compared as word sequences (case and
 * punctuation ignored), so layout changes such as an uppercase label or a
 * line split across two elements don't count as missing copy.
 */
'use strict';

// The removals the simulator refresh spec allows. (The approved display fixes in
// simulator/tools/display-fixes.json are applied to the reference text before
// this check, so they never count as missing copy.)
const ALLOWED_REMOVALS = [
  { label: 'the intro "About us" block', test: (l) => /^ABOUT US$/i.test(l) || /champions, designs, and incubates bold, community-driven solutions that dismantle barriers/.test(l) },
  { label: 'the bottom 501(c)(3) line', test: (l) => /is a 501\(c\)\(3\) nonprofit/.test(l) },
  { label: 'emoji and glyph icons (now line icons)', test: (l) => /^[\p{Extended_Pictographic}️‍\s✓✕↻▲▼▾▸◉○→←]+$/u.test(l) },
  { label: 'the simulator logo', test: (l) => /^mBOLDen Change$/.test(l) },
  // Confirming now applies the choice before advancing (mockup); approved by Minh, 2026-10-26.
  { label: 'confirm label, now "Confirm tradeoffs →" (approved)', test: (l) => l === 'Confirm tradeoffs & next round →' },
  { label: 'confirm label, now "Confirm choice →" (approved)', test: (l) => l === 'Confirm choice & next round →' },
];

// Letters and digits only. Inline elements can run words together in innerText
// ("HouseholdBETA"), so longer lines are compared without separators; short
// lines must match whole words.
const tokens = (s) => s.toLowerCase().match(/[a-z]+|[0-9]+/g) || [];
const words = (s) => tokens(s).join(' ');
const squash = (s) => tokens(s).join('');

function missingLines(log) {
  const seen = new Map();
  for (const { where, path, ref, web } of log) {
    const hay = ' ' + words(web) + ' ';
    const hayS = squash(web);
    for (const raw of ref.split('\n')) {
      const line = raw.trim();
      if (!line) continue;
      const w = words(line);
      if (!w) {
        // Symbol-only lines (emoji, ✓): count them only if allowed-list doesn't cover them.
        if (!ALLOWED_REMOVALS.some((a) => a.test(line)) && !web.includes(line)) record(line);
        continue;
      }
      const found = squash(line).length >= 12 ? hayS.includes(squash(line)) : hay.includes(' ' + w + ' ');
      if (!found) record(line);
    }
    function record(line) {
      if (!seen.has(line)) seen.set(line, { line, where: `${path} > ${where}`, count: 0 });
      seen.get(line).count++;
    }
  }
  return [...seen.values()].map((m) => {
    const a = ALLOWED_REMOVALS.find((x) => x.test(m.line));
    return { ...m, allowed: a ? a.label : null };
  });
}

module.exports = { missingLines, ALLOWED_REMOVALS };
