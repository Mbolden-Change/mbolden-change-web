import React, { ComponentPropsWithoutRef, forwardRef, ReactNode } from 'react';
import styles from './ButtonComponent.module.css';
import { LinkAtom, ReferenceType } from './Link';
import type { InternalOrExternalLink } from '@/sanity/types';

type BaseButtonAttributes = ComponentPropsWithoutRef<'button'>;
type RefType = HTMLButtonElement;

interface ButtonProps extends BaseButtonAttributes {
    variant?: 'primary' | 'secondary' | 'tertiary' | 'icon' | 'unstyled';
    className?: string;
    isDisabled?: boolean;
    link?: InternalOrExternalLink;
    children?: ReactNode;
}

const ButtonComponent = forwardRef<RefType, ButtonProps>((props, ref) => {
    const {
        type,
        children,
        variant = 'primary' as const,
        isDisabled,
        className,
        link,
        onClick,
        ...rest
    } = props;

    const buttonClass = `${styles.base} ${styles[variant]} ${className || ''} ${
        isDisabled ? styles.disabled : ''
    }`.trim();

    const referenceWithSlug =
        link?.reference && 'slug' in link.reference
        ? (link.reference as ReferenceType)
        : undefined;

    if (link?.title && (link.isExternalLink ? link.url : referenceWithSlug)) {
        return (
            <LinkAtom
                {...link}
                reference={referenceWithSlug}
                className={buttonClass}
                ariaLabel={link.title}
            >
                {children || link.title}
            </LinkAtom>
        );
    }

    return (
        <button
        ref={ref}
        className={buttonClass}
        type={type || 'button'}
        disabled={isDisabled}
        onClick={isDisabled ? undefined : onClick}
        {...(rest as ComponentPropsWithoutRef<'button'>)}
        >
        {children}
        </button>
    );
});

export default ButtonComponent;
