import type { ImpactHero } from '@/sanity/types';
import { parseVideoUrl } from '@/components/blocks/TextMedia/TextMedia';
import { isRenderableInternalOrExternalLink } from '@/utils/internalOrExternalLink';

/**
 * Resolves flags for media, CTAs, and layout from raw CMS props.
 */
export function deriveImpactHero(props: ImpactHero) {
  const mediaPosition = props.mediaPosition ?? 'right';
  const videoEmbed = parseVideoUrl(props.media.videoUrl);
  const image = props.media.image;
  const showImage = Boolean(image?.asset?._ref && !videoEmbed);
  const hasMedia = Boolean(videoEmbed || showImage);
  const showCta1 = isRenderableInternalOrExternalLink(props.cta1);
  const showCta2 = isRenderableInternalOrExternalLink(props.cta2);

  return {
    mediaPosition,
    isMediaLeft: mediaPosition === 'left',
    videoEmbed,
    image,
    showImage,
    hasMedia,
    showCta1,
    showCta2,
    showCtas: showCta1 || showCta2,
    iframeTitle:
      videoEmbed?.platform === 'vimeo'
        ? 'Vimeo video player'
        : 'YouTube video player',
  };
}
