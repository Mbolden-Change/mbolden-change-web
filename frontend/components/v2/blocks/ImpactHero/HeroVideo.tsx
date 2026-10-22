'use client'

import {useEffect, useRef, useState, type CSSProperties} from 'react'
import {getPilotImage, youTubeEmbedUrl} from '../TextMedia/pilotImage'
import styles from './ImpactHero.module.scss'

type HeroVideoProps = {
  videoId: string
  title: string
  cover: ReturnType<typeof getPilotImage>
}

/**
 * Click-to-load YouTube video, as in the pilot pop-ups: until someone presses
 * play only our cover shows and nothing loads from YouTube.
 */
export default function HeroVideo({videoId, title, cover}: HeroVideoProps) {
  const [playing, setPlaying] = useState(false)
  const frameRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (playing) frameRef.current?.focus()
  }, [playing])

  if (playing) {
    return (
      <div ref={frameRef} className={styles.player} role="group" aria-label={title} tabIndex={-1}>
        <iframe
          src={youTubeEmbedUrl(videoId)}
          title={title}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
        />
      </div>
    )
  }

  return (
    <button
      type="button"
      className={styles.cover}
      onClick={() => setPlaying(true)}
      aria-label={`Play video: ${title}`}
    >
      {cover ? (
        <img
          src={cover.src}
          srcSet={cover.srcSet}
          sizes="(min-width: 900px) 620px, 100vw"
          alt=""
          className={styles.coverImage}
          style={{'--image-focus': cover.focus} as CSSProperties}
        />
      ) : (
        <span className={styles.coverPanel} aria-hidden="true">
          {title}
        </span>
      )}
      <span className={styles.play} aria-hidden="true">
        <svg width="22" height="24" viewBox="0 0 22 24">
          <path d="M2 2 L20 12 L2 22 Z" />
        </svg>
      </span>
    </button>
  )
}
