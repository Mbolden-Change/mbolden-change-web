import type {TestimonialCard} from '@/sanity/types'

/** Quote marks hang onto the teal section background — never use aqua. */
export const QUOTE_MARKS: Record<
  Exclude<NonNullable<TestimonialCard['quoteMarksColor']>, 'aqua'> | 'fuchsia',
  string
> = {
  yellow: '/bold-quote-marks/quote-yellow.png',
  white: '/bold-quote-marks/quote-white.png',
  fuchsia: '/bold-quote-marks/quote-fuchsia.png',
  black: '/bold-quote-marks/quote-black.png',
}

const SAFE_QUOTE_COLORS = new Set(Object.keys(QUOTE_MARKS))

/** Map legacy/invalid colors (e.g. aqua) to a mark that reads on teal. */
export function resolveQuoteMarkSrc(
  color?: TestimonialCard['quoteMarksColor'],
): string {
  if (color && SAFE_QUOTE_COLORS.has(color)) {
    return QUOTE_MARKS[color as keyof typeof QUOTE_MARKS]
  }
  return QUOTE_MARKS.fuchsia
}
