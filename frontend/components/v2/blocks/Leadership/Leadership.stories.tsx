import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import Leadership from './Leadership';
import { sanityImage } from '../../_storybook/fixtures';

const meta = {
  title: 'Components/Leadership',
  component: Leadership,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
A list of people cards — great for leadership, staff, or board sections. Each person can include a photo, role, short bio, and an optional link (for example, LinkedIn).

In Sanity this block is called **Leadership**.

### What it looks like
- Optional **Title** above the list (for example, “Leadership” or “Board”)
- One or more **People**, each with:
  - **Name** (required)
  - Optional role, bio, photo, and link

### When to use it
- About pages and team pages
- Board or staff lists
- Inside a **Tabs Container** tab when you want different teams on different tabs

### When to use something else
- Quotes from partners or community members → **Testimonials Carousel**
- A general story with a photo → **Text & Media**

### How to add it in Sanity
1. In the page builder, add a **Leadership** block.
2. Optionally add a **Title**.
3. Under **People**, add each person and fill in their details.
4. Photos are optional — cards still work well with name, role, and bio only.

### Writing tips
- Keep bios to a few sentences
- Use consistent photo framing when you include headshots (similar crop and lighting)
- Link labels should be clear (“Connect on LinkedIn”) rather than generic (“Learn more”)
        `,
      },
    },
  },
} satisfies Meta<typeof Leadership>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: 'With photos',
  parameters: {
    docs: {
      description: {
        story: 'Typical leadership section with headshots, roles, bios, and optional profile links.',
      },
    },
  },
  args: {
    _type: 'leadership',
    title: 'Leadership',
    people: [
      {
        _key: 'p1',
        _type: 'person',
        name: 'Jordan Lee',
        role: 'Executive Director',
        bio: 'Community organizer focused on educational equity across the Bay Area.',
        image: sanityImage('Jordan Lee', 400, 400),
        link: 'https://www.linkedin.com',
        linkLabel: 'Connect on LinkedIn',
      },
      {
        _key: 'p2',
        _type: 'person',
        name: 'Sam Ortiz',
        role: 'Director of Programs',
        bio: 'Builds youth-centered programs with school and nonprofit partners.',
        image: sanityImage('Sam Ortiz', 400, 400),
      },
      {
        _key: 'p3',
        _type: 'person',
        name: 'Avery Chen',
        role: 'Policy Lead',
        bio: 'Advocates for systems change with students and families at the table.',
        image: sanityImage('Avery Chen', 400, 400),
        link: 'https://www.linkedin.com',
      },
    ],
  },
};

export const WithoutImages: Story = {
  name: 'Without photos',
  parameters: {
    docs: {
      description: {
        story:
          'Name, role, and bio only. Useful for board lists when photos aren’t available yet.',
      },
    },
  },
  args: {
    _type: 'leadership',
    title: 'Board',
    people: [
      {
        _key: 'b1',
        _type: 'person',
        name: 'Riley Morgan',
        role: 'Board Chair',
        bio: 'Nonprofit strategist and longtime education advocate.',
      },
      {
        _key: 'b2',
        _type: 'person',
        name: 'Casey Nguyen',
        role: 'Treasurer',
        bio: 'Finance leader supporting sustainable growth.',
      },
    ],
  },
};
