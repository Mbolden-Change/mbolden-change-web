'use client'

import classNames from 'classnames'
import {useState, type CSSProperties} from 'react'
import SkewButton from '@/components/atoms/SkewButton'
import ActionNetworkModal from '@/components/blocks/ActionNetworkModal/ActionNetworkModal'
import type {MediaContact as MediaContactType} from '@/sanity/types'
import {useScrollReveal} from '../motion/useScrollReveal'
import {splitEmails} from './newsFormat'
import styles from './news.module.scss'

/** Media contact on teal: a heading, a line with the email address and a newsletter button. */
export default function MediaContact({eyebrow, heading, text, newsletterLabel}: MediaContactType) {
  const {ref, phase} = useScrollReveal<HTMLElement>(0.2)
  const [newsletterOpen, setNewsletterOpen] = useState(false)
  if (!heading) return null

  return (
    <section
      ref={ref}
      className={classNames(styles.media, phase === 'armed' && styles.armed, phase === 'in' && styles.in)}
      aria-label={heading}
    >
      <div className={classNames(styles.wrap, styles.mediaGrid)}>
        <div className={styles.head}>
          {eyebrow && (
            <p className={classNames(styles.eyebrow, styles.rv)} style={{'--bar': 'var(--brand-black)'} as CSSProperties}>
              {eyebrow}
            </p>
          )}
          <h2 className={classNames(styles.mediaTitle, styles.rv, styles.d1)}>{heading}</h2>
        </div>
        <div className={classNames(styles.mediaBody, styles.rv, styles.d2)}>
          {text && (
            <p>
              {splitEmails(text).map((part, i) =>
                part.email ? (
                  <a key={i} href={`mailto:${part.text}`}>
                    {part.text}
                  </a>
                ) : (
                  part.text
                ),
              )}
            </p>
          )}
          {newsletterLabel && (
            <SkewButton variant="black" className={styles.button} onClick={() => setNewsletterOpen(true)}>
              {newsletterLabel}
            </SkewButton>
          )}
        </div>
      </div>
      <ActionNetworkModal isOpen={newsletterOpen} onClose={() => setNewsletterOpen(false)} location="news-media" />
    </section>
  )
}
