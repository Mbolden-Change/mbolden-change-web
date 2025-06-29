"use client";

import Headline from '@/components/atoms/Headline';
import { LogoGarden as LogoGardenType } from '@/sanity/types';
import SanityNextImage from '@/components/SanityNextImage';
import { LinkAtom, ReferenceType } from '@/components/atoms/Link';
import styles from './LogoGarden.module.css';

export default function LogoGarden({ title, logos }: LogoGardenType) {
    const duplicatedLogos = [...logos, ...logos];

    return (
        <section className={styles.logoGardenWrapper}>
            {title && (
                <Headline 
                    tag="h2" 
                    text={title} 
                    className={styles.title}
                />
            )}
            <div className={styles.scrollContainer}>
                <div className={styles.scrollContent}>
                    {duplicatedLogos.map((logo, index) => (
                        <div className={styles.logoItem} key={`${logo._key || index}-${Math.floor(index / logos.length)}`}>
                            <div className={styles.logoWrapper}>
                                <SanityNextImage 
                                    image={logo}
                                    fit="contain"
                                    className={styles.logo}
                                    sizes="(max-width: 768px) 33vw, 20vw"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}