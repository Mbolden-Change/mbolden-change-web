import type {Metadata} from 'next'
import {notFound} from 'next/navigation'
import {getEmployerGuide} from '@/lib/getEmployerGuide'
import {getProgramCaseStudy} from '@/lib/getProgramCaseStudy'
import EmployerGuide from '@/components/v2/resources/EmployerGuide'
import ProgramCaseStudy from '@/components/v2/readyToGrow/ProgramCaseStudy'

/** A Resources page is an employer guide or a case study in the Resources section. */
async function getResource(slug: string) {
  const guide = await getEmployerGuide(slug)
  if (guide) return {kind: 'guide' as const, guide}
  const caseStudy = await getProgramCaseStudy(slug, 'resources')
  return caseStudy ? {kind: 'caseStudy' as const, caseStudy} : null
}

// Tab title, such as "Beyond Compliance | mBOLDen Change".
export async function generateMetadata({
  params,
}: {
  params: Promise<{slug: string}>
}): Promise<Metadata> {
  const resource = await getResource((await params).slug)
  if (!resource) return {}
  if (resource.kind === 'guide') {
    const {title, description} = resource.guide
    return title ? {title, description: description?.trim() || undefined} : {}
  }
  const {name, summary} = resource.caseStudy
  return name ? {title: name, description: summary} : {}
}

export default async function ResourcePage({
  params,
}: {
  params: Promise<{slug: string}>
}) {
  const resource = await getResource((await params).slug)
  if (!resource) notFound()
  if (resource.kind === 'guide') return <EmployerGuide {...resource.guide} />
  return <ProgramCaseStudy {...resource.caseStudy} />
}
