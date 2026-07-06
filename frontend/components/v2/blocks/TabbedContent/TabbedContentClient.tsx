'use client'

import {Fragment, useId, useRef, useState} from 'react'
import type {KeyboardEvent} from 'react'
import classNames from 'classnames'
import {PortableText, type PortableTextComponents} from '@portabletext/react'
import type {PortableTextBlock} from 'next-sanity'
import type {TabsContainer as TabsContainerType} from '@/sanity/types'
import {basePortableTextComponents} from '@/components/PortableTextComponent'
import TextMedia from '@/components/v2/blocks/TextMedia/TextMedia'
import Leadership from '@/components/v2/blocks/Leadership/Leadership'
import styles from './TabbedContent.module.scss'

const tabPortableTextComponents: PortableTextComponents = {
  ...basePortableTextComponents,
  types: {
    ...basePortableTextComponents.types,
    textMedia: ({value}) => <TextMedia {...value} nested headingTag="h4" />,
    leadership: ({value}) => <Leadership {...value} nested headingTag="h4" />,
  },
}

type Tab = TabsContainerType['tabs'][number]

type TabbedContentClientProps = {
  tabs: Tab[]
  defaultTabIndex: number
}

function TabBody({tab}: {tab: Tab}) {
  return (
    <div className={styles.prose}>
      <PortableText
        value={tab.content as PortableTextBlock[]}
        components={tabPortableTextComponents}
      />
    </div>
  )
}

export default function TabbedContentClient({
  tabs,
  defaultTabIndex,
}: TabbedContentClientProps) {
  const [activeIndex, setActiveIndex] = useState(() =>
    defaultTabIndex >= 0 && defaultTabIndex < tabs.length ? defaultTabIndex : 0,
  )
  const baseId = useId()
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])

  const focusTab = (index: number) => {
    const clamped = (index + tabs.length) % tabs.length
    setActiveIndex(clamped)
    tabRefs.current[clamped]?.focus()
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        event.preventDefault()
        focusTab(index + 1)
        break
      case 'ArrowLeft':
      case 'ArrowUp':
        event.preventDefault()
        focusTab(index - 1)
        break
      case 'Home':
        event.preventDefault()
        focusTab(0)
        break
      case 'End':
        event.preventDefault()
        focusTab(tabs.length - 1)
        break
      default:
        break
    }
  }

  const activeTab = tabs[activeIndex]

  return (
    <>
      {/* Desktop: sticky tab bar + the active panel */}
      <div className={styles.tabs}>
        <div className={styles.tabBar} role="tablist" aria-orientation="horizontal">
          {tabs.map((tab, index) => {
            const selected = index === activeIndex
            return (
              <button
                key={tab._key || index}
                type="button"
                role="tab"
                id={`${baseId}-tab-${index}`}
                aria-selected={selected}
                aria-controls={`${baseId}-panel-${index}`}
                tabIndex={selected ? 0 : -1}
                ref={(el) => {
                  tabRefs.current[index] = el
                }}
                className={classNames(styles.tab, selected && styles.tabActive)}
                onClick={() => setActiveIndex(index)}
                onKeyDown={(event) => handleKeyDown(event, index)}
              >
                <span className={styles.tabLabel}>{tab.label}</span>
                <span className={styles.underline} aria-hidden="true" />
              </button>
            )
          })}
        </div>

        {activeTab && (
          <div
            className={styles.tabPanel}
            role="tabpanel"
            id={`${baseId}-panel-${activeIndex}`}
            aria-labelledby={`${baseId}-tab-${activeIndex}`}
          >
            <TabBody tab={activeTab} />
          </div>
        )}
      </div>

      {/* Mobile: accordion */}
      <div className={styles.accordion}>
        {tabs.map((tab, index) => {
          const selected = index === activeIndex
          const headerId = `${baseId}-acc-${index}`
          const panelId = `${baseId}-accpanel-${index}`

          return (
            <Fragment key={tab._key || index}>
              <h3 className={styles.accHeaderWrap}>
                <button
                  type="button"
                  id={headerId}
                  aria-expanded={selected}
                  aria-controls={panelId}
                  className={classNames(styles.accHeader, selected && styles.accHeaderActive)}
                  onClick={() => setActiveIndex(index)}
                >
                  <span className={styles.accLabel}>{tab.label}</span>
                  <span className={styles.chevron} aria-hidden="true" />
                </button>
              </h3>

              <div
                id={panelId}
                role="region"
                aria-labelledby={headerId}
                hidden={!selected}
                className={styles.accPanel}
              >
                <TabBody tab={tab} />
              </div>
            </Fragment>
          )
        })}
      </div>
    </>
  )
}
