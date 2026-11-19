#!/usr/bin/env node
/**
 * Builds frontend/content/substack-archive.json: every post on our Substack,
 * cleaned for /point-of-view/<slug>.
 *
 *   node scripts/syncSubstack.mjs            rebuild the archive file
 *   node scripts/syncSubstack.mjs --check    compare only; writes nothing
 *   node scripts/syncSubstack.mjs --report report.md   also write a per-post report
 *
 * The list of posts comes from Substack's sitemap and each post's text from
 * its posts API (the archive API can't be paged). Needs Node 22.18 or newer,
 * which runs the shared TypeScript cleaner directly.
 *
 * Substack refuses GitHub's hosted runners, so this is not a GitHub Action.
 * A scheduled Claude session runs it each quarter and opens a pull request
 * when the file changed. See "Refreshing the Substack archive" in the README.
 */
import {readFile, writeFile, appendFile} from 'node:fs/promises'
import {fileURLToPath} from 'node:url'
import {
  SUBSTACK_ORIGIN,
  buildPost,
  countWords,
  htmlToText,
  newestFirst,
  substackSlugOf,
} from '../lib/substackPosts/core.ts'

const ARCHIVE = fileURLToPath(new URL('../content/substack-archive.json', import.meta.url))
const args = process.argv.slice(2)
const check = args.includes('--check')
const reportPath = args.includes('--report') ? args[args.indexOf('--report') + 1] : null

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function get(url, accept) {
  let lastError
  for (let attempt = 0; attempt < 4; attempt += 1) {
    if (attempt) await wait(2000 * 2 ** (attempt - 1))
    try {
      const response = await fetch(url, {headers: {accept, 'user-agent': 'substack-archive-sync'}})
      if (response.ok) return await response.text()
      lastError = new Error(`${response.status} from ${url}`)
      // A missing post won't appear on a retry.
      if (response.status === 404) break
    } catch (error) {
      lastError = error
    }
  }
  throw lastError
}

async function listSlugs() {
  const xml = await get(`${SUBSTACK_ORIGIN}/sitemap.xml`, 'application/xml')
  const slugs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => substackSlugOf(match[1].trim())).filter(Boolean)
  if (slugs.length === 0) throw new Error('The sitemap lists no posts; refusing to empty the archive.')
  return [...new Set(slugs)]
}

async function main() {
  const slugs = await listSlugs()
  const built = []
  const skipped = []

  for (const slug of slugs) {
    const raw = JSON.parse(await get(`${SUBSTACK_ORIGIN}/api/v1/posts/${encodeURIComponent(slug)}`, 'application/json'))
    await wait(300)
    // Only posts anyone can read in full go on the site.
    if (raw.audience !== 'everyone' || !raw.body_html) {
      skipped.push(`${slug} (${raw.audience !== 'everyone' ? `audience: ${raw.audience}` : 'no text'})`)
      continue
    }
    const {post, notes, imageCount} = buildPost(
      {
        slug,
        title: raw.title,
        subtitle: raw.subtitle,
        date: raw.post_date,
        authors: (raw.publishedBylines ?? []).map((byline) => byline?.name),
        coverImage: raw.cover_image,
        coverAlt: raw.cover_image_alt,
        html: raw.body_html,
      },
      slugs,
    )
    built.push({
      post,
      notes,
      imageCount,
      siteWords: countWords(htmlToText(post.html)),
      substackWords: countWords(htmlToText(raw.body_html)),
    })
  }

  const posts = newestFirst(built.map((entry) => entry.post))
  const next = `${JSON.stringify({posts}, null, 2)}\n`
  const previous = await readFile(ARCHIVE, 'utf8').catch(() => '')
  const before = new Map((previous ? JSON.parse(previous).posts : []).map((post) => [post.slug, JSON.stringify(post)]))

  const added = posts.filter((post) => !before.has(post.slug)).map((post) => post.slug)
  const updated = posts.filter((post) => before.has(post.slug) && before.get(post.slug) !== JSON.stringify(post)).map((post) => post.slug)
  const removed = [...before.keys()].filter((slug) => !posts.some((post) => post.slug === slug))
  const changed = next !== previous

  const summary = changed
    ? [
        `Changes: ${added.length} new, ${updated.length} updated, ${removed.length} removed (${posts.length} posts in all).`,
        ...added.map((slug) => `- New: ${slug}`),
        ...updated.map((slug) => `- Updated: ${slug}`),
        ...removed.map((slug) => `- Removed: ${slug}`),
      ].join('\n')
    : `No changes: the archive is current (${posts.length} posts).`
  console.log(summary)
  if (skipped.length) console.log(`Skipped: ${skipped.join(', ')}`)

  if (reportPath) {
    const rows = newestFirst(built.map((entry) => ({...entry, date: entry.post.date, slug: entry.post.slug}))).map((entry) => {
      const notes = entry.notes.length ? entry.notes.map((note) => `${note.kind}: ${note.what}`).join('; ') : 'nothing'
      return `| ${entry.slug} | ${entry.post.date.slice(0, 10)} | ${entry.siteWords} | ${entry.substackWords} | ${entry.imageCount} | ${notes.replace(/\|/g, '\\|')} |`
    })
    await writeFile(
      reportPath,
      [
        summary,
        '',
        '| Post | Date | Words on site | Words on Substack | Images | Removed, replaced or changed |',
        '| --- | --- | --- | --- | --- | --- |',
        ...rows,
        '',
      ].join('\n'),
    )
  }

  if (changed && !check) await writeFile(ARCHIVE, next)
  if (process.env.GITHUB_OUTPUT) await appendFile(process.env.GITHUB_OUTPUT, `changed=${changed}\n`)
}

main().catch((error) => {
  console.error(error)
  if (/^40[13] from /.test(error?.message ?? '')) {
    console.error(
      '\nSubstack refused this machine. It turns away some hosted servers, GitHub\'s runners among them.\n' +
        'Nothing was changed. Run the script from a machine Substack accepts.',
    )
  }
  process.exit(1)
})
