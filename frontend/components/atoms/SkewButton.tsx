import React, { ComponentPropsWithoutRef, ReactNode } from 'react';
import classNames from 'classnames';
import styles from './SkewButton.module.scss';
import { LinkAtom, ReferenceType } from './Link';
import type { InternalOrExternalLink } from '@/sanity/types';
import { getReferenceWithSlug } from '@/utils/internalOrExternalLink';

type SkewButtonVariant = 'black' | 'yellow';

export type SkewButtonProps = {
  variant?: SkewButtonVariant;
  /** Applied to the inner control (link / button). */
  className?: string;
  /** Applied to the outer shadow wrapper. */
  wrapperClassName?: string;
  children: ReactNode;
  ariaLabel?: string;
  onClick?: () => void;
  /** Sanity link object (Impact Hero, etc.). */
  link?: InternalOrExternalLink;
  /** Plain href (Text & Media, etc.). */
  href?: string;
  /** Header-style flattened internal / external link fields. */
  isExternalLink?: boolean;
  reference?: ReferenceType;
  url?: string;
  target?: InternalOrExternalLink['target'];
  title?: string;
} & Omit<
  ComponentPropsWithoutRef<'button'>,
  'className' | 'children' | 'onClick' | 'title'
>;

const variantClass = {
  black: styles.innerBlack,
  yellow: styles.innerYellow,
} as const;

const wrapperVariantClass = {
  black: styles.wrapperBlack,
  yellow: styles.wrapperYellow,
} as const;

export default function SkewButton(props: SkewButtonProps) {
  const {
    variant = 'black',
    className,
    wrapperClassName,
    children,
    ariaLabel,
    onClick,
    link,
    href,
    isExternalLink,
    reference,
    url,
    target,
    title,
    type = 'button',
    ...buttonRest
  } = props;

  const innerClassName = classNames(
    styles.inner,
    variantClass[variant],
    className,
  );

  const label = <span className={styles.label}>{children}</span>;

  let control: React.ReactElement;

  if (href) {
    control = (
      <a
        href={href}
        className={innerClassName}
        aria-label={ariaLabel}
        onClick={onClick}
      >
        {label}
      </a>
    );
  } else if (link) {
    const referenceWithSlug = getReferenceWithSlug(link);

    control = (
      <LinkAtom
        isExternalLink={link.isExternalLink}
        reference={referenceWithSlug}
        target={link.target}
        url={link.url}
        title={link.title}
        className={innerClassName}
        ariaLabel={ariaLabel ?? link.title}
        onClick={onClick}
      >
        {label}
      </LinkAtom>
    );
  } else if (isExternalLink && url) {
    control = (
      <LinkAtom
        isExternalLink={isExternalLink}
        url={url}
        target={target}
        title={title}
        className={innerClassName}
        ariaLabel={ariaLabel ?? title}
        onClick={onClick}
      >
        {label}
      </LinkAtom>
    );
  } else if (reference) {
    control = (
      <LinkAtom
        isExternalLink={false}
        reference={reference}
        target={target}
        title={title}
        className={innerClassName}
        ariaLabel={ariaLabel ?? title}
        onClick={onClick}
      >
        {label}
      </LinkAtom>
    );
  } else {
    control = (
      <button
        type={type}
        className={innerClassName}
        aria-label={ariaLabel}
        onClick={onClick}
        {...buttonRest}
      >
        {label}
      </button>
    );
  }

  return (
    <span
      className={classNames(
        styles.wrapper,
        wrapperVariantClass[variant],
        wrapperClassName,
      )}
    >
      {control}
    </span>
  );
}
