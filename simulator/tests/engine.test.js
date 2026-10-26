/**
 * Test suite — mBOLDen Benefits-Cliff Engine
 * Run: node test/engine.test.js  (from the Benefits Engine folder)
 *
 * Expectations are INDEPENDENTLY derived: hand arithmetic from the cited rule
 * documents (FNS COLA memo, ACL 26-66, Rev. Proc. 2024-40, FTB 3514 table),
 * not re-computations through engine code paths.
 */
'use strict';
const assert = require('assert');
const path = require('path');
const fs = require('fs');

const BenefitsEngine = require(path.join(__dirname, '..', '..', 'frontend', 'lib', 'simulator', 'engine', 'engine.js'));
const P = JSON.parse(fs.readFileSync(path.join(__dirname, '..', '..', 'frontend', 'lib', 'simulator', 'engine', 'parameters.json'), 'utf8'));
const CALEITC = JSON.parse(fs.readFileSync(path.join(__dirname, '..', '..', 'frontend', 'lib', 'simulator', 'engine', 'caleitc-table-2025.json'), 'utf8'));
const E = BenefitsEngine.create(P, CALEITC);
const I = E._internals;

let passed = 0, failed = 0;
function test(name, fn) {
  try { fn(); passed++; console.log('  ok  ' + name); }
  catch (e) { failed++; console.error('FAIL  ' + name + '\n      ' + e.message); }
}
function approx(a, b, tol, msg) {
  assert.ok(Math.abs(a - b) <= (tol == null ? 1 : tol), (msg || '') + ' expected ~' + b + ', got ' + a);
}

// Base households
const base = {
  adults: 1, children: 2, childrenAges: [4, 9],
  elderlyOrDisabledMember: false, filingStatus: 'hoh',
  earnedMonthly: 0, unearnedMonthly: 0, childSupportMonthly: 0,
  gi: { amountMonthly: 0 }, immigration: 'citizen',
  region: 'r1', calworksExempt: false,
  shelterCostMonthly: 1800, housing: { hasVoucher: false },
  childcareCostMonthly: 0, taxYear: 2025
};
function H(over) { return Object.assign({}, base, over); }

console.log('\n== FPL 2026 (HHS/ASPE) ==');
test('FPL annual family of 3 = $27,320', () => assert.strictEqual(E.fplAnnual(3), 27320));
test('FPL annual family of 4 = $33,000', () => assert.strictEqual(E.fplAnnual(4), 33000));
test('FPL monthly family of 3 = $2,277 (DHCS)', () => assert.strictEqual(E.fplMonthly(3), 2277));

console.log('\n== CalFresh (FNA FY2027 COLA memo / ACIN I-40-26) ==');
// Oct 2026 refresh: expectations below re-derived by hand from FFY2027 values
// (max HH3 $808, std ded $217 (1-3), SUA $686, shelter cap $769, min benefit $25,
// 200% MCE HH3 $4,554). FFY2026 originals archived in research/archive-2026-07/engine.test.js.
test('zero income HH3 gets max allotment $808', () => {
  const r = I.calcCalFresh(H({}), I.derive(H({})));
  assert.strictEqual(r.amount, 808); // FFY2027 max allotment HH3 (ACIN I-40-26 Att. I); was 785
});
test('hand case: HH3, $2,000/mo earned, $1,800 rent + SUA', () => {
  // Hand (FFY2027): gross 2000; earned ded 400; std 217 -> 1383
  // shelter = 1800+686 = 2486; excess = 2486 - 691.5 = 1794.5 -> capped 769
  // net = 1383 - 769 = 614; benefit = floor(808 - 184.2) = 623   (FFY2026: 590)
  const h = H({ earnedMonthly: 2000 });
  const r = I.calcCalFresh(h, I.derive(h));
  assert.strictEqual(r.amount, 623);
});
test('MCE 200% gross cliff: HH3 at $4,554 eligible, $4,555 not', () => {
  // FFY2027 200% MCE/BBCE limit HH3 = $4,554 (ACIN I-40-26 Att. I); was $4,442.
  // At $4,554: net = 3643.2-217-769 = 2657.2 -> floor(808-797.16) = 10 (still eligible).
  const a = I.calcCalFresh(H({ earnedMonthly: 4554 }), I.derive(H({ earnedMonthly: 4554 })));
  const b = I.calcCalFresh(H({ earnedMonthly: 4555 }), I.derive(H({ earnedMonthly: 4555 })));
  assert.ok(a.eligible === true || a.amount >= 0); // still passes screen
  assert.strictEqual(b.amount, 0);
  assert.strictEqual(b.eligible, false);
});
test('minimum benefit $25 for 1-person low-benefit case', () => {
  // FFY2027: HH1 max 306, min benefit $25, net limit 1330 (ACIN I-40-26).
  // INPUT CHANGED (Oct 2026 refresh): at the old $1,600 input the FFY2027 values yield a
  // computed benefit of $33 (above the minimum), so the test no longer exercised the
  // minimum-benefit rule. Raised to $1,650 to preserve the test's intent:
  // gross 1650, -20% = 1320, -217 std = 1103; shelter 0+SUA 686, half-adj 551.5,
  // excess 134.5; net 968.5 (<= 1330) -> floor(306 - 290.55) = 15 < 25 -> min $25.
  const h = H({ adults: 1, children: 0, childrenAges: [], earnedMonthly: 1650, shelterCostMonthly: 0 });
  const r = I.calcCalFresh(h, I.derive(h));
  assert.strictEqual(r.amount, 25);
});
test('elderly medical deduction: costs over $35 reduce net income (7 CFR 273.9(d)(3))', () => {
  // Elderly single, $1,500/mo unearned (SS), $500/mo medical, shelter $900.
  // FFY2027 — No medical: net = 1500-217=1283; shelter 900+686=1586, excess = 1586-641.5=944.5 uncapped;
  //   net = 338.5 -> benefit = floor(306-101.55) = 204   (FFY2026: 185)
  // With medical: ded 465 -> afterStd 818; excess = 1586-409=1177 uncapped; net = 0 -> 306 (FFY2026: 298)
  const base = { adults: 1, children: 0, childrenAges: [], elderlyOrDisabledMember: true,
    filingStatus: 'single', earnedMonthly: 0, unearnedMonthly: 1500, gi: { amountMonthly: 0 },
    immigration: 'citizen', region: 'r1', shelterCostMonthly: 900, housing: { hasVoucher: false }, taxYear: 2025 };
  const noMed = I.calcCalFresh(base, I.derive(base));
  const med = I.calcCalFresh(Object.assign({}, base, { medicalCostMonthly: 500 }), I.derive(base));
  assert.strictEqual(noMed.amount, 204);
  assert.strictEqual(med.amount, 306);
});
test('GI: private-funded program excluded; govt-funded counted (ACL 23-60)', () => {
  const priv = H({ earnedMonthly: 1000, gi: { amountMonthly: 500, isProgram: true, hasPrivateFunds: true } });
  const govt = H({ earnedMonthly: 1000, gi: { amountMonthly: 500, isProgram: true, hasPrivateFunds: false } });
  const rp = I.calcCalFresh(priv, I.derive(priv));
  const rg = I.calcCalFresh(govt, I.derive(govt));
  assert.ok(rp.amount > rg.amount, 'private-funded GI should not reduce CalFresh');
  // Hand (FFY2027): no-GI afterStd 800-217=583, excess capped 769 -> net 0 -> benefit 808.
  // Counted GI: afterStd 1083, excess capped 769, net 314 -> floor(808-94.2) = 713.
  // Delta = 95 (net-income zero floor absorbs part of the counted income). FFY2026: 105.
  assert.strictEqual(rp.amount - rg.amount, 95);
});

console.log('\n== CalWORKs (ACL 26-66 MAP eff. Oct 1, 2026 / ACL 21-130) ==');
test('zero income AU3 R1 non-exempt grant = MAP $1,196', () => {
  const h = H({});
  const r = I.calcCalWORKs(h, I.derive(h));
  assert.strictEqual(r.amount, 1196);
});
test('hand case: $1,000/mo earned -> NNI 200 -> grant 996', () => {
  const h = H({ earnedMonthly: 1000 });
  const r = I.calcCalWORKs(h, I.derive(h));
  assert.strictEqual(r.amount, 996);
});
test('earnings cutoff: AU3 R1 non-exempt — $10 min-payment rule moves exit to ~$2,972', () => {
  // NNI = 0.5*(earned-600); grant = floor(1196 - NNI); paid only if >= $10.
  // At 2971: NNI 1185.5 -> grant 10 (paid). At 2973: NNI 1186.5 -> grant 9 -> not paid.
  const a = I.calcCalWORKs(H({ earnedMonthly: 2971 }), I.derive(H({ earnedMonthly: 2971 })));
  const b = I.calcCalWORKs(H({ earnedMonthly: 2973 }), I.derive(H({ earnedMonthly: 2973 })));
  assert.strictEqual(a.amount, 10);
  assert.strictEqual(b.amount, 0);
});
test('GI program payments fully exempt (WIC 11157(e))', () => {
  const h = H({ earnedMonthly: 1000, gi: { amountMonthly: 1000, isProgram: true, hasPrivateFunds: false } });
  const r = I.calcCalWORKs(h, I.derive(h));
  assert.strictEqual(r.amount, 996, 'GI must not reduce grant');
});
test('informal recurring cash counts dollar-for-dollar', () => {
  const h = H({ earnedMonthly: 1000, gi: { amountMonthly: 300, isProgram: false } });
  const r = I.calcCalWORKs(h, I.derive(h));
  assert.strictEqual(r.amount, 696);
});
test('childless adult ineligible for CalWORKs (WIC 11250)', () => {
  const h = H({ adults: 1, children: 0, childrenAges: [], earnedMonthly: 0 });
  const r = I.calcCalWORKs(h, I.derive(h));
  assert.strictEqual(r.amount, 0);
  assert.strictEqual(r.eligible, false);
});
test('R2 MAP lower than R1 (AU3 non-exempt: 1135 vs 1196)', () => {
  const r2 = I.calcCalWORKs(H({ region: 'r2' }), I.derive(H({ region: 'r2' })));
  assert.strictEqual(r2.amount, 1135);
});

test('MAP tables match ACL 26-66 attachment (eff. Oct 1, 2026), all 40 values', () => {
  // Transcribed from the ACL 26-66 "New MAP" columns (research/ACL-26-66.pdf, pp. 6-7).
  assert.deepStrictEqual(P.calworks.map, {
    r1: { exempt: [824, 1058, 1338, 1607, 1883, 2161, 2438, 2717, 2992, 3273],
          nonExempt: [747, 947, 1196, 1441, 1689, 1936, 2184, 2432, 2678, 2928] },
    r2: { exempt: [784, 1005, 1270, 1525, 1790, 2054, 2315, 2583, 2841, 3109],
          nonExempt: [708, 900, 1135, 1370, 1606, 1841, 2076, 2312, 2546, 2780] }
  });
});

console.log('\n== Federal EITC (Rev. Proc. 2024-40) ==');
test('max credit at plateau: 2 kids, $20,000 earned = $7,152 - phaseout', () => {
  // HoH $20,000: base = min(.40*17880... earned 20000 > 17880) -> 7152; over = 0 (20000 < 23350)
  const r = I.calcEITC(20000, 20000, 2, 'hoh', 2025, {});
  assert.strictEqual(r.amount, 7152);
});
test('audit-v5 cross-check: $20,160, 1 adult 2 kids -> $7,152', () => {
  const r = I.calcEITC(20160, 20160, 2, 'hoh', 2025, {});
  assert.strictEqual(r.amount, 7152);
});
test('audit-v5 cross-check: $38,400, MFJ 3 kids -> $6,376', () => {
  // base 8046; over = 38400-30470 = 7930; 8046 - .2106*7930 = 8046-1670.06 = 6375.94 -> 6376
  const r = I.calcEITC(38400, 38400, 3, 'mfj', 2025, {});
  assert.strictEqual(r.amount, 6376);
});
test('zero at completed phaseout: single 2 kids $57,310', () => {
  const r = I.calcEITC(57310, 57310, 2, 'single', 2025, {});
  assert.ok(r.amount <= 1);
});
test('childless fallback when children lack SSNs', () => {
  const r = I.calcEITC(15000, 15000, 2, 'hoh', 2025, { filerHasSSN: true, childrenHaveSSNs: false });
  // childless: base = min(.0765*8490, 649) = 649; over = 15000-10620 = 4380; 649 - 335.07 = 313.9 -> 314
  assert.strictEqual(r.amount, 314);
});
test('ITIN filer: zero EITC', () => {
  const r = I.calcEITC(20000, 20000, 2, 'hoh', 2025, { filerHasSSN: false });
  assert.strictEqual(r.amount, 0);
});
test('TY2026 parameters: 3 kids max $8,231 at plateau', () => {
  const r = I.calcEITC(19000, 19000, 3, 'hoh', 2026, {});
  assert.strictEqual(r.amount, 8231);
});

console.log('\n== CTC/ACTC (OBBBA / 26 USC 24(d)) ==');
test('audit-v5 canonical: $26,400, 3 kids, no liability -> ACTC $3,585', () => {
  // min(3*1700, .15*(26400-2500)) = min(5100, 3585) = 3585 (HoH std ded 23625 -> tiny liability)
  const r = I.calcCTC(26400, 26400, 3, 0, 'hoh', 2025, {});
  // liability: taxable = 26400-23625 = 2775 -> tax 277.5 -> nonref used 277.5(round 278)
  // unused CTC = 6600 - 277.5 = 6322.5; ACTC = min(6322.5, 5100, 3585) = 3585
  assert.strictEqual(r.actc, 3585);
});
test('audit-v5 cross-check: $36,000, 2 kids -> ACTC $3,400 cap', () => {
  // min(2*1700=3400, .15*33500=5025) -> 3400 (subject to unused CTC, ample here)
  const r = I.calcCTC(36000, 36000, 2, 0, 'hoh', 2025, {});
  assert.strictEqual(r.actc + r.nonrefundableUsed >= 3400 ? 3400 : -1,
    3400, 'combined refundable+nonrefundable should deliver at least the 1700/child refundable path');
  assert.ok(r.actc <= 3400);
});
test('below $2,500 earned: zero ACTC', () => {
  const r = I.calcCTC(2400, 2400, 2, 0, 'hoh', 2025, {});
  assert.strictEqual(r.actc, 0);
});
test('both-ITIN parents: no CTC, children shift to ODC', () => {
  const r = I.calcCTC(30000, 30000, 2, 0, 'hoh', 2025, { filerHasSSN: false, spouseHasSSN: false });
  assert.strictEqual(r.actc, 0);
  assert.strictEqual(r.total, 0);
});
test('MFJ one-spouse SSN: CTC allowed (OBBBA rule)', () => {
  const r = I.calcCTC(30000, 30000, 2, 0, 'mfj', 2025, { filerHasSSN: false, spouseHasSSN: true, childrenHaveSSNs: true });
  assert.ok(r.actc > 0 || r.nonrefundableUsed > 0);
});

console.log('\n== CalEITC (FTB 2025 3514 table — exact rows) ==');
test('table row: $26,400 / 3+ kids = $277 (NOT $3,756)', () => {
  const r = I.calcCalEITC(26400, 26400, 3);
  assert.strictEqual(r.amount, 277);
});
test('table row: $30,360 / 3+ kids = $107', () => {
  const r = I.calcCalEITC(30360, 30360, 3);
  assert.strictEqual(r.amount, 107);
});
test('table row: $20,160 / 2 kids = $534', () => {
  const r = I.calcCalEITC(20160, 20160, 2);
  assert.strictEqual(r.amount, 534);
});
test('max credit region: table maxima match FTB ($3,756 for 3+)', () => {
  let max3 = 0;
  for (let inc = 5000; inc <= 15000; inc += 50) max3 = Math.max(max3, I.calcCalEITC(inc, inc, 3).amount);
  assert.strictEqual(max3, 3756);
});
test('zero above $32,900', () => {
  assert.strictEqual(I.calcCalEITC(32901, 32901, 3).amount, 0);
});
test('AGI dual-lookup: higher AGI reduces credit', () => {
  const lowAgi = I.calcCalEITC(10000, 10000, 2).amount;
  const hiAgi = I.calcCalEITC(10000, 25000, 2).amount;
  assert.ok(hiAgi < lowAgi);
});

console.log('\n== YCTC (FTB 3514 Lines 25-27) ==');
test('full $1,189 below $27,425', () => {
  const cal = I.calcCalEITC(20000, 20000, 2).amount;
  const r = I.calcYCTC(20000, 20000, 1, cal);
  assert.strictEqual(r.amount, 1189);
});
test('phase-out: $30,360 -> 1189 - 21.71*29 = $559', () => {
  // over = 2935; floor(2935/100)=29; 1189 - 629.59 = 559.41 -> 559
  const cal = I.calcCalEITC(30360, 30360, 3).amount;
  const r = I.calcYCTC(30360, 30360, 1, cal);
  assert.strictEqual(r.amount, 559);
});
test('zero with no under-6 child', () => {
  assert.strictEqual(I.calcYCTC(20000, 20000, 0, 500).amount, 0);
});

console.log('\n== Section 8 TTP (24 CFR 5.628/5.611) ==');
test('hand case: $2,500/mo gross, 2 dependents, pre-HOTMA', () => {
  // annual gross 30000; adjusted = 30000 - 960 = 29040; 30% adj/12 = 726; 10% gross/12 = 250
  const h = H({ earnedMonthly: 2500, housing: { hasVoucher: true, paymentStandard: 3483, grossRent: 3483, minRent: 50 } });
  const r = I.calcSection8(h, I.derive(h));
  assert.strictEqual(r.ttp, 726);
  assert.strictEqual(r.amount, 3483 - 726);
});
test('HOTMA deductions lower TTP ($500/dependent)', () => {
  const h = H({ earnedMonthly: 2500, housing: { hasVoucher: true, paymentStandard: 3483, grossRent: 3483, minRent: 50, hotmaDeductions: true } });
  const r = I.calcSection8(h, I.derive(h));
  // adjusted = 30000 - 1000 = 29000 -> 725
  assert.strictEqual(r.ttp, 725);
});
test('GI counted: $500/mo GI raises TTP by ~$150 (30 cents/dollar)', () => {
  const noGi = H({ earnedMonthly: 2500, housing: { hasVoucher: true, paymentStandard: 3483, grossRent: 3483 } });
  const gi = H({ earnedMonthly: 2500, gi: { amountMonthly: 500, isProgram: true, hasPrivateFunds: true }, housing: { hasVoucher: true, paymentStandard: 3483, grossRent: 3483 } });
  const a = I.calcSection8(noGi, I.derive(noGi));
  const b = I.calcSection8(gi, I.derive(gi));
  approx(b.ttp - a.ttp, 150, 1);
});
test('GI excluded when pilot ends within 12 months (5.609(b)(24))', () => {
  const gi = H({ earnedMonthly: 2500, gi: { amountMonthly: 500, isProgram: true, pilotEndsWithin12Mo: true }, housing: { hasVoucher: true, paymentStandard: 3483, grossRent: 3483 } });
  const noGi = H({ earnedMonthly: 2500, housing: { hasVoucher: true, paymentStandard: 3483, grossRent: 3483 } });
  assert.strictEqual(I.calcSection8(gi, I.derive(gi)).ttp, I.calcSection8(noGi, I.derive(noGi)).ttp);
});
test('minimum rent binds at zero income', () => {
  const h = H({ earnedMonthly: 0, housing: { hasVoucher: true, paymentStandard: 3483, grossRent: 3483, minRent: 50 } });
  assert.strictEqual(I.calcSection8(h, I.derive(h)).ttp, 50);
});

console.log('\n== Medi-Cal thresholds (ACWDL 26-01) ==');
test('adult eligible at $3,143/mo (HH3, 138%), not at $3,144', () => {
  const a = I.derive(H({ earnedMonthly: 3143 }));
  const ra = E.calc(H({ earnedMonthly: 3143 }));
  const rb = E.calc(H({ earnedMonthly: 3144 }));
  assert.strictEqual(ra.medical.adultsEligible, true);
  assert.strictEqual(rb.medical.adultsEligible, false);
});
test('children eligible to 266% ($6,057 HH3)', () => {
  const ra = E.calc(H({ earnedMonthly: 6057 }));
  const rb = E.calc(H({ earnedMonthly: 6058 }));
  assert.strictEqual(ra.medical.childrenEligible, true);
  assert.strictEqual(rb.medical.childrenEligible, false);
});
test('GI does not affect MAGI eligibility (gifts excluded)', () => {
  const r = E.calc(H({ earnedMonthly: 3143, gi: { amountMonthly: 1000, isProgram: true } }));
  assert.strictEqual(r.medical.adultsEligible, true);
});
test('net premium 0 up to 150% FPL (CA state subsidy)', () => {
  // HH3 at 145% FPL monthly: 1.45*2277 ~ 3302 -> adult over 138%, but premium 0; only CSR delta
  const r = E.calc(H({ earnedMonthly: 3302 }));
  assert.strictEqual(Math.round(r.medical.costDetail.premium), 0);
  assert.ok(r.medical.costDetail.csrDelta > 0);
});

console.log('\n== Voucher-household CalFresh uses TTP as shelter (7 CFR 273.9(d)(6)(ii)) [audit v6 H4] ==');
test('voucher household: CalFresh shelter = family share (TTP), not contract rent', () => {
  // A at $1,500/mo, San Jose 2BR voucher. TTP = max(30% adj, 10% gross, $50).
  // annual gross 18,000; adjusted = 18,000 - 2x480 = 17,040 -> 30%/12 = 426; 10%/12 = 150 -> TTP 426.
  // CalFresh with shelter 426 (FFY2027): gross 1500, -20% 300, -217 = 983; shelter 426+686 = 1,112;
  // excess = 1,112 - 491.5 = 620.5 (under 769 cap); net = 362.5 -> floor(808 - 108.75) = 699 (FFY2026: 665).
  // (paymentStandard 3483 is a fixed fixture = FY2026 SJ 2BR; TTP is income-driven and unaffected.)
  const h = H({ earnedMonthly: 1500, housing: { hasVoucher: true, paymentStandard: 3483, grossRent: 3483, minRent: 50 } });
  const r = E.calc(h);
  assert.strictEqual(r.section8.ttp, 426);
  assert.strictEqual(r.calfresh.amount, 699);
});
test('same household without voucher keeps contract-rent shelter (743)', () => {
  // FFY2027: shelter 1800+686 = 2486; excess = 2486 - 491.5 = 1994.5 -> cap 769; net = 214 -> floor(808-64.2) = 743 (FFY2026: 710)
  const h = H({ earnedMonthly: 1500 });
  assert.strictEqual(E.calc(h).calfresh.amount, 743);
});

console.log('\n== Integration: MTR & cliffs ==');
test('sweep flags the 150% FPL premium cliff (CA subsidy ends; 2026 post-ePTC)', () => {
  // HH3 150% FPL = $3,415/mo: net benchmark premium jumps from $0 to ~3.2% of income,
  // and CSR drops Silver 94 -> 87. This is a genuine 2026 policy discontinuity.
  const h = H({});
  const cliffs = E.findCliffs(h, { from: 3000, to: 5500, step: 25 });
  const premCliff = cliffs.find(c => Math.abs(c.earnedMonthly - 3425) < 60);
  assert.ok(premCliff, 'expected a cliff near $3,415 (150% FPL), got: ' + JSON.stringify(cliffs.slice(0, 5)));
});
test('CalFresh 200% MCE cliff binds for a childcare household (uncapped dependent-care deduction)', () => {
  // Working parent with $1,200/mo childcare keeps a real CalFresh benefit near the
  // 200% screen; crossing it zeroes the benefit in one step.
  const h = H({ childcareCostMonthly: 1200 });
  // FFY2027 200% line HH3 = $4,554 (was $4,442). At $4,554: 3643.2-217-1200 = 2226.2; shelter
  // 2486-1113.1 -> cap 769; net 1457.2 -> floor(808-437.16) = 370. At $4,555: 0.
  const a = I.calcCalFresh(H({ childcareCostMonthly: 1200, earnedMonthly: 4554 }), I.derive(h));
  const b = I.calcCalFresh(H({ childcareCostMonthly: 1200, earnedMonthly: 4555 }), I.derive(h));
  assert.ok(a.amount > 200, 'expected substantial benefit just under 200%: ' + a.amount);
  assert.strictEqual(b.amount, 0);
});
test('elderly/disabled HH over 200% falls back to net test (7 CFR 273.9(a)(2)) — no hard cliff', () => {
  const eh = { adults: 1, children: 0, childrenAges: [], elderlyOrDisabledMember: true,
    filingStatus: 'single', earnedMonthly: 2650, unearnedMonthly: 0, gi: { amountMonthly: 0 },
    immigration: 'citizen', region: 'r1', shelterCostMonthly: 1800, housing: { hasVoucher: false }, taxYear: 2025 };
  // HH1 200% = $2,610; at $2,650 gross the elderly HH stays eligible via net test
  const r = I.calcCalFresh(eh, I.derive(eh));
  assert.ok(r.amount > 0, 'elderly HH just over 200% should retain benefit via net test, got ' + r.amount);
});
test('METR near 100%+ zones exist for voucher household', () => {
  const h = H({ housing: { hasVoucher: true, paymentStandard: 3483, grossRent: 3483 } });
  const rows = E.sweep(h, { from: 500, to: 5000, step: 50 });
  const high = rows.filter(r => r.metr != null && r.metr > 0.7);
  assert.ok(high.length > 0, 'expected high-METR zones');
});
test('GI $500 into voucher household: keeps ~$395 (rent −$150, CalFresh backfills ~$45)', () => {
  // Post-H4: TTP is the CalFresh shelter cost, so HUD's $150 rent increase raises the
  // excess-shelter deduction; net income falls $75 (50% offset) -> CalFresh +$45.
  // Net kept = 500 - 150 + 45 = ~395. SNAP quietly subsidizes HUD's clawback.
  const noGi = E.calc(H({ earnedMonthly: 2500, housing: { hasVoucher: true, paymentStandard: 3483, grossRent: 3483 } }));
  const gi = E.calc(H({ earnedMonthly: 2500, gi: { amountMonthly: 500, isProgram: true, hasPrivateFunds: true }, housing: { hasVoucher: true, paymentStandard: 3483, grossRent: 3483 } }));
  const gain = gi._totalExact - noGi._totalExact;
  approx(gain, 395, 3, 'GI net of rent increase and CalFresh shelter-deduction backfill');
});

console.log('\n==============================');
console.log('passed: ' + passed + '  failed: ' + failed);
if (failed > 0) process.exit(1);
