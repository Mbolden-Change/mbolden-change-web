/**
 * What search must never show. Every entry passes through here last, whatever
 * its source, so a rule can't be skipped by a new kind of content.
 */
import type {SearchEntry} from './types'

/** Pages and documents whose address starts with "test". */
export const isTestSlug = (slug: string | null | undefined) => /^\/*test/i.test(slug ?? '')

/** Pages Minh keeps out of search altogether: the Privacy Policy. */
const UNLISTED_PAGES = new Set(['privacy'])
export const isUnlistedPage = (slug: string | null | undefined) => UNLISTED_PAGES.has((slug ?? '').replace(/^\/+/, ''))

/** The Document Retention & Destruction Policy, by any spelling of its name or file. */
const RETENTION_POLICY = /retention\s*(?:&|&amp;|and)?\s*destruction|document[\s_-]*retention|retention[\s_-]*polic|destruction[\s_-]*polic/i
export const isRetentionPolicy = (text: string | null | undefined) => RETENTION_POLICY.test(text ?? '')

/** The only TCPP report file that may be public. */
export const PUBLIC_TCPP_PATH = '/reports/tcpp-alum-rock-partner-report.pdf'
const isOriginalTcpp = (url: string) => /tcpp/i.test(url) && url.split(/[?#]/)[0] !== PUBLIC_TCPP_PATH

/** Funds that must not appear anywhere in search, by name or by address. */
const BLOCKED_PHRASES = [/stories,?\s+systems,?\s+(?:and\s+|&\s+)?change/i]
const BLOCKED_ADDRESSES = [/stories-systems-change/i]

export const hasBlockedPhrase = (text: string | null | undefined) =>
  BLOCKED_PHRASES.some((phrase) => phrase.test(text ?? '')) || BLOCKED_ADDRESSES.some((address) => address.test(text ?? ''))

/** A link to a hidden fund's form on the Donate page, such as /donate#care-access-fund. */
export function isHiddenFundLink(url: string, hiddenFundIds: Iterable<string>): boolean {
  const match = /^(?:https?:\/\/(?:www\.)?mboldenchange\.org)?\/donate\/?(?:\?[^#]*)?#(.+)$/i.exec(url)
  if (!match) return false
  return new Set(hiddenFundIds).has(decodeURIComponent(match[1]))
}

export function isExcludedUrl(url: string, hiddenFundIds: Iterable<string> = []): boolean {
  return isRetentionPolicy(url) || isOriginalTcpp(url) || hasBlockedPhrase(url) || isHiddenFundLink(url, hiddenFundIds)
}

export function isExcludedEntry(entry: SearchEntry, hiddenFundIds: Iterable<string> = []): boolean {
  return (
    isExcludedUrl(entry.url, hiddenFundIds) ||
    isRetentionPolicy(entry.title) ||
    hasBlockedPhrase(entry.title)
  )
}

const forbidden = (text: string) => isRetentionPolicy(text) || hasBlockedPhrase(text)

/** Text without any sentence that names something search must not show. */
export function scrubText(text: string): string {
  if (!forbidden(text)) return text
  return text
    .split(/(?<=[.!?…])\s+/)
    .filter((sentence) => !forbidden(sentence))
    .join(' ')
}

/** An entry with forbidden sentences, headings and keywords removed. */
export function scrubEntry(entry: SearchEntry): SearchEntry {
  const clean: SearchEntry = {...entry}
  if (entry.location) clean.location = forbidden(entry.location) ? '' : entry.location
  if (entry.summary) clean.summary = scrubText(entry.summary) || undefined
  if (entry.body) clean.body = scrubText(entry.body) || undefined
  if (entry.headings) clean.headings = entry.headings.filter((heading) => !forbidden(heading))
  if (entry.keywords) clean.keywords = entry.keywords.filter((word) => !forbidden(word))
  return clean
}
