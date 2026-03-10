import React from 'react';
import styles from './TextMedia.module.css';
import { TextMedia as TextMediaType } from '@/sanity/types';
import { PortableTextBlock } from 'next-sanity';
import Image from 'next/image';
import { urlFor } from '@/sanity/lib/image';
import PortableTextComponent from '@/components/PortableTextComponent';

const getEmbedUrl = (url?: string) => {
  if (!url) return null;

  if (url.includes('/embed/') || url.includes('player.vimeo.com')) {
    return url;
  }

  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    let videoId = '';
    if (url.includes('watch?v=')) {
      videoId = url.split('watch?v=')[1]?.split('&')[0];
    } else if (url.includes('/shorts/')) {
      videoId = url.split('/shorts/')[1]?.split('?')[0];
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1]?.split('?')[0];
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  }

  if (url.includes('vimeo.com')) {
    const vimeoId = url.split('/').pop()?.split('?')[0];
    return vimeoId ? `https://player.vimeo.com/video/${vimeoId}` : null;
  }

  return null;
};

const TextMedia = ({ headline, textBody, media, ctas }: TextMediaType) => {
  const videoUrl = getEmbedUrl(media?.videoUrl);
  const isVimeo = videoUrl?.includes('vimeo');
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
          <div className={styles.videoWrapper}>
            <iframe
              src={videoUrl}
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
