import type { StorybookConfig } from '@storybook/nextjs-vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Alias, AliasOptions } from 'vite';

const dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(dirname, '..');

/** Storybook mocks — must win over the `@` → root alias. */
const storybookMocks: Alias[] = [
  {
    find: '@/components/SanityNextImage',
    replacement: path.join(dirname, 'mocks/SanityNextImage.tsx'),
  },
  {
    find: '@/sanity/lib/image',
    replacement: path.join(dirname, 'mocks/sanityImage.ts'),
  },
  {
    find: '@/lib/analytics',
    replacement: path.join(dirname, 'mocks/analytics.ts'),
  },
  { find: '@', replacement: root },
];

function mergeAliases(existing: AliasOptions | undefined): Alias[] {
  const normalized: Alias[] = Array.isArray(existing)
    ? existing
    : existing
      ? Object.entries(existing).map(([find, replacement]) => ({
          find,
          replacement: replacement as string,
        }))
      : [];

  // Drop any prior `@` / mock entries so ours stay first and consistent.
  const filtered = normalized.filter((entry) => {
    const find = typeof entry.find === 'string' ? entry.find : '';
    return (
      find !== '@' &&
      find !== '@/components/SanityNextImage' &&
      find !== '@/sanity/lib/image' &&
      find !== '@/lib/analytics'
    );
  });

  return [...storybookMocks, ...filtered];
}

const config: StorybookConfig = {
  stories: ['../components/v2/**/*.stories.@(js|jsx|mjs|ts|tsx|mdx)'],
  addons: [
    '@chromatic-com/storybook',
    '@storybook/addon-vitest',
    '@storybook/addon-a11y',
    '@storybook/addon-docs',
    '@storybook/addon-mcp',
  ],
  framework: '@storybook/nextjs-vite',
  staticDirs: ['../public'],
  async viteFinal(config) {
    config.resolve ??= {};
    config.resolve.alias = mergeAliases(config.resolve.alias);
    return config;
  },
};

export default config;
