'use client'

import { useState } from 'react'
import classNames from 'classnames'
import { HOUSEHOLDS, getCashBenefitTotal, getExpenseTotal, formatMoney } from '@/lib/simulator/model'
import HouseholdBuilder from './HouseholdBuilder'
import { Eyebrow, Icon, RiseWords, StabilityBar, stabilityBand } from './ui'
import styles from './Simulator.module.scss'

/** Teal title band used by the household list, region step and household intro. */
export function TealBand({ eyebrow, title, children, as: Tag = 'h1' }) {
  return (
    <section className={styles.tealBand}>
      <div className={styles.wrap}>
        {eyebrow && <Eyebrow dash="yellow" className={styles.blackText}>{eyebrow}</Eyebrow>}
        <Tag className={styles.bandTitle}>{typeof title === 'string' ? <RiseWords text={title} /> : title}</Tag>
        {children}
      </div>
    </section>
  )
}

function HouseholdCard({ hh, onSelect, index }) {
  // ---- BEGIN VERBATIM reference lines 9943-9944 ----
              const bt = getCashBenefitTotal(hh.benefits);
              const et = getExpenseTotal(hh.expenses);
  // ---- END VERBATIM ----
  const [name, role] = hh.name.split(' — ')
  const band = stabilityBand(hh.baselineQuality)
  return (
    <button type="button" onClick={() => onSelect(hh)} className={classNames(styles.hhCard, styles.stagger)} style={{ '--i': index }} data-sim="household-card">
      <span className={styles.hhCardHead}>
        <span className={styles.hhName}>
          {name}
          {role && (
            <>
              <span className={styles.srOnly}> — </span>
              <span className={styles.hhRole}>{role}</span>
            </>
          )}
        </span>
        <Icon name="arrowRight" />
      </span>
      <span className={styles.hhDesc}>{hh.description}</span>
      {hh.mixedStatus && <span className={styles.tagFuchsia}>Mixed immigration status — ITIN filers</span>}
      <span className={styles.hhNums}>
        <span>
          <span className={styles.numKey}>Income</span>
          <span className={styles.numVal}>{formatMoney(hh.monthlyIncome)}/mo</span>
        </span>
        <span>
          <span className={styles.numKey}>Support</span>
          <span className={styles.numVal}>{formatMoney(bt)}/mo</span>
        </span>
        <span>
          <span className={styles.numKey}>Expenses</span>
          <span className={styles.numVal}>{formatMoney(et)}/mo</span>
        </span>
      </span>
      <span className={styles.hhStab}>
        <span className={styles.hhStabHead}>
          <span>Stability: {hh.baselineQuality}%</span>
          <span className={styles.hhBand}>{band.label}</span>
        </span>
        <StabilityBar score={hh.baselineQuality} className={styles.fillIn} />
      </span>
    </button>
  )
}

export default function HouseholdSelect({ onSelect, showBuilder }) {
  const [building, setBuilding] = useState(false)

  if (building) {
    return <HouseholdBuilder onComplete={onSelect} onCancel={() => setBuilding(false)} />
  }

  return (
    <>
      <TealBand eyebrow="SELECT A HOUSEHOLD" title="Choose a household">
        <p className={styles.bandLead}>Each household depends on different programs. Your experience will vary.</p>
      </TealBand>
      <section className={styles.cream}>
        <h2 className={styles.srOnly}>Households</h2>
        <div className={classNames(styles.wrap, styles.hhGrid)}>
          {HOUSEHOLDS.map((hh, i) => (
            <HouseholdCard key={hh.id} hh={hh} onSelect={onSelect} index={i} />
          ))}
          {showBuilder && (
            <button type="button" onClick={() => setBuilding(true)} className={classNames(styles.buildCard, styles.stagger)} style={{ '--i': HOUSEHOLDS.length }}>
              <span className={styles.buildTitle}>
                Build Your Own Household
                <span className={styles.beta}>BETA</span>
              </span>
              <span className={styles.hhDesc}>
                Customize income, family size, and immigration status to explore how the safety net works for different
                families.
              </span>
              <Icon name="arrowRight" />
            </button>
          )}
        </div>
      </section>
    </>
  )
}
