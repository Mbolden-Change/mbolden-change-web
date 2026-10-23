'use client'

import {useRef, type CSSProperties} from 'react'
import classNames from 'classnames'
import type {FundCards as FundCardsType} from '@/sanity/types'
import {trackDonateClick} from '@/lib/analytics'
import {useScrollReveal} from '../../motion/useScrollReveal'
import FundDialog, {type FundDialogHandle} from './FundDialog'
import {laneColor} from './lanes'
import {zeffyPageUrl} from './zeffy'
import styles from './Donate.module.scss'

const STAGGER = [styles.d1, styles.d2, styles.d3]

/** A card per fund. Each button opens the fund's Zeffy form in a pop-up. */
export default function FundCards({eyebrow, heading, funds}: FundCardsType) {
  const {ref, phase} = useScrollReveal<HTMLElement>(0.15)
  const dialogRef = useRef<FundDialogHandle>(null)

  if (!heading) return null
  const cards = (funds ?? []).filter((fund) => fund.title && zeffyPageUrl(fund.form))

  return (
    <section
      ref={ref}
      className={classNames(styles.funds, phase === 'armed' && styles.armed, phase === 'in' && styles.in)}
      aria-label={heading}
    >
      <div className={classNames(styles.wrap, styles.stack)}>
        <div className={styles.head}>
          {eyebrow && (
            <p className={classNames(styles.eyebrow, styles.rv)} style={{'--bar': 'var(--brand-fuchsia)'} as CSSProperties}>
              {eyebrow}
            </p>
          )}
          <h2 className={classNames(styles.h2, styles.rv, styles.d1)}>{heading}</h2>
        </div>
        <ul className={styles.fundGrid}>
          {cards.map((fund, index) => (
            <li
              key={fund._key}
              className={classNames(styles.fund, styles.rv, STAGGER[index % STAGGER.length])}
              style={{'--lane': laneColor(fund.lane)} as CSSProperties}
            >
              <span className={styles.fundBar} aria-hidden="true" />
              <div className={styles.fundBody}>
                <h3 className={styles.fundTitle}>{fund.title}</h3>
                {fund.text && <p className={styles.fundText}>{fund.text}</p>}
                <button
                  type="button"
                  className={styles.fundButton}
                  aria-haspopup="dialog"
                  onClick={(event) => {
                    trackDonateClick('fund-cards')
                    dialogRef.current?.open({title: fund.title, lane: fund.lane, form: fund.form}, event.currentTarget)
                  }}
                >
                  {fund.buttonLabel || `Give to ${fund.title}`} <span aria-hidden="true">→</span>
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <FundDialog ref={dialogRef} />
    </section>
  )
}
