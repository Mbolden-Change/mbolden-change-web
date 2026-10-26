#!/usr/bin/env node
/**
 * Numbers-equality and copy check for the Safety Net Simulator.
 *
 * Plays the same paths through the reference build (simulator/reference/index.html,
 * with its real CDN scripts) and the website's /simulator, and compares every
 * number shown on every screen: household cards, the region step, the household
 * intro, each round's stability / income / support / expenses / balance / cut,
 * the after-confirm panel, and the results (receipt, trajectory, California
 * boosts). Any difference fails. The same pass collects each screen's visible
 * text and lists reference text the website no longer shows.
 *
 * Usage (from the repo root):
 *   node simulator/tests/equality/harness.js --url http://localhost:3000/simulator
 *   options: --workers 6  --only <substring>  --quick (one path per household)
 *            --out <dir> (report.json, report.md; default simulator/tests/equality/out)
 */
'use strict';

const fs = require('fs');
const path = require('path');
// Playwright from the environment, or the copy the frontend already installs.
const { chromium } = (() => {
  try {
    return require('playwright');
  } catch {
    return require(require('path').join(__dirname, '..', '..', '..', 'frontend', 'node_modules', 'playwright'));
  }
})();
const { RefDriver, NewDriver } = require('./drivers');
const { buildPaths } = require('./paths');
const { missingLines, ALLOWED_REMOVALS } = require('./copy');

const args = process.argv.slice(2);
const arg = (k, d) => {
  const i = args.indexOf('--' + k);
  return i >= 0 ? args[i + 1] : d;
};
const NEW_URL = arg('url', 'http://localhost:3000/simulator');
const REF_URL = 'file://' + path.resolve(__dirname, '..', '..', 'reference', 'index.html');
const WORKERS = Number(arg('workers', 6));
const ONLY = arg('only', null);
const QUICK = args.includes('--quick');
const OUT = path.resolve(arg('out', path.join(__dirname, 'out')));

const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

/** Runs one path through both builds in lockstep and returns the differences found. */
async function runPath(pathDef, ref, web, copyLog) {
  const diffs = [];
  const at = [];
  try {
    return await playPath(pathDef, ref, web, copyLog, diffs, at);
  } catch (e) {
    diffs.push({ where: 'harness at ' + (at.join(' > ') || 'start'), error: String(e.message).split('\n').slice(0, 3).join(' | ') });
    return diffs;
  }
}

async function playPath(pathDef, ref, web, copyLog, diffs, at) {
  const both = async (fn) => {
    const r = await Promise.allSettled([fn(ref), fn(web)]);
    r.forEach((x, i) => {
      if (x.status === 'rejected') throw new Error(`${i ? 'website' : 'reference'}: ${x.reason.message}`);
    });
    return r.map((x) => x.value);
  };
  const compare = async (where, extractor) => {
    const [a, b] = await both(extractor);
    if (!same(a, b)) diffs.push({ where: [...at, where].join(' > '), reference: a, website: b });
    return [a, b];
  };
  const copy = async (where, opts) => {
    const [a, b] = await both((d) => d.text(opts));
    copyLog.push({ path: pathDef.id, where: [...at, where].join(' > '), ref: a, web: b });
  };

  await both((d) => d.open());
  at.push('intro');
  await compare('numbers', (d) => d.numbers());
  await copy('text');
  await both((d) => d.begin());
  at.pop();

  // The builder only appears after one finished simulation, as in the reference build.
  if (pathDef.builder) {
    await playPreset({ household: 'Maria — Single Mother', region: 'National Average', pattern: 'first' }, ref, web, null);
    await both((d) => d.restart());
  }

  at.push('households');
  await compare('cards', (d) => d.householdCards());
  await compare('numbers', (d) => d.numbers());
  await copy('text');
  at.pop();

  if (pathDef.builder) {
    await both((d) => d.openBuilder());
    await both((d) => d.builderSet(pathDef.builder));
    for (let step = 1; step <= 6; step++) {
      at.push('builder step ' + step);
      const [ta, tb] = await both((d) => d.builderTitle());
      await compare('numbers', (d) => d.numbers());
      await copy('text');
      at.pop();
      if (/Review and start/.test(ta) || /Review and start/.test(tb) || /About this household/.test(ta)) break;
      await both((d) => d.builderNext());
    }
    if (pathDef.expectGate) return diffs;
    await both((d) => d.builderNext()); // Start Simulation
  } else {
    await both((d) => d.selectHousehold(pathDef.household));
    at.push('region');
    if (pathDef.ca) {
      await both((d) => d.toggleCA());
      for (const a of pathDef.answers || []) await both((d) => d.answer(a));
    }
    await compare('numbers', (d) => d.numbers());
    await copy('text');
    at.pop();
    await both((d) => d.selectRegion(pathDef.region));
  }

  at.push('household intro');
  await both((d) => d.expandBreakdown());
  await compare('numbers', (d) => d.numbers());
  await copy('text');
  await both((d) => d.beginRounds());
  at.pop();

  let pendingAfter = null;
  let wentBack = false;
  for (let r = 0; r < 12; r++) {
    const [doneA, doneB] = await both((d) => d.atResults());
    if (doneA !== doneB) {
      diffs.push({ where: `round ${r + 1}`, reference: doneA ? 'results' : 'round', website: doneB ? 'results' : 'round' });
      return diffs;
    }
    if (doneA) break;
    at.push(`round ${r + 1}`);
    const [ma] = await compare('metrics', (d) => d.roundMetrics());
    if (pendingAfter) checkAfter(pendingAfter, ma, diffs, at);
    // "Previous round" paths: from round 3, go back once, then play on.
    if (pathDef.goBack && r === 2 && !wentBack) {
      wentBack = true;
      pendingAfter = null;
      await both((d) => d.previousRound());
      at.pop();
      r -= 2;
      continue;
    }
    await both((d) => d.openProgramInfo());
    await compare('numbers', (d) => d.numbers({ hideOptions: true }));
    const pick = pathDef.pattern === 'first' ? () => 0 : pathDef.pattern === 'last' ? (g, n) => n - 1 : r % 2 === 0 ? () => 0 : (g, n) => n - 1;
    const [ga, gb] = await both((d) => d.pickOptions(pick));
    if (ga !== gb) diffs.push({ where: at.join(' > ') + ' > tradeoff groups', reference: ga, website: gb });
    await copy('text');
    const [, after] = await both((d) => d.confirmAndNext());
    pendingAfter = after ? { after, cutBefore: ma.cut, round: r + 1 } : null;
    at.pop();
  }

  at.push('results');
  const [ra] = await compare('metrics', (d) => d.resultsMetrics());
  if (pendingAfter) checkAfter(pendingAfter, { stability: ra.final }, diffs, at);
  await both((d) => d.openSources());
  await compare('numbers', (d) => d.numbers());
  await copy('text');
  at.pop();
  return diffs;
}

/** The after-confirm panel must show exactly the next screen's numbers, and the cut stamp must not move. */
function checkAfter({ after, cutBefore, round }, next, diffs, at) {
  const want = { stability: next.stability + '%' };
  const got = { stability: after.stability };
  if (next.support) {
    want.support = next.support;
    got.support = after.support;
    const [kind, amt] = (next.balance || '').split(' ');
    want.balance = (kind === 'Shortfall' ? '−' : '+') + amt;
    got.balance = after.balance;
  }
  if (!same(want, got)) diffs.push({ where: `${at.join(' > ')} > after-confirm panel of round ${round}`, reference: want, website: got });
  if (cutBefore && after.cutAfterConfirm && after.cutAfterConfirm !== cutBefore.replace(/\s+/g, '')) {
    diffs.push({ where: `round ${round} > cut stamp after confirm`, reference: cutBefore, website: after.cutAfterConfirm });
  }
}

/** A short preset run used to unlock Build Your Own. */
async function playPreset(p, ref, web) {
  const both = async (fn) => Promise.all([fn(ref), fn(web)]);
  await both((d) => d.selectHousehold(p.household));
  await both((d) => d.selectRegion(p.region));
  await both((d) => d.beginRounds());
  for (let r = 0; r < 12; r++) {
    const [done] = await both((d) => d.atResults());
    if (done) break;
    await both((d) => d.pickOptions(() => 0));
    await both((d) => d.confirmAndNext());
  }
}

async function main() {
  let paths = buildPaths();
  if (ONLY) paths = paths.filter((p) => p.id.includes(ONLY));
  if (QUICK) paths = paths.filter((p, i, all) => all.findIndex((x) => x.group === p.group) === i);
  fs.mkdirSync(OUT, { recursive: true });
  console.log(`${paths.length} paths, ${WORKERS} workers\nreference: ${REF_URL}\nwebsite:   ${NEW_URL}\n`);

  const browser = await chromium.launch();
  const results = [];
  const copyLog = [];
  const consoleErrors = [];
  let next = 0;
  const t0 = Date.now();

  async function worker(w) {
    const refCtx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const webCtx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    // Vercel Analytics' script only exists on Vercel; stub it when testing a local build.
    if (/^http:\/\/localhost/.test(NEW_URL)) await webCtx.route('**/_vercel/insights/**', (r) => r.fulfill({ status: 200, contentType: 'application/javascript', body: '' }));
    const refPage = await refCtx.newPage();
    const webPage = await webCtx.newPage();
    webPage.on('pageerror', (e) => consoleErrors.push(String(e.message)));
    webPage.on('console', (m) => m.type() === 'error' && consoleErrors.push(m.text()));
    // Download Summary and share links open new pages; none are used here.
    const ref = new RefDriver(refPage, REF_URL);
    const web = new NewDriver(webPage, NEW_URL);
    while (next < paths.length) {
      const p = paths[next++];
      let diffs;
      try {
        diffs = await runPath(p, ref, web, copyLog);
      } catch (e) {
        diffs = [{ where: 'harness', error: String(e.message).split('\n')[0] }];
      }
      results.push({ id: p.id, diffs });
      const n = results.length;
      process.stdout.write(`[${n}/${paths.length}] ${diffs.length ? 'DIFF' : 'ok  '} ${p.id}${diffs.length ? '  (' + diffs.length + ')' : ''}\n`);
    }
    await refCtx.close();
    await webCtx.close();
  }

  await Promise.all(Array.from({ length: Math.min(WORKERS, paths.length) }, (_, i) => worker(i)));
  await browser.close();

  const failed = results.filter((r) => r.diffs.length);
  const totalDiffs = failed.reduce((s, r) => s + r.diffs.length, 0);
  const missing = missingLines(copyLog);
  const unexpected = missing.filter((m) => !m.allowed);
  const report = {
    paths: results.length,
    differences: totalDiffs,
    failedPaths: failed,
    copy: { missing: missing.length, unexpected: unexpected.length, lines: missing },
    consoleErrors: [...new Set(consoleErrors)],
    seconds: Math.round((Date.now() - t0) / 1000),
  };
  fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify(report, null, 2));

  const md = [
    `# Simulator equality check`,
    ``,
    `- Paths played: **${results.length}**`,
    `- Number differences: **${totalDiffs}**${totalDiffs ? ` (in ${failed.length} paths)` : ''}`,
    `- Reference text missing from the website: ${missing.length} line(s), ${unexpected.length} not on the allowed-removals list`,
    `- Website console errors: ${report.consoleErrors.length}`,
    ``,
    ...(failed.length ? ['## Differences', '', ...failed.slice(0, 50).flatMap((f) => [`### ${f.id}`, '```json', JSON.stringify(f.diffs.slice(0, 5), null, 2), '```'])] : []),
    `## Copy check`,
    ``,
    ...missing.map((m) => `- ${m.allowed ? '(allowed: ' + m.allowed + ')' : '**NOT ALLOWED**'} "${m.line}" — first seen at ${m.where}`),
    ``,
    `Allowed removals: ${ALLOWED_REMOVALS.map((a) => a.label).join('; ')}.`,
  ].join('\n');
  fs.writeFileSync(path.join(OUT, 'report.md'), md + '\n');

  console.log(`\n${results.length} paths, ${totalDiffs} differences, ${unexpected.length} unexpected copy removals, ${report.consoleErrors.length} console errors (${report.seconds}s)`);
  console.log(`report: ${path.join(OUT, 'report.md')}`);
  process.exit(totalDiffs || unexpected.length || report.consoleErrors.length ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(2);
});
