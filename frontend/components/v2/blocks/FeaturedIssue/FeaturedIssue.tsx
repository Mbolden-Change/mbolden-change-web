'use client'

import {useEffect, useState} from 'react'
import classNames from 'classnames'
import {PortableText, type PortableTextBlock} from 'next-sanity'
import type {FeaturedIssue as FeaturedIssueType} from '@/sanity/types'
import {useScrollReveal, type RevealPhase} from '../../motion/useScrollReveal'
import styles from './FeaturedIssue.module.scss'

export type FeaturedIssueProps = FeaturedIssueType

const COUNT_DURATION = 1800

/**
 * The stats count up from 0 (ease-out) once the block plays. The page renders
 * the final numbers, and they stay put with reduced motion.
 */
function useCountUp(phase: RevealPhase) {
  const [progress, setProgress] = useState(1)

  useEffect(() => {
    if (phase === 'armed') {
      setProgress(0)
      return
    }
    if (phase !== 'in') return
    let frame = 0
    const start = performance.now()
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / COUNT_DURATION)
      setProgress(1 - Math.pow(1 - t, 3))
      if (t < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [phase])

  return progress
}

export default function FeaturedIssue({eyebrow, heading, stats, body, color = 'teal'}: FeaturedIssueProps) {
  const {ref, phase} = useScrollReveal<HTMLElement>()
  const progress = useCountUp(phase)

  if (!heading) return null

  return (
    <section
      ref={ref}
      className={classNames(
        styles.wrapper,
        styles[color],
        phase === 'armed' && styles.armed,
        phase === 'in' && styles.in,
      )}
      aria-label={heading}
    >
      <div className={styles.top}>
        <div className={styles.inner}>
          <div className={styles.head}>
            {eyebrow && <p className={classNames(styles.eyebrow, styles.rv)}>{eyebrow}</p>}
            <h2 className={classNames(styles.heading, styles.rv, styles.d1)}>{heading}</h2>
          </div>
          {stats && stats.length > 0 && (
            <dl className={classNames(styles.stats, styles.rv, styles.d2)}>
              {stats.map((stat) => {
                const value = Math.round((stat.number ?? 0) * progress)
                return (
                  <div key={stat._key} className={styles.stat}>
                    <dt className={styles.number}>
                      {/* Screen readers get the final figure, not the count. */}
                      <span aria-hidden="true">
                        {stat.prefix}
                        {value.toLocaleString('en-US')}
                      </span>
                      <span className={styles.srOnly}>
                        {stat.prefix}
                        {(stat.number ?? 0).toLocaleString('en-US')}
                      </span>
                    </dt>
                    <dd className={styles.label}>
                      {stat.label}
                      {stat.source && <span className={styles.source}>{stat.source}</span>}
                    </dd>
                  </div>
                )
              })}
            </dl>
          )}
        </div>
      </div>
      {body && body.length > 0 && (
        <div className={styles.bottom}>
          <div className={styles.inner}>
            <div className={classNames(styles.panel, styles.rv, styles.d3)}>
              <div className={styles.text}>
                <PortableText value={body as PortableTextBlock[]} />
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
