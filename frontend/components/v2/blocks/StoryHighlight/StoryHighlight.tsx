'use client'

import classNames from 'classnames'
import type {CSSProperties} from 'react'
import SanityNextImage from '@/components/SanityNextImage'
import {LinkAtom} from '@/components/atoms/Link'
import type {StoryHighlight as StoryHighlightType} from '@/sanity/types'
import {
  getReferenceWithSlug,
  isRenderableInternalOrExternalLink,
} from '@/utils/internalOrExternalLink'
import {useScrollReveal} from '../../motion/useScrollReveal'
import styles from './StoryHighlight.module.scss'

export type StoryHighlightProps = StoryHighlightType

// The quote appears word by word once the section plays.
const WORDS_START = 0.35
const WORD_STEP = 0.07

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
  const {ref, phase} = useScrollReveal<HTMLElement>()

  const hasImage = Boolean(image?.asset?._ref)
  const words = quote?.trim().split(/\s+/) ?? []
  const showCta = isRenderableInternalOrExternalLink(cta)
  const mediaOnRight = mediaPosition === 'right'

  if (!headline) return null

  return (
    <section
      ref={ref}
      className={classNames(
        styles.wrapper,
        mediaOnRight && styles.mediaRight,
        phase === 'armed' && styles.armed,
        phase === 'in' && styles.in,
      )}
      aria-label={headline}
    >
      <div className={styles.inner}>
        <div className={styles.mediaCol}>
          {eyebrow && <p className={classNames(styles.eyebrow, styles.rv)}>{eyebrow}</p>}

          {words.length > 0 && (
            <blockquote className={styles.quote}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/bold-quote-marks/quote-fuchsia.png"
                width={22}
                height={45}
                alt=""
                className={classNames(styles.quoteMark, styles.rv, styles.d1)}
              />
              <p className={styles.quoteText}>
                {words.map((word, index) => (
                  <span key={index}>
                    <span
                      className={styles.word}
                      style={{'--word-delay': `${(WORDS_START + index * WORD_STEP).toFixed(2)}s`} as CSSProperties}
                    >
                      {word}
                    </span>
                    {index < words.length - 1 && ' '}
                  </span>
                ))}
              </p>
              {(quoteAttribution || quoteCredentials) && (
                <footer className={classNames(styles.quoteFooter, styles.rv, styles.d4)}>
                  {quoteAttribution && (
                    <cite className={styles.quoteAttribution}>{quoteAttribution}</cite>
                  )}
                  {quoteCredentials && (
                    <span className={styles.quoteCredentials}>{quoteCredentials}</span>
                  )}
                </footer>
              )}
            </blockquote>
          )}

          {hasImage && image && (
            <div className={classNames(styles.media, styles.rv, styles.d2)}>
              <SanityNextImage
                image={image}
                fit="cover"
                className={styles.image}
                sizes="(min-width: 900px) 560px, 100vw"
              />
            </div>
          )}
        </div>

        <div className={styles.copyCol}>
          <h2 className={classNames(styles.headline, styles.rv, styles.d1)}>{headline}</h2>
          {body && <p className={classNames(styles.body, styles.rv, styles.d2)}>{body}</p>}
          {showCta && cta && (
            <LinkAtom
              anchor={cta.anchor}
              className={classNames(styles.cta, styles.rv, styles.d3)}
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
