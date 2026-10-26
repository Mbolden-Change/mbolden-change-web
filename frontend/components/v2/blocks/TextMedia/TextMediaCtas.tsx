'use client';

import classNames from 'classnames';
import SkewButton from '@/components/atoms/SkewButton';
import { isDonateCta, trackDonateClick } from '@/lib/analytics';
import { isSitePath } from '@/utils/internalOrExternalLink';
import styles from './TextMedia.module.scss';

// External giving links (Zeffy, or a "give" / "donate" label) open in a new
// tab on featured pilots so the story stays open behind the form. Paths on
// this site, such as /donate#gateway-fund, stay in the same tab.
const isGiveLink = (cta: Cta) =>
  !isSitePath(cta.link) &&
  (/(^|\.)zeffy\.com/i.test(safeHost(cta.link)) || /\b(give|donate)\b/i.test(cta.label ?? ''));

const safeHost = (link?: string | null) => {
  try {
    return link ? new URL(link).hostname : '';
  } catch {
    return '';
  }
};

type Cta = {
  _key?: string;
  label?: string | null;
  link?: string | null;
  /** Always render as the outline button, even when first. */
  secondary?: boolean;
  /** Open in a new tab (with noopener noreferrer). */
  newTab?: boolean;
};

export default function TextMediaCtas({
  ctas,
  variant = 'standard',
}: {
  ctas: Cta[];
  /** Featured pilots: black outline, accent-colored hover, giving links in a new tab. */
  variant?: 'standard' | 'featured';
}) {
  let linkIndex = 0;

  return (
    <div className={styles.ctas}>
      {ctas.map((cta, index) => {
        if (!cta.link) {
          return (
            <span key={cta._key ?? index} className={styles.infoTag}>
              {cta.label}
            </span>
          );
        }

        const isSecondary = cta.secondary || linkIndex > 0;
        linkIndex += 1;
        const newTab = cta.newTab || (variant === 'featured' && isGiveLink(cta));
        const trackIfDonate = () => {
          if (isDonateCta({ title: cta.label, url: cta.link })) {
            trackDonateClick('text-media');
          }
        };

        if (isSecondary) {
          return (
            <a
              key={cta._key ?? index}
              href={cta.link}
              className={classNames(
                styles.ctaSecondary,
                variant === 'featured' && styles.ctaSecondaryDark,
              )}
              onClick={trackIfDonate}
              target={newTab ? '_blank' : undefined}
              rel={newTab ? 'noopener noreferrer' : undefined}
            >
              {cta.label}
            </a>
          );
        }

        return (
          <SkewButton
            key={cta._key ?? index}
            variant="black"
            href={cta.link}
            className={classNames(
              styles.ctaPrimary,
              variant === 'featured' && styles.ctaPrimaryAccent,
            )}
            onClick={trackIfDonate}
            target={newTab ? '_blank' : undefined}
          >
            {cta.label}
          </SkewButton>
        );
      })}
    </div>
  );
}
