import SanityNextImage from '@/components/SanityNextImage';
import Headline from '@/components/atoms/Headline';
import ButtonComponent from '@/components/atoms/ButtonComponent';
import PortableTextComponent from '@/components/PortableTextComponent';
import { Hero as HeroType } from '@/sanity/types';
import { PortableTextBlock } from 'next-sanity';
import classNames from 'classnames';
import styles from './Hero.module.css';

type HeroSlideBackgroundColor =
  | 'aqua-teal'
  | 'warm-yellow'
  | 'white'
  | 'black';

/** Props from Sanity hero schema - extends Hero with split-slide fields */
type CoryHeroSlideProps = HeroType & {
  subheading?: string;
  leftBackgroundType?: 'color' | 'image';
  backgroundColor?: HeroSlideBackgroundColor;
  leftBackgroundImage?: HeroType['image'];
};

type CoryHeroFullSlideProps = HeroType



export default function CoryHeroSlide({
  title,
  subheading,
  text,
  image,
  link,
  hasButton,
  leftBackgroundType = 'color',
  backgroundColor = 'aqua-teal',
  leftBackgroundImage,
}: CoryHeroSlideProps) {
  const isColorBackground = leftBackgroundType === 'color';
  const leftClass = isColorBackground
    ? classNames(
        styles.heroSlideLeft,
        styles[`heroSlideLeft--${backgroundColor}`]
      )
    : classNames(styles.heroSlideLeft, styles.heroSlideLeftImageBg);

  return (
    <section className={styles.heroSlideSection} aria-label="Hero slide">
      {/* Left 50%: solid color or background image */}
      <div className={leftClass}>
        {!isColorBackground && leftBackgroundImage && (
          <div className={styles.heroSlideLeftImageWrap}>
            <SanityNextImage
              image={leftBackgroundImage}
              fit="cover"
              priority
            />
          </div>
        )}
<div className={styles.heroSlideContent}>
  {subheading && (
    <p className={styles.heroSlideSubheading}>{subheading}</p>
  )}
  {title && (
    <Headline
      tag="h1"
      text={title}
      className={styles.heroSlideHeadline}
    />
  )}
  {(text || (hasButton && link)) && (
    <div className={styles.heroSlideBottomBlock}>
      <hr className={styles.heroSlideSeparator} />
      {text && (
        <div className={styles.heroSlideText}>
          <PortableTextComponent value={text as PortableTextBlock[]} />
        </div>
      )}
      {hasButton && link && (
        <ButtonComponent
          className={styles.heroSlideButton}
          variant="primary"
          link={link}
        >
          Learn more
        </ButtonComponent>
      )}
    </div>
  )}
</div>
      </div>

      {/* Right 50%: main photo */}
      <div className={styles.heroSlideRight}>
        {image && (
          <SanityNextImage
            image={image}
            fit="cover"
            className={styles.heroSlideRightImage}
            priority
          />
        )}
      </div>
    </section>
  );
}

export function CoryHeroFullSlide({
  title,
  subheading,
  text,
  image,
  link,
  hasButton,
}: CoryHeroFullSlideProps) {
  return (
    <section className={styles.heroSlideSection} aria-label="Hero slide">
      <div className={styles.heroSlideFull}>
        <div className={styles.heroSlideFullContent}>
          {subheading && (
            <p className={styles.heroSlideSubheading}>{subheading}</p>
          )}
        </div>
      </div>
    </section>
  }
   