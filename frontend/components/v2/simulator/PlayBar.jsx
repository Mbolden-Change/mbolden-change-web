'use client'

import classNames from 'classnames'
import { formatMoney } from '@/lib/simulator/model'
import { Icon, StabilityBar, stabilityBand } from './ui'
import styles from './Simulator.module.scss'

function StartOver({ onRestart }) {
  return (
    <button type="button" onClick={onRestart} className={styles.startOver} aria-label="Start over with a new household">
      <Icon name="restart" size={16} />
      Start over
    </button>
  )
}

/** Black strip under the site header on the screens before and after the rounds. */
export function ScreenStrip({ label, onRestart }) {
  return (
    <div className={styles.strip}>
      <div className={classNames(styles.wrap, styles.stripInner)}>
        <p className={styles.stripLabel}>
          <span className={styles.yellowText}>The Safety Net Simulator</span>
          {label && <span> · {label}</span>}
        </p>
        <StartOver onRestart={onRestart} />
      </div>
    </div>
  )
}

/**
 * Sticks under the site header during the rounds: round progress, stability and
 * the monthly budget. Replaces the reference build's top bar, progress bar,
 * stability meter and budget card.
 */
export default function PlayBar({ household, current, total, score, income, benefits, expenses, onRestart }) {
  const gap = income + benefits - expenses
  const isNeg = gap < 0
  const band = stabilityBand(score)
  const [shortName, role] = household.name.split(' — ')
  return (
    <div className={styles.playBar} data-sim="playbar">
      <div className={classNames(styles.wrap, styles.playGrid)}>
        <div className={styles.playRound}>
          <div className={styles.playRoundHead}>
            <p className={styles.playRoundLabel}>
              <span className={styles.yellowText}>
                {shortName}
                {role && <span className={styles.srOnly}> — {role}</span>}
              </span>{' '}
              · <span data-sim="round">Round {current + 1} of {total}</span>
            </p>
            <StartOver onRestart={onRestart} />
          </div>
          <div
            className={styles.segments}
            role="progressbar"
            aria-valuenow={current + 1}
            aria-valuemin={1}
            aria-valuemax={total}
            aria-label={`Policy round ${current + 1} of ${total}`}
          >
            {Array.from({ length: total }).map((_, i) => (
              <span key={i} className={classNames(styles.segment, i < current && styles.segmentDone, i === current && styles.segmentNow)} />
            ))}
          </div>
        </div>

        <div className={styles.playStab} role="status" aria-live="polite" aria-label={`Household stability: ${Math.round(score)}%`}>
          <div className={styles.playStabHead}>
            <span className={styles.playKey}>Household stability</span>
            <span>
              <span className={styles.playStabPct} data-sim="stability">{Math.round(score)}%</span>{' '}
              <span className={classNames(styles.playBand, styles[`text_${band.tone}`])}>{band.label}</span>
            </span>
          </div>
          <StabilityBar score={score} dark />
        </div>

        <div className={styles.playBudget}>
          <p className={styles.srOnly}>Monthly Budget</p>
          <dl className={styles.playNums}>
            <div>
              <dt>Income</dt>
              <dd data-sim="income">{formatMoney(income)}</dd>
            </div>
            <div>
              <dt>Support</dt>
              <dd data-sim="support">{formatMoney(benefits)}</dd>
            </div>
            <div>
              <dt>Expenses</dt>
              <dd data-sim="expenses">{formatMoney(expenses)}</dd>
            </div>
          </dl>
          <p className={classNames(styles.playBalance, isNeg ? styles.balanceNeg : styles.balancePos)} data-sim="balance">
            {isNeg ? 'Shortfall: ' : 'Surplus: '}
            {formatMoney(Math.abs(gap))}/mo
          </p>
        </div>
      </div>
    </div>
  )
}
