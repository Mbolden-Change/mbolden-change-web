'use client'

import classNames from 'classnames'
import type {VisionMission as VisionMissionType} from '@/sanity/types'
import SanityNextImage from '@/components/SanityNextImage'
import {useScrollReveal} from '../../motion/useScrollReveal'
import styles from './VisionMission.module.scss'

export type VisionMissionProps = VisionMissionType

/** Vision in large type, a full-width illustration, then the mission — on black. */
export default function VisionMission({
  visionEyebrow,
  vision,
  image,
  missionEyebrow,
  mission,
}: VisionMissionProps) {
  const {ref, phase} = useScrollReveal<HTMLElement>(0.12)
  if (!vision && !mission) return null

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
        {image?.asset?._ref && (
          <figure className={classNames(styles.figure, styles.rv, styles.d2)}>
            <SanityNextImage image={image} className={styles.image} sizes="(min-width: 1200px) 1120px, 100vw" />
          </figure>
        )}
        {mission && (
          <div className={classNames(styles.mission, styles.rv, styles.d3)}>
            {missionEyebrow && (
              <h2 className={classNames(styles.eyebrow, styles.missionEyebrow)}>{missionEyebrow}</h2>
            )}
            <p className={classNames(styles.statement, styles.missionText)}>{mission}</p>
          </div>
        )}
      </div>
    </section>
  )
}
