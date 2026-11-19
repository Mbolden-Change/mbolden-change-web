import type {PageBuilder, PointOfView, SubstackPostList} from '@/sanity/types'
import {urlFor} from '@/sanity/lib/image'
import {getLatestSubstackPosts, getSubstackPost, substackPostSlug, type SubstackPost} from './substack'
import {sitePostPath} from './substackPosts/core'
import {getAllPosts, toPostCard, type PostCard} from './substackPosts/posts'

export type PointOfViewCard = {
  key: string
  url: string
  /** The post's page on this site, when it has one; the card then opens it in the same tab. */
  href?: string
  title: string
  summary?: string
  image?: {src: string; alt: string}
}

/** A Point of View block with its cards looked up on the server. */
export type ResolvedPointOfView = PointOfView & {cards: PointOfViewCard[]}

/** A Substack Post List block with every post's card. */
export type ResolvedSubstackPostList = SubstackPostList & {cards: PostCard[]}

async function resolveCards(block: PointOfView): Promise<PointOfViewCard[]> {
  const picks = (block.posts ?? []).slice(0, 3)

  if (!picks.length) {
    const latest = await getLatestSubstackPosts(3)
    return latest.map((post, index) => toCard(`latest-${index}`, post))
  }

  const fetched = await Promise.all(picks.map((pick) => getSubstackPost(pick.url)))
  return picks.flatMap((pick, index) => {
    const post = fetched[index]
    const override = pick.image?.asset?._ref
      ? urlFor(pick.image).width(1280).height(720).fit('crop').auto('format').url()
      : undefined
    const card = toCard(pick._key, {
      url: post?.url ?? pick.url,
      title: pick.title?.trim() || post?.title,
      subtitle: pick.summary?.trim() || post?.subtitle,
      image: override ?? post?.image,
    })
    // A card needs a title; without one (Substack unreachable, no override) it's left out.
    if (!card.title) return []
    if (card.image) card.image.alt = pick.alt?.trim() ?? ''
    return [card]
  })
}

function toCard(key: string, post: SubstackPost): PointOfViewCard {
  return {
    key,
    url: post.url,
    title: post.title ?? '',
    summary: post.subtitle,
    // Latest posts have no alt text in Studio; the title next to it says what it is.
    image: post.image ? {src: post.image, alt: ''} : undefined,
  }
}

/** Cards for posts that can be read on this site link there instead of to Substack. */
async function withSiteLinks(cards: PointOfViewCard[]): Promise<PointOfViewCard[]> {
  const onSite = new Set((await getAllPosts()).map((post) => post.slug))
  return cards.map((card) => {
    const slug = substackPostSlug(card.url)
    return slug && onSite.has(slug) ? {...card, href: sitePostPath(slug)} : card
  })
}

/** Looks up the Substack posts for every Point of View and Substack Post List block on a page. */
export async function resolvePointOfViewBlocks<T extends PageBuilder | undefined>(content: T): Promise<T> {
  if (!Array.isArray(content) || !content.some((block) => block._type === 'pointOfView' || block._type === 'substackPostList')) {
    return content
  }
  const resolved = await Promise.all(
    content.map(async (block) => {
      if (block._type === 'pointOfView') return {...block, cards: await withSiteLinks(await resolveCards(block))}
      if (block._type === 'substackPostList') return {...block, cards: (await getAllPosts()).map(toPostCard)}
      return block
    }),
  )
  return resolved as T
}
