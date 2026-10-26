/**
 * Page drivers for the numbers-equality harness: one for the reference build
 * (simulator/reference/index.html) and one for the website's /simulator.
 * Both expose the same steps, and every snapshot has the same shape, so the
 * harness can compare them field by field.
 */
'use strict';

const NUM = /[−-]?\$?\d[\d,]*(?:\.\d+)?%?/g;
const normNum = (s) => s.replace('−', '-');

/** Number tokens in a block of text, ignoring the results screen's generation date. */
function numbersIn(text) {
  const clean = text.replace(/Generated:? [A-Z][a-z]+ \d{1,2}, \d{4}/g, '');
  return [...new Set((clean.match(NUM) || []).map(normNum))].sort();
}

/** Reads the budget card text ("Surplus: $113 ... Income $1,680 ...") into numbers. */
function parseMoney(s) {
  if (s == null) return null;
  const m = String(s).replace('−', '-').match(/-?\$?-?[\d,]+/);
  return m ? Number(m[0].replace(/[$,]/g, '')) : null;
}

// ─── Reference build ────────────────────────────────────────────────────────
class RefDriver {
  constructor(page, url) {
    this.page = page;
    this.url = url;
    this.name = 'reference';
  }

  async open() {
    await this.page.goto(this.url, { waitUntil: 'load', timeout: 120000 });
    await this.page.waitForSelector('text=Begin the simulation', { timeout: 120000 });
  }

  /** Visible text. With hideOptions, tradeoff option buttons are left out. */
  async text({ hideOptions = false } = {}) {
    return this.page.evaluate((hide) => {
      const opts = hide ? [...document.querySelectorAll('button')].filter((b) => /^[○◉]/.test(b.innerText.trim())) : [];
      // Never visible to users: the sticky bar off screen, and the skip link until focused.
      const offscreen = [...document.querySelectorAll('.v2-sticky-bar:not(.visible), a[href="#main-content"]')];
      // Allowed removals (spec): the About us block and the 501(c)(3) line.
      const removed = [...document.querySelectorAll('div, p')].filter(
        (e) => (/^ABOUT US/.test(e.innerText) && e.querySelector('.pre-header')) || /^mBOLDen Change is a 501\(c\)\(3\) nonprofit/.test(e.innerText),
      );
      const all = [...opts, ...offscreen, ...removed];
      all.forEach((e) => (e.dataset.prevDisplay = e.style.display, e.style.display = 'none'));
      const t = document.body.innerText;
      all.forEach((e) => (e.style.display = e.dataset.prevDisplay));
      return t;
    }, hideOptions);
  }

  async numbers(opts) {
    return numbersIn(await this.text(opts));
  }

  async begin() {
    await this.page.click('button:has-text("Begin the simulation")');
  }

  async householdCards() {
    return this.page.$$eval('button', (bs) =>
      bs
        .filter((b) => /Income:/.test(b.innerText) && /Stability:/.test(b.innerText))
        .map((b) => {
          const t = b.innerText;
          const g = (re) => (t.match(re) || [])[1];
          return { name: b.querySelector('h3').innerText.trim(), income: g(/Income: (\$[\d,]+)/), support: g(/Support: (\$[\d,]+)/), expenses: g(/Expenses: (\$[\d,]+)/), stability: g(/Stability: (\d+%)/) };
        }),
    );
  }

  async selectHousehold(name) {
    await this.page.locator('button', { has: this.page.locator('h3', { hasText: name }) }).first().click();
  }

  async openBuilder() {
    await this.page.locator('button', { has: this.page.locator('h3', { hasText: 'Build Your Own Household' }) }).click();
  }

  async toggleCA() {
    await this.page.click('button[role="switch"]');
  }

  async answer(label) {
    await this.page.locator('button', { hasText: label }).first().click();
  }

  async selectRegion(name) {
    const re = new RegExp('^' + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(\\s|\\(|$)');
    await this.page.locator('button', { has: this.page.locator('h3', { hasText: re }) }).first().click();
  }

  async expandBreakdown() {
    await this.page.click('button[aria-label="Toggle benefits and expenses breakdown"]');
  }

  async beginRounds() {
    await this.page.click('button:has-text("Begin policy rounds")');
  }

  async atResults() {
    return (await this.page.locator('text=SIMULATION COMPLETE').count()) > 0;
  }

  async roundMetrics() {
    return this.page.evaluate(() => {
      const t = document.body.innerText;
      const round = (t.match(/Round (\d+) of (\d+)/) || []).slice(1).join('/');
      const meter = [...document.querySelectorAll('[role="status"]')].find((e) => /Household stability/.test(e.getAttribute('aria-label') || ''));
      const stability = meter ? (meter.getAttribute('aria-label').match(/(\d+)%/) || [])[1] : null;
      const budget = [...document.querySelectorAll('div')].find((d) => d.children.length && /^Monthly Budget/.test(d.innerText) && d.querySelector('.space-y-2'));
      const bt = budget ? budget.innerText : '';
      const g = (re) => (bt.match(re) || [])[1];
      const balance = g(/(Surplus|Shortfall): (\$[\d,]+)/) ? (bt.match(/(Surplus|Shortfall): (\$[\d,]+)/).slice(1).join(' ')) : null;
      const pill = [...document.querySelectorAll('span[title]')].find((s) => /models the combined effect/.test(s.title));
      return { round, stability, income: g(/Income\s+(\$[\d,]+)/), support: g(/Support\s+(\$[\d,]+)/), expenses: g(/Expenses\s+(\$[\d,]+)/), balance, cut: pill ? pill.innerText.trim() : null };
    });
  }

  /** Clicks option `pick(groupIndex, count)` in every tradeoff group on screen. */
  async pickOptions(pick) {
    return this.page.evaluate((pickSrc) => {
      const pickFn = new Function('g', 'n', 'return (' + pickSrc + ')(g, n)');
      const opts = [...document.querySelectorAll('button')].filter((b) => /^[○◉]/.test(b.innerText.trim()));
      const groups = [];
      for (const o of opts) {
        let g = groups.find((x) => x.parent === o.parentElement);
        if (!g) groups.push((g = { parent: o.parentElement, items: [] }));
        g.items.push(o);
      }
      groups.forEach((g, i) => g.items[pickFn(i, g.items.length)].click());
      return groups.length;
    }, pick.toString());
  }

  async previousRound() {
    await this.page.locator('button', { hasText: 'Previous round' }).first().click();
  }

  async openProgramInfo() {
    const b = this.page.locator('button', { hasText: 'What is this program?' });
    if (await b.count()) await b.first().click();
  }

  /** Confirms (or continues) the round. Returns null: the reference has no after-confirm panel. */
  async confirmAndNext() {
    const btn = this.page.locator('button', { hasText: /next round|Next policy round/ }).last();
    await btn.click();
    return null;
  }

  async resultsMetrics() {
    return this.page.evaluate(() => {
      const t = document.body.innerText;
      const receipt = document.querySelector('.v2-receipt');
      const lines = receipt ? [...receipt.querySelectorAll('.v2-receipt-line, .v2-receipt-total')].map((l) => l.innerText.replace(/\s+/g, ' ').trim()) : [];
      const chart = [...document.querySelectorAll('svg[role="img"] g > text[font-weight="bold"]')].map((x) => x.textContent);
      const labels = [...document.querySelectorAll('svg[role="img"] g > text[font-size="7"]')].map((x) => x.textContent);
      return { receipt: lines, chart, chartLabels: labels, final: (t.match(/Final Household Stability[\s\S]*?(\d+)%/) || [])[1] };
    });
  }

  async openSources() {
    await this.page.click('button[aria-label="Toggle Sources and Methodology"]');
  }

  async restart() {
    await this.page.click('button[aria-label="Start over with a new household"]');
  }

  // Builder
  async builderSet({ adults, children, income, status }) {
    const p = this.page;
    await p.locator('button', { hasText: adults === 1 ? '1 adult' : '2 adults' }).first().click();
    await p.locator('select').first().selectOption(String(children));
    await p.locator('input[type="number"]').first().fill(String(income));
    const label = { citizen: 'SSN (US Citizen', mixed: 'ITIN (Mixed-Status Family)', undocumented: 'ITIN (Fully Undocumented)' }[status];
    await p.locator('label', { hasText: label }).locator('input').check();
  }

  async builderNext() {
    const b = this.page.locator('button', { hasText: /^(Next →|Start Simulation →)$/ });
    await b.first().click();
  }

  async builderTitle() {
    return this.page.evaluate(() => (document.querySelector('h2') || {}).innerText || '');
  }
}

// ─── Website build ──────────────────────────────────────────────────────────
class NewDriver {
  constructor(page, url) {
    this.page = page;
    this.url = url;
    this.name = 'website';
  }

  async open() {
    await this.page.goto(this.url, { waitUntil: 'load', timeout: 120000 });
    await this.page.waitForSelector('[data-sim-root][data-ready]', { timeout: 120000 });
  }

  /** Visible simulator text, without the site header/footer or [data-sim-ignore] parts. */
  async text({ hideOptions = false } = {}) {
    return this.page.evaluate((hide) => {
      const root = document.querySelector('[data-sim-root]');
      const hidden = [...root.querySelectorAll(hide ? '[data-sim-ignore], [data-sim="option"]' : '[data-sim-ignore]')];
      hidden.forEach((e) => (e.dataset.prevDisplay = e.style.display, e.style.display = 'none'));
      const t = root.innerText;
      hidden.forEach((e) => (e.style.display = e.dataset.prevDisplay));
      return t;
    }, hideOptions);
  }

  async numbers(opts) {
    return numbersIn(await this.text(opts));
  }

  async begin() {
    await this.page.click('button:has-text("Begin the simulation")');
  }

  async householdCards() {
    return this.page.$$eval('[data-sim="household-card"]', (cards) =>
      cards.map((c) => {
        const t = c.innerText;
        const g = (re) => (t.match(re) || [])[1];
        const name = c.querySelector('span').textContent.replace(/\s+/g, ' ').trim();
        return { name, income: g(/INCOME\s+(\$[\d,]+)/i), support: g(/SUPPORT\s+(\$[\d,]+)/i), expenses: g(/EXPENSES\s+(\$[\d,]+)/i), stability: g(/Stability: (\d+%)/) };
      }),
    );
  }

  async selectHousehold(name) {
    await this.page.locator('[data-sim="household-card"]', { hasText: name.split(' — ')[0] }).first().click();
  }

  async openBuilder() {
    await this.page.locator('button', { hasText: 'Build Your Own Household' }).click();
  }

  async toggleCA() {
    await this.page.click('[data-sim="ca-toggle"]');
  }

  async answer(label) {
    await this.page.locator('button', { hasText: label }).first().click();
  }

  async selectRegion(name) {
    await this.page.locator(`[data-sim="region"][data-name="${name}"]`).click();
  }

  async expandBreakdown() {
    await this.page.click('[data-sim="breakdown-toggle"]');
  }

  async beginRounds() {
    await this.page.click('button:has-text("Begin policy rounds")');
  }

  async atResults() {
    return (await this.page.locator('[data-sim="results"]').count()) > 0;
  }

  async roundMetrics() {
    return this.page.evaluate(() => {
      const q = (s) => {
        const e = document.querySelector(`[data-sim="playbar"] [data-sim="${s}"]`);
        return e ? e.textContent.trim() : null;
      };
      const round = ((q('round') || '').match(/Round (\d+) of (\d+)/) || []).slice(1).join('/');
      const bal = (q('balance') || '').match(/(Surplus|Shortfall): (\$[\d,]+)/);
      const cut = document.querySelector('[data-sim="cut"]');
      return {
        round,
        stability: (q('stability') || '').replace('%', ''),
        income: q('income'),
        support: q('support'),
        expenses: q('expenses'),
        balance: bal ? bal.slice(1).join(' ') : null,
        cut: cut ? cut.textContent.replace(/\s+/g, '').replace('/month', '/month') : null,
      };
    });
  }

  async pickOptions(pick) {
    return this.page.evaluate((pickSrc) => {
      const pickFn = new Function('g', 'n', 'return (' + pickSrc + ')(g, n)');
      const groups = [...document.querySelectorAll('[role="radiogroup"]')];
      groups.forEach((g, i) => {
        const items = [...g.querySelectorAll('[data-sim="option"]')];
        items[pickFn(i, items.length)].click();
      });
      return groups.length;
    }, pick.toString());
  }

  async previousRound() {
    await this.page.locator('[data-sim="round"] button', { hasText: 'Previous round' }).first().click();
  }

  async openProgramInfo() {
    const b = this.page.locator('[data-sim="program-toggle"]');
    if (await b.count()) await b.first().click();
  }

  /**
   * Clicks Confirm (when the round has tradeoffs), reads the after-confirm
   * panel, then clicks Next policy round. Returns the panel's after values.
   */
  async confirmAndNext() {
    const p = this.page;
    const confirm = p.locator('[data-sim="round"] button', { hasText: /^Confirm/ });
    let after = null;
    if (await confirm.count()) {
      await confirm.first().click();
      await p.waitForSelector('[data-sim="what-changed"]');
      after = await p.evaluate(() => {
        const vals = [...document.querySelectorAll('[data-sim="what-changed"] [data-sim="after"]')].map((e) => e.textContent.trim());
        const cut = document.querySelector('[data-sim="cut"]');
        return { support: vals[0], balance: vals[1], stability: vals[2], cutAfterConfirm: cut ? cut.textContent.replace(/\s+/g, '') : null };
      });
    }
    await p.locator('[data-sim="round"] button', { hasText: 'Next policy round' }).first().click();
    return after;
  }

  async resultsMetrics() {
    return this.page.evaluate(() => {
      const receipt = document.querySelector('[data-sim="receipt"]');
      const lines = receipt
        ? [...receipt.children].filter((l) => l.tagName === 'P' && l.querySelector('strong')).map((l) => l.innerText.replace(/\s+/g, ' ').trim())
        : [];
      const pts = [...document.querySelectorAll('[data-sim="chart-point"]')];
      return {
        receipt: lines,
        chart: pts.map((g) => g.querySelectorAll('text')[0].textContent),
        chartLabels: pts.map((g) => g.querySelectorAll('text')[2]).filter(Boolean).map((x) => x.textContent),
        final: (document.querySelector('[data-sim="final-stability"]') || {}).textContent.replace('%', ''),
      };
    });
  }

  async openSources() {
    await this.page.click('[data-sim="sources-toggle"]');
  }

  async restart() {
    await this.page.locator('button[aria-label="Start over with a new household"]').first().click();
  }

  async builderSet({ adults, children, income, status }) {
    const p = this.page;
    await p.locator('button', { hasText: adults === 1 ? '1 adult' : '2 adults' }).first().click();
    await p.selectOption('#sim-hh-children', String(children));
    await p.fill('#sim-hh-income', String(income));
    const label = { citizen: 'SSN (US Citizen', mixed: 'ITIN (Mixed-Status Family)', undocumented: 'ITIN (Fully Undocumented)' }[status];
    await p.locator('label', { hasText: label }).locator('input').check();
  }

  async builderNext() {
    await this.page.locator('button', { hasText: /^(Next|Start Simulation)$/ }).first().click();
  }

  async builderTitle() {
    return this.page.evaluate(() => (document.querySelector('[data-sim-root] h1') || {}).innerText || '');
  }
}

module.exports = { RefDriver, NewDriver, numbersIn, parseMoney };
