'use client'

import classNames from 'classnames'
import Image from 'next/image'
import Link from 'next/link'
import {useEffect, useRef, useState, type CSSProperties} from 'react'
import SkewButton from '@/components/atoms/SkewButton'
import type {PostCard} from '@/lib/substackPosts/posts'
import {useScrollReveal} from '../motion/useScrollReveal'
import styles from './pointOfView.module.scss'

export type PostCardsProps = {
  cards: PostCard[]
  /** Visible heading above the cards; without one the section is named by `label`. */
  heading?: string
  label?: string
  /** How many cards show before “Show more”. Leave out to show them all. */
  initialCount?: number
  buttonLabel?: string
}

// Card colors repeat teal, fuchsia, yellow, as on the homepage.
const LANES = ['var(--brand-aqua-teal)', 'var(--brand-fuchsia)', 'var(--brand-warm-yellow)']
const DELAYS = [styles.d1, styles.d2, styles.d3]

/**
 * Substack posts as cards: cover in black and white, color bar, date, title
 * and a short excerpt. The whole card links to the post on this site.
 */
export default function PostCards({cards, heading, label, initialCount, buttonLabel = 'Show more'}: PostCardsProps) {
  const {ref, phase} = useScrollReveal<HTMLElement>(0.05)
  const step = initialCount && initialCount > 0 ? Math.floor(initialCount) : cards.length
  const [shown, setShown] = useState(step)
  // The first card added by the last “Show more”, which takes focus.
  const [focusIndex, setFocusIndex] = useState<number | null>(null)
  const focusRef = useRef<HTMLAnchorElement>(null)

  useEffect(() => {
    if (focusIndex !== null) focusRef.current?.focus({preventScroll: true})
  }, [focusIndex])

  if (cards.length === 0) return null
  const Title = heading ? 'h3' : 'h2'
  const visible = Math.min(shown, cards.length)

  const showMore = () => {
    setFocusIndex(shown)
    setShown(shown + step)
  }

  return (
    <section
      ref={ref}
      className={classNames(styles.list, phase === 'armed' && styles.armed, phase === 'in' && styles.in)}
      aria-label={heading || label}
    >
      <div className={classNames(styles.wrap, styles.stack)}>
        {heading && <h2 className={classNames(styles.sectionTitle, styles.rv)}>{heading}</h2>}
        <ul className={styles.cards}>
          {cards.map((card, index) => {
            const first = index < step
            return (
              <li
                key={card.slug}
                hidden={index >= shown}
                className={classNames(styles.item, first ? [styles.rv, DELAYS[index % 3]] : styles.fresh)}
                style={{'--lane': LANES[index % LANES.length]} as CSSProperties}
              >
                <Link ref={index === focusIndex ? focusRef : undefined} href={card.href} className={styles.card}>
                  <span className={styles.photo}>
                    {card.image ? (
                      <Image
                        src={card.image.src}
                        alt={card.image.alt}
                        fill
                        sizes="(max-width: 600px) 100vw, (max-width: 900px) 50vw, 380px"
                        className={styles.img}
                      />
                    ) : (
                      <span className={styles.block} aria-hidden="true" />
                    )}
                  </span>
                  <span className={styles.bar} aria-hidden="true" />
                  {card.dateLabel && (
                    <time className={styles.date} dateTime={card.date}>
                      {card.dateLabel}
                    </time>
                  )}
                  <Title className={styles.title}>{card.title}</Title>
                  {card.excerpt && <p className={styles.excerpt}>{card.excerpt}</p>}
                </Link>
              </li>
            )
          })}
        </ul>

        <p className={styles.srOnly} role="status">
          {focusIndex !== null ? `Showing ${visible} of ${cards.length} posts` : ''}
        </p>

        {visible < cards.length && (
          <div className={styles.more}>
            <SkewButton variant="black" className={styles.button} onClick={showMore}>
              {buttonLabel}
            </SkewButton>
          </div>
        )}
      </div>
    </section>
  )
}
