import { TestimonialCard as TestimonialCardType } from '@/sanity/types';
import SanityNextImage from '../../SanityNextImage';
import Headline from '../../atoms/Headline';
import { PortableTextBlock } from 'next-sanity';
import PortableTextComponent from '../../PortableTextComponent';
import ButtonComponent from '../../atoms/ButtonComponent';
import Grid from '@/components/Grid';
import GridItem from '@/components/GridItem';
import styles from './TestimonialCard.module.css';


const quotesMap = {
  yellow: '/bold-quote-marks/quote-yellow.png',
  white: '/bold-quote-marks/quote-white.png',
  fuchsia: '/bold-quote-marks/quote-fuchsia.png',
  black: '/bold-quote-marks/quote-black.png',
  aqua: '/bold-quote-marks/quote-aqua.png',
};

export default function TestimonialCard({
  title,
  text,
  quoteMarksColor,
  author,
  credentials,
  image,
  link,
  hasButton,
}: TestimonialCardType) {

  return (
    <section>
      {/* Desktop layout */}
      <div className={styles.desktopView}>
        <Grid className={styles.tstSection}>
          <GridItem desktopSpan={6} mobileSpan={12} >
            {image && (
              <div className={styles.imageSection}>
                <div className={styles.polaroidCard}>
                  <SanityNextImage
                    image={image}
                    fit="contain"
                    className={styles.tstImage}
                  />
                  <p className={styles.polaroidCaption}>{image?.alt}</p>
                </div>
              </div>
            )}
          </GridItem>

          <GridItem desktopSpan={6} mobileSpan={12}>
            <div className={styles.textSection}>
              {title && (
                <Headline tag="h1" text={title} className={styles.headline} />
              )}

              <div className={styles.pTextWrapper}>
                {quoteMarksColor && quotesMap[quoteMarksColor] && (
                  <img
                  src={quotesMap[quoteMarksColor]}
                  alt="Opening quote"
                  className={styles.openingQuote}
                  />
                )}

                <div className={styles.pText}>
                  <PortableTextComponent value={text as PortableTextBlock[]} />
                </div>

              </div>

              {author && (
                <div className={styles.credit}>
                  <Headline tag="h3" text={author} className={styles.author}/>
                  {credentials && <Headline tag="h4" text={credentials} className={styles.credentials} />}
                </div>
              )}


              {hasButton && link && (
                <div className={styles.buttonWrapper}>
                  <ButtonComponent
                    className={styles.button}
                    variant="secondary"
                    link={link}
                  />
                </div>
              )}
            </div>
          </GridItem>
        </Grid>
      </div>

      {/* Mobile layout */}
      <div className={styles.mobileView}>
        <div className={styles.mobileContent}>
          <div className={styles.mobileTextSection}>
            {title && (
              <Headline tag="h1" text={title} className={styles.mobileHeadline} />
            )}

            <div className={styles.pTextWrapper}>
              {quoteMarksColor && quotesMap[quoteMarksColor] && (
                <img
                src={quotesMap[quoteMarksColor]}
                alt="Opening quote"
                className={styles.openingQuote}
                />
              )}

              {text && (
                <div className={styles.mobilePText}>
                  <PortableTextComponent value={text as PortableTextBlock[]} />
                </div>
              )}
            </div>


            {author && (
              <div className={styles.mobileCredit}>
                <Headline tag="h3" text={author} className={styles.author}/>
                {credentials && <Headline tag="h4" text={credentials} className={styles.credentials} />}
              </div>
            )}

            {hasButton && link && (
              <ButtonComponent
                className={styles.button}
                variant="secondary"
                link={link}
              />
            )}
          </div>

          {image && (
            <div className={styles.mobileImageSection}>
                <div className={styles.polaroidCard}>
                  <SanityNextImage
                    image={image}
                    fit="contain"
                    className={styles.tstImage}
                  />
                  <p className={styles.polaroidCaption}>{image?.alt}</p>
                </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
