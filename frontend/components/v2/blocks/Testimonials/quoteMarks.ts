import type {TestimonialCard} from '@/sanity/types'

export const QUOTE_MARKS: Record<
  NonNullable<TestimonialCard['quoteMarksColor']>,
  string
> = {
  yellow: '/bold-quote-marks/quote-yellow.png',
  white: '/bold-quote-marks/quote-white.png',
  fuchsia: '/bold-quote-marks/quote-fuchsia.png',
  black: '/bold-quote-marks/quote-black.png',
  aqua: '/bold-quote-marks/quote-aqua.png',
}
