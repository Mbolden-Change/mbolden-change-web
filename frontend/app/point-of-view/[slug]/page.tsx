import type {Metadata} from 'next'
import {notFound} from 'next/navigation'
import JsonLd from '@/components/JsonLd'
import PostPage from '@/components/v2/pointOfView/PostPage'
import {DEFAULT_SHARE_IMAGE, ORG_ID, ORG_NAME, SITE_ORIGIN, WEBSITE_ID} from '@/lib/jsonld'
import {openGraphFor, twitterFor} from '@/lib/siteMetadata'
import {canonicalPostUrl} from '@/lib/substackPosts/config'
import {sitePostPath} from '@/lib/substackPosts/core'
import {archivedSlugs, getAllPosts, getPost, morePosts, toPostCard, type SubstackPost} from '@/lib/substackPosts/posts'

// Archived posts are built ahead of time. A post that is only in the feed so
// far is built the first time someone opens it. Pages refresh hourly, like
// the feed (FEED_REVALIDATE_SECONDS; Next.js needs a plain number here).
export const revalidate = 3600
export const dynamicParams = true

export function generateStaticParams() {
  return archivedSlugs().map((slug) => ({slug}))
}

type Props = {params: Promise<{slug: string}>}

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {slug} = await params
  const post = await getPost(slug)
  if (!post) return {}
  const description = post.subtitle || post.excerpt
  const title = `${post.title} | mBOLDen Change`
  const image = post.coverImage?.url
  const openGraph = openGraphFor({title, description, path: sitePostPath(slug)})
  const twitter = twitterFor({title, description})
  return {
    title: post.title,
    description,
    // Search engines are pointed at one original; see lib/substackPosts/config.ts.
    alternates: {canonical: canonicalPostUrl(slug)},
    openGraph: {
      ...openGraph,
      type: 'article',
      publishedTime: post.date,
      authors: [post.author],
      ...(image ? {images: [{url: image, alt: post.coverImage?.alt ?? post.title}]} : {}),
    },
    twitter: {...twitter, ...(image ? {images: [image]} : {})},
  }
}

function blogPostingJsonLd(post: SubstackPost) {
  const canonical = canonicalPostUrl(post.slug)
  const byOrg = post.author === ORG_NAME
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    ...(post.subtitle || post.excerpt ? {description: post.subtitle || post.excerpt} : {}),
    url: `${SITE_ORIGIN}${sitePostPath(post.slug)}`,
    mainEntityOfPage: {'@type': 'WebPage', '@id': canonical},
    datePublished: post.date,
    image: [post.coverImage?.url ?? DEFAULT_SHARE_IMAGE],
    author: byOrg ? {'@type': 'Organization', '@id': ORG_ID, name: ORG_NAME} : {'@type': 'Person', name: post.author},
    publisher: {'@type': 'Organization', '@id': ORG_ID, name: ORG_NAME},
    isPartOf: {'@id': WEBSITE_ID},
  }
}

export default async function PointOfViewPostRoute({params}: Props) {
  const {slug} = await params
  const posts = await getAllPosts()
  const post = posts.find((entry) => entry.slug === slug)
  if (!post) notFound()

  return (
    <>
      <JsonLd data={blogPostingJsonLd(post)} />
      <PostPage post={post} more={morePosts(posts, slug).map(toPostCard)} />
    </>
  )
}
