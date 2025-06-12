'use client';

import styles from './CaseStudyHighlight.module.css';
import SanityNextImage from '@/components/SanityNextImage';
import { LinkAtom, ReferenceType } from '../../atoms/Link';
import type { CaseStudyHighlight } from '@/sanity/types';
import Headline from '@/components/atoms/Headline';

export default function CaseStudyHighlight({
  label,
  pullQuote,
  headline,
  body,
  cta,
  themeColor,
  image,
}: CaseStudyHighlight) {
  return (
    <section
      className={styles.wrapper}
      style={{ backgroundColor: themeColor || 'var(--brand-warm-yellow)' }}
    >
      <div className={styles.inner}>
        <div className={styles.left}>
          <span className={styles.label}>{label}</span>

          <blockquote className={styles.quote}>
            <img
              src="/bold-quote-marks/quote-aqua.png"
              width={56}
              height={56}
              alt=""
              className={styles.quoteMark}
            />
            <p>{pullQuote}</p>
          </blockquote>

          {image && (
            <SanityNextImage
              image={image}
              sizes="600px"
              className={styles.highlightImg}
            />
          )}
        </div>

        <div className={styles.right}>
          <Headline
            tag="h2"
            text={headline || ''}
            className={styles.headline}
          />
          <p className={styles.body}>{body}</p>

          {cta && (
            <LinkAtom
              className={styles.cta}
              title={cta.title}
              ariaLabel={cta.title}
              url={cta.url}
              target={cta.target}
              isExternalLink={cta.isExternalLink}
              reference={cta.reference as unknown as ReferenceType}
            />
          )}
        </div>
      </div>
    </section>
  );
}
