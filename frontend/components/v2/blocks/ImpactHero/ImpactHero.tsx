'use client';

import React from 'react';
import classNames from 'classnames';
import styles from './ImpactHero.module.scss';
import type { ImpactHero as ImpactHeroType } from '@/sanity/types';
import SkewButton from '@/components/atoms/SkewButton';
import ButtonComponent from '@/components/atoms/ButtonComponent';
import SanityNextImage from '@/components/SanityNextImage';
import { deriveImpactHero } from './deriveImpactHero';
import { isDonateCta, trackDonateClick } from '@/lib/analytics';
import { getPilotImage, getYouTubeId } from '../TextMedia/pilotImage';
import HeroVideo from './HeroVideo';

type HeroCopyProps = Pick<
  ImpactHeroType,
  'eyebrow' | 'heading' | 'subheading' | 'cta1' | 'cta2'
> & {
  showCtas: boolean;
  showCta1: boolean;
  showCta2: boolean;
};

function HeroCopy({
  eyebrow,
  heading,
  subheading,
  cta1,
  cta2,
  showCtas,
  showCta1,
  showCta2,
}: HeroCopyProps) {
  return (
    <div className={styles.copy}>
      {eyebrow && <p className={classNames(styles.eyebrow, styles.rv)}>{eyebrow}</p>}
      <h1 className={classNames(styles.heading, styles.rv, styles.d1)}>{heading}</h1>
      {subheading && (
        <p className={classNames(styles.subheading, styles.rv, styles.d2)}>{subheading}</p>
      )}
      {showCtas && (
        <div className={classNames(styles.ctaWrapper, styles.rv, styles.d3)}>
          {showCta1 && cta1?.title && (
            <SkewButton
              variant="black"
              link={cta1}
              className={styles.primaryCta}
              onClick={() => {
                if (isDonateCta(cta1)) trackDonateClick('impact-hero');
              }}
            >
              {cta1.title}
            </SkewButton>
          )}
          {showCta2 && (
            <ButtonComponent
              variant="secondary"
              link={cta2}
              className={styles.secondaryCta}
              onClick={() => {
                if (isDonateCta(cta2)) trackDonateClick('impact-hero');
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}

const ImpactHero = (props: ImpactHeroType) => {
  const derived = deriveImpactHero(props);
  const youTubeId = derived.videoEmbed?.isShort ? null : getYouTubeId(props.media.videoUrl);
  const videoTitle = props.media.videoTitle?.trim() || props.heading || 'Video';
  const supportedBy = props.supportedBy?.trim();

  return (
    <section
      className={classNames(
        styles.wrapper,
        derived.isMediaLeft && styles.layoutMediaLeft,
        !derived.hasMedia && styles.noMedia,
      )}
    >
      <div className={styles.inner}>
        <HeroCopy
          eyebrow={props.eyebrow}
          heading={props.heading}
          subheading={props.subheading}
          cta1={props.cta1}
          cta2={props.cta2}
          showCtas={derived.showCtas}
          showCta1={derived.showCta1}
          showCta2={derived.showCta2}
        />
        {derived.hasMedia && (
          <div className={classNames(styles.mediaColumn, styles.rv, styles.d2)}>
            {youTubeId ? (
              <HeroVideo
                videoId={youTubeId}
                title={videoTitle}
                cover={getPilotImage(props.media.videoCover)}
              />
            ) : derived.videoEmbed ? (
              <div
                className={classNames(
                  styles.embed,
                  derived.videoEmbed.isShort && styles.embedShort,
                )}
              >
                <iframe
                  src={derived.videoEmbed.embedUrl}
                  title={derived.iframeTitle}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              derived.showImage &&
              derived.image && (
                <div className={styles.imageFrame}>
                  <SanityNextImage
                    image={derived.image}
                    className={styles.mediaImage}
                    sizes="(min-width: 900px) 620px, 100vw"
                    priority
                  />
                </div>
              )
            )}
            {supportedBy && <p className={styles.supporter}>{supportedBy}</p>}
          </div>
        )}
      </div>
    </section>
  );
};

export default ImpactHero;
