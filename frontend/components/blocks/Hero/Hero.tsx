import { Hero as HeroType } from '@/sanity/types';
import SanityNextImage from '../../SanityNextImage';
import Headline from '../../atoms/Headline';
import { PortableTextBlock } from 'next-sanity';
import PortableTextComponent from '../../PortableTextComponent';
import ButtonComponent from '../../atoms/ButtonComponent';
import styles from './Hero.module.css';

export default function Hero({
  title,
  text,
  image,
  link,
  hasButton,
}: HeroType) {
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

        <div className={styles.overlayContent}>
          {title && (
            <Headline tag="h1" text={title} className={styles.headline} />
          )}
          {text && (
            <div className={styles.pText}>
              <PortableTextComponent value={text as PortableTextBlock[]} />
            </div>
          )}
          {hasButton && link && (
            <ButtonComponent
              className={styles.button}
              variant="primary"
              link={link}
            />
          )}
        </div>
      </div>
    </section>
  );
}

