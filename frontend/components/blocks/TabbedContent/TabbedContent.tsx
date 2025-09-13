'use client';

import React, { useState, useRef } from 'react';
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
  const [hoverDirection, setHoverDirection] = useState<{[key: number]: 'left' | 'right' | null}>({});
  const [leavingDirection, setLeavingDirection] = useState<{[key: number]: 'left' | 'right' | null}>({});
  const tabRefs = useRef<(HTMLDivElement | null)[]>([]);

  const handleMouseEnter = (index: number, e: React.MouseEvent<HTMLDivElement>) => {
    const { left, right } = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX;
    const direction = mouseX - left < right - mouseX ? 'left' : 'right';
    setHoverDirection((prev) => ({ ...prev, [index]: direction }));
    setLeavingDirection((prev) => ({ ...prev, [index]: null }));
  };

  const handleMouseLeave = (index: number, e: React.MouseEvent<HTMLDivElement>) => {
    const { left, right } = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX;
    const direction = mouseX - left < right - mouseX ? 'left' : 'right';
    setLeavingDirection((prev) => ({ ...prev, [index]: direction }));
    setHoverDirection((prev) => ({ ...prev, [index]: null }));

    const btn = tabRefs.current[index];
    if (btn) {
      const handleTransitionEnd = () => {
        setLeavingDirection(prev => ({ ...prev, [index]: null }));
        setHoverDirection(prev => ({ ...prev, [index]: null }));
        btn.removeEventListener('transitionend', handleTransitionEnd);
      };
      btn.addEventListener('transitionend', handleTransitionEnd);
    }
  };

  if (!tabs || tabs.length === 0) {
    return null;
  }

  const activeTabContent = tabs[activeIndex]?.content;

  return (
    <section className={styles.tabsFrame}>
      <div className={styles.tabsWrapper}>
        <div className={styles.tabsNavigation}>
          <div className={styles.tabsNavInner}>
            {tabs.map((tab, index) => {
              let directionClass = '';
              if (hoverDirection[index]) {
                directionClass = hoverDirection[index] === 'left' ? styles.fromLeft : styles.fromRight;
              } else if (leavingDirection[index]) {
                directionClass = leavingDirection[index] === 'left' ? styles.fromLeft : styles.fromRight;
              }
              return (
                <ButtonComponent
                  key={tab._key || index}
                  variant="unstyled"
                  className={`${styles.tabButton} ${index === activeIndex ? styles.active : ''} ${directionClass}`}
                  onClick={() => setActiveIndex(index)}
                  aria-pressed={index === activeIndex}
                  role="tab"
                  tabIndex={0}
                >
                  <div
                    ref={el => { tabRefs.current[index] = el; }}
                    onMouseEnter={e => handleMouseEnter(index, e)}
                    onMouseLeave={e => handleMouseLeave(index, e)}
                    style={{ display: 'inline-block', width: '100%' }}
                  >
                    {tab.label}
                  </div>
                </ButtonComponent>
              );
            })}
          </div>
        </div>
        <div className={styles.tabContent}>
          {activeTabContent && (
            <PortableTextComponent value={activeTabContent} />
          )}
        </div>
      </div>
    </section>
  );
}
