/** @jest-environment node */
import {
  authorName,
  buildPost,
  cleanPostHtml,
  countWords,
  firstSentence,
  htmlToText,
  levelHeadings,
  newestFirst,
  parseFeed,
  substackSlugOf,
} from './core'

const clean = (html: string, knownSlugs: string[] = []) => cleanPostHtml(html, {slug: 'this-post', knownSlugs})

describe('cleanPostHtml', () => {
  test('keeps plain formatting and every word', () => {
    const html = '<h2><strong>Title</strong></h2><p>One <em>two</em> <strong>three</strong>.</p><ul><li><p>a</p></li></ul><blockquote><p>q</p></blockquote><div><hr></div>'
    expect(clean(html).html).toBe('<h2><strong>Title</strong></h2><p>One <em>two</em> <strong>three</strong>.</p><ul><li><p>a</p></li></ul><blockquote><p>q</p></blockquote><hr>')
  })

  test('nothing runs: scripts, handlers, styles and odd links are gone', () => {
    const {html} = clean(
      '<p onclick="x()" style="color:red">Hi <a href="javascript:alert(1)">there</a><script>alert(1)</script><img src="https://evil.example/x.png" onerror="x()"></p><style>p{}</style><iframe src="https://evil.example"></iframe><form><input name="a"></form>',
    )
    expect(html).not.toMatch(/script|onclick|onerror|style|javascript|evil\.example|<form|<input/)
    expect(html).toContain('Hi there')
  })

  test('text is escaped, never passed through as markup', () => {
    expect(clean('<p>1 &lt; 2 &amp; "3" &lt;script&gt;</p>').html).toBe('<p>1 &lt; 2 &amp; &quot;3&quot; &lt;script&gt;</p>')
  })

  test('removes subscribe, share and comment buttons and sign-up boxes, and lists them', () => {
    const {html, notes} = clean(
      '<p>Before</p>' +
        '<p class="button-wrapper" data-component-name="ButtonCreateButton"><a class="button primary" href="https://mboldenchange.substack.com/subscribe?"><span>Subscribe now</span></a></p>' +
        '<p class="button-wrapper"><a class="button primary" href="https://mboldenchange.substack.com/p/this-post?utm_source=substack&action=share"><span>Share</span></a></p>' +
        '<p class="button-wrapper"><a class="button primary" href="https://mboldenchange.substack.com/p/this-post/comments"><span>Leave a comment</span></a></p>' +
        '<div class="subscription-widget-wrap-editor" data-component-name="SubscribeWidgetToDOM"><div class="subscription-widget show-subscribe"><div class="preamble"><p class="cta-caption">Thanks for reading We Said What We Said!</p></div><form><input type="email"><input type="submit" value="Subscribe"></form></div></div>' +
        '<p>After</p>',
    )
    expect(html).toBe('<p>Before</p><p>After</p>')
    expect(notes.map((note) => note.kind)).toEqual(['removed', 'removed', 'removed', 'removed'])
    expect(notes[3].what).toContain('Thanks for reading')
  })

  test('a button pointing somewhere else stays as a plain link', () => {
    const {html, notes} = clean('<p class="button-wrapper"><a class="button primary" href="https://www.mboldenaction.org/movemydaf/"><span>See where your DAF sponsor stands</span></a></p>')
    expect(html).toBe('<p><a href="https://www.mboldenaction.org/movemydaf/" target="_blank" rel="noopener noreferrer">See where your DAF sponsor stands</a></p>')
    expect(notes[0].kind).toBe('changed')
  })

  test('keeps the words of a captioned share button, without the button', () => {
    const {html} = clean('<div class="captioned-button-wrap" data-component-name="CaptionedButtonToDOM"><div class="preamble"><p class="cta-caption"><em>Share if you agree.</em></p></div><p class="button-wrapper"><a class="button primary" href="https://mboldenchange.substack.com/p/x?action=share"><span>Share</span></a></p></div>')
    expect(html).toBe('<p><em>Share if you agree.</em></p>')
  })

  test('what only Substack can play becomes a link to the post there', () => {
    const {html, notes} = clean(
      '<div class="native-video-embed" data-component-name="VideoPlaceholder" data-attrs="{}"></div><div class="poll-embed" data-component-name="PollToDOM"></div><div data-component-name="SomethingNew"><p>inner</p></div>',
    )
    const line = '<p class="substack-fallback"><a href="https://mboldenchange.substack.com/p/this-post" target="_blank" rel="noopener noreferrer">View this on Substack</a></p>'
    expect(html).toBe(line.repeat(3))
    expect(notes.map((note) => note.what)).toEqual(['Substack-hosted video', 'poll', 'Substack “SomethingNew” block'])
  })

  test('links to our own posts stay on the site when the post is here; others are unchanged', () => {
    const {html} = clean(
      '<p><a href="https://mboldenchange.substack.com/p/here">a</a> <a href="http://mboldenchange.substack.com/p/here?utm_source=x">b</a> <a href="https://mboldenchange.substack.com/p/not-here">c</a> <a href="https://example.org/page?a=1&amp;b=2">d</a></p>',
      ['here'],
    )
    expect(html).toBe(
      '<p><a href="/point-of-view/here">a</a> <a href="/point-of-view/here">b</a> ' +
        '<a href="https://mboldenchange.substack.com/p/not-here" target="_blank" rel="noopener noreferrer">c</a> ' +
        '<a href="https://example.org/page?a=1&amp;b=2" target="_blank" rel="noopener noreferrer">d</a></p>',
    )
  })

  test('images come from Substack’s CDN with their alt text and caption', () => {
    const src = 'https://substackcdn.com/image/fetch/$s_!a!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fabc_10x5.jpeg'
    const {html, imageCount} = clean(
      `<div class="captioned-image-container"><figure><a class="image-link image2" target="_blank" href="${src}" data-component-name="Image2ToDOM"><div class="image2-inset"><picture><source type="image/webp" srcset="${src} 424w"><img src="${src}" width="10" height="5" alt="A sign" srcset="${src} 424w, ${src} 848w" sizes="100vw" data-attrs="{}"></picture><div class="image-link-expand"><button><svg></svg></button></div></div></a><figcaption class="image-caption">Photo: someone</figcaption></figure></div>`,
    )
    expect(imageCount).toBe(1)
    expect(html).toBe(
      `<figure><img src="${src}" width="10" height="5" alt="A sign" loading="lazy" decoding="async"><figcaption>Photo: someone</figcaption></figure>`,
    )
  })

  test('YouTube plays from youtube-nocookie.com; other frames do not load', () => {
    const {html} = clean(
      '<div id="youtube2-dQw4w9WgXcQ" class="youtube-wrap" data-attrs="{&quot;videoId&quot;:&quot;dQw4w9WgXcQ&quot;}" data-component-name="Youtube2ToDOM"><div class="youtube-inner"><iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ?rel=0&autoplay=1"></iframe></div></div><iframe src="https://player.vimeo.com/video/1"></iframe>',
    )
    expect(html).toContain('<iframe src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ" title="YouTube video" loading="lazy"')
    expect(html).not.toContain('autoplay=1')
    expect(html).not.toContain('vimeo')
    expect(html).toContain('View this on Substack')
  })

  test('footnotes keep their links within the page', () => {
    const {html} = clean(
      '<p>Text<a class="footnote-anchor" data-component-name="FootnoteAnchorToDOM" id="footnote-anchor-1" href="#footnote-1" target="_self">1</a></p><div class="footnote" data-component-name="FootnoteToDOM"><a id="footnote-1" href="#footnote-anchor-1" class="footnote-number" contenteditable="false" target="_self">1</a><div class="footnote-content"><p>Source.</p></div></div>',
    )
    expect(html).toBe(
      '<p>Text<a class="footnote-anchor" id="footnote-anchor-1" href="#footnote-1">1</a></p><div class="footnote"><a class="footnote-number" id="footnote-1" href="#footnote-anchor-1">1</a><div class="footnote-content"><p>Source.</p></div></div>',
    )
  })

  test('a space inside empty formatting is still a space; a post’s h1 becomes an h2', () => {
    expect(clean('<p>racial)<strong> </strong>wealth</p><p></p><h1>Big</h1>').html).toBe('<p>racial) wealth</p><h2>Big</h2>')
  })
})

test('headings follow the page title in order, with no level skipped', () => {
  expect(levelHeadings('<h3>a</h3><p>x</p><h3>b</h3>')).toBe('<h2>a</h2><p>x</p><h2>b</h2>')
  expect(levelHeadings('<h4>a</h4><h2>b</h2><h4>c</h4><h3>d</h3>')).toBe('<h2>a</h2><h2>b</h2><h3>c</h3><h3>d</h3>')
  expect(levelHeadings('<h2>a</h2><h3>b</h3><h4>c</h4>')).toBe('<h2>a</h2><h3>b</h3><h4>c</h4>')
})

describe('text helpers', () => {
  test('htmlToText leaves out fallback lines', () => {
    expect(htmlToText('<h2>A</h2><p>b c</p><p class="substack-fallback"><a href="#">View this on Substack</a></p>')).toBe('A b c')
    expect(countWords('A b c')).toBe(3)
  })

  test('firstSentence stops at the first real sentence end', () => {
    expect(firstSentence('Blink and you’ll miss it. Then more.')).toBe('Blink and you’ll miss it.')
    expect(firstSentence('The government shut down at 12:01 a.m., and it shows. Next.')).toBe('The government shut down at 12:01 a.m., and it shows.')
    expect(firstSentence('It is a right of every U.S. resident. So why not?')).toBe('It is a right of every U.S. resident.')
    expect(firstSentence('“An auction.” — Someone')).toBe('“An auction.”')
    expect(firstSentence('No end here')).toBe('No end here')
  })

  test('authorName writes our name properly and joins without an Oxford comma', () => {
    expect(authorName(['mBOLDenChange'])).toBe('mBOLDen Change')
    expect(authorName(['mBOLDenChange', 'Minh Ngo'])).toBe('mBOLDen Change and Minh Ngo')
    expect(authorName(['A', 'B', 'C'])).toBe('A, B and C')
    expect(authorName([])).toBe('mBOLDen Change')
  })

  test('substackSlugOf reads only post addresses on our Substack', () => {
    expect(substackSlugOf('https://mboldenchange.substack.com/p/words-hold-power?utm=1')).toBe('words-hold-power')
    expect(substackSlugOf('https://mboldenchange.substack.com/about')).toBeNull()
    expect(substackSlugOf('https://other.substack.com/p/words-hold-power')).toBeNull()
  })
})

describe('buildPost and parseFeed', () => {
  const feed = `<?xml version="1.0"?><rss xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:content="http://purl.org/rss/1.0/modules/content/"><channel><title><![CDATA[We Said What We Said]]></title>
    <item><title><![CDATA[A New Post ]]></title><description><![CDATA[Its subtitle]]></description><link>https://mboldenchange.substack.com/p/a-new-post</link><dc:creator><![CDATA[mBOLDenChange]]></dc:creator><pubDate>Fri, 13 Nov 2026 21:03:32 GMT</pubDate><enclosure url="https://substack-post-media.s3.amazonaws.com/public/images/abc_960x720.jpeg" length="0" type="image/jpeg"/><content:encoded><![CDATA[<p>First sentence. Second.</p><p class="button-wrapper"><a class="button primary" href="https://mboldenchange.substack.com/subscribe?"><span>Subscribe now</span></a></p>]]></content:encoded></item>
    <item><title>No body</title><link>https://mboldenchange.substack.com/p/empty</link></item></channel></rss>`

  test('reads posts from the feed and cleans them', () => {
    const items = parseFeed(feed)
    expect(items).toHaveLength(1)
    const {post} = buildPost(items[0], [])
    expect(post).toEqual({
      slug: 'a-new-post',
      title: 'A New Post',
      subtitle: 'Its subtitle',
      date: '2026-11-13T21:03:32.000Z',
      author: 'mBOLDen Change',
      coverImage: {url: 'https://substack-post-media.s3.amazonaws.com/public/images/abc_960x720.jpeg'},
      excerpt: 'Its subtitle',
      html: '<p>First sentence. Second.</p>',
    })
  })

  test('without a subtitle the excerpt is the first sentence', () => {
    expect(buildPost({slug: 's', title: 'T', html: '<div class="callout-block"><p>Guest note.</p></div><p>First sentence. Second.</p>'}, []).post.excerpt).toBe('First sentence.')
  })

  test('parseFeed returns nothing for something that is not a feed', () => {
    expect(parseFeed('<html><body>Service unavailable</body></html>')).toEqual([])
  })

  test('newestFirst', () => {
    expect(newestFirst([{date: '2025-01-01', slug: 'a'}, {date: '2026-01-01', slug: 'b'}]).map((p) => p.slug)).toEqual(['b', 'a'])
  })
})
