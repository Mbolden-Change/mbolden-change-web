'use client'

import { useState } from 'react'
import classNames from 'classnames'
import {
  REGIONS,
  BENEFIT_NAMES,
  SERVICE_COVERAGE_KEYS,
  adjustExpenses,
  calculateBaselineQuality,
  calculateEligibility,
  calculateFPL,
  estimateExpenses,
  formatMoney,
  generateCustomStory,
  getExpenseTotal,
} from '@/lib/simulator/model'
import { TealBand } from './HouseholdSelect'
import { Icon, SimButton, StabilityBar } from './ui'
import styles from './Simulator.module.scss'

function Choice({ selected, onClick, children }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={selected} className={classNames(styles.choice, selected && styles.choiceOn)}>
      {children}
    </button>
  )
}

function Field({ label, htmlFor, children, hint }) {
  const Label = htmlFor ? 'label' : 'p'
  return (
    <div className={styles.field}>
      <Label className={styles.fieldLabel} htmlFor={htmlFor}>{label}</Label>
      {children}
      {hint}
    </div>
  )
}

export default function HouseholdBuilder({ onComplete, onCancel }) {
  // ---- BEGIN VERBATIM reference lines 9240-9386 ----
      const [step, setStep] = useState(1);
      const [config, setConfig] = useState({
        name: "Your Household",
        adults: 1,
        children: 0,
        childrenAges: [],
        income: 2000,
        mixedStatus: false,
        fullyUndocumented: false,
        adultsOver65: 0,
        incomeSource: "employment",
        hasDisabledChild: false,
        region: null,
        customExpenses: null,
      });

      const handleInputChange = (field, value) => {
        const newConfig = { ...config, [field]: value };
        if (field === "children") {
          newConfig.childrenAges = Array(value).fill("under5");
          if (value === 0) newConfig.hasDisabledChild = false;
        }
        // Reset custom expenses when household composition changes (they'll be recalculated)
        if (field === "adults" || field === "children" || field === "region") {
          newConfig.customExpenses = null;
        }
        // Cap adultsOver65 when adults decrease
        if (field === "adults" && (newConfig.adultsOver65 || 0) > value) {
          newConfig.adultsOver65 = value;
        }
        setConfig(newConfig);
      };

      const handleAgeChange = (index, age) => {
        const newAges = [...config.childrenAges];
        newAges[index] = age;
        setConfig({ ...config, childrenAges: newAges });
      };

      const rawExpenses = estimateExpenses(config.adults, config.children, config.children > 0, config.fullyUndocumented);
      const preRegionExpenses = config.customExpenses || (config.region ? adjustExpenses(rawExpenses, config.region) : rawExpenses);
      const eligibility = calculateEligibility(
        config.income,
        config.adults,
        config.children,
        config.childrenAges.map(a => a === "under5" ? 3 : a === "5-12" ? 9 : 15),
        config.mixedStatus,
        config.adultsOver65 || 0,
        {
          incomeSource: config.incomeSource || "employment",
          childcareCost: preRegionExpenses.childcare || 0,
          housingCost: preRegionExpenses.housing || 0,
          medicalCost: (preRegionExpenses.healthcare || 0) + (preRegionExpenses.medications || 0),
          fullyUndocumented: config.fullyUndocumented || false,
        }
      );

      // Disability waiver: children with disabilities qualify for Medicaid regardless of family income
      // Models Katie Beckett / TEFRA waiver pathway — evaluates child's disability, not family income
      if (config.hasDisabledChild && config.children > 0) {
        const waiverValue = config.children * 600;
        if (!eligibility.medicaid.eligible || eligibility.medicaid.default === 0) {
          // No existing Medicaid — add childMedicaid via disability waiver
          eligibility.childMedicaid = { eligible: true, default: waiverValue, min: 0, max: waiverValue, note: "Qualifies through disability waiver (Katie Beckett/TEFRA) — evaluates child's disability, not family income" };
        }
      }

      const baseExpenses = preRegionExpenses;
      const cashBenefits = Object.entries(eligibility).reduce((sum, [key, val]) => {
        if (!SERVICE_COVERAGE_KEYS.includes(key) && !val.isAnnual && val.eligible) return sum + val.default;
        return sum;
      }, 0);
      const baselineQuality = calculateBaselineQuality(config.income, cashBenefits, baseExpenses, config.mixedStatus || config.fullyUndocumented, (config.adultsOver65 || 0) > 0, config.incomeSource, config.fullyUndocumented);

      const totalEligibleCount = Object.values(eligibility).filter(v => v.eligible && !v.isAnnual).length;
      const totalBenefitValue = Object.entries(eligibility).reduce((sum, [key, val]) => {
        if (val.eligible && !val.isAnnual) return sum + val.default;
        return sum;
      }, 0);
      const fplMonthly = calculateFPL(config.adults + config.children) / 12;
      const isHighIncome = config.income > fplMonthly * 4 && totalEligibleCount <= 2 && totalBenefitValue < 200;

      // High-income households get a very high stability score
      const highIncomeQuality = (() => {
        const expTotal = getExpenseTotal(baseExpenses);
        const ratio = expTotal > 0 ? config.income / expTotal : 2;
        if (ratio >= 5) return 97;
        if (ratio >= 3) return 95;
        if (ratio >= 2) return 92;
        if (ratio >= 1.5) return 88;
        if (ratio >= 1.3) return 78;
        if (ratio >= 1.15) return 68;
        return 58;
      })();

      const storyData = generateCustomStory({
        name: config.name,
        adults: config.adults,
        children: config.children,
        income: config.income,
        mixedStatus: config.mixedStatus,
        fullyUndocumented: config.fullyUndocumented,
        childrenAges: config.childrenAges,
        adultsOver65: config.adultsOver65,
        incomeSource: config.incomeSource,
        hasDisabledChild: config.hasDisabledChild,
      });

      const finalBenefits = Object.entries(eligibility).reduce((acc, [key, val]) => {
        if (val.eligible && val.default > 0 && !val.isAnnual) acc[key] = val.default;
        return acc;
      }, {});

      const createHousehold = () => {
        const household = {
          id: "custom-" + Date.now(),
          name: config.name,
          description: config.children > 0
            ? `${config.adults} adult${config.adults !== 1 ? "s" : ""}, ${config.children} child${config.children !== 1 ? "ren" : ""}. Monthly income: ${formatMoney(config.income)}.`
            : `${config.adults} adult${config.adults !== 1 ? "s" : ""}. Monthly income: ${formatMoney(config.income)}.`,
          monthlyIncome: config.income,
          members: config.adults + config.children,
          mixedStatus: config.mixedStatus,
          fullyUndocumented: config.fullyUndocumented || false,
          baselineQuality,
          baselineNote: storyData.baselineNote,
          benefits: finalBenefits,
          annualCredits: {
            ctc: eligibility.ctc.eligible ? eligibility.ctc.default : 0,
            eitc: eligibility.eitc.eligible ? eligibility.eitc.default : 0,
            ctcNote: (config.mixedStatus || config.fullyUndocumented) ? "ITIN filers cannot claim CTC under current law" : "Child Tax Credit refundable portion",
            eitcNote: (config.mixedStatus || config.fullyUndocumented) ? "ITIN filers are not eligible for EITC" : "Earned Income Tax Credit",
          },
          expenses: baseExpenses,
          customRegion: config.region,
          story: storyData.story,
          incomeNote: storyData.incomeNote,
          statusNote: storyData.statusNote,
          isCustom: true,
          adults: config.adults,
          children: config.children,
          childrenAges: config.childrenAges,
          adultsOver65: config.adultsOver65 || 0,
          incomeSource: config.incomeSource || "employment",
        };
        onComplete(household);
      };
  // ---- END VERBATIM ----

  let steps = [
    {
      title: 'Tell us about your family',
      content: (
        <div className={styles.fields}>
          <Field label="Household name" htmlFor="sim-hh-name">
            <input
              id="sim-hh-name"
              type="text"
              value={config.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={styles.input}
            />
          </Field>

          <Field label="Number of adults">
            <div className={styles.choices}>
              {[1, 2].map((n) => (
                <Choice key={n} selected={config.adults === n} onClick={() => handleInputChange('adults', n)}>
                  {n === 1 ? '1 adult' : '2 adults'}
                </Choice>
              ))}
            </div>
          </Field>

          <Field
            label="How many adults are age 65 or older?"
            hint={
              (config.adultsOver65 || 0) > 0 && (
                <p className={styles.hint}>Adults 65+ may qualify for Medicare and nutrition programs like Meals on Wheels.</p>
              )
            }
          >
            <div className={styles.choices}>
              {Array.from({ length: config.adults + 1 }, (_, i) => i).map((n) => (
                <Choice key={n} selected={(config.adultsOver65 || 0) === n} onClick={() => handleInputChange('adultsOver65', n)}>
                  {n}
                </Choice>
              ))}
            </div>
          </Field>

          {(config.adultsOver65 || 0) > 0 && (
            <Field
              label="What is this household's primary income source?"
              hint={
                <p className={styles.hint}>
                  {config.incomeSource === 'employment'
                    ? 'This household has working-age income earners.'
                    : config.incomeSource === 'retirement'
                      ? 'This household relies on fixed income from Social Security or pensions.'
                      : 'This household has a mix of employment wages and retirement income.'}
                </p>
              }
            >
              <div className={styles.choices}>
                {[
                  { value: 'employment', label: 'Employment wages' },
                  { value: 'retirement', label: 'Social Security / retirement' },
                  { value: 'mixed', label: 'Mix of both' },
                ].map((opt) => (
                  <Choice key={opt.value} selected={config.incomeSource === opt.value} onClick={() => handleInputChange('incomeSource', opt.value)}>
                    {opt.label}
                  </Choice>
                ))}
              </div>
            </Field>
          )}

          <Field label="Number of children" htmlFor="sim-hh-children">
            <select
              id="sim-hh-children"
              value={config.children}
              onChange={(e) => handleInputChange('children', parseInt(e.target.value))}
              className={styles.input}
            >
              {[0, 1, 2, 3, 4, 5, 6].map((n) => (
                <option key={n} value={n}>
                  {n === 0 ? 'No children' : n === 1 ? '1 child' : `${n} children`}
                </option>
              ))}
            </select>
          </Field>

          {config.children > 0 && (
            <Field label="Ages of children">
              <div className={styles.stack}>
                {config.childrenAges.map((age, i) => (
                  <select
                    key={i}
                    value={age}
                    aria-label={`Age of child ${i + 1}`}
                    onChange={(e) => handleAgeChange(i, e.target.value)}
                    className={styles.input}
                  >
                    <option value="under5">Under 5</option>
                    <option value="5-12">5-12</option>
                    <option value="13-17">13-17</option>
                  </select>
                ))}
              </div>
            </Field>
          )}

          {config.children > 0 && (
            <Field
              label="Does any child have a disability?"
              hint={
                config.hasDisabledChild && (
                  <p className={styles.hint}>
                    Children with disabilities may qualify for Medicaid through a disability waiver (Katie Beckett/TEFRA),
                    regardless of family income. The waiver evaluates only the child's disability status.
                  </p>
                )
              }
            >
              <div className={styles.choices}>
                {[
                  { value: false, label: 'No' },
                  { value: true, label: 'Yes' },
                ].map((opt) => (
                  <Choice key={String(opt.value)} selected={config.hasDisabledChild === opt.value} onClick={() => handleInputChange('hasDisabledChild', opt.value)}>
                    {opt.label}
                  </Choice>
                ))}
              </div>
            </Field>
          )}

          <Field
            label="Combined monthly earned income"
            htmlFor="sim-hh-income"
            hint={
              <p className={styles.hint}>
                Income at or below federal poverty line (~{formatMoney(calculateFPL(config.adults + config.children))} for your
                household) = income-based benefits
              </p>
            }
          >
            <div className={styles.moneyInput}>
              <span aria-hidden="true">$</span>
              <input
                id="sim-hh-income"
                type="number"
                value={config.income}
                onChange={(e) => handleInputChange('income', Math.max(0, parseInt(e.target.value) || 0))}
                className={styles.input}
                step="100"
              />
            </div>
          </Field>

          <fieldset className={styles.field}>
            <legend className={styles.fieldLabel}>Immigration & tax filing status</legend>
            <div className={styles.stack}>
              {[
                { id: 'citizen', label: 'SSN (US Citizen / Legal Permanent Resident)', desc: 'All family members have SSNs or are citizens' },
                { id: 'mixed', label: 'ITIN (Mixed-Status Family)', desc: 'Parents file with ITINs; children are US citizens with SSNs' },
                {
                  id: 'undocumented',
                  label: 'ITIN (Fully Undocumented)',
                  desc: 'All family members are undocumented. Parents file with ITINs. No SSNs in household.',
                },
              ].map((opt) => {
                const isSelected =
                  opt.id === 'citizen'
                    ? !config.mixedStatus && !config.fullyUndocumented
                    : opt.id === 'mixed'
                      ? config.mixedStatus
                      : config.fullyUndocumented
                return (
                  <label key={opt.id} className={classNames(styles.radioCard, isSelected && styles.radioCardOn)}>
                    <input
                      type="radio"
                      name="status"
                      checked={isSelected}
                      onChange={() => {
                        if (opt.id === 'citizen') setConfig((c) => ({ ...c, mixedStatus: false, fullyUndocumented: false }))
                        else if (opt.id === 'mixed') setConfig((c) => ({ ...c, mixedStatus: true, fullyUndocumented: false }))
                        else setConfig((c) => ({ ...c, mixedStatus: false, fullyUndocumented: true }))
                      }}
                    />
                    <span>
                      <span className={styles.radioTitle}>{opt.label}</span>
                      <span className={styles.radioDesc}>{opt.desc}</span>
                    </span>
                  </label>
                )
              })}
            </div>
          </fieldset>
        </div>
      ),
    },
    {
      title: "Here's what your family likely qualifies for",
      content: (
        <div className={styles.stack}>
          {Object.entries(eligibility)
            .filter(([key]) => key !== 'ctc' && key !== 'eitc')
            .map(([key, val]) => {
              const displayName = BENEFIT_NAMES[key] || key
              return (
                <div key={key} className={classNames(styles.eligRow, val.eligible && styles.eligRowOn)} data-sim="eligibility">
                  <div className={styles.eligHead}>
                    <div>
                      <h3 className={styles.eligName}>{displayName}</h3>
                      <p className={styles.small}>{val.note || 'Program eligibility'}</p>
                    </div>
                    <span className={val.eligible ? styles.eligYes : styles.eligNo} role="img" aria-label={val.eligible ? 'Eligible' : 'Not eligible'}>
                      <Icon name={val.eligible ? 'check' : 'x'} size={24} />
                    </span>
                  </div>
                  {val.eligible && val.default > 0 && (
                    <p className={styles.eligAmt}>
                      <span>Estimated monthly:</span> <strong>{formatMoney(val.default)}</strong>
                    </p>
                  )}
                </div>
              )
            })}
          {(eligibility.ctc.eligible || eligibility.eitc.eligible || config.mixedStatus || config.fullyUndocumented || config.children > 0) && (
            <div className={styles.creditBox}>
              <h3 className={styles.eligName}>Annual Tax Credits</h3>
              <div className={styles.rows}>
                <div className={styles.row}>
                  <span>EITC</span>
                  {eligibility.eitc.eligible ? (
                    <strong>{formatMoney(eligibility.eitc.default)}/year</strong>
                  ) : (
                    <span className={styles.small}>{eligibility.eitc.note || 'Not eligible'}</span>
                  )}
                </div>
                {config.children > 0 && (
                  <div className={styles.row}>
                    <span>CTC/ACTC</span>
                    {eligibility.ctc.eligible ? (
                      <strong>{formatMoney(eligibility.ctc.default)}/year</strong>
                    ) : (
                      <span className={styles.small}>{eligibility.ctc.note || 'Not eligible'}</span>
                    )}
                  </div>
                )}
              </div>
              <p className={styles.small}>Tax credits are annual — paid once at tax time, not monthly.</p>
              {(config.mixedStatus || config.fullyUndocumented) && (
                <p className={classNames(styles.small, styles.fuchsiaText)}>ITIN filers are not eligible for federal tax credits under current law.</p>
              )}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Where does this family live?',
      content: (
        <div className={styles.stack}>
          <p>
            Cost of living shapes this family's financial reality. Select a region to set realistic expense estimates — you
            can fine-tune them in the next step.
          </p>
          <div className={styles.regionGrid}>
            {REGIONS.map((r) => {
              const adj = adjustExpenses(rawExpenses, r)
              const adjTotal = getExpenseTotal(adj)
              const baseTotal = getExpenseTotal(rawExpenses)
              const diff = adjTotal - baseTotal
              const isOn = config.region && config.region.id === r.id
              return (
                <button
                  type="button"
                  key={r.id}
                  aria-pressed={!!isOn}
                  onClick={() => {
                    setConfig((prev) => ({ ...prev, region: r, customExpenses: null }))
                  }}
                  className={classNames(styles.regionCard, isOn && styles.regionCardOn)}
                >
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
                      <span className={styles.fuchsiaText}>+{formatMoney(diff)}/mo</span>
                    ) : (
                      <span className={styles.greenText}>{formatMoney(diff)}/mo</span>
                    )}
                    <span className={styles.small}>
                      Housing: {Math.round(r.housingMult * 100)}% | Other: {Math.round(r.otherMult * 100)}%
                    </span>
                  </span>
                </button>
              )
            })}
          </div>
          <p className={styles.note}>
            <strong>Note:</strong> Benefit eligibility is based on Federal Poverty Level thresholds, which are national — they
            do not adjust for regional cost of living. A family earning $100,000 in San Francisco faces the same eligibility
            rules as a family earning $100,000 in rural Mississippi, even though their financial realities are vastly
            different.
          </p>
        </div>
      ),
    },
    {
      title: 'Monthly expenses',
      content: (
        <div className={styles.stack}>
          <p>
            {config.region && config.region.id !== 'national-avg'
              ? `Pre-filled for ${config.region.name}. Adjust these to match your family's actual or expected costs.`
              : "Pre-filled with national average costs. Adjust these to match your family's actual or expected costs."}
          </p>
          {Object.entries(baseExpenses).map(([key, val]) => (
            <div key={key} className={styles.expenseRow}>
              <label className={styles.expenseLabel} htmlFor={`sim-exp-${key}`}>
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </label>
              <span className={styles.moneyInput}>
                <span aria-hidden="true">$</span>
                <input
                  id={`sim-exp-${key}`}
                  type="number"
                  value={Math.round(baseExpenses[key])}
                  onChange={(e) => {
                    const newExpenses = { ...baseExpenses, [key]: parseInt(e.target.value) || 0 }
                    setConfig((prev) => ({ ...prev, customExpenses: newExpenses }))
                  }}
                  className={classNames(styles.input, styles.inputShort)}
                />
              </span>
            </div>
          ))}
          <p className={styles.totalRow}>
            <span>Total monthly expenses:</span>
            <strong>{formatMoney(getExpenseTotal(baseExpenses))}</strong>
          </p>
        </div>
      ),
    },
    {
      title: 'Review and start',
      content: (
        <div className={styles.stack}>
          <dl className={styles.review}>
            <div>
              <dt>Household:</dt>
              <dd>{config.name}</dd>
            </div>
            <div>
              <dt>Members:</dt>
              <dd>
                {config.adults} adult{config.adults !== 1 ? 's' : ''}, {config.children} child{config.children !== 1 ? 'ren' : ''}
              </dd>
            </div>
            <div>
              <dt>Monthly income:</dt>
              <dd>{formatMoney(config.income)}</dd>
            </div>
            <div>
              <dt>Status:</dt>
              <dd>{config.fullyUndocumented ? 'Fully Undocumented (ITIN)' : config.mixedStatus ? 'Mixed-status (ITIN)' : 'US Citizen/LPR'}</dd>
            </div>
            <div className={styles.reviewRule}>
              <dt>Monthly benefits:</dt>
              <dd>{formatMoney(cashBenefits)}</dd>
            </div>
            <div>
              <dt>Monthly expenses:</dt>
              <dd>{formatMoney(getExpenseTotal(baseExpenses))}</dd>
            </div>
            <div>
              <dt>Monthly balance:</dt>
              <dd className={config.income + cashBenefits - getExpenseTotal(baseExpenses) >= 0 ? styles.greenText : styles.fuchsiaText}>
                {config.income + cashBenefits - getExpenseTotal(baseExpenses) >= 0 ? '+' : '−'}
                {formatMoney(Math.abs(config.income + cashBenefits - getExpenseTotal(baseExpenses)))}
              </dd>
            </div>
            <div className={styles.reviewRule}>
              <dt>Starting stability:</dt>
              <dd className={styles.reviewStab}>
                <StabilityBar score={baselineQuality} className={styles.reviewBar} />
                <strong>{baselineQuality}%</strong>
              </dd>
            </div>
          </dl>
          <p className={styles.note}>
            <strong>Ready to start?</strong> Click below to enter the simulation with this household and see how policy
            cuts affect them.
          </p>
        </div>
      ),
    },
  ]

  // ---- BEGIN VERBATIM reference lines 9806-9807 ----
      // Insert high-income awareness gate after Step 2 — this becomes the TERMINAL step
      const isAwarenessGateStep = isHighIncome && step === 3;
  // ---- END VERBATIM ----
  if (isHighIncome) {
    // Replace remaining steps with just the awareness gate
    steps.splice(2, steps.length - 2, {
      title: 'About this household',
      content: (
        <div className={styles.stableBox}>
          <div className={styles.stableHead}>
            <span className={styles.eligYes} aria-hidden="true">
              <Icon name="check" size={28} />
            </span>
            <div>
              <h3 className={styles.eligName}>This household is financially stable</h3>
              <p>
                Estimated stability: <strong>{highIncomeQuality}%</strong>
              </p>
            </div>
          </div>
          <StabilityBar score={highIncomeQuality} />
          <p>
            {totalEligibleCount === 0 ? (
              <>
                Based on your household's income of <strong>{formatMoney(config.income)}/month</strong> (
                {formatMoney(config.income * 12)}/year), this family doesn't qualify for any safety net programs. These
                programs are designed for families who need them — and at this income level, the safety net simply doesn't
                apply.
              </>
            ) : (
              <>
                Based on your household's income of <strong>{formatMoney(config.income)}/month</strong> (
                {formatMoney(config.income * 12)}/year), this family qualifies for very little from the safety net. That's
                the system working as intended — these programs target families who need them most.
              </>
            )}
          </p>
          <p>Go back and adjust the income to explore how families at different income levels are affected by these policy changes.</p>
          <p className={styles.note}>
            <strong>Why this matters:</strong> The safety net isn't designed for this income level. Families earning{' '}
            {formatMoney(config.income * 12)}/year don't depend on SNAP, Medicaid, or housing vouchers — so cuts to those
            programs won't affect them. But millions of working families do depend on these programs to bridge the gap
            between their wages and the cost of living. Try adjusting the income to see the real impact.
          </p>
        </div>
      ),
    })
  }

  // ---- BEGIN VERBATIM reference lines 9847-9848 ----
      const currentStep = steps[step - 1];
      const isLastStep = step === steps.length;
  // ---- END VERBATIM ----

  return (
    <>
      <TealBand
        title={
          <>
            {currentStep.title}
            {step === 1 && <span className={styles.beta}>BETA</span>}
          </>
        }
        as="h1"
      >
        <ol className={styles.steps} aria-label={`Step ${step} of ${steps.length}`}>
          {Array.from({ length: steps.length }, (_, i) => i + 1).map((s) => (
            <li key={s} className={classNames(styles.stepDot, s <= step && styles.stepDotOn)} aria-current={s === step ? 'step' : undefined}>
              {s}
            </li>
          ))}
        </ol>
      </TealBand>
      <section className={styles.cream}>
        <div className={classNames(styles.wrap, styles.builderWrap)}>
          <div className={styles.panel} data-sim="builder-step">{currentStep.content}</div>
          <div className={styles.navRow}>
            {step > 1 && (
              <SimButton tone="white" icon="arrowLeft" iconFirst onClick={() => setStep(step - 1)}>
                Back
              </SimButton>
            )}
            {step === 1 && (
              <SimButton tone="white" icon={null} onClick={onCancel}>
                Cancel
              </SimButton>
            )}
            <span className={styles.spacer} />
            {!isLastStep && <SimButton onClick={() => setStep(step + 1)}>Next</SimButton>}
            {isLastStep && !isAwarenessGateStep && <SimButton onClick={createHousehold}>Start Simulation</SimButton>}
            {isAwarenessGateStep && (
              <SimButton icon={null} onClick={onCancel}>
                Build a Different Household
              </SimButton>
            )}
          </div>
        </div>
      </section>
    </>
  )
}
