'use client'

import {useState} from 'react'
import classNames from 'classnames'
import type {GetInTouch as GetInTouchType} from '@/sanity/types'
import SkewButton from '@/components/atoms/SkewButton'
import ActionNetworkModal from '@/components/blocks/ActionNetworkModal/ActionNetworkModal'
import {isDonateCta, trackDonateClick} from '@/lib/analytics'
import {isRenderableInternalOrExternalLink} from '@/utils/internalOrExternalLink'
import CharityBadge, {type CharityBadgeData} from '@/components/CharityBadge/CharityBadge'
import {useScrollReveal} from '../../motion/useScrollReveal'
import styles from './GetInTouch.module.scss'

/** The page query adds `contact` (the Footer's Organization info) and `charityBadge` (Site Settings). */
export type GetInTouchProps = GetInTouchType & {
  contact?: {address?: string | null; contact?: string | null} | null
  charityBadge?: CharityBadgeData | null
}

/** Contact band: text, Donate and newsletter buttons, and a contact card. */
export default function GetInTouch({
  eyebrow,
  heading,
  text,
  donateLink,
  newsletterLabel,
  showCharityBadge,
  contact,
  charityBadge,
}: GetInTouchProps) {
  const {ref, phase} = useScrollReveal<HTMLElement>(0.15)
  const [newsletterOpen, setNewsletterOpen] = useState(false)

  if (!heading) return null

  const lines = contact?.contact?.split('\n').map((line) => line.trim()).filter(Boolean) ?? []
  const email = lines.find((line) => line.includes('@'))
  const phone = lines.find((line) => !line.includes('@'))
  const address = contact?.address?.split('\n').map((line) => line.trim()).filter(Boolean) ?? []
  const showDonate = isRenderableInternalOrExternalLink(donateLink) && donateLink?.title

  return (
    <section
      ref={ref}
      className={classNames(styles.wrapper, phase === 'armed' && styles.armed, phase === 'in' && styles.in)}
      aria-label={heading}
    >
      <div className={styles.inner}>
        <div className={styles.copy}>
          {eyebrow && <p className={classNames(styles.eyebrow, styles.rv)}>{eyebrow}</p>}
          <h2 className={classNames(styles.heading, styles.rv, styles.d1)}>{heading}</h2>
          {text && <p className={classNames(styles.text, styles.rv, styles.d2)}>{text}</p>}
          {(showDonate || newsletterLabel) && (
            <div className={classNames(styles.buttons, styles.rv, styles.d3)}>
              {showDonate && donateLink && (
                <SkewButton
                  variant="black"
                  link={donateLink}
                  className={styles.donate}
                  onClick={() => {
                    if (isDonateCta(donateLink)) trackDonateClick('get-in-touch')
                  }}
                >
                  {donateLink.title}
                </SkewButton>
              )}
              {newsletterLabel && (
                <button type="button" className={styles.newsletter} onClick={() => setNewsletterOpen(true)}>
                  {newsletterLabel}
                </button>
              )}
            </div>
          )}
          {showCharityBadge && (
            <CharityBadge
              badge={charityBadge}
              className={classNames(styles.badge, styles.rv, styles.d4)}
              sizes="96px"
            />
          )}
        </div>

        {(email || phone || address.length > 0) && (
          <dl className={classNames(styles.card, styles.rv, styles.d2)}>
            {email && (
              <div className={styles.entry}>
                <dt>Email</dt>
                <dd>
                  <a href={`mailto:${email}`}>{email}</a>
                </dd>
              </div>
            )}
            {phone && (
              <div className={styles.entry}>
                <dt>Phone</dt>
                <dd>
                  <a href={`tel:${phone.replace(/\D/g, '')}`}>{phone}</a>
                </dd>
              </div>
            )}
            {address.length > 0 && (
              <div className={styles.entry}>
                <dt>Mailing address</dt>
                <dd>
                  {address.map((line, index) => (
                    <span key={index} className={styles.addressLine}>
                      {line}
                    </span>
                  ))}
                </dd>
              </div>
            )}
          </dl>
        )}
      </div>
      <ActionNetworkModal
        isOpen={newsletterOpen}
        onClose={() => setNewsletterOpen(false)}
        location="get-in-touch"
      />
    </section>
  )
}
