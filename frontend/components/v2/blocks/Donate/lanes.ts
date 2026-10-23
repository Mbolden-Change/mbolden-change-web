/** A fund card's color, as set in Studio. */
export type Lane = 'black' | 'yellow' | 'teal' | 'fuchsia'

const VARS: Record<Lane, string> = {
  black: 'var(--brand-black)',
  yellow: 'var(--brand-warm-yellow)',
  teal: 'var(--brand-aqua-teal)',
  fuchsia: 'var(--brand-fuchsia)',
}

export function laneColor(lane?: string | null) {
  return VARS[lane as Lane] ?? VARS.teal
}
