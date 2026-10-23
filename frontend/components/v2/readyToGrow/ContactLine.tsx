import type {AdvancementContact} from '@/lib/getProgramCaseStudy'
import {mailtoHref} from './lanes'

type ContactLineProps = {
  contact?: AdvancementContact
  subject?: string | null
  className?: string
}

/** “Talk with Sue Sutherland, Director of Advancement, at sue@mboldenchange.org.” */
export default function ContactLine({contact, subject, className}: ContactLineProps) {
  if (!contact?.name || !contact.email) return null
  return (
    <p className={className}>
      Talk with <strong>{contact.name}</strong>
      {contact.title ? `, ${contact.title},` : ''} at <a href={mailtoHref(contact.email, subject)}>{contact.email}</a>.
    </p>
  )
}
