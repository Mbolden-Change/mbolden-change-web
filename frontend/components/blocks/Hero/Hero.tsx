import { Hero as HeroType } from '@/sanity/types';
import SanityNextImage from '../../SanityNextImage';
import Headline from '../../atoms/Headline';
import { PortableTextBlock } from 'next-sanity';
import PortableTextComponent from '../../PortableTextComponent';
import ButtonComponent from '../../atoms/ButtonComponent';
import classNames from 'classnames';
import styles from './Hero.module.css';

type HeroProps = HeroType & {
  isActive?: boolean;
};

export default function Hero({
  subheading,
  title,
  text,
  image,
  link,
  hasButton,
  isActive = false,
}: HeroProps) {
  const contentAnimationClass = isActive
    ? styles.slideContentActive
    : styles.slideContentIdle;

  return (
    <section className={styles.heroSection}>
      <div className={styles.imageWrapper}>
        {image && (
          <SanityNextImage
            image={image}
            fit="cover"
            className={styles.heroImage}
          />
        )}

        <div className={classNames(styles.overlayContent, contentAnimationClass)}>
          {subheading && (
            <p className={classNames(styles.heroSubheading, styles.slideAnimSubheading)}>
              {subheading}
            </p>
          )}
          {title && (
            <Headline
              tag="h1"
              text={title}
              className={classNames(styles.headline, styles.slideAnimHeading)}
            />
          )}
          {text && (
            <div className={classNames(styles.pText, styles.slideAnimBody)}>
              <PortableTextComponent value={text as PortableTextBlock[]} />
            </div>
          )}
          {hasButton && link && (
            <ButtonComponent
              className={classNames(styles.button, styles.slideAnimBody)}
              variant="primary"
              link={link}
            />
          )}
        </div>
      </div>
    </section>
  );
}
