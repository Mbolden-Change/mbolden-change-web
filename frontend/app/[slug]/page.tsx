import {notFound} from 'next/navigation'
import {PageBuilder} from '@/components/PageBuilder'
import {getPage} from '@/lib/getPage'
import JsonLd from '@/components/JsonLd'
import {
  collectFaqPairsFromPageBuilder,
  guardFaqPage,
  pickGuardedSchemas,
} from '@/lib/jsonld'
import styles from './page.module.css'

export default async function Page({
  params,
}: {
  params: Promise<{slug: string}>
}) {
  const slug = (await params).slug
  const page = await getPage(slug)
  if (!page) {
    notFound()
  }

  const path = `/${slug}`
  const faqPairs = collectFaqPairsFromPageBuilder(
    page.content as Parameters<typeof collectFaqPairsFromPageBuilder>[0],
  )
  // BreadcrumbList JSON-LD waits until templates render visible breadcrumbs.
  const jsonLd = pickGuardedSchemas([guardFaqPage(faqPairs, path)])

  return (
    <div className={styles.page}>
      <JsonLd data={jsonLd} />
      {page.content && <PageBuilder content={page.content} />}
    </div>
  )
}
