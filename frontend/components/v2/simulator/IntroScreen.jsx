'use client'

import { useEffect, useState } from 'react'
import classNames from 'classnames'
import { Eyebrow, RiseWords, SimButton, StabilityBar, prefersReducedMotion, stabilityBand } from './ui'
import styles from './Simulator.module.scss'

// Illustration only: a Maria-like household losing support round by round.
// Hidden from assistive tech. At rest (and with reduced motion) it shows the
// third cut; otherwise it drains from 100% in a loop, as in the mockup.
const CUTS = [['SNAP', '−$202/mo'], ['Medicaid', '−$263/mo'], ['Housing', 'Cut']]
const TARGETS = [100, 74, 52, 38, 18]

function useDrainLoop() {
  const [state, setState] = useState({ pct: 38, step: 3 })
  useEffect(() => {
    if (prefersReducedMotion()) return
    let pct = 100
    let i = 0
    let hold = 0
    setState({ pct, step: 0 })
    const timer = setInterval(() => {
      const target = TARGETS[Math.min(i, TARGETS.length - 1)]
      if (pct > target) {
        pct -= 1
        setState((s) => ({ ...s, pct }))
        return
      }
      if (++hold < 16) return
      hold = 0
      i += 1
      if (i >= TARGETS.length) {
        i = 0
        pct = 100
        setState({ pct, step: 0 })
        return
      }
      setState({ pct, step: i })
    }, 45)
    return () => clearInterval(timer)
  }, [])
  return state
}

function DemoMeter() {
  const DEMO = { ...useDrainLoop(), cuts: CUTS }
  const band = stabilityBand(DEMO.pct)
  return (
    <div className={styles.demo} aria-hidden="true" data-sim-ignore>
      <div className={styles.demoHead}>
        <span className={styles.demoLabel}>Household stability</span>
        <span className={styles.demoPct}>{DEMO.pct}%</span>
      </div>
      <StabilityBar score={DEMO.pct} dark />
      <p className={classNames(styles.demoBand, styles[`text_${band.tone}`])}>{band.label}</p>
      <ul className={styles.demoCuts}>
        {DEMO.cuts.map(([name, amt], k) => (
          <li key={name} className={classNames(styles.demoCut, DEMO.step > k && styles.demoCutOn)}>
            <span>{name}</span>
            <span>{amt}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

const SCALE = [
  ['75%+', 'Stable', 'stable'],
  ['50–74%', 'One crisis away', 'crisisAway'],
  ['25–49%', 'Basic needs at risk', 'atRisk'],
  ['Below 25%', 'Crisis', 'crisis'],
]

export default function IntroScreen({ onStart }) {
  return (
    <>
      <section className={styles.introHero}>
        <div className={classNames(styles.wrap, styles.introGrid)}>
          <div>
            <Eyebrow dash="teal" className={styles.yellowText}>A POLICY IMPACT SIMULATION</Eyebrow>
            <h1 className={styles.introTitle}>
              <RiseWords text="The Safety Net" />
              <br />
              <em>
                <RiseWords text="Simulator" start={3} />
              </em>
            </h1>
            <p className={styles.introSub}>An interactive experience about policy choices and real consequences</p>
            <div className={styles.introCta}>
              <SimButton tone="yellow" onClick={onStart}>Begin the simulation</SimButton>
              <span className={styles.introNote} data-sim-ignore>6 to 8 rounds of policy cuts</span>
            </div>
          </div>
          <DemoMeter />
        </div>
      </section>

      <section className={styles.cream}>
        <div className={classNames(styles.wrap, styles.howGrid)}>
          <div className={styles.reading}>
            <p>
              <strong>How it works:</strong> You'll follow a household through a series of federal policy cuts. At each
              stage, you'll face the impossible tradeoffs real families face when benefits are reduced. Every choice has
              consequences.
            </p>
            <p>
              <strong>Household stability</strong> measures a family's ability to meet basic needs — food, housing,
              healthcare, childcare. Each household starts with a stability score based on their income, benefits, and
              expenses. As policy changes take effect, you'll watch that stability erode.
            </p>
          </div>
          <ul className={styles.scale} aria-label="The stability scale">
            {SCALE.map(([range, label, tone]) => (
              <li key={range} className={styles.scaleRow}>
                <span className={classNames(styles.swatch, styles[`tone_${tone}`])} aria-hidden="true" />
                <span className={styles.scaleRange}>{range}</span>
                <span>{label}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className={styles.yellowBand}>
        <div className={styles.wrap}>
          <h2 className={styles.quote}>There are no good options — only less bad ones.</h2>
          <SimButton tone="black" onClick={onStart}>Choose a household</SimButton>
        </div>
      </section>

      <section className={styles.white}>
        <div className={styles.wrap}>
          <p className={styles.fine}>
            This tool is for educational purposes. Household profiles are composites based on published program rules,
            CBO estimates, and public data.
          </p>
        </div>
      </section>
    </>
  )
}
