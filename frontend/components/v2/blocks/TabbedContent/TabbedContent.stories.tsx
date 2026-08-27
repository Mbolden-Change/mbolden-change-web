import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import TabbedContent from './TabbedContent';
import { portableText, sanityImage } from '../../_storybook/fixtures';

const meta = {
  title: 'Components/TabbedContent',
  component: TabbedContent,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
Lets visitors switch between related topics **without scrolling through a very long page**. Each tab has a short label; clicking a label shows that tab’s content.

In Sanity this block is called **Tabs Container** (it may appear as Tabbed Content in previews).

### What it looks like
- A row of **tab labels** (for example, Overview / Who it’s for / How to join)
- Content for the selected tab — plain text, and/or nested blocks such as **Text & Media** or **Leadership**
- **Default Selected Tab Index** — which tab is open first (\`0\` = first tab, \`1\` = second, and so on)

### When to use it
- Related topics that share a page (programs, audiences, FAQs)
- Team sections split by group (for example, Staff / Board) using **Leadership** inside tabs
- Anytime one long page would feel overwhelming

### When to use something else
- Content that everyone should see in order as they scroll → use regular stacked blocks instead
- A single simple section → **Text & Media** or **Page Header** may be enough

### How to add it in Sanity
1. In the page builder, add a **Tabs Container**.
2. Add **2–5 tabs** (5 is the maximum).
3. Give each tab a short **label**.
4. Add content inside each tab (text and/or nested blocks).
5. Set **Default Selected Tab Index** if you don’t want the first tab open by default (use \`0\` for the first tab).

### Tips
- Keep labels short so they fit on one line on phones
- Put the most important content in the first tab
- Don’t nest too much — each tab should still feel scannable
        `,
      },
    },
  },
} satisfies Meta<typeof TabbedContent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SimpleTabs: Story = {
  name: 'Simple text tabs',
  parameters: {
    docs: {
      description: {
        story:
          'Three related topics with short text in each tab — a common pattern for program or FAQ-style pages.',
      },
    },
  },
  args: {
    _type: 'tabsContainer',
    defaultTabIndex: 0,
    tabs: [
      {
        _key: 't1',
        _type: 'tab',
        label: 'Overview',
        content: portableText(
          'A short overview of how this program supports youth and partners.',
          'o1',
        ),
      },
      {
        _key: 't2',
        _type: 'tab',
        label: 'Who it’s for',
        content: portableText(
          'Students, families, educators, and community organizations across the Bay Area.',
          'o2',
        ),
      },
      {
        _key: 't3',
        _type: 'tab',
        label: 'How to join',
        content: portableText(
          'Reach out through our contact form or talk with your school partner.',
          'o3',
        ),
      },
    ],
  },
};

export const WithNestedTextMedia: Story = {
  name: 'Tab with Text & Media inside',
  parameters: {
    docs: {
      description: {
        story:
          'Shows how a tab can hold richer content — here a nested Text & Media block — not only plain paragraphs.',
      },
    },
  },
  args: {
    _type: 'tabsContainer',
    defaultTabIndex: 0,
    tabs: [
      {
        _key: 't1',
        _type: 'tab',
        label: 'Overview',
        content: portableText('Start here for the big picture.', 'n1'),
      },
      {
        _key: 't2',
        _type: 'tab',
        label: 'Deep dive',
        content: [
          {
            _key: 'tm1',
            _type: 'textMedia',
            headline: 'Inside the work',
            textBody: portableText(
              'You can place richer layouts inside a tab when a short paragraph isn’t enough.',
              'n2',
            ),
            mediaPosition: 'right',
            mobileLayout: 'imageTop',
            media: {
              image: sanityImage('Deep dive', 1200, 800),
            },
            ctas: [
              {
                _key: 'c1',
                _type: 'cta',
                label: 'Learn more',
                link: 'https://www.mboldenchange.org',
              },
            ],
          },
        ],
      },
    ],
  },
};
