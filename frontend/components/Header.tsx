'use client';

import React, { useCallback, useEffect, useRef, useState, type PointerEvent } from 'react';
import { flushSync } from 'react-dom';
import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import classNames from 'classnames';
import Grid from './Grid';
import GridItem from './GridItem';
import SanityNextImage from './SanityNextImage';
import { Header as HeaderType } from '@/sanity/types';
import { LinkAtom, ReferenceType, hrefForInternalReference } from './atoms/Link';
import SkewButton from './atoms/SkewButton';
import { trackDonateClick } from '@/lib/analytics';
import { opensInNewTab } from '@/utils/internalOrExternalLink';
import SearchButton from './search/SearchButton';
import { preloadSearch } from '@/lib/search/client';
import styles from './Header.module.scss';

// The panel and the search library load the first time search is opened.
const loadSearchPanel = () => import('./search/SearchPanel');
const SearchPanel = dynamic(loadSearchPanel, { ssr: false });

/** The /search page has its own search box; the header button goes to it. */
const SEARCH_PAGE = '/search';
const SEARCH_PAGE_INPUT_ID = 'site-search-input';

const isTyping = (target: EventTarget | null) => {
  const element = target as HTMLElement | null;
  return Boolean(
    element?.closest?.('input, textarea, select, [contenteditable=""], [contenteditable="true"], [role="textbox"]'),
  );
};

/** Pages outside a menu item's path that still belong to it, such as News & Statements under Resources. */
const SECTION_ALIASES: Record<string, string[]> = {
  resources: ['news', 'statement', 'letter'],
};

type HeaderProps = { headerData: HeaderType };

export default function Header({ headerData }: HeaderProps) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  // The panel isn't rendered (or downloaded) until search is first opened.
  const [searchUsed, setSearchUsed] = useState(false);
  const desktopSearchRef = useRef<HTMLButtonElement>(null);
  const mobileSearchRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();

  const warmSearch = useCallback(() => {
    void loadSearchPanel();
    preloadSearch();
  }, []);

  const openSearch = useCallback(() => {
    if (window.location.pathname === SEARCH_PAGE) {
      document.getElementById(SEARCH_PAGE_INPUT_ID)?.focus();
      return;
    }
    setOpen(false);
    setSearchUsed(true);
    setSearchOpen(true);
  }, []);

  const closeSearch = useCallback(() => setSearchOpen(false), []);

  const focusSearchButton = useCallback(() => {
    // Whichever search button is on screen.
    const button = [desktopSearchRef.current, mobileSearchRef.current].find(
      (candidate) => candidate && candidate.offsetParent !== null,
    );
    button?.focus();
  }, []);

  // "/" opens search, unless someone is typing or another pop-up is open.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== '/' || event.metaKey || event.ctrlKey || event.altKey) return;
      if (isTyping(event.target) || document.querySelector('dialog[open]')) return;
      event.preventDefault();
      openSearch();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [openSearch]);

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
    setSearchOpen(false);
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

            {/* Phones: search sits beside the menu button and stays visible when the menu is closed. */}
            <div className={styles.mobileActions}>
              <SearchButton
                ref={mobileSearchRef}
                expanded={searchOpen}
                onOpen={openSearch}
                onIntent={warmSearch}
              />
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
            </div>

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
                  (pathname.startsWith(`/${slug}`) ||
                    SECTION_ALIASES[slug]?.some(
                      (path) => pathname === `/${path}` || pathname.startsWith(`/${path}/`),
                    ));
                const isSelected = Boolean(
                  href && (isActive || pendingHref === href),
                );
                const opensNewTab = opensInNewTab(link);

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
                      ariaLabel={
                        opensNewTab
                          ? `${link.title} (opens in a new tab)`
                          : link.title
                      }
                      className={classNames(
                        styles.headerLink,
                        isSelected && styles.headerLinkActive,
                      )}
                      onPointerDown={(event) => handleNavPointerDown(event, href)}
                      onClick={handleNavClick}
                    >
                      {opensNewTab ? (
                        <>
                          {link.title}{' '}
                          <span aria-hidden="true">↗</span>
                        </>
                      ) : undefined}
                    </LinkAtom>
                  </li>
                );
              })}

              {/* Desktop: between the last link and Donate. */}
              <li className={styles.desktopSearch}>
                <SearchButton
                  ref={desktopSearchRef}
                  expanded={searchOpen}
                  onOpen={openSearch}
                  onIntent={warmSearch}
                />
              </li>

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
                    onClick={() => {
                      trackDonateClick('header');
                      handleNavClick();
                    }}
                  >
                    {headerData.donateCTA.text}
                  </SkewButton>
                </li>
              )}
            </ul>
          </nav>
        </GridItem>
      </Grid>
      {searchUsed && <SearchPanel open={searchOpen} onClose={closeSearch} onClosed={focusSearchButton} />}
    </header>
  );
}
