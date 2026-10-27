'use client'

import {useEffect, useRef, type CSSProperties} from 'react'
import classNames from 'classnames'
import type {FundCards as FundCardsType} from '@/sanity/types'
import {trackDonateClick} from '@/lib/analytics'
import {useScrollReveal} from '../../motion/useScrollReveal'
import FundDialog, {type FundDialogHandle} from './FundDialog'
import {laneColor} from './lanes'
import {zeffyPageUrl} from './zeffy'
import styles from './Donate.module.scss'

const STAGGER = [styles.d1, styles.d2, styles.d3]

type Fund = NonNullable<FundCardsType['funds']>[number]

const showable = (funds: FundCardsType['funds']) =>
  (funds ?? []).filter((fund) => fund.title && zeffyPageUrl(fund.form))

/** Funds with a card. Hidden funds open only from their link ID; no value counts as shown. */
const onCards = (funds: Fund[]) => funds.filter((fund) => fund.showOnDonatePage !== false)

/** The fund whose link ID is in the address, such as /donate#gateway-fund. */
const fundForHash = (funds: Fund[]) => {
  const id = window.location.hash.slice(1)
  return id ? funds.find((fund) => fund.linkId === id) : undefined
}

/**
 * A card per shown fund. Each button opens the fund's Zeffy form in a pop-up.
 * An address ending in a fund's link ID, such as /donate#gateway-fund, scrolls
 * here and opens that fund's pop-up, on arrival or from a link on the page.
 * Hidden funds have no card but open the same way from their link ID.
 */
export default function FundCards({eyebrow, heading, funds}: FundCardsType) {
  const {ref, phase} = useScrollReveal<HTMLElement>(0.15)
  const dialogRef = useRef<FundDialogHandle>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    if (!heading) return
    const openFromHash = () => {
      const fund = fundForHash(showable(funds))
      if (!fund) return
      // A hidden fund has no button, so focus returns to the heading.
      const opener = document.getElementById(fund.linkId!)?.querySelector('button') ?? headingRef.current
      if (!opener) return
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ref.current?.scrollIntoView({behavior: reduce ? 'auto' : 'smooth', block: 'start'})
      dialogRef.current?.open({title: fund.title, lane: fund.lane, form: fund.form}, opener)
    }
    openFromHash()
    window.addEventListener('hashchange', openFromHash)
    return () => window.removeEventListener('hashchange', openFromHash)
  }, [heading, funds, ref])

  if (!heading) return null
  const all = showable(funds)
  const cards = onCards(all)

  // Drops the fund's link ID from the address on close, without a new
  // history entry, so Back goes to the previous page, not a re-opened pop-up.
  const clearHash = () => {
    if (!fundForHash(all)) return
    const {pathname, search} = window.location
    window.history.replaceState(window.history.state, '', pathname + search)
  }

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
          <h2 ref={headingRef} tabIndex={-1} className={classNames(styles.h2, styles.rv, styles.d1)}>
            {heading}
          </h2>
        </div>
        <ul className={styles.fundGrid}>
          {cards.map((fund, index) => (
            <li
              key={fund._key}
              id={fund.linkId || undefined}
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
      <FundDialog ref={dialogRef} onClose={clearHash} />
    </section>
  )
}
