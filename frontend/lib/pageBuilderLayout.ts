/** Passed from PageBuilder to blocks for neighbor-aware vertical spacing. */
export type PageBuilderBlockLayoutProps = {
  prevBlockType?: string
  nextBlockType?: string
  isFirstBlock?: boolean
  isLastBlock?: boolean
}

const SECTION_PADDED_BLOCKS = new Set([
  'impactHero',
  'hero',
  'heroCarousel',
  'pillars',
  'pillarContainer',
  'resourceBanner',
  'statementBanner',
  'textMedia',
  'fiftyFifty',
  'testimonialsCarousel',
])

export function shouldTestimonialsFlushTop(prevBlockType?: string): boolean {
  return Boolean(prevBlockType && SECTION_PADDED_BLOCKS.has(prevBlockType))
}

export function shouldTestimonialsFlushBottom(
  nextBlockType?: string,
  isLastBlock?: boolean,
): boolean {
  if (isLastBlock) return true
  return Boolean(nextBlockType && SECTION_PADDED_BLOCKS.has(nextBlockType))
}

export function shouldTextMediaFlushTop(prevBlockType?: string): boolean {
  return prevBlockType === 'testimonialsCarousel'
}

/** Last page-builder block before the site footer — drop outer bottom padding. */
export function shouldSectionFlushBottom(isLastBlock?: boolean): boolean {
  return Boolean(isLastBlock)
}
