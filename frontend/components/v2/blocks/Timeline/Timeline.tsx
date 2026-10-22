'use client'

import {useEffect, useRef, useState, type CSSProperties} from 'react'
import classNames from 'classnames'
import type {Timeline as TimelineType} from '@/sanity/types'
import {LinkAtom} from '@/components/atoms/Link'
import {getReferenceWithSlug, isRenderableInternalOrExternalLink} from '@/utils/internalOrExternalLink'
import {useScrollReveal} from '../../motion/useScrollReveal'
import styles from './Timeline.module.scss'

export type TimelineProps = TimelineType

// Marker colors follow the line's gradient: teal, then yellow, then fuchsia.
function markerColor(index: number, count: number) {
  const position = count > 1 ? index / (count - 1) : 0
  if (position < 1 / 3) return 'var(--brand-aqua-teal)'
  if (position < 2 / 3) return 'var(--brand-warm-yellow)'
  return 'var(--brand-fuchsia)'
}

/**
 * Milestones on a vertical line that fills as you scroll; each milestone
 * rises in as it's reached. The page renders it complete, and it stays
 * complete with reduced motion.
 */
export default function Timeline({eyebrow, heading, milestones, cta}: TimelineProps) {
  const {ref, phase} = useScrollReveal<HTMLElement>(0.1)
  const listRef = useRef<HTMLDivElement>(null)
  const [moving, setMoving] = useState(false)
  const [progress, setProgress] = useState(1)
  const [reached, setReached] = useState<Set<number>>(new Set())
  const items = milestones ?? []

  useEffect(() => {
    const list = listRef.current
    if (!list || typeof IntersectionObserver === 'undefined') return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    setMoving(true)

    let frame = 0
    const update = () => {
      frame = 0
      const rect = list.getBoundingClientRect()
      const value = (window.innerHeight * 0.7 - rect.top) / rect.height
      setProgress(Math.max(0, Math.min(1, value)))
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, {passive: true})
    window.addEventListener('resize', onScroll)

    // A milestone is reached once it's above the bottom quarter of the screen.
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          const index = Number((entry.target as HTMLElement).dataset.index)
          setReached((prev) => new Set(prev).add(index))
          observer.unobserve(entry.target)
        })
      },
      {rootMargin: '0px 0px -25% 0px'},
    )
    list.querySelectorAll('[data-index]').forEach((item) => observer.observe(item))

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frame) cancelAnimationFrame(frame)
      observer.disconnect()
    }
  }, [items.length])

  if (!heading || !items.length) return null

  return (
    <section
      ref={ref}
      className={classNames(
        styles.wrapper,
        moving && styles.moving,
        phase === 'armed' && styles.armed,
        phase === 'in' && styles.in,
      )}
      aria-label={heading}
    >
      <div className={styles.inner}>
        <div className={styles.head}>
          {eyebrow && <p className={classNames(styles.eyebrow, styles.rv)}>{eyebrow}</p>}
          <h2 className={classNames(styles.heading, styles.rv, styles.d1)}>{heading}</h2>
        </div>

        <div ref={listRef} className={styles.list}>
          <div className={styles.track} aria-hidden="true">
            <div className={styles.fill} style={{height: `${((moving ? progress : 1) * 100).toFixed(1)}%`}} />
          </div>
          <ol className={styles.items}>
            {items.map((item, index) => (
              <li
                key={item._key}
                data-index={index}
                className={classNames(styles.item, (!moving || reached.has(index)) && styles.reached)}
                style={{'--marker': markerColor(index, items.length)} as CSSProperties}
              >
                <span className={styles.marker} aria-hidden="true" />
                <p className={styles.year}>{item.year}</p>
                <div className={styles.copy}>
                  <h3 className={styles.title}>{item.title}</h3>
                  <p className={styles.text}>{item.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        {isRenderableInternalOrExternalLink(cta) && cta && (
          <LinkAtom
            anchor={cta.anchor}
            className={classNames(styles.cta, styles.rv)}
            title={cta.title}
            isExternalLink={cta.isExternalLink}
            url={cta.url}
            target={cta.target}
            reference={getReferenceWithSlug(cta)}
          />
        )}
      </div>
    </section>
  )
}
