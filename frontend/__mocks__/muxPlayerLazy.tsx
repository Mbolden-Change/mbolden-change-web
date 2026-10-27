// Jest stand-in for @mux/mux-player-react/lazy (an ES module jsdom can't run).
// Renders the props the tests check as data attributes.
type Props = {
  playbackId?: string
  metadataVideoTitle?: string
  autoPlay?: boolean | string
  poster?: string
}

export default function MuxPlayer({playbackId, metadataVideoTitle, autoPlay, poster}: Props) {
  return (
    <div
      data-testid="mux-player"
      data-playback-id={playbackId}
      data-video-title={metadataVideoTitle}
      data-autoplay={String(autoPlay)}
      data-poster={poster}
    />
  )
}
