import classNames from 'classnames'
import type {CampaignBanner as CampaignBannerType} from '@/sanity/types'
import {LinkAtom} from '@/components/atoms/Link'
import {getReferenceWithSlug, isRenderableInternalOrExternalLink} from '@/utils/internalOrExternalLink'
import styles from './Donate.module.scss'

/** Yellow campaign strip; nothing shows while it's switched off in Studio. */
export default function CampaignBanner({enabled, heading, text, link}: CampaignBannerType) {
  if (!enabled || !(heading?.trim() || text?.trim())) return null
  const showLink = isRenderableInternalOrExternalLink(link)
  const external = Boolean(link?.isExternalLink)

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
            target={external ? '_blank' : link.target}
            title={link.title}
            className={styles.bannerLink}
          >
            {link.title}
            {external && <span aria-hidden="true"> ↗</span>}
          </LinkAtom>
        )}
      </div>
    </aside>
  )
}
