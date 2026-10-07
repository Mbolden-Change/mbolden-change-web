'use client'

import {useEffect, useMemo, useRef, useState} from 'react'
import classNames from 'classnames'
import SanityNextImage from '@/components/SanityNextImage'
import Headline from '@/components/atoms/Headline'
import {LinkAtom} from '@/components/atoms/Link'
import type {StackedEntries as StackedEntriesType, StackedEntryFeature} from '@/sanity/types'
import type {PageBuilderBlockLayoutProps} from '@/lib/pageBuilderLayout'
import {
  shouldSectionFlushBottom,
  shouldSectionFlushTop,
} from '@/lib/pageBuilderLayout'
import {
  getReferenceWithSlug,
  isRenderableInternalOrExternalLink,
} from '@/utils/internalOrExternalLink'
import styles from './StackedEntries.module.scss'

export type StackedEntriesProps = StackedEntriesType & PageBuilderBlockLayoutProps

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function anchorsFor(
  entries: Array<{title: string; anchor?: string}>,
) {
  const seen = new Map<string, number>()
  return entries.map((entry, index) => {
    const raw =
      entry.anchor?.trim().replace(/^#/, '') ||
      slugify(entry.title) ||
      `entry-${index + 1}`
    const count = seen.get(raw) ?? 0
    seen.set(raw, count + 1)
    return count === 0 ? raw : `${raw}-${count + 1}`
  })
}

function featureIsVisible(feature?: StackedEntryFeature) {
  if (!feature) return false
  return Boolean(
    feature.kicker?.trim() ||
      feature.title?.trim() ||
      feature.summary?.trim() ||
      feature.image?.asset?._ref ||
      isRenderableInternalOrExternalLink(feature.link),
  )
}

export default function StackedEntries({
  eyebrow,
  title,
  description,
  entries,
  prevBlockType,
  isLastBlock,
}: StackedEntriesProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const ids = useMemo(() => anchorsFor(entries ?? []), [entries])
  const idKey = ids.join('|')
  const [activeId, setActiveId] = useState(ids[0] ?? '')

  useEffect(() => {
    if (!ids.includes(activeId)) setActiveId(ids[0] ?? '')
  }, [ids, activeId])

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    // The active entry is the last one whose top has crossed the line just
    // under the menu. On a phone that menu is a sticky row, so the line has
    // to sit below it — a fixed offset leaves the previous name selected.
    const markerFor = () => {
      const nav = section.querySelector('nav')
      const navBottom = nav?.getBoundingClientRect().bottom ?? 90
      return Math.max(120, Math.ceil(navBottom) + 16)
    }
    let frame = 0

    const update = () => {
      frame = 0
      const articles = [
        ...section.querySelectorAll<HTMLElement>('[data-stacked-entry]'),
      ]
      if (!articles.length) return
      const marker = markerFor()
      let next = articles[0].id
      for (const article of articles) {
        if (article.getBoundingClientRect().top <= marker) next = article.id
      }
      setActiveId((current) => (current === next ? current : next))
    }

    const onScroll = () => {
      if (frame) return
      frame = window.requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, {passive: true})
    window.addEventListener('resize', onScroll)
    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [idKey])

  useEffect(() => {
    const section = sectionRef.current
    if (!section || !activeId) return
    const nav = section.querySelector<HTMLElement>(`.${styles.index}`)
    const link = nav?.querySelector<HTMLElement>(
      `a[href="#${CSS.escape(activeId)}"]`,
    )
    if (!nav || !link) return
    const navRect = nav.getBoundingClientRect()
    const linkRect = link.getBoundingClientRect()
    const outOfView =
      linkRect.left < navRect.left + 8 || linkRect.right > navRect.right - 8
    if (!outOfView) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    nav.scrollTo({
      left: Math.max(0, link.offsetLeft - 16),
      behavior: reduce ? 'auto' : 'smooth',
    })
  }, [activeId])

  if (!entries?.length) return null

  const hasIntro = Boolean(eyebrow || title || description)
  const EntryHeadingTag = title ? 'h3' : 'h2'
  const FeatureHeadingTag = title ? 'h4' : 'h3'
  const label = title || eyebrow || 'Entries'

  function jump(event: React.MouseEvent<HTMLAnchorElement>, id: string) {
    const article = document.getElementById(id)
    if (!article) return
    event.preventDefault()
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    article.scrollIntoView({
      behavior: reduce ? 'auto' : 'smooth',
      block: 'start',
    })
    setActiveId(id)
    const hash = `#${id}`
    if (window.location.hash !== hash) {
      window.history.replaceState(null, '', hash)
    }
    const heading = article.querySelector('h2, h3')
    if (heading instanceof HTMLElement) heading.focus({preventScroll: true})
  }

  return (
    <section
      ref={sectionRef}
      className={classNames(
        styles.wrapper,
        shouldSectionFlushTop(prevBlockType) && styles.flushTop,
        shouldSectionFlushBottom(isLastBlock) && styles.flushBottom,
      )}
      aria-label={label}
    >
      <div className={styles.inner}>
        {hasIntro && (
          <div className={styles.intro}>
            {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
            {title && (
              <Headline tag="h2" text={title} className={styles.heading} />
            )}
            {description && <p className={styles.introText}>{description}</p>}
          </div>
        )}

        <div className={styles.body}>
          <nav className={styles.index} aria-label={label}>
            {entries.map((entry, index) => {
              const id = ids[index]
              return (
                <LinkAtom
                  key={entry._key || id}
                  title={entry.title}
                  url={`#${id}`}
                  className={classNames(
                    styles.indexLink,
                    activeId === id && styles.isActive,
                  )}
                  ariaCurrent={activeId === id ? 'true' : undefined}
                  onClick={(event) => jump(event, id)}
                />
              )
            })}
          </nav>

          <div className={styles.entries}>
            {entries.map((entry, index) => {
              const id = ids[index]
              const feature = featureIsVisible(entry.feature)
                ? entry.feature
                : undefined
              const hasImage = Boolean(feature?.image?.asset?._ref)
              const showLink = isRenderableInternalOrExternalLink(feature?.link)

              return (
                <article
                  key={entry._key || id}
                  id={id}
                  className={styles.entry}
                  data-stacked-entry
                >
                  <Headline
                    tag={EntryHeadingTag}
                    text={entry.title}
                    className={styles.entryHeading}
                    tabIndex={-1}
                  />
                  <p className={styles.challenge}>{entry.body}</p>

                  {feature && (
                    <div
                      className={classNames(
                        styles.feature,
                        !hasImage && styles.noPhoto,
                        hasImage &&
                          feature.mediaPosition === 'left' &&
                          styles.mediaLeft,
                      )}
                    >
                      <div className={styles.featureCopy}>
                        {feature.kicker && (
                          <p className={styles.kicker}>{feature.kicker}</p>
                        )}
                        {feature.title && (
                          <Headline
                            tag={FeatureHeadingTag}
                            text={feature.title}
                            className={styles.featureTitle}
                          />
                        )}
                        {feature.summary && (
                          <p className={styles.summary}>{feature.summary}</p>
                        )}
                        {showLink && feature.link && (
                          <LinkAtom
                            className={styles.featureLink}
                            title={feature.link.title}
                            isExternalLink={feature.link.isExternalLink}
                            url={feature.link.url}
                            target={feature.link.target}
                            reference={getReferenceWithSlug(feature.link)}
                          />
                        )}
                      </div>
                      {hasImage && feature.image && (
                        <div className={styles.photo}>
                          <SanityNextImage
                            image={feature.image}
                            fit="cover"
                            className={styles.image}
                            sizes="(min-width: 768px) 32vw, 100vw"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </article>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
