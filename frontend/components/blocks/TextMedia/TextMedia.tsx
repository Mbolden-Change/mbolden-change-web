import React from 'react';
import styles from './TextMedia.module.css';
import { TextMedia as TextMediaType } from '@/sanity/types';
import { PortableTextBlock } from 'next-sanity';
import Image from 'next/image';
import { urlFor } from '@/sanity/lib/image';
import PortableTextComponent from '@/components/PortableTextComponent';

const getEmbedUrl = (url?: string) => {
  if (!url) return null;
  if (url.includes('/embed/')) return url;
  if (url.includes('watch?v=')) {
    const videoId = url.split('watch?v=')[1]?.split('&')[0];
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  }
  return null;
};

const TextMedia = ({ headline, textBody, media, ctas }: TextMediaType) => {
  const videoUrl = getEmbedUrl(media?.videoUrl);

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
        {media?.image && (
          <Image
            src={urlFor(media.image).url()}
            alt={headline}
            width={800}
            height={600}
          />
        )}

        {media?.videoUrl && (
          <div className={styles.videoWrapper}>
            <iframe
              src={videoUrl || ''}
              title="YouTube video player"
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
