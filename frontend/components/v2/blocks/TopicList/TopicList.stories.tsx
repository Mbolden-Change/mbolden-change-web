import type {Meta, StoryObj} from '@storybook/nextjs-vite'
import TopicList from './TopicList'
import {externalLink} from '../../_storybook/fixtures'

const focusAreaItems = [
  {
    _key: 't1',
    _type: 'topicListItem' as const,
    title: 'Economic Security',
    body: 'Income, benefits, and what daily life costs. Cash that empowers households to meet basic needs, tools that show how the safety net actually works, and the advocacy that follows from both.',
  },
  {
    _key: 't2',
    _type: 'topicListItem' as const,
    title: 'Health Access',
    body: 'Getting care, and paying for it. Funds that cover what public insurance leaves out, and the case for closing those gaps.',
  },
  {
    _key: 't3',
    _type: 'topicListItem' as const,
    title: 'Rapid Response',
    body: 'Acute need that appears between planning cycles. Resources that move fast, wherever the need shows up.',
  },
]

const meta = {
  title: 'Components/TopicList',
  component: TopicList,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
A compact informational band of named themes — a legend under the story, not a second journey.

Designed to sit **under Pillars**: white ground, denser footprint, no indexes, light motion. Pillars owns the tall numbered scroll; this answers “where that work lands.” The cream closing band carries the thread across all topics.

### What it looks like
- Optional **Eyebrow** and **Title** (smaller than Pillars)
- Optional short **Description** under the title
- **Items** — three equal columns on desktop (stack on mobile), each with a brand accent rule, title, and body
- Optional **Closing note** under the grid — full-width coda with optional eyebrow
- Optional per-item **Link** when destinations exist later

### When to use it
- Homepage focus areas after How we work
- Program themes or priorities meant to be read, not browsed as cards

### How it differs
- **Pillars** — how we work (tall, numbered, media, scrubbed motion)
- **Tool Cards** — products and resources you can open
- **Topic List** — what we focus on (quiet summary band)
        `,
      },
    },
  },
} satisfies Meta<typeof TopicList>

export default meta
type Story = StoryObj<typeof meta>

export const FocusAreas: Story = {
  name: 'Focus areas',
  parameters: {
    docs: {
      description: {
        story:
          'Homepage use under Pillars. Closing note carries the immigrant-families thread after the three themes.',
      },
    },
  },
  args: {
    _type: 'topicList',
    eyebrow: 'Our focus',
    title: 'Our focus areas',
    items: focusAreaItems,
    closingEyebrow: 'Across our work',
    closingNote:
      'Most of the households we work with are immigrant families. Not because we set out to serve a demographic, but because that’s where the barriers and vulnerability concentrate.',
  },
}

export const WithIntroDescription: Story = {
  name: 'With intro description',
  parameters: {
    docs: {
      description: {
        story: 'Optional lead under the title when you need framing before the grid.',
      },
    },
  },
  args: {
    _type: 'topicList',
    eyebrow: 'Priorities',
    title: 'Where the work concentrates',
    description:
      'Three themes shape what we fund, build, and advocate for — each one a place where barriers stack.',
    items: focusAreaItems,
  },
}

export const WithLinks: Story = {
  name: 'With links',
  parameters: {
    docs: {
      description: {
        story:
          'Links stay under the body — the band stays informational even when destinations exist.',
      },
    },
  },
  args: {
    ...FocusAreas.args,
    items: focusAreaItems.map((item, i) => ({
      ...item,
      link: externalLink('Learn more', `https://www.mboldenchange.org/focus-${i + 1}`),
    })),
  },
}
