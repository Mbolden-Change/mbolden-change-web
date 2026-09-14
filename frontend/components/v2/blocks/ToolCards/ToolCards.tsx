'use client'

import {useRef} from 'react'
import classNames from 'classnames'
import {gsap} from 'gsap'
import {ScrollTrigger} from 'gsap/ScrollTrigger'
import {useGSAP} from '@gsap/react'
import SanityNextImage from '@/components/SanityNextImage'
import styles from './ToolCards.module.scss'

gsap.registerPlugin(ScrollTrigger, useGSAP)

/** Frontend-only props for Storybook / design review. Sanity schema comes later. */
export type ToolCardLink = {
  title: string
  url: string
  isExternalLink?: boolean
  target?: '_self' | '_blank'
}

export type ToolCardItem = {
  _key?: string
  /** Optional short label (e.g. Tool, Interactive, Campaign) */
  label?: string
  title: string
  body: string
  image?: {
    _type: 'image'
    alt?: string
    asset?: {_ref?: string; _type?: string}
  }
  link?: ToolCardLink | null
}

export type ToolCardsProps = {
  eyebrow?: string
  title: string
  description?: string
  cards: ToolCardItem[]
}

function hasRenderableLink(link?: ToolCardLink | null): link is ToolCardLink {
  return Boolean(link?.title && link?.url)
}

function ToolCard({card}: {card: ToolCardItem}) {
  const hasImage = Boolean(card.image?.asset?._ref)
  const link = hasRenderableLink(card.link) ? card.link : null

  return (
    <article
      className={classNames(styles.card, link && styles.cardLinked)}
      data-tool-card
    >
      {hasImage && card.image ? (
        <div className={styles.media}>
          <SanityNextImage
            image={card.image}
            fit="cover"
            className={styles.image}
            sizes="(min-width: 768px) 33vw, 100vw"
          />
        </div>
      ) : (
        <div className={styles.mediaFallback} aria-hidden="true" />
      )}

      {card.label && <p className={styles.label}>{card.label}</p>}
      <h3 className={styles.cardTitle}>{card.title}</h3>
      {card.body && <p className={styles.body}>{card.body}</p>}
      {link && (
        <a
          className={styles.cta}
          href={link.url}
          target={link.isExternalLink ? link.target || '_blank' : undefined}
          rel={link.isExternalLink ? 'noopener noreferrer' : undefined}
        >
          <span className={styles.ctaLabel}>{link.title}</span>
          <span className={styles.ctaArrow} aria-hidden="true">
            →
          </span>
        </a>
      )}
    </article>
  )
}

export default function ToolCards({
  eyebrow,
  title,
  description,
  cards,
}: ToolCardsProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const introRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const section = sectionRef.current
      const intro = introRef.current
      const grid = gridRef.current
      if (!section || !cards?.length) return

      const reduced = window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches
      if (reduced) return

      if (intro) {
        gsap.from(intro, {
          opacity: 0,
          y: 20,
          duration: 0.7,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: intro,
            start: 'top 90%',
            toggleActions: 'play none none reverse',
          },
        })
      }

      const cardEls = grid?.querySelectorAll<HTMLElement>('[data-tool-card]')
      if (cardEls?.length) {
        gsap.from(cardEls, {
          opacity: 0,
          y: 24,
          duration: 0.65,
          ease: 'power2.out',
          stagger: 0.12,
          scrollTrigger: {
            trigger: grid,
            start: 'top 88%',
            toggleActions: 'play none none reverse',
          },
        })
      }
    },
    {scope: sectionRef, dependencies: [cards]},
  )

  if (!title || !cards?.length) return null

  return (
    <section ref={sectionRef} className={styles.wrapper} aria-label={title}>
      <div className={styles.inner}>
        <div ref={introRef} className={styles.intro}>
          {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
          <h2 className={styles.title}>{title}</h2>
          {description && <p className={styles.description}>{description}</p>}
        </div>
        <div ref={gridRef} className={styles.grid}>
          {cards.map((card, index) => (
            <ToolCard key={card._key || index} card={card} />
          ))}
        </div>
      </div>
    </section>
  )
}
