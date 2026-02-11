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
  isActive?: boolean;
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
  isActive = false,
  
}: CoryHeroSlideProps) {
  const isColorBackground = leftBackgroundType === 'color';
  const contentAnimationClass = isActive
    ? styles.slideContentActive
    : styles.slideContentIdle;
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
<div className={classNames(styles.heroSlideContent, contentAnimationClass)}>
  {subheading && (
    <p className={classNames(styles.heroSlideSubheading, styles.slideAnimSubheading)}>{subheading}</p>
  )}
  {title && (
    <Headline
      tag="h1"
      text={title}
      className={classNames(styles.heroSlideHeadline, styles.slideAnimHeading)}
    />
  )}
  {(text || (hasButton && link)) && (
    <div className={classNames(styles.heroSlideBottomBlock, styles.slideAnimBody)}>
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

// export function CoryHeroFullSlide({
//   title,
//   subheading,
//   text,
//   image,
//   link,
//   hasButton,
// }: CoryHeroFullSlideProps) {
  
//   return (
//     <section className={styles.heroSlideSection} aria-label="Hero slide">
//       <div className={styles.heroSlideFull}>
//         <div className={styles.heroSlideFullContent}>
//           {subheading && (
//             <p className={styles.heroSlideSubheading}>{subheading}</p>
//           )}
//         </div>
        
//       </div>
//     </section>
//   )
//   }
   