'use client'

import classNames from 'classnames'
import Image from 'next/image'
import Link from 'next/link'
import type {CSSProperties} from 'react'
import SkewButton from '@/components/atoms/SkewButton'
import type {ResolvedPointOfView} from '@/lib/pointOfView'
import {isSitePath} from '@/utils/internalOrExternalLink'
import {useScrollReveal} from '../../motion/useScrollReveal'
import styles from './PointOfView.module.scss'

/** getPage looks up `cards` on Substack; without them (e.g. Storybook) nothing shows. */
export type PointOfViewProps = Partial<ResolvedPointOfView>

// Card colors by position: teal, fuchsia, yellow.
const LANES = ['var(--brand-aqua-teal)', 'var(--brand-fuchsia)', 'var(--brand-warm-yellow)']
const DELAYS = [styles.d1, styles.d2, styles.d3]

/**
 * “We Said What We Said”: up to three Substack posts as cards, each with its
 * cover in black and white, a color bar, the title and subtitle. A post that
 * can be read on this site opens there in the same tab; any other link opens
 * in a new tab. Nothing loads from Substack in the browser.
 */
export default function PointOfView({
  eyebrow,
  heading,
  intro,
  cards = [],
  buttonLabel = 'Read more on Substack',
  buttonUrl = 'https://mboldenchange.substack.com/',
}: PointOfViewProps) {
  const {ref, phase} = useScrollReveal<HTMLElement>(0.15)
  if (!heading) return null
  const buttonOnSite = isSitePath(buttonUrl)

  return (
    <section
      ref={ref}
      className={classNames(styles.wrapper, phase === 'armed' && styles.armed, phase === 'in' && styles.in)}
      aria-label={heading}
    >
      <div className={styles.inner}>
        <div className={styles.head}>
          <div className={styles.titles}>
            {eyebrow && <p className={classNames(styles.eyebrow, styles.rv)}>{eyebrow}</p>}
            <h2 className={classNames(styles.heading, styles.rv, styles.d1)}>{heading}</h2>
          </div>
          {intro && <p className={classNames(styles.intro, styles.rv, styles.d2)}>{intro}</p>}
        </div>

        {cards.length > 0 && (
          <ul className={styles.cards}>
            {cards.slice(0, 3).map((card, index) => (
              <li
                key={card.key}
                className={classNames(styles.item, styles.rv, DELAYS[index])}
                style={{'--lane': LANES[index]} as CSSProperties}
              >
                {(() => {
                  const content = (
                    <>
                      <span className={styles.photo}>
                        {card.image ? (
                          <Image
                            src={card.image.src}
                            alt={card.image.alt}
                            fill
                            sizes="(max-width: 900px) 100vw, 380px"
                            className={styles.img}
                          />
                        ) : (
                          <span className={styles.block} aria-hidden="true" />
                        )}
                      </span>
                      <span className={styles.bar} aria-hidden="true" />
                      <h3 className={styles.title}>{card.title}</h3>
                      {card.summary && <p className={styles.summary}>{card.summary}</p>}
                    </>
                  )
                  // On this site: same tab. Anything else: Substack (or wherever it points) in a new tab.
                  return card.href ? (
                    <Link className={styles.card} href={card.href}>
                      {content}
                      <span className={styles.go}>
                        Read the post <span aria-hidden="true">→</span>
                      </span>
                    </Link>
                  ) : (
                    <a className={styles.card} href={card.url} target="_blank" rel="noopener noreferrer">
                      {content}
                      <span className={styles.go}>
                        Read on Substack <span aria-hidden="true">↗</span>
                        <span className={styles.srOnly}> (opens in a new tab)</span>
                      </span>
                    </a>
                  )
                })()}
              </li>
            ))}
          </ul>
        )}

        {buttonUrl && buttonLabel && (
          <div className={classNames(styles.more, styles.rv, styles.d4)}>
            {buttonOnSite ? (
              // A page on this site, such as /point-of-view: same tab.
              <SkewButton variant="black" href={buttonUrl} className={styles.button}>
                {buttonLabel} <span aria-hidden="true">→</span>
              </SkewButton>
            ) : (
              <SkewButton
                variant="black"
                href={buttonUrl}
                target="_blank"
                className={styles.button}
                ariaLabel={`${buttonLabel} (opens in a new tab)`}
              >
                {buttonLabel} <span aria-hidden="true">↗</span>
              </SkewButton>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
