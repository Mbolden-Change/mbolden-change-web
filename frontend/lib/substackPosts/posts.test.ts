/** @jest-environment node */
import archive from '@/content/substack-archive.json'
import {formatPostDate, getAllPosts, morePosts, optimizeImages, toPostCard} from './posts'

// React's cache() only works inside a server render; here it passes the function through.
jest.mock('react', () => ({...jest.requireActual('react'), cache: (fn: unknown) => fn}))

const FEED = `<rss xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:content="http://purl.org/rss/1.0/modules/content/"><channel>
  <item><title>Brand New</title><description>Sub</description><link>https://mboldenchange.substack.com/p/brand-new</link><dc:creator>Minh Ngo</dc:creator><pubDate>Tue, 01 Dec 2026 18:00:00 GMT</pubDate><content:encoded><![CDATA[<p>Hello. See <a href="https://mboldenchange.substack.com/p/words-hold-power">this</a>.</p>]]></content:encoded></item>
  <item><title>Already archived</title><link>https://mboldenchange.substack.com/p/words-hold-power</link><pubDate>Tue, 16 Sep 2025 18:00:00 GMT</pubDate><content:encoded><![CDATA[<p>Different text</p>]]></content:encoded></item>
</channel></rss>`

const archived = archive.posts.length

afterEach(() => jest.restoreAllMocks())

test('the archive holds every post, newest first, with its text', () => {
  expect(archived).toBeGreaterThanOrEqual(35)
  const dates = archive.posts.map((post) => post.date)
  expect([...dates].sort().reverse()).toEqual(dates)
  for (const post of archive.posts) {
    expect(post.title && post.date && post.author && post.excerpt && post.html).toBeTruthy()
    expect(post.html).not.toMatch(/<script|button-wrapper|subscription-widget|Subscribe now|Leave a comment|<form|<button|<svg/i)
  }
})

test('a post in the feed but not the archive appears first; archived posts keep the archived text', async () => {
  global.fetch = jest.fn().mockResolvedValue({ok: true, text: async () => FEED}) as unknown as typeof fetch
  const posts = await getAllPosts()
  expect(posts).toHaveLength(archived + 1)
  expect(posts[0]).toMatchObject({slug: 'brand-new', author: 'Minh Ngo', excerpt: 'Sub'})
  expect(posts[0].html).toBe('<p>Hello. See <a href="/point-of-view/words-hold-power">this</a>.</p>')
  expect(posts.find((post) => post.slug === 'words-hold-power')?.html).not.toContain('Different text')
})

test.each([
  ['the request fails', () => Promise.reject(new Error('network'))],
  ['Substack answers with an error', () => Promise.resolve({ok: false, text: async () => ''})],
  ['the answer is not a feed', () => Promise.resolve({ok: true, text: async () => '<html>Just a moment…</html>'})],
])('when %s, the archive alone is used', async (_name, respond) => {
  global.fetch = jest.fn().mockImplementation(respond) as unknown as typeof fetch
  const posts = await getAllPosts()
  expect(posts.map((post) => post.slug)).toEqual(archive.posts.map((post) => post.slug))
})

test('dates read like "November 13, 2026", by the California calendar', () => {
  expect(formatPostDate('2026-11-13T21:03:32.060Z')).toBe('November 13, 2026')
  expect(formatPostDate('2026-11-14T02:00:00.000Z')).toBe('November 13, 2026')
  expect(formatPostDate('nope')).toBe('')
})

test('cards link to the post on this site', () => {
  const card = toPostCard(archive.posts[0])
  expect(card.href).toBe(`/point-of-view/${archive.posts[0].slug}`)
  expect(card.dateLabel).toMatch(/^[A-Z][a-z]+ \d{1,2}, \d{4}$/)
})

test('more posts: the next three by date, never the one being read, wrapping at the oldest', () => {
  const posts = archive.posts
  expect(morePosts(posts, posts[0].slug).map((p) => p.slug)).toEqual([posts[1].slug, posts[2].slug, posts[3].slug])
  const last = posts[posts.length - 1]
  expect(morePosts(posts, last.slug).map((p) => p.slug)).toEqual([posts[0].slug, posts[1].slug, posts[2].slug])
  expect(morePosts(posts, posts[posts.length - 2].slug).map((p) => p.slug)).toEqual([last.slug, posts[0].slug, posts[1].slug])
})

test('post images load through the site image optimizer, from Substack’s CDN', () => {
  const html = optimizeImages('<figure><img src="https://substackcdn.com/image/fetch/$s_!a!,w_1456/https%3A%2F%2Fx%2Fa_1x1.jpeg?a=1&amp;b=2" width="10" height="5" alt="A sign" loading="lazy"></figure>')
  expect(html).toContain('<img src="/_next/image?url=https%3A%2F%2Fsubstackcdn.com%2Fimage%2Ffetch%2F%24s_!a!%2Cw_1456%2Fhttps%253A%252F%252Fx%252Fa_1x1.jpeg%3Fa%3D1%26b%3D2&amp;w=1080&amp;q=75"')
  expect(html).toContain('&amp;w=640&amp;q=75 640w')
  expect(html).toContain('width="10" height="5" alt="A sign" loading="lazy"')
})
