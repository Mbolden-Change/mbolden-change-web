/**
 * Proves the website simulator still runs the reference build's math.
 * Run: node simulator/tests/verbatim.test.js  (from the repo root)
 *
 *  - The engine files must match the hashes they had when extracted from the
 *    reference build. A parameter refresh replaces parameters.json and the
 *    CalEITC table on purpose: update their hashes here in the same change.
 *  - Each ported block must equal its reference line range byte-for-byte.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const root = path.join(__dirname, '..', '..');
const sha = (p) => crypto.createHash('sha256').update(fs.readFileSync(path.join(root, p))).digest('hex');
let failed = 0;
function check(name, ok, detail) {
  console.log((ok ? '  ok  ' : 'FAIL  ') + name + (ok || !detail ? '' : '\n      ' + detail));
  if (!ok) failed++;
}

const ENGINE = 'frontend/lib/simulator/engine/';
const HASHES = {
  'simulator/reference/index.html': '9a7aaeca726e4b9df6443554cce884dd121bb272516760c606664137a2d27374',
  [ENGINE + 'engine.js']: '3aa77c110d2b65b893257f01f36bea8c9134b26a3d1755183ab3692b5f791ff7',
  [ENGINE + 'parameters.json']: '523ce9bd8651ba63abf7e37d8e8dcc5740edfb12849eceec7eb94fe3309aca7a',
  [ENGINE + 'caleitc-table-2025.json']: '90dedbc51a9726fef186e13a416c6b7b670de32e20032aeacc3e85fb893e9482',
};
for (const [p, h] of Object.entries(HASHES)) {
  const got = sha(p);
  check(`${p} sha256`, got === h, `expected ${h}, got ${got}`);
}

const ref = fs.readFileSync(path.join(root, 'simulator/reference/index.html'), 'utf8').split('\n');
const dir = path.join(root, 'frontend/lib/simulator');
const compDir = path.join(root, 'frontend/components/v2/simulator');
const files = [
  ...fs.readdirSync(dir).filter((f) => /\.(js|jsx)$/.test(f)).map((f) => path.join(dir, f)),
  ...(fs.existsSync(compDir) ? fs.readdirSync(compDir).filter((f) => f.endsWith('.jsx')).map((f) => path.join(compDir, f)) : []),
];
let blocks = 0;
for (const f of files) {
  const src = fs.readFileSync(f, 'utf8');
  const name = path.relative(root, f);
  const re = /\/\/ ---- BEGIN VERBATIM reference lines (\d+)-(\d+) ----\n([\s\S]*?)\n\s*\/\/ ---- END VERBATIM ----/g;
  for (const m of src.matchAll(re)) {
    blocks++;
    const [a, b] = [Number(m[1]), Number(m[2])];
    const want = ref.slice(a - 1, b).join('\n');
    let detail;
    if (m[3] !== want) {
      const got = m[3].split('\n'), exp = want.split('\n');
      const i = got.findIndex((l, k) => l !== exp[k]);
      detail = `first difference at reference line ${a + i}:\n      want: ${JSON.stringify(exp[i])}\n      got:  ${JSON.stringify(got[i])}`;
    }
    check(`${name}: reference lines ${a}-${b} verbatim`, m[3] === want, detail);
  }
}
check('found the ported blocks', blocks >= 2, `only ${blocks} blocks found`);

console.log(failed ? `\n${failed} failed` : `\nall ${Object.keys(HASHES).length + blocks} checks passed`);
if (failed) process.exit(1);
