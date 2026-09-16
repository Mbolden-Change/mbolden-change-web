import type {Meta, StoryObj} from '@storybook/nextjs-vite'
import ToolCards from './ToolCards'
import {externalLink, sanityImage} from '../../_storybook/fixtures'

const actionTools = [
  {
    _key: 't1',
    _type: 'toolCard' as const,
    label: 'Interactive',
    title: 'Safety Net Simulator',
    body: 'See how income, benefits, and the cost of daily life add up — and where the safety net falls short.',
    image: sanityImage('Safety Net Simulator', 900, 560),
    link: externalLink(
      'Try the simulator',
      'https://www.mboldenchange.org/simulator',
    ),
  },
  {
    _key: 't2',
    _type: 'toolCard' as const,
    label: 'Campaign',
    title: 'Why We Can’t Have Nice Things',
    body: 'A clear case for the policies and investments that make everyday life workable for families.',
    image: sanityImage('Why We Can’t Have Nice Things', 900, 560),
    link: externalLink('Explore'),
  },
  {
    _key: 't3',
    _type: 'toolCard' as const,
    label: 'Tool',
    title: 'Move My DAF',
    body: 'Put donor-advised funds to work with partners who move resources when families need them.',
    image: sanityImage('Move My DAF', 900, 560),
    link: externalLink('Get started'),
  },
]

const meta = {
  title: 'Components/ToolCards',
  component: ToolCards,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
Cards for **tools, products, and interactive resources** you want people to open and use — not just read about.

### Tool Cards vs Topic List
| | **Tool Cards** | **Topic List** |
| --- | --- | --- |
| **Job** | Things you *use* or launch | Themes / focus areas you *read* |
| **Look** | Dark band, optional product media | Light informational band |
| **Link** | **Required** on every card | Optional |

### What it looks like
- Optional **Eyebrow** + **Title** + **Description**
- Cards with optional label, title, body, optional media, and **required link**
- Whole card is clickable (pattern D)
- Without media, cards are text-only and stretch to equal height
        `,
      },
    },
  },
} satisfies Meta<typeof ToolCards>

export default meta
type Story = StoryObj<typeof meta>

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
    _type: 'toolCards',
    eyebrow: 'mBOLDen Action',
    title: 'Tools that put the work in motion',
    description:
      'Open resources families, partners, and donors can use — not just read about.',
    cards: actionTools,
  },
}

export const WithoutMedia: Story = {
  name: 'Without media',
  parameters: {
    docs: {
      description: {
        story:
          'Text-only tools — no placeholder media. Cards share equal height; CTAs align at the bottom.',
      },
    },
  },
  args: {
    _type: 'toolCards',
    eyebrow: 'mBOLDen Action',
    title: 'Tools that put the work in motion',
    description:
      'Open resources families, partners, and donors can use — not just read about.',
    cards: [
      {
        _key: 't1',
        _type: 'toolCard' as const,
        label: 'Interactive',
        title: 'Safety Net Simulator',
        body: 'See how income, benefits, and the cost of daily life add up — and where the safety net falls short.',
        link: actionTools[0].link,
      },
      {
        _key: 't2',
        _type: 'toolCard' as const,
        label: 'Campaign',
        title: 'Why We Can’t Have Nice Things',
        body: 'A clear case for the policies and investments that make everyday life workable for families. Longer copy here to prove equal card height when media is absent.',
        link: actionTools[1].link,
      },
      {
        _key: 't3',
        _type: 'toolCard' as const,
        label: 'Tool',
        title: 'Move My DAF',
        body: 'Put donor-advised funds to work.',
        link: actionTools[2].link,
      },
    ],
  },
}
