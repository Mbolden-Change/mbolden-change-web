import type {TextMedia} from '@/sanity/types'
import {parseVideoUrl} from '@/lib/parseVideoUrl'

export function deriveTextMedia(props: TextMedia) {
  const mediaPosition = props.mediaPosition ?? 'right'
  const videoEmbed = parseVideoUrl(props.media?.videoUrl)
  const image = props.media?.image
  const showImage = Boolean(image?.asset?._ref && !videoEmbed)
  const showVideo = Boolean(videoEmbed)
  const hasMedia = showImage || showVideo

  return {
    mediaPosition,
    isMediaLeft: mediaPosition === 'left',
    mobileMediaFirst: props.mobileLayout !== 'textTop',
    videoEmbed,
    image,
    showImage,
    showVideo,
    hasMedia,
    iframeTitle:
      videoEmbed?.platform === 'vimeo' ? 'Vimeo video player' : 'YouTube video player',
  }
}
