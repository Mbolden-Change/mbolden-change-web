import Link from 'next/link';
import Headline from '../atoms/Headline';
import styles from './StatementBanner.module.css';
import SanityNextImage from '../SanityNextImage';
import type { StatementBanner as SB } from '@/sanity/types';

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
  leftHeadline,
  leftText,
  leftImage,
  rightHeadline,
  rightText,
  rightImage,
}: PatchedStatementBanner) => {
  //@ts-ignore
  const slug = cta?.statement?.slug;
  //@ts-ignore
  const label = cta?.label ?? 'Read more';

  return (
    // {No image}
    <section
      className={styles.banner}
      style={{ backgroundColor, color: textColor }}
    >
      <div className={styles['banner-content']}>
        <Headline text={headline || ''} tag="h3" className={styles.headline} />
        
        {body && <p className={styles.body}>{body}</p>}
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
};

export default StatementBanner;
