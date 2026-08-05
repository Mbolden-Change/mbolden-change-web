'use client';

import SkewButton from '@/components/atoms/SkewButton';
import { isDonateCta, trackDonateClick } from '@/lib/analytics';
import styles from './TextMedia.module.scss';

type Cta = {
  _key?: string;
  label?: string | null;
  link?: string | null;
};

export default function TextMediaCtas({ ctas }: { ctas: Cta[] }) {
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

        const isSecondary = linkIndex > 0;
        linkIndex += 1;
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
              className={styles.ctaSecondary}
              onClick={trackIfDonate}
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
            className={styles.ctaPrimary}
            onClick={trackIfDonate}
          >
            {cta.label}
          </SkewButton>
        );
      })}
    </div>
  );
}
