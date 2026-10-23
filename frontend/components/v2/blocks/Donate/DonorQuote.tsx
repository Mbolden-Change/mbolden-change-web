'use client'

import classNames from 'classnames'
import type {CSSProperties} from 'react'
import type {DonorQuote as DonorQuoteType} from '@/sanity/types'
import {useScrollReveal} from '../../motion/useScrollReveal'
import styles from './Donate.module.scss'

// The quote appears word by word once the section plays, as on the homepage
// and case studies but quicker: a long quote finishes in about 2.5 seconds.
const WORDS_START = 0.1
const WORD_STEP = 0.04
const WORD_DURATION = 0.35

/** One large fuchsia quote with its credit, on white. */
export default function DonorQuote({eyebrow, quote, attribution}: DonorQuoteType) {
  const {ref, phase} = useScrollReveal<HTMLElement>(0.2)
  const text = quote?.trim().replace(/^[“"]+|[”"]+$/g, '')
  if (!text) return null

  const words = text.split(/\s+/)
  const last = words.length - 1
  // The credit follows once the last word has landed.
  const creditDelay = WORDS_START + last * WORD_STEP + WORD_DURATION

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
        <blockquote className={styles.quoteText}>
          <p>
            <span className={styles.srOnly}>“{text}”</span>
            <span aria-hidden="true">
              {words.map((word, index) => (
                <span key={index}>
                  <span
                    className={styles.word}
                    style={
                      {
                        '--word-delay': `${(WORDS_START + index * WORD_STEP).toFixed(2)}s`,
                        '--word-duration': `${WORD_DURATION}s`,
                      } as CSSProperties
                    }
                  >
                    {index === 0 && '“'}
                    {word}
                    {index === last && '”'}
                  </span>
                  {index < last && ' '}
                </span>
              ))}
            </span>
          </p>
        </blockquote>
        {attribution && (
          <figcaption
            className={classNames(styles.quoteCredit, styles.rv)}
            style={{animationDelay: `${creditDelay.toFixed(2)}s`}}
          >
            {attribution}
          </figcaption>
        )}
      </figure>
    </section>
  )
}
