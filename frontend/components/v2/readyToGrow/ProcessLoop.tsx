'use client'

import classNames from 'classnames'
import {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import type {AdvancementContact} from '@/lib/getProgramCaseStudy'
import type {ProcessLoop as ProcessLoopType} from '@/sanity/types'
import {mailtoHref} from './lanes'
import {
  buildLoop,
  CHIP_HEIGHT,
  chipPoints,
  clipRanges,
  dashFor,
  DESKTOP_LAYOUT,
  estimateChipWidth,
  LAP_MS,
  latestStage,
  type LoopLayout,
  MOBILE_LAYOUT,
  PROCESS_LOOP_DEFAULTS,
  type ProcessLoopStage,
  resolveStages,
  segmentAt,
  trailCovers,
  trailRanges,
} from './processLoop'
import styles from './ProcessLoop.module.scss'

/** The page query adds the Advancement contact and the Funder Invitation's email subject. */
export type ProcessLoopProps = Partial<ProcessLoopType> & {
  contact?: AdvancementContact
  emailSubject?: string | null
}

const STAGE_CLASSES = [styles.listen, styles.trust, styles.create, styles.implement, styles.learn, styles.share]
const LINE_CLASSES = [styles.lineInk, styles.lineGold, styles.lineBlack, styles.lineTeal, styles.lineFuchsia, styles.lineReturn]

/** What the drawing shows at one moment, apart from the trail itself. */
type Scene = {chips: boolean[]; bolt: boolean; caption: number}

const FINISHED: Scene = {chips: [true, true, true, true, true, true], bolt: true, caption: -1}
const EMPTY: Scene = {chips: [false, false, false, false, false, false], bolt: false, caption: -1}

const sameScene = (a: Scene, b: Scene) =>
  a.bolt === b.bolt && a.caption === b.caption && a.chips.every((on, index) => on === b.chips[index])

type LoopFigureProps = {layout: LoopLayout; stages: ProcessLoopStage[]; className: string}

/**
 * One drawing of the loop with its caption and Pause button. The page renders
 * the finished drawing: the whole line, the bolt filled and every chip. Once
 * hydrated, and unless the visitor prefers reduced motion, the trail travels
 * the loop while the drawing is on screen.
 */
function LoopFigure({layout, stages, className}: LoopFigureProps) {
  const loop = useMemo(() => buildLoop(layout), [layout])
  const rootRef = useRef<HTMLDivElement>(null)
  const lineRefs = useRef<Array<SVGPathElement | null>>([])
  const headRef = useRef<SVGCircleElement>(null)
  const textRefs = useRef<Array<SVGTextElement | null>>([])
  const elapsedRef = useRef(0)
  const sceneRef = useRef<Scene>(FINISHED)

  const [live, setLive] = useState(false)
  const [paused, setPaused] = useState(false)
  const [scene, setScene] = useState<Scene>(FINISHED)
  const [widths, setWidths] = useState<number[]>(() => stages.map((stage) => estimateChipWidth(stage.label)))

  const show = useCallback((next: Scene) => {
    if (sameScene(sceneRef.current, next)) return
    sceneRef.current = next
    setScene(next)
  }, [])

  /** Draws the trail for the time travelled so far. */
  const draw = useCallback(() => {
    const distance = (elapsedRef.current / LAP_MS) * loop.total
    const ranges = trailRanges(distance, loop.total)
    loop.segments.forEach((segment, index) => {
      const path = lineRefs.current[index]
      if (!path) return
      const dash = dashFor(clipRanges(ranges, segment.from, segment.to), loop.total)
      path.style.display = dash ? '' : 'none'
      if (dash) {
        path.setAttribute('stroke-dasharray', dash.array)
        path.setAttribute('stroke-dashoffset', String(dash.offset))
      }
    })
    const head = headRef.current
    if (head) {
      const [x, y] = loop.pointAt(distance)
      head.setAttribute('cx', x.toFixed(2))
      head.setAttribute('cy', y.toFixed(2))
      head.setAttribute('class', classNames(styles.head, LINE_CLASSES[segmentAt(distance, loop)]))
      head.style.display = distance > 0 ? '' : 'none'
    }
    show({
      chips: loop.stagePositions.map((position) => trailCovers(distance, loop.total, position)),
      bolt: trailCovers(distance, loop.total, loop.boltEnd, loop.boltExit),
      caption: latestStage(distance, loop.total, loop.stagePositions),
    })
  }, [loop, show])

  // Motion is on unless the visitor prefers reduced motion.
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined' || !window.matchMedia) return
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const apply = () => setLive(!query.matches)
    apply()
    query.addEventListener?.('change', apply)
    return () => query.removeEventListener?.('change', apply)
  }, [])

  // The trail runs while the drawing is on screen and not paused.
  useEffect(() => {
    const root = rootRef.current
    if (!live || !root) return
    draw()

    let frame = 0
    let last = 0
    let onScreen = false
    const tick = (now: number) => {
      // A long gap (a hidden tab) doesn't jump the trail ahead.
      elapsedRef.current += Math.min(now - last, 100)
      last = now
      draw()
      frame = requestAnimationFrame(tick)
    }
    const sync = () => {
      cancelAnimationFrame(frame)
      frame = 0
      if (!onScreen || paused) return
      last = performance.now()
      frame = requestAnimationFrame(tick)
    }
    const observer = new IntersectionObserver(
      (entries) => {
        onScreen = entries.some((entry) => entry.isIntersecting)
        sync()
      },
      {threshold: 0.15},
    )
    observer.observe(root)

    return () => {
      observer.disconnect()
      cancelAnimationFrame(frame)
    }
  }, [live, paused, draw])

  // Leaving motion (the visitor turned on reduced motion): the finished drawing again.
  useEffect(() => {
    if (live) return
    elapsedRef.current = 0
    loop.segments.forEach((segment, index) => {
      const path = lineRefs.current[index]
      const dash = dashFor([[segment.from, segment.to]], loop.total)
      if (!path || !dash) return
      path.style.display = ''
      path.setAttribute('stroke-dasharray', dash.array)
      path.setAttribute('stroke-dashoffset', String(dash.offset))
    })
    if (headRef.current) headRef.current.style.display = 'none'
    show(FINISHED)
  }, [live, loop, show])

  // Chips are sized to their text once the fonts are in.
  useEffect(() => {
    const measure = () => {
      const measured = textRefs.current.map((text) => {
        try {
          return text?.getComputedTextLength?.() ?? 0
        } catch {
          return 0
        }
      })
      // Nothing to measure while this drawing is hidden (the other screen size).
      if (measured.some((width) => !width)) return
      setWidths((current) => {
        const next = measured.map((width) => Math.ceil(width) + 34)
        return next.every((width, index) => width === current[index]) ? current : next
      })
    }
    measure()
    document.fonts?.ready?.then(measure).catch(() => {})
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [stages])

  const captionStage = scene.caption >= 0 ? stages[scene.caption] : null
  const summary = `Our community-centered design process, a loop in six stages: ${stages.map((stage) => stage.label).join(', then ')}. The line traces a lightning bolt, then returns to the start.`

  return (
    <div ref={rootRef} className={classNames(styles.figure, className, live && styles.live)}>
      <svg
        className={styles.drawing}
        viewBox={`0 0 ${layout.width} ${layout.height}`}
        role="img"
        aria-label={summary}
        focusable="false"
      >
        <polygon
          className={classNames(styles.boltFill, scene.bolt && styles.on)}
          points={layout.bolt.map((point) => point.join(',')).join(' ')}
        />
        {loop.segments.map((segment, index) => {
          const dash = dashFor([[segment.from, segment.to]], loop.total)
          return (
            <path
              key={index}
              ref={(node) => {
                lineRefs.current[index] = node
              }}
              className={classNames(styles.line, LINE_CLASSES[index])}
              d={loop.d}
              strokeDasharray={dash?.array}
              strokeDashoffset={dash?.offset}
              // The trail is drawn outside React, frame by frame.
              suppressHydrationWarning
            />
          )
        })}
        <circle ref={headRef} className={styles.head} r="6" style={{display: 'none'}} />
        {layout.stages.map(({chip}, index) => {
          // The dot sits on the line, at the point nearest the stage's anchor.
          const anchor = loop.pointAt(loop.stagePositions[index])
          return (
            <g key={index} className={classNames(STAGE_CLASSES[index], scene.chips[index] && styles.on)}>
              <line
                className={styles.leader}
                x1={chip[0]}
                y1={chip[1] + CHIP_HEIGHT / 2}
                x2={anchor[0].toFixed(2)}
                y2={anchor[1].toFixed(2)}
              />
              <circle className={styles.anchor} cx={anchor[0].toFixed(2)} cy={anchor[1].toFixed(2)} r="3" />
              <g className={styles.chip}>
                <polygon className={styles.chipShape} points={chipPoints(chip, widths[index])} />
                <text
                  ref={(node) => {
                    textRefs.current[index] = node
                  }}
                  className={styles.chipText}
                  x={chip[0]}
                  y={chip[1] + CHIP_HEIGHT / 2}
                >
                  {stages[index].label}
                </text>
              </g>
            </g>
          )
        })}
      </svg>
      {/* The list below carries the same text for screen readers. */}
      <p className={styles.caption} aria-hidden="true">
        {captionStage && (
          <>
            <strong>{captionStage.label}</strong> — {captionStage.description}
          </>
        )}
      </p>
      {live && (
        <button
          type="button"
          className={styles.toggle}
          onClick={() => setPaused((value) => !value)}
          aria-label={paused ? 'Play the animation' : 'Pause the animation'}
        >
          <span className={paused ? styles.playIcon : styles.pauseIcon} aria-hidden="true" />
          {paused ? 'Play' : 'Pause'}
        </button>
      )}
    </div>
  )
}

/** Cream block with the animated Community-Centered Design Process loop and a link to email the Advancement contact. */
export default function ProcessLoop({heading, stages, linkText, contact, emailSubject}: ProcessLoopProps) {
  const title = heading?.trim() || PROCESS_LOOP_DEFAULTS.heading
  const label = linkText?.trim() || PROCESS_LOOP_DEFAULTS.linkText
  const resolved = useMemo(() => resolveStages(stages), [stages])

  return (
    <section className={styles.section} aria-label={title}>
      <div className={styles.wrap}>
        <h2 className={styles.title}>{title}</h2>
        <LoopFigure layout={DESKTOP_LAYOUT} stages={resolved} className={styles.desktop} />
        <LoopFigure layout={MOBILE_LAYOUT} stages={resolved} className={styles.mobile} />
        <ol className={styles.list}>
          {resolved.map((stage, index) => (
            <li key={index}>
              <strong>{stage.label}</strong> — {stage.description}
            </li>
          ))}
        </ol>
        {contact?.email && (
          <a className={styles.link} href={mailtoHref(contact.email, emailSubject)} data-funder-contact="process_loop">
            {label} <span aria-hidden="true">→</span>
          </a>
        )}
      </div>
    </section>
  )
}
