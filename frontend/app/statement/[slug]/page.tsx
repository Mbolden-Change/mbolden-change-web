import {notFound} from 'next/navigation'
import Grid from '@/components/Grid'
import GridItem from '@/components/GridItem'
import PortableTextComponent from '@/components/PortableTextComponent'
import {getStatement} from '@/lib/getStatement'
import Link from 'next/link'
import JsonLd from '@/components/JsonLd'
import {
  guardArticle,
  pickGuardedSchemas,
  portableTextToPlain,
  resolvePublishedDate,
} from '@/lib/jsonld'
import styles from './page.module.css'

export default async function StatementPage({
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
  const headline = statement.title ?? ''
  const datePublished = resolvePublishedDate(statement)
  // BreadcrumbList JSON-LD waits until templates render visible breadcrumbs.
  const jsonLd = pickGuardedSchemas([
    guardArticle({
      headline,
      description: portableTextToPlain(statement.text as unknown[]),
      url: path,
      datePublished,
      dateModified: statement._updatedAt ?? datePublished,
    }),
  ])

  return (
    <main className="statement-container">
      <JsonLd data={jsonLd} />
      <Grid>
        <GridItem desktopOffset={2} desktopSpan={8} mobileSpan={6}>
          <header className={styles[`statement-header`]}>
            <h1>{statement.title}</h1>
            {/* @ts-ignore */}
            {statement.pdfDownload?.url && (
              <Link
                // @ts-ignore
                href={statement.pdfDownload.url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles['statement-download']}
              >
                📄 Download PDF
              </Link>
            )}
          </header>

          <article className={styles[`statement-body`]}>
            <PortableTextComponent value={(statement.text as any[]) ?? []} />
          </article>
        </GridItem>
      </Grid>
    </main>
  )
}
