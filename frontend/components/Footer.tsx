import React from 'react';
import type { Footer as FooterType } from '@/sanity/types';
import styles from './Footer.module.css';
import Grid from './Grid';
import GridItem from './GridItem';
import Headline from './atoms/Headline';
import { LinkAtom } from './atoms/Link';
import { ReferenceType } from './atoms/Link';
import SanityNextImage from './SanityNextImage';
import { SocialIcon } from 'react-social-icons';
import ButtonComponent from './atoms/ButtonComponent';
import FooterStructuredData from './FooterStructuredData';


type FooterProps = {
  footerData: FooterType;
};

const Footer = ({ footerData }: FooterProps) => {
  const yearString = new Date().getFullYear().toString();

  // some fields are added in the GROQ query (primaryLogoUrl, resolvedUrl on links/social)
  // but the generated types may not include them. Use a small local cast to safely access
  // those runtime properties without widening the public types globally.
  const footerAny = footerData as any;
  const orgName = footerAny?.organizationInfo?.name || footerAny?.title || 'Site logo';
  type SocialLink = { _key: string; url: string; resolvedUrl?: string };

// // DEBUG (dev only): inspect primaryLogo shape and fallback to direct URL if available
// if (process.env.NODE_ENV === 'development') {
//    // eslint-disable-next-line no-console
//    console.log('Footer data primaryLogo:', footerAny?.primaryLogo);
//  }


  if (Array.isArray(footerData)) {
    return null;
  }

  return (
    <>
    <footer className={styles.footer}>
      <div className={styles.container}>
        <Grid>
          <GridItem desktopSpan={3} mobileSpan={6}>
            <div className={styles.organizationColumn}>
              {footerData.primaryLogo && (
                <div className={styles.logoWrapper}>
                  <SanityNextImage image={footerData.primaryLogo} sizes="196" />
                </div>
              )}
              {/* {footerData.primaryLogo ? (
                <div className={styles.logoWrapper}>
                  <SanityNextImage image={footerData.primaryLogo} sizes="196" />
                </div>
              ) : footerAny?.primaryLogoUrl ? (
                <div className={styles.logoWrapper}>
                  <img src={footerAny.primaryLogoUrl} alt={orgName} style={{maxWidth: '196px'}} />
                </div>
              ) : null} */}
              {footerData.organizationInfo && (
                <div className={styles.textBlock}>
                  <address className={styles.addressBlock}>
                    <div className={styles.addressLines}>
                      {footerData.organizationInfo.address
                        ?.split('\n')
                        .map((line, idx) => (
                          <p key={`address-${idx}`}>{line}</p>
                        ))}
                    </div>

                    <div className={styles.contactLines}>
                      {footerData.organizationInfo.contact
                        ?.split('\n')
                        .map((line, idx) => {
                          if (line.includes('@')) {
                            return (
                              <a key={`email-${idx}`} href={`mailto:${line}`}>
                                {line}
                              </a>
                            );
                          } else {
                            return (
                              <a
                                key={`phone-${idx}`}
                                href={`tel:${line.replace(/\D/g, '')}`}
                              >
                                {line}
                              </a>
                            );
                          }
                        })}
                    </div>
                  </address>
                </div>
              )}
            </div>
          </GridItem>
          {footerData.columnCategories?.map((category) => (
            <GridItem key={category._key} desktopSpan={3} mobileSpan={6}>
              <div className={styles['column']}>
                <Headline
                  text={category.title || ''}
                  className={styles['category-title']}
                  tag="h3"
                />
                {category.links?.map((link: any) => (
                  <LinkAtom
                    key={link._key}
                    isExternalLink={link.isExternalLink}
                    url={link.url}
                    reference={link.reference as ReferenceType}
                    className={styles['footer-link']}
                    ariaLabel={link.title || 'Untitled'}
                    title={link.title}
                  />
                ))}
              </div>
            </GridItem>
          ))}
          {footerData.socialLinks && footerData.socialLinks.length > 0 && (
            <GridItem desktopSpan={3} mobileSpan={6}>
              <div className={styles.column}>
                <h3 className={styles['category-title']}>Connect with us</h3>
                <div className={styles['footer-social-container']}>
                  {footerData.socialLinks.map((social) => (
                    <div
                      className={styles['social-icon-wrapper']}
                      key={social._key}
                    >
                      <SocialIcon
                        url={social.url}
                        bgColor="transparent"
                        fgColor="#fff"
                        style={{ height: 40, width: 40 }}
                        target="_blank"
                        rel="noopener noreferrer"
                      />
                    </div>
                  ))}
                </div>

                <div className={styles['footer-newsletter-container']}>
                  {footerData.newsletterButton && (
                    <ButtonComponent
                    variant="unstyled"
                    link={footerData.newsletterButton}
                    className={styles.newsletterButton}
                    />
                  )}
                </div>

              </div>
            </GridItem>
          )}
          <GridItem desktopSpan={12} mobileSpan={6}>
            <div className={styles.footerBottomRow}>
              {footerData.organizationInfo && (
                <p className={styles.ein}>
                  {footerData.organizationInfo.nonProfitDisclaimer}
                </p>
              )}
              <p className={styles.copyright}>
                © {yearString} mBOLDen Change. All rights reserved.
              </p>
            </div>
          </GridItem>
        </Grid>
      </div>
    </footer>
    <FooterStructuredData
        footer={footerData}
        siteUrl={'https://www.mboldenchange.org/'}
        />
    </>
  );
};

export default Footer;
