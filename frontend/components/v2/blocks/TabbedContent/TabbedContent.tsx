import classNames from 'classnames'
import type {TabsContainer as TabsContainerType} from '@/sanity/types'
import type {PageBuilderBlockLayoutProps} from '@/lib/pageBuilderLayout'
import {shouldSectionFlushBottom, shouldTabsFlushTop} from '@/lib/pageBuilderLayout'
import TabbedContentClient from './TabbedContentClient'
import styles from './TabbedContent.module.scss'

type TabbedContentProps = TabsContainerType & PageBuilderBlockLayoutProps

export default function TabbedContent({
  tabs,
  defaultTabIndex,
  isLastBlock,
  prevBlockType,
}: TabbedContentProps) {
  if (!tabs || tabs.length === 0) return null

  return (
    <section
      className={classNames(
        styles.section,
        shouldTabsFlushTop(prevBlockType) && styles.flushTop,
        shouldSectionFlushBottom(isLastBlock) && styles.flushBottom,
      )}
      aria-label="Tabbed content"
    >
      <div className={styles.inner}>
        <TabbedContentClient tabs={tabs} defaultTabIndex={defaultTabIndex ?? 0} />
      </div>
    </section>
  )
}
