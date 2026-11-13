/**
 * @jest-environment node
 */
import {renderToStaticMarkup} from 'react-dom/server'
import JsonLd from '@/components/JsonLd'
import TextMedia from '@/components/v2/blocks/TextMedia/TextMedia'
import type {TextMedia as TextMediaType} from '@/sanity/types'
import {
  collectSearchSummaries,
  guardSearchSummaryList,
  pickGuardedSchemas,
  stripSearchSummaries,
} from '../index'

jest.mock('@/lib/analytics', () => ({isDonateCta: () => false, trackDonateClick: jest.fn()}))
jest.mock('@/sanity/lib/image', () => ({urlFor: jest.fn(), getDimensionsFromRef: jest.fn()}))
jest.mock('@/components/PortableTextComponent', () => ({
  __esModule: true,
  default: () => <p>Body copy</p>,
}))

const page = {title: "What We're Tackling", path: '/what-were-tackling'}

const popUp = (
  sectionId: string,
  headline: string,
  extra: {subtitle?: string; searchSummary?: string} = {},
) => ({
  _type: 'textMedia' as const,
  _key: sectionId,
  appearance: 'pilotDialog' as const,
  sectionId,
  headline,
  textBody: [],
  ...extra,
})

const gateway = popUp('gateway-fund', 'The Gateway Fund', {
  subtitle: 'Bridging the gap to legal protection',
  searchSummary: 'Test summary one for the Gateway Fund.',
})
const safetyNet = popUp('student-family-safety-net', 'Student & Family Safety Net', {
  searchSummary: 'Test summary two for the Safety Net.',
})
const careAccess = popUp('care-access-fund', 'Care Access Fund', {
  subtitle: '   ',
  searchSummary: 'Test summary three for Care Access.',
})

const build = (content: unknown[]) =>
  pickGuardedSchemas([guardSearchSummaryList(collectSearchSummaries(content), page)])

describe('search summary JSON-LD', () => {
  it('emits nothing when no block has a summary', () => {
    const content = [popUp('gateway-fund', 'The Gateway Fund'), {_type: 'faq', _key: 'faq'}]
    expect(collectSearchSummaries(content)).toEqual([])
    expect(build(content)).toEqual([])
    expect(build([])).toEqual([])
    expect(guardSearchSummaryList(null, page).ok).toBe(false)
  })

  it('emits one ItemList with one CreativeWork for one summary', () => {
    expect(build([gateway])).toEqual([
      {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: "What We're Tackling",
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            item: {
              '@type': 'CreativeWork',
              name: 'The Gateway Fund',
              alternateName: 'Bridging the gap to legal protection',
              description: 'Test summary one for the Gateway Fund.',
              url: 'https://www.mboldenchange.org/what-were-tackling#gateway-fund',
              creator: {'@id': 'https://www.mboldenchange.org/#organization'},
            },
          },
        ],
      },
    ])
  })

  it('lists three summaries in page order, numbered from 1', () => {
    const [list] = build([gateway, {_type: 'faq', _key: 'faq'}, safetyNet, careAccess])
    const elements = list.itemListElement as Array<{
      position: number
      item: Record<string, unknown>
    }>
    expect(elements.map((element) => element.position)).toEqual([1, 2, 3])
    expect(elements.map((element) => element.item.url)).toEqual([
      'https://www.mboldenchange.org/what-were-tackling#gateway-fund',
      'https://www.mboldenchange.org/what-were-tackling#student-family-safety-net',
      'https://www.mboldenchange.org/what-were-tackling#care-access-fund',
    ])
  })

  it('omits alternateName when the subtitle is missing or blank', () => {
    const [list] = build([safetyNet, careAccess])
    const elements = list.itemListElement as Array<{item: Record<string, unknown>}>
    for (const element of elements) expect(element.item).not.toHaveProperty('alternateName')
  })

  it('skips blocks without a Section ID or without a summary', () => {
    const noSection = {...gateway, _key: 'a', sectionId: undefined}
    const blankSection = {...gateway, _key: 'b', sectionId: ' '}
    const noSummary = popUp('no-summary', 'No summary')
    const blankSummary = popUp('blank-summary', 'Blank summary', {searchSummary: '  '})
    const otherBlock = {_type: 'faq', _key: 'c', sectionId: 'faq', searchSummary: 'Not a pop-up.'}
    const [list] = build([noSection, blankSection, noSummary, safetyNet, blankSummary, otherBlock])
    const elements = list.itemListElement as Array<{position: number; item: Record<string, unknown>}>
    expect(elements).toHaveLength(1)
    expect(elements[0].position).toBe(1)
    expect(elements[0].item.name).toBe('Student & Family Safety Net')
  })

  it('reads blocks inside tabs and builds the home page address', () => {
    const tabs = {_type: 'tabsContainer', _key: 't', tabs: [{content: [safetyNet]}, null]}
    const result = guardSearchSummaryList(collectSearchSummaries([gateway, tabs]), {
      title: 'Home',
      path: '/',
    })
    expect(result.ok).toBe(true)
    if (!result.ok) return
    const elements = result.data.itemListElement as Array<{item: Record<string, unknown>}>
    expect(elements.map((element) => element.item.url)).toEqual([
      'https://www.mboldenchange.org/#gateway-fund',
      'https://www.mboldenchange.org/#student-family-safety-net',
    ])
  })

  // The schema.org terms this markup relies on. Each property is defined for
  // its type at schema.org (ItemList, ListItem, CreativeWork, all via Thing).
  it('uses only schema.org types and properties defined for them', () => {
    const vocabulary: Record<string, string[]> = {
      ItemList: ['name', 'itemListElement'],
      ListItem: ['position', 'item'],
      CreativeWork: ['name', 'alternateName', 'description', 'url', 'creator'],
    }
    const check = (node: Record<string, unknown>) => {
      const type = node['@type']
      if (typeof type !== 'string') {
        expect(Object.keys(node)).toEqual(['@id'])
        return
      }
      expect(Object.keys(vocabulary)).toContain(type)
      for (const [key, value] of Object.entries(node)) {
        if (key.startsWith('@')) continue
        expect(vocabulary[type]).toContain(key)
        for (const child of Array.isArray(value) ? value : [value]) {
          if (child && typeof child === 'object') check(child as Record<string, unknown>)
        }
      }
    }
    const [list] = build([gateway, safetyNet, careAccess])
    expect(list['@context']).toBe('https://schema.org')
    check(list)
  })
})

describe('search summaries stay out of the page', () => {
  it('removes the field from Text & Media blocks, including inside tabs', () => {
    const tabs = {_type: 'tabsContainer', _key: 't', tabs: [{_key: 'tab', content: [safetyNet]}]}
    const stripped = stripSearchSummaries([gateway, tabs, {_type: 'faq', _key: 'faq'}])
    expect(JSON.stringify(stripped)).not.toContain('Test summary')
    expect(JSON.stringify(stripped)).not.toContain('searchSummary')
    expect(stripped[0]).toEqual({...gateway, searchSummary: undefined})
    expect(collectSearchSummaries(stripped)).toEqual([])
    // The original blocks are left as they were.
    expect(gateway.searchSummary).toBe('Test summary one for the Gateway Fund.')
  })

  it('renders the summary only inside the application/ld+json script', () => {
    const content = [gateway, safetyNet, careAccess]
    const html = renderToStaticMarkup(
      <>
        <JsonLd data={build(content)} />
        {(stripSearchSummaries(content) as TextMediaType[]).map((block) => (
          <TextMedia key={block.sectionId} {...block} />
        ))}
      </>,
    )

    const scripts = html.match(/<script type="application\/ld\+json">[\s\S]*?<\/script>/g) ?? []
    expect(scripts).toHaveLength(1)
    const script = scripts[0] ?? ''
    const parsed = JSON.parse(script.replace(/^<script[^>]*>|<\/script>$/g, ''))
    expect(parsed['@type']).toBe('ItemList')
    expect(parsed.itemListElement).toHaveLength(3)

    // The pop-ups themselves are still in the page.
    expect(html).toContain('id="gateway-fund"')
    expect(html).toContain('id="student-family-safety-net"')
    expect(html).toContain('id="care-access-fund"')

    const outsideScript = html.replace(script, '')
    expect(outsideScript).not.toContain('Test summary')
    expect(outsideScript).not.toContain('searchSummary')
  })

  it('keeps the summary out even if a block reaches the component unstripped', () => {
    const html = renderToStaticMarkup(<TextMedia {...(gateway as TextMediaType)} />)
    expect(html).toContain('id="gateway-fund"')
    expect(html).not.toContain('Test summary')
  })

  it('cannot close the script tag from inside a summary', () => {
    const tricky = popUp('tricky', 'Tricky', {searchSummary: 'A </script><b>bold</b> claim.'})
    const html = renderToStaticMarkup(<JsonLd data={build([tricky])} />)
    expect(html.match(/<\/script>/g)).toHaveLength(1)
    const parsed = JSON.parse(html.replace(/^<script[^>]*>|<\/script>$/g, ''))
    expect(parsed.itemListElement[0].item.description).toBe('A </script><b>bold</b> claim.')
  })
})
