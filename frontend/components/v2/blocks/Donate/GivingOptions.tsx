'use client'

import classNames from 'classnames'
import {useEffect, type CSSProperties, type ReactNode} from 'react'
import type {GivingOptions as GivingOptionsType} from '@/sanity/types'
import {mailtoHref} from '@/components/v2/readyToGrow/lanes'
import {useScrollReveal} from '../../motion/useScrollReveal'
import styles from './Donate.module.scss'

const STAGGER = [styles.d1, styles.d2, styles.d3, styles.d4]
/** The section's anchor: /donate#other-ways-to-give, also used in emails. */
export const OTHER_WAYS_ID = 'other-ways-to-give'

const EMAIL = /([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})/

/** Text with each email address as an email link. */
export function withEmailLinks(text: string, subject?: string | null): ReactNode[] {
  return text.split(EMAIL).map((part, index) =>
    index % 2 === 1 ? (
      <a key={index} href={mailtoHref(part, subject)}>
        {part}
      </a>
    ) : (
      part
    ),
  )
}

/** White cards on teal: by mail, donor-advised fund, employer match, stock. */
export default function GivingOptions({eyebrow, heading, options}: GivingOptionsType) {
  const {ref, phase} = useScrollReveal<HTMLElement>(0.15)

  // On arrival at /donate#other-ways-to-give the donation form above is still
  // loading and growing, which pushes this section away from where the
  // browser first scrolled. Keeps it in place until the page settles or the
  // visitor scrolls, taps or types.
  useEffect(() => {
    const section = ref.current
    if (!section || window.location.hash !== `#${OTHER_WAYS_ID}`) return
    const pin = () => section.scrollIntoView({behavior: 'auto', block: 'start'})
    pin()
    if (typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(pin)
    observer.observe(document.body)
    const events = ['wheel', 'touchstart', 'keydown', 'pointerdown'] as const
    const stop = () => {
      observer.disconnect()
      window.clearTimeout(timer)
      events.forEach((name) => window.removeEventListener(name, stop))
    }
    const timer = window.setTimeout(stop, 6000)
    events.forEach((name) => window.addEventListener(name, stop, {passive: true}))
    return stop
  }, [ref])

  if (!heading) return null

  return (
    <section
      ref={ref}
      id={OTHER_WAYS_ID}
      className={classNames(styles.ways, phase === 'armed' && styles.armed, phase === 'in' && styles.in)}
      aria-label={heading}
    >
      <div className={classNames(styles.wrap, styles.stack)}>
        <div className={styles.head}>
          {eyebrow && (
            <p className={classNames(styles.eyebrow, styles.rv)} style={{'--bar': 'var(--brand-black)'} as CSSProperties}>
              {eyebrow}
            </p>
          )}
          <h2 tabIndex={-1} className={classNames(styles.h2, styles.rv, styles.d1)}>
            {heading}
          </h2>
        </div>
        <ul className={styles.wayGrid}>
          {(options ?? []).map((option, index) =>
            option.title ? (
              <li key={option._key} className={classNames(styles.way, styles.rv, STAGGER[index % STAGGER.length])}>
                <h3 className={styles.wayTitle}>{option.title}</h3>
                {option.text && <p>{withEmailLinks(option.text, option.emailSubject)}</p>}
                {option.detail && <p className={styles.wayDetail}>{option.detail}</p>}
                {option.note && <p>{withEmailLinks(option.note, option.emailSubject)}</p>}
              </li>
            ) : null,
          )}
        </ul>
      </div>
    </section>
  )
}
