import type {Metadata} from 'next'
import {notFound} from 'next/navigation'
import {PageBuilder} from '@/components/PageBuilder'
import {getPage} from '@/lib/getPage'
import JsonLd from '@/components/JsonLd'
import {
  collectFaqPairsFromPageBuilder,
  guardFaqPage,
  pickGuardedSchemas,
} from '@/lib/jsonld'
import {openGraphFor, twitterFor} from '@/lib/siteMetadata'
import styles from './page.module.css'

// Tab title, such as "What We're Tackling | mBOLDen Change", and the page's
// own description for search results and link previews when it has one.
export async function generateMetadata({
  params,
}: {
  params: Promise<{slug: string}>
}): Promise<Metadata> {
  const slug = (await params).slug
  const page = await getPage(slug)
  if (!page?.title) return {}
  const description = page.description?.trim()
  if (!description) return {title: page.title}
  const title = `${page.title} | mBOLDen Change`
  return {
    title: page.title,
    description,
    openGraph: openGraphFor({title, description, path: `/${slug}`}),
    twitter: twitterFor({title, description}),
  }
}

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
