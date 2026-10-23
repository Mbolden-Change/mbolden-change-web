'use client'

import classNames from 'classnames'
import {useEffect, useState, type CSSProperties} from 'react'
import type {ProgramCaseStudy} from '@/sanity/types'
import {useScrollReveal} from '../motion/useScrollReveal'
import shared from './shared.module.scss'
import styles from './ProgramCaseStudy.module.scss'

// Needs in chip order, with each one's tile color.
const NEEDS: Array<{key: string; label: string; color: string}> = [
  {key: 'Housing', label: 'Housing', color: 'var(--brand-aqua-teal)'},
  {key: 'Clothing', label: 'Clothing', color: 'var(--brand-fuchsia)'},
  {key: 'Food', label: 'Food', color: 'var(--brand-black)'},
  {key: 'Transportation', label: 'Transportation', color: 'var(--brand-aqua-teal)'},
  {key: 'Medical', label: 'Medical', color: 'var(--brand-fuchsia)'},
  {key: 'School supplies', label: 'School supplies', color: 'var(--brand-black)'},
  {key: 'Other', label: 'Other emergencies', color: '#555'},
]
// Tiles rise in one after another, then settle so highlighting can move them.
const SETTLE_MS = 2400

const money = (amount: number) => `$${amount.toLocaleString('en-US')}`

function Eyebrow({text, bar}: {text?: string | null; bar: string}) {
  if (!text) return null
  return (
    <p className={classNames(styles.eyebrow, styles.rv)} style={{'--bar': bar} as CSSProperties}>
      {text}
    </p>
  )
}

/** Where the Money Went: one tile per payment, with chips that highlight the payments meeting each need. */
export function MoneyWent({eyebrow, heading, intro, items = []}: NonNullable<ProgramCaseStudy['payments']>) {
  const {ref, phase} = useScrollReveal<HTMLElement>(0.1)
  const [need, setNeed] = useState('All')
  const [settled, setSettled] = useState(false)

  useEffect(() => {
    if (phase !== 'in') return
    const timer = window.setTimeout(() => setSettled(true), SETTLE_MS)
    return () => window.clearTimeout(timer)
  }, [phase])

  if (!items.length) return null
  const present = new Set(items.flatMap((item) => item.needs ?? []))
  const chips = [{key: 'All', label: 'All'}, ...NEEDS.filter((n) => present.has(n.key))]
  const hits = items.filter((item) => need === 'All' || item.needs?.includes(need))
  const total = items.reduce((sum, item) => sum + (item.amount ?? 0), 0)
  const people = items.reduce((sum, item) => sum + (item.people ?? 0), 0)
  const needLabel = NEEDS.find((n) => n.key === need)?.label.toLowerCase() ?? need.toLowerCase()
  const tally =
    need === 'All'
      ? `${items.length} payments · ${money(total)} · ${people} people`
      : `${hits.length} ${hits.length === 1 ? 'payment' : 'payments'} included ${needLabel}`
  const pop = phase === 'armed' || (phase === 'in' && !settled)

  return (
    <section
      ref={ref}
      aria-label={heading ?? 'Where the Money Went'}
      className={classNames(styles.section, styles.money, phase === 'armed' && styles.armed, phase === 'in' && styles.in)}
    >
      <div className={classNames(styles.wrap, styles.moneyStack)}>
        <div className={styles.split}>
          <div className={styles.head}>
            <Eyebrow text={eyebrow} bar="var(--brand-black)" />
            {heading && <h2 className={classNames(styles.h2, styles.rv, styles.d1)}>{heading}</h2>}
          </div>
          {intro && <p className={classNames(styles.lead, styles.rv, styles.d2)}>{intro}</p>}
        </div>
        <div className={classNames(styles.needChips, styles.rv, styles.d2)} role="group" aria-label="Show payments by need">
          {chips.map((chip) => (
            <button
              key={chip.key}
              type="button"
              className={classNames(styles.needChip, need === chip.key && styles.needChipOn)}
              aria-pressed={need === chip.key}
              onClick={() => setNeed(chip.key)}
            >
              {chip.label}
            </button>
          ))}
        </div>
        <p className={classNames(styles.tally, styles.rv, styles.d3)} aria-live="polite">
          {tally}
        </p>
        <ul className={styles.tiles}>
          {items.map((item, index) => {
            const hit = need === 'All' || item.needs?.includes(need)
            const color = NEEDS.find((n) => n.key === item.needs?.[0])?.color ?? 'var(--brand-black)'
            const people = item.people ?? 1
            return (
              <li
                key={item._key}
                className={classNames(
                  styles.tile,
                  pop && styles.tilePop,
                  need !== 'All' && (hit ? styles.tileHit : styles.tileDim),
                )}
                style={{'--lane': color, animationDelay: `${(0.2 + index * 0.04).toFixed(2)}s`} as CSSProperties}
              >
                <small>{item.date}</small>
                <b>{money(item.amount ?? 0)}</b>
                <span>{item.use}</span>
                <span className={styles.tileWho}>{people === 1 ? 'Helped 1 person' : `Helped ${people} people`}</span>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}

/** From the Families: choose a speaker to see their quote, revealed word by word, with a note. */
export function Voices({eyebrow, heading, items = []}: NonNullable<ProgramCaseStudy['voices']>) {
  const {ref, phase} = useScrollReveal<HTMLElement>(0.15)
  const [index, setIndex] = useState(0)
  if (!items.length) return null
  const current = items[Math.min(index, items.length - 1)]
  const words = current.quote?.trim().split(/\s+/) ?? []

  return (
    <section
      ref={ref}
      aria-label={heading ?? 'From the Families'}
      className={classNames(styles.section, styles.voices, phase === 'armed' && styles.armed, phase === 'in' && styles.in)}
    >
      <div className={classNames(styles.wrap, styles.voicesGrid)}>
        <div className={styles.head}>
          <Eyebrow text={eyebrow} bar="var(--brand-warm-yellow)" />
          {heading && <h2 className={classNames(styles.h2, styles.rv, styles.d1)}>{heading}</h2>}
          <div className={classNames(styles.who, styles.rv, styles.d2)} role="group" aria-label="Choose a speaker">
            {items.map((item, i) => (
              <button
                key={item._key}
                type="button"
                className={classNames(i === index && styles.whoOn)}
                aria-pressed={i === index}
                onClick={() => setIndex(i)}
              >
                <b>{String(i + 1).padStart(2, '0')}</b>
                {item.speaker}
              </button>
            ))}
          </div>
        </div>
        <figure className={styles.voiceQuote} aria-live="polite">
          <span className={styles.voiceMark} aria-hidden="true">
            “
          </span>
          <blockquote>
            <p>
              <span className={shared.srOnly}>{current.quote}</span>
              {/* Keyed by speaker, so the words animate in again for each one. */}
              <span key={current._key} aria-hidden="true">
                {words.map((word, i) => (
                  <span key={i} className={styles.vword} style={{animationDelay: `${(0.1 + i * 0.05).toFixed(2)}s`}}>
                    {word}
                  </span>
                ))}
              </span>
            </p>
          </blockquote>
          {current.note && <figcaption>{current.note}</figcaption>}
        </figure>
      </div>
    </section>
  )
}
