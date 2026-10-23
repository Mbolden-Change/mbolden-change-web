/** Card colors by kind, as in the approved Resources mockup. */
export const KIND_LANE: Record<string, string> = {
  guide: 'var(--brand-aqua-teal)',
  tool: 'var(--brand-warm-yellow)',
  briefing: 'var(--brand-fuchsia)',
  report: 'var(--brand-black)',
  video: 'var(--brand-fuchsia)',
}

export const KIND_LABEL: Record<string, string> = {
  guide: 'Guide',
  tool: 'Tool',
  briefing: 'Briefing',
  report: 'Report',
  video: 'Video',
}

/** Filter chips, in order: the plural of each kind. */
export const FILTERS = [
  {key: 'all', label: 'All'},
  {key: 'guide', label: 'Guides'},
  {key: 'tool', label: 'Tools'},
  {key: 'briefing', label: 'Briefings'},
  {key: 'report', label: 'Reports'},
  {key: 'video', label: 'Videos'},
] as const

/** A YouTube video ID from an ID or a watch, short, embed or youtu.be link. */
export function youTubeIdFrom(value?: string | null) {
  const input = value?.trim()
  if (!input) return null
  if (/^[\w-]{11}$/.test(input)) return input
  try {
    const url = new URL(input)
    if (url.hostname === 'youtu.be') return url.pathname.slice(1).split('/')[0] || null
    if (!/(^|\.)youtube\.com$/.test(url.hostname)) return null
    if (url.pathname === '/watch') return url.searchParams.get('v')
    return url.pathname.match(/^\/(?:embed|shorts|live)\/([\w-]{11})/)?.[1] ?? null
  } catch {
    return null
  }
}

/** The arrow after a card's link text: ↓ for a PDF, ↗ for a new tab, → otherwise. */
export function linkArrow(href?: string | null, newTab?: boolean | null) {
  if (href && /\.pdf($|[?#])/i.test(href)) return '↓'
  return newTab ? '↗' : '→'
}
