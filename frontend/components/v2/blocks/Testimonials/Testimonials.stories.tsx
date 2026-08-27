import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import Testimonials from './Testimonials';
import { externalLink, portableText, sanityImage } from '../../_storybook/fixtures';

const meta = {
  title: 'Components/Testimonials',
  component: Testimonials,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
A rotating set of **quotes from partners, community members, or youth** — with optional photos and attribution. With two or more quotes, visitors can move between them like a slideshow.

In Sanity this block is called **Testimonials Carousel**.

### What it looks like
- Optional **Headline** and **Body** above the quotes
- Optional section **button** (for example, “See all stories”)
- One or more **slides**, each with:
  - Optional title
  - Quote text
  - Author name and credentials (role / organization)
  - Optional photo
  - Quote mark color accent

### When to use it
- Landing and program pages where real voices build trust
- Anywhere you want short, scannable social proof

### When to use something else
- Full team bios → **Leadership**
- A longer story with photo → **Text & Media**

### How to add it in Sanity
1. In the page builder, add a **Testimonials Carousel**.
2. Optionally add a **Headline**, **Body**, and a section button.
3. Under **slides**, add each testimonial.
4. Add **two or more** slides if you want the carousel arrows; one slide shows as a static quote.

### Writing tips
- Keep quotes short — one or two sentences is ideal
- Always include who said it (name + role or affiliation)
- Prefer real photos when you have permission; the section still works without them
        `,
      },
    },
  },
} satisfies Meta<typeof Testimonials>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: 'Multiple quotes (carousel)',
  parameters: {
    docs: {
      description: {
        story:
          'Several quotes visitors can browse through, with a section headline and optional “See all” button.',
      },
    },
  },
  args: {
    title: 'Voices from partners',
    text: portableText('What community leaders say about the work.'),
    hasButton: true,
    link: externalLink('See all stories'),
    slides: [
      {
        _key: 's1',
        _type: 'testimonialCard',
        title: 'Transformative',
        text: portableText(
          'mBOLDen Change changed how we show up for students and families.',
          't1',
        ),
        quoteMarksColor: 'fuchsia',
        author: 'Alex Rivera',
        credentials: 'Partner, Oakland',
        image: sanityImage('Alex Rivera', 200, 200),
        hasButton: false,
      },
      {
        _key: 's2',
        _type: 'testimonialCard',
        title: 'Youth-centered',
        text: portableText(
          'They keep young people in the lead — not as an afterthought.',
          't2',
        ),
        quoteMarksColor: 'aqua',
        author: 'Morgan Ellis',
        credentials: 'Educator, San José',
        image: sanityImage('Morgan Ellis', 200, 200),
        hasButton: false,
      },
      {
        _key: 's3',
        _type: 'testimonialCard',
        title: 'Real partnership',
        text: portableText(
          'Practical support, clear communication, and lasting relationships.',
          't3',
        ),
        quoteMarksColor: 'yellow',
        author: 'Jamie Park',
        credentials: 'Nonprofit director',
        image: sanityImage('Jamie Park', 200, 200),
        hasButton: false,
      },
    ],
  },
};

export const SingleSlide: Story = {
  name: 'Single quote',
  parameters: {
    docs: {
      description: {
        story:
          'One testimonial only — no carousel controls. Useful when you have a single strong quote to feature.',
      },
    },
  },
  args: {
    title: 'Community voice',
    slides: [Default.args!.slides![0]],
  },
};
