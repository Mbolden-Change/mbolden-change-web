'use client'

import classNames from 'classnames'
import { REGIONS, CA_SUBREGIONS, adjustExpenses, getExpenseTotal, formatMoney } from '@/lib/simulator/model'
import { TealBand } from './HouseholdSelect'
import { Icon } from './ui'
import styles from './Simulator.module.scss'

function Answer({ selected, tone, onClick, children }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={selected} className={classNames(styles.answer, styles[`answer_${tone}`], selected && styles.answerOn)}>
      {children}
    </button>
  )
}

export default function RegionSelect({ household, onSelect, caState, onCaToggle, medicalEnrolledPreFreeze, onMedicalEnrollment, calworksApplied, onCalworksApplied }) {
  // ---- BEGIN VERBATIM reference lines 9984-9984 ----
      const regions = caState ? CA_SUBREGIONS : REGIONS;
  // ---- END VERBATIM ----
  return (
    <>
      <TealBand title="Where does this family live?">
        <p className={styles.bandLead}>Cost of living changes the math. Housing is the biggest variable.</p>
        <p className={styles.bandSmall}>Multipliers based on 2023 BEA Regional Price Parities and FY2025 HUD Fair Market Rent data.</p>
        {!caState && (
          <p className={styles.bandSmall}>
            <em>Income is held constant across regions. Federal benefits don't adjust for local wages or cost of living — that's part of the problem.</em>
          </p>
        )}
        {caState && (
          <p className={styles.bandSmall}>
            <em>
              California wages and expenses are both adjusted by sub-region. Documented workers receive the full regional
              wage premium; undocumented/mixed-status workers receive a partial premium (50%) reflecting market-driven wage
              increases offset by wage theft and cash-pay arrangements.
            </em>
          </p>
        )}
      </TealBand>

      <section className={styles.cream}>
        <div className={classNames(styles.wrap, styles.regionWrap)}>
          <div className={classNames(styles.caCard, caState && styles.caCardOn)}>
            <div className={styles.caHead}>
              <Icon name="landmark" size={28} className={styles.tealIcon} />
              <div className={styles.caText}>
                <h2 className={styles.caTitle} id="sim-ca-title">Is this household in California?</h2>
                <p className={styles.small}>
                  {caState
                    ? 'California programs layered on top of federal benefits. Select a CA sub-region below.'
                    : 'Toggle on to add California state programs (CalWORKs, Medi-Cal expansion, CalEITC, CARE/FERA, and more).'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  onCaToggle(!caState)
                  if (caState) {
                    onMedicalEnrollment(null)
                    onCalworksApplied(null)
                  }
                }}
                className={classNames(styles.switch, caState && styles.switchOn)}
                aria-label="Toggle California state programs"
                role="switch"
                aria-checked={caState}
                data-sim="ca-toggle"
              >
                <span className={styles.switchKnob} />
              </button>
            </div>
            {caState && (
              <div className={styles.caBody}>
                <p className={styles.small}>
                  California provides some of the most comprehensive state-level safety net programs in the country —
                  including Medi-Cal coverage regardless of immigration status, CalEITC for ITIN filers, and CalWORKs grants
                  that are among the highest in the nation. These programs meaningfully — though only partially — buffer
                  federal exclusions and cuts. Where the federal tax code shuts ITIN-filing families out, California's
                  credits replace a fraction of the loss, not the whole.
                </p>
                {(household.mixedStatus || household.fullyUndocumented) && (
                  <div className={styles.caQuestion}>
                    <p className={styles.fieldLabel}>Is this family enrolled in Medi-Cal?</p>
                    <p className={styles.small}>
                      California expanded full-scope Medi-Cal to all income-eligible residents regardless of immigration
                      status — but many undocumented families never applied. Fear of government systems, language barriers,
                      or simply not knowing the program exists keeps enrollment low. Starting January 2026, new enrollment for
                      undocumented adults (19+) was frozen. Children under 19 can still enroll.
                    </p>
                    <div className={styles.answers}>
                      <Answer tone="teal" selected={medicalEnrolledPreFreeze === 'all'} onClick={() => onMedicalEnrollment('all')}>
                        Yes — whole family enrolled
                      </Answer>
                      {household.children > 0 && (
                        <Answer tone="orange" selected={medicalEnrolledPreFreeze === 'children-only'} onClick={() => onMedicalEnrollment('children-only')}>
                          Children only — parents did not apply
                        </Answer>
                      )}
                      <Answer tone="fuchsia" selected={medicalEnrolledPreFreeze === 'none'} onClick={() => onMedicalEnrollment('none')}>
                        No one enrolled
                      </Answer>
                    </div>
                    {medicalEnrolledPreFreeze === 'none' && (
                      <div className={styles.answerNote}>
                        <p>
                          No one in this family has health coverage.{' '}
                          {household.children > 0
                            ? 'The children are technically still eligible to enroll — but the parents never applied, and enrollment requires interacting with a government system many undocumented families avoid.'
                            : ''}
                          The enrollment freeze means the adults can no longer apply for full-scope coverage even if they wanted to.
                        </p>
                        <p>
                          They still qualify for restricted-scope (emergency) Medi-Cal — covering ER visits, labor and delivery,
                          and emergency dental. This is initiated by hospital billing departments after the fact, not something
                          families sign up for. It keeps them from being turned away, but it is not healthcare.
                        </p>
                      </div>
                    )}
                    {medicalEnrolledPreFreeze === 'children-only' && (
                      <div className={styles.answerNote}>
                        <p>
                          The children have full-scope Medi-Cal — likely enrolled through a school, clinic, or community
                          navigator. The parents never applied for themselves. The enrollment freeze means they can no longer
                          get full-scope coverage.
                        </p>
                        <p>
                          The parents still qualify for restricted-scope (emergency) Medi-Cal — ER visits, labor and delivery,
                          and emergency dental only. Initiated by hospital billing, not by application.
                        </p>
                      </div>
                    )}
                    {medicalEnrolledPreFreeze === 'all' && (
                      <p className={styles.answerNote}>
                        The whole family is enrolled in full-scope Medi-Cal. Adults retain coverage as long as they complete
                        annual renewal — but face new $30/month cost-sharing starting July 2027, and dental benefits end July
                        2026.{household.children > 0 ? " Children's coverage is unaffected by these changes." : ''}
                      </p>
                    )}
                  </div>
                )}
                {household.mixedStatus && !household.fullyUndocumented && household.children > 0 && (
                  <div className={styles.caQuestion}>
                    <p className={styles.fieldLabel}>Has this family applied for CalWORKs for their citizen children?</p>
                    <p className={styles.small}>
                      US-citizen children of ITIN parents qualify for a child-only CalWORKs cash grant — roughly $900–$1,070/month
                      for a family like this, depending on region — with part of the parents' income counted against it
                      (estimated — the exact amount varies by county). Most mixed-status families never apply: fear of
                      immigration consequences, verification burdens, and inconsistent county handling keep take-up low. The
                      entitlement exists on paper. The design determines whether families ever touch it.
                    </p>
                    <div className={styles.answers}>
                      <Answer tone="teal" selected={calworksApplied === true} onClick={() => onCalworksApplied(true)}>
                        Yes — receiving a child-only grant
                      </Answer>
                      <Answer tone="fuchsia" selected={calworksApplied === false || calworksApplied == null} onClick={() => onCalworksApplied(false)}>
                        No — never applied (most don't)
                      </Answer>
                    </div>
                    {(calworksApplied === false || calworksApplied == null) && (
                      <p className={styles.answerNote}>
                        The grant this family qualifies for appears on the results screen as an unclaimed entitlement — money
                        the law owes their children that fear and process keep out of their budget.
                      </p>
                    )}
                    {calworksApplied === true && (
                      <p className={styles.answerNote}>
                        The child-only grant is counted in this family's monthly benefits. The amount is our best estimate — the
                        exact grant depends on how the county counts the parents' income, and county practices vary.
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className={styles.regionGrid}>
            {regions.map((r) => {
              // ---- BEGIN VERBATIM reference lines 10150-10161 ----
              const adj = adjustExpenses(household.expenses, r);
              const adjTotal = getExpenseTotal(adj);
              const baseTotal = getExpenseTotal(household.expenses);
              const diff = adjTotal - baseTotal;
              const isUndocWorker = household.mixedStatus || household.fullyUndocumented;
              const previewMult = household.isCustom ? 1.0
                : household.incomeSource === "retirement" ? 1.0
                : isUndocWorker ? (1.0 + (r.incomeMult - 1.0) * 0.5)
                : r.incomeMult;
              const hasIncomeMult = caState && previewMult !== 1.0;
              const adjIncome = hasIncomeMult ? Math.round(household.monthlyIncome * previewMult) : household.monthlyIncome;
              const incomeDiff = adjIncome - household.monthlyIncome;
              // ---- END VERBATIM ----
              return (
                <button type="button" key={r.id} onClick={() => onSelect(r)} className={styles.regionCard} data-sim="region" data-name={r.name}>
                  <span className={styles.regionText}>
                    <span className={styles.regionName}>
                      {r.name}
                      {r.isDefault && <span className={styles.muted}> (default)</span>}
                    </span>
                    <span className={styles.small}>{r.example}</span>
                  </span>
                  <span className={styles.regionNums}>
                    {diff === 0 ? (
                      <span className={styles.muted}>baseline</span>
                    ) : diff > 0 ? (
                      <span className={styles.fuchsiaText}>+{formatMoney(diff)}/mo expenses</span>
                    ) : (
                      <span className={styles.greenText}>{formatMoney(diff)}/mo expenses</span>
                    )}
                    {hasIncomeMult && <span className={styles.greenText}>+{formatMoney(incomeDiff)}/mo wages</span>}
                    <span className={styles.small}>
                      Housing: {Math.round(r.housingMult * 100)}%
                      {hasIncomeMult ? ` | Wages: ${Math.round(previewMult * 100)}%` : ` | Other: ${Math.round(r.otherMult * 100)}%`}
                    </span>
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </section>
    </>
  )
}
