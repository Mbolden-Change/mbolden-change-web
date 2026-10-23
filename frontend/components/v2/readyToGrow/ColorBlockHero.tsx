'use client'

import classNames from 'classnames'
import type {ColorBlockHero as ColorBlockHeroType} from '@/sanity/types'
import {useScrollReveal} from '../motion/useScrollReveal'
import styles from './blocks.module.scss'

/** Page hero on cream; teal, fuchsia and yellow blocks slide in on the right unless turned off. */
export default function ColorBlockHero({eyebrow, heading, intro, showBlocks = true}: ColorBlockHeroType) {
  const {ref, phase} = useScrollReveal<HTMLElement>(0.1)
  if (!heading) return null

  return (
    <section
      ref={ref}
      className={classNames(styles.hero, phase === 'armed' && styles.armed, phase === 'in' && styles.in)}
      aria-label={heading}
    >
      {showBlocks !== false && (
        <div className={styles.blocks} aria-hidden="true">
          <b />
          <b />
          <b />
        </div>
      )}
      <div className={classNames(styles.wrap, styles.heroInner)}>
        {eyebrow && (
          <p className={classNames(styles.eyebrow, styles.rv)} style={{'--bar': 'var(--brand-aqua-teal)'} as React.CSSProperties}>
            {eyebrow}
          </p>
        )}
        <h1 className={classNames(styles.heroTitle, styles.rv, styles.d1)}>{heading}</h1>
        {intro && <p className={classNames(styles.heroIntro, styles.rv, styles.d2)}>{intro}</p>}
      </div>
    </section>
  )
}
