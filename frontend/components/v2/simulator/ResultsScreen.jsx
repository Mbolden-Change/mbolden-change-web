'use client'

import { useEffect, useRef, useState } from 'react'
import classNames from 'classnames'
import {
  BENEFIT_NAMES,
  CA_BENEFIT_NAMES,
  TRADEOFF_OPTIONS,
  formatMoney,
  generateSimulationSummary,
  getBenefitTotal,
} from '@/lib/simulator/model'
import { Eyebrow, Icon, RiseWords, SeverityDots, StabilityBar, prefersReducedMotion, stabilityBand, useCountTo } from './ui'
import Sources from './Sources'
import styles from './Simulator.module.scss'

const SHARE_URL = 'https://www.mboldenchange.org/simulator'

function QolChart({ history }) {
  // ---- BEGIN VERBATIM reference lines 10795-10804 ----
      if (!history || history.length < 2) return null;
      const W = 600, H = 210, PAD = { t: 20, r: 20, b: 70, l: 45 };
      const cw = W - PAD.l - PAD.r, ch = H - PAD.t - PAD.b;
      const pts = history.map((h, i) => ({
        x: PAD.l + (i / (history.length - 1)) * cw,
        y: PAD.t + (1 - h.score / 100) * ch,
        score: h.score, label: h.label,
      }));
      const pathD = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
      const areaD = pathD + ` L${pts[pts.length - 1].x},${PAD.t + ch} L${pts[0].x},${PAD.t + ch} Z`;
  // ---- END VERBATIM ----
  const bands = [
    [75, 100, 'stable'],
    [50, 75, 'crisisAway'],
    [25, 50, 'atRisk'],
    [0, 25, 'crisis'],
  ]
  return (
    <ChartReveal>
      <svg viewBox={`0 0 ${W} ${H}`} className={styles.chart} role="img" aria-label="Household stability trajectory chart showing score changes across policy rounds" data-sim="chart">
        {bands.map(([lo, hi, tone]) => (
          <rect key={tone} x={PAD.l} width={cw} y={PAD.t + (1 - hi / 100) * ch} height={((hi - lo) / 100) * ch} className={styles[`band_${tone}`]} />
        ))}
        {[0, 25, 50, 75, 100].map((v) => {
          const y = PAD.t + (1 - v / 100) * ch
          return (
            <g key={v}>
              <line x1={PAD.l} y1={y} x2={W - PAD.r} y2={y} className={styles.chartGrid} />
              <text x={PAD.l - 8} y={y + 4} textAnchor="end" className={styles.chartAxis}>
                {v}%
              </text>
            </g>
          )
        })}
        <path d={pathD} className={styles.chartLine} pathLength="1" />
        {pts.map((p, i) => (
          <g key={i} data-sim="chart-point" className={styles.chartPoint} style={{ '--i': i }}>
            <circle cx={p.x} cy={p.y} r={i === 0 ? 5 : i === pts.length - 1 ? 6 : 4} className={classNames(styles.chartDot, i === pts.length - 1 && styles[`dot_${stabilityBand(p.score).tone}`])} />
            <text x={i === 0 ? p.x + 14 : p.x} y={i === 0 ? p.y - 2 : p.y - 10} textAnchor={i === 0 ? 'start' : 'middle'} className={styles.chartPct}>
              {Math.round(p.score)}%
            </text>
            <text x={p.x} y={PAD.t + ch + 14} textAnchor="middle" className={styles.chartRound}>
              {i === 0 ? 'Start' : `Round ${i}`}
            </text>
            {p.label && p.label !== 'Start' && (
              <text x={p.x} y={PAD.t + ch + 26} textAnchor="middle" className={styles.chartLabel}>
                {p.label.length > 12 ? p.label.slice(0, 11) + '…' : p.label}
              </text>
            )}
          </g>
        ))}
      </svg>
    </ChartReveal>
  )
}

/**
 * Draws the trajectory when it scrolls into view. Like the site's
 * useScrollReveal, it stays finished without IntersectionObserver or with
 * reduced motion; it starts watching only after the simulator's own jump to
 * the top of the page, so the previous screen's scroll position can't play it.
 */
function useDrawOnView(threshold = 0.35) {
  const ref = useRef(null)
  const [phase, setPhase] = useState('static')
  useEffect(() => {
    const node = ref.current
    if (!node || typeof IntersectionObserver === 'undefined' || prefersReducedMotion()) return
    setPhase('armed')
    let observer
    const timer = setTimeout(() => {
      observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting && e.intersectionRatio >= threshold)) {
            setPhase('in')
            observer.disconnect()
          }
        },
        { threshold: [0, threshold, 0.6, 1] },
      )
      observer.observe(node)
    }, 150)
    return () => {
      clearTimeout(timer)
      if (observer) observer.disconnect()
    }
  }, [threshold])
  return { ref, phase }
}

function ChartReveal({ children }) {
  const { ref, phase } = useDrawOnView()
  return (
    <div ref={ref} className={classNames(styles.chartWrap, phase === 'armed' && styles.chartArmed, phase === 'in' && styles.chartIn)}>
      {children}
    </div>
  )
}

function ShareLinks() {
  const [copied, setCopied] = useState(false)
  const url = SHARE_URL
  return (
    <span className={styles.shareRow}>
      <a href={`mailto:?body=${encodeURIComponent(url)}`} aria-label="Share via Email" className={styles.shareBtn}>
        <Icon name="mail" size={18} />
      </a>
      <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer" aria-label="Share on Facebook" className={styles.shareBtn}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
          <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073c0 6.025 4.388 11.02 10.125 11.927v-8.437H7.078v-3.49h3.047V9.412c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.971h-1.513c-1.491 0-1.956.93-1.956 1.886v2.265h3.328l-.532 3.49h-2.796v8.437C19.612 23.093 24 18.098 24 12.073z" />
        </svg>
      </a>
      <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer" aria-label="Share on LinkedIn" className={styles.shareBtn}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      </a>
      <a href={`https://bsky.app/intent/compose?text=${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer" aria-label="Share on Bluesky" className={styles.shareBtn}>
        <svg width="18" height="18" viewBox="0 0 600 530" fill="currentColor" aria-hidden="true" focusable="false">
          <path d="M135.72 44.03C202.22 93.57 273.88 195.36 300 249.13c26.12-53.77 97.78-155.56 164.28-205.1C528.61-5.53 599.95-23.82 599.95 71.33c0 19.04-10.91 159.87-17.3 182.7-22.27 79.55-103.58 99.82-175.72 87.56 126.15 21.5 158.3 92.68 88.98 163.85-131.91 135.42-189.6-33.97-204.38-77.39-2.72-7.99-3.99-11.72-4.01-8.56-.02-3.16-1.29.57-4.01 8.56-14.78 43.42-72.47 212.81-204.38 77.39-69.32-71.17-37.17-142.35 88.98-163.85-72.14 12.26-153.45-8.01-175.72-87.56C-14.39 231.2 3.38 90.37 3.38 71.33c0-95.15 71.34-76.86 135.72-27.3z" />
        </svg>
      </a>
      <button
        type="button"
        onClick={() => {
          navigator.clipboard.writeText(url).then(() => {
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
          })
        }}
        aria-label="Copy simulator link to clipboard"
        className={styles.shareBtn}
      >
        <Icon name={copied ? 'check' : 'link'} size={18} />
      </button>
    </span>
  )
}

function Action({ icon, tone, title, desc, children, ...props }) {
  const Tag = props.href ? 'a' : 'button'
  return (
    <Tag className={styles.action} {...(Tag === 'button' ? { type: 'button' } : {})} {...props}>
      <span className={classNames(styles.actionIcon, styles[`actionIcon_${tone}`])}>
        <Icon name={icon} size={22} />
      </span>
      <span className={styles.actionText}>
        <span className={styles.actionTitle}>{title}</span>
        <span className={styles.small}>{desc}</span>
        {children}
      </span>
    </Tag>
  )
}

export default function ResultsScreen({ household, region, finalBenefits, finalScore, allChoices, skippedRounds, rounds, qolHistory, onRestart }) {
  // ---- BEGIN VERBATIM reference lines 10838-10845 ----
      const originalBenefits = getBenefitTotal(household.benefits);
      const remainingBenefits = getBenefitTotal(finalBenefits);
      const totalLost = originalBenefits - remainingBenefits;
      const percentLost = Math.round((totalLost / (originalBenefits || 1)) * 100);
      const allTradeoffs = allChoices.flatMap((cs) => Object.entries(cs).map(([area, oid]) => {
        const opt = (TRADEOFF_OPTIONS[area] || []).find((o) => o.id === oid);
        return opt ? { area, ...opt } : null;
      }).filter(Boolean)).filter((t, i, arr) => arr.findIndex((x) => x.id === t.id) === i);
  // ---- END VERBATIM ----
  // Final stability counts down from where the family started.
  const [shownFinal, counting] = useCountTo(finalScore, { from: qolHistory.length ? qolHistory[0].score : finalScore, duration: 1800 })
  const band = stabilityBand(shownFinal)

  return (
    <div data-sim="results">
      <section className={styles.resultsHero}>
        <div className={classNames(styles.wrap, styles.resultsGrid)}>
          <div>
            <Eyebrow dash="teal" className={styles.yellowText}>SIMULATION COMPLETE</Eyebrow>
            <h1 className={styles.resultsTitle}>
              <RiseWords text={household.name} />
            </h1>
            {region && region.id !== 'national-avg' && <p className={styles.mutedDark}>Region: {region.name}</p>}
            <div className={styles.finalStab} role="status" aria-label={`Household stability: ${Math.round(finalScore)}%`}>
              <p className={styles.playKey}>Final Household Stability</p>
              <p className={styles.finalPct} data-sim="final-stability" data-counting={counting || undefined} aria-hidden="true">
                {Math.round(shownFinal)}%
              </p>
              <p className={classNames(styles.finalBand, styles[`text_${band.tone}`])}>{band.label}</p>
              <StabilityBar score={shownFinal} dark />
              <p className={styles.mutedDark}>This family's capacity to meet basic needs under current conditions</p>
            </div>
          </div>

          <div className={classNames(styles.receipt, styles.receiptPrint)} data-sim="receipt">
            <p className={styles.receiptKey}>THE COST</p>
            <p className={styles.small}>What this family lost</p>
            <p className={styles.receiptLine}>
              <span>Support lost / month</span>
              <strong>{formatMoney(totalLost)}</strong>
            </p>
            <p className={styles.receiptLine}>
              <span>Safety net cut</span>
              <strong>{percentLost}%</strong>
            </p>
            <p className={styles.receiptLine}>
              <span>Household stability</span>
              <strong>{Math.round(finalScore)}%</strong>
            </p>
            <p className={styles.receiptTotal}>
              <span>Annual impact</span>
              <strong>{formatMoney(totalLost * 12)}/year</strong>
            </p>
            <p className={styles.receiptDate}>
              Generated {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>
      </section>

      <section className={styles.white}>
        <div className={styles.wrap}>
          <Eyebrow dash="teal">HOUSEHOLD STABILITY TRAJECTORY</Eyebrow>
          <p className={styles.small}>Each point represents a new round of cuts to safety net programs</p>
          <QolChart history={qolHistory} />
        </div>
      </section>

      {(allTradeoffs.length > 0 || skippedRounds.length > 0) && (
        <section className={styles.cream}>
          <div className={classNames(styles.wrap, styles.outcomeGrid)}>
            {allTradeoffs.length > 0 && (
              <div>
                <Eyebrow dash="fuchsia" className={styles.fuchsiaText}>IMPOSSIBLE CHOICES</Eyebrow>
                <h2 className={styles.sectionTitle}>The tradeoffs this family was forced to make:</h2>
                <ul className={styles.tradeoffList}>
                  {allTradeoffs.map((t, i) => (
                    <li key={i} className={styles.tradeoff}>
                      <span>
                        <span className={styles.tradeoffTitle}>{t.label}</span>
                        <span className={styles.small}>{t.detail}</span>
                      </span>
                      <SeverityDots severity={t.severity} />
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {skippedRounds.length > 0 && (
              <div>
                <Eyebrow dash="teal" className={styles.tealDarkText}>NOT DIRECTLY AFFECTED</Eyebrow>
                <h2 className={styles.sectionTitleSm}>Policies that didn't affect your household:</h2>
                <ul className={styles.skippedList}>
                  {skippedRounds.map((rid, i) => {
                    const r = rounds.find((x) => x.id === rid)
                    return r ? (
                      <li key={i} className={styles.skipped}>
                        <span className={styles.skippedTitle}>{r.title}</span>
                        <span className={styles.small}>Your family was protected, but other families — especially mixed-status households — were not.</span>
                      </li>
                    ) : null
                  })}
                </ul>
              </div>
            )}
          </div>
        </section>
      )}

      {(household.mixedStatus || household.fullyUndocumented || household.caState) && (
        <section className={styles.cream}>
          <div className={classNames(styles.wrap, styles.introStack)}>
            {household.mixedStatus &&
              (() => {
                // ---- BEGIN VERBATIM reference lines 10928-10934 ----
            const familyName = household.isCustom ? "This family" : "The Ramirez family";
            const numKids = household.isCustom ? (household.children || 0) : 3;
            const ctcLostNum = Math.min(numKids * 1700, Math.max(0, (household.monthlyIncome * 12 - 2500) * 0.15)); // [Audit v6 H2] same formula for presets and custom — one number per run
            const ctcLost = "$" + ctcLostNum.toLocaleString();
            const caStateCredits = (household.caAnnualCredits && household.caAnnualCredits.caleitc) || 0;
            const hasCACredits = household.caState && caStateCredits > 0;
            const caStateCreditsStr = "$" + caStateCredits.toLocaleString();
                // ---- END VERBATIM ----
                return (
                  <div className={classNames(styles.essay, styles.essay_fuchsia)} data-sim="essay">
                    <Eyebrow dash="fuchsia" className={styles.fuchsiaText}>SYSTEMIC EXCLUSION</Eyebrow>
                    <h2 className={styles.sectionTitle}>The hidden cost of immigration status</h2>
                    <p>
                      {familyName} started this simulation with fewer benefits than other households. The parents had no
                      Medicaid, no TANF, no housing assistance, and no EITC. Their US-citizen children qualified for SNAP and
                      Medicaid — but the household SNAP benefit is pro-rated, counting only eligible members, so the family
                      receives less than a citizen household of the same size. Under the TCJA (2018–2025), the parents could at
                      least claim the Child Tax Credit for those children — about {ctcLost}/year. The OBBB took that away by
                      requiring the filer to have an SSN.
                    </p>
                    {hasCACredits ? (
                      <p>
                        California partially offsets this loss: ITIN filers are eligible for the CalEITC and Young Child Tax
                        Credit (YCTC), worth {caStateCreditsStr}/year for this family. This is a meaningful difference — and one
                        that exists because California chose to recognize these families' contributions. But it does not fully
                        replace the {ctcLost}/year in federal credits that were taken away.
                      </p>
                    ) : household.caState ? (
                      <p>
                        California allows ITIN filers to claim the CalEITC and Young Child Tax Credit — a meaningful policy
                        distinction. However, this family's income exceeds the $32,900 eligibility threshold, so the state
                        credits do not apply here. The federal loss stands unmitigated.
                      </p>
                    ) : null}
                    <p>
                      These parents pay payroll taxes, sales taxes, and income taxes. They contribute approximately $800
                      annually to a Medicare Trust Fund they are legally barred from ever using, and pay into Social Security
                      they will never collect. Their children are Americans. But policy choices treat them as if they don't
                      exist — or worse, as if they don't deserve to.
                    </p>
                    <p className={styles.small}>
                      Undocumented immigrants contribute an estimated $25.6 billion per year to Social Security and $6.4
                      billion to Medicare (ITEP, 2024; based on 2022 tax data) — funds they are legally barred from ever
                      accessing.
                    </p>
                  </div>
                )
              })()}

            {household.fullyUndocumented &&
              (() => {
                // ---- BEGIN VERBATIM reference lines 10952-10955 ----
            const familyName = household.isCustom ? "This family" : "The Chen family";
            const caStateCredits = (household.caAnnualCredits && household.caAnnualCredits.caleitc) || 0;
            const hasCACredits = household.caState && caStateCredits > 0;
            const caStateCreditsStr = "$" + caStateCredits.toLocaleString();
                // ---- END VERBATIM ----
                return (
                  <div className={classNames(styles.essay, styles.essay_black)} data-sim="essay">
                    <Eyebrow dash="fuchsia" className={styles.fuchsiaText}>INVISIBLE BY DESIGN</Eyebrow>
                    <h2 className={styles.sectionTitle}>The federal safety net was never built for this family</h2>
                    <p>
                      {familyName} went through this simulation and was unaffected by most federal policy rounds — not because
                      they were protected, but because the federal government never included them. No SNAP. No Medicaid. No
                      TANF. No housing voucher. No EITC. No CTC. They pay taxes, raise children, work essential jobs, and
                      contribute to communities. The safety net looks through them.
                    </p>
                    {hasCACredits ? (
                      <p>
                        California is the exception. Medi-Cal covered their healthcare. CalEITC and YCTC returned{' '}
                        {caStateCreditsStr}/year in tax credits — because California recognizes ITIN filers. The CARE utility
                        discount helped with energy costs. The Universal Meals Program fed their children at school. One state
                        chose to see this family. But even California's safety net is now under pressure from the same federal
                        budget cuts that were never meant to affect them directly.
                      </p>
                    ) : (
                      <p>
                        Without California's state programs, this family would have had almost no formal support at all. Their
                        informal safety net — community networks, employer kindness, church donations, shared housing — is the
                        only thing between them and crisis. That network is not a policy. It cannot scale. And it is invisible
                        to every budget line in every appropriations bill.
                      </p>
                    )}
                    <p>
                      {familyName} contributes approximately $800 annually to a Medicare Trust Fund they are legally barred from
                      ever using, and pays into Social Security they will never collect. They are part of the estimated 11
                      million undocumented residents who contribute $25.6 billion per year to Social Security and $6.4 billion
                      to Medicare — funds they are legally barred from ever accessing.
                    </p>
                    <p className={styles.small}>
                      The question this simulation asks is not "what happens when the safety net is cut?" For this family, the
                      question is: "what happens when you were never caught by it in the first place?"
                    </p>
                  </div>
                )
              })()}

            {household.caState && (
              <div className={classNames(styles.essay, styles.essay_teal)} data-sim="ca-role">
                <Eyebrow dash="teal" className={styles.tealDarkText}>CALIFORNIA'S ROLE</Eyebrow>
                <h2 className={styles.sectionTitle}>How California's safety net cushioned the blow</h2>
                <p>
                  California maintains some of the most comprehensive state-level safety net programs in the country. For
                  this household, state programs provided an additional layer of support that partially offset federal cuts:
                </p>
                {household.caBenefits && Object.entries(household.caBenefits).filter(([, v]) => v > 0).length > 0 && (
                  <div className={styles.panel}>
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
                  <div className={styles.panel}>
                    <p className={styles.smallStrong}>Annual CA Tax Credits</p>
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
                        <em>
                          California allows ITIN filers to claim these state tax credits — a real but partial offset to the
                          federal credits this family lost. At incomes like this family's, the state credits replace roughly a
                          third of the lost federal CTC.
                        </em>
                      </p>
                    )}
                  </div>
                )}
                {household.calworksUnclaimed && (
                  <div className={classNames(styles.panel, styles.unclaimed)}>
                    <p className={classNames(styles.smallStrong, styles.fuchsiaText)}>Unclaimed entitlement</p>
                    <p className={styles.row}>
                      <span>Child-only CalWORKs grant their citizen children qualify for</span>
                      <span className={classNames(styles.mono, styles.fuchsiaText)}>{formatMoney(household.calworksUnclaimed.amount)}/mo not received</span>
                    </p>
                    <p className={styles.small}>
                      {household.calworksUnclaimed.note}. Like most mixed-status families, this household has never applied —
                      fear of immigration consequences and verification burdens keep take-up low. The law owes their children
                      this money; the system's design keeps it unclaimed.
                    </p>
                  </div>
                )}
                <p className={styles.small}>
                  <em>
                    But California's safety net is not invulnerable. Federal cost-shifting from the OBBB puts state budgets
                    under enormous pressure. If California is forced to cut CalWORKs, freeze Medi-Cal enrollment, or reduce
                    childcare subsidies, these buffers disappear — and families fall harder.
                  </em>
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      <section className={styles.black}>
        <div className={classNames(styles.wrap, styles.meaning)}>
          <h2 className={styles.sectionTitleLg}>What this means</h2>
          <p>
            This simulation covered {rounds.length} policy changes. In real life, these cuts can happen simultaneously,
            compounding their effects. Families don't get to choose one hardship at a time — they face them all at once.
          </p>
          <p>
            The safety net isn't a luxury. It's the difference between stability and crisis for millions of families who are
            already working, already sacrificing, already stretched to their limit.
          </p>
          <p className={styles.meaningPull}>Every choice you made in this simulation is a choice real people are making right now.</p>
        </div>
      </section>

      <section className={styles.tealSection}>
        <div className={styles.wrap}>
          <Eyebrow dash="black">WHAT YOU CAN DO</Eyebrow>
          <h2 className={styles.sectionTitleLg}>Turn understanding into action</h2>
          <div className={styles.actionGrid}>
            <Action icon="home" tone="yellow" title="Explore Another Household" desc="Choose a preset family or build your own" onClick={onRestart} />
            <div className={styles.action}>
              <span className={classNames(styles.actionIcon, styles.actionIcon_black)}>
                <Icon name="share" size={22} />
              </span>
              <span className={styles.actionText}>
                <span className={styles.actionTitle}>Share the Simulator</span>
                <span className={styles.small}>Email, Facebook, LinkedIn, Bluesky or copy the link</span>
                <ShareLinks />
              </span>
            </div>
            <Action icon="megaphone" tone="fuchsia" title="Stay Informed" desc="Sign up for our newsletter for action alerts & updates" href="https://www.mboldenchange.org/" target="_blank" rel="noopener noreferrer" />
            <Action
              icon="download"
              tone="black"
              title="Download Summary"
              desc="Get a printable one-page summary for testimony, grants, or presentations"
              onClick={() => generateSimulationSummary({ household, region, finalBenefits, finalScore, allChoices, skippedRounds, rounds })}
            />
            <Action icon="bolt" tone="yellow" title="Use This in Your Work" desc="Contact us to bring the simulator into trainings, workshops, or advocacy" href="mailto:action@mboldenchange.org" />
            <Action
              icon="chat"
              tone="fuchsia"
              title="Give Us Feedback"
              desc="Tell us what worked, what didn't, and what you'd like to see next"
              href="https://docs.google.com/forms/d/e/1FAIpQLSedyr78bI2Z4jjsIeWSA04eloBR-5RLSdS64GKWaCFJ9QVlbg/viewform"
              target="_blank"
              rel="noopener noreferrer"
            />
          </div>
        </div>
      </section>

      <Sources />
    </div>
  )
}
