'use client'

import {useRef} from 'react'
import classNames from 'classnames'
import {gsap} from 'gsap'
import {ScrollTrigger} from 'gsap/ScrollTrigger'
import {useGSAP} from '@gsap/react'
import SanityNextImage from '@/components/SanityNextImage'
import {LinkAtom} from '@/components/atoms/Link'
import type {ToolCard as ToolCardType, ToolCards as ToolCardsType} from '@/sanity/types'
import {
  getReferenceWithSlug,
  isRenderableInternalOrExternalLink,
} from '@/utils/internalOrExternalLink'
import styles from './ToolCards.module.scss'

gsap.registerPlugin(ScrollTrigger, useGSAP)

export type ToolCardsProps = ToolCardsType

type LinkedToolCard = {_key: string} & ToolCardType

function ToolCard({card}: {card: LinkedToolCard}) {
  const hasImage = Boolean(card.image?.asset?._ref)
  const link = card.link

  return (
    <article className={classNames(styles.card, styles.cardLinked)} data-tool-card>
      {hasImage && card.image && (
        <div className={styles.media}>
          <SanityNextImage
            image={card.image}
            fit="cover"
            className={styles.image}
            sizes="(min-width: 768px) 33vw, 100vw"
          />
        </div>
      )}

      {card.label && <p className={styles.label}>{card.label}</p>}
      <h3 className={styles.cardTitle}>{card.title}</h3>
      {card.body && <p className={styles.body}>{card.body}</p>}
      <LinkAtom
        className={styles.cta}
        title={link.title}
        isExternalLink={link.isExternalLink}
        url={link.url}
        target={link.target}
        reference={getReferenceWithSlug(link)}
      >
        <span className={styles.ctaLabel}>{link.title}</span>
        <span className={styles.ctaArrow} aria-hidden="true">
          →
        </span>
      </LinkAtom>
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

  const linkedCards = (cards ?? []).filter((card) =>
    isRenderableInternalOrExternalLink(card.link),
  )

  useGSAP(
    () => {
      const section = sectionRef.current
      const intro = introRef.current
      const grid = gridRef.current
      if (!section || !linkedCards.length) return

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
    {scope: sectionRef, dependencies: [linkedCards]},
  )

  if (!title || !linkedCards.length) return null

  return (
    <section ref={sectionRef} className={styles.wrapper} aria-label={title}>
      <div className={styles.inner}>
        <div ref={introRef} className={styles.intro}>
          {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
          <h2 className={styles.title}>{title}</h2>
          {description && <p className={styles.description}>{description}</p>}
        </div>
        <div ref={gridRef} className={styles.grid}>
          {linkedCards.map((card, index) => (
            <ToolCard key={card._key || index} card={card} />
          ))}
        </div>
      </div>
    </section>
  )
}
