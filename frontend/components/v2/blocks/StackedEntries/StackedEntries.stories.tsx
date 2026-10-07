import type {Meta, StoryObj} from '@storybook/nextjs-vite'
import StackedEntries from './StackedEntries'
import {externalLink, sanityImage} from '../../_storybook/fixtures'

const meta = {
  title: 'Components/StackedEntries',
  component: StackedEntries,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
A short set of named entries with a sticky menu. In Sanity this block is called **Stacked Entries**.

Use the same block twice on What we're tackling. Focus areas leave the introduction empty and fill a featured item on each entry. How we partner fills the introduction and leaves every featured item empty.

### What it looks like
- Optional **Eyebrow**, **Heading**, and **Introduction**. Leave these empty when a Page Header already opened the page.
- **Menu** of entry names. On a wide screen it sticks to the left. On a phone it becomes one sideways-scrolling row under the site header. The color bar fills on the entry in view. Choosing a name moves to that entry.
- **Entries** beside the menu (stacked under it on a phone). Each has a name and a longer explanation, separated by a light rule.
- Optional **Featured item** inside an entry: kicker, name, summary, one link, and an optional tilted photo. On a phone the photo sits under the copy.

### When to use it
- A deeper read of a few themes that already appear as a short list somewhere else
- A set that sometimes includes one example, and sometimes does not

### How it differs
- **Topic List** — a compact definition band, no menu, no nested example
- **Pillars** — tall scroll of how we work, with media rows. Do not use it on this page.
- **Text & Media** — one story, not a set

### How to add it in Sanity
1. In the page builder, add a **Stacked Entries** block.
2. For focus areas, leave **Eyebrow**, **Heading**, and **Introduction** empty.
3. Add 2–6 **Entries**. Each needs a **Name** and an **Explanation**.
4. Set **Anchor** when another page should link to that entry (lowercase letters, numbers, and hyphens, such as \`economic-security\`). Leave it blank to use the name.
5. Open **Featured item** when the entry should highlight one initiative. Fill **Kicker**, **Name**, and **Summary**. Add an **Image** with alt text, choose **Image position**, and add one **Link**.
6. For How we partner, fill **Eyebrow**, **Heading**, and **Introduction**, and leave every **Featured item** empty.

### Writing tips
- Entry names are the menu. Keep them short enough to scan.
- The explanation states the challenge. The featured item names the initiative.
- One link per featured item. The label should say where it goes.
- Photos stay still. The link and the menu are the controls.
        `,
      },
    },
  },
  argTypes: {
    eyebrow: {
      description: 'Optional label above the heading. Example: “Our model”.',
      control: 'text',
    },
    title: {
      name: 'Heading',
      description:
        'Optional section title. Leave empty when a Page Header already introduced the page.',
      control: 'text',
    },
    description: {
      name: 'Introduction',
      description: 'Optional paragraphs under the heading.',
      control: 'text',
    },
    entries: {
      description:
        '2–6 entries. Each has a name, explanation, optional anchor, and optional featured item.',
      control: false,
    },
    _type: {table: {disable: true}},
    prevBlockType: {table: {disable: true}},
    nextBlockType: {table: {disable: true}},
    isFirstBlock: {table: {disable: true}},
    isLastBlock: {table: {disable: true}},
  },
} satisfies Meta<typeof StackedEntries>

export default meta
type Story = StoryObj<typeof meta>

export const FocusAreas: Story = {
  name: 'Focus areas',
  parameters: {
    docs: {
      description: {
        story:
          'No section introduction — the Page Header already did that. Each entry carries one initiative. Health access has no photo.',
      },
    },
  },
  args: {
    _type: 'stackedEntries',
    entries: [
      {
        _key: 'economic-security',
        _type: 'stackedEntry',
        title: 'Economic security',
        anchor: 'economic-security',
        body: 'Social equity starts with everyday stability. When families can reliably afford food, rent, and daily expenses, they can plan for what comes next.',
        feature: {
          _type: 'stackedEntryFeature',
          kicker: 'Initiative',
          title: 'Cash Plus Care',
          summary:
            'A guaranteed-income pilot with high school students and their families in East Palo Alto — regular cash, plus academic support, mentorship, and case management.',
          image: sanityImage('Photo of the Cash Plus Care pilot'),
          mediaPosition: 'right',
          link: externalLink('Read the case study', 'https://www.mboldenchange.org'),
        },
      },
      {
        _key: 'health-access',
        _type: 'stackedEntry',
        title: 'Health access',
        anchor: 'health-access',
        body: 'Health is a fundamental human right, not a privilege reserved for those who can afford it. We work to remove the cost barriers to treatment, and to put care within reach.',
        feature: {
          _type: 'stackedEntryFeature',
          kicker: 'Initiative',
          title: 'Current health initiative',
          summary:
            'One short paragraph on what is live in health access, and who we run it with.',
          mediaPosition: 'right',
          link: externalLink('See the initiative', 'https://www.mboldenchange.org'),
        },
      },
      {
        _key: 'rapid-response',
        _type: 'stackedEntry',
        title: 'Rapid response',
        anchor: 'rapid-response',
        body: 'We hold our mission tightly and our methods loosely. When partners or a changing rule need something new, we shift resources and meet the moment.',
        feature: {
          _type: 'stackedEntryFeature',
          kicker: 'Initiative',
          title: 'The Gateway Fund',
          summary:
            'We cover filing fees with nonprofit and pro bono attorneys, so an administrative fee never stands between a young person and legal protection.',
          image: sanityImage('Photo of The Gateway Fund'),
          mediaPosition: 'left',
          link: externalLink('For legal providers', 'https://www.mboldenchange.org'),
        },
      },
    ],
  },
}

export const OurModel: Story = {
  name: 'Our model',
  parameters: {
    docs: {
      description: {
        story:
          'The introduction is filled in. Entries have no featured item, so the block reads as the partnership model.',
      },
    },
  },
  args: {
    _type: 'stackedEntries',
    eyebrow: 'Our model',
    title: 'How we partner',
    description:
      'We treat communities as co-creators, and bold change as a mandate. We co-create solutions with trusted partners and movement builders, and we resource them.',
    entries: [
      {
        _key: 'listen',
        _type: 'stackedEntry',
        title: 'Listen',
        anchor: 'listen',
        body: 'Community partners and the families they serve set the agenda. We co-design the work with the people who live it.',
      },
      {
        _key: 'build',
        _type: 'stackedEntry',
        title: 'Build and strengthen',
        anchor: 'build',
        body: 'Alongside local partners, we meet urgent needs, strengthen the organizations doing the work, and grow what works.',
      },
      {
        _key: 'advocate',
        _type: 'stackedEntry',
        title: 'Advocate',
        anchor: 'advocate',
        body: 'We fight for the policies and practices that let families thrive — defending essential safety nets and opening new doors.',
      },
    ],
  },
}
