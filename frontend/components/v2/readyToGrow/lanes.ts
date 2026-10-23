/** A Ready to Grow case study's color, as set in Studio. */
export type LaneColor = 'teal' | 'fuchsia' | 'yellow'

const VARS: Record<LaneColor, string> = {
  teal: 'var(--brand-aqua-teal)',
  fuchsia: 'var(--brand-fuchsia)',
  yellow: 'var(--brand-warm-yellow)',
}

export function laneVar(color?: string | null) {
  return VARS[(color as LaneColor) ?? 'teal'] ?? VARS.teal
}

/** The second accent beside a case study's own color: teal with fuchsia, fuchsia with teal. */
export function partnerVar(color?: string | null) {
  return color === 'teal' || !color ? VARS.fuchsia : VARS.teal
}

/** Fuchsia bands carry white text; teal and yellow carry black. */
export function onLaneIsWhite(color?: string | null) {
  return color === 'fuchsia'
}

/** mailto: link with a subject line. */
export function mailtoHref(email: string, subject?: string | null) {
  return subject ? `mailto:${email}?subject=${encodeURIComponent(subject)}` : `mailto:${email}`
}

/** "100%" → {prefix: '', number: 100, suffix: '%', decimals: 0}; null when there's no number to count. */
export function parseStat(value: string) {
  const match = value.match(/^(\D*?)(\d[\d,]*(?:\.\d+)?)(.*)$/)
  if (!match) return null
  const [, prefix, digits, suffix] = match
  const number = Number(digits.replace(/,/g, ''))
  if (!Number.isFinite(number)) return null
  return {
    prefix,
    number,
    suffix,
    decimals: digits.includes('.') ? digits.split('.')[1].length : 0,
    grouped: digits.includes(','),
  }
}

export function formatStat(stat: NonNullable<ReturnType<typeof parseStat>>, number: number) {
  const text = number.toLocaleString('en-US', {
    minimumFractionDigits: stat.decimals,
    maximumFractionDigits: stat.decimals,
    useGrouping: stat.grouped,
  })
  return `${stat.prefix}${text}${stat.suffix}`
}
