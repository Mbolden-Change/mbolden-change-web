'use client'

import {useRef} from 'react'
import {gsap} from 'gsap'
import {ScrollTrigger} from 'gsap/ScrollTrigger'
import {useGSAP} from '@gsap/react'
import {LinkAtom} from '@/components/atoms/Link'
import type {TopicList as TopicListType} from '@/sanity/types'
import {
  getReferenceWithSlug,
  isRenderableInternalOrExternalLink,
} from '@/utils/internalOrExternalLink'
import styles from './TopicList.module.scss'

gsap.registerPlugin(ScrollTrigger, useGSAP)

export type TopicListProps = TopicListType

export default function TopicList({
  eyebrow,
  title,
  description,
  items,
  closingEyebrow,
  closingNote,
}: TopicListProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const introRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const closingRef = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const section = sectionRef.current
      if (!section || !items?.length) return

      const reduced = window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches
      if (reduced) return

      if (introRef.current) {
        gsap.from(introRef.current, {
          opacity: 0,
          y: 12,
          duration: 0.5,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: introRef.current,
            start: 'top 92%',
            toggleActions: 'play none none reverse',
          },
        })
      }

      const itemEls = listRef.current?.querySelectorAll<HTMLElement>(
        '[data-topic-item]',
      )
      if (itemEls?.length) {
        gsap.from(itemEls, {
          opacity: 0,
          y: 12,
          duration: 0.45,
          ease: 'power2.out',
          stagger: 0.06,
          scrollTrigger: {
            trigger: listRef.current,
            start: 'top 90%',
            toggleActions: 'play none none reverse',
          },
        })
      }

      if (closingRef.current) {
        gsap.from(closingRef.current, {
          opacity: 0,
          y: 10,
          duration: 0.45,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: closingRef.current,
            start: 'top 94%',
            toggleActions: 'play none none reverse',
          },
        })
      }
    },
    {scope: sectionRef, dependencies: [items, closingNote, closingEyebrow]},
  )

  if (!title || !items?.length) return null

  return (
    <section ref={sectionRef} className={styles.wrapper} aria-label={title}>
      <div className={styles.inner}>
        <div ref={introRef} className={styles.intro}>
          {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
          <h2 className={styles.title}>{title}</h2>
          {description && <p className={styles.description}>{description}</p>}
        </div>

        <ul ref={listRef} className={styles.list}>
          {items.map((item, index) => {
            const showLink = isRenderableInternalOrExternalLink(item.link)
            return (
              <li
                key={item._key || index}
                className={styles.item}
                data-topic-item
              >
                <h3 className={styles.itemTitle}>{item.title}</h3>
                {item.body && <p className={styles.body}>{item.body}</p>}
                {showLink && item.link && (
                  <LinkAtom
                    className={styles.link}
                    title={item.link.title}
                    isExternalLink={item.link.isExternalLink}
                    url={item.link.url}
                    target={item.link.target}
                    reference={getReferenceWithSlug(item.link)}
                  >
                    <span className={styles.linkLabel}>{item.link.title}</span>
                    <span className={styles.linkArrow} aria-hidden="true">
                      →
                    </span>
                  </LinkAtom>
                )}
              </li>
            )
          })}
        </ul>

        {closingNote && (
          <aside ref={closingRef} className={styles.closing}>
            {closingEyebrow && (
              <p className={styles.closingEyebrow}>{closingEyebrow}</p>
            )}
            <p className={styles.closingText}>{closingNote}</p>
          </aside>
        )}
      </div>
    </section>
  )
}
