/**
 * Edge guards for Google rich-result schemas.
 * Only emit a type when required properties are present and non-empty.
 *
 * @see https://developers.google.com/search/docs/appearance/structured-data
 */

import type {JsonLd, SchemaGuardResult} from './types'
import {
  DEFAULT_SHARE_IMAGE,
  ORG_ID,
  ORG_NAME,
  SITE_ORIGIN,
  WEBSITE_ID,
} from './constants'

function nonEmpty(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function absoluteUrl(url: string): string {
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  if (url.startsWith('/')) return `${SITE_ORIGIN}${url}`
  return `${SITE_ORIGIN}/${url}`
}

export type FaqPair = {
  question?: string | null
  answer?: string | null
}

/**
 * FAQPage — requires ≥1 Question with name + acceptedAnswer.text.
 * @see https://developers.google.com/search/docs/appearance/structured-data/faqpage
 */
export function guardFaqPage(
  items: FaqPair[] | null | undefined,
  pageUrl?: string,
): SchemaGuardResult {
  const valid = (items ?? [])
    .map((item) => ({
      question: item.question?.trim() ?? '',
      answer: item.answer?.trim() ?? '',
    }))
    .filter((item) => item.question.length > 0 && item.answer.length > 0)

  if (valid.length === 0) {
    return {
      ok: false,
      reason: 'FAQPage requires at least one question/answer pair',
    }
  }

  const data: JsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    ...(pageUrl ? {url: absoluteUrl(pageUrl)} : {}),
    mainEntity: valid.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }

  return {ok: true, data}
}

export type ArticleInput = {
  headline?: string | null
  description?: string | null
  url: string
  /** ISO date or Sanity date string */
  datePublished?: string | null
  dateModified?: string | null
  /** Absolute or site-relative image URL(s). Falls back to default OG image. */
  images?: (string | null | undefined)[] | null
}

/**
 * Article — Google requires headline, image, datePublished, author, publisher.
 * We use the org as author/publisher for nonprofit statements/reports/case studies.
 * @see https://developers.google.com/search/docs/appearance/structured-data/article
 */
export function guardArticle(input: ArticleInput): SchemaGuardResult {
  if (!nonEmpty(input.headline)) {
    return {ok: false, reason: 'Article requires headline'}
  }
  if (!nonEmpty(input.url)) {
    return {ok: false, reason: 'Article requires url'}
  }
  if (!nonEmpty(input.datePublished)) {
    return {
      ok: false,
      reason: 'Article requires datePublished (document date or _createdAt)',
    }
  }

  const images = (input.images ?? [])
    .filter((src): src is string => nonEmpty(src))
    .map(absoluteUrl)

  if (images.length === 0) {
    images.push(DEFAULT_SHARE_IMAGE)
  }

  const data: JsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: input.headline.trim(),
    ...(nonEmpty(input.description)
      ? {description: input.description.trim()}
      : {}),
    url: absoluteUrl(input.url),
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': absoluteUrl(input.url),
    },
    datePublished: input.datePublished,
    ...(nonEmpty(input.dateModified)
      ? {dateModified: input.dateModified}
      : {dateModified: input.datePublished}),
    image: images,
    author: {
      '@type': 'Organization',
      '@id': ORG_ID,
      name: ORG_NAME,
    },
    publisher: {
      '@type': 'Organization',
      '@id': ORG_ID,
      name: ORG_NAME,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_ORIGIN}/android-chrome-512x512.png`,
        width: 512,
        height: 512,
      },
    },
    isPartOf: {'@id': WEBSITE_ID},
  }

  return {ok: true, data}
}

export type BreadcrumbItem = {
  name: string
  /** Absolute or site-relative path; omit for the final (current) crumb if desired */
  path?: string
}

/**
 * BreadcrumbList — each item needs name + item URL except we always set item.
 * Do not emit until the page renders a matching visible breadcrumb trail
 * (Google: don’t mark up content that isn’t visible to readers).
 * @see https://developers.google.com/search/docs/appearance/structured-data/breadcrumb
 */
export function guardBreadcrumbList(
  items: BreadcrumbItem[] | null | undefined,
): SchemaGuardResult {
  const valid = (items ?? [])
    .map((item) => ({
      name: item.name?.trim() ?? '',
      path: item.path?.trim(),
    }))
    .filter((item) => item.name.length > 0)

  if (valid.length < 2) {
    return {
      ok: false,
      reason: 'BreadcrumbList requires at least two named items',
    }
  }

  const data: JsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: valid.map((item, index) => {
      const entry: JsonLd = {
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
      }
      if (item.path) {
        entry.item = absoluteUrl(item.path)
      }
      return entry
    }),
  }

  return {ok: true, data}
}

/**
 * WebSite — pairs with Organization via publisher @id.
 * No SearchAction (site has no on-site search).
 * @see https://developers.google.com/search/docs/appearance/structured-data/sitelinks-searchbox
 */
export function guardWebSite(description?: string | null): SchemaGuardResult {
  if (!nonEmpty(SITE_ORIGIN)) {
    return {ok: false, reason: 'WebSite requires SITE_ORIGIN'}
  }

  const data: JsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    url: SITE_ORIGIN,
    name: ORG_NAME,
    alternateName: ['mBOLDen Change', 'mboldenchange', 'My New Red Shoes'],
    publisher: {'@id': ORG_ID},
    inLanguage: 'en-US',
    ...(nonEmpty(description) ? {description: description.trim()} : {}),
  }

  return {ok: true, data}
}
