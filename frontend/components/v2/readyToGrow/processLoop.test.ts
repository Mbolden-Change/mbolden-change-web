import type {PageBuilder} from '@/sanity/types'
import {
  buildLoop,
  clipRanges,
  dashFor,
  DESKTOP_LAYOUT,
  latestStage,
  MOBILE_LAYOUT,
  PROCESS_LOOP_DEFAULTS,
  resolveStages,
  trailCovers,
  trailRanges,
  withDefaultProcessLoop,
} from './processLoop'

describe.each([
  ['desktop', DESKTOP_LAYOUT],
  ['mobile', MOBILE_LAYOUT],
])('%s drawing', (_name, layout) => {
  const loop = buildLoop(layout)

  it('is a closed loop that ends where it starts', () => {
    const [startX, startY] = loop.pointAt(0)
    const [endX, endY] = loop.pointAt(loop.total - 0.001)
    expect(Math.hypot(endX - startX, endY - startY)).toBeLessThan(0.5)
  })

  it('reaches the six stages in order, the sixth on the return', () => {
    const positions = loop.stagePositions
    expect(positions).toHaveLength(6)
    positions.slice(1).forEach((position, index) => expect(position).toBeGreaterThan(positions[index]))
    expect(positions[4]).toBeLessThan(loop.segments[4].to)
    expect(positions[5]).toBeGreaterThan(loop.boltExit)
  })

  it('puts each stage on the line, near its anchor', () => {
    layout.stages.forEach(({anchor}, index) => {
      const [x, y] = loop.pointAt(loop.stagePositions[index])
      expect(Math.hypot(x - anchor[0], y - anchor[1])).toBeLessThan(15)
    })
  })

  it('splits the line into six stretches that cover it once', () => {
    expect(loop.segments).toHaveLength(6)
    expect(loop.segments[0].from).toBe(0)
    expect(loop.segments[5].to).toBeCloseTo(loop.total)
    loop.segments.forEach((segment) => expect(segment.to).toBeGreaterThan(segment.from))
    expect(loop.boltEnd).toBeGreaterThan(loop.segments[4].to)
    expect(loop.boltExit).toBeGreaterThan(loop.boltEnd)
  })
})

describe('the trail', () => {
  it('grows from nothing on the first lap', () => {
    expect(trailRanges(0, 1000)).toEqual([])
    expect(trailRanges(300, 1000)).toEqual([[0, 300]])
    expect(trailRanges(900, 1000)).toEqual([[180, 900]])
  })

  it('wraps past the end of the path into two stretches and never resets', () => {
    expect(trailRanges(1000, 1000)).toEqual([[280, 1000]])
    expect(trailRanges(1200, 1000)).toEqual([
      [0, 200],
      [480, 1000],
    ])
    expect(trailRanges(5200, 1000)).toEqual(trailRanges(1200, 1000))
  })

  it('clips to a stretch and turns it into a dash pattern with a positive offset', () => {
    const ranges = trailRanges(1200, 1000)
    expect(clipRanges(ranges, 100, 600)).toEqual([
      [100, 200],
      [480, 600],
    ])
    expect(clipRanges(ranges, 250, 400)).toEqual([])
    expect(dashFor([], 1000)).toBeNull()
    expect(dashFor([[100, 200]], 1000)).toEqual({array: '100.00 1010.00', offset: 1010})
    expect(dashFor(clipRanges(ranges, 100, 600), 1000)).toEqual({
      array: '100.00 280.00 120.00 1010.00',
      offset: 1410,
    })
  })

  it('shows a chip from when the head reaches it until the tail passes it', () => {
    expect(trailCovers(99, 1000, 100)).toBe(false)
    expect(trailCovers(100, 1000, 100)).toBe(true)
    expect(trailCovers(820, 1000, 100)).toBe(true)
    expect(trailCovers(821, 1000, 100)).toBe(false)
    expect(trailCovers(1100, 1000, 100)).toBe(true)
    // The bolt: on once the head has traced it, off once the tail has left it.
    expect(trailCovers(600, 1000, 500, 550)).toBe(true)
    expect(trailCovers(1269, 1000, 500, 550)).toBe(true)
    expect(trailCovers(1271, 1000, 500, 550)).toBe(false)
  })

  it('captions the stage reached most recently', () => {
    const positions = [50, 300, 400, 700]
    expect(latestStage(10, 1000, positions)).toBe(-1)
    expect(latestStage(60, 1000, positions)).toBe(0)
    expect(latestStage(450, 1000, positions)).toBe(2)
    expect(latestStage(1020, 1000, positions)).toBe(3)
    expect(latestStage(1060, 1000, positions)).toBe(0)
  })
})

describe('wording', () => {
  it('uses Studio wording where it is filled in and the defaults elsewhere', () => {
    const stages = resolveStages([{label: 'Hear', description: ' '}, null])
    expect(stages).toHaveLength(6)
    expect(stages[0]).toEqual({label: 'Hear', description: PROCESS_LOOP_DEFAULTS.stages[0].description})
    expect(stages[5].label).toBe('Share back & listen')
  })
})

describe('withDefaultProcessLoop', () => {
  const contact = {name: 'Sue Sutherland', email: 'sue@mboldenchange.org'}
  const content = [
    {_key: 'a', _type: 'colorBlockHero', heading: 'Piloted, Validated, Ready to Grow'},
    {_key: 'b', _type: 'caseStudyCards', heading: 'Guaranteed Income'},
    {_key: 'c', _type: 'funderCta', heading: "Invest in What's Possible", emailSubject: 'Ready to Grow', contact},
  ] as unknown as PageBuilder

  it('adds the loop after the hero on Ready to Grow, with the Funder Invitation email link', () => {
    const result = withDefaultProcessLoop('ready-to-grow', content)
    expect(result.map((block) => block._type)).toEqual(['colorBlockHero', 'processLoop', 'caseStudyCards', 'funderCta'])
    expect(result[1]).toMatchObject({contact, emailSubject: 'Ready to Grow'})
  })

  it('leaves other pages alone, and a page that already has the block', () => {
    expect(withDefaultProcessLoop('resources', content)).toBe(content)
    const withBlock = [...content, {_key: 'd', _type: 'processLoop'}] as unknown as PageBuilder
    expect(withDefaultProcessLoop('ready-to-grow', withBlock)).toBe(withBlock)
  })
})
