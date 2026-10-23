'use client'

import classNames from 'classnames'
import {useId, useState, type CSSProperties} from 'react'
import SkewButton from '@/components/atoms/SkewButton'
import type {FeaturedGuide as FeaturedGuideType} from '@/sanity/types'
import {isRenderableInternalOrExternalLink} from '@/utils/internalOrExternalLink'
import {useScrollReveal} from '../motion/useScrollReveal'
import styles from './resources.module.scss'

/** A featured guide on black, beside a short checklist visitors can tick. */
export default function FeaturedGuide({
  eyebrow,
  heading,
  subtitle,
  text,
  link,
  note,
  previewHeading,
  previewItems,
  previewNote,
}: FeaturedGuideType) {
  const {ref, phase} = useScrollReveal<HTMLElement>(0.15)
  const id = useId()
  const items = previewItems ?? []
  const [checks, setChecks] = useState(() => items.map((item) => Boolean(item.checked)))
  if (!heading) return null

  const done = checks.filter(Boolean).length
  const showButton = isRenderableInternalOrExternalLink(link) && link?.title

  return (
    <section
      ref={ref}
      className={classNames(styles.feature, phase === 'armed' && styles.armed, phase === 'in' && styles.in)}
      aria-label={heading}
    >
      <div className={classNames(styles.wrap, styles.featureGrid)}>
        <div className={styles.featureCopy}>
          {eyebrow && (
            <p className={classNames(styles.eyebrow, styles.rv)} style={{'--bar': 'var(--brand-warm-yellow)'} as CSSProperties}>
              {eyebrow}
            </p>
          )}
          <h2 className={classNames(styles.h2, styles.rv, styles.d1)}>{heading}</h2>
          {subtitle && <p className={classNames(styles.featureSubtitle, styles.rv, styles.d1)}>{subtitle}</p>}
          {text && <p className={classNames(styles.featureText, styles.rv, styles.d2)}>{text}</p>}
          {(showButton || note) && (
            <div className={classNames(styles.featureActions, styles.rv, styles.d3)}>
              {showButton && link && (
                <SkewButton variant="yellow" link={link} className={styles.button}>
                  {link.title}
                </SkewButton>
              )}
              {note && <span className={styles.featureNote}>{note}</span>}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className={classNames(styles.mini, styles.rv, styles.d2)} role="group" aria-labelledby={`${id}-h`}>
            {previewHeading && (
              <p id={`${id}-h`} className={styles.miniHeading}>
                {previewHeading}
              </p>
            )}
            {items.map((item, index) => (
              <label key={item._key} className={styles.miniItem}>
                <input
                  type="checkbox"
                  checked={checks[index] ?? false}
                  onChange={() => setChecks((current) => current.map((on, i) => (i === index ? !on : on)))}
                />
                {item.text}
              </label>
            ))}
            <div className={styles.miniMeter} aria-hidden="true">
              <b style={{width: `${Math.round((done / items.length) * 100)}%`}} />
            </div>
            <span className={styles.miniLabel}>
              {done} of {items.length} here.{previewNote ? ` ${previewNote}` : ''}
            </span>
          </div>
        )}
      </div>
    </section>
  )
}
