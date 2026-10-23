'use client'

import classNames from 'classnames'
import {LinkAtom} from '@/components/atoms/Link'
import type {ColorBlockHero as ColorBlockHeroType} from '@/sanity/types'
import {getReferenceWithSlug, isRenderableInternalOrExternalLink} from '@/utils/internalOrExternalLink'
import {useScrollReveal} from '../motion/useScrollReveal'
import styles from './blocks.module.scss'

/** Page hero on cream; teal, fuchsia and yellow blocks slide in on the right unless turned off. */
export default function ColorBlockHero({eyebrow, heading, intro, showBlocks = true, backLink}: ColorBlockHeroType) {
  const {ref, phase} = useScrollReveal<HTMLElement>(0.1)
  if (!heading) return null
  const showCrumb = isRenderableInternalOrExternalLink(backLink) && backLink?.title

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
        {showCrumb && backLink && (
          <LinkAtom
            anchor={backLink.anchor}
            isExternalLink={backLink.isExternalLink}
            reference={getReferenceWithSlug(backLink)}
            target={backLink.target}
            url={backLink.url}
            className={classNames(styles.crumb, styles.rv)}
          >
            <span aria-hidden="true">←</span> {backLink.title}
          </LinkAtom>
        )}
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
