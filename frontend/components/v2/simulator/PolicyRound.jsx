'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import classNames from 'classnames'
import { TRADEOFF_OPTIONS, formatMoney, getCABufferForRound, getEffectiveCutPercent } from '@/lib/simulator/model'
import { Eyebrow, Icon, SeverityDots, SimButton } from './ui'
import styles from './Simulator.module.scss'

// ---- BEGIN VERBATIM reference lines 10454-10489 ----
    const GLOSSARY = {
      "SNAP": "Supplemental Nutrition Assistance Program (food stamps)",
      "TANF": "Temporary Assistance for Needy Families (cash aid)",
      "WIC": "Women, Infants, and Children nutrition program",
      "CHIP": "Children\u2019s Health Insurance Program",
      "LIHEAP": "Low Income Home Energy Assistance Program",
      "EITC": "Earned Income Tax Credit (refundable tax credit for low-income workers)",
      "CTC": "Child Tax Credit ($2,200/child for 2025)",
      "ACTC": "Additional Child Tax Credit (refundable portion of the CTC)",
      "ACA": "Affordable Care Act (Obamacare)",
      "ITIN": "Individual Taxpayer Identification Number (used by people without SSNs to file taxes)",
      "SSN": "Social Security Number",
      "MFJ": "Married Filing Jointly (tax filing status)",
      "FPL": "Federal Poverty Level",
      "OBBB": "One Big Beautiful Bill Act (H.R. 1, signed July 4, 2025) \u2014 federal budget reconciliation law with major changes to SNAP, Medicaid, tax credits, and other programs",
      "CBO": "Congressional Budget Office",
      "OAA": "Older Americans Act",
      "EBT": "Electronic Benefits Transfer (card used for SNAP benefits)",
    };
    function glossarize(text) {
      if (!text) return null;
      const pattern = new RegExp(`\\b(${Object.keys(GLOSSARY).join("|")})\\b`, "g");
      const seen = new Set();
      const parts = [];
      let last = 0;
      let match;
      while ((match = pattern.exec(text)) !== null) {
        if (seen.has(match[1])) continue;
        seen.add(match[1]);
        if (match.index > last) parts.push(text.slice(last, match.index));
        parts.push(React.createElement("abbr", { key: match.index, title: GLOSSARY[match[1]], className: "abbr-tooltip" }, match[1]));
        last = match.index + match[1].length;
      }
      if (last < text.length) parts.push(text.slice(last));
      return parts.length > 0 ? parts : text;
    }
// ---- END VERBATIM ----

function ProgramInfoBox({ info }) {
  const [open, setOpen] = useState(false)
  if (!info) return null
  return (
    <div className={styles.programInfo}>
      <button type="button" onClick={() => setOpen(!open)} className={styles.programToggle} aria-expanded={open} data-sim="program-toggle">
        <Icon name={open ? 'chevronDown' : 'chevronRight'} size={18} />
        <span>{open ? 'Hide program details' : 'What is this program?'}</span>
      </button>
      {open && (
        <div className={styles.programBody}>
          <p>{glossarize(info)}</p>
        </div>
      )}
    </div>
  )
}

function CutBand({ round, current, total, children }) {
  // Each round starts with focus on its title, so keyboard and screen reader users begin there.
  const titleRef = useRef(null)
  useEffect(() => {
    if (current > 0 && titleRef.current) titleRef.current.focus({ preventScroll: true })
  }, [current])
  return (
    <section className={styles.cutBand}>
      <div className={classNames(styles.wrap, styles.cutBandInner)}>
        <div>
          <Eyebrow dash="yellow" className={styles.whiteText}>
            Round {current + 1} of {total}
          </Eyebrow>
          {round.isBudgetPressure && <p className={styles.pressureTag}>Budget Pressure Scenario — Not a direct OBBB provision</p>}
          <h1 className={styles.cutTitle} ref={titleRef} tabIndex={-1}>
            {round.title}
          </h1>
        </div>
        {children}
      </div>
    </section>
  )
}

function RoundBrief({ round }) {
  return (
    <section className={styles.cream}>
      <div className={classNames(styles.wrap, styles.briefGrid)}>
        <div className={styles.reading}>
          <p>{round.description}</p>
          <ProgramInfoBox info={round.programInfo} />
        </div>
        <aside className={styles.nationally}>
          <p className={styles.nationallyKey}>Nationally</p>
          <p>{round.context}</p>
        </aside>
      </div>
    </section>
  )
}

function OptionCard({ opt, selected, locked, onPick }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      disabled={locked && !selected}
      onClick={onPick}
      className={classNames(styles.option, selected && styles.optionOn, locked && styles.optionLocked)}
      data-sim="option"
    >
      <span className={styles.optionHead}>
        <span className={styles.optionTitle}>{opt.label}</span>
        <span className={styles.optionMark} aria-hidden="true">{selected && <Icon name="check" size={20} />}</span>
      </span>
      <span className={styles.optionDetail}>{opt.detail}</span>
      <SeverityDots severity={opt.severity} inverse={selected} />
    </button>
  )
}

function AreaOptions({ area, label, subtitle, selected, locked, onPick }) {
  const id = `sim-area-${area}`
  return (
    <div className={styles.area}>
      {label && (
        <h3 className={styles.areaLabel} id={id}>
          {label}
        </h3>
      )}
      {subtitle && <p className={styles.areaSub}>{subtitle}</p>}
      <div className={styles.optionGrid} role="radiogroup" aria-labelledby={label ? id : undefined} aria-label={label ? undefined : 'Tradeoff options'}>
        {(TRADEOFF_OPTIONS[area] || []).map((opt) => (
          <OptionCard key={opt.id} opt={opt} selected={selected === opt.id} locked={locked} onPick={() => onPick(area, opt.id)} />
        ))}
      </div>
    </div>
  )
}

function Change({ label, from, to }) {
  return (
    <div className={styles.change}>
      <p className={styles.changeKey}>{label}</p>
      <p className={styles.changeVal}>
        <span>{from}</span>
        <Icon name="arrowRight" size={18} />
        <span data-sim="after">{to}</span>
      </p>
    </div>
  )
}

const signedMoney = (n) => (n < 0 ? '−' : '+') + formatMoney(Math.abs(n))

/**
 * One policy round. The cut, the tradeoff penalties and the round history are
 * the reference build's (onChoice / onContinue are App's handlers). New here:
 * confirming applies the choice first, so the play bar updates while the round
 * stays on screen, and "Next policy round" then calls the continue handler
 * captured at confirm time, exactly as the reference build called it.
 */
export default function PolicyRound({ round, household, currentBenefits, onChoice, onContinue, onGoBack, current, total, live }) {
  // ---- BEGIN VERBATIM reference lines 10510-10547 ----
      const [selectedChoices, setSelectedChoices] = useState({});
      const effectiveCutPercent = useMemo(() => getEffectiveCutPercent(round, household), [round, household]);
      const hasPerKeyCut = !!round.perKeyCut;
      const isAffected = hasPerKeyCut || effectiveCutPercent > 0;

      // ─── CA Protection Layer ───────────────────────────────────────────
      const caBuffer = useMemo(() => getCABufferForRound(round.id, household), [round.id, household]);
      const caProtectedKeys = useMemo(() => (caBuffer && caBuffer.protectedKeys) || [], [caBuffer]);
      const caRemovedAreas = useMemo(() => (caBuffer && caBuffer.removedAreas) || [], [caBuffer]);
      const isFullyBuffered = caBuffer && caBuffer.level === "full";

      // Check if any selected tradeoff overrides the cut percent
      const overrideCutPercent = useMemo(() => {
        for (const [area, oid] of Object.entries(selectedChoices)) {
          const opt = (TRADEOFF_OPTIONS[area] || []).find((o) => o.id === oid);
          if (opt && opt.overrideCut !== undefined) return opt.overrideCut;
        }
        return null;
      }, [selectedChoices]);
      const finalCutPercent = overrideCutPercent !== null ? overrideCutPercent : effectiveCutPercent;

      const lostAmount = useMemo(() => {
        const keys = Array.isArray(round.programKey) ? round.programKey : [round.programKey];
        // Exclude CA-protected keys from the loss calculation
        const activeKeys = keys.filter(k => !caProtectedKeys.includes(k));
        if (hasPerKeyCut && overrideCutPercent === null) {
          return activeKeys.reduce((sum, key) => {
            const pct = round.perKeyCut[key] || 0;
            return sum + Math.round((currentBenefits[key] || 0) * (pct / 100));
          }, 0);
        }
        return activeKeys.reduce((sum, key) => sum + Math.round((currentBenefits[key] || 0) * (finalCutPercent / 100)), 0);
      }, [round, currentBenefits, finalCutPercent, hasPerKeyCut, overrideCutPercent, caProtectedKeys]);

      // Remove CA-buffered tradeoff areas from the list
      const relevantAreas = isAffected
        ? round.impactAreas.filter((a) => TRADEOFF_OPTIONS[a] && !caRemovedAreas.includes(a))
        : [];
  // ---- END VERBATIM ----

  const [confirmed, setConfirmed] = useState(null)
  const continueRef = useRef(null)

  const confirm = (apply) => {
    continueRef.current = onContinue
    setConfirmed({ support: live.support, balance: live.balance, score: live.score, lost: lostAmount, cut: finalCutPercent })
    apply()
  }
  const next = () => continueRef.current && continueRef.current()
  const pick = (area, id) => {
    if (!confirmed) setSelectedChoices((p) => ({ ...p, [area]: id }))
  }

  const backButton = onGoBack && !confirmed && (
    <SimButton tone="white" icon="arrowLeft" iconFirst onClick={onGoBack}>
      Previous round
    </SimButton>
  )

  const afterPanel = confirmed && (
    <div className={styles.changed} data-sim="what-changed">
      <div className={styles.changedNums}>
        <p className={styles.changedKey}>What changed this round</p>
        <div className={styles.changeGrid}>
          <Change label="Support" from={formatMoney(confirmed.support)} to={formatMoney(live.support)} />
          <Change label="Monthly budget" from={signedMoney(confirmed.balance)} to={signedMoney(live.balance)} />
          <Change label="Stability" from={`${Math.round(confirmed.score)}%`} to={`${Math.round(live.score)}%`} />
        </div>
      </div>
      <SimButton tone="yellow" onClick={next} autoFocus>
        Next policy round
      </SimButton>
    </div>
  )

  const confirmRow = (ready, label, apply) =>
    !confirmed && (
      <div className={styles.confirmRow}>
        {backButton}
        <SimButton disabled={!ready} onClick={() => ready && confirm(apply)}>
          {label}
        </SimButton>
        <p className={styles.hint} aria-live="polite">
          {ready ? 'Watch the budget and stability bars above.' : 'Pick one tradeoff to continue.'}
        </p>
      </div>
    )

  const nextRow = (apply) => (
    <div className={styles.confirmRow}>
      {backButton}
      <SimButton
        onClick={() => {
          apply()
          onContinue()
        }}
      >
        Next policy round
      </SimButton>
    </div>
  )

  // Awareness round
  if (round.isAwarenessRound && round.getAwarenessContent) {
    // ---- BEGIN VERBATIM reference lines 10551-10555 ----
        const aw = round.getAwarenessContent(household);
        const ex = aw.type === "excluded";
        const tradeoffAreas = (aw.forceTradeoff && aw.tradeoffAreas) ? aw.tradeoffAreas.filter(a => TRADEOFF_OPTIONS[a]) : [];
        const hasTradeoff = tradeoffAreas.length > 0;
        const tradeoffSelected = hasTradeoff ? tradeoffAreas.every(a => !!selectedChoices[a]) : true;
    // ---- END VERBATIM ----
    const areaLabels = { food: 'Food & Nutrition', healthcare: 'Healthcare', housing: 'Housing', insurance: 'Health Insurance', cashAssistance: 'Cash & Basic Needs', utilities: 'Utilities', childcare: 'Childcare', transportation: 'Transportation', medications: 'Medications', workRequirement: 'Work Requirements', taxCreditLoss: 'Coping with Lost Tax Credits', schoolFood: 'School Meals & Child Nutrition' }
    const apply = () => onChoice(hasTradeoff ? selectedChoices : {}, 0, 0, aw.qualityPenalty || 0)
    return (
      <div data-sim="round" data-kind="awareness">
        <CutBand round={round} current={current} total={total} />
        <RoundBrief round={round} />
        <section className={styles.white}>
          <div className={classNames(styles.wrap, styles.roundBody)}>
            <div className={classNames(styles.callout, ex ? styles.callout_fuchsia : styles.callout_teal)}>
              <Icon name={ex ? 'ban' : 'shield'} size={24} className={styles.calloutIcon} />
              <div>
                <h2 className={styles.calloutTitle}>{aw.heading}</h2>
                <p>{aw.message}</p>
                {aw.secondaryMessage && (
                  <p>
                    <em>{aw.secondaryMessage}</em>
                  </p>
                )}
              </div>
            </div>
            {hasTradeoff && (
              <div>
                {aw.tradeoffHeading && <h2 className={styles.sacrificeTitle}>{aw.tradeoffHeading}</h2>}
                {aw.tradeoffSubtext && <p className={styles.sacrificeSub}>{aw.tradeoffSubtext}</p>}
                {tradeoffAreas.map((area) => (
                  <AreaOptions
                    key={area}
                    area={area}
                    label={tradeoffAreas.length > 1 ? areaLabels[area] || area : null}
                    selected={selectedChoices[area]}
                    locked={!!confirmed}
                    onPick={pick}
                  />
                ))}
              </div>
            )}
            {hasTradeoff ? confirmRow(tradeoffSelected, 'Confirm choice', apply) : nextRow(apply)}
            {afterPanel}
          </div>
        </section>
      </div>
    )
  }

  // Unaffected
  if (!isAffected) {
    // ---- BEGIN VERBATIM reference lines 10623-10635 ----
        // For fully undocumented households, "not affected" = "never included" — reframe as exclusion
        const isExclusionFrame = household.fullyUndocumented && !round.isCASpecific;
        const exclusionMessages = {
          "snap-cut": "This family was never eligible for SNAP. No member has a qualified immigration status. The federal food assistance system does not include them.",
          "medicaid-cap": "This family has no federal Medicaid coverage to cut. Undocumented residents are ineligible for Medicaid. In California, they rely on Medi-Cal instead — a state-funded program now facing its own budget pressure.",
          "medicare-medicaid-combined": "This family has neither Medicare nor federal Medicaid. Both programs require qualified immigration status.",
          "medicaid-work-req": "Work requirements don't apply — not because this family is exempt, but because they were never enrolled in federal Medicaid in the first place.",
          "aca-premium-cliff": "This family is ineligible for ACA marketplace coverage. Undocumented residents cannot purchase plans on the exchange, even at full price. They have no access to premium subsidies.",
          "tanf-cut": "This family has never had access to TANF. Cash assistance requires qualified immigration status for the parents.",
          "housing-cut": "This family has never had a housing voucher. Section 8 and public housing require qualified immigration status. They find housing in the private market with no assistance.",
          "oaa-nutrition": "This family is not eligible for Older Americans Act nutrition programs or LIHEAP. These federal programs require qualified immigration status.",
          "liheap-only": "This family is not eligible for LIHEAP. Federal energy assistance requires qualified immigration status. In California, the CARE/FERA utility discount — which has no immigration status requirement — is their only energy cost relief.",
        };
    // ---- END VERBATIM ----
    return (
      <div data-sim="round" data-kind="unaffected">
        <CutBand round={round} current={current} total={total} />
        <RoundBrief round={round} />
        <section className={styles.white}>
          <div className={classNames(styles.wrap, styles.roundBody)}>
            {isExclusionFrame ? (
              <div className={classNames(styles.callout, styles.callout_fuchsia)}>
                <Icon name="ban" size={24} className={styles.calloutIcon} />
                <div>
                  <h2 className={styles.calloutTitle}>Not affected — because this family was never included</h2>
                  <p>
                    {exclusionMessages[round.id] ||
                      "This family has no access to this federal program. Undocumented residents are excluded from most federal benefits regardless of how long they've lived, worked, and paid taxes in the United States."}
                  </p>
                </div>
              </div>
            ) : (
              <div className={classNames(styles.callout, styles.callout_teal)}>
                <Icon name="shield" size={24} className={styles.calloutIcon} />
                <div>
                  <h2 className={styles.calloutTitle}>Your household is not directly affected</h2>
                  <p>{round.unaffectedMessage || "This policy change doesn't directly impact your household's benefits."}</p>
                </div>
              </div>
            )}
            {nextRow(() => onChoice({}, 0, 0))}
          </div>
        </section>
      </div>
    )
  }

  // Affected
  // ---- BEGIN VERBATIM reference lines 10674-10675 ----
      const noTradeoffsNeeded = relevantAreas.length === 0;
      const allSelected = noTradeoffsNeeded || Object.keys(selectedChoices).length >= relevantAreas.length;
  // ---- END VERBATIM ----
  const apply = () => onChoice(selectedChoices, lostAmount, finalCutPercent)
  const areaName = (area) =>
    ({ healthcare: 'Healthcare', workRequirement: 'Work Verification', medications: 'Medications', insurance: 'Insurance', cashAssistance: 'Losing Cash Assistance', utilities: 'Utilities', taxCreditLoss: 'Coping with Lost Tax Credits', schoolFood: 'School Meals & Child Nutrition' })[area] ||
    area.charAt(0).toUpperCase() + area.slice(1)

  const bufferMessages =
    household.caState && (!caBuffer || caBuffer.level !== 'full')
      ? (() => {
          // ---- BEGIN VERBATIM reference lines 10704-10728 ----
            const bufferMessages = [];
            const keys = Array.isArray(round.programKey) ? round.programKey : [round.programKey];

            // Show config-based callout for partial buffers
            if (caBuffer && caBuffer.level === "partial" && caBuffer.callout) {
              bufferMessages.push(caBuffer.callout);
            }

            // Narrative messages based on program keys and household characteristics
            if (keys.includes("snap") && household.mixedStatus) {
              bufferMessages.push("In California, the California Food Assistance Program (CFAP) provides CalFresh-equivalent benefits to some lawfully present immigrants excluded from federal SNAP. However, undocumented residents are not currently covered by CFAP.");
            }
            if (keys.includes("medicaid") || keys.includes("childMedicaid") || keys.includes("medicalExpansion")) {
              if (household.mixedStatus) {
                bufferMessages.push("California's Medi-Cal expansion covers all income-eligible residents regardless of immigration status — providing a crucial buffer for mixed-status families when federal Medicaid is cut. However, this state coverage faces its own budget pressure.");
              } else {
                bufferMessages.push("California's Medi-Cal program may absorb some coverage losses by maintaining broader eligibility than federal minimum requirements, but state budget constraints from the OBBB's cost-shifting limit this buffer.");
              }
            }
            if ((keys.includes("tanf") || keys.includes("calworks")) && household.caBenefits && household.caBenefits.calworksBoost) {
              bufferMessages.push("CalWORKs provides higher cash grants than federal TANF minimums — " + formatMoney(household.caBenefits.calworksBoost) + "/month above what federal TANF alone would provide. This state supplement partially cushions the erosion.");
            }
            if (keys.includes("liheap") && household.caBenefits && household.caBenefits.careDiscount && !(caBuffer && caBuffer.callout)) {
              bufferMessages.push("California's CARE program provides a 32.5% discount on electricity bills — a separate state program that partially offsets LIHEAP cuts.");
            }
          // ---- END VERBATIM ----
          return bufferMessages
        })()
      : []

  return (
    <div data-sim="round" data-kind="affected">
      <CutBand round={round} current={current} total={total}>
        <div className={styles.stamp} title={`This ${finalCutPercent}% models the combined effect of multiple provisions. Individual household impacts will vary.`}>
          <p className={styles.stampKey}>This family loses</p>
          <p className={styles.stampAmt} data-sim="cut">
            −{formatMoney(confirmed ? confirmed.lost : lostAmount)}
            <span>/month</span>
          </p>
          {(confirmed ? confirmed.cut : finalCutPercent) === 100 && <p className={styles.stampTotal}>TOTAL LOSS</p>}
        </div>
      </CutBand>
      <RoundBrief round={round} />
      <section className={styles.white}>
        <div className={classNames(styles.wrap, styles.roundBody)}>
          {caBuffer && caBuffer.level === 'full' && caBuffer.callout && (
            <div className={classNames(styles.callout, styles.callout_teal)}>
              <Icon name="shield" size={24} className={styles.calloutIcon} />
              <div>
                <h2 className={styles.calloutKey}>California Protects</h2>
                <p>{caBuffer.callout}</p>
                {caBuffer.note && (
                  <p className={styles.small}>
                    <em>{caBuffer.note}</em>
                  </p>
                )}
              </div>
            </div>
          )}
          {bufferMessages.length > 0 && (
            <div className={classNames(styles.callout, styles.callout_teal)}>
              <Icon name="landmark" size={24} className={styles.calloutIcon} />
              <div>
                <h2 className={styles.calloutKey}>California Buffer</h2>
                {bufferMessages.map((msg, i) => (
                  <p key={i} className={styles.small}>
                    {msg}
                  </p>
                ))}
              </div>
            </div>
          )}
          {relevantAreas.length > 0 && (
            <div>
              <h2 className={styles.sacrificeTitle}>What does this family sacrifice?</h2>
              <p className={styles.sacrificeSub}>Choose one tradeoff in each area. There are no good options.</p>
            </div>
          )}
          {relevantAreas.map((area) => (
            <AreaOptions
              key={area}
              area={area}
              label={areaName(area)}
              subtitle={round.areaSubtitles && round.areaSubtitles[area]}
              selected={selectedChoices[area]}
              locked={!!confirmed}
              onPick={pick}
            />
          ))}
          {noTradeoffsNeeded ? nextRow(apply) : confirmRow(allSelected, 'Confirm tradeoffs', apply)}
          {afterPanel}
        </div>
      </section>
    </div>
  )
}
