#!/usr/bin/env node
/**
 * Keyboard-only play-through of /simulator: Tab to each control and press
 * Enter or Space; no mouse. Plays Maria (National Average) and the Ramirez
 * family (California on, Bay Area) to the results screen, then Start over.
 *
 * Usage: node simulator/tests/keyboard.js http://localhost:3000/simulator
 */
'use strict';
// Playwright from the environment, or the copy the frontend already installs.
const { chromium } = (() => {
  try {
    return require('playwright');
  } catch {
    return require(require('path').join(__dirname, '..', '..', 'frontend', 'node_modules', 'playwright'));
  }
})();

const url = process.argv[2] || 'http://localhost:3000/simulator';

async function tabTo(page, describe, test, key = 'Enter') {
  for (let i = 0; i < 400; i++) {
    await page.keyboard.press('Tab');
    const ok = await page.evaluate(test);
    if (ok) {
      await page.keyboard.press(key);
      await page.waitForTimeout(120);
      return;
    }
  }
  throw new Error('could not reach by keyboard: ' + describe);
}

const focused = (re) => new Function(`const e = document.activeElement; return !!e && ${re};`);

async function playRounds(page) {
  for (let r = 0; r < 12; r++) {
    if (await page.locator('[data-sim="results"]').count()) return r;
    const groups = await page.locator('[role="radiogroup"]').count();
    if (process.env.DEBUG) console.log('round', r + 1, await page.locator('[data-sim="round"] h1').textContent(), 'groups', groups);
    for (let g = 0; g < groups; g++) {
      await tabTo(page, `round ${r + 1} option in group ${g + 1}`, focused(`e.matches('[data-sim="option"]') && e.closest('[role="radiogroup"]') === document.querySelectorAll('[role="radiogroup"]')[${g}]`), ' ');
    }
    if (groups) await tabTo(page, `round ${r + 1} confirm`, focused(`/^confirm/i.test(e.innerText.trim())`));
    // "Next policy round" takes focus after confirming; otherwise Tab to it.
    const nextFocused = await page.evaluate(() => document.activeElement.tagName === 'BUTTON' && /next policy round/i.test(document.activeElement.innerText));
    if (nextFocused) await page.keyboard.press('Enter');
    else await tabTo(page, `round ${r + 1} next`, focused(`/next policy round/i.test(e.innerText)`));
    await page.waitForTimeout(150);
  }
  throw new Error('did not reach results');
}

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-sim-root][data-ready]');
  const runs = [
    { name: 'Maria — National Average', household: 'Maria', region: 'National Average', ca: false },
    { name: 'Ramirez — California on, Bay Area', household: 'Ramirez', region: 'Bay Area', ca: true },
  ];
  for (const [i, run] of runs.entries()) {
    if (i === 0) await tabTo(page, 'Begin the simulation', focused(`/begin the simulation/i.test(e.innerText)`));
    await tabTo(page, run.household + ' card', focused(`e.matches('[data-sim="household-card"]') && e.innerText.includes(${JSON.stringify(run.household)})`));
    if (run.ca) {
      await tabTo(page, 'California switch', focused(`e.matches('[data-sim="ca-toggle"]')`), ' ');
      await tabTo(page, 'Medi-Cal answer', focused(`/No one enrolled/.test(e.innerText)`));
    }
    await tabTo(page, run.region, focused(`e.matches('[data-sim="region"]') && e.dataset.name === ${JSON.stringify(run.region)}`));
    await tabTo(page, 'Begin policy rounds', focused(`/begin policy rounds/i.test(e.innerText)`));
    const rounds = await playRounds(page);
    const final = await page.locator('[data-sim="final-stability"]').textContent();
    console.log(`ok  ${run.name}: ${rounds} rounds by keyboard, results screen reached (final stability ${final})`);
    await tabTo(page, 'Start over', focused(`e.getAttribute('aria-label') === 'Start over with a new household'`));
  }
  await browser.close();
  if (errors.length) {
    console.log('page errors:', errors);
    process.exit(1);
  }
})().catch((e) => {
  console.error('FAIL', e.message);
  process.exit(1);
});
