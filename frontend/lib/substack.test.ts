/** @jest-environment node */
import {getLatestSubstackPosts, getSubstackPost, substackPostSlug} from './substack'
import {resolvePointOfViewBlocks} from './pointOfView'
import type {PageBuilder} from '@/sanity/types'

// The Sanity image builder needs project settings; override images aren't tested here.
jest.mock('@/sanity/lib/image', () => ({urlFor: jest.fn()}))

type Reply = {status?: number; json?: unknown; text?: string}
const replies = new Map<string, Reply>()
const fetchMock = jest.fn(async (url: string, _init?: RequestInit) => {
  const reply = replies.get(url)
  if (!reply) throw new Error(`unexpected fetch ${url}`)
  const status = reply.status ?? 200
  return {
    ok: status < 400,
    status,
    json: async () => reply.json,
    text: async () => reply.text ?? '',
  }
})

beforeEach(() => {
  replies.clear()
  global.fetch = fetchMock as unknown as typeof fetch
})

const API = 'https://mboldenchange.substack.com/api/v1/posts/'
const POST = 'https://mboldenchange.substack.com/p/'

test('accepts only post addresses on our Substack', () => {
  expect(substackPostSlug('https://mboldenchange.substack.com/p/the-philanthropic-retreat')).toBe('the-philanthropic-retreat')
  expect(substackPostSlug('https://mboldenchange.substack.com/p/the-philanthropic-retreat/')).toBe('the-philanthropic-retreat')
  expect(substackPostSlug('https://evil.example.com/p/the-philanthropic-retreat')).toBeNull()
  expect(substackPostSlug('http://mboldenchange.substack.com/p/x')).toBeNull()
  expect(substackPostSlug('https://mboldenchange.substack.com/about')).toBeNull()
  expect(substackPostSlug('not a url')).toBeNull()
})

test('reads a picked post from the post API, cached for a day', async () => {
  replies.set(`${API}the-philanthropic-retreat`, {
    json: {
      title: 'The Philanthropic Retreat',
      subtitle: 'As authoritarianism advances, foundations are choosing silence.',
      cover_image: 'https://substack-post-media.s3.amazonaws.com/public/images/abc.jpeg',
    },
  })
  const post = await getSubstackPost(`${POST}the-philanthropic-retreat`)
  expect(post).toEqual({
    url: `${POST}the-philanthropic-retreat`,
    title: 'The Philanthropic Retreat',
    subtitle: 'As authoritarianism advances, foundations are choosing silence.',
    image: 'https://substack-post-media.s3.amazonaws.com/public/images/abc.jpeg',
  })
  expect(fetchMock.mock.calls[0][1]).toMatchObject({next: {revalidate: 86400}})
})

test('uses the description when the subtitle is empty, and no summary when both are', async () => {
  replies.set(`${API}d`, {json: {title: 'D', subtitle: '', description: 'In an AI-saturated world, the fight ahead isn’t just about content.'}})
  replies.set(`${API}e`, {json: {title: 'E', subtitle: null, description: '  '}})
  replies.set(`${API}f`, {json: {title: 'F', subtitle: 'Sub F', description: 'Desc F'}})
  expect((await getSubstackPost(`${POST}d`))?.subtitle).toBe('In an AI-saturated world, the fight ahead isn’t just about content.')
  expect((await getSubstackPost(`${POST}e`))?.subtitle).toBeUndefined()
  expect((await getSubstackPost(`${POST}f`))?.subtitle).toBe('Sub F')
})

test('drops covers from unknown hosts and posts without a cover', async () => {
  replies.set(`${API}a`, {json: {title: 'A', cover_image: 'https://example.com/logo.png'}})
  replies.set(`${API}b`, {json: {title: 'B', cover_image: null}})
  expect((await getSubstackPost(`${POST}a`))?.image).toBeUndefined()
  expect((await getSubstackPost(`${POST}b`))?.image).toBeUndefined()
})

test('falls back to the post page without its share image', async () => {
  replies.set(`${API}c`, {status: 403})
  replies.set(`${POST}c`, {
    text: '<meta property="og:title" content="Stop Bringing Spreadsheets to a Values Fight"><meta property="og:description" content="What lies beneath every policy &amp; why."><meta property="og:image" content="https://substackcdn.com/image/fetch/logo.png">',
  })
  expect(await getSubstackPost(`${POST}c`)).toEqual({
    url: `${POST}c`,
    title: 'Stop Bringing Spreadsheets to a Values Fight',
    subtitle: 'What lies beneath every policy & why.',
  })
})

test('never fetches an address outside our Substack', async () => {
  expect(await getSubstackPost('https://evil.example.com/p/x')).toBeNull()
  expect(fetchMock).not.toHaveBeenCalled()
})

test('reads the three latest posts from the RSS feed', async () => {
  const item = (slug: string, title: string, image?: string) => `<item>
    <title><![CDATA[${title}]]></title>
    <description><![CDATA[Subtitle of ${title}]]></description>
    <link>https://mboldenchange.substack.com/p/${slug}</link>
    ${image ? `<enclosure url="${image}" length="0" type="image/jpeg"/>` : ''}
  </item>`
  replies.set('https://mboldenchange.substack.com/feed', {
    text: `<rss><channel><title>mBOLDen</title><image><url>https://substackcdn.com/image/fetch/logo.png</url></image>
      ${item('one', 'One', 'https://substack-post-media.s3.amazonaws.com/public/images/1.jpeg')}
      ${item('two', 'Two &amp; Three')}
      ${item('three', 'Three')}
      ${item('four', 'Four')}
    </channel></rss>`,
  })
  const posts = await getLatestSubstackPosts(3)
  expect(posts.map((post) => post.title)).toEqual(['One', 'Two & Three', 'Three'])
  expect(posts[0].image).toBe('https://substack-post-media.s3.amazonaws.com/public/images/1.jpeg')
  expect(posts[1].image).toBeUndefined()
  expect(posts[2]).toMatchObject({url: `${POST}three`, subtitle: 'Subtitle of Three'})
})

test('picked posts keep their order, use overrides and alt text, and skip untitled ones', async () => {
  replies.set(`${API}a`, {json: {title: 'A', subtitle: '', description: 'From Substack', cover_image: 'https://substack-post-media.s3.amazonaws.com/public/images/a.jpeg'}})
  replies.set(`${API}b`, {status: 500})
  replies.set(`${POST}b`, {status: 500})
  replies.set(`${API}c`, {json: {title: 'C', subtitle: 'Sub C'}})
  const content = [
    {
      _key: 'pov',
      _type: 'pointOfView',
      heading: 'We Said What We Said',
      posts: [
        {_key: '1', _type: 'pointOfViewPost', url: `${POST}a`, alt: 'A photo', summary: 'Our own summary'},
        {_key: '2', _type: 'pointOfViewPost', url: `${POST}b`},
        {_key: '3', _type: 'pointOfViewPost', url: `${POST}c`, title: 'Our title'},
      ],
    },
  ] as unknown as PageBuilder
  const [block] = (await resolvePointOfViewBlocks(content)) as unknown as Array<{cards: unknown[]}>
  expect(block.cards).toEqual([
    {key: '1', url: `${POST}a`, title: 'A', summary: 'Our own summary', image: {src: 'https://substack-post-media.s3.amazonaws.com/public/images/a.jpeg', alt: 'A photo'}},
    {key: '3', url: `${POST}c`, title: 'Our title', summary: 'Sub C', image: undefined},
  ])
})
