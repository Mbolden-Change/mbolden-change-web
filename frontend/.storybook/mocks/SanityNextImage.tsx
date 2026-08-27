import type { CSSProperties } from 'react';
import { placeholderSrc } from './placeholder';

/** Storybook stand-in for Sanity CDN images — no project credentials required. */
export default function SanityNextImageMock({
  image,
  className,
  fit = 'cover',
  sizes,
  priority,
}: {
  image?: { alt?: string; asset?: { _ref?: string } };
  className?: string;
  fit?: 'cover' | 'contain';
  sizes?: string;
  priority?: boolean;
}) {
  const ref = image?.asset?._ref ?? '';
  const match = ref.match(/(\d+)x(\d+)/);
  const width = match ? Number(match[1]) : 1200;
  const height = match ? Number(match[2]) : 800;
  const style: CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: fit,
    display: 'block',
  };

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={placeholderSrc(width, height, image?.alt || 'Image')}
      alt={image?.alt || ''}
      width={width}
      height={height}
      className={className}
      sizes={sizes}
      style={style}
      data-priority={priority ? 'true' : undefined}
    />
  );
}
