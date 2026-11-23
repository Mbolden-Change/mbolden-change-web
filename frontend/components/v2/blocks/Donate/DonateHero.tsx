'use client'

import classNames from 'classnames'
import {useEffect, useRef, type CSSProperties, type MouseEvent} from 'react'
import type {DonateHero as DonateHeroType} from '@/sanity/types'
import CharityBadge, {type CharityBadgeData} from '@/components/CharityBadge/CharityBadge'
import CandidSeal, {type CandidSealData} from '@/components/CandidSeal/CandidSeal'
import {gaEvent} from '@/lib/ga'
import {MAIN_FORM_FUND, ZEFFY_FUND_ATTR, listenForZeffy} from '@/lib/zeffyEvents'
import {useScrollReveal} from '../../motion/useScrollReveal'
import ZeffyEmbed from './ZeffyEmbed'
import {OTHER_WAYS_ID} from './GivingOptions'
import {zeffyPageUrl} from './zeffy'
import styles from './Donate.module.scss'

/** The page query adds `charityBadge` and `candidSeal` from Site Settings. */
export type DonateHeroProps = DonateHeroType & {
  charityBadge?: CharityBadgeData | null
  candidSeal?: CandidSealData | null
}

/**
 * Scrolls to the Other Ways to Give section (a jump with reduced motion) and
 * moves focus to its heading. Without the section on the page, the link acts
 * as a plain link.
 */
const scrollToOtherWays = (event: MouseEvent<HTMLAnchorElement>) => {
  const section = document.getElementById(OTHER_WAYS_ID)
  if (!section) return
  event.preventDefault()
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  section.scrollIntoView({behavior: reduce ? 'auto' : 'smooth', block: 'start'})
  section.querySelector<HTMLElement>('h2')?.focus({preventScroll: true})
  // Keeps the address shareable, as a plain link would.
  if (window.location.hash !== `#${OTHER_WAYS_ID}`) window.history.pushState(window.history.state, '', `#${OTHER_WAYS_ID}`)
}

/** Heading and intro on cream, beside the main Zeffy form. */
export default function DonateHero({
  eyebrow,
  heading,
  intro,
  form,
  showCharityBadge,
  showCandidSeal,
  badgeText,
  otherWaysLinkText,
  charityBadge,
  candidSeal,
}: DonateHeroProps) {
  const {ref, phase} = useScrollReveal<HTMLElement>(0.1)
  const formRef = useRef<HTMLDivElement>(null)
  const pageUrl = zeffyPageUrl(form)

  // Google Analytics: the main form is at least half in view, or fills at
  // least half the screen where it's taller than the screen. Once per page view.
  useEffect(() => {
    const card = formRef.current
    if (!card || typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(
      ([entry]) => {
        const screen = entry.rootBounds?.height ?? window.innerHeight
        if (entry.intersectionRatio < 0.5 && entry.intersectionRect.height < screen / 2) return
        gaEvent('donate_form_open', {fund: MAIN_FORM_FUND})
        observer.disconnect()
      },
      {threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1]},
    )
    observer.observe(card)
    return () => observer.disconnect()
  }, [pageUrl])

  // Google Analytics: the payment step and a completed donation, from Zeffy's messages.
  useEffect(() => listenForZeffy(), [])

  if (!heading) return null
  const hasBadge = showCharityBadge && Boolean(charityBadge?.image?.asset?._ref)
  // On unless switched off, so the seal shows before the block is next saved.
  const hasSeal = showCandidSeal !== false
  const linkText = otherWaysLinkText?.trim()

  return (
    <section
      ref={ref}
      className={classNames(styles.hero, phase === 'armed' && styles.armed, phase === 'in' && styles.in)}
      aria-label={heading}
    >
      <div className={classNames(styles.wrap, styles.heroGrid)}>
        <div className={styles.heroCopy}>
          {eyebrow && (
            <p className={classNames(styles.eyebrow, styles.rv)} style={{'--bar': 'var(--brand-aqua-teal)'} as CSSProperties}>
              {eyebrow}
            </p>
          )}
          <h1 className={classNames(styles.heroTitle, styles.rv, styles.d1)}>{heading}</h1>
          {intro && <p className={classNames(styles.heroIntro, styles.rv, styles.d2)}>{intro}</p>}
          {(hasBadge || hasSeal || badgeText || linkText) && (
            <div className={classNames(styles.badgeRow, styles.rv, styles.d3)}>
              {(hasBadge || hasSeal) && (
                <div className={styles.seals}>
                  {hasBadge && <CharityBadge badge={charityBadge} className={styles.badge} sizes="(max-width: 767px) 56px, 64px" />}
                  {hasSeal && <CandidSeal seal={candidSeal} className={styles.badge} />}
                </div>
              )}
              {badgeText && <p className={styles.badgeText}>{badgeText}</p>}
              {linkText && (
                <p className={styles.otherWays}>
                  <a href={`#${OTHER_WAYS_ID}`} onClick={scrollToOtherWays}>
                    {linkText}
                  </a>
                </p>
              )}
            </div>
          )}
        </div>
        {pageUrl && (
          <div
            ref={formRef}
            className={classNames(styles.formCard, styles.rv, styles.d2)}
            {...{[ZEFFY_FUND_ATTR]: MAIN_FORM_FUND}}
          >
            <ZeffyEmbed form={form} />
            <p className={styles.formNote}>
              Secure giving through Zeffy. Form not loading?{' '}
              <a href={pageUrl} target="_blank" rel="noopener noreferrer">
                Give on Zeffy
              </a>
              .
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
