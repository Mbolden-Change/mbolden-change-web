'use client'

import {useEffect, useRef, useState, type CSSProperties} from 'react'
import classNames from 'classnames'
import type {WordReel as WordReelType} from '@/sanity/types'
import {useScrollReveal} from '../../motion/useScrollReveal'
import styles from './WordReel.module.scss'

export type WordReelProps = WordReelType

const DEFAULT_STEP_SECONDS = 2.5
const DEFAULT_LAST_HOLD_SECONDS = 4
// After a tab click, the chosen word stays this long before cycling resumes.
const CLICK_HOLD_MS = 8000

const COLORS = {
  teal: 'var(--brand-aqua-teal)',
  yellow: 'var(--brand-warm-yellow)',
  fuchsia: 'var(--brand-fuchsia)',
  stacked: 'var(--brand-warm-yellow)',
} as const

/**
 * “We are …” with one large word at a time on a slanted color block. Once in
 * view the words cycle continuously: each holds for the step time and the last
 * word for longer, then it loops. A tab shows its word and holds it for 8
 * seconds before cycling resumes from there. The timer pauses while the
 * section is off-screen or the browser tab is hidden. With reduced motion the
 * last word shows from the start and nothing moves.
 */
export default function WordReel({eyebrow, lead = 'We are', words, stepSeconds, lastHoldSeconds}: WordReelProps) {
  const {ref, phase} = useScrollReveal<HTMLElement>(0.1)
  const list = words?.filter((w) => w.word) ?? []
  const last = Math.max(0, list.length - 1)
  const stepMs = (stepSeconds && stepSeconds > 0 ? stepSeconds : DEFAULT_STEP_SECONDS) * 1000
  const lastHoldMs = (lastHoldSeconds && lastHoldSeconds > 0 ? lastHoldSeconds : DEFAULT_LAST_HOLD_SECONDS) * 1000

  const [active, setActive] = useState(0)
  const [cycling, setCycling] = useState(true)
  const [hydrated, setHydrated] = useState(false)
  const [inView, setInView] = useState(false)
  const [pageVisible, setPageVisible] = useState(true)
  // A tab click holds its word for longer than a normal step.
  const [clickHold, setClickHold] = useState(false)
  // Counts each time a word becomes active, so its timer starts afresh.
  const [turn, setTurn] = useState(0)
  // Only announce changes the visitor asked for, not the automatic cycle.
  const [announce, setAnnounce] = useState(false)

  const duration = clickHold ? CLICK_HOLD_MS : active === last ? lastHoldMs : stepMs
  const running = cycling && phase === 'in' && inView && pageVisible

  useEffect(() => {
    setHydrated(true)
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setActive(last)
      setCycling(false)
    }
  }, [last])

  // Pause while the section is off-screen or the browser tab is hidden.
  useEffect(() => {
    const node = ref.current
    const onVisibility = () => setPageVisible(!document.hidden)
    onVisibility()
    document.addEventListener('visibilitychange', onVisibility)
    if (!node || typeof IntersectionObserver === 'undefined') {
      setInView(true)
      return () => document.removeEventListener('visibilitychange', onVisibility)
    }
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting))
    observer.observe(node)
    return () => {
      observer.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [ref])

  // Time the current word. Pausing keeps the time left, so it resumes where
  // it stopped; each new word starts with its full time.
  const remaining = useRef(duration)
  const timedTurn = useRef(-1)
  useEffect(() => {
    if (timedTurn.current !== turn) {
      timedTurn.current = turn
      remaining.current = duration
    }
    if (!running || list.length < 2) return
    const startedAt = performance.now()
    const timer = window.setTimeout(() => {
      setActive((index) => (index + 1) % list.length)
      setClickHold(false)
      setAnnounce(false)
      setTurn((count) => count + 1)
    }, remaining.current)
    return () => {
      window.clearTimeout(timer)
      remaining.current = Math.max(0, remaining.current - (performance.now() - startedAt))
    }
  }, [running, turn, duration, list.length])

  if (!list.length) return null

  const choose = (index: number) => {
    setActive(index)
    setAnnounce(true)
    if (!cycling) return
    setClickHold(true)
    setTurn((count) => count + 1)
  }

  return (
    <section
      ref={ref}
      className={classNames(
        styles.wrapper,
        !hydrated && styles.ssr,
        phase === 'armed' && styles.armed,
        phase === 'in' && styles.in,
      )}
      aria-label={eyebrow || lead || 'Who we are'}
    >
      <div className={styles.inner}>
        {eyebrow && <p className={classNames(styles.eyebrow, styles.rv)}>{eyebrow}</p>}
        <div className={classNames(styles.reel, styles.rv, styles.d1)}>
          <h1 className={styles.heading}>
            <span className={styles.lead}>{lead}</span>
            <span className={styles.stack}>
              {list.map((w, index) => (
                <span
                  key={w._key}
                  className={classNames(
                    styles.word,
                    index === active && styles.on,
                    w.color === 'stacked' && styles.stacked,
                  )}
                  style={{'--c': COLORS[w.color ?? 'teal']} as CSSProperties}
                  aria-hidden={index !== active}
                >
                  {w.word}.
                </span>
              ))}
            </span>
          </h1>
          <div className={styles.lines} aria-live={announce ? 'polite' : 'off'}>
            {list.map((w, index) => (
              <p
                key={w._key}
                className={classNames(styles.line, index === active && styles.on)}
                aria-hidden={index !== active}
              >
                <strong>{w.opening}</strong> {w.line}
              </p>
            ))}
          </div>
          <div className={styles.tabs}>
            {list.map((w, index) => (
              <button
                key={w._key}
                type="button"
                className={classNames(
                  styles.tab,
                  index === active && styles.on,
                  index === active && cycling && phase === 'in' && styles.run,
                )}
                style={{'--c': COLORS[w.color ?? 'teal']} as CSSProperties}
                aria-pressed={index === active}
                onClick={() => choose(index)}
              >
                {w.word}
                {/* Remounted each turn so the timer bar restarts; it pauses with the timer. */}
                <i
                  key={index === active ? turn : 'idle'}
                  aria-hidden="true"
                  style={
                    index === active
                      ? ({
                          '--duration': `${duration}ms`,
                          animationPlayState: running ? 'running' : 'paused',
                        } as CSSProperties)
                      : undefined
                  }
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
