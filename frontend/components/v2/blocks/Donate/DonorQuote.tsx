'use client'

import classNames from 'classnames'
import type {CSSProperties} from 'react'
import type {DonorQuote as DonorQuoteType} from '@/sanity/types'
import {useScrollReveal} from '../../motion/useScrollReveal'
import styles from './Donate.module.scss'

/** One large fuchsia quote with its credit, on white. */
export default function DonorQuote({eyebrow, quote, attribution}: DonorQuoteType) {
  const {ref, phase} = useScrollReveal<HTMLElement>(0.2)
  const text = quote?.trim().replace(/^[“"]+|[”"]+$/g, '')
  if (!text) return null

  return (
    <section
      ref={ref}
      className={classNames(styles.quote, phase === 'armed' && styles.armed, phase === 'in' && styles.in)}
      aria-label={eyebrow || 'Quote'}
    >
      <figure className={classNames(styles.wrap, styles.quoteInner)}>
        {eyebrow && (
          <p className={classNames(styles.eyebrow, styles.rv)} style={{'--bar': 'var(--brand-fuchsia)'} as CSSProperties}>
            {eyebrow}
          </p>
        )}
        <blockquote className={classNames(styles.quoteText, styles.rv, styles.d1)}>
          <p>“{text}”</p>
        </blockquote>
        {attribution && (
          <figcaption className={classNames(styles.quoteCredit, styles.rv, styles.d2)}>{attribution}</figcaption>
        )}
      </figure>
    </section>
  )
}
