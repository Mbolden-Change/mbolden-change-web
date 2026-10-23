'use client'

import classNames from 'classnames'
import type {CSSProperties} from 'react'
import type {PartnerResources as PartnerResourcesType} from '@/sanity/types'
import {useScrollReveal} from '../motion/useScrollReveal'
import styles from './resources.module.scss'

const DELAY = [styles.d1, styles.d2, styles.d3]

/** Partner and ally resources on teal, each card with its own links. Two (or four) cards sit side by side. */
export default function PartnerResources({eyebrow, heading, intro, partners}: PartnerResourcesType) {
  const {ref, phase} = useScrollReveal<HTMLElement>(0.15)
  if (!heading) return null
  const count = partners?.length ?? 0

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
                {/* Eyebrows are capitalized, but mBOLDen keeps its own spelling. */}
                {eyebrow.split(/(mBOLDen)/).map((part, i) =>
                  part === 'mBOLDen' ? (
                    <span key={i} className={styles.brandCase}>
                      {part}
                    </span>
                  ) : (
                    part
                  ),
                )}
              </p>
            )}
            <h2 className={classNames(styles.h2, styles.rv, styles.d1)}>{heading}</h2>
          </div>
          {intro && <p className={classNames(styles.lead, styles.rv, styles.d2)}>{intro}</p>}
        </div>
        <ul className={classNames(styles.cards, (count === 2 || count === 4) && styles.cardsTwo)}>
          {(partners ?? []).map((partner, index) => {
            const links = (partner.links ?? []).filter((link) => link.label && link.url)
            return (
              <li key={partner._key} className={classNames(styles.partnerCard, styles.rv, DELAY[index % 3])}>
                {partner.focus && <span className={styles.ctype}>{partner.focus}</span>}
                <h3 className={styles.ctitle}>{partner.name}</h3>
                {partner.text && <p className={styles.ctext}>{partner.text}</p>}
                {partner.note && <p className={styles.cnote}>{partner.note}</p>}
                <span className={styles.plinks}>
                  {links.map((link) => (
                    <a key={link._key} href={link.url} target="_blank" rel="noopener noreferrer">
                      {link.label}
                      <span className={styles.srOnly}> (opens in a new tab)</span>
                    </a>
                  ))}
                  {links.length === 0 && partner.websiteUrl && (
                    <a href={partner.websiteUrl} target="_blank" rel="noopener noreferrer">
                      Visit website <span aria-hidden="true">↗</span>
                      <span className={styles.srOnly}> (opens in a new tab)</span>
                    </a>
                  )}
                  {links.length === 0 && partner.reportUrl && (
                    <a href={partner.reportUrl} target="_blank" rel="noopener noreferrer">
                      Download report <span aria-hidden="true">↓</span>
                      <span className={styles.srOnly}> (opens in a new tab)</span>
                    </a>
                  )}
                </span>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
