import React from 'react';
import classNames from 'classnames';
import styles from './ImpactHero.module.scss';
import Grid from '@/components/Grid';
import GridItem from '@/components/GridItem';
import type { ImpactHero as ImpactHeroType } from '@/sanity/types';
import type { VideoEmbed } from '@/components/blocks/TextMedia/TextMedia';
import ButtonComponent from '@/components/atoms/ButtonComponent';
import SanityNextImage from '@/components/SanityNextImage';
import { deriveImpactHero } from './deriveImpactHero';

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
    <>
      <div className={styles.textWrapper}>
        {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
        <h1 className={styles.heading}>{heading}</h1>
        {subheading && <p className={styles.subheading}>{subheading}</p>}
      </div>
      {showCtas && (
        <div className={styles.ctaWrapper}>
          {showCta1 && (
            <ButtonComponent
              variant="primary"
              link={cta1}
              className={styles.primaryCta}
            />
          )}
          {showCta2 && (
            <ButtonComponent
              variant="secondary"
              link={cta2}
              className={styles.secondaryCta}
            />
          )}
        </div>
      )}
    </>
  );
}

type HeroMediaProps = {
  videoEmbed: VideoEmbed | null;
  showImage: boolean;
  image: ImpactHeroType['media']['image'];
  iframeTitle: string;
};

function HeroMedia({
  videoEmbed,
  showImage,
  image,
  iframeTitle,
}: HeroMediaProps) {
  return (
    <div
      className={classNames(
        styles.mediaFrame,
        videoEmbed?.isShort && styles.mediaFrameShort,
      )}
    >
      {videoEmbed && (
        <div className={styles.videoInner}>
          <iframe
            src={videoEmbed.embedUrl}
            title={iframeTitle}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )}
      {showImage && image && (
        <div className={styles.imageInner}>
          <SanityNextImage
            image={image}
            fit="cover"
            className={styles.mediaImage}
            sizes="(min-width: 768px) 50vw, 100vw"
            priority
          />
        </div>
      )}
    </div>
  );
}

const ImpactHero = (props: ImpactHeroType) => {
  const derived = deriveImpactHero(props);
  const span = derived.hasMedia ? 6 : 12;

  return (
    <section className={styles.wrapper}>
      <Grid
        className={classNames(derived.isMediaLeft && styles.layoutMediaLeft)}
      >
        <GridItem
          desktopSpan={span}
          mobileSpan={6}
          className={styles.leftColumn}
        >
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
        </GridItem>
        {derived.hasMedia && (
          <GridItem
            desktopSpan={6}
            mobileSpan={6}
            className={styles.mediaColumn}
          >
            <HeroMedia
              videoEmbed={derived.videoEmbed}
              showImage={derived.showImage}
              image={derived.image}
              iframeTitle={derived.iframeTitle}
            />
          </GridItem>
        )}
      </Grid>
    </section>
  );
};

export default ImpactHero;
