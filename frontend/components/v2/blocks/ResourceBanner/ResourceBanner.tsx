import classNames from 'classnames'
import {LinkAtom} from '@/components/atoms/Link'
import styles from './ResourceBanner.module.scss'
import type {ResourceBanner as ResourceBannerType} from '@/sanity/types'
import {getReferenceWithSlug, isRenderableInternalOrExternalLink} from '@/utils/internalOrExternalLink'

/** Mid-luminance brand fills where black/white text both struggle without a scrim. */
const MID_TONE_BACKGROUNDS = new Set([
  'var(--brand-aqua-teal)',
  'var(--brand-fuchsia)',
])

function toRenderableLink(props: ResourceBannerType) {
  const cta = props.cta
  if (cta && isRenderableInternalOrExternalLink(cta)) {
    return {
      title: cta.title,
      isExternalLink: cta.isExternalLink,
      url: cta.url,
      target: cta.target,
      reference: getReferenceWithSlug(cta),
    }
  }
  return undefined
}

const ResourceBanner = (props: ResourceBannerType) => {
  const link = toRenderableLink(props)
  const backgroundColor = props.backgroundColor ?? 'var(--brand-warm-yellow)'
  const textColor = props.textColor ?? 'var(--brand-black)'
  const resourceTypeLabel = props.resourceTypeLabel
  const needsReadabilityScrim = MID_TONE_BACKGROUNDS.has(backgroundColor)
  const isLightText = textColor === 'var(--brand-white)'

  return (
    <section
      className={classNames(
        styles.banner,
        needsReadabilityScrim && styles.bannerScrim,
        needsReadabilityScrim &&
          (isLightText ? styles.bannerScrimDark : styles.bannerScrimLight),
      )}
      style={{backgroundColor, color: textColor}}
      aria-label="Resource banner"
    >
      <div className={styles.content}>
        {resourceTypeLabel && <p className={styles.resourceType}>{resourceTypeLabel}</p>}
        {props.headline && <h3 className={styles.headline}>{props.headline}</h3>}
        {props.body && <p className={styles.body}>{props.body}</p>}
        {link && (
          <LinkAtom
            className={styles.cta}
            ariaLabel={link.title}
            isExternalLink={link.isExternalLink}
            url={link.url}
            target={link.target}
            title={link.title}
            reference={link.reference}
          />
        )}
      </div>
    </section>
  )
}

export default ResourceBanner
