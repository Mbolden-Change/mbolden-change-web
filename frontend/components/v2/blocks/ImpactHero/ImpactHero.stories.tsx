import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import ImpactHero from './ImpactHero';
import { externalLink, sanityImage } from '../../_storybook/fixtures';

const meta = {
  title: 'Components/ImpactHero',
  component: ImpactHero,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
The big opening section at the **top of a landing or campaign page**. It combines a strong headline with a photo or video and up to two buttons.

In Sanity this block is called **Impact Hero Section**.

### What it looks like
- Optional **Eyebrow** — short label above the headline
- **Heading** — the main hero headline
- Optional **Subheading** — one or two supporting sentences
- **Media** — either a photo **or** a YouTube/Vimeo video (not both)
- **Media position** — photo/video on the left or right on large screens
- Optional **CTA 1** and **CTA 2** — buttons (for example, “Get involved” / “Donate”)

### When to use it
- Homepages and campaign or landing pages
- Pages where you want visitors to take an action right away
- Anytime the top of the page needs a photo or video — not just a title

### When to use something else
- A simple interior page that only needs a title → use **Page Header**
- A mid-page section with text + photo → use **Text & Media**

### How to add it in Sanity
1. Open the page and go to the page builder.
2. Add an **Impact Hero Section** at the **top**.
3. Write the **Heading** (required).
4. Optionally add an **Eyebrow** and **Subheading**.
5. Under **Media**, add either an **Image** (with alt text) **or** a **Video URL** — not both.
6. Choose left or right for **Media position**.
7. Optionally add one or two buttons (**CTA 1**, **CTA 2**).

### Writing & media tips
- Keep the **Heading** to roughly one strong line (about 5–10 words)
- Prefer a still **image** for most heroes; use video when the clip is short and important
- Always fill in **Alt text** for images so the page is accessible
- Button labels should be clear actions (“Donate”, “Get involved”), not vague (“Click here”)
        `,
      },
    },
  },
} satisfies Meta<typeof ImpactHero>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ImageRight: Story = {
  name: 'Image on the right',
  parameters: {
    docs: {
      description: {
        story:
          'Text on the left, photo on the right — a common landing-page layout with two action buttons.',
      },
    },
  },
  args: {
    _type: 'impactHero',
    eyebrow: 'Our impact',
    heading: 'Building power with Bay Area youth',
    subheading:
      'We partner with schools and communities to expand opportunity and close equity gaps.',
    mediaPosition: 'right',
    media: {
      image: sanityImage('Youth workshop', 1200, 900),
    },
    cta1: externalLink('Get involved', 'https://www.mboldenchange.org'),
    cta2: externalLink('Donate', 'https://www.mboldenchange.org/donate'),
  },
};

export const ImageLeft: Story = {
  name: 'Image on the left',
  parameters: {
    docs: {
      description: {
        story: 'Same content as above, with the photo on the left instead of the right.',
      },
    },
  },
  args: {
    ...ImageRight.args,
    mediaPosition: 'left',
  },
};

export const WithVideo: Story = {
  name: 'With video',
  parameters: {
    docs: {
      description: {
        story:
          'Uses a YouTube or Vimeo link instead of a photo. In Sanity, add a Video URL and leave the Image field empty.',
      },
    },
  },
  args: {
    _type: 'impactHero',
    eyebrow: 'Watch',
    heading: 'See the work in action',
    subheading: 'A short look at how we show up with youth and partners.',
    mediaPosition: 'right',
    media: {
      videoUrl: 'https://www.youtube.com/watch?v=oKOMnSbQLik',
    },
    cta1: externalLink('Learn more'),
  },
};

export const TextOnly: Story = {
  name: 'Text and buttons only',
  parameters: {
    docs: {
      description: {
        story:
          'Headline and buttons without media. Prefer adding a photo when you can — this option is for rare cases.',
      },
    },
  },
  args: {
    _type: 'impactHero',
    eyebrow: 'Campaign',
    heading: 'Bold ideas need bold action',
    subheading: 'Join us in advocating for policies that put youth first.',
    media: {},
    cta1: externalLink('Take action'),
  },
};
