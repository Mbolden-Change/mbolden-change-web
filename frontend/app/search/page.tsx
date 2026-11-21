import {Suspense} from 'react'
import type {Metadata} from 'next'
import SearchPage from '@/components/search/SearchPage'

// Search results aren't a page for search engines, and it stays out of the sitemap.
export const metadata: Metadata = {
  title: 'Search',
  description: 'Search mBOLDen Change and mBOLDen Action.',
  robots: {index: false, follow: true},
}

/** Full search results: /search?q=cash, or /search?q=cash&group=Our%20Point%20of%20View. */
export default function Page() {
  return (
    <main id="as-main">
      <Suspense fallback={null}>
        <SearchPage />
      </Suspense>
    </main>
  )
}
