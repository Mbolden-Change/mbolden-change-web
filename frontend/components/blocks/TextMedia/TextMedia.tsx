import React from 'react';
import styles from './TextMedia.module.css';
import { TextMedia as TextMediaType } from '@/sanity/types';
import { PortableTextBlock } from 'next-sanity';
import Image from 'next/image';
import { urlFor } from '@/sanity/lib/image';
import PortableTextComponent from '@/components/PortableTextComponent';

type VideoEmbed = {
  embedUrl: string;
  platform: 'youtube' | 'vimeo';
  isShort: boolean;
};

export const parseVideoUrl = (input?: string): VideoEmbed | null => {
  if (!input) return null;

  try {
    const url = new URL(input);
    if (
      url.hostname.includes('youtube.com') ||
      url.hostname.includes('youtu.be')
    ) {
      let videoId = '';
      let isShort = false;
      if (url.hostname === 'youtu.be') {
        videoId = url.pathname.slice(1);
      }
      if (url.pathname.startsWith('/watch')) {
        videoId = url.searchParams.get('v') || '';
      }
      if (url.pathname.startsWith('/shorts/')) {
        videoId = url.pathname.split('/shorts/')[1];
        isShort = true;
      }
      if (url.pathname.startsWith('/live/')) {
        videoId = url.pathname.split('/live/')[1];
      }
      if (!videoId) return null;
      return {
        embedUrl: `https://www.youtube.com/embed/${videoId}`,
        platform: 'youtube',
        isShort,
      };
    }
    if (url.hostname.includes('vimeo.com')) {
      const id = url.pathname.split('/').filter(Boolean)[0];
      if (!id) return null;
      return {
        embedUrl: `https://player.vimeo.com/video/${id}`,
        platform: 'vimeo',
        isShort: false,
      };
    }

    return null;
  } catch {
    return null;
  }
};

const TextMedia = ({ headline, textBody, media, ctas }: TextMediaType) => {
  const videoUrl = parseVideoUrl(media?.videoUrl);
  const isVimeo = videoUrl?.platform === 'vimeo';
  const videoTitle = isVimeo ? 'Vimeo video player' : 'YouTube video player';

  return (
    <div className={styles.textMedia}>
      <div className={styles.textContent}>
        <h2>{headline}</h2>

        <PortableTextComponent value={textBody as PortableTextBlock[]} />

        {ctas && ctas.length > 0 && (
          <div className={styles.ctaButtons}>
            {(() => {
              let linkCounter = 0;
              return ctas.map((cta, index) => {
                if (!cta.link) {
                  return (
                    <span key={index} className={styles.infoTag}>
                      {cta.label}
                    </span>
                  );
                }
                const isSecondary = linkCounter > 0;
                linkCounter++;
                return (
                  <a
                    key={index}
                    href={cta.link}
                    className={
                      isSecondary ? styles.ctaButtonSecondary : styles.ctaButton
                    }
                  >
                    {cta.label}
                  </a>
                );
              });
            })()}
          </div>
        )}
      </div>

      <div className={styles.mediaContent}>
        {media?.image && !videoUrl && (
          <Image
            src={urlFor(media.image).url()}
            alt={headline}
            width={800}
            height={600}
          />
        )}

        {videoUrl && (
          <div
            className={styles.videoWrapper}
            data-type={videoUrl.isShort ? 'short' : 'video'}
          >
            <iframe
              src={videoUrl.embedUrl}
              title={videoTitle}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default TextMedia;
