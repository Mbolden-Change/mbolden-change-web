/**
 * mBOLDen Benefits-Cliff Engine
 * =============================
 * Verified computation module for California safety-net program interactions.
 * Feeds: Safety Net Simulator, Affordability Index, Tax Week pieces, SAVE Act advocacy.
 *
 * Design contract:
 *  - Standalone, zero dependencies. Works in Node (module.exports) and in a
 *    browser <script> block (window.BenefitsEngine). The Simulator EMBEDS this
 *    file; it does not own it.
 *  - All rule values come from injected parameters (parameters.json) — nothing
 *    numeric is hardcoded here except pure statutory structure (e.g., "highest of").
 *  - Every function returns a `detail` trail so any published number can be
 *    traced to parameter + formula.
 *
 * Usage:
 *   const engine = BenefitsEngine.create(parameters, caleitcTable);
 *   const r = engine.calc(household);          // full monthly snapshot
 *   const m = engine.metr(household, 100);     // marginal effective tax rate
 *   const s = engine.sweep(household, {from:0, to:8000, step:50});
 *   const c = engine.findCliffs(household, opts);
 *
 * Household shape (all monthly dollars unless noted):
 * {
 *   adults: 1, children: 2, childrenAges: [3, 9],
 *   elderlyOrDisabledMember: false,          // CalFresh/HCV elderly-disabled flags
 *   filingStatus: 'hoh' | 'single' | 'mfj',
 *   earnedMonthly: 2000, unearnedMonthly: 0, // unearned = countable non-GI unearned
 *   childSupportMonthly: 0,
 *   gi: { amountMonthly: 0,
 *         isProgram: true,                   // structured unconditional-cash program?
 *         hasPrivateFunds: true,             // any non-governmental dollars in stream?
 *         pilotEndsWithin12Mo: false,        // HCV 5.609(b)(24) test
 *         phaExcludes: false },              // PHA permissive deduction / MTW / safe harbor
 *   immigration: 'citizen' | 'mixed' | 'undocumented',
 *     // 'mixed' = ineligible parent(s), citizen children, ITIN filer household
 *     //           (one-spouse-SSN MFJ variants via taxFlags below)
 *   taxFlags: { filerHasSSN: true, spouseHasSSN: true, childrenHaveSSNs: true },
 *   region: 'r1' | 'r2',                     // CalWORKs region
 *   calworksExempt: false,
 *   calworksTimedOut: false,                 // adults past 60-month clock
 *   shelterCostMonthly: 1800,                // rent+utilities for CalFresh shelter ded.
 *   housing: { hasVoucher: false, paymentStandard: 0, grossRent: 0,
 *              minRent: 50, hotmaDeductions: false },
 *   childcareCostMonthly: 0,
 *   taxYear: 2025
 * }
 *
 * Known modeling limitations (documented, not silent):
 *  - CalWORKs: recipient rules (steady state), no DBI split, no WTW sanctions;
 *    mixed-status deeming via MBSAC-differential approximation (MPP 44-133.2).
 *  - CalFresh: ABAWD time limits and Apr-2026 noncitizen category changes are
 *    eligibility gates outside income math; flagged in output, not simulated.
 *  - Medi-Cal: value-of-loss uses Covered CA net premium (verified) plus a
 *    cost-sharing delta driven by ASSUMPTION-LABELED utilization parameters.
 *  - CA income tax omitted (≈0 at modeled incomes); federal brackets >24% omitted.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.BenefitsEngine = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // ---------- small utilities ----------
  function clamp(x, lo, hi) { return Math.max(lo, Math.min(hi, x)); }
  function idx(arr, size, increment) {
    // 1-based household size lookup with per-additional increment
    if (size <= arr.length) return arr[size - 1];
    return arr[arr.length - 1] + (size - arr.length) * increment;
  }
  function round$(x) { return Math.round(x); }

  function create(P, CALEITC_TABLE) {
    if (!P) throw new Error('parameters required');
    const T = CALEITC_TABLE && CALEITC_TABLE.table ? CALEITC_TABLE.table : null;

    // ---------- FPL ----------
    function fplMonthly(size) {
      return idx(P.fpl2026.monthly, size, P.fpl2026.monthlyIncrement);
    }
    function fplAnnual(size) {
      return P.fpl2026.annualBase1 + (size - 1) * P.fpl2026.annualIncrement;
    }

    // ---------- household derivations ----------
    function derive(h) {
      const d = {};
      d.size = h.adults + h.children;
      d.ineligibleAdults = h.immigration === 'mixed' ? h.adults
                        : h.immigration === 'undocumented' ? h.adults : 0;
      d.ineligibleChildren = h.immigration === 'undocumented' ? h.children : 0;
      d.eligibleMembers = d.size - d.ineligibleAdults - d.ineligibleChildren;
      d.underSix = (h.childrenAges || []).filter(a => a < P.yctc.childAgeLimit).length;
      d.ctcKids = (h.childrenAges || []).filter(a => a < P.ctc.childAgeLimit).length;
      d.gi = h.gi || { amountMonthly: 0 };
      d.giMonthly = d.gi.amountMonthly || 0;
      return d;
    }

    // GI countability per program (the cross-program matrix, executable)
    function giCountable(gi) {
      const g = gi || {};
      const amt = g.amountMonthly || 0;
      const isProgram = g.isProgram !== false; // default: structured program
      const hasPrivate = g.hasPrivateFunds !== false;
      return {
        calworks: isProgram ? 0 : amt,                                 // WIC 11157(e); informal recurring counts
        calfresh: isProgram ? (hasPrivate ? 0 : amt) : amt,            // ACL 23-60 non-governmental-funds test
        medicalMAGI: 0,                                                 // gifts never in MAGI
        section8: (g.pilotEndsWithin12Mo || g.phaExcludes) ? 0 : amt,  // 5.609(b)(24) + PHA flags
        tax: 0                                                          // IRC 102; never earned income
      };
    }

    // ---------- CalFresh ----------
    function calcCalFresh(h, d) {
      const cf = P.calfresh;
      const gic = giCountable(d.gi);
      const detail = {};

      // 7 CFR 273.11(c): exclude ineligible members from HH size; count all but
      // a pro-rata share of their income.
      const cfSize = d.eligibleMembers;
      if (cfSize <= 0) return { amount: 0, eligible: false, detail: { reason: 'no eligible members' } };
      const prorate = d.size > 0 ? cfSize / d.size : 1;
      const memberShare = d.ineligibleAdults + d.ineligibleChildren > 0 ? prorate : 1;

      const earned = h.earnedMonthly * memberShare;
      const unearned = (h.unearnedMonthly + (h.childSupportMonthly || 0)) * memberShare + gic.calfresh;
      const gross = earned + unearned;
      detail.cfSize = cfSize; detail.gross = gross; detail.giCounted = gic.calfresh;

      // Eligibility screen: MCE 200% FPL gross (standard CA case).
      // Elderly/disabled households over 200% lose MCE but remain subject only to
      // the NET income test (7 CFR 273.9(a)(2)) — plus the resource test (not modeled;
      // flagged in detail).
      const mceLimit = idx(cf.mceGrossLimit200, cfSize, cf.mceGrossLimit200Increment);
      detail.mceLimit200 = mceLimit;
      let requireNetTest = false;
      if (gross > mceLimit) {
        if (h.elderlyOrDisabledMember) {
          requireNetTest = true;
          detail.nonMCE = 'elderly/disabled over 200% — net test + resource test apply (resource test not modeled)';
        } else {
          return { amount: 0, eligible: false, detail: Object.assign(detail, { reason: 'gross > 200% FPL (MCE screen)' }) };
        }
      }

      // Net income
      const stdDed = cfSize >= 6 ? cf.standardDeduction['6plus']
                   : cf.standardDeduction[String(clamp(cfSize, 1, 5))];
      const afterEarnedDed = gross - cf.earnedIncomeDeductionRate * earned;
      // Excess medical deduction, elderly/disabled members only (7 CFR 273.9(d)(3))
      const medicalDed = h.elderlyOrDisabledMember && (h.medicalCostMonthly || 0) > cf.medicalDeductionThreshold
        ? (h.medicalCostMonthly - cf.medicalDeductionThreshold) : 0;
      const afterStd = afterEarnedDed - stdDed - (h.childcareCostMonthly || 0) * memberShare - medicalDed;
      const shelter = (h.shelterCostMonthly || 0) + cf.sua; // SUA default; heating/cooling assumed
      let shelterExcess = Math.max(0, shelter - 0.5 * Math.max(0, afterStd));
      if (!h.elderlyOrDisabledMember) shelterExcess = Math.min(shelterExcess, cf.shelterCapNonElderly);
      const net = Math.max(0, afterStd - shelterExcess);
      detail.stdDed = stdDed; detail.shelter = shelter; detail.shelterExcess = shelterExcess; detail.net = net;
      if (requireNetTest && net > idx(cf.netLimit100, cfSize, cf.netLimit100Increment)) {
        return { amount: 0, eligible: false, detail: Object.assign(detail, { reason: 'net > 100% FPL (non-MCE elderly/disabled)' }) };
      }

      // Benefit
      const maxAllot = idx(cf.maxAllotment, cfSize, cf.maxAllotmentIncrement);
      let benefit = Math.floor(maxAllot - cf.benefitReductionRate * net);
      if (benefit <= 0) benefit = 0;
      if (cfSize <= 2 && benefit > 0 && benefit < cf.minBenefit1and2) benefit = cf.minBenefit1and2;
      if (cfSize <= 2 && benefit === 0 && gross <= mceLimit && net <= idx(cf.netLimit100, cfSize, cf.netLimit100Increment)) {
        benefit = cf.minBenefit1and2; // minimum benefit for eligible 1-2 person HHs
      }
      detail.maxAllotment = maxAllot;
      return { amount: benefit, eligible: benefit > 0, detail };
    }

    // ---------- CalWORKs ----------
    function calcCalWORKs(h, d) {
      const cw = P.calworks;
      const gic = giCountable(d.gi);
      const detail = {};
      if (h.immigration === 'undocumented') {
        return { amount: 0, eligible: false, detail: { reason: 'no eligible AU members' } };
      }
      // CalWORKs is aid to families with deprived children (WIC 11250).
      // Childless adults are not eligible (pregnant-person cases not modeled).
      if (h.children <= 0) {
        return { amount: 0, eligible: false, detail: { reason: 'no eligible child in AU (WIC 11250)' } };
      }

      // AU: eligible members; timed-out or ineligible adults excluded from AU size
      let auAdults = h.adults;
      if (h.immigration === 'mixed') auAdults = 0;
      if (h.calworksTimedOut) auAdults = 0;
      const auSize = auAdults + h.children;
      if (auSize <= 0) return { amount: 0, eligible: false, detail: { reason: 'AU empty' } };

      const region = h.region || 'r1';
      const status = (h.calworksExempt || (auAdults === 0 && !h.calworksTimedOut && h.immigration !== 'mixed'))
        ? 'exempt' : 'nonExempt';
      // Note: child-only via parent ineligibility/time-out uses NON-exempt MAP when the
      // parent is in the home and needy; exempt MAP applies to non-needy caretaker cases.
      const mapLevel = idx(cw.map[region][h.calworksExempt ? 'exempt' : 'nonExempt'], auSize, 0);
      detail.auSize = auSize; detail.map = mapLevel; detail.region = region; detail.status = status;

      // Countable income (recipient rules): EID $600 then 50%
      let earnedCountable = 0.5 * Math.max(0, h.earnedMonthly - cw.earnedIncomeDisregard);
      let unearnedCountable = h.unearnedMonthly + gic.calworks;
      // child support disregard
      const csDisregard = h.children >= 2 ? cw.childSupportDisregard2plus : cw.childSupportDisregard1;
      unearnedCountable += Math.max(0, (h.childSupportMonthly || 0) - csDisregard);

      // Mixed-status deeming (MPP 44-133.2, MBSAC-differential APPROXIMATION):
      // excluded parent's post-disregard income minus allocation for their needs.
      if (h.immigration === 'mixed' && h.adults > 0) {
        const mbsacAll = idx(cw.mbsac[region], d.size, cw.mbsac.increment);
        const mbsacAU = idx(cw.mbsac[region], auSize, cw.mbsac.increment);
        const allocation = Math.max(0, mbsacAll - mbsacAU);
        const deemed = Math.max(0, earnedCountable + h.unearnedMonthly - allocation);
        earnedCountable = 0; unearnedCountable = deemed + gic.calworks;
        detail.deemingApproximate = true; detail.allocation = allocation;
      }

      const nni = earnedCountable + unearnedCountable;
      detail.nni = round$(nni);
      if (nni >= mapLevel) return { amount: 0, eligible: false, detail: Object.assign(detail, { reason: 'NNI >= MAP' }) };
      let grant = Math.floor(mapLevel - nni);
      if (grant < cw.minGrantPayment) grant = 0; // grants under $10 not paid
      return { amount: grant, eligible: grant > 0, detail };
    }

    // ---------- Medi-Cal ----------
    function calcMediCal(h, d) {
      const mc = P.medical;
      const gic = giCountable(d.gi);
      const detail = {};
      // MAGI household = tax household (simplified: everyone). MAGI income excludes gifts/GI.
      const magiMonthly = h.earnedMonthly + h.unearnedMonthly + gic.medicalMAGI;
      const size = d.size;
      const adultLimit = idx(mc.monthlyAdult138, size, mc.monthlyAdult138Increment);
      const childLimit = idx(mc.monthlyChild266, size, mc.monthlyChild266Increment);
      detail.magiMonthly = magiMonthly; detail.adultLimit138 = adultLimit; detail.childLimit266 = childLimit;

      // Jan 1, 2026 freeze: undocumented adults 19+ cannot newly enroll full-scope.
      const adultsEligible = h.immigration === 'undocumented' ? false
        : h.immigration === 'mixed' ? false  // ineligible-status adults: restricted scope only
        : magiMonthly <= adultLimit;
      const childrenEligible = magiMonthly <= childLimit; // children 0-18 regardless of status (CA)
      detail.adultsEligible = adultsEligible; detail.childrenEligible = childrenEligible;

      // Value of coverage loss = replacement cost via Covered CA (adults crossing 138%)
      const cost = coverageCost(h, d, adultsEligible, childrenEligible, magiMonthly);
      return {
        adultsEligible, childrenEligible,
        replacementCostMonthly: cost.total, costDetail: cost, detail
      };
    }

    // Covered CA replacement cost for members not on Medi-Cal (citizen/lawfully present only)
    function coverageCost(h, d, adultsEligible, childrenEligible, magiMonthly) {
      const cc = P.coveredCA2026;
      const A = cc.assumptions;
      const size = d.size;
      const fplRatio = (magiMonthly * 12) / fplAnnual(size);
      const out = { premium: 0, csrDelta: 0, total: 0, fplRatio, assumptionDriven: true };

      const uninsurableAdults = (h.immigration === 'mixed' || h.immigration === 'undocumented');
      const adultsNeeding = (!adultsEligible && !uninsurableAdults) ? h.adults : 0;
      const childrenNeeding = !childrenEligible ? h.children : 0;
      const membersNeeding = adultsNeeding + childrenNeeding;
      if (membersNeeding === 0) return out;

      // Net required contribution (annual): CA state subsidy zeroes to 150% FPL
      let pct;
      if (fplRatio > cc.subsidyCliffFPL) pct = null; // full premium
      else if (fplRatio <= cc.caStateSubsidy.netZeroUpToFPL) pct = 0;
      else if (fplRatio <= cc.caStateSubsidy.band150to165.fplMax) {
        const b = cc.caStateSubsidy.band150to165;
        pct = b.pctInitial + (b.pctFinal - b.pctInitial) * (fplRatio - b.fplMin) / (b.fplMax - b.fplMin);
      } else {
        const band = cc.applicablePctTable.find(b => fplRatio > b.fplMin && fplRatio <= b.fplMax);
        pct = band ? band.pctInitial + (band.pctFinal - band.pctInitial) * (fplRatio - band.fplMin) / (band.fplMax - band.fplMin)
                   : cc.applicablePctTable[cc.applicablePctTable.length - 1].pctFinal;
      }
      const benchmarkMonthly = A.benchmarkSilverMonthlyPerMember * membersNeeding; // ASSUMPTION
      const premiumMonthly = pct === null ? benchmarkMonthly
        : Math.min(benchmarkMonthly, (pct * magiMonthly * 12) / 12);
      out.premium = premiumMonthly;

      // Cost-sharing delta: (AV_mediCal - AV_plan) x assumed allowed costs (ASSUMPTION-labeled)
      const band = A.csrBands.find(b => fplRatio <= b.fplMax) || A.csrBands[A.csrBands.length - 1];
      const avDelta = Math.max(0, A.csrActuarialValues.mediCal - band.av);
      const allowedAnnual = adultsNeeding * A.assumedAnnualAllowedCostsAdult
                          + childrenNeeding * A.assumedAnnualAllowedCostsChild;
      out.csrDelta = (avDelta * allowedAnnual) / 12;
      out.av = band.av;
      out.total = out.premium + out.csrDelta;
      return out;
    }

    // ---------- Section 8 / HCV ----------
    function calcSection8(h, d) {
      const s8 = P.section8;
      const hv = h.housing || {};
      if (!hv.hasVoucher) return { amount: 0, eligible: false, ttp: null, detail: { reason: 'no voucher' } };
      const gic = giCountable(d.gi);
      const ded = hv.hotmaDeductions ? s8.deductions.hotmaCY2026 : s8.deductions.preHotma;

      const annualGross = 12 * (h.earnedMonthly + h.unearnedMonthly + (h.childSupportMonthly || 0) + gic.section8);
      const dependents = h.children; // simplification: children = dependents
      let annualAdjusted = annualGross - dependents * ded.dependentAnnual
                         - (h.elderlyOrDisabledMember ? ded.elderlyDisabledAnnual : 0)
                         - 12 * (h.childcareCostMonthly || 0);
      annualAdjusted = Math.max(0, annualAdjusted);

      const ttp = Math.max(
        round$(s8.ttpAdjustedRate * annualAdjusted / 12),
        round$(s8.ttpGrossRate * annualGross / 12),
        hv.minRent != null ? hv.minRent : s8.minRentDefault
      );
      const grossRent = hv.grossRent || hv.paymentStandard || 0;
      const ps = hv.paymentStandard || grossRent;
      const hap = Math.max(0, Math.min(ps, grossRent) - ttp);
      return {
        amount: hap, eligible: hap > 0, ttp,
        familyShare: grossRent - hap,
        detail: { annualGross, annualAdjusted, giCounted: gic.section8, deductionSet: hv.hotmaDeductions ? 'HOTMA-CY2026' : 'pre-HOTMA' }
      };
    }

    // ---------- Federal income tax (before credits) ----------
    function fedTaxBeforeCredits(annualAGI, filingStatus, ty) {
      const ft = P.fedTax[String(ty)] || P.fedTax['2025'];
      const std = ft.standardDeduction[filingStatus] || ft.standardDeduction.single;
      const taxable = Math.max(0, annualAGI - std);
      const brackets = ft.brackets[filingStatus] || ft.brackets.single;
      let tax = 0;
      for (let i = 0; i < brackets.length; i++) {
        const [floor, rate] = brackets[i];
        const ceil = i + 1 < brackets.length ? brackets[i + 1][0] : Infinity;
        if (taxable > floor) tax += (Math.min(taxable, ceil) - floor) * rate;
      }
      return { tax, taxable, std };
    }

    // ---------- EITC ----------
    function calcEITC(annualEarned, annualAGI, kids, filingStatus, ty, flags) {
      const e = P.eitc[String(ty)] || P.eitc['2025'];
      const f = flags || {};
      // SSN rules: taxpayer + spouse + every counted child need SSNs.
      let n = clamp(kids, 0, 3);
      const filerOK = f.filerHasSSN !== false;
      const spouseOK = filingStatus !== 'mfj' || f.spouseHasSSN !== false;
      if (!filerOK || !spouseOK) return { amount: 0, detail: { reason: 'filer/spouse SSN' } };
      if (f.childrenHaveSSNs === false) n = 0; // childless fallback, 32(c)(1)(F)

      const pin = P.eitc.phaseInRate[n], pout = P.eitc.phaseOutRate[n];
      const eiAmt = e.earnedIncomeAmount[n], maxC = e.maxCredit[n];
      const start = filingStatus === 'mfj' ? e.phaseOutStartMFJ[n] : e.phaseOutStartSingle[n];
      const base = Math.min(pin * Math.min(annualEarned, eiAmt), maxC);
      const over = Math.max(0, Math.max(annualAGI, annualEarned) - start);
      const credit = Math.max(0, base - pout * over);
      return { amount: round$(credit), detail: { n, base: round$(base), phaseOutOver: round$(over) } };
    }

    // ---------- CTC / ACTC / ODC ----------
    function calcCTC(annualEarned, annualAGI, ctcKids, otherDeps, filingStatus, ty, flags) {
      const c = P.ctc;
      const f = flags || {};
      const taxpayerOK = (f.filerHasSSN !== false) || (filingStatus === 'mfj' && f.spouseHasSSN !== false);
      const kidsOK = f.childrenHaveSSNs !== false;
      const eligibleKids = taxpayerOK && kidsOK ? ctcKids : 0;
      const odcCount = otherDeps + (taxpayerOK && !kidsOK ? ctcKids : 0); // ITIN children -> ODC

      const threshold = filingStatus === 'mfj' ? c.phaseOutThresholdMFJ : c.phaseOutThresholdSingle;
      const reduction = Math.ceil(Math.max(0, annualAGI - threshold) / 1000) * c.phaseOutPer1000;
      const totalCTC = Math.max(0, eligibleKids * c.perChild - reduction);
      const totalODC = Math.max(0, odcCount * c.odc - Math.max(0, reduction - eligibleKids * c.perChild));

      const liab = fedTaxBeforeCredits(annualAGI, filingStatus, ty).tax;
      const nonrefUsed = Math.min(liab, totalCTC + totalODC);
      const unusedCTC = Math.max(0, totalCTC - Math.max(0, nonrefUsed - totalODC));
      const actc = Math.min(
        unusedCTC,
        eligibleKids * c.actcCap,
        Math.max(0, c.actcPhaseInRate * Math.max(0, annualEarned - c.actcEarnedIncomeFloor))
      );
      return {
        total: totalCTC, odc: totalODC, nonrefundableUsed: round$(nonrefUsed),
        actc: round$(actc), liabilityBefore: round$(liab),
        detail: { eligibleKids, odcCount }
      };
    }

    // ---------- CalEITC (FTB table lookup) ----------
    function caleitcLookup(income, n) {
      if (!T) return null;
      if (income < 1 || income > P.caleitc.maxIncome) return 0;
      // binary search
      let lo = 0, hi = T.length - 1;
      while (lo <= hi) {
        const mid = (lo + hi) >> 1;
        const r = T[mid];
        if (income < r.min) hi = mid - 1;
        else if (income > r.max) lo = mid + 1;
        else return r.credits[clamp(n, 0, 3)];
      }
      return 0;
    }
    function calcCalEITC(annualEarned, annualAGI, kids) {
      const n = clamp(kids, 0, 3);
      if (annualEarned < 1 || annualEarned > P.caleitc.maxIncome || annualAGI > P.caleitc.maxIncome) {
        return { amount: 0, detail: { reason: 'income limit' } };
      }
      let credit = caleitcLookup(annualEarned, n);
      if (credit == null) return { amount: 0, detail: { reason: 'table unavailable' } };
      const bp = P.caleitc.agiLookupBreakpoints[n];
      if (annualAGI !== annualEarned && annualAGI >= bp) {
        credit = Math.min(credit, caleitcLookup(annualAGI, n) || 0);
      }
      return { amount: credit, detail: { n, provisional2026: P.caleitc.ca2026Provisional } };
    }

    // ---------- YCTC ----------
    function calcYCTC(annualEarned, annualAGI, underSix, caleitcAmount) {
      const y = P.yctc;
      if (underSix <= 0) return { amount: 0, detail: { reason: 'no child under 6' } };
      const zeroEarnRule = annualEarned === 0 && annualAGI <= y.maxIncome;
      if (caleitcAmount <= 0 && !zeroEarnRule) return { amount: 0, detail: { reason: 'not CalEITC-eligible' } };
      if (annualEarned > y.maxIncome || annualAGI > y.maxIncome) return { amount: 0, detail: { reason: 'income limit' } };
      const over = Math.max(0, annualEarned - y.phaseOutThreshold);
      const credit = Math.max(0, y.maxCredit - y.reductionPerFull100 * Math.floor(over / 100));
      return { amount: round$(credit), detail: { over } };
    }

    // ---------- full calculation ----------
    function calc(h) {
      const ty = h.taxYear || 2025;
      const d = derive(h);
      const flags = h.taxFlags || (
        h.immigration === 'citizen' ? { filerHasSSN: true, spouseHasSSN: true, childrenHaveSSNs: true }
        : h.immigration === 'mixed' ? { filerHasSSN: false, spouseHasSSN: false, childrenHaveSSNs: true }
        : { filerHasSSN: false, spouseHasSSN: false, childrenHaveSSNs: false });

      const calworks = calcCalWORKs(h, d);
      const medical = calcMediCal(h, d);
      const section8 = calcSection8(h, d);
      // Voucher households: the CalFresh excess-shelter deduction is limited to
      // charges the household itself owes (7 CFR 273.9(d)(6)(ii)) — their rent
      // obligation is the TTP (family share), not the contract rent. [Audit v6 H4]
      const hCF = (section8.eligible || (h.housing && h.housing.hasVoucher && section8.ttp != null))
        ? Object.assign({}, h, { shelterCostMonthly: section8.ttp })
        : h;
      const calfresh = calcCalFresh(hCF, d);

      const annualEarned = 12 * h.earnedMonthly;
      const annualAGI = annualEarned + 12 * h.unearnedMonthly; // GI/gifts excluded from AGI
      const eitc = calcEITC(annualEarned, annualAGI, h.children, h.filingStatus, ty, flags);
      const ctc = calcCTC(annualEarned, annualAGI, d.ctcKids, h.children - d.ctcKids, h.filingStatus, ty, flags);
      const caleitc = calcCalEITC(annualEarned, annualAGI, h.children);
      const yctc = calcYCTC(annualEarned, annualAGI, d.underSix, caleitc.amount);

      const fica = P.fedTax.ficaRate * annualEarned;
      const fedBefore = fedTaxBeforeCredits(annualAGI, h.filingStatus, ty).tax;
      const fedAfterNonref = Math.max(0, fedBefore - ctc.nonrefundableUsed);
      const refundables = eitc.amount + ctc.actc + caleitc.amount + yctc.amount;
      const netAnnualTax = fica + fedAfterNonref - refundables; // negative = net transfer

      // Monthly resource totals. Tax credits arrive as an annual pulse (PATH Act,
      // mid-Feb+); monthlyized here for MTR math, reported separately for narrative.
      const cash = h.earnedMonthly + d.giMonthly + h.unearnedMonthly + (h.childSupportMonthly || 0)
                 + calworks.amount;
      const nearCash = calfresh.amount + section8.amount;
      const taxMonthly = -netAnnualTax / 12;
      const healthCost = medical.replacementCostMonthly;

      const totalMonthlyResources = cash + nearCash + taxMonthly - healthCost;

      return {
        inputs: { earnedMonthly: h.earnedMonthly, giMonthly: d.giMonthly, taxYear: ty },
        calfresh, calworks, medical, section8,
        taxCredits: {
          eitc: eitc.amount, actc: ctc.actc, ctcNonrefundableUsed: ctc.nonrefundableUsed,
          caleitc: caleitc.amount, yctc: yctc.amount,
          fica: round$(fica), fedTaxBeforeCredits: round$(fedBefore),
          netAnnualTax: round$(netAnnualTax),
          detail: { eitc: eitc.detail, ctc: ctc.detail, caleitc: caleitc.detail, yctc: yctc.detail }
        },
        totals: {
          cashMonthly: round$(cash),
          nearCashMonthly: round$(nearCash),
          taxMonthlyized: round$(taxMonthly),
          healthReplacementCostMonthly: round$(healthCost),
          totalMonthlyResources: round$(totalMonthlyResources)
        },
        _totalExact: totalMonthlyResources,
        flagsApplied: flags,
        limitations: ['ABAWD/noncitizen CalFresh gates not simulated', 'CalWORKs recipient rules',
                      'Medi-Cal loss value partially assumption-driven', 'CA income tax omitted']
      };
    }

    // ---------- MTR and sweeps ----------
    function withEarned(h, earnedMonthly) {
      return Object.assign({}, h, { earnedMonthly });
    }
    function metr(h, deltaMonthly) {
      const delta = deltaMonthly || 100;
      const r0 = calc(h)._totalExact;
      const r1 = calc(withEarned(h, h.earnedMonthly + delta))._totalExact;
      return 1 - (r1 - r0) / delta;
    }
    function sweep(h, opts) {
      const o = opts || {};
      const from = o.from || 0, to = o.to || 8000, step = o.step || 50;
      const rows = [];
      for (let inc = from; inc <= to; inc += step) {
        const r = calc(withEarned(h, inc));
        rows.push({
          earnedMonthly: inc,
          total: r._totalExact,
          calfresh: r.calfresh.amount, calworks: r.calworks.amount,
          section8: r.section8.amount,
          healthCost: r.medical.replacementCostMonthly,
          adultsMediCal: r.medical.adultsEligible, childrenMediCal: r.medical.childrenEligible,
          eitc: r.taxCredits.eitc, actc: r.taxCredits.actc,
          caleitc: r.taxCredits.caleitc, yctc: r.taxCredits.yctc
        });
      }
      for (let i = 1; i < rows.length; i++) {
        rows[i].metr = 1 - (rows[i].total - rows[i - 1].total) / step;
        rows[i].dTotal = rows[i].total - rows[i - 1].total;
      }
      return rows;
    }
    function findCliffs(h, opts) {
      const rows = sweep(h, opts);
      return rows.filter(r => r.metr != null && r.metr > 1)
        .map(r => ({
          earnedMonthly: r.earnedMonthly,
          lossPerExtraDollar: r.metr - 1,
          netChange: r.dTotal,
          metr: r.metr
        }));
    }

    return { calc, metr, sweep, findCliffs, fplMonthly, fplAnnual,
             _internals: { calcEITC, calcCTC, calcCalEITC, calcYCTC, calcCalFresh, calcCalWORKs, calcSection8, giCountable, fedTaxBeforeCredits, derive } };
  }

  return { create };
});
