"use client";

import Headline from '@/components/atoms/Headline';
import { LogoGarden as LogoGardenType } from '@/sanity/types';
import SanityNextImage from '@/components/SanityNextImage';
import styles from './LogoGarden.module.css';

export default function LogoGarden({ title, logos, layout, secondRowLogos }: LogoGardenType) {
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
                <div className={styles.scrollContentRow1}>
                    <div className={styles.group}>
                        {logos.map((logo, index) => (
                            logo.link && logo.link.isExternalLink && logo.link.url ? (
                                <a
                                    href={logo.link.url}
                                    target={logo.link.target || '_self'}
                                    rel="noopener noreferrer"
                                    className={styles.logoItem}
                                    key={`${logo._key || index}-original`}
                                >
                                    <div className={styles.logoWrapper}>
                                        <SanityNextImage 
                                            image={logo}
                                            fit="contain"
                                            className={styles.logo}
                                            sizes="(max-width: 768px) 33vw, 20vw"
                                        />
                                    </div>
                                </a>
                            ) : (
                                <div className={styles.logoItem} key={`${logo._key || index}-original`}>
                                    <div className={styles.logoWrapper}>
                                        <SanityNextImage 
                                            image={logo}
                                            fit="contain"
                                            className={styles.logo}
                                            sizes="(max-width: 768px) 33vw, 20vw"
                                        />
                                    </div>
                                </div>
                            )
                        ))}
                    </div>
                    
                    <div className={styles.group} aria-hidden="true">
                        {logos.map((logo, index) => (
                            logo.link && logo.link.isExternalLink && logo.link.url ? (
                                <a
                                    href={logo.link.url}
                                    target={logo.link.target || '_self'}
                                    rel="noopener noreferrer"
                                    className={styles.logoItem}
                                    key={`${logo._key || index}-duplicate`}
                                >
                                    <div className={styles.logoWrapper}>
                                        <SanityNextImage 
                                            image={logo}
                                            fit="contain"
                                            className={styles.logo}
                                            sizes="(max-width: 768px) 33vw, 20vw"
                                        />
                                    </div>
                                </a>
                            ) : (
                                <div className={styles.logoItem} key={`${logo._key || index}-duplicate`}>
                                    <div className={styles.logoWrapper}>
                                        <SanityNextImage 
                                            image={logo}
                                            fit="contain"
                                            className={styles.logo}
                                            sizes="(max-width: 768px) 33vw, 20vw"
                                        />
                                    </div>
                                </div>
                            )
                        ))}
                    </div>
                </div>

                {layout === 'double' && secondRowLogos && (
                    <div className={styles.scrollContentRow2}>
                        <div className={styles.group}>
                            {secondRowLogos.map((logo, index) => (
                                logo.link && logo.link.isExternalLink && logo.link.url ? (
                                    <a
                                        href={logo.link.url}
                                        target={logo.link.target || '_self'}
                                        rel="noopener noreferrer"
                                        className={styles.logoItem}
                                        key={`${logo._key || index}-row2-original`}
                                    >
                                        <div className={styles.logoWrapper}>
                                            <SanityNextImage 
                                                image={logo}
                                                fit="contain"
                                                className={styles.logo}
                                                sizes="(max-width: 768px) 33vw, 20vw"
                                            />
                                        </div>
                                    </a>
                                ) : (
                                    <div className={styles.logoItem} key={`${logo._key || index}-row2-original`}>
                                        <div className={styles.logoWrapper}>
                                            <SanityNextImage 
                                                image={logo}
                                                fit="contain"
                                                className={styles.logo}
                                                sizes="(max-width: 768px) 33vw, 20vw"
                                            />
                                        </div>
                                    </div>
                                )
                            ))}
                        </div>
                        
                        <div className={styles.group} aria-hidden="true">
                            {secondRowLogos.map((logo, index) => (
                                logo.link && logo.link.isExternalLink && logo.link.url ? (
                                    <a
                                        href={logo.link.url}
                                        target={logo.link.target || '_self'}
                                        rel="noopener noreferrer"
                                        className={styles.logoItem}
                                        key={`${logo._key || index}-row2-duplicate`}
                                    >
                                        <div className={styles.logoWrapper}>
                                            <SanityNextImage 
                                                image={logo}
                                                fit="contain"
                                                className={styles.logo}
                                                sizes="(max-width: 768px) 33vw, 20vw"
                                            />
                                        </div>
                                    </a>
                                ) : (
                                    <div className={styles.logoItem} key={`${logo._key || index}-row2-duplicate`}>
                                        <div className={styles.logoWrapper}>
                                            <SanityNextImage 
                                                image={logo}
                                                fit="contain"
                                                className={styles.logo}
                                                sizes="(max-width: 768px) 33vw, 20vw"
                                            />
                                        </div>
                                    </div>
                                )
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}