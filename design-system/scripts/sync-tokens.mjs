#!/usr/bin/env node
/**
 * sync-tokens.mjs
 * ------------------------------------------------------------
 * Keeps design-system/colors_and_type.css in sync with the
 * canonical brand tokens shipped in the Next.js app.
 *
 * Source of truth:
 *   frontend/app/globals.css           (brand colors, type scale)
 *   frontend/app/design-tokens.scss    (spacing, radii, shadows)
 *   frontend/styles/_variables.scss    (SCSS color aliases)
 *
 * Output:
 *   design-system/colors_and_type.css  (CSS variables bundle that
 *                                       the design-system README,
 *                                       preview cards, and UI kits
 *                                       consume)
 *
 * Run from the repo root:
 *   node design-system/scripts/sync-tokens.mjs
 *   node design-system/scripts/sync-tokens.mjs --check   # CI: exit 1 if out of sync
 *
 * Add to package.json:
 *   "scripts": {
 *     "tokens:sync":  "node design-system/scripts/sync-tokens.mjs",
 *     "tokens:check": "node design-system/scripts/sync-tokens.mjs --check"
 *   }
 *
 * Wire into CI (e.g. .github/workflows/ci.yml):
 *   - run: npm run tokens:check
 * ------------------------------------------------------------
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..', '..');

const SOURCES = {
  globalsCss:    resolve(REPO_ROOT, 'frontend/app/globals.css'),
  designTokens:  resolve(REPO_ROOT, 'frontend/app/design-tokens.scss'),
  scssVars:      resolve(REPO_ROOT, 'frontend/styles/_variables.scss'),
};

const OUTPUT = resolve(REPO_ROOT, 'design-system/colors_and_type.css');

const CHECK_MODE = process.argv.includes('--check');

// -----------------------------------------------------------
// Token extraction
// -----------------------------------------------------------

/** Pull `--name: value;` declarations from a :root block in CSS. */
function extractCssVars(filePath) {
  if (!existsSync(filePath)) {
    console.warn(`⚠  not found, skipping: ${relative(REPO_ROOT, filePath)}`);
    return {};
  }
  const src = readFileSync(filePath, 'utf8');
  const rootMatch = src.match(/:root\s*\{([\s\S]*?)\}/);
  if (!rootMatch) return {};
  const vars = {};
  const re = /--([\w-]+)\s*:\s*([^;]+);/g;
  let m;
  while ((m = re.exec(rootMatch[1])) !== null) {
    vars[m[1]] = m[2].trim();
  }
  return vars;
}

/** Pull `$name: value;` declarations from a .scss file. */
function extractScssVars(filePath) {
  if (!existsSync(filePath)) return {};
  const src = readFileSync(filePath, 'utf8');
  const vars = {};
  const re = /\$([\w-]+)\s*:\s*([^;]+);/g;
  let m;
  while ((m = re.exec(src)) !== null) {
    vars[m[1]] = m[2].trim();
  }
  return vars;
}

// -----------------------------------------------------------
// Extract
// -----------------------------------------------------------
const globals = extractCssVars(SOURCES.globalsCss);
const design  = extractCssVars(SOURCES.designTokens);
const scss    = extractScssVars(SOURCES.scssVars);

function pick(key, fallback) {
  return globals[key] ?? design[key] ?? fallback;
}

const tokens = {
  // ---- Brand colors (mirror of scss _variables) ----
  '--brand-white':        pick('brand-white',        scss['white']        ?? '#ffffff'),
  '--brand-light-gray':   pick('brand-light-gray',   scss['light-gray']   ?? '#e2e2e2'),
  '--brand-black':        pick('brand-black',        scss['black']        ?? '#000000'),
  '--brand-warm-yellow':  pick('brand-warm-yellow',  scss['warm-yellow']  ?? '#fad826'),
  '--brand-aqua-teal':    pick('brand-aqua-teal',    scss['aqua-teal']    ?? '#0091ad'),
  '--brand-fuchsia':      pick('brand-fuchsia',      scss['fuchsia']      ?? '#b22f93'),
  '--brand-creamy-beige': pick('brand-creamy-beige', scss['creamy-beige'] ?? '#f8efe0'),

  // ---- Type scale (from globals.css) ----
  '--text-h1': pick('text-h1', '48px'),
  '--text-h2': pick('text-h2', '36px'),
  '--text-h3': pick('text-h3', '24px'),
  '--text-h4': pick('text-h4', '20px'),
  '--text-h5': pick('text-h5', '18px'),
  '--text-h6': pick('text-h6', '16px'),
  '--text-body': pick('text-body', '16px'),

  // ---- Spacing (from design-tokens.scss) ----
  '--space-xs':  pick('space-xs',  '0.25rem'),
  '--space-sm':  pick('space-sm',  '0.5rem'),
  '--space-md':  pick('space-md',  '1rem'),
  '--space-lg':  pick('space-lg',  '1.5rem'),
  '--space-xl':  pick('space-xl',  '2rem'),
  '--space-2xl': pick('space-2xl', '3rem'),
  '--space-3xl': pick('space-3xl', '5rem'),

  // ---- Radii ----
  '--radius-sm':   pick('radius-sm',   '8px'),
  '--radius-md':   pick('radius-md',   '12px'),
  '--radius-lg':   pick('radius-lg',   '16px'),
  '--radius-pill': pick('radius-pill', '50px'),
};

// -----------------------------------------------------------
// Render
// -----------------------------------------------------------
const STAMP = new Date().toISOString().slice(0, 10);

const header = `/* ============================================================
   mBOLDen Change — Colors & Type
   ------------------------------------------------------------
   AUTO-GENERATED by design-system/scripts/sync-tokens.mjs
   Last sync: ${STAMP}

   DO NOT EDIT the :root block below by hand — edit the source
   files and re-run:
     frontend/app/globals.css
     frontend/app/design-tokens.scss
     frontend/styles/_variables.scss

   Then: npm run tokens:sync
   ============================================================ */

/* Archivo Narrow comes from Google Fonts (matches next/font in app/layout.tsx).
   Roboto is served from the uploaded brand variable font. */
@import url('https://fonts.googleapis.com/css2?family=Archivo+Narrow:wght@400;500;600;700&display=swap');

@font-face {
  font-family: 'Roboto';
  src: url('fonts/Roboto-VariableFont_wdth_wght.ttf') format('truetype-variations'),
       url('fonts/Roboto-VariableFont_wdth_wght.ttf') format('truetype');
  font-weight: 100 900;
  font-stretch: 75% 125%;
  font-style: normal;
  font-display: swap;
}

/* BEGIN SYNCED TOKENS ==================================== */
:root {
`;

const body = Object.entries(tokens)
  .map(([k, v]) => `  ${k}: ${v};`)
  .join('\n');

const footer = `
}
/* END SYNCED TOKENS ====================================== */

/* ---------- HAND-AUTHORED EXTENSIONS (safe to edit) ----------
   Semantic aliases, composite tokens, typography classes, and
   signature shape primitives live below. They reference the
   synced tokens above, so changing a brand color upstream
   cascades automatically.
   -------------------------------------------------------------- */

:root {
  /* Semantic aliases */
  --fg-1: var(--brand-black);
  --fg-2: rgb(0 0 0 / 0.85);
  --fg-muted: #888888;
  --fg-inverse: var(--brand-white);

  --bg-page: rgb(248 239 224 / 0.2);
  --bg-surface: var(--brand-white);
  --bg-warm: var(--brand-creamy-beige);
  --bg-inverse: var(--brand-black);

  --accent: var(--brand-aqua-teal);
  --accent-alt: var(--brand-fuchsia);
  --accent-warn: var(--brand-warm-yellow);

  --border: var(--brand-light-gray);
  --focus-ring: var(--brand-aqua-teal);

  /* Type families */
  --font-headline: 'Archivo Narrow', Arial, Helvetica, sans-serif;
  --font-body:     'Roboto', Arial, Helvetica, sans-serif;

  /* Signature shapes (the mBC identity) */
  --brand-skew: -10.25deg;
  --brand-tilt: -6.5deg;
  --clip-parallelogram: polygon(0% 10%, 100% 0%, 100% 90%, 0% 100%);

  /* Motion */
  --ease-brand: cubic-bezier(0.45, 0.05, 0.55, 0.95);
  --dur-fast: 200ms;
  --dur-base: 300ms;
  --dur-slow: 450ms;

  /* Shadows */
  --shadow-header: 0 1px 3px rgba(0,0,0,0.04);
  --shadow-card:   0 2px 6px rgba(0,0,0,0.04);
  --shadow-btn:    0 4px 5px rgba(0,0,0,0.4);
  --shadow-raised: 0 4px 24px rgb(0 0 0 / 0.08), 0 0 0 1px rgb(0 0 0 / 0.04);
}

body, .p {
  font-family: var(--font-body);
  font-size: var(--text-body);
  line-height: 1.6;
  color: var(--fg-1);
}

h1,.h1,h2,.h2,h3,.h3,h4,.h4,h5,.h5,h6,.h6 {
  font-family: var(--font-headline);
  font-weight: 700;
  letter-spacing: -0.4px;
  margin: 0;
}
h1,.h1 { font-size: var(--text-h1); line-height: 1.2; }
h2,.h2 { font-size: var(--text-h2); line-height: 1.2; }
h3,.h3 { font-size: var(--text-h3); line-height: 1.2; }
h4,.h4 { font-size: var(--text-h4); line-height: 1.2; }
h5,.h5 { font-size: var(--text-h5); line-height: 1.2; }
h6,.h6 { font-size: var(--text-h6); line-height: 1.2; }

.eyebrow {
  font-family: var(--font-body);
  font-size: 0.75rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  font-weight: 700;
}
.lead    { font-size: clamp(1rem, 2vw, 1.125rem); line-height: 1.6; }
.caption { font-size: 14px; line-height: 1.5; color: var(--fg-2); }
.micro   { font-size: 11px; color: var(--fg-muted); }
`;

const next = header + body + footer;

// -----------------------------------------------------------
// Write or check
// -----------------------------------------------------------
const prev = existsSync(OUTPUT) ? readFileSync(OUTPUT, 'utf8') : '';

if (CHECK_MODE) {
  // Ignore the "Last sync" date line so CI is stable across days.
  const strip = (s) => s.replace(/Last sync: \d{4}-\d{2}-\d{2}/, 'Last sync: ----------');
  if (strip(prev) !== strip(next)) {
    console.error('❌ Design tokens are out of sync.');
    console.error('   Run:  npm run tokens:sync');
    console.error('   Then commit design-system/colors_and_type.css');
    process.exit(1);
  }
  console.log('✅ Design tokens in sync.');
  process.exit(0);
}

writeFileSync(OUTPUT, next, 'utf8');
console.log(`✅ Wrote ${relative(REPO_ROOT, OUTPUT)}`);
console.log(`   Synced ${Object.keys(tokens).length} tokens from:`);
Object.values(SOURCES).forEach((p) => console.log(`     · ${relative(REPO_ROOT, p)}`));
