'use client'

import Link from 'next/link'
import classNames from 'classnames'
import type {CSSProperties} from 'react'
import type {FocusAreas as FocusAreasType} from '@/sanity/types'
import {useScrollReveal} from '../../motion/useScrollReveal'
import styles from './FocusAreas.module.scss'

type Accent = 'teal' | 'fuchsia' | 'yellow'

type Topic = {
  _key: string
  title?: string
  accent?: Accent
  card?: {label?: string; title?: string; summary?: string; anchor?: string} | null
}

/** The page query adds `source`: the referenced page's focus-index topics. */
export type FocusAreasProps = FocusAreasType & {
  source?: {slug?: string; topics?: Topic[] | null} | null
}

const LANES: Record<Accent, string> = {
  teal: 'var(--brand-aqua-teal)',
  fuchsia: 'var(--brand-fuchsia)',
  yellow: 'var(--brand-warm-yellow)',
}
// Without an explicit accent, colors follow the order on What We're Tackling.
const ORDER: Accent[] = ['teal', 'fuchsia', 'yellow']
const DELAYS = [styles.d1, styles.d2, styles.d3]

export default function FocusAreas({eyebrow, heading, linkLabel, source}: FocusAreasProps) {
  const {ref, phase} = useScrollReveal<HTMLElement>()
  const topics = source?.topics?.filter((topic) => topic.card?.title) ?? []

  if (!heading || !topics.length) return null

  const pagePath = source?.slug ? `/${source.slug}` : null

  return (
    <section
      ref={ref}
      className={classNames(styles.wrapper, phase === 'armed' && styles.armed, phase === 'in' && styles.in)}
      aria-label={heading}
    >
      <div className={styles.inner}>
        <div className={styles.head}>
          {eyebrow && <p className={classNames(styles.eyebrow, styles.rv)}>{eyebrow}</p>}
          <h2 className={classNames(styles.heading, styles.rv, styles.d1)}>{heading}</h2>
        </div>
        <div className={styles.grid}>
          {topics.map((topic, index) => {
            const accent = topic.accent ?? ORDER[index % ORDER.length]
            const card = topic.card!
            const paragraphs = card.summary?.split(/\n\s*\n/).map((text) => text.trim()).filter(Boolean) ?? []
            const href = pagePath ? `${pagePath}${card.anchor ? `#${card.anchor}` : ''}` : null
            const body = (
              <>
                {card.label && <span className={styles.label}>{card.label}</span>}
                <span className={styles.cardTitle}>{card.title}</span>
                {paragraphs.map((text, i) => (
                  <span key={i} className={styles.paragraph}>
                    {text}
                  </span>
                ))}
                {href && (
                  <span className={styles.go}>
                    {linkLabel || 'See it in action'} <span aria-hidden="true">↗</span>
                  </span>
                )}
              </>
            )
            return (
              <div
                key={topic._key}
                className={classNames(styles.column, styles.rv, DELAYS[index % DELAYS.length])}
                style={{'--lane': LANES[accent]} as CSSProperties}
              >
                {topic.title && <h3 className={styles.area}>{topic.title}</h3>}
                {href ? (
                  <Link href={href} className={classNames(styles.card, accent === 'yellow' && styles.yellow)}>
                    {body}
                  </Link>
                ) : (
                  <div className={styles.card}>{body}</div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
