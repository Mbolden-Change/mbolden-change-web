'use client'

import classNames from 'classnames'
import type {CSSProperties} from 'react'
import type {DonateHero as DonateHeroType} from '@/sanity/types'
import CharityBadge, {type CharityBadgeData} from '@/components/CharityBadge/CharityBadge'
import CandidSeal, {type CandidSealData} from '@/components/CandidSeal/CandidSeal'
import {useScrollReveal} from '../../motion/useScrollReveal'
import ZeffyEmbed from './ZeffyEmbed'
import {zeffyPageUrl} from './zeffy'
import styles from './Donate.module.scss'

/** The page query adds `charityBadge` and `candidSeal` from Site Settings. */
export type DonateHeroProps = DonateHeroType & {
  charityBadge?: CharityBadgeData | null
  candidSeal?: CandidSealData | null
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
  charityBadge,
  candidSeal,
}: DonateHeroProps) {
  const {ref, phase} = useScrollReveal<HTMLElement>(0.1)
  if (!heading) return null
  const pageUrl = zeffyPageUrl(form)
  const hasBadge = showCharityBadge && Boolean(charityBadge?.image?.asset?._ref)
  // On unless switched off, so the seal shows before the block is next saved.
  const hasSeal = showCandidSeal !== false

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
          {(hasBadge || hasSeal || badgeText) && (
            <div className={classNames(styles.badgeRow, styles.rv, styles.d3)}>
              {(hasBadge || hasSeal) && (
                <div className={styles.seals}>
                  {hasBadge && <CharityBadge badge={charityBadge} className={styles.badge} sizes="(max-width: 767px) 56px, 64px" />}
                  {hasSeal && <CandidSeal seal={candidSeal} className={styles.badge} />}
                </div>
              )}
              {badgeText && <p className={styles.badgeText}>{badgeText}</p>}
            </div>
          )}
        </div>
        {pageUrl && (
          <div className={classNames(styles.formCard, styles.rv, styles.d2)}>
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
