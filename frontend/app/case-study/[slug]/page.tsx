import type {Metadata} from 'next'
import {notFound} from 'next/navigation'
import Grid from '@/components/Grid'
import GridItem from '@/components/GridItem'
import {getCaseStudy} from '@/lib/getCaseStudy'
import CaseStudyReport from '@/components/blocks/CaseStudyReport/CaseStudyReport'
import JsonLd from '@/components/JsonLd'
import {
  guardArticle,
  pickGuardedSchemas,
  portableTextToPlain,
  resolvePublishedDate,
} from '@/lib/jsonld'
import styles from './page.module.css'

// Tab title, such as "What We're Tackling | mBOLDen Change".
export async function generateMetadata({
  params,
}: {
  params: Promise<{slug: string}>
}): Promise<Metadata> {
  const caseStudy = await getCaseStudy((await params).slug)
  return caseStudy?.heading ? {title: caseStudy.heading} : {}
}

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<{slug: string}>
}) {
  const slug = (await params).slug
  const caseStudy = await getCaseStudy(slug)
  if (!caseStudy) {
    notFound()
  }

  const path = `/case-study/${slug}`
  const headline = caseStudy.heading ?? ''
  const datePublished = resolvePublishedDate(caseStudy)
  // BreadcrumbList JSON-LD waits until templates render visible breadcrumbs.
  const jsonLd = pickGuardedSchemas([
    guardArticle({
      headline,
      description:
        caseStudy.subheading?.trim() ||
        portableTextToPlain(caseStudy.text as unknown[]),
      url: path,
      datePublished,
      dateModified: caseStudy._updatedAt ?? datePublished,
    }),
  ])

  return (
    <Grid className={styles.caseWrapper}>
      <JsonLd data={jsonLd} />
      <GridItem desktopSpan={12} mobileSpan={12}>
        <CaseStudyReport caseStudyData={caseStudy} />
      </GridItem>
    </Grid>
  )
}
