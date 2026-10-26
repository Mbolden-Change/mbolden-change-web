'use client'

import { useState } from 'react'
import classNames from 'classnames'
import {
  BENEFIT_NAMES,
  CA_BENEFIT_NAMES,
  SERVICE_COVERAGE_KEYS,
  formatMoney,
  getCashBenefitTotal,
  getExpenseTotal,
} from '@/lib/simulator/model'
import { TealBand } from './HouseholdSelect'
import { BudgetBar, Icon, SimButton } from './ui'
import styles from './Simulator.module.scss'

function Callout({ icon, tone, title, children }) {
  return (
    <div className={classNames(styles.callout, styles[`callout_${tone}`])}>
      {icon && <Icon name={icon} size={22} className={styles.calloutIcon} />}
      <div>
        {title && <h2 className={styles.calloutTitle}>{title}</h2>}
        {children}
      </div>
    </div>
  )
}

const EXPENSE_NAMES = { therapyCopays: 'Therapy Co-pays', childcare: 'Childcare', remittances: 'Family Remittances', insurancePremiums: 'ACA Insurance Premiums' }

export default function HouseholdIntro({ household, adjustedExpenses, region, onContinue }) {
  // ---- BEGIN VERBATIM reference lines 10201-10203 ----
      const benefitTotal = getCashBenefitTotal(household.benefits);
      const expenseTotal = getExpenseTotal(adjustedExpenses);
      const surplus = household.monthlyIncome + benefitTotal - expenseTotal;
  // ---- END VERBATIM ----
  // Keeps the reference build's hook order: its breakdown toggle state lived inside the render.
  const [detailOpen, setDetailOpen] = useState(false)

  return (
    <>
      <TealBand title={household.name}>
        {household.mixedStatus && <p className={styles.tagFuchsia}>Mixed immigration status household</p>}
        {region && region.id !== 'national-avg' && (
          <>
            <p className={styles.bandSmall}>Expenses adjusted for: {region.name}</p>
            {household.caIncomeMult && household.originalIncome && (
              <p className={styles.bandSmall}>
                Wages adjusted for CA region: {formatMoney(household.originalIncome)}/mo → {formatMoney(household.monthlyIncome)}/mo (
                {Math.round(household.caIncomeMult * 100)}% of national baseline)
              </p>
            )}
          </>
        )}
      </TealBand>

      <section className={styles.cream}>
        <div className={classNames(styles.wrap, styles.introStack)}>
          <blockquote className={styles.story}>
            <p>"{household.story}"</p>
          </blockquote>

          {household.statusNote && (
            <Callout icon="clipboard" tone="fuchsia" title="Immigration & Tax Filing Status">
              <p>{household.statusNote}</p>
            </Callout>
          )}

          {household.baselineNote && (
            <Callout icon="alert" tone="yellow" title={`Household Stability: ${household.baselineQuality}%`}>
              <p>{household.baselineNote}</p>
              <ul className={styles.inlineScale}>
                <li>75%+ = cushion to absorb shocks</li>
                <li>50% = managing, but one emergency from crisis</li>
                <li>25% = basic needs at risk</li>
              </ul>
            </Callout>
          )}

          {(() => {
            // ---- BEGIN VERBATIM reference lines 10257-10259 ----
            const cashBenefits = Object.entries(household.benefits).filter(([k, v]) => v > 0 && !SERVICE_COVERAGE_KEYS.includes(k));
            const coverageBenefits = Object.entries(household.benefits).filter(([k, v]) => v > 0 && SERVICE_COVERAGE_KEYS.includes(k));
            const cashTotal = cashBenefits.reduce((s, [, v]) => s + v, 0);
            // ---- END VERBATIM ----
            return (
              <div>
                <button
                  type="button"
                  onClick={() => setDetailOpen(!detailOpen)}
                  className={styles.toggleRow}
                  aria-expanded={detailOpen}
                  data-sim="breakdown-toggle"
                >
                  <span className={styles.toggleNums}>
                    <span>Support: {formatMoney(cashTotal)}/mo</span>
                    <span aria-hidden="true">|</span>
                    <span>Expenses: {formatMoney(expenseTotal)}/mo</span>
                  </span>
                  <Icon name={detailOpen ? 'chevronUp' : 'chevronDown'} />
                </button>
                {detailOpen && (
                  <div className={styles.breakdown}>
                    <div className={styles.panel}>
                      {cashBenefits.length > 0 && (
                        <>
                          <h3 className={styles.panelTitle}>Basic Needs Support (Monthly)</h3>
                          {cashBenefits.map(([key, val]) => (
                            <p key={key} className={styles.row}>
                              <span>{BENEFIT_NAMES[key] || key}</span>
                              <span className={styles.mono}>{formatMoney(val)}</span>
                            </p>
                          ))}
                          <p className={classNames(styles.row, styles.rowTotal)}>
                            <span>Total Cash Support</span>
                            <span>{formatMoney(cashTotal)}</span>
                          </p>
                          <p className={classNames(styles.row, styles.small)}>
                            <span>Annualized</span>
                            <span className={styles.mono}>{formatMoney(cashTotal * 12)}/year</span>
                          </p>
                        </>
                      )}
                      {coverageBenefits.length > 0 && (
                        <div className={cashBenefits.length > 0 ? styles.panelSplit : undefined}>
                          <h3 className={styles.panelTitle}>In-Kind Support</h3>
                          <p className={styles.small}>Services & vouchers — not cash income</p>
                          {coverageBenefits.map(([key, val]) => (
                            <p key={key} className={styles.row}>
                              <span>{BENEFIT_NAMES[key] || key}</span>
                              <span className={styles.mono}>~{formatMoney(val)}/mo value</span>
                            </p>
                          ))}
                        </div>
                      )}
                      {cashBenefits.length === 0 && coverageBenefits.length > 0 && (
                        <p className={classNames(styles.small, styles.panelSplit)}>
                          <em>No direct cash benefits — income comes from work only</em>
                        </p>
                      )}
                    </div>
                    <div className={styles.panel}>
                      <h3 className={styles.panelTitle}>Monthly Expenses</h3>
                      {Object.entries(adjustedExpenses).map(([key, val]) => (
                        <p key={key} className={styles.row}>
                          <span className={styles.capitalize}>{EXPENSE_NAMES[key] || key}</span>
                          <span className={styles.mono}>{formatMoney(val)}</span>
                        </p>
                      ))}
                      <p className={classNames(styles.row, styles.rowTotal)}>
                        <span>Total Expenses</span>
                        <span>{formatMoney(expenseTotal)}</span>
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )
          })()}

          {(household.lostSubsidy || 0) > 0 && (
            <Callout icon="alert" tone="yellow" title="Lost: ACA Premium Tax Credit">
              <p>
                This family previously received ~{formatMoney(household.lostSubsidy)}/month in enhanced premium tax credits
                that made marketplace health insurance affordable. These credits expired December 31, 2025 and were not
                renewed in the OBBB. Their premiums have jumped accordingly.
              </p>
            </Callout>
          )}

          {household.annualCredits &&
            (() => {
              const credits = household.annualCredits
              const isIneligible = credits.ineligible
              const ctc = credits.ctc || 0
              const eitc = credits.eitc || 0
              const total = ctc + eitc
              if (!isIneligible && total === 0 && !credits.ctcNote && !credits.eitcNote) return null
              return (
                <div className={styles.panel}>
                  <h3 className={styles.panelTitle}>Annual Tax Credits (2025 Tax Year)</h3>
                  <p className={styles.small}>
                    Estimated refund received at tax time — not monthly income. Amounts depend on income, filing status, and
                    tax liability.
                  </p>
                  {isIneligible ? (
                    <div>
                      <p className={styles.row}>
                        <span>Child Tax Credit / ACTC</span>
                        <span className={styles.mono}>$0</span>
                      </p>
                      <p className={styles.row}>
                        <span>Earned Income Tax Credit</span>
                        <span className={styles.mono}>$0</span>
                      </p>
                      <p className={classNames(styles.small, styles.fuchsiaText)}>
                        Ineligible — filers must have SSNs valid for employment. This family files with ITINs.
                      </p>
                    </div>
                  ) : (
                    <div>
                      {(ctc > 0 || credits.ctcNote) && (
                        <div className={styles.creditRow}>
                          <p className={styles.row}>
                            <span>Child Tax Credit / ACTC</span>
                            <span className={classNames(styles.mono, ctc > 0 ? styles.greenText : styles.fuchsiaText)}>
                              {ctc > 0 ? `~${formatMoney(ctc)}/year` : '$0'}
                            </span>
                          </p>
                          {credits.ctcNote && <p className={styles.small}>{credits.ctcNote}</p>}
                        </div>
                      )}
                      {eitc > 0 ? (
                        <div className={styles.creditRow}>
                          <p className={styles.row}>
                            <span>Earned Income Tax Credit</span>
                            <span className={classNames(styles.mono, styles.greenText)}>~{formatMoney(eitc)}/year</span>
                          </p>
                          {credits.eitcNote && <p className={styles.small}>{credits.eitcNote}</p>}
                        </div>
                      ) : credits.eitcNote ? (
                        <div className={styles.creditRow}>
                          <p className={styles.row}>
                            <span>Earned Income Tax Credit</span>
                            <span className={styles.mono}>$0</span>
                          </p>
                          <p className={styles.small}>{credits.eitcNote}</p>
                        </div>
                      ) : null}
                      <p className={classNames(styles.row, styles.rowTotal)}>
                        <span>{total > 0 ? (eitc > 0 ? 'Est. Total Annual Tax Benefit' : 'Est. Annual Tax Reduction') : 'Total Tax Credits'}</span>
                        <span className={total > 0 ? styles.greenText : styles.fuchsiaText}>
                          {total > 0 ? `~${formatMoney(total)}/year` : '$0 — locked out by OBBB'}
                        </span>
                      </p>
                    </div>
                  )}
                </div>
              )
            })()}

          {household.caState && (
            <Callout icon="landmark" tone="teal" title="California State Programs Active">
              <p>
                This household benefits from California's state-level safety net — programs that layer on top of federal
                benefits and, in some cases, fill gaps where federal programs exclude people.
              </p>
              {household.caBenefits && Object.entries(household.caBenefits).filter(([, v]) => v > 0).length > 0 && (
                <div className={styles.rows}>
                  {Object.entries(household.caBenefits)
                    .filter(([, v]) => v > 0)
                    .map(([key, val]) => (
                      <p key={key} className={styles.row}>
                        <span>{CA_BENEFIT_NAMES[key] || BENEFIT_NAMES[key] || key}</span>
                        <span className={styles.mono}>+{formatMoney(val)}/mo</span>
                      </p>
                    ))}
                </div>
              )}
              {household.caAnnualCredits && Object.entries(household.caAnnualCredits).filter(([, v]) => v > 0).length > 0 && (
                <div className={classNames(styles.rows, styles.panelSplit)}>
                  <p className={styles.smallStrong}>Annual CA Tax Credits (at tax time)</p>
                  {Object.entries(household.caAnnualCredits)
                    .filter(([, v]) => v > 0)
                    .map(([key, val]) => (
                      <p key={key} className={styles.row}>
                        <span>{CA_BENEFIT_NAMES[key] || key}</span>
                        <span className={styles.mono}>+{formatMoney(val)}/year</span>
                      </p>
                    ))}
                  {(household.mixedStatus || household.fullyUndocumented) && (
                    <p className={styles.small}>
                      <em>California allows ITIN filers to claim these credits — unlike any federal tax credit.</em>
                    </p>
                  )}
                </div>
              )}
              {household.caEligibility && household.caEligibility.medicalExpansion && (household.mixedStatus || household.fullyUndocumented) && (
                <p className={classNames(styles.small, household.medicalEnrollment === 'none' && styles.fuchsiaText)}>
                  <em>
                    {household.medicalEnrollment === 'none'
                      ? 'No one in this family is enrolled in Medi-Cal. The adults can no longer apply after the January 2026 freeze. They qualify for emergency Medi-Cal only — ER visits initiated by hospital billing.'
                      : household.medicalEnrollment === 'children-only'
                        ? 'Only the children have Medi-Cal. The parents never applied and can no longer enroll after the freeze. They qualify for emergency Medi-Cal only.'
                        : household.fullyUndocumented
                          ? "Medi-Cal is this family's only health coverage — enrolled through California's expansion to all income-eligible residents regardless of immigration status."
                          : 'Medi-Cal covers all income-eligible California residents regardless of immigration status — parents excluded from federal Medicaid have full healthcare coverage here.'}
                  </em>
                </p>
              )}
            </Callout>
          )}

          <BudgetBar income={household.monthlyIncome} expenses={expenseTotal} benefits={benefitTotal} />
          <p className={styles.verdict}>
            {surplus >= 0
              ? `This household barely breaks even, with just ${formatMoney(surplus)} left over each month. There is no margin for error.`
              : `This household is already ${formatMoney(Math.abs(surplus))} short each month — even with benefits.`}
          </p>
          <div>
            <SimButton onClick={onContinue}>Begin policy rounds</SimButton>
          </div>
        </div>
      </section>
    </>
  )
}
