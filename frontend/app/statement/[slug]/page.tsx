import type {Metadata} from 'next'
import {notFound} from 'next/navigation'
import {getStatement} from '@/lib/getStatement'
import JsonLd from '@/components/JsonLd'
import {shareMetadata} from '@/lib/siteMetadata'
import StatementPage from '@/components/v2/news/StatementPage'
import {
  guardArticle,
  pickGuardedSchemas,
  portableTextToPlain,
  resolvePublishedDate,
} from '@/lib/jsonld'

/** The search description, or the lead line, or the start of the text. */
function describe(statement: NonNullable<Awaited<ReturnType<typeof getStatement>>>) {
  const plain = portableTextToPlain(statement.text as unknown[])
  return statement.description?.trim() || statement.lead?.trim() || plain.slice(0, 160).trim() || undefined
}

// Tab title, such as "No Tax Justice Without a Just EITC | mBOLDen Change".
export async function generateMetadata({
  params,
}: {
  params: Promise<{slug: string}>
}): Promise<Metadata> {
  const slug = (await params).slug
  const statement = await getStatement(slug)
  if (!statement?.title) return {}
  return shareMetadata(statement.title, describe(statement), `/statement/${slug}`)
}

export default async function StatementRoute({
  params,
}: {
  params: Promise<{slug: string}>
}) {
  const slug = (await params).slug
  const statement = await getStatement(slug)

  if (!statement) {
    notFound()
  }

  const path = `/statement/${slug}`
  const datePublished = resolvePublishedDate(statement)
  // The page shows a back link to News & Statements, not a full trail, so there is no BreadcrumbList.
  const jsonLd = pickGuardedSchemas([
    guardArticle({
      headline: statement.title ?? '',
      description: describe(statement),
      url: path,
      datePublished,
      dateModified: statement._updatedAt ?? datePublished,
    }),
  ])

  return (
    <>
      <JsonLd data={jsonLd} />
      <StatementPage {...statement} slug={slug} />
    </>
  )
}
