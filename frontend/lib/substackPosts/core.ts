/**
 * Turns a Substack post into what the site shows at /point-of-view/<slug>.
 *
 * Shared by the archive script (scripts/syncSubstack.mjs, run by Node) and
 * the site (lib/substackPosts/posts.ts), so both clean posts the same way.
 * Keep this file free of '@/' imports and of anything Node can't run as is.
 *
 * Cleaning never touches a post's words. It keeps an allowlist of plain
 * formatting, drops Substack's own buttons and sign-up boxes, and swaps what
 * the site can't show (Substack-hosted video, polls) for a link to the post.
 */
import {parseDocument} from 'htmlparser2'

export const SUBSTACK_HOST = 'mboldenchange.substack.com'
export const SUBSTACK_ORIGIN = `https://${SUBSTACK_HOST}`
/** Where the posts live on this site. */
export const POSTS_PATH = '/point-of-view'
/** The line shown in place of anything the site can't render. */
export const FALLBACK_LABEL = 'View this on Substack'

/** Where Substack serves post images. */
const IMAGE_HOSTS = ['substackcdn.com', 'substack-post-media.s3.amazonaws.com']

export type SubstackArchivePost = {
  slug: string
  title: string
  subtitle?: string
  /** ISO date and time the post was published. */
  date: string
  author: string
  coverImage?: {url: string; alt?: string}
  /** The subtitle, or the post's first sentence. */
  excerpt: string
  /** Cleaned body HTML, safe to render as is. */
  html: string
}

export type CleanNote = {kind: 'removed' | 'replaced' | 'changed'; what: string}

export type CleanResult = {
  html: string
  notes: CleanNote[]
  imageCount: number
}

type Node = {
  type: string
  name?: string
  data?: string
  attribs?: Record<string, string>
  children?: Node[]
}

// Formatting the site keeps as is. Anything not listed is unwrapped (its text
// stays) unless a rule below removes or replaces it.
const KEEP = new Set([
  'p', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'blockquote', 'hr', 'br',
  'strong', 'b', 'em', 'i', 's', 'u', 'sup', 'sub', 'code', 'pre', 'figure', 'figcaption',
])
const VOID = new Set(['hr', 'br'])
// Never rendered, text included.
const DROP = new Set([
  'script', 'style', 'noscript', 'template', 'svg', 'math', 'button', 'form', 'input', 'select',
  'textarea', 'label', 'object', 'embed', 'applet', 'link', 'meta', 'base', 'head', 'title', 'source',
  'track', 'canvas', 'dialog', 'frame', 'frameset',
])
// Elements that must hold something to be worth keeping.
const NEEDS_CONTENT = new Set(['p', 'h2', 'h3', 'h4', 'h5', 'h6', 'li', 'ul', 'ol', 'blockquote', 'figure', 'figcaption', 'pre'])
// Empty inline formatting is dropped, but a space inside it is still a space.
const INLINE = new Set(['strong', 'b', 'em', 'i', 's', 'u', 'sup', 'sub', 'code'])

// Substack's own promotion: removed, and listed in the report.
const REMOVED_CLASSES: Record<string, string> = {
  'subscription-widget-wrap': 'subscribe box',
  'subscription-widget-wrap-editor': 'subscribe box',
  'subscription-widget': 'subscribe box',
  'install-substack-app-embed': 'Substack app box',
  'paywall-jump': 'paywall marker',
  'share-dialog': 'share box',
}
// Things only Substack can show: replaced with a link to the post.
const FALLBACK_CLASSES: Record<string, string> = {
  'native-video-embed': 'Substack-hosted video',
  'native-audio-embed': 'Substack-hosted audio',
  'poll-embed': 'poll',
  tweet: 'embedded tweet',
  'embedded-post-wrap': 'embedded Substack post',
  'embedded-publication-wrap': 'embedded Substack publication',
  'digest-post-embed': 'embedded Substack post',
  'file-embed-wrapper': 'file download',
  'apple-podcast-container': 'podcast player',
  'spotify-wrap': 'Spotify player',
  'soundcloud-wrap': 'SoundCloud player',
  'vimeo-wrap': 'Vimeo video',
  'tiktok-wrap': 'TikTok video',
  'instagram': 'Instagram post',
  'bluesky-wrap': 'Bluesky post',
  'latex-rendered': 'formula',
  'recipe-embed': 'recipe card',
  'community-chat': 'Substack chat box',
  'comment': 'embedded comment',
}
// Substack components the rules below already handle.
const HANDLED_COMPONENTS = new Set([
  'Image2ToDOM', 'ButtonCreateButton', 'CaptionedButtonToDOM', 'SubscribeWidgetToDOM', 'SubscribeWidget',
  'Youtube2ToDOM', 'FootnoteToDOM', 'FootnoteAnchorToDOM',
])
const COMPONENT_LABELS: Record<string, string> = {
  VideoPlaceholder: 'Substack-hosted video',
  AudioPlaceholder: 'Substack-hosted audio',
  PollEmbed: 'poll',
}

export function escapeHtml(text: string) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function parseUrl(value: string | undefined, base?: string): URL | null {
  if (!value) return null
  try {
    return new URL(value.trim(), base)
  } catch {
    return null
  }
}

/** A post address on our Substack (http or https, any tracking added) → its slug. */
export function substackSlugOf(value: string | undefined | null): string | null {
  const url = parseUrl(value ?? undefined)
  if (!url || !/^https?:$/.test(url.protocol) || url.hostname !== SUBSTACK_HOST) return null
  const match = url.pathname.match(/^\/p\/([^/]+)\/?$/)
  if (!match) return null
  try {
    return decodeURIComponent(match[1])
  } catch {
    return null
  }
}

export const substackPostUrl = (slug: string) => `${SUBSTACK_ORIGIN}/p/${encodeURIComponent(slug)}`
export const sitePostPath = (slug: string) => `${POSTS_PATH}/${encodeURIComponent(slug)}`

function imageUrl(value: string | undefined): string | null {
  const url = parseUrl(value)
  return url && url.protocol === 'https:' && IMAGE_HOSTS.includes(url.hostname) ? url.toString() : null
}

/** The image's file name, the same whichever Substack address serves it. */
export function imageKey(value: string | undefined): string {
  if (!value) return ''
  let last = value
  try {
    last = decodeURIComponent(value)
  } catch {
    // Keep the raw value.
  }
  return last.split(/[/?#]/).filter(Boolean).pop() ?? ''
}

function youtubeId(value: string | undefined): string | null {
  const url = parseUrl(value, 'https://www.youtube.com')
  if (!url) return null
  const host = url.hostname.replace(/^www\./, '')
  let id: string | null = null
  if (host === 'youtu.be') id = url.pathname.slice(1)
  else if (host === 'youtube.com' || host === 'youtube-nocookie.com' || host === 'm.youtube.com') {
    id = url.pathname.match(/^\/(?:embed|shorts|live)\/([^/]+)/)?.[1] ?? url.searchParams.get('v')
  }
  return id && /^[\w-]{6,20}$/.test(id) ? id : null
}

function dataAttrs(node: Node): Record<string, unknown> {
  try {
    const parsed = JSON.parse(node.attribs?.['data-attrs'] ?? '')
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

const classesOf = (node: Node) => new Set((node.attribs?.class ?? '').split(/\s+/).filter(Boolean))

function textOf(node: Node): string {
  if (node.type === 'text') return node.data ?? ''
  return (node.children ?? []).map(textOf).join('')
}

function find(node: Node, test: (n: Node) => boolean): Node | null {
  for (const child of node.children ?? []) {
    if (test(child)) return child
    const inner = find(child, test)
    if (inner) return inner
  }
  return null
}

const isBlank = (html: string) => html.replace(/<br>/g, '').trim() === ''

export type CleanOptions = {
  /** The post being cleaned; fallback lines link to it on Substack. */
  slug: string
  /** Posts readable on this site: links to them stay on the site. */
  knownSlugs?: Iterable<string>
}

/** Cleans one post's HTML. See the file comment for the rules. */
export function cleanPostHtml(source: string, {slug, knownSlugs = []}: CleanOptions): CleanResult {
  const known = new Set(knownSlugs)
  const notes: CleanNote[] = []
  let imageCount = 0
  const postUrl = substackPostUrl(slug)

  const fallback = (what: string) => {
    notes.push({kind: 'replaced', what})
    return `<p class="substack-fallback"><a href="${escapeHtml(postUrl)}" target="_blank" rel="noopener noreferrer">${FALLBACK_LABEL}</a></p>`
  }

  const video = (id: string) =>
    `<div class="video"><iframe src="https://www.youtube-nocookie.com/embed/${id}" title="YouTube video" loading="lazy" allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe></div>`

  const renderAll = (nodes: Node[] | undefined): string => (nodes ?? []).map(render).join('')

  function link(node: Node, inner: string): string {
    if (isBlank(inner)) return inner
    const raw = node.attribs?.href?.trim() ?? ''
    const classes = classesOf(node)
    // Footnote links jump within the page.
    const fragment = raw.match(/^#(footnote(?:-anchor)?-\d+)$/)
    if (fragment) {
      const id = node.attribs?.id?.match(/^footnote(?:-anchor)?-\d+$/)?.[0]
      const kind = classes.has('footnote-number') ? 'footnote-number' : 'footnote-anchor'
      return `<a class="${kind}"${id ? ` id="${id}"` : ''} href="#${fragment[1]}">${inner}</a>`
    }
    const url = parseUrl(raw)
    if (!url) return inner
    if (url.protocol === 'mailto:') return `<a href="${escapeHtml(url.toString())}">${inner}</a>`
    if (!/^https?:$/.test(url.protocol)) return inner
    const target = substackSlugOf(raw)
    if (target && known.has(target)) return `<a href="${escapeHtml(sitePostPath(target))}">${inner}</a>`
    // Every other link keeps its address exactly as written.
    return `<a href="${escapeHtml(raw)}" target="_blank" rel="noopener noreferrer">${inner}</a>`
  }

  function image(node: Node): string {
    const src = imageUrl(node.attribs?.src)
    if (!src) return fallback('image from an address the site does not load')
    imageCount += 1
    const size = (name: 'width' | 'height') => (/^\d+$/.test(node.attribs?.[name] ?? '') ? ` ${name}="${node.attribs![name]}"` : '')
    // The page serves this through the site's image optimizer (see optimizeImages in posts.ts).
    return `<img src="${escapeHtml(src)}"${size('width')}${size('height')} alt="${escapeHtml(node.attribs?.alt ?? '')}" loading="lazy" decoding="async">`
  }

  function button(node: Node): string {
    const anchor = node.name === 'a' ? node : find(node, (n) => n.name === 'a')
    const label = textOf(node).replace(/\s+/g, ' ').trim()
    const url = parseUrl(anchor?.attribs?.href)
    const substackOwn =
      !url ||
      (url.hostname.endsWith('substack.com') &&
        (/^\/(subscribe|account|leaderboard|chat|about)?\/?$/.test(url.pathname) ||
          url.searchParams.has('action') ||
          /\/comments\/?$/.test(url.pathname) ||
          url.searchParams.get('utm_content') === 'share'))
    if (substackOwn || !anchor) {
      notes.push({kind: 'removed', what: `“${label}” button`})
      return ''
    }
    // A button Minh pointed somewhere herself stays, as a plain link.
    notes.push({kind: 'changed', what: `“${label}” button shown as a plain link`})
    return `<p>${link(anchor, escapeHtml(label))}</p>`
  }

  function render(node: Node): string {
    if (node.type === 'text') return escapeHtml(node.data ?? '')
    if (node.type !== 'tag' && node.type !== 'script' && node.type !== 'style') return ''
    const name = (node.name ?? '').toLowerCase()
    if (DROP.has(name)) return ''

    const classes = classesOf(node)
    const component = node.attribs?.['data-component-name']

    for (const [cls, what] of Object.entries(REMOVED_CLASSES)) {
      if (classes.has(cls)) {
        const caption = textOf(node).replace(/\s+/g, ' ').trim()
        notes.push({kind: 'removed', what: caption ? `${what} (“${caption}”)` : what})
        return ''
      }
    }
    if (classes.has('button-wrapper') || (name === 'a' && classes.has('button'))) return button(node)

    // YouTube plays from youtube-nocookie.com; nothing else is embedded.
    if (classes.has('youtube-wrap') || component === 'Youtube2ToDOM' || name === 'iframe') {
      const frame = name === 'iframe' ? node : find(node, (n) => n.name === 'iframe')
      const attrs = dataAttrs(node)
      const id =
        youtubeId(frame?.attribs?.src) ??
        (typeof attrs.videoId === 'string' && /^[\w-]{6,20}$/.test(attrs.videoId) ? attrs.videoId : null)
      return id ? video(id) : fallback(name === 'iframe' ? 'embedded frame' : 'video embed')
    }
    if (name === 'video' || name === 'audio') return fallback(`${name} player`)
    for (const [cls, what] of Object.entries(FALLBACK_CLASSES)) {
      if (classes.has(cls)) return fallback(what)
    }
    if (component && !HANDLED_COMPONENTS.has(component)) return fallback(COMPONENT_LABELS[component] ?? `Substack “${component}” block`)

    if (classes.has('image-link-expand')) return ''
    if (name === 'img') return image(node)
    if (name === 'a') {
      const inner = renderAll(node.children)
      // The link around a picture only opens Substack's full-size viewer.
      if (classes.has('image-link') && imageUrl(node.attribs?.href)) return inner
      return link(node, inner)
    }

    if (name === 'div' || name === 'aside' || name === 'section') {
      const inner = renderAll(node.children)
      if (isBlank(inner)) return ''
      if (classes.has('pullquote')) return `<div class="pullquote">${inner}</div>`
      if (classes.has('callout-block')) return `<div class="callout">${inner}</div>`
      if (classes.has('footnote')) return `<div class="footnote">${inner}</div>`
      if (classes.has('footnote-content')) return `<div class="footnote-content">${inner}</div>`
      return inner
    }

    // The page's own title is the only h1; a post's h1 becomes an h2.
    const tag = name === 'h1' ? 'h2' : name === 'del' || name === 'strike' ? 's' : name
    if (!KEEP.has(tag)) return renderAll(node.children)
    if (VOID.has(tag)) return `<${tag}>`
    const inner = renderAll(node.children)
    if (NEEDS_CONTENT.has(tag) && isBlank(inner)) return ''
    if (INLINE.has(tag) && isBlank(inner)) return inner
    const start = tag === 'ol' && /^\d+$/.test(node.attribs?.start ?? '') ? ` start="${node.attribs!.start}"` : ''
    return `<${tag}${start}>${inner}</${tag}>`
  }

  const document = parseDocument(source) as unknown as Node
  return {html: levelHeadings(renderAll(document.children)), notes, imageCount}
}

/**
 * Makes a post's headings follow the page title in order: the largest level
 * a post uses becomes h2 and no level is skipped, so screen readers get a
 * sound outline. The headings' words are untouched.
 */
export function levelHeadings(html: string): string {
  const used = [...new Set([...html.matchAll(/<h([2-6])>/g)].map((match) => Number(match[1])))].sort()
  let previous = 1
  let current = 2
  return html.replace(/<(\/?)h([2-6])>/g, (_tag, closing: string, level: string) => {
    if (closing) return `</h${current}>`
    current = Math.min(used.indexOf(Number(level)) + 2, previous + 1)
    previous = current
    return `<h${current}>`
  })
}

const BLOCKS = new Set(['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li', 'blockquote', 'figcaption', 'div', 'hr', 'br', 'ul', 'ol', 'figure', 'form', 'button'])

/** The words of some HTML, with a space wherever a block ends. Fallback lines are left out. */
export function htmlToText(html: string): string {
  const walk = (node: Node): string => {
    if (node.type === 'text') return node.data ?? ''
    if (node.type !== 'tag' && node.type !== 'root') return ''
    if (node.name === 'svg') return ''
    if (classesOf(node).has('substack-fallback')) return ' '
    const inner = (node.children ?? []).map(walk).join('')
    return BLOCKS.has(node.name ?? '') ? ` ${inner} ` : inner
  }
  return walk(parseDocument(html) as unknown as Node).replace(/\s+/g, ' ').trim()
}

export const countWords = (text: string) => (text.match(/\S+/g) ?? []).length

const ABBREVIATION = /(?:^|[\s(“"‘'])(?:[A-Z]|Mr|Mrs|Ms|Dr|St|Sen|Rep|Gov|Jr|Sr|vs|No|Inc|Co|Corp|Ltd|U\.S|D\.C|e\.g|i\.e|a\.m|p\.m)\.$/

/** The first sentence of some text, exactly as written. */
export function firstSentence(text: string): string {
  const clean = text.replace(/\s+/g, ' ').trim()
  const end = /[.!?]+[”"’')\]]*(?=\s|$)/g
  let match: RegExpExecArray | null
  while ((match = end.exec(clean))) {
    const stop = match.index + match[0].length
    const before = clean.slice(0, stop)
    const after = clean.slice(stop).trimStart()
    if (ABBREVIATION.test(before)) continue
    if (after && !/^[A-Z0-9“"‘'(—–-]/.test(after)) continue
    return before
  }
  return clean
}

/** The first paragraph of a cleaned post that is part of its running text. */
export function firstParagraphText(html: string): string {
  const skip = (node: Node) =>
    node.name === 'figure' || node.name === 'blockquote' || (node.name === 'div' && /callout|pullquote|footnote|video/.test(node.attribs?.class ?? '')) || classesOf(node).has('substack-fallback')
  const walk = (nodes: Node[]): string => {
    for (const node of nodes) {
      if (node.type !== 'tag' || skip(node)) continue
      if (node.name === 'p') {
        const text = textOf(node).replace(/\s+/g, ' ').trim()
        if (text) return text
      }
    }
    return ''
  }
  return walk((parseDocument(html) as unknown as Node).children ?? [])
}

/** Substack shows our own byline as one word. */
export function authorName(names: Array<string | undefined | null>): string {
  const list = names
    .map((name) => (name ?? '').trim())
    .filter(Boolean)
    .map((name) => (name.replace(/\s+/g, '').toLowerCase() === 'mboldenchange' ? 'mBOLDen Change' : name))
  const unique = [...new Set(list)]
  if (unique.length === 0) return 'mBOLDen Change'
  if (unique.length === 1) return unique[0]
  return `${unique.slice(0, -1).join(', ')} and ${unique[unique.length - 1]}`
}

export type RawPost = {
  slug: string
  title?: string | null
  subtitle?: string | null
  date?: string | null
  authors?: Array<string | null | undefined>
  coverImage?: string | null
  coverAlt?: string | null
  html?: string | null
}

const tidy = (value: string | null | undefined) => (value ?? '').replace(/\s+/g, ' ').trim()

/** Builds the post the site stores and shows, plus a report of what cleaning did. */
export function buildPost(raw: RawPost, knownSlugs: Iterable<string>) {
  const cleaned = cleanPostHtml(raw.html ?? '', {slug: raw.slug, knownSlugs})
  const subtitle = tidy(raw.subtitle)
  const cover = imageUrl(raw.coverImage ?? undefined)
  const date = raw.date ? new Date(raw.date) : null
  const post: SubstackArchivePost = {
    slug: raw.slug,
    title: tidy(raw.title),
    ...(subtitle ? {subtitle} : {}),
    date: date && !Number.isNaN(date.getTime()) ? date.toISOString() : '',
    author: authorName(raw.authors ?? []),
    ...(cover ? {coverImage: {url: cover, ...(tidy(raw.coverAlt) ? {alt: tidy(raw.coverAlt)} : {})}} : {}),
    excerpt: subtitle || firstSentence(firstParagraphText(cleaned.html)),
    html: cleaned.html,
  }
  return {post, notes: cleaned.notes, imageCount: cleaned.imageCount}
}

/** Reads the posts out of Substack's RSS feed. */
export function parseFeed(xml: string): RawPost[] {
  const document = parseDocument(xml, {xmlMode: true}) as unknown as Node
  const items: Node[] = []
  const collect = (node: Node) => {
    for (const child of node.children ?? []) {
      if (child.type === 'tag' && child.name === 'item') items.push(child)
      else collect(child)
    }
  }
  collect(document)

  const field = (item: Node, name: string) => (item.children ?? []).find((child) => child.name === name)
  const cdata = (node: Node | undefined): string => {
    if (!node) return ''
    if (node.type === 'text') return node.data ?? ''
    return (node.children ?? []).map(cdata).join('')
  }

  const posts: RawPost[] = []
  for (const item of items) {
    const slug = substackSlugOf(cdata(field(item, 'link')).trim())
    const title = cdata(field(item, 'title'))
    const html = cdata(field(item, 'content:encoded'))
    if (!slug || !title.trim() || !html.trim()) continue
    const enclosure = field(item, 'enclosure')
    const isImage = /^image\//.test(enclosure?.attribs?.type ?? '')
    posts.push({
      slug,
      title,
      subtitle: cdata(field(item, 'description')),
      date: cdata(field(item, 'pubDate')).trim(),
      authors: [cdata(field(item, 'dc:creator'))],
      coverImage: isImage ? enclosure?.attribs?.url : undefined,
      html,
    })
  }
  return posts
}

/** Newest first; posts published at the same moment keep a steady order. */
export function newestFirst<T extends {date: string; slug: string}>(posts: T[]): T[] {
  return [...posts].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.slug.localeCompare(b.slug)))
}
