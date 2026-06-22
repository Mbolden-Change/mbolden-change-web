export type VideoEmbed = {
  embedUrl: string
  platform: 'youtube' | 'vimeo'
  isShort: boolean
}

export function parseVideoUrl(input?: string): VideoEmbed | null {
  if (!input) return null

  try {
    const url = new URL(input)
    if (
      url.hostname.includes('youtube.com') ||
      url.hostname.includes('youtu.be')
    ) {
      let videoId = ''
      let isShort = false

      if (url.hostname === 'youtu.be') {
        videoId = url.pathname.slice(1)
      } else if (url.pathname.startsWith('/embed/')) {
        videoId = url.pathname.split('/embed/')[1]
      } else if (url.pathname.startsWith('/watch')) {
        videoId = url.searchParams.get('v') || ''
      } else if (url.pathname.startsWith('/shorts/')) {
        videoId = url.pathname.split('/shorts/')[1]
        isShort = true
      } else if (url.pathname.startsWith('/live/')) {
        videoId = url.pathname.split('/live/')[1]
      }
      if (!videoId) return null
      const cleanId = videoId.split(/[?&]/)[0]
      return {
        embedUrl: `https://www.youtube.com/embed/${cleanId}`,
        platform: 'youtube',
        isShort,
      }
    }

    if (url.hostname.includes('vimeo.com')) {
      const id = url.pathname.split('/').filter(Boolean)[0]
      if (!id) return null
      return {
        embedUrl: `https://player.vimeo.com/video/${id}`,
        platform: 'vimeo',
        isShort: false,
      }
    }

    return null
  } catch {
    return null
  }
}
