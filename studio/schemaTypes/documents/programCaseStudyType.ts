import {defineArrayMember, defineField, defineType} from 'sanity'

/** A short heading and text, used by How It Worked, What We Learned and the next phase. */
const headingText = (name: string, title: string) =>
  defineArrayMember({
    name,
    title,
    type: 'object',
    fields: [
      defineField({name: 'heading', title: 'Heading', type: 'string', validation: (Rule) => Rule.required()}),
      defineField({name: 'text', title: 'Text', type: 'text', rows: 3, validation: (Rule) => Rule.required()}),
    ],
    preview: {select: {title: 'heading', subtitle: 'text'}},
  })

const stat = (description: string) =>
  defineArrayMember({
    name: 'stat',
    title: 'Stat',
    type: 'object',
    fields: [
      defineField({
        name: 'value',
        title: 'Number',
        type: 'string',
        description,
        validation: (Rule) => Rule.required().max(12),
      }),
      defineField({name: 'label', title: 'Label', type: 'string', validation: (Rule) => Rule.required()}),
    ],
    preview: {select: {title: 'value', subtitle: 'label'}},
  })

const quoteFields = [
  defineField({name: 'quote', title: 'Quote', type: 'text', rows: 3, validation: (Rule) => Rule.required()}),
  defineField({name: 'attribution', title: 'Attribution', type: 'string'}),
]

/**
 * A field-tested model on the Ready to Grow page, at /ready-to-grow/<slug>.
 * The Ready to Grow page's cards pull the lane, years, name, card summary and
 * card stats from here.
 */
export const programCaseStudyType = defineType({
  name: 'programCaseStudy',
  title: 'Ready to Grow Case Study',
  type: 'document',
  groups: [
    {name: 'overview', title: 'Overview', default: true},
    {name: 'results', title: 'Results'},
    {name: 'model', title: 'How It Worked'},
    {name: 'learned', title: 'What We Learned'},
    {name: 'video', title: 'Video'},
    {name: 'quotes', title: 'Quotes'},
    {name: 'next', title: 'Next Phase'},
  ],
  fields: [
    // Overview
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      group: 'overview',
      description: 'The model’s name, such as “Youth Cash Transfer”. Also the browser tab title.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Address',
      type: 'slug',
      group: 'overview',
      description: 'The page is at /ready-to-grow/this-address. Changing it breaks links people already have.',
      options: {source: 'name', maxLength: 80},
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'color',
      title: 'Color',
      type: 'string',
      group: 'overview',
      description: 'The model’s color: the results band, the card bar and the accents.',
      options: {
        list: [
          {title: 'Teal', value: 'teal'},
          {title: 'Fuchsia (white text on the results band)', value: 'fuchsia'},
          {title: 'Yellow', value: 'yellow'},
        ],
        layout: 'radio',
      },
      initialValue: 'teal',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'lane',
      title: 'Lane',
      type: 'string',
      group: 'overview',
      description: 'Such as “Economic Security”. Shown before the pilot years.',
    }),
    defineField({
      name: 'pilotYears',
      title: 'Pilot years',
      type: 'string',
      group: 'overview',
      description: 'Such as “2023–2024”. Shown as “Piloted 2023–2024”.',
    }),
    defineField({
      name: 'summary',
      title: 'Summary',
      type: 'text',
      rows: 3,
      group: 'overview',
      description: 'Under the name at the top of the page. Also the page description for search engines.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'glance',
      title: 'At a glance',
      type: 'array',
      group: 'overview',
      description: 'The white box beside the name: one row per fact.',
      of: [
        defineArrayMember({
          name: 'glanceRow',
          title: 'Row',
          type: 'object',
          fields: [
            defineField({name: 'label', title: 'Label', type: 'string', validation: (Rule) => Rule.required()}),
            defineField({name: 'value', title: 'Value', type: 'string', validation: (Rule) => Rule.required()}),
          ],
          preview: {select: {title: 'label', subtitle: 'value'}},
        }),
      ],
    }),
    defineField({
      name: 'cardSummary',
      title: 'Card summary',
      type: 'text',
      rows: 3,
      group: 'overview',
      description: 'The summary on this model’s card on the Ready to Grow page.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'cardStats',
      title: 'Card stats',
      type: 'array',
      group: 'overview',
      description: 'Three results on this model’s card on the Ready to Grow page.',
      of: [stat('As it should read, such as “100%” or “$200”.')],
      validation: (Rule) => Rule.length(3),
    }),

    // Results
    defineField({
      name: 'results',
      title: 'Results band',
      type: 'object',
      group: 'results',
      fields: [
        defineField({name: 'eyebrow', title: 'Eyebrow', type: 'string', initialValue: 'Results'}),
        defineField({name: 'heading', title: 'Heading', type: 'string', validation: (Rule) => Rule.required()}),
        defineField({
          name: 'stats',
          title: 'Stats',
          type: 'array',
          of: [stat('Such as “100%” or “$144,000”. The number counts up when the band scrolls into view.')],
          validation: (Rule) => Rule.length(3),
        }),
        defineField({name: 'source', title: 'Source line', type: 'text', rows: 2}),
      ],
    }),

    // How It Worked
    defineField({
      name: 'model',
      title: 'How It Worked',
      type: 'object',
      group: 'model',
      fields: [
        defineField({name: 'eyebrow', title: 'Eyebrow', type: 'string', initialValue: 'The Model'}),
        defineField({name: 'heading', title: 'Heading', type: 'string', initialValue: 'How It Worked'}),
        defineField({name: 'intro', title: 'Intro', type: 'text', rows: 3}),
        defineField({
          name: 'cards',
          title: 'Cards',
          type: 'array',
          of: [headingText('modelCard', 'Card')],
          validation: (Rule) => Rule.length(3),
        }),
      ],
    }),

    // What We Learned
    defineField({
      name: 'learned',
      title: 'What We Learned',
      type: 'object',
      group: 'learned',
      fields: [
        defineField({name: 'eyebrow', title: 'Eyebrow', type: 'string', initialValue: 'Insights'}),
        defineField({name: 'heading', title: 'Heading', type: 'string', initialValue: 'What We Learned'}),
        defineField({
          name: 'items',
          title: 'Lessons',
          type: 'array',
          description: 'The first heading gets the yellow highlight.',
          of: [headingText('lesson', 'Lesson')],
        }),
      ],
    }),

    // Video
    defineField({
      name: 'video',
      title: 'Video (optional)',
      type: 'object',
      group: 'video',
      description:
        'Shows our cover image with a play button. Nothing loads from YouTube until someone presses play, then it plays from YouTube’s privacy-enhanced mode. Leave the YouTube field empty for no video.',
      fields: [
        defineField({
          name: 'youtube',
          title: 'YouTube link or ID',
          type: 'string',
          description: 'Such as https://youtu.be/UOt1dy_IkIw or UOt1dy_IkIw.',
        }),
        defineField({name: 'eyebrow', title: 'Eyebrow', type: 'string', description: 'Such as “Watch · 13 min”.'}),
        defineField({name: 'heading', title: 'Title', type: 'string'}),
        defineField({name: 'description', title: 'Description', type: 'text', rows: 3}),
        defineField({
          name: 'cover',
          title: 'Cover image',
          type: 'image',
          options: {hotspot: true},
          fields: [defineField({name: 'alt', title: 'Alt text', type: 'string'})],
        }),
        defineField({
          name: 'chapters',
          title: 'Chapters',
          type: 'array',
          of: [
            defineArrayMember({
              name: 'chapter',
              title: 'Chapter',
              type: 'object',
              fields: [
                defineField({
                  name: 'time',
                  title: 'Time',
                  type: 'string',
                  description: 'Such as “07:01”.',
                  validation: (Rule) => Rule.required().regex(/^\d{1,2}(:\d{2}){1,2}$/, {name: 'mm:ss'}),
                }),
                defineField({name: 'label', title: 'Label', type: 'string', validation: (Rule) => Rule.required()}),
              ],
              preview: {select: {title: 'label', subtitle: 'time'}},
            }),
          ],
        }),
      ],
    }),

    // Quotes
    defineField({
      name: 'quotes',
      title: 'Quotes',
      type: 'object',
      group: 'quotes',
      fields: [
        defineField({name: 'eyebrow', title: 'Eyebrow', type: 'string', initialValue: 'In Their Words'}),
        defineField({
          name: 'main',
          title: 'Main quote',
          type: 'object',
          description: 'Revealed word by word.',
          fields: quoteFields,
        }),
        defineField({
          name: 'short',
          title: 'Short quotes (optional)',
          type: 'array',
          description: 'A row of up to three under the main quote.',
          of: [
            defineArrayMember({
              name: 'shortQuote',
              title: 'Short quote',
              type: 'object',
              fields: quoteFields,
              preview: {select: {title: 'quote', subtitle: 'attribution'}},
            }),
          ],
          validation: (Rule) => Rule.max(3),
        }),
        defineField({
          name: 'secondary',
          title: 'Secondary quote (optional)',
          type: 'object',
          fields: [
            defineField({name: 'quote', title: 'Quote', type: 'text', rows: 3}),
            defineField({name: 'attribution', title: 'Attribution', type: 'string'}),
          ],
        }),
      ],
    }),

    // Next Phase
    defineField({
      name: 'nextPhase',
      title: 'What the Next Phase Needs',
      type: 'object',
      group: 'next',
      fields: [
        defineField({name: 'eyebrow', title: 'Eyebrow', type: 'string', initialValue: 'Ready to Grow'}),
        defineField({name: 'heading', title: 'Heading', type: 'string', initialValue: 'What the Next Phase Needs'}),
        defineField({name: 'intro', title: 'Intro', type: 'text', rows: 2}),
        defineField({
          name: 'items',
          title: 'Items',
          type: 'array',
          of: [headingText('need', 'Item')],
          validation: (Rule) => Rule.length(3),
        }),
        defineField({
          name: 'buttonLabel',
          title: 'Email button text',
          type: 'string',
          initialValue: 'Fund the Next Phase',
        }),
        defineField({
          name: 'emailSubject',
          title: 'Email subject',
          type: 'string',
          description:
            'The button and the contact line open an email to the Advancement contact in Site Settings with this subject.',
        }),
        defineField({
          name: 'pdf',
          title: 'Report PDF',
          type: 'reference',
          to: [{type: 'pdfDocument'}],
        }),
        defineField({
          name: 'pdfLabel',
          title: 'PDF button text',
          type: 'string',
          description: 'Such as “Download the full evaluation (PDF)”.',
        }),
      ],
    }),
  ],
  preview: {
    select: {title: 'name', lane: 'lane', years: 'pilotYears'},
    prepare({title, lane, years}) {
      return {title, subtitle: [lane, years && `Piloted ${years}`].filter(Boolean).join(' · ')}
    },
  },
})
