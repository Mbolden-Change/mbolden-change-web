'use client'

import {useId, type CSSProperties} from 'react'
import classNames from 'classnames'
import type {BoltSteps as BoltStepsType} from '@/sanity/types'
import {useScrollReveal} from '../../motion/useScrollReveal'
import {Illustration} from './Illustration'
import styles from './BoltStepsCards.module.scss'

const COLORS = {
  teal: 'var(--brand-aqua-teal)',
  yellow: 'var(--brand-warm-yellow)',
  fuchsia: 'var(--brand-fuchsia)',
} as const
const DELAYS = [styles.d1, styles.d2, styles.d3]

/**
 * How we work as three white cards on cream, each with its animated
 * silhouette and a skewed color bar (homepage mockup). The silhouettes play
 * once the section scrolls into view; with reduced motion they hold still.
 */
export default function BoltStepsCards({eyebrow, title, intro, steps}: BoltStepsType) {
  const {ref, phase} = useScrollReveal<HTMLElement>()
  const headingId = useId()

  if (!title || !steps?.length) return null

  return (
    <section
      ref={ref}
      className={classNames(styles.wrapper, phase === 'armed' && styles.armed, phase === 'in' && styles.in)}
      aria-labelledby={headingId}
    >
      <div className={styles.inner}>
        <div className={styles.head}>
          {eyebrow && <p className={classNames(styles.eyebrow, styles.rv)}>{eyebrow}</p>}
          <h2 id={headingId} className={classNames(styles.title, styles.rv, styles.d1)}>
            {title}
          </h2>
          {intro && <p className={classNames(styles.intro, styles.rv, styles.d2)}>{intro}</p>}
        </div>
        <div className={styles.grid}>
          {steps.map((step, index) => (
            <div
              key={step._key}
              className={classNames(styles.card, styles.rv, DELAYS[index % DELAYS.length])}
              style={{'--step': COLORS[step.color] ?? COLORS.teal} as CSSProperties}
            >
              <Illustration step={step} classes={styles} />
              <span className={styles.bar} aria-hidden="true" />
              <h3 className={styles.stepTitle}>{step.title}</h3>
              <p className={styles.stepBody}>{step.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
