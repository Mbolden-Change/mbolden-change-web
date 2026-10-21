import {PortableText} from '@portabletext/react'
import type {PortableTextBlock} from 'sanity'
import type {PillarCard as PillarCardType} from '@/sanity/types'
import {urlFor} from '@/sanity/lib/image'
import Headline from '@/components/atoms/Headline'
import styles from './PillarsCompact.module.scss'

export type PillarsCompactProps = {
  title?: string
  eyebrow?: string
  description?: PortableTextBlock[]
  pillars?: PillarCardType[]
}

/**
 * Pillars "Compact row" layout (What we're tackling): the same Pillar Cards as
 * the homepage, side by side on cream with black-and-white images. No tabs and
 * no scroll animation.
 */
export default function PillarsCompact({
  title,
  eyebrow,
  description,
  pillars,
}: PillarsCompactProps) {
  if (!pillars?.length) return null

  return (
    <section className={styles.wrapper} aria-label={title || 'How we work'}>
      <div className={styles.inner}>
        {(eyebrow || title || description) && (
          <div className={styles.header}>
            {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
            {title && <Headline tag="h2" text={title} className={styles.title} />}
            {description && (
              <div className={styles.description}>
                <PortableText value={description} />
              </div>
            )}
          </div>
        )}

        <ul className={styles.list}>
          {pillars.map((pillar) => (
            <li key={pillar._id} className={styles.item}>
              {pillar.image?.asset && (
                <div className={styles.imageFrame}>
                  <img
                    src={urlFor(pillar.image).width(720).height(480).fit('crop').auto('format').url()}
                    alt={pillar.image.alt || ''}
                    width={720}
                    height={480}
                    loading="lazy"
                    className={styles.image}
                  />
                </div>
              )}
              {pillar.headline && (
                <Headline tag="h3" text={pillar.headline} className={styles.headline} />
              )}
              {pillar.description && (
                <div className={styles.body}>
                  <PortableText value={pillar.description} />
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
