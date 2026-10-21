'use client'

import {useEffect, useRef, type CSSProperties} from 'react'
import {getPilotImage} from './pilotImage'
import styles from './PilotDialog.module.scss'

type PilotVideoProps = {
  videoId: string
  title: string
  cover: ReturnType<typeof getPilotImage>
  playing: boolean
  onPlay: () => void
}

/**
 * Click-to-load YouTube video for a pilot pop-up. Until someone presses play,
 * only our cover (or a brand panel) is shown and nothing loads from YouTube.
 * The player itself sits in an unclipped frame so YouTube's controls show.
 */
export default function PilotVideo({videoId, title, cover, playing, onPlay}: PilotVideoProps) {
  const frameRef = useRef<HTMLDivElement>(null)

  // Focus lands on the player's frame, not inside YouTube's iframe, so Escape
  // still closes the pop-up; one Tab reaches YouTube's controls.
  useEffect(() => {
    if (playing) frameRef.current?.focus()
  }, [playing])

  if (playing) {
    return (
      <div
        ref={frameRef}
        className={styles.videoFrame}
        role="group"
        aria-label={title}
        tabIndex={-1}
      >
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?autoplay=1&rel=0&playsinline=1`}
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
      className={styles.videoCover}
      onClick={onPlay}
      aria-label={`Play video: ${title}`}
    >
      <span
        className={styles.frame}
        style={cover ? ({'--image-focus': cover.focus} as CSSProperties) : undefined}
      >
        {cover ? (
          <span className={styles.settle}>
            <span className={styles.drift}>
              <img
                src={cover.src}
                srcSet={cover.srcSet}
                sizes="(min-width: 768px) 940px, 100vw"
                alt=""
                loading="lazy"
                className={styles.image}
              />
            </span>
          </span>
        ) : (
          <span className={styles.videoPanel} aria-hidden="true">
            <span className={styles.videoPanelLabel}>Video</span>
            <span className={styles.videoPanelTitle}>{title}</span>
          </span>
        )}
        <span className={styles.playBadge} aria-hidden="true">
          <span className={styles.playIcon} />
        </span>
      </span>
    </button>
  )
}
