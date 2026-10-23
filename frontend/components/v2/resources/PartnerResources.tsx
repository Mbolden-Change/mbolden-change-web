'use client'

import classNames from 'classnames'
import type {CSSProperties} from 'react'
import type {PartnerResources as PartnerResourcesType} from '@/sanity/types'
import {useScrollReveal} from '../motion/useScrollReveal'
import styles from './resources.module.scss'

const DELAY = [styles.d1, styles.d2, styles.d3]

/** Partner organizations on teal, each with website and report links. */
export default function PartnerResources({eyebrow, heading, intro, partners}: PartnerResourcesType) {
  const {ref, phase} = useScrollReveal<HTMLElement>(0.15)
  if (!heading) return null

  return (
    <section
      ref={ref}
      className={classNames(styles.partners, phase === 'armed' && styles.armed, phase === 'in' && styles.in)}
      aria-label={heading}
    >
      <div className={classNames(styles.wrap, styles.stack)}>
        <div className={styles.split}>
          <div className={styles.head}>
            {eyebrow && (
              <p className={classNames(styles.eyebrow, styles.rv)} style={{'--bar': 'var(--brand-black)'} as CSSProperties}>
                {eyebrow}
              </p>
            )}
            <h2 className={classNames(styles.h2, styles.rv, styles.d1)}>{heading}</h2>
          </div>
          {intro && <p className={classNames(styles.lead, styles.rv, styles.d2)}>{intro}</p>}
        </div>
        <ul className={styles.cards}>
          {(partners ?? []).map((partner, index) => (
            <li key={partner._key} className={classNames(styles.partnerCard, styles.rv, DELAY[index % 3])}>
              {partner.focus && <span className={styles.ctype}>{partner.focus}</span>}
              <h3 className={styles.ctitle}>{partner.name}</h3>
              {partner.text && <p className={styles.ctext}>{partner.text}</p>}
              <span className={styles.plinks}>
                {partner.websiteUrl && (
                  <a href={partner.websiteUrl} target="_blank" rel="noopener noreferrer">
                    Visit website <span aria-hidden="true">↗</span>
                    <span className={styles.srOnly}> (opens in a new tab)</span>
                  </a>
                )}
                {partner.reportUrl && (
                  <a href={partner.reportUrl} target="_blank" rel="noopener noreferrer">
                    Download report <span aria-hidden="true">↓</span>
                    <span className={styles.srOnly}> (opens in a new tab)</span>
                  </a>
                )}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
