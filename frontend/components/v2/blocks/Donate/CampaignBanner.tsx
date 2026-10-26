import classNames from 'classnames'
import type {CampaignBanner as CampaignBannerType} from '@/sanity/types'
import {LinkAtom} from '@/components/atoms/Link'
import {getReferenceWithSlug, isRenderableInternalOrExternalLink, opensInNewTab} from '@/utils/internalOrExternalLink'
import styles from './Donate.module.scss'

/** Yellow campaign strip; nothing shows while it's switched off in Studio. */
export default function CampaignBanner({enabled, heading, text, link}: CampaignBannerType) {
  if (!enabled || !(heading?.trim() || text?.trim())) return null
  const showLink = isRenderableInternalOrExternalLink(link)
  // Opens where Studio's “Open in” says; a new tab gets ↗.
  const newTab = opensInNewTab(link)
  // A trailing arrow in the label is decoration, hidden from screen readers.
  const label = link?.title?.replace(/\s*→\s*$/, '')
  const arrow = label !== link?.title

  return (
    <aside className={styles.banner} aria-label="Campaign">
      <div className={classNames(styles.wrap, styles.bannerInner)}>
        <p className={styles.bannerText}>
          {heading && <strong className={styles.bannerLead}>{heading}</strong>} {text}
        </p>
        {showLink && link && (
          <LinkAtom
            anchor={link.anchor}
            isExternalLink={link.isExternalLink}
            reference={getReferenceWithSlug(link)}
            url={link.url}
            target={newTab ? '_blank' : undefined}
            title={link.title}
            className={styles.bannerLink}
          >
            {label}
            {arrow && <span aria-hidden="true"> →</span>}
            {newTab && <span aria-hidden="true"> ↗</span>}
          </LinkAtom>
        )}
      </div>
    </aside>
  )
}
