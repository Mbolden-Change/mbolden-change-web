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

function ResourceItem({item, titleTag}: {item: ResourceRow; titleTag: 'h3' | 'h4'}) {
  const showLink = isRenderableInternalOrExternalLink(item.link)
  const body = (
    <>
      <span className={styles.date}>{item.date}</span>
      <span>
        {item.label && <p className={styles.kicker}>{item.label}</p>}
        <Headline tag={titleTag} text={item.title} className={styles.title} />
        {item.summary && <p className={styles.summary}>{item.summary}</p>}
      </span>
    </>
  )

  if (showLink && item.link) {
    return (
      <LinkAtom
        anchor={item.link.anchor}
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
  groups,
  surface = 'default',
  prevBlockType,
  isLastBlock,
}: ResourceListProps) {
  const hasGroups = Boolean(groups?.some((group) => group.items?.length))
  if (!title || (!hasGroups && !items?.length)) return null

  const afterStack = prevBlockType === 'stackedEntries'

  return (
    <section
      className={classNames(
        styles.wrapper,
        surface === 'cream' && styles.cream,
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
        {hasGroups ? (
          <div className={styles.groups}>
            {groups?.map((group) =>
              group.items?.length ? (
                <div key={group._key} className={styles.group}>
                  <Headline tag="h3" text={group.title} className={styles.groupTitle} />
                  <ol className={styles.list}>
                    {group.items.map((item, index) => (
                      <li key={item._key || index} className={styles.item}>
                        <ResourceItem item={item} titleTag="h4" />
                      </li>
                    ))}
                  </ol>
                </div>
              ) : null,
            )}
          </div>
        ) : (
          <ol className={styles.list}>
            {items?.map((item, index) => (
              <li key={item._key || index} className={styles.item}>
                <ResourceItem item={item} titleTag="h3" />
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  )
}
