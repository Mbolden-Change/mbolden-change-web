'use client'

import classNames from 'classnames'
import {PortableText, type PortableTextComponents} from '@portabletext/react'
import type {PortableTextBlock} from '@portabletext/types'
import {memo, useEffect, useMemo, useRef, useState, type CSSProperties} from 'react'
import SanityNextImage from '@/components/SanityNextImage'
import type {Checklist, PullQuote, PunchLine, RequirementCards, SectionHeading, StatBand, ThenNow} from '@/sanity/types'
import {formatStat} from './newsFormat'
import styles from './pages.module.scss'

// Requirement card colors repeat teal, fuchsia, yellow (yellow numbers are black).
const LANES = [
  {lane: 'var(--brand-aqua-teal)', ink: 'var(--brand-aqua-teal)'},
  {lane: 'var(--brand-fuchsia)', ink: 'var(--brand-fuchsia)'},
  {lane: 'var(--brand-warm-yellow)', ink: 'var(--brand-black)'},
]
const COUNT_MS = 1400

/** Paragraphs, lists and marks shared by statements, letters and the rich blocks inside them. */
const textComponents: PortableTextComponents = {
  block: {
    normal: ({children}) => <p>{children}</p>,
  },
  list: {
    bullet: ({children}) => <ul>{children}</ul>,
    number: ({children}) => <ol>{children}</ol>,
  },
  marks: {
    strong: ({children}) => <strong>{children}</strong>,
    em: ({children}) => <em>{children}</em>,
    highlight: ({children}) => <span className={styles.mark}>{children}</span>,
    footnote: ({children, text}) => (
      <sup className={styles.fn}>
        <a href={`#fn${text.trim()}`} aria-label={`Source ${text.trim()}`}>
          {children}
        </a>
      </sup>
    ),
    link: ({children, value}) => {
      const href: string | undefined = value?.href
      const external = Boolean(href && /^https?:/.test(href))
      return (
        <a href={href} target={external ? '_blank' : undefined} rel={external ? 'noopener noreferrer' : undefined}>
          {children}
        </a>
      )
    },
  },
}

export function RichText({value}: {value?: unknown[] | null}) {
  if (!value?.length) return null
  return <PortableText value={value as PortableTextBlock[]} components={textComponents} />
}

/** Section headings get ids s1, s2… in order, for the "On this page" menu. */
export function sectionsOf(text?: unknown[] | null) {
  return (text ?? [])
    .filter((block): block is SectionHeading & {_key: string} => (block as {_type?: string})?._type === 'sectionHeading')
    .map((block, i) => ({key: block._key, id: `s${i + 1}`, label: block.menuLabel?.trim() || block.heading}))
}

function ThenNowBlock({label, tabs}: ThenNow) {
  const [active, setActive] = useState(0)
  const shown = tabs ?? []
  if (shown.length === 0) return null
  const current = shown[Math.min(active, shown.length - 1)]

  return (
    <div className={styles.tn}>
      <div className={styles.tnbar} role="tablist" aria-label={label || undefined}>
        {shown.map((tab, i) => (
          <button
            key={tab._key}
            type="button"
            role="tab"
            className={classNames(i === active && styles.tnOn)}
            aria-selected={i === active}
            onClick={() => setActive(i)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className={styles.tnrows} role="tabpanel" aria-label={current.label}>
        {(current.tiles ?? []).map((tile) => (
          // Keyed by tab, so the values pop in again when the tab changes.
          <div key={`${current._key}-${tile._key}`}>
            {tile.label && <small>{tile.label}</small>}
            <b>{tile.value}</b>
            {tile.text && <span>{tile.text}</span>}
          </div>
        ))}
      </div>
    </div>
  )
}

function RequirementCardsBlock({items}: RequirementCards) {
  if (!items?.length) return null
  return (
    <div className={styles.req}>
      {items.map((item, i) => {
        const lane = LANES[i % LANES.length]
        return (
          <div key={item._key} style={{'--lane': lane.lane, '--ink': lane.ink} as CSSProperties}>
            <em aria-hidden="true">{i + 1}</em>
            <div>
              <h3>
                <span className={styles.srOnly}>{i + 1}. </span>
                {item.title}
              </h3>
              <RichText value={item.body} />
            </div>
          </div>
        )
      })}
    </div>
  )
}

/** Numbers count from their start value when the band scrolls into view; the page renders the final values. */
function StatBandBlock({stats}: StatBand) {
  const ref = useRef<HTMLDivElement>(null)
  const items = stats ?? []
  const [progress, setProgress] = useState(1)

  useEffect(() => {
    const node = ref.current
    if (!node || typeof IntersectionObserver === 'undefined') return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    setProgress(0)
    let frame = 0
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return
        observer.disconnect()
        const start = performance.now()
        const tick = (now: number) => {
          const p = Math.min(1, (now - start) / COUNT_MS)
          setProgress(1 - Math.pow(1 - p, 3))
          if (p < 1) frame = requestAnimationFrame(tick)
        }
        frame = requestAnimationFrame(tick)
      },
      {threshold: 0.4},
    )
    observer.observe(node)
    return () => {
      observer.disconnect()
      cancelAnimationFrame(frame)
    }
  }, [])

  if (items.length === 0) return null
  return (
    <div ref={ref} className={styles.band}>
      <div className={styles.stats}>
        {items.map((stat) => {
          const from = stat.from ?? 0
          const decimals = stat.decimals ?? 0
          const factor = Math.pow(10, decimals)
          const value = progress >= 1 ? stat.value : Math.round((from + (stat.value - from) * progress) * factor) / factor
          return (
            <div key={stat._key} className={styles.stat}>
              <b>{formatStat(value, decimals, stat.prefix ?? '', stat.suffix ?? '')}</b>
              <RichText value={stat.text} />
            </div>
          )
        })}
      </div>
    </div>
  )
}

function ChecklistBlock({items}: Checklist) {
  const [done, setDone] = useState<Record<string, boolean>>({})
  if (!items?.length) return null
  return (
    <div className={styles.acts}>
      {items.map((item) => (
        <label key={item._key}>
          <input
            type="checkbox"
            checked={Boolean(done[item._key])}
            onChange={() => setDone((prev) => ({...prev, [item._key]: !prev[item._key]}))}
          />
          <span>
            {item.lead && <b>{item.lead}</b>} {item.text}
          </span>
        </label>
      ))}
    </div>
  )
}

/** Renderers for a statement's text. Built once per text, so the rich blocks keep their state (and stay mounted) as the page re-renders. */
function statementComponents(sections: ReturnType<typeof sectionsOf>): PortableTextComponents {
  return {
    ...textComponents,
    types: {
      sectionHeading: ({value: block}: {value: SectionHeading & {_key: string}}) => {
        const index = sections.findIndex((s) => s.key === block._key)
        return (
          <h2 id={sections[index]?.id} data-sec={index} className={styles.h2}>
            {block.heading}
          </h2>
        )
      },
      punchLine: ({value: block}: {value: PunchLine}) => <p className={styles.punch}>{block.text}</p>,
      pullQuote: ({value: block}: {value: PullQuote}) => (
        <figure className={styles.pull}>
          <blockquote>{block.quote}</blockquote>
          {block.attribution && <figcaption>{block.attribution}</figcaption>}
        </figure>
      ),
      thenNow: ({value: block}: {value: ThenNow}) => <ThenNowBlock {...block} />,
      requirementCards: ({value: block}: {value: RequirementCards}) => <RequirementCardsBlock {...block} />,
      statBand: ({value: block}: {value: StatBand}) => <StatBandBlock {...block} />,
      checklist: ({value: block}: {value: Checklist}) => <ChecklistBlock {...block} />,
      image: ({value: block}) =>
        block?.asset?._ref ? (
          <div className={styles.image}>
            <SanityNextImage image={block} sizes="(max-width: 900px) 100vw, 720px" />
          </div>
        ) : null,
    },
  }
}

/** A statement's text: paragraphs and lists plus section headings and the rich blocks. */
export const StatementText = memo(function StatementText({value}: {value?: unknown[] | null}) {
  const components = useMemo(() => statementComponents(sectionsOf(value)), [value])
  if (!value?.length) return null
  return <PortableText value={value as PortableTextBlock[]} components={components} />
})
