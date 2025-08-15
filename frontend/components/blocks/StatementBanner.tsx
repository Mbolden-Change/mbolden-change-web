import Link from 'next/link';
import Headline from '../atoms/Headline';
import styles from './StatementBanner.module.css';
import SanityNextImage from '../SanityNextImage';
import RichText from './RichText';
import type { StatementBanner as SB } from '@/sanity/types';
import Grid from '../Grid'
import GridItem from '../GridItem';
import { PortableTextBlock } from 'next-sanity';

type PatchedStatementBanner = Omit<SB, 'cta'> & {
  cta?:
    | (SB['cta'] & {
        statement?: {
          slug?: string;
        };
      })
    | undefined;
  link?: string;
  linkLabel?: string;
};

const StatementBanner = ({
  backgroundColor,
  body,
  cta,
  headline,
  textColor,
  link,
  linkLabel,
  mediaProperties,
  image,
}: PatchedStatementBanner) => {
  //@ts-ignore
  const slug = cta?.statement?.slug;
  //@ts-ignore
  const label = cta?.label ?? 'Read more';
  if (mediaProperties === 'no-image') {
  return (
    // {No image}
    <section
      className={styles.banner}
      style={{ backgroundColor, color: textColor }}
    >
      <div className={styles['banner-content']}>
        <Headline text={headline || ''} tag="h3" className={styles.headlineNoImage} />

        {body && <RichText title={''} text={body as PortableTextBlock[]} variant="resource" />}
        {slug && (
          <Link
            href={`/statement/${slug}`}
            className={styles.cta}
            style={{ color: textColor }}
          >
            {label}
          </Link>
        )}
        {!slug && link && (
          <Link href={link} className={styles.cta} style={{ color: textColor }}>
            {linkLabel}
          </Link>
        )}
      </div>
    </section>
  );
 }
//  LeftImage section
 else if ( mediaProperties === 'left') {
  return (
    <section
      className={styles.banner}
      style={{ backgroundColor, color: textColor }}
    >
    <Headline text={headline || ''} tag="h3" className={styles.headline} />
      <Grid>
        <GridItem desktopSpan={6} mobileSpan={6}>
          <div className={styles['banner-content']}>
            {/* @ts-ignore */}
              <SanityNextImage className={styles.leftImage} image={image} fit="cover" />
          </div>
        </GridItem>


        <GridItem desktopSpan={6} mobileSpan={6}>
            <div className={styles['banner-content']}>
              <div className={styles.rightText}>
                {body && <RichText title={''}  text={body as PortableTextBlock[]} variant="resource" />}
              </div>
            </div>
        </GridItem>
      </Grid>

      {slug && (
          <Link
          href={`/statement/${slug}`}
          className={styles.cta}
          style={{ color: textColor }}
          >
            {label}
          </Link>
        )}
        {!slug && link && (
          <Link href={link} className={styles.cta} style={{ color: textColor }}>
            {linkLabel}
          </Link>
        )}
    </section>
  )
  // right image section
 } else if ( mediaProperties === 'right') {
  return (
    <section
      className={styles.banner}
      style={{ backgroundColor, color: textColor }}
    >
      <Headline text={headline || ''} tag="h3" className={styles.headline} />
      <Grid>
        <GridItem desktopSpan={6} mobileSpan={6}>
            <div className={styles['banner-content']}>
              <div className={styles.leftText}>
                {body && <RichText  title={ ''} text={body as PortableTextBlock[]} variant="resource" className={styles.richtext}/>}
              </div>
            </div>
        </GridItem>

        <GridItem desktopSpan={6} mobileSpan={6}>
          <div className={styles['banner-content']}>
            {/* @ts-ignore */}
              <SanityNextImage className={styles.rightImage} image={image} fit="contain" />
          </div>
        </GridItem>


      </Grid>

      {slug && (
          <Link
          href={`/statement/${slug}`}
          className={styles.cta}
          style={{ color: textColor }}
          >
            {label}
          </Link>
        )}
        {!slug && link && (
          <Link href={link} className={styles.cta} style={{ color: textColor }}>
            {linkLabel}
          </Link>
        )}
    </section>
  )
 }
}
export default StatementBanner;
