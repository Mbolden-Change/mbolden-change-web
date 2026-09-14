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

### Testimonials vs Story Highlight
The partner-feature feedback asked whether the testimonial should be a **carousel or stand alone**.

| | **Testimonials** (carousel) | **Story Highlight** (stand alone) |
| --- | --- | --- |
| **Job** | Many voices, browse / loop | One story, one voice, in context |
| **Quote** | The section *is* quotes | Quote embedded inside a narrative |
| **Best when** | Social proof strip, quote gallery | Partner feature, case study, field story |

**Rule of thumb:** Rotating quotes only → **Testimonials**. Quote that supports a story on the page → **Story Highlight**.

### Recommended path
1. **Near term:** Prefer **Story Highlight** for the current live partner testimonial (stand-alone story + voice).
2. **Later:** Redesign this block as a clearer **infinite-loop carousel** when you need multiple short quotes without a full narrative each.

Until that carousel rebuild, don’t stretch this block to do Story Highlight’s job.

### What it looks like
- Optional **Headline** and **Body** above the quotes
- Optional section **button** (for example, “See all stories”)
- One or more **slides**, each with quote, author, credentials, optional photo

### When to use it
- Pages that need several short voices without a full narrative each
- Social proof mid-page

### When to use something else
- One partner voice inside a story → **Story Highlight**
- Full team bios → **Leadership**
- Longer story with photo, no quote → **Text & Media**

### How to add it in Sanity
1. In the page builder, add a **Testimonials Carousel**.
2. Optionally add a **Headline**, **Body**, and a section button.
3. Under **slides**, add each testimonial.
4. Add **two or more** slides if you want the carousel; one slide shows as a static quote.

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
        title: 'Outstanding partnership',
        text: portableText(
          'Throughout our partnership, mBOLDen Change was collaborative, thoughtful, and committed to accountability. Their team communicated clearly, provided practical guidance, and established reporting processes that balanced responsible stewardship with a genuine focus on serving families. They have been an outstanding partner to work alongside.',
          't1',
        ),
        quoteMarksColor: 'fuchsia',
        author: 'Solomon Kincheloe',
        credentials: 'General Manager, The City Peace Project',
        image: sanityImage('Solomon Kincheloe', 200, 200),
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
        quoteMarksColor: 'yellow',
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
