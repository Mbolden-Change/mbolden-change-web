'use client'

import MuxPlayer from '@mux/mux-player-react/lazy'

type MuxVideoProps = {
  playbackId: string
  title: string
  poster?: string
}

/**
 * Mux Player for a click-to-play video. It mounts only after someone presses
 * our play button, so the player script and the stream load then, not with
 * the page, and the video starts without a second click.
 */
export default function MuxVideo({playbackId, title, poster}: MuxVideoProps) {
  return (
    <MuxPlayer
      loading="page"
      playbackId={playbackId}
      streamType="on-demand"
      autoPlay
      poster={poster}
      placeholder={poster}
      metadataVideoTitle={title}
      // Same privacy stance as youtube-nocookie: no Mux Data viewer cookie.
      disableCookies
      accentColor="var(--brand-warm-yellow)"
      style={{position: 'absolute', inset: 0, width: '100%', height: '100%'}}
    />
  )
}
