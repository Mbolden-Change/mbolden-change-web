import Link from 'next/link';
import { InternalOrExternalLink as InternalOrExternalLinkType } from '@/sanity/types';

type LinkAtomProps = Omit<InternalOrExternalLinkType, 'reference' | '_type'> & {
  className?: string;
  ariaLabel?: string;
  reference?: ReferenceType;
  children?: React.ReactNode;
  onClick?: () => void;
};

export type ReferenceType = {
  _type: string;
  slug: {
    current: string;
  };
};

/** Maps Sanity document _type (after reference->) to the first segment of the site path. */
const INTERNAL_ROUTE_PREFIX: Record<string, string> = {
  page: '',
  caseStudy: 'case-study',
  statement: 'statement',
  report: 'report',
};

function hrefForInternalReference(reference: ReferenceType): string | null {
  const slug = reference.slug?.current;
  if (!slug) return null;
  const prefix = INTERNAL_ROUTE_PREFIX[reference._type];
  if (prefix === undefined) return null;
  return prefix ? `/${prefix}/${slug}` : `/${slug}`;
}

export const LinkAtom = ({
  isExternalLink,
  reference,
  target,
  url,
  title,
  className,
  ariaLabel,
  onClick,
  children,
}: LinkAtomProps) => {
  const label = children ?? title;

  if (isExternalLink && url) {
    return (
      <a
        href={url}
        className={className}
        target={target}
        rel="noopener noreferrer"
        aria-label={ariaLabel}
        onClick={onClick}
      >
        {label}
      </a>
    );
  }

  if (reference) {
    const href = hrefForInternalReference(reference);
    if (!href) return null;

    return (
      <Link
        href={href}
        className={className}
        aria-label={ariaLabel}
        onClick={onClick}
      >
        {label}
      </Link>
    );
  }

  return null;
};
