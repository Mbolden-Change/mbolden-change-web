import {POSTS_PATH, htmlToText, sitePostPath} from '../substackPosts/core'
import {clip, shortPostDate, tidy} from './text'
import type {SearchEntry} from './types'

export type IndexablePost = {
  slug: string
  title: string
  subtitle?: string
  date: string
  excerpt: string
  html: string
}

const headingsOf = (html: string) =>
  [...html.matchAll(/<h[2-6]>(.*?)<\/h[2-6]>/g)].map((match) => tidy(htmlToText(match[1]))).filter(Boolean)

/** One entry per Substack post, full text, linking to /point-of-view/<slug>. */
export function entriesFromPosts(posts: IndexablePost[]): SearchEntry[] {
  return posts.map((post) => {
    const summary = tidy(post.subtitle) || clip(post.excerpt, 140)
    const date = shortPostDate(post.date)
    const headings = headingsOf(post.html)
    const body = tidy(htmlToText(post.html))
    return {
      id: `post:${post.slug}`,
      url: sitePostPath(post.slug),
      title: tidy(post.title),
      group: 'Our Point of View',
      location: date ? `Our Point of View · ${date}` : 'Our Point of View',
      ...(summary ? {summary} : {}),
      ...(headings.length ? {headings} : {}),
      ...(body ? {body} : {}),
    }
  })
}

export {POSTS_PATH}
