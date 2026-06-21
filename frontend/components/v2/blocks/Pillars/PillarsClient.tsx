'use client'

import {useRef, type CSSProperties} from 'react'
import {gsap} from 'gsap'
import {ScrollTrigger} from 'gsap/ScrollTrigger'
import {useGSAP} from '@gsap/react'
import {PortableText} from '@portabletext/react'
import type {PortableTextBlock} from 'sanity'
import type {PillarCard as PillarCardType} from '@/sanity/types'
import {urlFor} from '@/sanity/lib/image'
import Headline from '@/components/atoms/Headline'
import styles from './Pillars.module.scss'

gsap.registerPlugin(ScrollTrigger, useGSAP)

const DESKTOP_BREAKPOINT = '(min-width: 768px)'
const MOBILE_BREAKPOINT = '(max-width: 767px)'

const PILLAR_ACCENTS = [
  'var(--brand-fuchsia)',
  'var(--brand-aqua-teal)',
  'var(--brand-warm-yellow)',
] as const

export type PillarsClientProps = {
  title?: string
  eyebrow?: string
  description?: PortableTextBlock[]
  pillars?: PillarCardType[]
}

function wireRowScroll(
  row: HTMLElement,
  inViewClass: string,
  mode: 'mobile' | 'desktop',
) {
  const indexEl = row.querySelector('[data-pillar-index]')
  const accentEl = row.querySelector('[data-pillar-accent]')
  const mediaEl = row.querySelector('[data-pillar-media]')
  const copyEl = row.querySelector('[data-pillar-copy]')
  if (!indexEl || !mediaEl || !copyEl) return

  const isDesktop = mode === 'desktop'
  const slideFrom = row.dataset.reverse === 'true' ? 56 : -56

  gsap.set(indexEl, {opacity: isDesktop ? 0.15 : 0.25, y: isDesktop ? 20 : 14})
  gsap.set(
    mediaEl,
    isDesktop
      ? {opacity: 0, x: slideFrom, y: 0, scale: 1.06}
      : {opacity: 0, x: 0, y: 22, scale: 1},
  )
  gsap.set(copyEl, {opacity: 0, y: isDesktop ? 36 : 20})
  if (accentEl && isDesktop) gsap.set(accentEl, {scaleY: 0})

  gsap
    .timeline({
      scrollTrigger: {
        trigger: row,
        start: isDesktop ? 'top 82%' : 'top 88%',
        end: isDesktop ? 'top 38%' : 'top 52%',
        scrub: isDesktop ? 0.65 : 0.35,
      },
    })
    .to(indexEl, {opacity: 1, y: 0, ease: 'none'}, 0)
    .to(
      mediaEl,
      isDesktop
        ? {opacity: 1, x: 0, scale: 1, ease: 'none'}
        : {opacity: 1, y: 0, ease: 'none'},
      0,
    )
    .to(copyEl, {opacity: 1, y: 0, ease: 'none'}, isDesktop ? 0.2 : 0.12)

  if (accentEl && isDesktop) {
    gsap.to(accentEl, {
      scaleY: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: row,
        start: 'top 75%',
        end: 'top 40%',
        scrub: 0.65,
      },
    })
  }

  ScrollTrigger.create({
    trigger: row,
    start: isDesktop ? 'top 52%' : 'top 58%',
    end: isDesktop ? 'bottom 48%' : 'bottom 42%',
    onEnter: () => row.classList.add(inViewClass),
    onLeave: () => row.classList.remove(inViewClass),
    onEnterBack: () => row.classList.add(inViewClass),
    onLeaveBack: () => row.classList.remove(inViewClass),
  })
}

export default function PillarsClient({
  title,
  eyebrow,
  description,
  pillars,
}: PillarsClientProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const progressFillRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const section = sectionRef.current
      const header = headerRef.current
      const track = trackRef.current
      const progressFill = progressFillRef.current
      if (!section || !track || !pillars?.length) return

      const reduced = window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches
      if (reduced) return

      const mm = gsap.matchMedia()

      mm.add(MOBILE_BREAKPOINT, () => {
        if (header) {
          gsap.from(header, {
            opacity: 0,
            y: 16,
            duration: 0.65,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: header,
              start: 'top 92%',
              toggleActions: 'play none none reverse',
            },
          })
        }

        track.querySelectorAll<HTMLElement>('[data-pillar-row]').forEach((row) => {
          wireRowScroll(row, styles.inView, 'mobile')
        })
      })

      mm.add(DESKTOP_BREAKPOINT, () => {
        if (header) {
          gsap.from(header, {
            opacity: 0,
            y: 28,
            duration: 0.9,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: header,
              start: 'top 88%',
              toggleActions: 'play none none reverse',
            },
          })
        }

        track.querySelectorAll<HTMLElement>('[data-pillar-row]').forEach((row) => {
          wireRowScroll(row, styles.inView, 'desktop')
        })

        if (progressFill) {
          gsap.set(progressFill, {scaleY: 0, transformOrigin: 'top center'})
          gsap.to(progressFill, {
            scaleY: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: track,
              start: 'top 65%',
              end: 'bottom 35%',
              scrub: true,
            },
          })
        }
      })

      return () => mm.revert()
    },
    {scope: sectionRef, dependencies: [pillars?.length]},
  )

  if (!pillars?.length) return null

  return (
    <section ref={sectionRef} className={styles.wrapper} aria-label="Pillars">
      {(eyebrow || title || description) && (
        <div ref={headerRef} className={styles.header}>
          {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
          {title && <Headline tag="h2" text={title} className={styles.title} />}
          {description && (
            <div className={styles.description}>
              <PortableText value={description} />
            </div>
          )}
        </div>
      )}

      <div ref={trackRef} className={styles.track}>
        <div className={styles.progressRail} aria-hidden="true">
          <div ref={progressFillRef} className={styles.progressFill} />
        </div>

        {pillars.map((pillar, index) => {
          const reverse = index % 2 === 1
          const pillarNumber = String(index + 1).padStart(2, '0')

          return (
            <article
              key={pillar._id}
              className={[styles.row, reverse ? styles.reverse : '']
                .filter(Boolean)
                .join(' ')}
              data-pillar-row
              data-reverse={reverse ? 'true' : 'false'}
              style={
                {
                  '--pillar-accent': PILLAR_ACCENTS[index % PILLAR_ACCENTS.length],
                } as CSSProperties
              }
            >
              <span className={styles.index} data-pillar-index aria-hidden="true">
                {pillarNumber}
              </span>
              <div className={styles.accent} data-pillar-accent aria-hidden="true" />

              <div className={styles.media} data-pillar-media>
                {pillar.image && (
                  <div className={styles.mediaFrame}>
                    <img
                      src={urlFor(pillar.image).url()}
                      alt={
                        pillar.image.alt ||
                        pillar.headline ||
                        'Pillar illustration'
                      }
                      className={styles.image}
                    />
                  </div>
                )}
              </div>

              <div className={styles.copy} data-pillar-copy>
                {pillar.headline && (
                  <Headline
                    tag="h3"
                    text={pillar.headline}
                    className={styles.headline}
                  />
                )}
                {pillar.description && (
                  <div className={styles.body}>
                    <PortableText value={pillar.description} />
                  </div>
                )}
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
