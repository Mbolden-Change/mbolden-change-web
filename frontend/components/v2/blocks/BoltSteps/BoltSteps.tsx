'use client'

import {useEffect, useId, useRef, useState, type CSSProperties} from 'react'
import classNames from 'classnames'
import type {BoltSteps as BoltStepsType, BoltStep} from '@/sanity/types'
import {getDimensionsFromRef, urlFor} from '@/sanity/lib/image'
import styles from './BoltSteps.module.scss'

export type BoltStepsProps = BoltStepsType

const COLORS = {
  teal: 'var(--brand-aqua-teal)',
  yellow: 'var(--brand-warm-yellow)',
  fuchsia: 'var(--brand-fuchsia)',
} as const

// Bolt geometry from the approved mockup (viewBox 0 -60 1200 780): three
// rising segments, each ending in a peak where a spark goes off.
const SEGMENTS = [
  'M 20 330 L 380 150',
  'M 376 146 L 424 240 L 780 60',
  'M 776 56 L 824 150 L 1180 -30',
]
const SPARKS = [
  'M380 112 L380 126 M380 174 L380 188 M342 150 L356 150 M404 150 L418 150 M354 124 L363 133 M397 167 L406 176 M406 124 L397 133 M363 167 L354 176',
  'M780 22 L780 36 M780 84 L780 98 M742 60 L756 60 M804 60 L818 60 M754 34 L763 43 M797 77 L806 86 M806 34 L797 43 M763 77 L754 86',
  'M1180 -70 L1180 -54 M1180 -6 L1180 10 M1140 -30 L1156 -30 M1204 -30 L1220 -30 M1152 -58 L1162 -48 M1198 -12 L1208 -2 M1208 -58 L1198 -48 M1162 -12 L1152 -2',
]
// Phones: the bolt runs down the left edge (viewBox 0 0 44 1000, stretched).
const SEGMENTS_VERTICAL = [
  'M 34 0 L 8 330',
  'M 8 330 L 36 315 L 8 660',
  'M 8 660 L 36 645 L 12 1000',
]
// Ripples, in each illustration's own pixels: from the speaker's mouth and
// from the megaphone.
const WAVES = {
  listen: ['M 299 164 A 45 45 0 0 1 299 216', 'M 328 144 A 80 80 0 0 1 328 236', 'M 356 124 A 115 115 0 0 1 356 256'],
  advocate: ['M 581 25 A 45 45 0 0 1 596 81', 'M 601 -4 A 80 80 0 0 1 628 96', 'M 621 -32 A 115 115 0 0 1 659 111'],
} as const

type Layer = BoltStep['backLayer']

function layerSrc(layer: Layer) {
  return layer?.asset?._ref ? urlFor(layer).width(640).auto('format').url() : undefined
}

function Illustration({step}: {step: BoltStep}) {
  const ref = step.backLayer?.asset?._ref ?? step.frontLayer?.asset?._ref
  const {imageWidth, imageHeight} = ref ? getDimensionsFromRef(ref) : {imageWidth: 900, imageHeight: 812}
  const width = imageWidth || 900
  const height = imageHeight || 812
  const back = layerSrc(step.backLayer)
  const front = layerSrc(step.frontLayer)
  const waves = step.motion === 'listen' || step.motion === 'advocate' ? WAVES[step.motion] : null

  return (
    <div
      className={classNames(styles.fig, styles[step.motion])}
      style={{aspectRatio: `${width} / ${height}`}}
      role="img"
      aria-label={step.alt}
    >
      {step.motion === 'build' ? (
        <div className={styles.sway}>{back && <img className={styles.tree} src={back} alt="" />}</div>
      ) : (
        back && <img className={styles.back} src={back} alt="" />
      )}
      {front && <img className={styles.front} src={front} alt="" />}
      {waves && (
        <svg className={styles.waves} viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
          {waves.map((d) => (
            <path key={d} d={d} />
          ))}
        </svg>
      )}
    </div>
  )
}

/**
 * How we work as three steps along a rising bolt. The page renders the
 * finished state; once hydrated it rewinds and plays once when the section
 * scrolls into view. With reduced motion it stays finished.
 */
export default function BoltSteps({eyebrow, title, intro, steps}: BoltStepsProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const [phase, setPhase] = useState<'static' | 'armed' | 'playing'>('static')
  const headingId = useId()

  useEffect(() => {
    const section = sectionRef.current
    if (!section || typeof IntersectionObserver === 'undefined') return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    setPhase('armed')
    // Play when 30% of the section shows, or when it fills 60% of the screen
    // (the stacked phone layout can be taller than three screens).
    const observer = new IntersectionObserver(
      (entries) => {
        const inView = entries.some(
          (entry) =>
            entry.intersectionRatio >= 0.3 ||
            entry.intersectionRect.height >= window.innerHeight * 0.6,
        )
        if (inView) {
          setPhase('playing')
          observer.disconnect()
        }
      },
      {threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.6, 0.8, 1]},
    )
    observer.observe(section)
    return () => observer.disconnect()
  }, [])

  if (!title || steps?.length !== 3) return null

  const colorVars = Object.fromEntries(
    steps.map((step, index) => [`--step-${index + 1}`, COLORS[step.color] ?? COLORS.teal]),
  ) as CSSProperties

  return (
    <section
      ref={sectionRef}
      className={classNames(
        styles.wrapper,
        phase !== 'static' && styles.motion,
        phase === 'armed' && styles.armed,
      )}
      style={colorVars}
      aria-labelledby={headingId}
    >
      <div className={styles.inner}>
        <div className={styles.stage}>
          <svg className={styles.bolt} viewBox="0 -60 1200 780" aria-hidden="true">
            {SEGMENTS.map((d, index) => (
              <path
                key={d}
                className={classNames(styles.seg, styles[`seg${index + 1}`])}
                pathLength={100}
                d={d}
              />
            ))}
            {SPARKS.map((d, index) => (
              <path key={d} className={classNames(styles.spark, styles[`spark${index + 1}`])} d={d} />
            ))}
          </svg>

          <div className={styles.head}>
            {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
            <h2 id={headingId} className={styles.title}>
              {title}
            </h2>
            {intro && <p className={styles.intro}>{intro}</p>}
          </div>

          <div className={styles.stops}>
            <svg
              className={styles.boltVertical}
              viewBox="0 0 44 1000"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              {SEGMENTS_VERTICAL.map((d, index) => (
                <path
                  key={d}
                  className={classNames(styles.seg, styles[`seg${index + 1}`])}
                  pathLength={100}
                  vectorEffect="non-scaling-stroke"
                  d={d}
                />
              ))}
            </svg>

            {steps.map((step, index) => (
              <div key={step._key} className={classNames(styles.stop, styles[`stop${index + 1}`])}>
                <Illustration step={step} />
                <span className={styles.bar} aria-hidden="true" />
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepBody}>{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
