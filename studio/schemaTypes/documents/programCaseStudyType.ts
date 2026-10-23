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
  title: 'Program Case Study',
  type: 'document',
  groups: [
    {name: 'overview', title: 'Overview', default: true},
    {name: 'results', title: 'Results'},
    {name: 'model', title: 'How It Worked'},
    {name: 'payments', title: 'Where the Money Went'},
    {name: 'learned', title: 'What We Learned'},
    {name: 'video', title: 'Video'},
    {name: 'voices', title: 'From the Families'},
    {name: 'quotes', title: 'Quotes'},
    {name: 'next', title: 'Next Phase'},
    {name: 'closing', title: 'Closing'},
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
      description:
        'The page is at /ready-to-grow/this-address or /resources/this-address, depending on Section. Changing it breaks links people already have.',
      options: {source: 'name', maxLength: 80},
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'section',
      title: 'Section',
      type: 'string',
      group: 'overview',
      description:
        'Where the case study lives: Ready to Grow (/ready-to-grow/…) or Resources (/resources/…). Its “←” link goes back to that section.',
      options: {
        list: [
          {title: 'Ready to Grow', value: 'readyToGrow'},
          {title: 'Resources', value: 'resources'},
        ],
        layout: 'radio',
      },
      initialValue: 'readyToGrow',
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
      validation: (Rule) =>
        Rule.custom((value, context) =>
          (context.document as {section?: string})?.section === 'resources' || value ? true : 'Required for Ready to Grow.',
        ),
    }),
    defineField({
      name: 'cardStats',
      title: 'Card stats',
      type: 'array',
      group: 'overview',
      description: 'Three results on this model’s card on the Ready to Grow page.',
      of: [stat('As it should read, such as “100%” or “$200”.')],
      validation: (Rule) =>
        Rule.custom((value, context) =>
          (context.document as {section?: string})?.section === 'resources' || (value as unknown[] | undefined)?.length === 3
            ? true
            : 'Add three stats.',
        ),
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
          name: 'numbered',
          title: 'Number the cards',
          type: 'boolean',
          description: 'Shows 01, 02 and 03 above the card headings, for steps that happen in order.',
          initialValue: false,
        }),
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

    // From the Families
    defineField({
      name: 'voices',
      title: 'From the Families (optional)',
      type: 'object',
      group: 'voices',
      description: 'On black: a list of speakers on the left. Choosing one shows their quote, word by word, with a note under it.',
      fields: [
        defineField({name: 'eyebrow', title: 'Eyebrow', type: 'string', initialValue: 'In Their Words'}),
        defineField({name: 'heading', title: 'Heading', type: 'string', initialValue: 'From the Families'}),
        defineField({
          name: 'items',
          title: 'Speakers',
          type: 'array',
          of: [
            defineArrayMember({
              name: 'voice',
              title: 'Speaker',
              type: 'object',
              fields: [
                defineField({
                  name: 'speaker',
                  title: 'Who',
                  type: 'string',
                  description: 'Described without names, such as “A grandmother caring for three grandchildren”.',
                  validation: (Rule) => Rule.required(),
                }),
                defineField({name: 'quote', title: 'Quote', type: 'text', rows: 3, validation: (Rule) => Rule.required()}),
                defineField({name: 'note', title: 'Note', type: 'string', description: 'Shown under the quote, such as “Translated from Spanish.”'}),
              ],
              preview: {select: {title: 'speaker', subtitle: 'quote'}},
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

    // Where the Money Went
    defineField({
      name: 'payments',
      title: 'Where the Money Went (optional)',
      type: 'object',
      group: 'payments',
      description:
        'On yellow: one tile per payment, with chips to highlight the payments that met each need and a live tally.',
      fields: [
        defineField({name: 'eyebrow', title: 'Eyebrow', type: 'string', initialValue: 'Every Payment'}),
        defineField({name: 'heading', title: 'Heading', type: 'string', initialValue: 'Where the Money Went'}),
        defineField({name: 'intro', title: 'Intro', type: 'text', rows: 3}),
        defineField({
          name: 'items',
          title: 'Payments',
          type: 'array',
          description: 'In date order.',
          of: [
            defineArrayMember({
              name: 'payment',
              title: 'Payment',
              type: 'object',
              fields: [
                defineField({name: 'date', title: 'Date', type: 'string', description: 'As shown, such as “May 20”.', validation: (Rule) => Rule.required()}),
                defineField({name: 'amount', title: 'Amount ($)', type: 'number', validation: (Rule) => Rule.required().min(0)}),
                defineField({
                  name: 'needs',
                  title: 'Needs met',
                  type: 'array',
                  description: 'The first one sets the tile’s color.',
                  of: [defineArrayMember({type: 'string'})],
                  options: {
                    list: [
                      {title: 'Housing', value: 'Housing'},
                      {title: 'Clothing', value: 'Clothing'},
                      {title: 'Food', value: 'Food'},
                      {title: 'Transportation', value: 'Transportation'},
                      {title: 'Medical', value: 'Medical'},
                      {title: 'School supplies', value: 'School supplies'},
                      {title: 'Other emergencies', value: 'Other'},
                    ],
                  },
                  validation: (Rule) => Rule.required().min(1),
                }),
                defineField({name: 'use', title: 'What it paid for', type: 'string', validation: (Rule) => Rule.required()}),
                defineField({name: 'people', title: 'People helped', type: 'number', validation: (Rule) => Rule.required().min(1)}),
              ],
              preview: {
                select: {date: 'date', amount: 'amount', use: 'use'},
                prepare: ({date, amount, use}) => ({title: `${date ?? ''} · $${amount ?? ''}`, subtitle: use}),
              },
            }),
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

    // Closing
    defineField({
      name: 'closing',
      title: 'Closing (optional)',
      type: 'object',
      group: 'closing',
      description:
        'A closing block in the case study’s color, used instead of What the Next Phase Needs: text, a credit line in bold and up to two buttons.',
      fields: [
        defineField({name: 'eyebrow', title: 'Eyebrow', type: 'string'}),
        defineField({name: 'heading', title: 'Heading', type: 'string'}),
        defineField({name: 'text', title: 'Text', type: 'text', rows: 3}),
        defineField({
          name: 'credit',
          title: 'Credit line',
          type: 'text',
          rows: 2,
          description: 'Shown in bold on white, such as a funder credit a grant agreement requires.',
        }),
        defineField({name: 'buttonLabel', title: 'Button text', type: 'string'}),
        defineField({
          name: 'buttonUrl',
          title: 'Button link',
          type: 'url',
          description: 'Opens in a new tab.',
        }),
        defineField({name: 'pdf', title: 'Report PDF', type: 'reference', to: [{type: 'pdfDocument'}]}),
        defineField({name: 'pdfLabel', title: 'PDF button text', type: 'string'}),
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
