import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import PageHeader from './PageHeader';

const meta = {
  title: 'Components/PageHeader',
  component: PageHeader,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
A simple text-only intro at the **top of a page** — a title, and optionally a short label above it and a supporting line below it. No photo, video, or buttons.

In Sanity this block is called **Page Header**.

### What it looks like
- Optional **Eyebrow** — a short label (for example, “Our work”)
- **Heading** — the main page title
- Optional **Supporting line** — one or two sentences under the title
- **Alignment** — left (most pages) or center (short, statement-style pages)

### When to use it
- Interior pages that mainly need a clear title: About, Programs, Resources, Contact, policies, etc.
- Any page where a photo and buttons would feel like too much

### When to use something else
- You want a big photo or video and buttons at the top → use **Impact Hero Section** instead
- You need a title **in the middle** of a page → use a section block such as **Text & Media**, not Page Header (each page should only have one main page title at the top)

### How to add it in Sanity
1. Open the page and go to the page builder.
2. Add a **Page Header** block at the **top**.
3. Fill in the **Heading** (required).
4. Optionally add an **Eyebrow** and a **Supporting line**.
5. Choose **Left** for most pages, or **Center** for a short centered intro.

### Writing tips
- **Heading:** Clear and specific (“Our programs”), not vague (“Welcome”)
- **Eyebrow:** A category label, not a second headline (“Advocacy”, “Get involved”)
- **Supporting line:** Add useful context in 1–2 sentences — don’t just repeat the heading
        `,
      },
    },
  },
  argTypes: {
    eyebrow: {
      description: 'Optional short label above the heading. Keep it brief.',
      control: 'text',
    },
    heading: {
      description: 'The main page title. Required.',
      control: 'text',
    },
    dek: {
      name: 'Supporting line',
      description:
        'Optional one or two sentences under the heading. In Sanity this field is labeled “Supporting line.”',
      control: 'text',
    },
    align: {
      description: 'Left or center alignment for the text.',
      control: 'radio',
      options: ['left', 'center'],
    },
    isFirstBlock: {
      table: { disable: true },
    },
    _type: { table: { disable: true } },
    prevBlockType: { table: { disable: true } },
    nextBlockType: { table: { disable: true } },
    isLastBlock: { table: { disable: true } },
  },
} satisfies Meta<typeof PageHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const LeftAligned: Story = {
  name: 'Left aligned (default)',
  parameters: {
    docs: {
      description: {
        story:
          'The usual choice for content pages. Left alignment works well when more content continues below.',
      },
    },
  },
  args: {
    _type: 'pageHeader',
    eyebrow: 'Our work',
    heading: 'Programs that put youth first',
    dek: 'We partner with schools and communities across the Bay Area to expand opportunity.',
    align: 'left',
    isFirstBlock: true,
  },
};

export const Centered: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Use for short pages or a bold, centered statement. Prefer left alignment on longer reading pages.',
      },
    },
  },
  args: {
    ...LeftAligned.args,
    align: 'center',
  },
};

export const HeadingOnly: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Just the page title — no eyebrow or supporting line. Use when the title alone is enough.',
      },
    },
  },
  args: {
    _type: 'pageHeader',
    heading: 'About mBOLDen Change',
    align: 'left',
    isFirstBlock: true,
  },
};
