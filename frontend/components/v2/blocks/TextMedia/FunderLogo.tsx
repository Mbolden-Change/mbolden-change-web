import {getFunderLogo} from './pilotImage'

type FunderLogoSource = Parameters<typeof getFunderLogo>[0]

/** The funder logo and its link, or null: a logo shows only with a link. */
export function getFunder(logo?: FunderLogoSource, link?: string | null) {
  const href = link?.trim()
  const image = href ? getFunderLogo(logo) : null
  return href && image ? {href, image} : null
}

/**
 * A funder logo beside a "Supported by" line, linking to the funder in a new
 * tab. Each block styles the link and image (panel, clear space, focus ring).
 */
export default function FunderLogo({
  funder,
  className,
  imageClassName,
}: {
  funder: NonNullable<ReturnType<typeof getFunder>>
  className?: string
  imageClassName?: string
}) {
  const {href, image} = funder
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      <img
        src={image.src}
        alt={image.alt}
        width={image.width}
        height={image.height}
        loading="lazy"
        className={imageClassName}
      />
    </a>
  )
}
