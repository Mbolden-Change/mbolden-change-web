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

export type PilotDocumentFile = {label?: string | null; slug?: string | null} | null

/** Give buttons with a link, then the optional PDF button as an outline. */
export function pilotCtas(
  ctas: TextMedia['ctas'],
  documentFile?: PilotDocumentFile,
) {
  const linked: Array<{_key?: string; label?: string | null; link?: string | null; secondary?: boolean; newTab?: boolean}> =
    ctas?.filter((cta) => cta.link?.trim()) ?? []
  if (documentFile?.slug && documentFile.label?.trim()) {
    linked.push({
      _key: 'document-file',
      label: documentFile.label,
      link: `/reports/${documentFile.slug}.pdf`,
      secondary: true,
      newTab: true,
    })
  }
  return linked
}
