'use client'

import classNames from 'classnames'
import Link from 'next/link'
import type {CSSProperties} from 'react'
import type {CaseStudyCards as CaseStudyCardsType, ProgramCaseStudy} from '@/sanity/types'
import {useScrollReveal} from '../motion/useScrollReveal'
import {laneVar} from './lanes'
import styles from './blocks.module.scss'

/** The page query adds `cards`: each referenced case study's card fields. */
export type CaseStudyCardsProps = CaseStudyCardsType & {
  cards?: Array<
    Pick<ProgramCaseStudy, '_id' | 'name' | 'color' | 'lane' | 'pilotYears' | 'cardSummary' | 'cardStats'> & {
      slug?: string | null
    }
  > | null
}

const DELAY = [styles.d1, styles.d2, styles.d3, styles.d4]

/** A section of Ready to Grow case studies, one card each. */
export default function CaseStudyCards({eyebrow, heading, cards, linkLabel = 'Read the case study'}: CaseStudyCardsProps) {
  const {ref, phase} = useScrollReveal<HTMLElement>(0.15)
  const list = (cards ?? []).filter((card) => card?.slug && card.name)
  if (!heading) return null

  return (
    <section
      ref={ref}
      className={classNames(styles.models, phase === 'armed' && styles.armed, phase === 'in' && styles.in)}
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
        {list.length > 0 && (
          <ul className={styles.cards}>
            {list.map((card, index) => {
              const meta = [card.lane, card.pilotYears && `Piloted ${card.pilotYears}`].filter(Boolean).join(' · ')
              return (
                <li
                  key={card._id}
                  className={classNames(styles.cardItem, styles.rv, DELAY[index % DELAY.length])}
                  style={{'--lane': laneVar(card.color)} as CSSProperties}
                >
                  <Link href={`/ready-to-grow/${card.slug}`} className={styles.card}>
                    <span className={styles.cardBar} aria-hidden="true" />
                    <span className={styles.cardBody}>
                      {meta && <span className={styles.meta}>{meta}</span>}
                      <h3 className={styles.cardTitle}>{card.name}</h3>
                      {card.cardSummary && <span className={styles.cardSummary}>{card.cardSummary}</span>}
                      {card.cardStats?.length ? (
                        <span className={styles.cardStats}>
                          {card.cardStats.map((stat) => (
                            <span key={stat._key} className={styles.cardStat}>
                              <span className={styles.cardNum}>{stat.value}</span>
                              <span className={styles.cardLabel}>{stat.label}</span>
                            </span>
                          ))}
                        </span>
                      ) : null}
                      <span className={styles.go}>
                        {linkLabel} <span aria-hidden="true">→</span>
                      </span>
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </section>
  )
}
