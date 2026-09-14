import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import StoryHighlight from './StoryHighlight';
import { sanityImage } from '../../_storybook/fixtures';

const meta = {
  title: 'Components/StoryHighlight',
  component: StoryHighlight,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
A **single story + voice** section: narrative copy, optional embedded quote with attribution, tilted media, and a CTA.

Use this when one partner quote belongs *with* a story — not as a rotating stack of quotes.

### How this relates to Testimonials
The stakeholder note for the partner feature asked: *carousel or stand alone?*

| | **Story Highlight** (stand alone) | **Testimonials** (carousel) |
| --- | --- | --- |
| **Job** | One story, one voice, in context | Many voices, browse / loop |
| **Quote** | Embedded inside the narrative | The whole section *is* quotes |
| **Media** | Tilted story photo + optional quote marks | Optional headshots per slide |
| **Best when** | Partner feature, case study, field story | Social proof strip, quote gallery |

**Rule of thumb:** If the quote supports a story on the page → **Story Highlight**. If you only need rotating quotes → **Testimonials** (carousel — due for a clearer infinite-loop redesign later).

### Recommended path for the live testimonial
1. **Near term:** Move the current live partner quote (e.g. City Peace Project) into **Story Highlight** — stand-alone story + voice, no carousel chrome.
2. **Later:** Rebuild **Testimonials** as a true looping multi-quote carousel for pages that need several short voices.

That avoids forcing a redesign of the live carousel props now, while putting the strongest quote in the pattern that fits it.

### Story Highlight vs Resource Banner
A case study can be either a *story on the page* or a *link out*:

| | **Story Highlight** | **Resource Banner** |
| --- | --- | --- |
| **Job** | Tell the story in place | Point to the resource |
| **Layout** | Two-column narrative | Full-bleed color strip |

### What it looks like
- Optional **Eyebrow**
- Optional **Quote** + attribution (stand-alone testimonial *inside* this section)
- Optional **Image** (brand parallelogram crop)
- **Headline** + **Body**
- Optional **CTA**

### When to use it
- Partner / case-study features on any page
- Field stories where one voice belongs with the narrative
- Anytime one quote + one story should share a section

### When to use something else
- Multiple rotating quotes → **Testimonials**
- Quick “go read this” strip → **Resource Banner**
- Equal topic cards → **Topic Cards**
- Simple text + media without a quote → **Text & Media**
        `,
      },
    },
  },
} satisfies Meta<typeof StoryHighlight>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithQuoteAndMedia: Story = {
  name: 'With quote and media',
  parameters: {
    docs: {
      description: {
        story:
          'Full stand-alone pattern: eyebrow, embedded quote with attribution, tilted photo, story copy, and CTA.',
      },
    },
  },
  args: {
    eyebrow: 'Partner story · The City Peace Project',
    quote:
      'Throughout our partnership, mBOLDen Change was collaborative, thoughtful, and committed to accountability. They have been an outstanding partner to work alongside.',
    quoteAttribution: 'Solomon Kincheloe',
    quoteCredentials: 'General Manager, The City Peace Project',
    headline: 'A partnership built on clarity, accountability, and families first.',
    body: 'Their team communicated clearly, provided practical guidance, and established reporting processes that balanced responsible stewardship with a genuine focus on serving families.',
    image: sanityImage('The City Peace Project', 1200, 900),
    cta: {
      title: 'Read the story',
      url: 'https://www.mboldenchange.org',
      isExternalLink: true,
      target: '_blank',
    },
    mediaPosition: 'left',
  },
};

export const MediaOnRight: Story = {
  name: 'Media on the right',
  parameters: {
    docs: {
      description: {
        story: 'Same pattern with quote and media on the right — useful for alternating sections.',
      },
    },
  },
  args: {
    ...WithQuoteAndMedia.args,
    mediaPosition: 'right',
  },
};

export const WithoutLink: Story = {
  name: 'Without link',
  parameters: {
    docs: {
      description: {
        story:
          'Complete section with no CTA. Use when the story lives entirely on this page and there’s nowhere else to send people.',
      },
    },
  },
  args: {
    ...WithQuoteAndMedia.args,
    cta: undefined,
  },
};

export const WithoutQuote: Story = {
  name: 'Without quote',
  parameters: {
    docs: {
      description: {
        story:
          'Story + media + CTA only. Use when you have a strong narrative but no partner quote yet.',
      },
    },
  },
  args: {
    eyebrow: 'Field story',
    headline: 'What shifted when cash moved on the partner’s timeline.',
    body: 'Multi-year, unrestricted support let organizers pace the work themselves — without translating every outcome into a funder’s reporting calendar.',
    image: sanityImage('Community workshop', 1200, 900),
    cta: {
      title: 'Learn more',
      url: 'https://www.mboldenchange.org',
      isExternalLink: true,
      target: '_blank',
    },
  },
};

export const QuoteOnly: Story = {
  name: 'Quote without image',
  parameters: {
    docs: {
      description: {
        story:
          'Stand-alone voice + story copy when photography isn’t ready. Still reads as a complete section.',
      },
    },
  },
  args: {
    eyebrow: 'Partner voice · The City Peace Project',
    quote:
      'Throughout our partnership, mBOLDen Change was collaborative, thoughtful, and committed to accountability. Their team communicated clearly, provided practical guidance, and established reporting processes that balanced responsible stewardship with a genuine focus on serving families. They have been an outstanding partner to work alongside.',
    quoteAttribution: 'Solomon Kincheloe',
    quoteCredentials: 'General Manager, The City Peace Project',
    headline: 'A partnership built on clarity, accountability, and families first.',
    body: 'When reporting and stewardship stay practical, partners can stay focused on the work that matters — serving families with care and consistency.',
    cta: {
      title: 'See how we partner',
      url: 'https://www.mboldenchange.org',
      isExternalLink: true,
      target: '_blank',
    },
  },
};
