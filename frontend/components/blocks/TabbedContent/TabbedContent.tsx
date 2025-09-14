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

export default function TabsContainer({
  tabs,
  defaultTabIndex,
}: TabsContainerProps) {
  const [activeIndex, setActiveIndex] = useState(defaultTabIndex || 0);
  const tabRefs = useRef<(HTMLDivElement | null)[]>([]);

  if (!tabs || tabs.length === 0) {
    return null;
  }

  const activeTabContent = tabs[activeIndex]?.content;

  return (
    <section className={styles.tabsFrame}>
      <div className={styles.tabsWrapper}>
        <div className={styles.tabsNavigation}>
          <div className={styles.tabsNavInner}>
            {tabs.map((tab, index) => (
              <ButtonComponent
                key={tab._key || index}
                variant="unstyled"
                className={`${styles.tabButton} ${index === activeIndex ? styles.active : ''}`}
                onClick={() => setActiveIndex(index)}
                aria-pressed={index === activeIndex}
                role="tab"
                tabIndex={0}
              >
                {tab.label}
              </ButtonComponent>
            ))}
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
