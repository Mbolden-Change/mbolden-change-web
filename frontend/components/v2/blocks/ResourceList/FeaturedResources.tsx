'use client'

import {useEffect, useRef, useState, type CSSProperties} from 'react'
import classNames from 'classnames'
import {LinkAtom} from '@/components/atoms/Link'
import {getPilotImage} from '@/components/v2/blocks/TextMedia/pilotImage'
import type {ResourceList as ResourceListType, ResourceListItem} from '@/sanity/types'
import {
  getReferenceWithSlug,
  isRenderableInternalOrExternalLink,
} from '@/utils/internalOrExternalLink'
import styles from './FeaturedResources.module.scss'

type Item = {_key: string} & ResourceListItem

const LANES = {
  teal: {lane: 'var(--brand-aqua-teal)', contrast: 'var(--brand-black)'},
  yellow: {lane: 'var(--brand-warm-yellow)', contrast: 'var(--brand-black)'},
  fuchsia: {lane: 'var(--brand-fuchsia)', contrast: 'var(--brand-white)'},
} as const

function opensNewTab(link: ResourceListItem['link']) {
  if (!link) return false
  const reference = getReferenceWithSlug(link)
  return reference?._type === 'pdfDocument' || (link.isExternalLink && link.target === '_blank')
}

function Card({item}: {item: Item}) {
  const lane = LANES[item.color ?? 'teal'] ?? LANES.teal
  const cover = getPilotImage(item.cover)
  const link = item.link
  const linked = isRenderableInternalOrExternalLink(link)

  const body = (
    <>
      <div className={styles.cover}>
        {cover ? (
          <img
            src={cover.src}
            srcSet={cover.srcSet}
            sizes="(min-width: 900px) 400px, 100vw"
            alt={cover.alt}
            loading="lazy"
            className={styles.image}
            style={{objectPosition: cover.focus}}
          />
        ) : (
          <div className={styles.gen} aria-hidden="true">
            <svg className={styles.genBolt} viewBox="0 0 400 140" preserveAspectRatio="none">
              <path
                pathLength={100}
                vectorEffect="non-scaling-stroke"
                d="M 0 118 L 150 56 L 174 98 L 300 34 L 324 72 L 400 30"
              />
            </svg>
            <span className={styles.genWord}>{item.label}</span>
          </div>
        )}
      </div>
      <div className={styles.body}>
        <div className={styles.meta}>
          {item.label && <span className={styles.tag}>{item.label}</span>}
          {item.date && <span className={styles.year}>{item.date}</span>}
        </div>
        <h3 className={styles.title}>{item.title}</h3>
        {item.summary && <p className={styles.summary}>{item.summary}</p>}
        {linked && link?.title && (
          <span className={styles.go}>
            {link.title} <span aria-hidden="true">↗</span>
            {opensNewTab(link) && <span className={styles.srOnly}> (opens in a new tab)</span>}
          </span>
        )}
      </div>
    </>
  )

  return (
    <li
      className={classNames(styles.item, item.color === 'yellow' && styles.yellow)}
      style={{'--lane': lane.lane, '--lane-contrast': lane.contrast} as CSSProperties}
    >
      {linked && link ? (
        <LinkAtom
          anchor={link.anchor}
          isExternalLink={link.isExternalLink}
          url={link.url}
          target={link.target}
          reference={getReferenceWithSlug(link)}
          className={styles.card}
        >
          {body}
        </LinkAtom>
      ) : (
        <div className={styles.card}>{body}</div>
      )}
    </li>
  )
}

/**
 * Resource List "Featured row": the three resources marked featured, as
 * cards with a cover (a photo, or an automatic cover in the lane color).
 * The cards rise in one after another when the section scrolls into view;
 * the page renders them in place first, and reduced motion keeps them still.
 */
export default function FeaturedResources({eyebrow, title, description, items, groups}: ResourceListType) {
  const sectionRef = useRef<HTMLElement>(null)
  const [phase, setPhase] = useState<'static' | 'armed' | 'playing'>('static')

  useEffect(() => {
    const section = sectionRef.current
    if (!section || typeof IntersectionObserver === 'undefined') return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    setPhase('armed')
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setPhase('playing')
          observer.disconnect()
        }
      },
      {threshold: 0.2},
    )
    observer.observe(section)
    return () => observer.disconnect()
  }, [])

  const featured = [...(items ?? []), ...(groups ?? []).flatMap((group) => group.items ?? [])]
    .filter((item) => item.featured)
    .slice(0, 3)
  if (!title || !featured.length) return null

  const firstLane = LANES[featured[0].color ?? 'teal'] ?? LANES.teal

  return (
    <section
      ref={sectionRef}
      className={classNames(
        styles.wrapper,
        phase !== 'static' && styles.motion,
        phase === 'armed' && styles.armed,
      )}
      style={{'--first-lane': firstLane.lane} as CSSProperties}
      aria-label={title}
    >
      <div className={styles.inner}>
        <div className={styles.head}>
          {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
          <h2 className={styles.heading}>{title}</h2>
          {description && <p className={styles.intro}>{description}</p>}
        </div>
        <ul className={styles.grid}>
          {featured.map((item) => (
            <Card key={item._key} item={item} />
          ))}
        </ul>
      </div>
    </section>
  )
}
