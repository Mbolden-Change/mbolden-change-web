'use client'

import classNames from 'classnames'
import type {VisionMission as VisionMissionType} from '@/sanity/types'
import SanityNextImage from '@/components/SanityNextImage'
import SkewButton from '@/components/atoms/SkewButton'
import {LinkAtom} from '@/components/atoms/Link'
import {getReferenceWithSlug, isRenderableInternalOrExternalLink} from '@/utils/internalOrExternalLink'
import {useScrollReveal} from '../../motion/useScrollReveal'
import {preloadJourney} from '../../journey/Journey'
import {JourneyOverlay, useJourney} from '../../journey/JourneyOverlay'
import {JOURNEY_PATH} from '../../journey/journeyPaths'
import {useEffect, useRef} from 'react'
import styles from './VisionMission.module.scss'

export type VisionMissionProps = VisionMissionType

/** Vision in large type, a full-width illustration, then the mission — on black. */
export default function VisionMission({
  visionEyebrow,
  vision,
  image,
  imageLabel,
  imageNote,
  imageLink,
  missionEyebrow,
  mission,
  actionEyebrow,
  actionText,
  actionLink,
}: VisionMissionProps) {
  const {ref, phase} = useScrollReveal<HTMLElement>(0.12)
  const cardRef = useRef<HTMLDivElement>(null)
  const cardLinkRef = useRef<HTMLElement | null>(null)
  const journey = useJourney(cardLinkRef)
  const opensJourney = imageLink?.url === JOURNEY_PATH

  // Start loading the journey's first paintings as the card comes near the screen.
  useEffect(() => {
    const card = cardRef.current
    if (!opensJourney || !card) return
    cardLinkRef.current = card.querySelector('a')
    if (typeof IntersectionObserver === 'undefined') return preloadJourney()
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          preloadJourney()
          observer.disconnect()
        }
      },
      {rootMargin: '600px 0px'},
    )
    observer.observe(card)
    return () => observer.disconnect()
  }, [opensJourney])

  if (!vision && !mission) return null

  const showButton = isRenderableInternalOrExternalLink(actionLink) && actionLink?.title
  const newTab = actionLink?.isExternalLink && actionLink.target === '_blank'
  const imageCard = isRenderableInternalOrExternalLink(imageLink) && imageLink?.title ? imageLink : null
  const imageCardNewTab = imageCard?.isExternalLink && imageCard.target === '_blank'

  return (
    <section
      ref={ref}
      className={classNames(styles.wrapper, phase === 'armed' && styles.armed, phase === 'in' && styles.in)}
      aria-label={visionEyebrow || 'Our Vision'}
    >
      <div className={styles.inner}>
        {vision && (
          <div className={styles.vision}>
            {visionEyebrow && <h2 className={classNames(styles.eyebrow, styles.rv)}>{visionEyebrow}</h2>}
            <p className={classNames(styles.statement, styles.rv, styles.d1)}>{vision}</p>
          </div>
        )}
        {image?.asset?._ref && !imageCard && (
          <figure className={classNames(styles.figure, styles.rv, styles.d2)}>
            <SanityNextImage image={image} className={styles.image} sizes="(min-width: 1200px) 1120px, 100vw" />
          </figure>
        )}
        {image?.asset?._ref && imageCard && (
          // The illustration, its label and the button are one link.
          <div ref={cardRef} className={classNames(styles.rv, styles.d2)}>
          <LinkAtom
            anchor={imageCard.anchor}
            isExternalLink={imageCard.isExternalLink}
            reference={getReferenceWithSlug(imageCard)}
            target={imageCard.target}
            url={imageCard.url}
            className={styles.card}
            onClick={
              opensJourney
                ? (event) => {
                    event.preventDefault()
                    journey.openJourney()
                  }
                : undefined
            }
          >
            <span className={styles.figure}>
              <SanityNextImage image={image} className={styles.image} sizes="(min-width: 1200px) 1120px, 100vw" />
              {(imageLabel || imageNote) && (
                <span className={styles.cardLabel}>
                  {imageLabel}
                  {imageNote && <small>{imageNote}</small>}
                </span>
              )}
            </span>
            <span className={styles.cardButton}>
              <span>
                {imageCard.title}
                <span aria-hidden="true">{imageCardNewTab ? ' ↗' : ' →'}</span>
              </span>
            </span>
          </LinkAtom>
          </div>
        )}
        {opensJourney && <JourneyOverlay open={journey.open} onClose={journey.closeJourney} restoreY={journey.restoreY} />}
        {mission && (
          <div className={classNames(styles.mission, styles.rv, styles.d3)}>
            {missionEyebrow && (
              <h2 className={classNames(styles.eyebrow, styles.missionEyebrow)}>{missionEyebrow}</h2>
            )}
            <p className={classNames(styles.statement, styles.missionText)}>{mission}</p>
          </div>
        )}
        {(actionEyebrow || actionText) && (
          <div className={classNames(styles.mission, styles.action, styles.rv, styles.d4)}>
            {actionEyebrow && (
              <h2 className={classNames(styles.eyebrow, styles.actionEyebrow)}>{actionEyebrow}</h2>
            )}
            <div className={styles.actionBody}>
              {actionText && <p className={classNames(styles.statement, styles.missionText)}>{actionText}</p>}
              {showButton && actionLink && (
                <SkewButton
                  variant="yellow"
                  link={actionLink}
                  className={styles.actionButton}
                  ariaLabel={newTab ? `${actionLink.title} (opens in a new tab)` : undefined}
                >
                  {actionLink.title}
                  {newTab && <span aria-hidden="true"> ↗</span>}
                </SkewButton>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
