import {getPage} from '@/lib/getPage'
import styles from './page.module.css'
import {PageBuilder} from '@/components/PageBuilder'
import JsonLd from '@/components/JsonLd'
import {
  collectFaqPairsFromPageBuilder,
  collectSearchSummaries,
  guardFaqPage,
  guardSearchSummaryList,
  pickGuardedSchemas,
  stripSearchSummaries,
} from '@/lib/jsonld'

export default async function Page() {
  const page = await getPage('/')

  if (!page) {
    return <div>Page not found</div>
  }

  const faqPairs = collectFaqPairsFromPageBuilder(
    page.content as Parameters<typeof collectFaqPairsFromPageBuilder>[0],
  )
  const jsonLd = pickGuardedSchemas([
    guardFaqPage(faqPairs, '/'),
    // Pop-up search summaries: JSON-LD only, removed from the blocks below.
    guardSearchSummaryList(collectSearchSummaries(page.content), {title: page.title, path: '/'}),
  ])

  return (
    <div className={styles['page']}>
      <JsonLd data={jsonLd} />
      {page.content && <PageBuilder content={stripSearchSummaries(page.content)} />}
    </div>
  )
}
