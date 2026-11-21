import {createRef} from 'react'
import {act, render, screen, within} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {track} from '@vercel/analytics'
import SearchExperience from './SearchExperience'
import {parseActionIndex} from '@/lib/search/actionSource'
import {assembleIndex} from '@/lib/search/buildIndex'
import {createSearchEngine} from '@/lib/search/engine'
import {stripSearchSummaries} from '@/lib/jsonld'
import {normalizeSearchQuery} from '@/lib/analytics'
import {withoutSearchQuery} from '@/components/SiteAnalytics'
import {ACTION_FILE, POSTS, SANITY} from '@/lib/search/testFixtures'
import type {SearchGroup} from '@/lib/search/types'

jest.mock('@vercel/analytics', () => ({track: jest.fn()}))
jest.mock('@vercel/analytics/next', () => ({Analytics: () => null}))
jest.mock('next/navigation', () => ({usePathname: () => '/what-were-tackling'}))

const manyPosts = Array.from({length: 5}, (_, n) => ({
  slug: `gateway-post-${n}`,
  title: `Gateway story ${n + 1}`,
  subtitle: 'A post about the Gateway Fund',
  date: `2026-0${n + 1}-10T18:00:00.000Z`,
  excerpt: 'A post',
  html: '<p>Gateway.</p>',
}))
const index = assembleIndex({sanity: SANITY, posts: [...POSTS, ...manyPosts], action: parseActionIndex(ACTION_FILE)})

jest.mock('@/lib/search/client', () => ({
  loadSearch: jest.fn(),
  preloadSearch: jest.fn(),
}))
const {loadSearch} = jest.requireMock('@/lib/search/client') as {loadSearch: jest.Mock}

function Harness({variant = 'panel' as 'panel' | 'page', start = ''}) {
  const React = jest.requireActual<typeof import('react')>('react')
  const [query, setQuery] = React.useState(start)
  const [group, setGroup] = React.useState<SearchGroup | null>(null)
  const inputRef = createRef<HTMLInputElement>()
  return (
    <SearchExperience
      variant={variant}
      query={query}
      onQueryChange={(value) => {
        setQuery(value)
        setGroup(null)
      }}
      group={group}
      onGroupChange={setGroup}
      inputRef={inputRef}
      inputId="search-input"
    />
  )
}

const setup = async (props: Parameters<typeof Harness>[0] = {}) => {
  const user = userEvent.setup({advanceTimers: jest.advanceTimersByTime})
  render(<Harness {...props} />)
  await act(async () => {})
  return user
}

beforeEach(() => {
  jest.useFakeTimers()
  loadSearch.mockResolvedValue({index, engine: createSearchEngine(index.entries)})
  ;(track as jest.Mock).mockClear()
})
afterEach(() => jest.useRealTimers())

describe('search', () => {
  it('has a labelled input, the placeholder and suggested words', async () => {
    await setup()
    const input = screen.getByLabelText('Search mBOLDen Change and mBOLDen Action')
    expect(input).toHaveAttribute('placeholder', 'Try a program, a fund, a post or a campaign')
    expect(screen.getByRole('group', {name: 'Suggested searches'})).toBeInTheDocument()
    for (const word of ['cash', 'immigrant', 'AI', 'DAF', 'therapy']) {
      expect(screen.getByRole('button', {name: `Search for ${word}`})).toBeInTheDocument()
    }
    // Before typing: the Popular list.
    const popular = screen.getByRole('region', {name: 'Popular'})
    expect(within(popular).getAllByRole('link').map((link) => link.getAttribute('href'))).toEqual([
      '/simulator',
      '/donate',
      '/point-of-view',
      'https://www.mboldenaction.org/',
    ])
  })

  it('shows results as you type, grouped in order, with the status line', async () => {
    const user = await setup()
    await user.type(screen.getByRole('textbox'), 'gateway')
    expect(screen.getByRole('status')).toHaveTextContent(/^\d+ results for “gateway”, best matches first$/)
    const headings = screen.getAllByRole('heading', {level: 2}).map((heading) => heading.textContent)
    expect(headings[0]).toMatch(/^What We're Tackling/)
    expect(headings.at(-1)).toMatch(/^Donate/)
    const first = screen.getAllByRole('listitem')[0]
    expect(within(first).getByRole('link')).toHaveAttribute('href', '/what-were-tackling#gateway-fund')
    expect(first).toHaveTextContent("What We're Tackling › The Gateway Fund")
  })

  it('shows three per group, then expands and folds in place', async () => {
    const user = await setup()
    await user.type(screen.getByRole('textbox'), 'gateway')
    const group = screen.getByRole('region', {name: /^Our Point of View, 5 results$/})
    expect(within(group).getAllByRole('listitem')).toHaveLength(3)
    await user.click(within(group).getByRole('button', {name: 'Show all 5 in Our Point of View'}))
    expect(within(group).getAllByRole('listitem')).toHaveLength(5)
    await user.click(within(group).getByRole('button', {name: 'Show fewer'}))
    expect(within(group).getAllByRole('listitem')).toHaveLength(3)
    expect(screen.getByRole('link', {name: /^See all \d+ results/})).toHaveAttribute('href', '/search?q=gateway')
  })

  it('filters to one group with toggle buttons', async () => {
    const user = await setup()
    await user.type(screen.getByRole('textbox'), 'gateway')
    const filters = screen.getByRole('group', {name: 'Show results from'})
    expect(within(filters).getByRole('button', {name: /^All \d+$/})).toHaveAttribute('aria-pressed', 'true')
    const pov = within(filters).getByRole('button', {name: 'Our Point of View 5'})
    await user.click(pov)
    expect(pov).toHaveAttribute('aria-pressed', 'true')
    // Only that group, with everything in it.
    expect(screen.getAllByRole('region')).toHaveLength(1)
    expect(screen.getAllByRole('listitem')).toHaveLength(5)
    expect(screen.queryByRole('button', {name: /Show all/})).not.toBeInTheDocument()
  })

  it('has no filter buttons when results come from one group', async () => {
    const user = await setup()
    await user.type(screen.getByRole('textbox'), 'therapy')
    // The pop-up and its page: one group.
    expect(screen.getByRole('status')).toHaveTextContent('2 results for “therapy”, best matches first')
    expect(screen.getAllByRole('region')).toHaveLength(1)
    expect(screen.queryByRole('group', {name: 'Show results from'})).not.toBeInTheDocument()
    expect(screen.queryByRole('link', {name: /See all/})).not.toBeInTheDocument()
  })

  it('opens mBOLDen Action in a new tab with its tag, and everything else in the same tab', async () => {
    const user = await setup()
    await user.type(screen.getByRole('textbox'), 'DAF')
    const action = screen.getByRole('link', {name: /Move My DAF/})
    expect(action).toHaveAttribute('href', 'https://www.mboldenaction.org/movemydaf/')
    expect(action).toHaveAttribute('target', '_blank')
    expect(action).toHaveTextContent('Opens mboldenaction.org')
    expect(action).toHaveTextContent('mboldenaction.org › Move My DAF')
    const donate = screen.getByRole('link', {name: /Other Ways to Give/})
    expect(donate).toHaveAttribute('href', '/donate#other-ways-to-give')
    expect(donate).not.toHaveAttribute('target')
  })

  it('expands every group on the /search page', async () => {
    await setup({variant: 'page', start: 'gateway'})
    const group = screen.getByRole('region', {name: /^Our Point of View, 5 results$/})
    expect(within(group).getAllByRole('listitem')).toHaveLength(5)
    expect(screen.queryByRole('button', {name: /Show all|Show fewer/})).not.toBeInTheDocument()
    expect(screen.queryByRole('link', {name: /See all/})).not.toBeInTheDocument()
  })

  it('says so when there is nothing, with Popular links and a way to get in touch', async () => {
    const user = await setup()
    await user.type(screen.getByRole('textbox'), 'zzzqqq')
    expect(screen.getByRole('status')).toHaveTextContent('No results for “zzzqqq”.')
    expect(
      screen.getByText(/We don’t have anything on that yet\. These are the places people go most, or/),
    ).toHaveTextContent('get in touch and we’ll point you in the right direction.')
    expect(screen.getByRole('link', {name: 'get in touch'})).toHaveAttribute('href', '/about#get-in-touch')
    expect(screen.getByRole('region', {name: 'Popular'})).toBeInTheDocument()
  })

  it('never renders hidden search keywords', async () => {
    const user = await setup()
    await user.type(screen.getByRole('textbox'), 'immigrant kids')
    expect(screen.getAllByRole('listitem')[0]).toHaveTextContent('The Gateway Fund')
    // The words typed are in the input and the status line, nowhere in the results.
    for (const item of screen.getAllByRole('listitem')) expect(item).not.toHaveTextContent(/immigrant kids/i)
    await user.clear(screen.getByRole('textbox'))
    await user.type(screen.getByRole('textbox'), 'gateway')
    expect(document.body).not.toHaveTextContent('SIJS filing fees SIJS')
    expect(document.body.innerHTML).not.toContain('immigrant kids')
  })

  it('removes search keywords from blocks before a page renders them', () => {
    const blocks = [
      {_type: 'textMedia', headline: 'The Gateway Fund', searchSummary: 'A summary.', searchKeywords: ['SIJS']},
      {_type: 'textMedia', headline: 'Another', searchKeywords: ['only keywords']},
      {_type: 'tabsContainer', tabs: [{content: [{_type: 'textMedia', headline: 'In a tab', searchKeywords: ['x']}]}]},
    ]
    const shown = JSON.stringify(stripSearchSummaries(blocks))
    expect(shown).not.toContain('searchKeywords')
    expect(shown).not.toContain('searchSummary')
    expect(shown).toContain('The Gateway Fund')
  })
})

describe('search analytics', () => {
  it('reports a search with no results once, after typing pauses', async () => {
    const user = await setup()
    await user.type(screen.getByRole('textbox'), '  ZZqq Xxyy')
    expect(track).not.toHaveBeenCalled()
    act(() => jest.advanceTimersByTime(1400))
    expect(track).not.toHaveBeenCalled()
    act(() => jest.advanceTimersByTime(200))
    expect(track).toHaveBeenCalledTimes(1)
    expect(track).toHaveBeenCalledWith('Search No Results', {query: 'zzqq xxyy'})

    // The same query again in this visit isn't sent twice.
    await user.clear(screen.getByRole('textbox'))
    await user.type(screen.getByRole('textbox'), 'zzqq xxyy')
    act(() => jest.advanceTimersByTime(2000))
    expect(track).toHaveBeenCalledTimes(1)
  })

  it('sends nothing while results are found', async () => {
    const user = await setup()
    await user.type(screen.getByRole('textbox'), 'gateway')
    act(() => jest.advanceTimersByTime(5000))
    expect(track).not.toHaveBeenCalled()
  })

  it('reports a result click with its group and no query', async () => {
    const user = await setup()
    await user.type(screen.getByRole('textbox'), 'DAF')
    const link = screen.getByRole('link', {name: /Move My DAF/})
    link.addEventListener('click', (event) => event.preventDefault())
    await user.click(link)
    expect(track).toHaveBeenCalledTimes(1)
    expect(track).toHaveBeenCalledWith('Search Result Click', {group: 'From mBOLDen Action'})
  })

  it('lowercases, trims and cuts the query to 60 characters', () => {
    expect(normalizeSearchQuery('  Guaranteed   INCOME ')).toBe('guaranteed income')
    expect(normalizeSearchQuery('x'.repeat(80))).toHaveLength(60)
  })

  it('keeps the query out of page-view addresses', () => {
    const sent = withoutSearchQuery({type: 'pageview', url: 'https://www.mboldenchange.org/search?q=private+words&group=About'})
    expect(sent.url).toBe('https://www.mboldenchange.org/search')
    const other = {type: 'pageview' as const, url: 'https://www.mboldenchange.org/donate?utm_source=x'}
    expect(withoutSearchQuery(other)).toBe(other)
  })
})
