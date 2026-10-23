'use client'

import classNames from 'classnames'
import Link from 'next/link'
import type {CSSProperties} from 'react'
import type {StatementCards as StatementCardsType} from '@/sanity/types'
import {useScrollReveal} from '../motion/useScrollReveal'
import {SWATCH} from './newsFormat'
import styles from './news.module.scss'

type Card = {
  _key: string
  text?: string | null
  linkLabel?: string | null
  color?: string | null
  statement?: {title?: string | null; issue?: string | null; slug?: string | null} | null
}

export type StatementCardsProps = Omit<StatementCardsType, 'cards'> & {cards?: Card[] | null}

const DELAYS = [styles.d1, styles.d2, styles.d3, styles.d4]

/** Where We Stand: each statement as a large card on black. */
export default function StatementCards({eyebrow, heading, cards}: StatementCardsProps) {
  const {ref, phase} = useScrollReveal<HTMLElement>(0.15)
  const shown = (cards ?? []).filter((card) => card.statement?.slug && card.statement.title)
  if (!heading) return null

  return (
    <section
      ref={ref}
      className={classNames(styles.stand, phase === 'armed' && styles.armed, phase === 'in' && styles.in)}
      aria-label={heading}
    >
      <div className={classNames(styles.wrap, styles.stack)}>
        <div className={styles.head}>
          {eyebrow && (
            <p className={classNames(styles.eyebrow, styles.rv)} style={{'--bar': 'var(--brand-warm-yellow)'} as CSSProperties}>
              {eyebrow}
            </p>
          )}
          <h2 className={classNames(styles.h2, styles.rv, styles.d1)}>{heading}</h2>
        </div>
        {shown.length > 0 && (
          <div className={styles.stmtGrid}>
            {shown.map((card, i) => {
              const swatch = SWATCH[card.color ?? 'yellow'] ?? SWATCH.yellow
              return (
                <Link
                  key={card._key}
                  href={`/statement/${card.statement!.slug}`}
                  className={classNames(styles.stmt, styles.rv, DELAYS[Math.min(i, DELAYS.length - 1)])}
                  style={{'--lane': swatch.bg} as CSSProperties}
                >
                  {card.statement!.issue && (
                    <span className={styles.tag} style={{background: swatch.bg, color: swatch.ink}}>
                      {card.statement!.issue}
                    </span>
                  )}
                  <span className={styles.stmtTitle}>{card.statement!.title}</span>
                  {card.text && <span className={styles.stmtText}>{card.text}</span>}
                  <span className={styles.stmtGo}>{card.linkLabel || 'Read the statement →'}</span>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
