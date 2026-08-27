import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import PillarsClient from './PillarsClient';
import { portableText, sanityImage } from '../../_storybook/fixtures';

const meta = {
  title: 'Components/Pillars',
  component: PillarsClient,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
A section that introduces the organization’s **core approaches** (for example, educate, advocate, organize). Each pillar is a row with an image, headline, and short description, revealed as people scroll.

In Sanity this block is called **Pillars**. The individual pillar cards are selected from your shared Pillar Cards content.

### What it looks like
- Optional **Eyebrow** — short label above the section title
- Optional **Title** — section headline
- Optional **Description** — a short intro under the title
- One or more **Pillars** — each with an image, headline, and supporting copy

### When to use it
- Homepage or About sections that explain “how we work”
- Pages where you want to showcase a small set of strategies or themes

### When to use something else
- A single story with one photo → **Text & Media**
- People / team bios → **Leadership**

### How to add it in Sanity
1. Make sure your **Pillar Cards** exist in Sanity (shared content you can reuse).
2. On the page, add a **Pillars** block.
3. Optionally fill in **Eyebrow**, **Title**, and **Description**.
4. Under **Pillars**, select the cards you want and put them in the order they should appear.

### Content tips
- **Three pillars** usually looks and reads best
- Keep each pillar headline short (one or two words often works)
- Descriptions should be one short paragraph — scannable, not essay-length
        `,
      },
    },
  },
} satisfies Meta<typeof PillarsClient>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ThreePillars: Story = {
  name: 'Three pillars',
  parameters: {
    docs: {
      description: {
        story:
          'A typical homepage-style pillars section with three approaches. Order in Sanity is the order on the page.',
      },
    },
  },
  args: {
    eyebrow: 'How we work',
    title: 'Three pillars',
    description: portableText(
      'We dismantle barriers across education, advocacy, and community power.',
    ),
    pillars: [
      {
        _id: 'pillar-1',
        _type: 'pillarCard',
        _createdAt: '2024-01-01T00:00:00Z',
        _updatedAt: '2024-01-01T00:00:00Z',
        _rev: 'rev1',
        headline: 'Educate',
        image: sanityImage('Educate', 900, 700),
        description: portableText(
          'Youth-led learning that builds confidence and critical skills.',
          'e1',
        ),
      },
      {
        _id: 'pillar-2',
        _type: 'pillarCard',
        _createdAt: '2024-01-01T00:00:00Z',
        _updatedAt: '2024-01-01T00:00:00Z',
        _rev: 'rev1',
        headline: 'Advocate',
        image: sanityImage('Advocate', 900, 700),
        description: portableText(
          'Policy and systems change with young people at the table.',
          'e2',
        ),
      },
      {
        _id: 'pillar-3',
        _type: 'pillarCard',
        _createdAt: '2024-01-01T00:00:00Z',
        _updatedAt: '2024-01-01T00:00:00Z',
        _rev: 'rev1',
        headline: 'Organize',
        image: sanityImage('Organize', 900, 700),
        description: portableText(
          'Community power that lasts beyond a single campaign.',
          'e3',
        ),
      },
    ],
  },
};
