// Replaces each `// @@VERBATIM <a>-<b>` placeholder line in the simulator
// components with reference lines a-b (with the approved display fixes in
// display-fixes.json), wrapped in BEGIN/END markers that
// simulator/tests/verbatim.test.js checks. Safe to re-run.
//
// Run from the repo root: node simulator/tools/inline-verbatim.mjs
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const { referenceLines } = createRequire(import.meta.url)('./reference.cjs');

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const dir = path.join(root, 'frontend/components/v2/simulator');

for (const f of fs.readdirSync(dir).filter((n) => n.endsWith('.jsx'))) {
  const file = path.join(dir, f);
  const src = fs.readFileSync(file, 'utf8');
  let n = 0;
  const outSrc = src.replace(/^([ \t]*)\/\/ @@VERBATIM (\d+)-(\d+)[ \t]*$/gm, (_, indent, a, b) => {
    n++;
    return [
      `${indent}// ---- BEGIN VERBATIM reference lines ${a}-${b} ----`,
      referenceLines(Number(a), Number(b)).join('\n'),
      `${indent}// ---- END VERBATIM ----`,
    ].join('\n');
  });
  if (n) {
    fs.writeFileSync(file, outSrc);
    console.log(`${f}: inlined ${n} block(s)`);
  }
}
