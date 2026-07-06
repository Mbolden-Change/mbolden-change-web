import classNames from 'classnames'
import type {PageHeader as PageHeaderType} from '@/sanity/types'
import type {PageBuilderBlockLayoutProps} from '@/lib/pageBuilderLayout'
import styles from './PageHeader.module.scss'

type PageHeaderProps = PageHeaderType & PageBuilderBlockLayoutProps

export default function PageHeader({
  eyebrow,
  heading,
  dek,
  align = 'left',
  isFirstBlock,
}: PageHeaderProps) {
  if (!heading) return null

  return (
    <section
      className={classNames(
        styles.wrapper,
        align === 'center' && styles.center,
        isFirstBlock && styles.first,
      )}
    >
      <div className={styles.inner}>
        {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
        <h1 className={styles.heading}>{heading}</h1>
        {dek && <p className={styles.dek}>{dek}</p>}
      </div>
    </section>
  )
}
