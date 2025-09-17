'use client';

import React, { useEffect, useRef, useState } from 'react';
import { PortableTextBlock } from 'next-sanity';
import PortableTextComponent from '../../PortableTextComponent';
import ButtonComponent from '@/components/atoms/ButtonComponent';
import styles from './TabbedContent.module.css';

type TabType = {
  _key: string;
  label: string;
  content: PortableTextBlock[];
};

type TabsContainerProps = {
  tabs: TabType[];
  defaultTabIndex: number;
};

export default function TabsContainer({ tabs, defaultTabIndex }: TabsContainerProps) {
  const [activeIndex, setActiveIndex] = useState(defaultTabIndex || 0);

  const navRef = useRef<HTMLDivElement | null>(null);
  // 🔄 store refs to the full buttons, not spans
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const hoveredElRef = useRef<HTMLElement | null>(null);

  if (!tabs || tabs.length === 0) return null;

  // underline helpers
  const setUnderline = (w: number, x: number) => {
    const nav = navRef.current;
    if (!nav) return;
    nav.style.setProperty('--underline-width', `${w}px`);
    nav.style.setProperty('--underline-offset-x', `${x}px`);
  };

  const computeOffsets = (el: HTMLElement) => {
    const nav = navRef.current!;
    const navRect = nav.getBoundingClientRect();
    const elRect  = el.getBoundingClientRect();

    const cs = window.getComputedStyle(nav);
    const paddingLeft = parseFloat(cs.paddingLeft) || 0;
    const borderLeft  = parseFloat(cs.borderLeftWidth) || 0;

    const width  = elRect.width;
    const offsetX = (elRect.left - navRect.left) - paddingLeft - borderLeft;

    return { width, offsetX };
  };

  const positionToEl = (el: HTMLElement | null) => {
    if (!el) return;
    const { width, offsetX } = computeOffsets(el);
    setUnderline(width, offsetX);
  };

  const positionToActive = () => positionToEl(buttonRefs.current[activeIndex] ?? null);

  useEffect(() => {
    positionToActive();
  }, [activeIndex, tabs.length]);

  useEffect(() => {
    const handle = () => {
      if (hoveredElRef.current) positionToEl(hoveredElRef.current);
      else positionToActive();
    };
    window.addEventListener('resize', handle);
    (document as any).fonts?.ready?.then(handle).catch(() => {});
    return () => window.removeEventListener('resize', handle);
  }, [activeIndex]);

  // Handlers
  const onNavLeave = () => {
    hoveredElRef.current = null;
    positionToActive();
  };
  const onButtonEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    hoveredElRef.current = e.currentTarget;
    positionToEl(e.currentTarget);
  };
  const onButtonLeave = () => {
    hoveredElRef.current = null;
  };
  const onButtonFocus = (e: React.FocusEvent<HTMLButtonElement>) => {
    hoveredElRef.current = e.currentTarget;
    positionToEl(e.currentTarget);
  };
  const onButtonBlur = () => {
    hoveredElRef.current = null;
    positionToActive();
  };

  const activeTabContent = tabs[activeIndex]?.content;

  return (
    <section className={styles.tabsFrame}>
      <div className={styles.tabsWrapper}>
        <div className={styles.tabsNavigation}>
          <div
            ref={navRef}
            className={styles.tabsNavInner}
            onMouseLeave={onNavLeave}
            role="tablist"
            aria-orientation="horizontal"
          >
            {tabs.map((tab, i) => (
              <ButtonComponent
                key={tab._key || i}
                ref={(el: HTMLButtonElement | null) => { buttonRefs.current[i] = el; }}
                variant="unstyled"
                className={`${styles.tabButton} ${i === activeIndex ? styles.active : ''}`}
                onClick={() => {
                  setActiveIndex(i);
                  positionToEl(buttonRefs.current[i]);
                }}
                onMouseEnter={onButtonEnter}
                onMouseLeave={onButtonLeave}
                onFocus={onButtonFocus}
                onBlur={onButtonBlur}
                aria-selected={i === activeIndex}
                role="tab"
                tabIndex={i === activeIndex ? 0 : -1}
              >
                {tab.label}
              </ButtonComponent>
            ))}
          </div>
        </div>

        <div className={styles.tabContent}>
          {activeTabContent && <PortableTextComponent value={activeTabContent} />}
        </div>
      </div>
    </section>
  );
}
