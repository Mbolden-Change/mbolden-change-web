import {LinkAtom} from '@/components/atoms/Link'
import styles from './ResourceBanner.module.scss'
import type {ResourceBanner as ResourceBannerType} from '@/sanity/types'
import {getReferenceWithSlug, isRenderableInternalOrExternalLink} from '@/utils/internalOrExternalLink'

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

  return (
    <section
      className={styles.banner}
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
