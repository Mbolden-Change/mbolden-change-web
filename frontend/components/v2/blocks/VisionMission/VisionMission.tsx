'use client'

import classNames from 'classnames'
import type {VisionMission as VisionMissionType} from '@/sanity/types'
import SanityNextImage from '@/components/SanityNextImage'
import SkewButton from '@/components/atoms/SkewButton'
import {LinkAtom} from '@/components/atoms/Link'
import {getReferenceWithSlug, isRenderableInternalOrExternalLink} from '@/utils/internalOrExternalLink'
import {useScrollReveal} from '../../motion/useScrollReveal'
import styles from './VisionMission.module.scss'

export type VisionMissionProps = VisionMissionType

/** Vision in large type, a full-width illustration, then the mission — on black. */
export default function VisionMission({
  visionEyebrow,
  vision,
  image,
  imageLabel,
  imageLink,
  missionEyebrow,
  mission,
  actionEyebrow,
  actionText,
  actionLink,
}: VisionMissionProps) {
  const {ref, phase} = useScrollReveal<HTMLElement>(0.12)
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
          <LinkAtom
            anchor={imageCard.anchor}
            isExternalLink={imageCard.isExternalLink}
            reference={getReferenceWithSlug(imageCard)}
            target={imageCard.target}
            url={imageCard.url}
            className={classNames(styles.card, styles.rv, styles.d2)}
          >
            <span className={styles.figure}>
              <SanityNextImage image={image} className={styles.image} sizes="(min-width: 1200px) 1120px, 100vw" />
              {imageLabel && <span className={styles.cardLabel}>{imageLabel}</span>}
            </span>
            <span className={styles.cardButton}>
              <span>
                {imageCard.title}
                {imageCardNewTab && <span aria-hidden="true"> ↗</span>}
              </span>
            </span>
          </LinkAtom>
        )}
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
