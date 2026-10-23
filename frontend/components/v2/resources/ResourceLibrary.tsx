'use client'

import classNames from 'classnames'
import Image from 'next/image'
import {useEffect, useRef, useState, type CSSProperties} from 'react'
import {urlFor} from '@/sanity/lib/image'
import type {ResourceLibrary as ResourceLibraryType} from '@/sanity/types'
import {youTubeEmbedUrl} from '../blocks/TextMedia/pilotImage'
import {useScrollReveal} from '../motion/useScrollReveal'
import {FILTERS, KIND_LABEL, KIND_LANE, linkArrow, youTubeIdFrom} from './lanes'
import styles from './resources.module.scss'

type Item = NonNullable<ResourceLibraryType['items']>[number]

/** The card's thumbnail: the Studio image, or the YouTube thumbnail served through our own image optimizer. */
function thumbnailSrc(item: Item, videoId: string) {
  if (item.thumbnail?.asset?._ref) return urlFor(item.thumbnail).width(960).height(540).fit('crop').auto('format').url()
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
}

function PlayMark() {
  return (
    <span className={styles.play} aria-hidden="true">
      <svg width="18" height="20" viewBox="0 0 22 24">
        <path d="M2 2 L20 12 L2 22 Z" />
      </svg>
    </span>
  )
}

/**
 * Filterable library. Video cards open a pop-up that plays from YouTube's
 * privacy-enhanced mode; nothing loads from YouTube until a card is chosen.
 */
export default function ResourceLibrary({eyebrow, heading, items}: ResourceLibraryType) {
  const {ref, phase} = useScrollReveal<HTMLElement>(0.1)
  const [filter, setFilter] = useState<string>('all')
  const [video, setVideo] = useState<{id: string; title: string} | null>(null)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const openerRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    // Escape, the X and a click outside all end here; focus goes back to the card.
    const handleClose = () => {
      document.documentElement.style.overflow = ''
      setVideo(null)
      openerRef.current?.focus()
    }
    dialog.addEventListener('close', handleClose)
    return () => {
      dialog.removeEventListener('close', handleClose)
      document.documentElement.style.overflow = ''
    }
  }, [])

  if (!heading) return null
  const all = items ?? []
  const kinds = new Set(all.map((item) => item.kind))
  const filters = FILTERS.filter((f) => f.key === 'all' || kinds.has(f.key))
  const shown = all.filter((item) => filter === 'all' || item.kind === filter)

  const openVideo = (id: string, title: string, opener: HTMLElement) => {
    openerRef.current = opener
    setVideo({id, title})
    document.documentElement.style.overflow = 'hidden'
    dialogRef.current?.showModal()
  }

  return (
    <section
      ref={ref}
      className={classNames(styles.library, phase === 'armed' && styles.armed, phase === 'in' && styles.in)}
      aria-label={heading}
    >
      <div className={classNames(styles.wrap, styles.stack)}>
        <div className={styles.head}>
          {eyebrow && (
            <p className={classNames(styles.eyebrow, styles.rv)} style={{'--bar': 'var(--brand-fuchsia)'} as CSSProperties}>
              {eyebrow}
            </p>
          )}
          <h2 className={classNames(styles.h2, styles.rv, styles.d1)}>{heading}</h2>
        </div>

        <div className={classNames(styles.chips, styles.rv, styles.d2)} role="group" aria-label="Filter resources">
          {filters.map((f) => (
            <button
              key={f.key}
              type="button"
              className={classNames(styles.chip, filter === f.key && styles.chipOn)}
              aria-pressed={filter === f.key}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>

        <ul className={styles.cards}>
          {shown.map((item) => {
            const lane = {'--lane': KIND_LANE[item.kind ?? ''] ?? 'var(--brand-black)'} as CSSProperties
            const meta = [KIND_LABEL[item.kind ?? ''], item.year].filter(Boolean).join(' · ')
            const body = (
              <>
                <span className={styles.ctype}>{meta}</span>
                <h3 className={styles.ctitle}>{item.title}</h3>
                {item.text && <span className={styles.ctext}>{item.text}</span>}
              </>
            )
            const videoId = item.kind === 'video' ? youTubeIdFrom(item.youtube) : null
            if (item.kind === 'video') {
              if (!videoId) return null
              return (
                <li key={`${filter}-${item._key}`} className={styles.cardItem} style={lane}>
                  <button
                    type="button"
                    className={styles.card}
                    onClick={(event) => openVideo(videoId, item.title ?? 'Video', event.currentTarget)}
                    aria-haspopup="dialog"
                  >
                    <span className={styles.cbar} aria-hidden="true" />
                    <span className={styles.thumb}>
                      <Image src={thumbnailSrc(item, videoId)} alt="" fill sizes="(max-width: 900px) 100vw, 380px" />
                      <PlayMark />
                    </span>
                    <span className={styles.cpad}>
                      {body}
                      <span className={styles.go}>
                        Watch <span aria-hidden="true">▶</span>
                      </span>
                    </span>
                  </button>
                </li>
              )
            }
            if (!item.href) return null
            const newTab = Boolean(item.newTab)
            return (
              <li key={`${filter}-${item._key}`} className={styles.cardItem} style={lane}>
                <a
                  className={styles.card}
                  href={item.href}
                  target={newTab ? '_blank' : undefined}
                  rel={newTab ? 'noopener noreferrer' : undefined}
                >
                  <span className={styles.cbar} aria-hidden="true" />
                  <span className={styles.cpad}>
                    {body}
                    <span className={styles.go}>
                      {item.actionLabel} <span aria-hidden="true">{linkArrow(item.href, newTab)}</span>
                      {newTab && <span className={styles.srOnly}> (opens in a new tab)</span>}
                    </span>
                  </span>
                </a>
              </li>
            )
          })}
        </ul>
      </div>

      <dialog
        ref={dialogRef}
        className={styles.dialog}
        aria-label={video?.title ?? 'Video'}
        // A click on the backdrop lands on the dialog itself, not its content.
        onClick={(event) => {
          if (event.target === event.currentTarget) dialogRef.current?.close()
        }}
      >
        {video && (
          <div className={styles.dialogBody}>
            <button type="button" className={styles.close} aria-label="Close" onClick={() => dialogRef.current?.close()}>
              <span aria-hidden="true">×</span>
            </button>
            <div className={styles.player}>
              <iframe
                src={youTubeEmbedUrl(video.id)}
                title={video.title}
                allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                allowFullScreen
              />
            </div>
            <p className={styles.dialogTitle}>{video.title}</p>
          </div>
        )}
      </dialog>
    </section>
  )
}
