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

interface RefMapType {
  caseStudy: string;
  page: string;
  statement: string;
  [key: string]: string;
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
}: LinkAtomProps) => {
  const linkContent = <span className={className}>{title}</span>;


  if (isExternalLink && url) {
    return (
      <a
        href={url}
        target={target}
        rel="noopener noreferrer"
        aria-label={ariaLabel}
        onClick={onClick}
      >
        {linkContent}
      </a>
    );
  }

  if (reference) {
    const refType = reference._type;
    const refMap: RefMapType = {
      caseStudy: "case-study",
      page: "",
      statement: "statement"
    }
 
    return (
      <Link href={`${refMap[refType]}/${reference?.slug.current}`} aria-label={ariaLabel} onClick={onClick}>
        {linkContent}
      </Link>
    )
  }
};
