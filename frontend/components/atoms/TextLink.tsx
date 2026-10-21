import classNames from 'classnames'
import {LinkAtom} from './Link'
import type {InternalOrExternalLink} from '@/sanity/types'
import {getReferenceWithSlug, isRenderableInternalOrExternalLink} from '@/utils/internalOrExternalLink'
import styles from './TextLink.module.scss'

type TextLinkProps = {
  link: InternalOrExternalLink
  color?: 'fuchsia' | 'black' | 'white'
  arrow?: boolean
  ariaLabel?: string
  className?: string
}

/** Shared text CTA; destination handling stays in LinkAtom. */
export default function TextLink({link, color = 'fuchsia', arrow = false, ariaLabel, className}: TextLinkProps) {
  if (!isRenderableInternalOrExternalLink(link)) return null
  return <LinkAtom {...link} reference={getReferenceWithSlug(link)} ariaLabel={ariaLabel}
    className={classNames(styles.link, styles[color], className)}>
    <span className={styles.label}>{link.title}</span>
    {arrow && <span className={styles.arrow} aria-hidden="true">→</span>}
  </LinkAtom>
}
