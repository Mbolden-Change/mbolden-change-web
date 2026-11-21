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
import SearchIcon from './search/SearchIcon';
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

/** The phone header's Donate button always goes to the Donate page, in the same tab. */
const DONATE_PAGE: ReferenceType = { _type: 'page', slug: { current: 'donate' } };

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
  const menuSearchRef = useRef<HTMLButtonElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
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

  const toggleMenu = () => {
    if (!open) {
      // Have the panel in place before the menu's search field is tapped, so
      // focus lands in its input within the tap and phones bring the keyboard up.
      warmSearch();
      setSearchUsed(true);
    }
    setOpen(!open);
  };

  const focusSearchButton = useCallback(() => {
    // Whichever search control is on screen. On phones the menu (and the
    // search field in it) has closed, so focus goes back to the menu button.
    const button = [desktopSearchRef.current, menuSearchRef.current, menuButtonRef.current].find(
      (candidate) => candidate && candidate.offsetParent !== null && getComputedStyle(candidate).visibility !== 'hidden',
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

            {/* Phones: Donate sits beside the menu button and stays visible when the menu is closed. */}
            <div className={styles.mobileActions}>
              {headerData.donateCTA && (
                <SkewButton
                  variant="black"
                  reference={DONATE_PAGE}
                  className={styles.donateButton}
                  wrapperClassName={styles.mobileDonate}
                  onClick={() => {
                    trackDonateClick('header', { placement: 'mobile-header' });
                    handleNavClick();
                  }}
                >
                  Donate
                </SkewButton>
              )}
              <button
                ref={menuButtonRef}
                className={`${styles.hamburger} ${open ? styles.hamburgerOpen : ''}`}
                aria-label="Toggle menu"
                aria-expanded={open}
                onClick={toggleMenu}
              >
                <span className={styles.bar} />
                <span className={styles.bar} />
                <span className={styles.bar} />
              </button>
            </div>

            <ul className={`${styles.linkList} ${open ? styles.open : ''}`}>
              {/* Phones: first in the open menu. It opens the same search panel as the desktop button. */}
              <li className={styles.menuSearch}>
                <button
                  ref={menuSearchRef}
                  type="button"
                  className={styles.menuSearchField}
                  aria-haspopup="dialog"
                  aria-expanded={searchOpen}
                  onClick={openSearch}
                  onPointerEnter={warmSearch}
                  onFocus={warmSearch}
                >
                  <SearchIcon className={styles.menuSearchIcon} />
                  <span>Search the site</span>
                </button>
              </li>
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

              {/* Phones show Donate in the header row instead. */}
              {headerData.donateCTA && (
                <li className={styles.menuDonate}>
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
