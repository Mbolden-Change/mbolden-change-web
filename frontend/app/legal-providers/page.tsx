import type {Metadata} from 'next'
import JotformEmbed from '@/components/v2/legal/JotformEmbed'
import styles from '@/components/v2/legal/LegalProviders.module.scss'
import {shareMetadata} from '@/lib/siteMetadata'

const EMAIL = 'gatewayfund@mboldenchange.org'

export const metadata: Metadata = shareMetadata(
  'Request for Funds',
  'Request Gateway Fund support for SIJS filing fees. For nonprofit legal service providers, legal services networks and law firms.',
  '/legal-providers',
)

/** The Gateway Fund request form for legal providers. Not in the menu; linked from the homepage and What We're Tackling. */
export default function LegalProvidersPage() {
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.wrap}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>The Gateway Fund</p>
            <h1 className={styles.title}>Request for Funds</h1>
            <p className={styles.lead}>
              For nonprofit legal service providers, legal services networks and law firms handling SIJS cases.
            </p>
            <p className={styles.contact}>
              Questions or need an access code? Email <a href={`mailto:${EMAIL}`}>{EMAIL}</a>.
            </p>
          </div>
        </div>
      </section>
      <section className={styles.formSection}>
        <div className={styles.wrap}>
          <JotformEmbed formId="262365769798077" title="Gateway Fund request for funds" />
          <p className={styles.credit}>The Gateway Fund is supported by a grant from the San Francisco Foundation.</p>
        </div>
      </section>
    </main>
  )
}
