import type {SanityImageCrop, SanityImageHotspot} from '@/sanity/types'
import {getDimensionsFromRef, urlFor} from '@/sanity/lib/image'

type PilotImageSource = {
  asset?: {_ref?: string}
  crop?: SanityImageCrop
  hotspot?: SanityImageHotspot
  alt?: string
}

const WIDTHS = [480, 720, 960, 1280, 1600]

// Wider than this (after the editor's crop) is a landscape banner.
const LANDSCAPE_RATIO = 1.15

const clamp01 = (value: number) => Math.min(1, Math.max(0, value))

/**
 * Sizes a pop-up image from its Sanity crop and hotspot. The CDN applies the
 * crop; the hotspot becomes the CSS focal point (object-position and the zoom
 * origin), so any frame shape keeps the subject in view.
 */
export function getPilotImage(image?: PilotImageSource) {
  const ref = image?.asset?._ref
  if (!image || !ref) return null

  const {imageWidth, imageHeight} = getDimensionsFromRef(ref)
  if (!imageWidth || !imageHeight) return null

  const crop = {
    top: image.crop?.top ?? 0,
    bottom: image.crop?.bottom ?? 0,
    left: image.crop?.left ?? 0,
    right: image.crop?.right ?? 0,
  }
  const keptWidth = 1 - crop.left - crop.right
  const keptHeight = 1 - crop.top - crop.bottom
  const ratio = (imageWidth * keptWidth) / (imageHeight * keptHeight)

  const hotspotX = image.hotspot?.x ?? 0.5
  const hotspotY = image.hotspot?.y ?? 0.5
  const focusX = clamp01((hotspotX - crop.left) / keptWidth)
  const focusY = clamp01((hotspotY - crop.top) / keptHeight)

  const croppedWidth = Math.round(imageWidth * keptWidth)
  const widths = WIDTHS.filter((width) => width <= croppedWidth)
  if (!widths.length) widths.push(croppedWidth)
  const url = (width: number) => urlFor(image).width(width).auto('format').url()

  return {
    src: url(widths[Math.min(1, widths.length - 1)]),
    srcSet: widths.map((width) => `${url(width)} ${width}w`).join(', '),
    alt: image.alt || '',
    ratio,
    orientation: ratio > LANDSCAPE_RATIO ? ('landscape' as const) : ('portrait' as const),
    focus: `${(focusX * 100).toFixed(1)}% ${(focusY * 100).toFixed(1)}%`,
  }
}

/**
 * A logo is shown whole: the original file, ignoring the editor's crop and
 * hotspot, and never scaled up past its own size (which would blur it).
 */
export function getLogoImage(image?: PilotImageSource) {
  const ref = image?.asset?._ref
  if (!image || !ref) return null
  const {imageWidth} = getDimensionsFromRef(ref)
  const width = Math.min(imageWidth || 960, 960)
  return {
    src: urlFor({asset: {_ref: ref}}).width(width).fit('max').auto('format').url(),
    alt: image.alt || '',
  }
}

/** The YouTube video id from a watch, short, embed or youtu.be link. */
export function getYouTubeId(input?: string | null) {
  if (!input) return null
  try {
    const url = new URL(input)
    if (url.hostname === 'youtu.be') return url.pathname.slice(1).split('/')[0] || null
    if (!/(^|\.)youtube\.com$/.test(url.hostname)) return null
    if (url.pathname === '/watch') return url.searchParams.get('v')
    const match = url.pathname.match(/^\/(?:embed|shorts|live)\/([^/?]+)/)
    return match ? match[1] : null
  } catch {
    return null
  }
}

/** Privacy-enhanced YouTube player that starts playing as it loads. */
export function youTubeEmbedUrl(videoId: string) {
  return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?autoplay=1&rel=0&playsinline=1`
}
