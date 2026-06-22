'use client';

import React, { useEffect, useState, type PointerEvent } from 'react';
import { flushSync } from 'react-dom';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import classNames from 'classnames';
import Grid from './Grid';
import GridItem from './GridItem';
import SanityNextImage from './SanityNextImage';
import { Header as HeaderType } from '@/sanity/types';
import { LinkAtom, ReferenceType, hrefForInternalReference } from './atoms/Link';
import SkewButton from './atoms/SkewButton';
import styles from './Header.module.scss';

type HeaderProps = { headerData: HeaderType };

export default function Header({ headerData }: HeaderProps) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const pathname = usePathname();

  const selectNavLink = (href: string | null) => {
    if (!href) return;
    flushSync(() => {
      setPendingHref(href);
    });
  };

  const handleNavPointerDown = (
    event: PointerEvent<HTMLAnchorElement>,
    href: string | null,
  ) => {
    if (event.button !== 0) return;
    selectNavLink(href);
  };

  const handleNavClick = () => {
    setOpen(false);
  };

  useEffect(() => {
    setPendingHref(null);
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}
    >
      <Grid>
        <GridItem desktopSpan={12} mobileSpan={12}>
          <nav
            role="navigation"
            aria-label="main-navigation"
            className={styles.nav}
          >
            <Link href="/" className={styles.logo} aria-label="Home">
              {headerData.logo && (
                <div className={styles.logoWrapper}>
                  <SanityNextImage
                    image={{ ...headerData.logo, asset: headerData.logo.asset }}
                  />
                </div>
              )}
            </Link>

            <button
              className={`${styles.hamburger} ${open ? styles.hamburgerOpen : ''}`}
              aria-label="Toggle menu"
              aria-expanded={open}
              onClick={() => setOpen(!open)}
            >
              <span className={styles.bar} />
              <span className={styles.bar} />
              <span className={styles.bar} />
            </button>

            <ul className={`${styles.linkList} ${open ? styles.open : ''}`}>
              {headerData.navigationLinks?.map((link, i) => {
                const slug =
                  link.reference && 'slug' in link.reference
                    ? (link.reference as ReferenceType).slug?.current
                    : undefined;
                const href =
                  !link.isExternalLink &&
                  link.reference &&
                  'slug' in link.reference
                    ? hrefForInternalReference(link.reference as ReferenceType)
                    : link.isExternalLink
                      ? link.url ?? null
                      : null;
                const isActive =
                  !link.isExternalLink &&
                  slug &&
                  pathname.startsWith(`/${slug}`);
                const isSelected = Boolean(
                  href && (isActive || pendingHref === href),
                );

                return (
                  <li key={i}>
                    <LinkAtom
                      isExternalLink={link.isExternalLink}
                      reference={
                        link.reference && 'slug' in link.reference
                          ? (link.reference as ReferenceType)
                          : undefined
                      }
                      target={link.target}
                      url={link.url}
                      title={link.title}
                      ariaLabel={link.title}
                      className={classNames(
                        styles.headerLink,
                        isSelected && styles.headerLinkActive,
                      )}
                      onPointerDown={(event) => handleNavPointerDown(event, href)}
                      onClick={handleNavClick}
                    />
                  </li>
                );
              })}

              {headerData.donateCTA && (
                <li>
                  <SkewButton
                    variant="black"
                    isExternalLink={
                      headerData.donateCTA.buttonLink?.isExternalLink
                    }
                    reference={
                      headerData.donateCTA.buttonLink?.reference &&
                      'slug' in headerData.donateCTA.buttonLink.reference
                        ? (headerData.donateCTA.buttonLink
                            .reference as ReferenceType)
                        : undefined
                    }
                    target={headerData.donateCTA.buttonLink?.target}
                    url={headerData.donateCTA.buttonLink?.url}
                    ariaLabel={headerData.donateCTA.buttonLink?.title}
                    className={styles.donateButton}
                    onClick={handleNavClick}
                  >
                    {headerData.donateCTA.text}
                  </SkewButton>
                </li>
              )}
            </ul>
          </nav>
        </GridItem>
      </Grid>
    </header>
  );
}
