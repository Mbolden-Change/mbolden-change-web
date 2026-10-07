import classNames from 'classnames'
import Headline from '@/components/atoms/Headline'
import {LinkAtom} from '@/components/atoms/Link'
import type {PageBuilderBlockLayoutProps} from '@/lib/pageBuilderLayout'
import {
  shouldSectionFlushBottom,
  shouldSectionFlushTop,
} from '@/lib/pageBuilderLayout'
import type {ResourceList as ResourceListType, ResourceListItem} from '@/sanity/types'
import {
  getReferenceWithSlug,
  isRenderableInternalOrExternalLink,
} from '@/utils/internalOrExternalLink'
import styles from './ResourceList.module.scss'

export type ResourceListProps = ResourceListType & PageBuilderBlockLayoutProps

type ResourceRow = {_key: string} & ResourceListItem

function ResourceItem({item}: {item: ResourceRow}) {
  const showLink = isRenderableInternalOrExternalLink(item.link)
  const body = (
    <>
      <span className={styles.date}>{item.date}</span>
      <span>
        {item.label && <p className={styles.kicker}>{item.label}</p>}
        <Headline tag="h3" text={item.title} className={styles.title} />
        {item.summary && <p className={styles.summary}>{item.summary}</p>}
      </span>
    </>
  )

  if (showLink && item.link) {
    return (
      <LinkAtom
        className={classNames(styles.row, styles.rowLink)}
        title={item.link.title || item.title}
        isExternalLink={item.link.isExternalLink}
        url={item.link.url}
        target={item.link.target}
        reference={getReferenceWithSlug(item.link)}
      >
        {body}
      </LinkAtom>
    )
  }

  return <div className={styles.row}>{body}</div>
}

export default function ResourceList({
  eyebrow,
  title,
  description,
  items,
  prevBlockType,
  isLastBlock,
}: ResourceListProps) {
  if (!title || !items?.length) return null

  const afterStack = prevBlockType === 'stackedEntries'

  return (
    <section
      className={classNames(
        styles.wrapper,
        afterStack && styles.afterStack,
        shouldSectionFlushTop(prevBlockType) && !afterStack && styles.flushTop,
        shouldSectionFlushBottom(isLastBlock) && styles.flushBottom,
      )}
      aria-label={title}
    >
      <div className={styles.inner}>
        <div className={styles.intro}>
          {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
          <Headline tag="h2" text={title} className={styles.heading} />
          {description && <p className={styles.introText}>{description}</p>}
        </div>
        <ol className={styles.list}>
          {items.map((item, index) => (
            <li key={item._key || index} className={styles.item}>
              <ResourceItem item={item} />
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
