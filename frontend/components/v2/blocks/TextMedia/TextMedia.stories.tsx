import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import TextMedia from './TextMedia';
import { portableText, sanityImage } from '../../_storybook/fixtures';

const meta = {
  title: 'Components/TextMedia',
  component: TextMedia,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
A side-by-side section with a headline, body text, optional buttons, and a photo or video. Use it **in the middle of a page** to tell a story or feature a program.

In Sanity this block is called **Text & Media**.

### What it looks like
- **Headline** — section title
- **Text Body** — supporting copy next to the media
- **Media** — either a photo **or** a YouTube/Vimeo video (not both)
- **Media position** — media on the left or right on large screens
- **Mobile layout** — whether media or text appears first on phones
- Optional **Call To Actions** — one or more buttons

### When to use it
- Feature a program, story, or idea with a photo or short video
- Build out pages after the top intro (Page Header or Impact Hero)
- Anywhere you need a clear text + media pairing mid-page

### When to use something else
- The **top** of the page needs a big hero with buttons → **Impact Hero Section**
- You only need a page title at the top → **Page Header**
- You’re promoting a single report or toolkit in a colorful strip → **Resource Banner**

### How to add it in Sanity
1. In the page builder, add a **Text & Media** block where you want the section.
2. Write the **Headline** and **Text Body**.
3. Under **Media**, add either an **Image** (with alt text) **or** a **Video URL**.
4. Choose **Media position** (left or right) for desktop.
5. Choose **Mobile layout** — media on top or text on top.
6. Optionally add buttons under **Call To Actions**.

### Writing & layout tips
- One clear idea per section — don’t try to cover everything in one block
- On phones, “media on top” usually works well when the image carries the story
- Keep button labels short and action-oriented
        `,
      },
    },
  },
} satisfies Meta<typeof TextMedia>;

export default meta;
type Story = StoryObj<typeof meta>;

export const MediaRight: Story = {
  name: 'Media on the right',
  parameters: {
    docs: {
      description: {
        story: 'Text on the left, photo on the right, with optional buttons under the copy.',
      },
    },
  },
  args: {
    _type: 'textMedia',
    headline: 'Programs that put youth first',
    textBody: portableText(
      'We partner with schools and communities across the Bay Area to expand opportunity and close equity gaps.',
    ),
    mediaPosition: 'right',
    mobileLayout: 'imageTop',
    media: {
      image: sanityImage('Program workshop', 1200, 900),
    },
    ctas: [
      {
        _key: 'c1',
        _type: 'cta',
        label: 'Explore programs',
        link: 'https://www.mboldenchange.org',
      },
      {
        _key: 'c2',
        _type: 'cta',
        label: 'Donate',
        link: 'https://www.mboldenchange.org/donate',
      },
    ],
  },
};

export const MediaLeft: Story = {
  name: 'Media on the left',
  parameters: {
    docs: {
      description: {
        story: 'Same idea with the photo on the left — useful when you want to alternate layouts down the page.',
      },
    },
  },
  args: {
    ...MediaRight.args,
    mediaPosition: 'left',
  },
};

export const WithVideo: Story = {
  name: 'With video',
  parameters: {
    docs: {
      description: {
        story:
          'Uses a video link instead of a photo. In Sanity, add a Video URL and leave the Image field empty.',
      },
    },
  },
  args: {
    _type: 'textMedia',
    headline: 'Stories from the field',
    textBody: portableText(
      'Hear from partners about what shifts when youth lead the work.',
    ),
    mediaPosition: 'right',
    mobileLayout: 'imageTop',
    media: {
      videoUrl: 'https://www.youtube.com/watch?v=oKOMnSbQLik',
    },
    ctas: [
      {
        _key: 'c1',
        _type: 'cta',
        label: 'Watch more',
        link: 'https://www.mboldenchange.org',
      },
    ],
  },
};
