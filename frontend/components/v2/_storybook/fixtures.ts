/** Shared mock data for v2 component stories (no live Sanity required). */

export function portableText(text: string, key = 'b1') {
  return [
    {
      _type: 'block' as const,
      _key: key,
      style: 'normal' as const,
      markDefs: [],
      children: [
        {
          _type: 'span' as const,
          _key: `${key}-s`,
          text,
          marks: [] as string[],
        },
      ],
    },
  ];
}

export function sanityImage(alt: string, width = 1200, height = 800) {
  return {
    _type: 'image' as const,
    alt,
    asset: {
      _type: 'reference' as const,
      _ref: `image-Tb9Ew8CXIwaY6R1kjMvI0uRR-${width}x${height}-jpg`,
    },
  };
}

export function externalLink(title: string, url = 'https://www.mboldenchange.org') {
  return {
    _type: 'internalOrExternalLink' as const,
    title,
    isExternalLink: true as const,
    url,
    target: '_blank' as const,
  };
}
