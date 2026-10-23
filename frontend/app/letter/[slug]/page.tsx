import type {Metadata} from 'next'
import {notFound} from 'next/navigation'
import {getLetter} from '@/lib/getLetter'
import JsonLd from '@/components/JsonLd'
import {shareMetadata} from '@/lib/siteMetadata'
import LetterPage from '@/components/v2/news/LetterPage'
import {guardArticle, pickGuardedSchemas} from '@/lib/jsonld'

// Tab title, such as "Support for AB 1357: Guaranteed Income Without Losing Benefits | mBOLDen Change".
export async function generateMetadata({
  params,
}: {
  params: Promise<{slug: string}>
}): Promise<Metadata> {
  const slug = (await params).slug
  const letter = await getLetter(slug)
  if (!letter?.title) return {}
  return shareMetadata(letter.title, letter.summary?.trim() || undefined, `/letter/${slug}`)
}

export default async function LetterRoute({
  params,
}: {
  params: Promise<{slug: string}>
}) {
  const slug = (await params).slug
  const letter = await getLetter(slug)
  if (!letter) notFound()

  const jsonLd = pickGuardedSchemas([
    guardArticle({
      headline: letter.title ?? '',
      description: letter.summary,
      url: `/letter/${slug}`,
      datePublished: letter.date,
      dateModified: letter._updatedAt ?? letter.date,
    }),
  ])

  return (
    <>
      <JsonLd data={jsonLd} />
      <LetterPage {...letter} slug={slug} />
    </>
  )
}
