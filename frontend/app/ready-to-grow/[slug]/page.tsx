import type {Metadata} from 'next'
import {notFound} from 'next/navigation'
import {getProgramCaseStudy} from '@/lib/getProgramCaseStudy'
import ProgramCaseStudy from '@/components/v2/readyToGrow/ProgramCaseStudy'

// Tab title, such as "Youth Cash Transfer | mBOLDen Change".
export async function generateMetadata({
  params,
}: {
  params: Promise<{slug: string}>
}): Promise<Metadata> {
  const caseStudy = await getProgramCaseStudy((await params).slug)
  if (!caseStudy?.name) return {}
  return {title: caseStudy.name, description: caseStudy.summary}
}

export default async function ReadyToGrowCaseStudyPage({
  params,
}: {
  params: Promise<{slug: string}>
}) {
  const caseStudy = await getProgramCaseStudy((await params).slug)
  if (!caseStudy) notFound()
  return <ProgramCaseStudy {...caseStudy} />
}
