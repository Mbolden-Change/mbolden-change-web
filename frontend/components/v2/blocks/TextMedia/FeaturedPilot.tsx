import classNames from 'classnames'
import {PortableTextBlock} from 'next-sanity'
import type {TextMedia as TextMediaType} from '@/sanity/types'
import Headline from '@/components/atoms/Headline'
import SanityNextImage from '@/components/SanityNextImage'
import PortableTextComponent from '@/components/PortableTextComponent'
import {deriveTextMedia} from './deriveTextMedia'
import TextMediaCtas from './TextMediaCtas'
import styles from './FeaturedPilot.module.scss'

type FeaturedPilotProps = TextMediaType & {
  headingTag?: 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
}

/**
 * Text & Media "Featured pilot" appearance (What we're tackling): a white band
 * with the heading beside the story and a small angled image. Media is optional,
 * and buttons without a link stay hidden until one is added.
 */
export default function FeaturedPilot({
  headline,
  eyebrow,
  subtitle,
  sectionId,
  textBody,
  ctas,
  accent = 'teal',
  headingTag = 'h2',
  ...rest
}: FeaturedPilotProps) {
  const derived = deriveTextMedia({headline, textBody, ctas, ...rest})
  const linkedCtas = ctas?.filter((cta) => cta.link?.trim()) ?? []

  return (
    <section
      id={sectionId || undefined}
      className={classNames(styles.wrapper, styles[accent])}
      aria-label={headline}
    >
      <div className={styles.band}>
        <div className={classNames(styles.inner, !derived.hasMedia && styles.noMedia)}>
          <header className={styles.header}>
            {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
            <Headline tag={headingTag} text={headline} className={styles.headline} />
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          </header>

          {derived.hasMedia && (
            <div className={styles.media}>
              {derived.showVideo && derived.videoEmbed && (
                <div
                  className={classNames(
                    styles.videoFrame,
                    derived.videoEmbed.isShort && styles.videoFrameShort,
                  )}
                >
                  <iframe
                    src={derived.videoEmbed.embedUrl}
                    title={derived.iframeTitle}
                    loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              )}
              {derived.showImage && derived.image && (
                <div className={styles.imageFrame}>
                  <div className={styles.imageInner}>
                    <SanityNextImage
                      image={derived.image}
                      fit="cover"
                      className={styles.image}
                      sizes="(min-width: 768px) 26rem, 90vw"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          <div className={styles.story}>
            <PortableTextComponent value={textBody as PortableTextBlock[]} />
            {linkedCtas.length > 0 && (
              <div className={styles.ctas}>
                <TextMediaCtas ctas={linkedCtas} variant="featured" />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
