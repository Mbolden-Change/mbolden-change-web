import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import ToolCards from './ToolCards';
import { sanityImage } from '../../_storybook/fixtures';

const actionTools = [
  {
    _key: 't1',
    label: 'Interactive',
    title: 'Safety Net Simulator',
    body: 'See how income, benefits, and the cost of daily life add up — and where the safety net falls short.',
    image: sanityImage('Safety Net Simulator', 900, 560),
    link: {
      title: 'Try the simulator',
      url: 'https://www.mboldenchange.org/simulator',
      isExternalLink: true,
      target: '_blank' as const,
    },
  },
  {
    _key: 't2',
    label: 'Campaign',
    title: 'Why We Can’t Have Nice Things',
    body: 'A clear case for the policies and investments that make everyday life workable for families.',
    image: sanityImage('Why We Can’t Have Nice Things', 900, 560),
    link: {
      title: 'Explore',
      url: 'https://www.mboldenchange.org',
      isExternalLink: true,
      target: '_blank' as const,
    },
  },
  {
    _key: 't3',
    label: 'Tool',
    title: 'Move My DAF',
    body: 'Put donor-advised funds to work with partners who move resources when families need them.',
    image: sanityImage('Move My DAF', 900, 560),
    link: {
      title: 'Get started',
      url: 'https://www.mboldenchange.org',
      isExternalLink: true,
      target: '_blank' as const,
    },
  },
];

const meta = {
  title: 'Components/ToolCards',
  component: ToolCards,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
Cards for **tools, products, and interactive resources** you want people to open and use — not just read about.

On the homepage plan this is **mBOLDen Action** (Safety Net Simulator, Why We Can’t Have Nice Things, Move My DAF). The reusable name is **Tool Cards**.

### Tool Cards vs Topic Cards
| | **Tool Cards** | **Topic Cards** |
| --- | --- | --- |
| **Job** | Things you *use* or launch | Themes / focus areas you *explore* |
| **Look** | Dark band, product-style media | Light paper cards |
| **CTA feel** | “Try / Launch / Get started” | Optional “Learn more” |

### Tool Cards vs Resource Banner
| | **Tool Cards** | **Resource Banner** |
| --- | --- | --- |
| **Job** | Showcase several tools in a grid | Spotlight one resource in a color strip |
| **Count** | Usually 2–4 cards | One callout |

### What it looks like
- Optional **Eyebrow** + **Title** + **Description**
- Cards with optional label, title, body, media, and link
- Whole card is clickable when a link is present (pattern D)
- Without a link, the card stays static (no hover chrome)

### When to use it
- Action / tools sections on any page
- Product or campaign launches in a set of three
- Interactive resources that need equal visual weight

### When to use something else
- Focus areas / themes → **Topic Cards**
- One report or statement callout → **Resource Banner**
- Partner story + quote → **Story Highlight**
        `,
      },
    },
  },
} satisfies Meta<typeof ToolCards>;

export default meta;
type Story = StoryObj<typeof meta>;

export const MboldenAction: Story = {
  name: 'With media and links',
  parameters: {
    docs: {
      description: {
        story:
          'Three action tools with media and CTAs — the homepage mBOLDen Action pattern.',
      },
    },
  },
  args: {
    eyebrow: 'mBOLDen Action',
    title: 'Tools that put the work in motion',
    description:
      'Open resources families, partners, and donors can use — not just read about.',
    cards: actionTools,
  },
};

export const WithoutLinks: Story = {
  name: 'Without links',
  parameters: {
    docs: {
      description: {
        story:
          'Same tools before destinations are ready. Cards stay informative with no CTA chrome.',
      },
    },
  },
  args: {
    eyebrow: 'mBOLDen Action',
    title: 'Tools that put the work in motion',
    description:
      'Open resources families, partners, and donors can use — not just read about.',
    cards: actionTools.map(({link: _link, ...card}) => card),
  },
};

export const WithoutMedia: Story = {
  name: 'Without media',
  parameters: {
    docs: {
      description: {
        story:
          'Text-forward tools with a brand gradient mark when photography isn’t ready.',
      },
    },
  },
  args: {
    eyebrow: 'mBOLDen Action',
    title: 'Tools that put the work in motion',
    cards: actionTools.map(({image: _image, ...card}) => card),
  },
};
