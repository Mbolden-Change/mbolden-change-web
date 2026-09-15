import {notFound} from 'next/navigation'
import Grid from '@/components/Grid'
import GridItem from '@/components/GridItem'
import PortableTextComponent from '@/components/PortableTextComponent'
import {getReport} from '@/lib/getReport'
import Link from 'next/link'
import JsonLd from '@/components/JsonLd'
import {
  guardArticle,
  pickGuardedSchemas,
  portableTextToPlain,
  resolvePublishedDate,
} from '@/lib/jsonld'
import styles from './page.module.css'

export default async function ReportPage({
  params,
}: {
  params: Promise<{slug: string}>
}) {
  const slug = (await params).slug
  const report = await getReport(slug)

  if (!report) {
    notFound()
  }

  const path = `/report/${slug}`
  const headline = report.title ?? ''
  const datePublished = resolvePublishedDate(report)
  // BreadcrumbList JSON-LD waits until templates render visible breadcrumbs.
  const jsonLd = pickGuardedSchemas([
    guardArticle({
      headline,
      description: portableTextToPlain(report.text as unknown[]),
      url: path,
      datePublished,
      dateModified: report._updatedAt ?? datePublished,
    }),
  ])

  return (
    <main className="report-container">
      <JsonLd data={jsonLd} />
      <Grid>
        <GridItem desktopOffset={2} desktopSpan={8} mobileSpan={6}>
          <header className={styles[`report-header`]}>
            <h1>{report.title}</h1>
            {/* @ts-ignore */}
            {report.pdfDownload?.url && (
              <Link
                // @ts-ignore
                href={report.pdfDownload.url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles['report-download']}
              >
                📄 Download PDF
              </Link>
            )}
          </header>

          <article className={styles[`report-body`]}>
            <PortableTextComponent value={(report.text as any[]) ?? []} />
          </article>
        </GridItem>
      </Grid>
    </main>
  )
}
