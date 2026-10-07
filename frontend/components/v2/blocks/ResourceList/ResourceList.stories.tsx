import type {Meta, StoryObj} from '@storybook/nextjs-vite'
import ResourceList from './ResourceList'
import {externalLink} from '../../_storybook/fixtures'

const meta = {
  title: 'Components/ResourceList',
  component: ResourceList,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
A dated list of toolkits, briefings, and evaluations. In Sanity this block is called **Resource List**.

Each row is one resource. The whole row is the link when a destination exists.

### What it looks like
- Optional **Eyebrow** and a required **Heading**
- Optional **Introduction**
- **Resources** in a single column. On a wide screen a date sits on the left. On a phone the date sits above the title, and a blank date is hidden.
- Then a type, a title, and an optional line
- A light rule between rows. The title underline draws across when the row is a link

### When to use it
- Toolkits and resources on What we're tackling
- Any short list that should be scanned by date

### How it differs
- **Tool Cards** — destination cards, no date
- **Resource Banner** — one full-width spotlight
- **Stacked Entries** — a deeper read, with a menu and an optional featured item

### How to add it in Sanity
1. In the page builder, add a **Resource List** block after the stacked entries.
2. Fill the **Heading**. Optionally add an **Eyebrow** and an **Introduction**.
3. Add 1–12 **Resources**.
4. Each resource needs a **Title**. Add a **Type** (Toolkit, Briefing, Evaluation), a **Date** when one exists, and a **Summary** when a line of context helps.
5. Add a **Link** when the destination page exists. Leave it empty until then — the row stays on the page and is not clickable.

### Writing tips
- Leave **Date** blank when the resource has no date. Do not invent one.
- The title is the name of the resource. The summary is one line, not a second title.
- The link label can match the title. The whole row is the control.
        `,
      },
    },
  },
  argTypes: {
    eyebrow: {
      description: 'Optional label above the heading. Example: “Resources”.',
      control: 'text',
    },
    title: {
      name: 'Heading',
      description: 'Section title. Required.',
      control: 'text',
    },
    description: {
      name: 'Introduction',
      description: 'Optional line under the heading.',
      control: 'text',
    },
    items: {
      description:
        '1–12 resources. Each has an optional date, optional type, required title, optional summary, and optional link.',
      control: false,
    },
    _type: {table: {disable: true}},
    prevBlockType: {table: {disable: true}},
    nextBlockType: {table: {disable: true}},
    isFirstBlock: {table: {disable: true}},
    isLastBlock: {table: {disable: true}},
  },
} satisfies Meta<typeof ResourceList>

export default meta
type Story = StoryObj<typeof meta>

export const ToolkitsAndBriefings: Story = {
  name: 'Toolkits and briefings',
  parameters: {
    docs: {
      description: {
        story:
          'Beyond Compliance has no date. The tax briefing title and date are still open. The evaluation date is 2022. Each row links out once a destination exists.',
      },
    },
  },
  args: {
    _type: 'resourceList',
    eyebrow: 'Resources',
    title: 'Toolkits and briefings',
    description: 'The toolkit, the tax briefing, and the evaluation.',
    items: [
      {
        _key: 'toolkit',
        _type: 'resourceListItem',
        label: 'Toolkit',
        title: 'Beyond Compliance',
        link: externalLink('Beyond Compliance'),
      },
      {
        _key: 'briefing',
        _type: 'resourceListItem',
        label: 'Briefing',
        title: 'Tax briefing',
        summary: 'Title and date still to come.',
        link: externalLink('Tax briefing'),
      },
      {
        _key: 'evaluation',
        _type: 'resourceListItem',
        date: '2022',
        label: 'Evaluation',
        title: 'What we learned about cash, care, and community trust',
        summary: 'The Cash Plus Care evaluation, East Palo Alto.',
        link: externalLink('Read the evaluation'),
      },
    ],
  },
}
