import { placeholderSrc } from './placeholder';

type Chain = {
  auto: () => Chain;
  fit: () => Chain;
  width: () => Chain;
  height: () => Chain;
  url: () => string;
};

/** Chainable stub matching `@/sanity/lib/image` `urlFor(...).auto().fit().url()`. */
export function urlFor(source?: { alt?: string; asset?: { _ref?: string } }) {
  const ref = source?.asset?._ref ?? '';
  const match = ref.match(/(\d+)x(\d+)/);
  const width = match ? Number(match[1]) : 1200;
  const height = match ? Number(match[2]) : 800;
  const href = placeholderSrc(width, height, source?.alt || 'Image');

  const chain: Chain = {
    auto: () => chain,
    fit: () => chain,
    width: () => chain,
    height: () => chain,
    url: () => href,
  };

  return chain;
}

export function getDimensionsFromRef(ref: string) {
  if (!ref) return { imageWidth: null, imageHeight: null };
  const parts = ref.split('-');
  const sizeParts = parts[2];
  if (!sizeParts) return { imageWidth: null, imageHeight: null };
  const [imageWidth, imageHeight] = sizeParts.split('x').map(Number);
  return { imageWidth, imageHeight };
}
