import {getYouTubeId} from './pilotImage'

export type VideoSource =
  | {kind: 'mux'; playbackId: string}
  | {kind: 'youtube'; videoId: string}

// Public playback IDs are letters and digits only.
const MUX_PLAYBACK_ID = /^[A-Za-z0-9]+$/

/** The editor's Mux playback ID, trimmed, or null if it isn't one. */
export function getMuxPlaybackId(input?: string | null) {
  const id = input?.trim()
  return id && MUX_PLAYBACK_ID.test(id) ? id : null
}

/**
 * Which player a video block uses. A Mux playback ID wins when present; the
 * YouTube URL stays in content as a fallback and is used only without one.
 */
export function getVideoSource(
  muxPlaybackId?: string | null,
  youTubeUrl?: string | null,
): VideoSource | null {
  const playbackId = getMuxPlaybackId(muxPlaybackId)
  if (playbackId) return {kind: 'mux', playbackId}
  const videoId = getYouTubeId(youTubeUrl)
  return videoId ? {kind: 'youtube', videoId} : null
}
