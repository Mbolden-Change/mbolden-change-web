import type {AdvancementContact} from '@/lib/getProgramCaseStudy'
import type {PageBuilder, ProcessLoop} from '@/sanity/types'

// Community-Centered Design Process loop: wording defaults, the two drawings and the trail math.
// Nothing here touches the DOM, so the page can render the finished drawing
// on the server and the math can be tested.

export type ProcessLoopStage = {label: string; description: string}

/** The wording the block starts with. Any field left empty in Studio falls back to it. */
export const PROCESS_LOOP_DEFAULTS = {
  heading: 'Our Community-Centered Design Process',
  linkText: 'Talk with us about funding a model',
  stages: [
    {label: 'Listen', description: 'We listen to those closest to the challenges.'},
    {label: 'Build trust', description: "We become deeply integrated and invested in our partners' success."},
    {label: 'Co-create', description: 'There is no one size fits all.'},
    {label: 'Implement', description: "We implement alongside partners, or incubate when they're not positioned to."},
    {label: 'Learn & adapt', description: "Data and feedback inform what's next."},
    {
      label: 'Share back & listen',
      description: 'We bring what we learned back to community and partners, and start again.',
    },
  ] as ProcessLoopStage[],
}

/** Six stages: Studio's wording where it is filled in, the defaults elsewhere. */
export function resolveStages(stages?: Array<Partial<ProcessLoopStage> | null> | null): ProcessLoopStage[] {
  return PROCESS_LOOP_DEFAULTS.stages.map((fallback, index) => ({
    label: stages?.[index]?.label?.trim() || fallback.label,
    description: stages?.[index]?.description?.trim() || fallback.description,
  }))
}

type Block = PageBuilder[number]
type FunderBlock = {contact?: AdvancementContact; emailSubject?: string}

/**
 * Ready to Grow shows the loop right after its hero even before the block is
 * added in Studio, with the default wording and the Funder Invitation's email
 * link. Once the page has a Community-Centered Design Process block, that block is used as it
 * is and this does nothing.
 */
export function withDefaultProcessLoop(slug: string, content: PageBuilder): PageBuilder {
  if (slug !== 'ready-to-grow' || !Array.isArray(content)) return content
  if (content.some((block) => block._type === 'processLoop')) return content
  const hero = content.findIndex((block) => block._type === 'colorBlockHero')
  if (hero < 0) return content
  const funder = content.find((block) => block._type === 'funderCta') as FunderBlock | undefined
  const loop = {
    _type: 'processLoop',
    _key: 'process-loop-default',
    contact: funder?.contact,
    emailSubject: funder?.emailSubject,
  } as ProcessLoop & {_key: string}
  return [...content.slice(0, hero + 1), loop as Block, ...content.slice(hero + 1)]
}

// ---- Drawings ---------------------------------------------------------------

export type Point = [number, number]

export type LoopLayout = {
  width: number
  height: number
  /** The forward pass: from the start to the bolt's first corner. */
  forward: string
  /** The bolt's corners. The line traces them in order, back to the first. */
  bolt: Point[]
  /** Which corner is the bolt's tip. The line goes back to it before returning. */
  tip: number
  /** The return: path commands from the bolt's tip back to the start. */
  back: string
  /** Where each stage sits on the line, and its chip's center x and top y. */
  stages: Array<{anchor: Point; chip: Point}>
}

/** Desktop and tablet drawing: the line runs left to right and returns along the bottom. */
export const DESKTOP_LAYOUT: LoopLayout = {
  width: 680,
  height: 335,
  forward:
    'M30 170 C50 120 80 220 115 190 C150 160 135 105 110 125 C88 145 130 185 170 160 C210 135 195 85 230 95 C270 108 240 200 205 190 C180 180 215 130 260 140 C310 150 330 120 380 125 C430 130 470 95 520 95 L560 95',
  bolt: [
    [560, 95],
    [610, 95],
    [585, 150],
    [625, 150],
    [545, 265],
    [570, 180],
    [535, 180],
  ],
  tip: 4,
  back: 'C530 300 470 318 360 318 C220 318 60 318 30 250 C22 228 22 195 30 170',
  stages: [
    {anchor: [75, 165], chip: [72, 20]},
    // Build trust sits where the line passes before it reaches Co-create, so the stages light up in order.
    {anchor: [170, 160], chip: [180, 236]},
    {anchor: [230, 95], chip: [230, 20]},
    {anchor: [370, 125], chip: [362, 20]},
    {anchor: [500, 97], chip: [512, 20]},
    {anchor: [380, 318], chip: [380, 250]},
  ],
}

/** Phone drawing: the line runs top to bottom and returns up the left side. */
export const MOBILE_LAYOUT: LoopLayout = {
  width: 335,
  height: 730,
  forward:
    'M60 22 C130 14 210 30 215 70 C220 115 150 120 150 90 C150 60 235 70 245 120 C255 170 150 150 135 190 C120 235 215 250 225 215 C232 190 170 185 165 235 C160 290 235 300 235 350 C235 400 190 400 200 440 C206 462 230 470 258 470',
  bolt: [
    [258, 470],
    [308, 470],
    [283, 525],
    [323, 525],
    [243, 640],
    [268, 555],
    [233, 555],
  ],
  tip: 4,
  back: 'C238 690 215 718 165 718 C70 718 12 705 12 630 L12 90 C12 45 30 26 60 22',
  stages: [
    {anchor: [150, 90], chip: [72, 50]},
    {anchor: [245, 120], chip: [268, 150]},
    {anchor: [135, 190], chip: [78, 232]},
    {anchor: [235, 350], chip: [272, 296]},
    {anchor: [200, 430], chip: [100, 418]},
    {anchor: [140, 718], chip: [132, 650]},
  ],
}

export const CHIP_HEIGHT = 26
/** How far each slanted side of a chip leans. */
export const CHIP_SLANT = 8

/** A chip's width before its text has been measured in the browser. */
export const estimateChipWidth = (label: string) => Math.round(label.length * 7.6 + 34)

/** The parallelogram for a chip of this width, centered on x. */
export function chipPoints([x, top]: Point, width: number) {
  const half = width / 2
  const lean = CHIP_SLANT / 2
  return [
    [x - half + lean, top],
    [x + half + lean, top],
    [x + half - lean, top + CHIP_HEIGHT],
    [x - half - lean, top + CHIP_HEIGHT],
  ]
    .map((point) => point.join(','))
    .join(' ')
}

// ---- Path geometry ----------------------------------------------------------

const CURVE_STEPS = 48

/** Turns a path of absolute M, L and C commands into a fine polyline. */
export function flattenPath(d: string): Point[] {
  const tokens = d.match(/[MLC]|-?\d*\.?\d+/g) ?? []
  const points: Point[] = []
  let index = 0
  let command = ''
  const next = () => Number(tokens[index++])
  while (index < tokens.length) {
    if (/[MLC]/.test(tokens[index])) command = tokens[index++]
    if (command === 'C') {
      const [x0, y0] = points[points.length - 1]
      const [x1, y1, x2, y2, x3, y3] = [next(), next(), next(), next(), next(), next()]
      for (let step = 1; step <= CURVE_STEPS; step++) {
        const t = step / CURVE_STEPS
        const u = 1 - t
        points.push([
          u * u * u * x0 + 3 * u * u * t * x1 + 3 * u * t * t * x2 + t * t * t * x3,
          u * u * u * y0 + 3 * u * u * t * y1 + 3 * u * t * t * y2 + t * t * t * y3,
        ])
      }
    } else {
      points.push([next(), next()])
    }
  }
  return points
}

const line = (points: Point[]) => points.map(([x, y]) => `L${x} ${y}`).join(' ')

export type LoopSegment = {from: number; to: number}

export type Loop = {
  /** The whole closed path. */
  d: string
  total: number
  /** Where each stage sits, as a distance along the path. */
  stagePositions: number[]
  /** Where the line has finished tracing the bolt. */
  boltEnd: number
  /** Where the line leaves the bolt for the return. */
  boltExit: number
  /** Six stretches, each drawn in its own color: four between stages, the run-up to the bolt, then the bolt and the return. */
  segments: LoopSegment[]
  pointAt: (distance: number) => Point
}

/** Measures a drawing: its length, where the stages sit and where the colors change. */
export function buildLoop(layout: LoopLayout): Loop {
  const [first, ...rest] = layout.bolt
  const retrace = layout.bolt.slice(layout.tip).reverse()
  const d = `${layout.forward} ${line([...rest, first])} ${line(retrace)} ${layout.back}`

  const points = flattenPath(d)
  const lengths = [0]
  for (let i = 1; i < points.length; i++) {
    lengths.push(lengths[i - 1] + Math.hypot(points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1]))
  }
  const total = lengths[lengths.length - 1]

  const forwardEnd = lengths[flattenPath(layout.forward).length - 1]
  const boltEnd = lengths[flattenPath(`${layout.forward} ${line([...rest, first])}`).length - 1]
  const boltExit = lengths[flattenPath(`${layout.forward} ${line([...rest, first])} ${line(retrace)}`).length - 1]

  /** The distance along the path, between two distances, of the point nearest to a target. */
  const nearest = ([x, y]: Point, from: number, to: number) => {
    let best = from
    let bestGap = Infinity
    for (let i = 1; i < points.length; i++) {
      if (lengths[i] < from || lengths[i - 1] > to) continue
      const [ax, ay] = points[i - 1]
      const [bx, by] = points[i]
      const span = (bx - ax) ** 2 + (by - ay) ** 2
      const t = span ? Math.min(1, Math.max(0, ((x - ax) * (bx - ax) + (y - ay) * (by - ay)) / span)) : 0
      const gap = Math.hypot(x - (ax + t * (bx - ax)), y - (ay + t * (by - ay)))
      if (gap < bestGap) {
        bestGap = gap
        best = lengths[i - 1] + t * (lengths[i] - lengths[i - 1])
      }
    }
    return Math.min(to, Math.max(from, best))
  }

  // The first five stages are on the forward pass; the sixth is on the return.
  const stagePositions = layout.stages.map(({anchor}, index) =>
    index < 5 ? nearest(anchor, 0, forwardEnd) : nearest(anchor, boltExit, total),
  )

  const cuts = [0, ...stagePositions.slice(1, 5), forwardEnd, total]
  const segments = cuts.slice(1).map((to, index) => ({from: cuts[index], to}))

  const pointAt = (distance: number): Point => {
    const at = ((distance % total) + total) % total
    let low = 1
    let high = lengths.length - 1
    while (low < high) {
      const mid = (low + high) >> 1
      if (lengths[mid] < at) low = mid + 1
      else high = mid
    }
    const span = lengths[low] - lengths[low - 1]
    const t = span ? (at - lengths[low - 1]) / span : 0
    return [
      points[low - 1][0] + t * (points[low][0] - points[low - 1][0]),
      points[low - 1][1] + t * (points[low][1] - points[low - 1][1]),
    ]
  }

  return {d, total, stagePositions, boltEnd, boltExit, segments, pointAt}
}

// ---- The trail ----------------------------------------------------------------

/** One lap of the loop, at constant speed. */
export const LAP_MS = 9000
/** The trail covers this share of the loop. */
export const TRAIL_SHARE = 0.72

export type Range = [number, number]

/**
 * The stretches of the path the trail covers once its head has travelled
 * `distance`. The trail grows from nothing on the first lap, then keeps its
 * length and wraps past the end of the path into two stretches.
 */
export function trailRanges(distance: number, total: number, share = TRAIL_SHARE): Range[] {
  const tail = Math.max(0, distance - total * share)
  if (distance - tail <= 0) return []
  const from = tail % total
  const to = distance % total || total
  return from < to
    ? [[from, to]]
    : [
        [0, to],
        [from, total],
      ]
}

/** The parts of the trail that fall inside one stretch of the path. */
export function clipRanges(ranges: Range[], from: number, to: number): Range[] {
  return ranges
    .map(([start, end]): Range => [Math.max(start, from), Math.min(end, to)])
    .filter(([start, end]) => end - start > 0.01)
}

/**
 * stroke-dasharray and stroke-dashoffset that show only these stretches of a
 * path. Null when there is nothing to show. The offset is kept positive.
 */
export function dashFor(ranges: Range[], total: number): {array: string; offset: number} | null {
  if (!ranges.length) return null
  const sorted = [...ranges].sort((a, b) => a[0] - b[0])
  const parts: number[] = []
  sorted.forEach(([start, end], index) => {
    parts.push(end - start)
    // The gap to the next stretch; after the last one, a gap longer than the path.
    parts.push(index < sorted.length - 1 ? sorted[index + 1][0] - end : total + 10)
  })
  const period = parts.reduce((sum, part) => sum + part, 0)
  return {array: parts.map((part) => part.toFixed(2)).join(' '), offset: Number((period - sorted[0][0]).toFixed(2))}
}

/** True from when the trail's head reaches `from` until its tail passes `to` (the same point when `to` is left out). */
export function trailCovers(distance: number, total: number, from: number, to = from, share = TRAIL_SHARE) {
  if (distance < from) return false
  const laps = Math.floor((distance - from) / total)
  const tail = Math.max(0, distance - total * share)
  return tail <= to + laps * total
}

/** The stage the head reached most recently, or -1 before it has reached any. */
export function latestStage(distance: number, total: number, positions: number[]) {
  let latest = -1
  let least = Infinity
  positions.forEach((position, index) => {
    if (distance < position) return
    const since = (distance - position) % total
    if (since < least) {
      least = since
      latest = index
    }
  })
  return latest
}

/** Which stretch of the path a distance falls in. */
export function segmentAt(distance: number, loop: Loop) {
  const at = distance % loop.total
  const index = loop.segments.findIndex((segment) => at < segment.to)
  return index < 0 ? loop.segments.length - 1 : index
}
