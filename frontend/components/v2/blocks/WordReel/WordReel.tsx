'use client'

import {useEffect, useState, type CSSProperties} from 'react'
import classNames from 'classnames'
import type {WordReel as WordReelType} from '@/sanity/types'
import {useScrollReveal} from '../../motion/useScrollReveal'
import styles from './WordReel.module.scss'

export type WordReelProps = WordReelType

const STEP_MS = 4500

const COLORS = {
  teal: 'var(--brand-aqua-teal)',
  yellow: 'var(--brand-warm-yellow)',
  fuchsia: 'var(--brand-fuchsia)',
  stacked: 'var(--brand-warm-yellow)',
} as const

/**
 * “We are …” with one large word at a time on a slanted color block. Once in
 * view the words advance every 4.5 seconds, once, and stop on the last word;
 * the tabs jump to any word and stop the advance. With reduced motion the
 * last word shows from the start and nothing moves.
 */
export default function WordReel({eyebrow, lead = 'We are', words}: WordReelProps) {
  const {ref, phase} = useScrollReveal<HTMLElement>(0.1)
  const list = words?.filter((w) => w.word) ?? []
  const last = Math.max(0, list.length - 1)
  const [active, setActive] = useState(0)
  const [auto, setAuto] = useState(true)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setHydrated(true)
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setActive(last)
      setAuto(false)
    }
  }, [last])

  // Advance once through the words, starting when the section plays.
  useEffect(() => {
    if (!auto || phase !== 'in') return
    if (active >= last) {
      setAuto(false)
      return
    }
    const timer = window.setTimeout(() => setActive((index) => index + 1), STEP_MS)
    return () => window.clearTimeout(timer)
  }, [auto, phase, active, last])

  if (!list.length) return null

  const running = auto && phase === 'in'

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
          <div className={styles.lines} aria-live={auto ? 'off' : 'polite'}>
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
                  index === active && running && styles.run,
                )}
                style={{'--c': COLORS[w.color ?? 'teal']} as CSSProperties}
                aria-pressed={index === active}
                onClick={() => {
                  setActive(index)
                  setAuto(false)
                }}
              >
                {w.word}
                <i aria-hidden="true" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
