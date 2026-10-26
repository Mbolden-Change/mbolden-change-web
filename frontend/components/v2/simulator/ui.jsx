'use client'

import { useEffect, useRef, useState } from 'react'
import classNames from 'classnames'
import { formatMoney } from '@/lib/simulator/model'
import styles from './Simulator.module.scss'

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && !!window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * A number that counts to `value` whenever it changes (and, with `from`, once on
 * mount). Returns [shown, counting]. With reduced motion it jumps to `value`.
 * The last frame is exactly `value`, and `counting` is simply shown !== value,
 * so it is true from the first render after a change until the count lands;
 * elements carry it as data-counting so tests can wait for it.
 */
export function useCountTo(value, { from = value, duration = 1400 } = {}) {
  const [shown, setShown] = useState(() => (prefersReducedMotion() ? value : from))
  const shownRef = useRef(shown)

  useEffect(() => {
    const start = shownRef.current
    const set = (v) => {
      shownRef.current = v
      setShown(v)
    }
    if (start === value || prefersReducedMotion()) {
      set(value)
      return
    }
    let frame = 0
    const t0 = performance.now()
    const tick = (now) => {
      const k = Math.min(1, (now - t0) / duration)
      const eased = 1 - Math.pow(1 - k, 3)
      set(k < 1 ? Math.round(start + (value - start) * eased) : value)
      if (k < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(frame)
      set(value)
    }
  }, [value, duration])

  return [shown, shown !== value]
}

// Line icons (24px grid, 2px stroke) that replace the reference build's emoji.
const ICONS = {
  arrowRight: 'M5 12h14M13 6l6 6-6 6',
  arrowLeft: 'M19 12H5M11 6l-6 6 6 6',
  restart: 'M3 12a9 9 0 1 0 3-6.7M3 4v5h5',
  chevronRight: 'M9 6l6 6-6 6',
  chevronDown: 'M6 9l6 6 6-6',
  chevronUp: 'M6 15l6-6 6 6',
  check: 'M5 12.5l4.5 4.5L19 7',
  x: 'M6 6l12 12M18 6L6 18',
  landmark: 'M3 21h18M5 21V10M9.5 21V10M14.5 21V10M19 21V10M2 10l10-6 10 6z',
  clipboard: 'M9 4h6v3H9zM9 5.5H6a1 1 0 0 0-1 1V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V6.5a1 1 0 0 0-1-1h-3M8.5 12h7M8.5 16h5',
  alert: 'M12 3l10 18H2zM12 10v5M12 18h.01',
  ban: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM5.6 5.6l12.8 12.8',
  shield: 'M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6z',
  home: 'M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z',
  share: 'M18 8a3 3 0 1 0-2.8-4M6 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM18 22a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM8.6 13.5l6.8 4M15.4 6.5l-6.8 4',
  megaphone: 'M3 11l15-6v14L3 13zM7 13v5a2 2 0 0 0 4 0v-3',
  download: 'M12 3v12M7 10l5 5 5-5M4 21h16',
  bolt: 'M13 2L4 14h7l-1 8 9-12h-7z',
  chat: 'M21 12a8 8 0 0 1-11.5 7.2L4 21l1.8-5.5A8 8 0 1 1 21 12z',
  mail: 'M3 5h18v14H3zM3 6l9 7 9-7',
  link: 'M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7',
}

export function Icon({ name, size = 20, className }) {
  return (
    <svg
      className={classNames(styles.icon, className)}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d={ICONS[name]} />
    </svg>
  )
}

/** Brand band for a stability score, matching the intro's stability scale. */
export function stabilityBand(score) {
  const s = Math.round(score)
  if (s >= 75) return { label: 'Stable', tone: 'stable' }
  if (s >= 50) return { label: 'One crisis away', tone: 'crisisAway' }
  if (s >= 25) return { label: 'Basic needs at risk', tone: 'atRisk' }
  return { label: 'Crisis', tone: 'crisis' }
}

/** A stability bar on a dark or light ground. Width floors at 2%, as in the reference build. */
export function StabilityBar({ score, dark = false, className }) {
  const band = stabilityBand(score)
  return (
    <div className={classNames(styles.stabTrack, dark && styles.stabTrackDark, className)} aria-hidden="true">
      <div className={classNames(styles.stabFill, styles[`tone_${band.tone}`])} style={{ width: `${Math.max(score, 2)}%` }} />
    </div>
  )
}

/** The reference build's severity dots, restyled. Hover or tap shows the impact label. */
export function SeverityDots({ severity, inverse = false }) {
  const [showTip, setShowTip] = useState(false)
  const sevLabels = { 1: 'Lower impact on stability', 2: 'Moderate impact on stability', 3: 'Severe impact on stability' }
  return (
    <span
      className={classNames(styles.dots, inverse && styles.dotsInverse)}
      role="img"
      aria-label={`Severity: ${severity} of 3 — ${sevLabels[severity]}`}
      onMouseEnter={() => setShowTip(true)}
      onMouseLeave={() => setShowTip(false)}
    >
      {[0, 1, 2].map((i) => (
        <span key={i} className={classNames(styles.dot, i < severity && styles[`sev${severity}`])} aria-hidden="true" />
      ))}
      {showTip && <span className={styles.tip} aria-hidden="true">{sevLabels[severity]}</span>}
    </span>
  )
}

/** The reference build's Monthly Budget card (household intro). */
export function BudgetBar({ income, expenses, benefits }) {
  const gap = income + benefits - expenses
  const isNeg = gap < 0
  return (
    <div className={styles.budget}>
      <div className={styles.budgetHead}>
        <span className={styles.budgetTitle}>Monthly Budget</span>
        <span className={isNeg ? styles.neg : styles.pos} data-sim="balance">
          {isNeg ? 'Shortfall: ' : 'Surplus: '}
          {formatMoney(Math.abs(gap))}
        </span>
      </div>
      {[
        ['Income', income, 'income'],
        ['Support', benefits, 'support'],
        ['Expenses', expenses, 'expenses'],
      ].map(([label, val, key]) => (
        <div key={label} className={styles.budgetRow}>
          <span className={styles.budgetLabel}>{label}</span>
          <span className={styles.budgetTrack} aria-hidden="true">
            <span
              className={classNames(styles.budgetFill, styles[`fill_${key}`])}
              style={{ width: label === 'Expenses' ? '100%' : `${Math.min(100, (val / (expenses || 1)) * 100)}%` }}
            />
          </span>
          <span className={styles.budgetVal}>{formatMoney(val)}</span>
        </div>
      ))}
    </div>
  )
}

/** Parallelogram button in the site's Donate style. `tone` is black, yellow or white. */
export function SimButton({ tone = 'black', children, icon = 'arrowRight', iconFirst = false, className, ...rest }) {
  return (
    <span className={classNames(styles.btnWrap, rest.disabled && styles.btnWrapDisabled)}>
      <button type="button" className={classNames(styles.btn, styles[`btn_${tone}`], className)} {...rest}>
        <span className={styles.btnLabel}>
          {iconFirst && icon && <Icon name={icon} size={18} />}
          {children}
          {!iconFirst && icon && <Icon name={icon} size={18} />}
        </span>
      </button>
    </span>
  )
}

/** Splits a title into words that rise in one after another (CSS; off with reduced motion). */
export function RiseWords({ text, start = 0 }) {
  return text.split(' ').map((word, i) => (
    <span key={i}>
      {i > 0 && ' '}
      <span className={styles.riseWord} style={{ '--i': start + i }}>
        {word}
      </span>
    </span>
  ))
}

/** Small uppercase label with the brand dash in front. */
export function Eyebrow({ children, dash = 'teal', className, as: Tag = 'p' }) {
  return <Tag className={classNames(styles.eyebrow, styles[`dash_${dash}`], className)}>{children}</Tag>
}
