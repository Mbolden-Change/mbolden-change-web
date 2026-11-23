import type {Metadata} from 'next'
import Link from 'next/link'
import GaEvent from '@/components/GaEvent'
import styles from '@/components/v2/legal/LegalProviders.module.scss'

// Where Jotform sends providers after the Gateway Fund request form. Kept out
// of search engines, the sitemap and site search; nothing links to it.
export const metadata: Metadata = {
  title: 'Thank you',
  robots: {index: false, follow: true},
}

/** Confirmation after a Gateway Fund request. Reads nothing from the address. */
export default function LegalProvidersThankYouPage() {
  return (
    <main className={`${styles.page} ${styles.thanks}`}>
      <GaEvent name="legal_provider_intake_complete" />
      <section className={styles.hero}>
        <div className={styles.wrap}>
          <div className={styles.heroCopy}>
            <h1 className={styles.title}>Thank you.</h1>
            <p className={styles.lead}>We received your request. Our team will follow up by email.</p>
            <p className={styles.contact}>
              <Link href="/legal-providers">Back to Request for Funds</Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}
