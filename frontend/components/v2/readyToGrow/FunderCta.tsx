'use client'

import classNames from 'classnames'
import type {CSSProperties} from 'react'
import SkewButton from '@/components/atoms/SkewButton'
import type {AdvancementContact} from '@/lib/getProgramCaseStudy'
import type {FunderCta as FunderCtaType} from '@/sanity/types'
import {useScrollReveal} from '../motion/useScrollReveal'
import ContactLine from './ContactLine'
import {mailtoHref} from './lanes'
import styles from './blocks.module.scss'

/** The page query adds `contact`: the Advancement contact from Site Settings. */
export type FunderCtaProps = FunderCtaType & {contact?: AdvancementContact}

/** Yellow block inviting funders to email the Advancement contact. */
export default function FunderCta({eyebrow, heading, text, buttonLabel = 'Get in Touch', emailSubject, contact}: FunderCtaProps) {
  const {ref, phase} = useScrollReveal<HTMLElement>(0.15)
  if (!heading) return null

  return (
    <section
      ref={ref}
      className={classNames(styles.funder, phase === 'armed' && styles.armed, phase === 'in' && styles.in)}
      aria-label={heading}
    >
      <div className={classNames(styles.wrap, styles.funderGrid)}>
        <div className={styles.head}>
          {eyebrow && (
            <p className={classNames(styles.eyebrow, styles.rv)} style={{'--bar': 'var(--brand-black)'} as CSSProperties}>
              {eyebrow}
            </p>
          )}
          <h2 className={classNames(styles.h2, styles.rv, styles.d1)}>{heading}</h2>
          {text && <p className={classNames(styles.text, styles.rv, styles.d2)}>{text}</p>}
        </div>
        <div className={classNames(styles.actions, styles.rv, styles.d3)}>
          {contact?.email && buttonLabel && (
            <SkewButton variant="black" href={mailtoHref(contact.email, emailSubject)} className={styles.button}>
              {buttonLabel}
            </SkewButton>
          )}
          <ContactLine contact={contact} subject={emailSubject} className={styles.contact} />
        </div>
      </div>
    </section>
  )
}
