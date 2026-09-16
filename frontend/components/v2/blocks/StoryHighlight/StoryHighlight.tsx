'use client'

import {useRef} from 'react'
import classNames from 'classnames'
import {gsap} from 'gsap'
import {ScrollTrigger} from 'gsap/ScrollTrigger'
import {useGSAP} from '@gsap/react'
import SanityNextImage from '@/components/SanityNextImage'
import {LinkAtom} from '@/components/atoms/Link'
import type {StoryHighlight as StoryHighlightType} from '@/sanity/types'
import {
  getReferenceWithSlug,
  isRenderableInternalOrExternalLink,
} from '@/utils/internalOrExternalLink'
import styles from './StoryHighlight.module.scss'

gsap.registerPlugin(ScrollTrigger, useGSAP)

export type StoryHighlightProps = StoryHighlightType

export default function StoryHighlight({
  eyebrow,
  quote,
  quoteAttribution,
  quoteCredentials,
  headline,
  body,
  image,
  cta,
  mediaPosition = 'left',
}: StoryHighlightProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const mediaColRef = useRef<HTMLDivElement>(null)
  const copyColRef = useRef<HTMLDivElement>(null)

  const hasImage = Boolean(image?.asset?._ref)
  const hasQuote = Boolean(quote?.trim())
  const showCta = isRenderableInternalOrExternalLink(cta)
  const mediaOnRight = mediaPosition === 'right'

  useGSAP(
    () => {
      const section = sectionRef.current
      if (!section) return

      const reduced = window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches
      if (reduced) return

      const mediaCol = mediaColRef.current
      const copyCol = copyColRef.current

      if (mediaCol) {
        gsap.from(mediaCol, {
          opacity: 0,
          y: 28,
          duration: 0.75,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        })
      }

      if (copyCol) {
        gsap.from(copyCol, {
          opacity: 0,
          y: 28,
          duration: 0.75,
          delay: 0.12,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        })
      }
    },
    {scope: sectionRef, dependencies: [headline, body, quote, mediaPosition]},
  )

  if (!headline) return null

  return (
    <section
      ref={sectionRef}
      className={classNames(
        styles.wrapper,
        mediaOnRight && styles.mediaRight,
      )}
      aria-label={headline}
    >
      <div className={styles.inner}>
        <div ref={mediaColRef} className={styles.mediaCol}>
          {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}

          {hasQuote && (
            <blockquote className={styles.quote}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/bold-quote-marks/quote-fuchsia.png"
                width={50}
                height={56}
                alt=""
                className={styles.quoteMark}
              />
              <p className={styles.quoteText}>{quote}</p>
              {(quoteAttribution || quoteCredentials) && (
                <footer className={styles.quoteFooter}>
                  {quoteAttribution && (
                    <cite className={styles.quoteAttribution}>
                      {quoteAttribution}
                    </cite>
                  )}
                  {quoteCredentials && (
                    <span className={styles.quoteCredentials}>
                      {quoteCredentials}
                    </span>
                  )}
                </footer>
              )}
            </blockquote>
          )}

          {hasImage && image && (
            <div className={styles.media}>
              <SanityNextImage
                image={image}
                fit="cover"
                className={styles.image}
                sizes="(min-width: 900px) 40vw, 100vw"
              />
            </div>
          )}
        </div>

        <div ref={copyColRef} className={styles.copyCol}>
          <h2 className={styles.headline}>{headline}</h2>
          {body && <p className={styles.body}>{body}</p>}
          {showCta && cta && (
            <LinkAtom
              className={styles.cta}
              title={cta.title}
              isExternalLink={cta.isExternalLink}
              url={cta.url}
              target={cta.target}
              reference={getReferenceWithSlug(cta)}
            />
          )}
        </div>
      </div>
    </section>
  )
}
