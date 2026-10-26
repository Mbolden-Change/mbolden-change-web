'use client'

import { useState } from 'react'
import classNames from 'classnames'
import { Icon } from './ui'
import styles from './Simulator.module.scss'

/**
 * Data stamp and Sources & Methodology. Both are the reference build's markup,
 * unchanged, so the citations can't drift; Simulator.module.scss styles them
 * (the reference build's utility class names are inert here).
 */
export default function Sources() {
  const [srcOpen, setSrcOpen] = useState(false)
  const stamp = (
    // ---- BEGIN VERBATIM reference lines 11107-11107 ----
            <p className="text-xs" style={{color: '#0091AD'}}>Data current as of October 2026 (v3.2 — CalFresh, CalWORKs, CalEITC/YCTC, and FPL values computed by the embedded verified engine). Sources include CBO supplemental analysis of H.R. 1, USDA-FNS FY2027 COLA memo, CDSS ACL 26-66 / ACIN I-40-26, FTB 2025 Form 3514, CMS, IRS, KFF, and ITEP.</p>
    // ---- END VERBATIM ----
  )
  const methodology = (
    // ---- BEGIN VERBATIM reference lines 11119-11180 ----
                  <div className="bg-white border border-t-0 border-gray-200 rounded-b-xl px-5 py-4 text-xs text-gray-600 leading-relaxed space-y-3">
                    <div>
                      <p className="font-semibold text-gray-700 mb-1">Household profiles</p>
                      <p>Composite families based on published program eligibility rules, income thresholds, and benefit formulas from CMS, USDA-FNS, SSA, HHS, and IRS. No profile represents an actual family. Six preset households span single parents, elderly couples, working families, mixed-status families, a fully undocumented family, and a self-employed middle-class family. The fully undocumented household (the Chen family) reflects the zǒuxiàn migration pipeline from China and is deliberately set at an income level ($26,400/year) that qualifies for CalEITC and YCTC when the California toggle is active. Their compressed budget (shared room, no car, no formal childcare, community-sourced clothing) reflects the reality of how undocumented families minimize expenses. Preset household benefit amounts are regenerated at load through the same verified computation engine the custom builder uses (exceptions: housing and children's Medicaid values are curated — see Housing eligibility below). The custom builder supports three immigration statuses: US citizen/LPR, mixed-status, and fully undocumented. Eligibility thresholds: 138% FPL for Medicaid expansion, 150% FPL for LIHEAP, and — for SNAP/CalFresh — California's Broad-Based Categorical Eligibility screen (200% FPL gross, per CDSS ACL 23-60), which this tool applies in ALL modes, including non-California regions; national-region results therefore illustrate the California rule set at those expense levels. The national TANF amounts are an illustrative composite matching no specific state's schedule; in California mode, CalWORKs replaces them with engine-computed grants.</p>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-700 mb-1">SNAP benefits</p>
                      <p>Calculated by the embedded verified engine using federal fiscal year 2027 USDA-FNS parameters (effective Oct 1, 2026): maximum allotments ($808 for 3-person, $562 for 2-person, $1,217 for 5-person), standard deductions ($217 for 1–3 person households, $268 for 5), the 20% earned income deduction, dependent care deduction (actual childcare costs), the elderly/disabled medical expense deduction (costs over $35/month), and the excess shelter deduction (capped at $769 for non-elderly; uncapped for elderly/disabled). The Standard Utility Allowance is California's: $686/month (CDSS ACIN I-40-26) — applied in all modes, including national regions (see Household profiles). For households with ineligible members, the engine excludes those members and counts all but their pro-rata share of income, per 7 CFR 273.11(c). Rounding may differ from county administration; amounts are engine calculations, not case determinations. Sources: USDA-FNS FY2027 Cost-of-Living Adjustments memo; CDSS ACIN I-40-26; 7 CFR 273.9–273.11.</p>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-700 mb-1">Tax credits (CTC / EITC)</p>
                      <p>CTC: $2,200/child (2025, per IRS post-OBBBA guidance); phases out at $50 per $1,000 (or fraction thereof) over $400,000 (MFJ) or $200,000 (single). The engine computes the full credit value for all households: the nonrefundable portion used against computed federal liability (TY2025 standard deduction and brackets) plus the refundable Additional Child Tax Credit — 15% × (earned income − $2,500), capped at $1,700/child. EITC inflation adjustments per IRS Rev. Proc. 2024-40: max $8,046 (3+ children), $7,152 (2), $4,328 (1), $649 (0); phaseout begins at $23,350 (single, 1+ children) / $10,620 (single, 0 children), with MFJ adjustment of $7,120 (1+ children) / $7,110 (0 children); phaseout rate 21.06% (2+), 15.98% (1), 7.65% (0). Completed phaseout (single): $61,555 (3+), $57,310 (2), $50,434 (1), $19,104 (0). SSN requirement per OBBB (P.L. 119-21).</p>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-700 mb-1">Medicaid &amp; work requirements</p>
                      <p>Six-month redetermination cycle: Section 71107, P.L. 119-21. E&amp;E Rule moratorium: Section 71102 (through September 30, 2034). CBO estimates ~$911 billion in net federal Medicaid outlay reductions over the 10-year budget window (FY2025–2034). Arkansas work-requirement data: 18,164 lost coverage over 7 months (2018). Sources: CBO, CMS, KFF, Georgetown CCF.</p>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-700 mb-1">ACA marketplace premiums</p>
                      <p>Enhanced premium subsidies (ARP/IRA) expired December 31, 2025. Nearly 23 million marketplace enrollees affected (CMS, February 2026). Unsubsidized benchmark premiums estimated at $600–$1,100/month for a family of four. Sources: CMS 2026 Open Enrollment Report, KFF Marketplace Calculator, CBO.</p>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-700 mb-1">SNAP &amp; immigration</p>
                      <p>CBO estimates that tightened SNAP eligibility rules will significantly reduce participation among lawfully present immigrants. Approximately 1 million people are projected to lose SNAP eligibility under various OBBB provisions. Source: CBO score of H.R. 1, 119th Congress.</p>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-700 mb-1">School meals &amp; WIC</p>
                      <p>Community Eligibility Provision threshold change: 1.4 million children affected. WIC serves ~6.7 million participants. School meal estimates for preset households include pre-K and Head Start programs where applicable; the custom household eligibility engine uses ages 5–18 as a simplified threshold. Sources: USDA-FNS, FRAC, Urban Institute.</p>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-700 mb-1">OAA &amp; LIHEAP</p>
                      <p>LIHEAP serves ~6.7 million households. Meals on Wheels serves 2.6 million seniors; 1 in 3 providers has a waitlist. Sources: ACL, HHS, NEADA, Meals on Wheels America 2025 Provider Report.</p>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-700 mb-1">Immigration fiscal contributions</p>
                      <p>Undocumented immigrants contribute an estimated $25.6B/year to Social Security and $6.4B to Medicare (based on 2022 tax data). Source: Institute on Taxation and Economic Policy (ITEP), 2024.</p>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-700 mb-1">Household income levels</p>
                      <p>Preset household incomes reflect below-median wages for each occupation, consistent with the low-income households this simulator models. Maria ($1,680/mo) earns below the BLS median for home health aides ($16.78/hr median, May 2024) working 30 hours/week. The Johnsons ($3,200/mo combined) reflect entry-level warehouse and part-time retail. The Ramirez family ($2,200/mo combined) reflects wages typical of undocumented workers in landscaping and domestic work at national baseline rates; the $11–14/hour range reflects cash-pay arrangements common in the informal economy. The Chen family ($2,200/mo combined) reflects restaurant kitchen and garment shop wages typical of recently arrived undocumented Chinese immigrants. Both families are set at income levels representative of the 3.6 million California households that qualify for CalEITC when the CA toggle is active. James and Dorothy ($2,340/mo) reflect below-average Social Security benefits typical of low-income careers without pensions. Income is held constant across non-California regions — federal benefit levels do not adjust for local wages or cost of living, and this gap is part of what the simulator illustrates. Sources: BLS Occupational Employment and Wage Statistics (May 2024), SSA benefit data, CalEITC Coalition data (2024).</p>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-700 mb-1">Regional cost adjustments</p>
                      <p>Housing and cost-of-living multipliers derived from FY2025 HUD Fair Market Rents and 2023 BEA Regional Price Parities. Sources: HUD FMR data, BEA RPP tables.</p>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-700 mb-1">Housing eligibility</p>
                      <p>Housing voucher eligibility uses a simplified national proxy (~$35,000/year AMI for a family of 4, scaled by household size) as an approximate 50% Area Median Income gate. Actual HUD AMI varies significantly by county and metropolitan area. Preset households use curated housing benefit values based on their narrative circumstances.</p>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-700 mb-1">California state programs</p>
                      <p>CalWORKs Maximum Aid Payment levels per CDSS ACL 26-66 (effective October 1, 2026, a 1.8% increase under AB 152). Grants equal MAP minus countable income after the $600 + 50% earned income disregard (ACL 21-130); child-only grants for citizen children of excluded parents use an MBSAC-differential deeming approximation (MPP 44-133.2) and are labeled as estimates — county practices vary. Medi-Cal expansion per SB 75 (children, 2016), AB 133 (50+, 2022), SB 184 (all ages, Jan 2024); Medi-Cal income thresholds are computed as annual FPL ÷ 12 rather than DHCS's chart-rounded monthly values (maximum deviation under $3/month, always on the stricter side). CalEITC and YCTC per FTB 2025 tax year guidance: CalEITC amounts come from the official FTB Form 3514 lookup table (income limit $32,900; maximum credits $302/$2,016/$3,339/$3,756 by number of children); YCTC provides up to $1,189 per return for a qualifying child under 6, phasing out at $21.71 per $100 of earned income above $27,425; ITIN filers eligible per AB 1876 (2020). CARE/FERA income limits per CPUC 2025-2026 schedule; CARE provides approximately 32.5% discount on electric and 20% on gas. California Universal Meals Program (AB 130, 2021) provides free breakfast and lunch to all TK-12 public school students regardless of income or immigration status. CAPI payment standards per CDSS January 2025 schedule.</p>
                      <p className="mt-1"><strong>Medi-Cal enrollment freeze:</strong> Per 2025-26 budget trailer bill language, effective January 1, 2026, new full-scope Medi-Cal enrollment for undocumented adults age 19 and older was frozen. Children under 19 and pregnant individuals can still enroll regardless of immigration status. Existing adult enrollees retain full-scope coverage if they complete annual renewal but face new cost-sharing ($30/month starting July 2027) and loss of dental benefits (July 2026). All undocumented adults — including those who did not enroll before the freeze — remain eligible for restricted-scope (emergency) Medi-Cal, which covers ER visits, labor and delivery, and emergency dental; this is initiated retroactively by hospital billing departments. The simulator asks users to specify the family's enrollment status (whole family enrolled, children only, or no one enrolled) when the California toggle is active for undocumented or mixed-status households. Sources: DHCS, CDSS, FTB, CPUC, CDE, California Budget Center, BLS OEWS.</p>
                      <p className="mt-1">When the California toggle is active, preset household incomes are adjusted upward by a sub-region-specific multiplier reflecting higher California wages. Documented workers receive the full regional multiplier (10–30%), derived from BLS Occupational Employment and Wage Statistics (May 2024) comparing California metro-area wages to national medians. Undocumented and mixed-status workers receive 50% of the regional wage premium: market forces (cost of living, competition for labor in tight markets) push wages up even in cash-pay arrangements, but wage theft, sub-minimum-wage pay, and inability to file labor complaints mean these workers capture only a fraction of the documented wage premium. For example, Bay Area documented workers receive the full 30% premium while undocumented/mixed-status workers receive a 15% premium. This ensures the Ramirez and Chen families remain representative of the approximately 900,000 Bay Area households and 3.6 million statewide households that qualify for CalEITC (CalEITC Coalition, 2024). Custom household incomes are not adjusted.</p>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-700 mb-1">Methodology note</p>
                      <p>Stability scores are illustrative, not predictive. They reflect cumulative tradeoff severity across rounds. Cut percentages are modeled estimates based on CBO scoring and policy analysis, not exact statutory reduction rates — actual impacts will vary by state and individual circumstances. Some provisions (e.g., state SNAP cost-sharing) phase in through FY2028; this simulator compresses projected 10-year impacts into a single simulation for educational purposes. Budget-pressure scenarios (TANF, Housing) are labeled separately as they are not direct OBBB provisions. The simulator does not dynamically recalculate benefits when tradeoff choices affect income. Housing voucher amounts reflect HUD formulas where higher income reduces the subsidy — larger families with higher earnings may receive smaller vouchers than smaller households. All dollar figures are monthly unless noted.</p>
                      <p className="mt-1">California offers child-only CalWORKs grants to citizen children in mixed-status families when their parents are excluded from the assistance unit. The simulator models these grants: parental income is deemed to the children's assistance unit after earned-income disregards and an allocation for the excluded parents' needs (an MBSAC-differential approximation of MPP 44-133.2 — county practices vary). Because take-up among mixed-status families is documented to be low, the tool asks whether the family has applied; unclaimed grants are shown as an unclaimed entitlement rather than counted as income.</p>
                      <p className="mt-1">For fully undocumented households, the simulator models exclusion from all federal programs that require qualified immigration status (SNAP, Medicaid, TANF, housing vouchers, LIHEAP, EITC, CTC). Only programs with no status verification (WIC, school meals) are available federally. Rounds that do not affect these families are presented with an exclusion frame ("not affected — because this family was never included") rather than as protection. In California, the three-way Medi-Cal enrollment question produces different benefit values: "whole family" uses the full calculated Medi-Cal value, "children only" uses children's coverage only ($300/child/month), and "no one enrolled" zeros out the benefit entirely. Emergency Medi-Cal is noted but not assigned a dollar value because it cannot be budgeted around.</p>
                    </div>
                  </div>
    // ---- END VERBATIM ----
  )
  return (
    <section className={styles.cream}>
      <div className={classNames(styles.wrap, styles.sources)}>
        <div className={styles.dataStamp} data-sim="stamp">
          {stamp}
        </div>
        <button
          type="button"
          onClick={() => setSrcOpen(!srcOpen)}
          className={styles.sourcesToggle}
          aria-expanded={srcOpen}
          data-sim="sources-toggle"
        >
          <span>Sources &amp; Methodology</span>
          <Icon name={srcOpen ? 'chevronUp' : 'chevronDown'} size={18} />
        </button>
        {srcOpen && <div className={styles.methodology}>{methodology}</div>}
      </div>
    </section>
  )
}
