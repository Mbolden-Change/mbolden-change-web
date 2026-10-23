'use client'

import classNames from 'classnames'
import type {CSSProperties} from 'react'
import SkewButton from '@/components/atoms/SkewButton'
import type {PageTeaser as PageTeaserType} from '@/sanity/types'
import {isRenderableInternalOrExternalLink} from '@/utils/internalOrExternalLink'
import {useScrollReveal} from '../motion/useScrollReveal'
import styles from './blocks.module.scss'

/** A short row pointing to another page, such as Ready to Grow at the end of What We're Tackling. */
export default function PageTeaser({eyebrow, heading, text, link, tone}: PageTeaserType) {
  const {ref, phase} = useScrollReveal<HTMLElement>(0.3)
  if (!heading) return null
  const showLink = isRenderableInternalOrExternalLink(link) && link?.title

  return (
    <section
      ref={ref}
      className={classNames(styles.teaser, tone === 'yellow' && styles.teaserYellow, phase === 'armed' && styles.armed, phase === 'in' && styles.in)}
      aria-label={heading}
    >
      <div className={classNames(styles.wrap, styles.teaserGrid)}>
        <div className={styles.head}>
          {eyebrow && (
            <p className={classNames(styles.eyebrow, styles.rv)} style={{'--bar': tone === 'yellow' ? 'var(--brand-black)' : 'var(--brand-aqua-teal)'} as CSSProperties}>
              {eyebrow}
            </p>
          )}
          <h2 className={classNames(styles.teaserTitle, styles.rv, styles.d1)}>{heading}</h2>
          {text && <p className={classNames(styles.text, styles.rv, styles.d2)}>{text}</p>}
        </div>
        {showLink && link && (
          <div className={classNames(styles.rv, styles.d3)}>
            <SkewButton variant="black" link={link} className={styles.button}>
              {link.title} <span aria-hidden="true">→</span>
            </SkewButton>
          </div>
        )}
      </div>
    </section>
  )
}
