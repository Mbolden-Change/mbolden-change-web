import classNames from 'classnames'
import {PortableTextBlock} from 'next-sanity'
import type {TextMedia as TextMediaType} from '@/sanity/types'
import type {PageBuilderBlockLayoutProps} from '@/lib/pageBuilderLayout'
import {
  shouldSectionFlushBottom,
  shouldTextMediaFlushTop,
} from '@/lib/pageBuilderLayout'
import Headline from '@/components/atoms/Headline'
import SanityNextImage from '@/components/SanityNextImage'
import PortableTextComponent from '@/components/PortableTextComponent'
import {deriveTextMedia} from './deriveTextMedia'
import SkewButton from '@/components/atoms/SkewButton'
import styles from './TextMedia.module.scss'

const TextMedia = ({
  headline,
  textBody,
  ctas,
  isLastBlock,
  prevBlockType,
  ...rest
}: TextMediaType & PageBuilderBlockLayoutProps) => {
  const derived = deriveTextMedia({headline, textBody, ctas, ...rest})
  const flushBottom = shouldSectionFlushBottom(isLastBlock)
  const flushTop = shouldTextMediaFlushTop(prevBlockType)

  return (
    <section
      className={classNames(
        styles.wrapper,
        derived.isMediaLeft && styles.mediaLeft,
        derived.mobileMediaFirst ? styles.mobileMediaFirst : styles.mobileTextFirst,
        flushBottom && styles.flushBottom,
        flushTop && styles.flushTop,
      )}
      aria-label={headline}
    >
      <div className={styles.inner}>
        <div className={styles.copy}>
          <Headline tag="h2" text={headline} className={styles.headline} />
          <PortableTextComponent value={textBody as PortableTextBlock[]} />

          {ctas && ctas.length > 0 && (
            <div className={styles.ctas}>
              {(() => {
                let linkIndex = 0
                return ctas.map((cta, index) => {
                  if (!cta.link) {
                    return (
                      <span key={cta._key ?? index} className={styles.infoTag}>
                        {cta.label}
                      </span>
                    )
                  }
                  const isSecondary = linkIndex > 0
                  linkIndex += 1
                  if (isSecondary) {
                    return (
                      <a
                        key={cta._key ?? index}
                        href={cta.link}
                        className={styles.ctaSecondary}
                      >
                        {cta.label}
                      </a>
                    )
                  }
                  return (
                    <SkewButton
                      key={cta._key ?? index}
                      variant="black"
                      href={cta.link}
                      className={styles.ctaPrimary}
                    >
                      {cta.label}
                    </SkewButton>
                  )
                })
              })()}
            </div>
          )}
        </div>

        {derived.hasMedia && (
          <div className={styles.media}>
            {derived.showVideo && derived.videoEmbed && (
              <div
                className={classNames(
                  styles.mediaFrame,
                  derived.videoEmbed.isShort && styles.mediaFrameShort,
                )}
              >
                <iframe
                  src={derived.videoEmbed.embedUrl}
                  title={derived.iframeTitle}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}
            {derived.showImage && derived.image && (
              <div className={styles.mediaFrame}>
                <div className={styles.imageInner}>
                  <SanityNextImage
                    image={derived.image}
                    fit="cover"
                    className={styles.image}
                    sizes="(min-width: 768px) 50vw, 100vw"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}

export default TextMedia
