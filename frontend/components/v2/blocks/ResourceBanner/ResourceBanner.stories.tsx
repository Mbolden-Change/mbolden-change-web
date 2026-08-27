import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import ResourceBanner from './ResourceBanner';
import { externalLink } from '../../_storybook/fixtures';

const meta = {
  title: 'Components/ResourceBanner',
  component: ResourceBanner,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
A full-width colored banner that spotlights **one** resource — a report, toolkit, statement, or similar — with a clear button to open it.

In Sanity this block is called **Resource Banner**.

### What it looks like
- Optional **Resource type label** — for example, “Report” or “Toolkit”
- **Headline** — the name or title of the resource
- Optional **Body** — a short description
- Optional **Call to action** — the button or link
- **Background Color** and **Text Color** — choose a brand color combination that stays readable

### When to use it
- Call out a downloadable report, toolkit, or key document
- Draw attention to a single important link without building a full hero
- Place it mid-page where you want a strong visual break

### When to use something else
- You need a photo + longer story → **Text & Media**
- You’re introducing the whole page at the top → **Impact Hero Section** or **Page Header**

### How to add it in Sanity
1. In the page builder, add a **Resource Banner**.
2. Write the **Headline** (required).
3. Optionally add a **Resource type label** and **Body**.
4. Add a **Call to action** that links to the resource (or an external URL).
5. Pick **Background Color** and **Text Color**.

### Color tips
- **Warm Yellow** with **Black** text is the default and usually the clearest choice
- On **Aqua Teal** or **Fuchsia**, use **White** text — the site adds a light overlay so text stays readable
- On **Black**, use **White** text; on light backgrounds (white, gray, beige), use **Black** text
        `,
      },
    },
  },
} satisfies Meta<typeof ResourceBanner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WarmYellow: Story = {
  name: 'Warm yellow (default)',
  parameters: {
    docs: {
      description: {
        story: 'Default brand look — warm yellow background with black text. Best starting point for most banners.',
      },
    },
  },
  args: {
    _type: 'resourceBanner',
    resourceTypeLabel: 'Report',
    headline: '2024 impact report',
    body: 'See how youth-led organizing shaped policy and practice across the Bay Area.',
    cta: externalLink('Read the report'),
    backgroundColor: 'var(--brand-warm-yellow)',
    textColor: 'var(--brand-black)',
  },
};

export const AquaTeal: Story = {
  name: 'Aqua teal',
  parameters: {
    docs: {
      description: {
        story: 'Aqua teal background with white text — good when you want a cooler accent color.',
      },
    },
  },
  args: {
    ...WarmYellow.args,
    resourceTypeLabel: 'Toolkit',
    headline: 'Advocate with confidence',
    body: 'Practical guides for students, families, and partners.',
    backgroundColor: 'var(--brand-aqua-teal)',
    textColor: 'var(--brand-white)',
  },
};

export const Fuchsia: Story = {
  name: 'Fuchsia',
  parameters: {
    docs: {
      description: {
        story: 'Fuchsia background with white text — use sparingly for high-emphasis callouts.',
      },
    },
  },
  args: {
    ...WarmYellow.args,
    resourceTypeLabel: 'Statement',
    headline: 'Our position on educational equity',
    body: 'A clear stance on the policies we champion.',
    backgroundColor: 'var(--brand-fuchsia)',
    textColor: 'var(--brand-white)',
  },
};
