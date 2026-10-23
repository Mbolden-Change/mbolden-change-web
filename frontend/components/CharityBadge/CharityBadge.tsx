import classNames from 'classnames'
import type {SiteSettings} from '@/sanity/types'
import SanityNextImage from '@/components/SanityNextImage'
import styles from './CharityBadge.module.scss'

export type CharityBadgeData = SiteSettings['charityBadge']

type CharityBadgeProps = {
  badge?: CharityBadgeData | null
  className?: string
  /** The displayed width, for next/image to pick the right file size. */
  sizes: string
}

/**
 * The Charity Navigator badge from Site Settings, as a plain image link: no
 * embed script, so nothing tracks visitors. The width and height come from the
 * file, so the space is reserved before it loads.
 */
export default function CharityBadge({badge, className, sizes}: CharityBadgeProps) {
  if (!badge?.image?.asset?._ref) return null
  const image = {...badge.image, alt: badge.alt ?? ''}
  const img = <SanityNextImage image={image} sizes={sizes} />

  if (!badge.url) return <span className={classNames(styles.badge, className)}>{img}</span>

  return (
    <a
      href={badge.url}
      target="_blank"
      rel="noopener noreferrer"
      className={classNames(styles.badge, className)}
      aria-label={badge.alt ? `${badge.alt} (opens in a new tab)` : undefined}
    >
      {img}
    </a>
  )
}
