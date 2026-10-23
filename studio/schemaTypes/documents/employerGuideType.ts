import {defineArrayMember, defineField, defineType} from 'sanity'

const COLORS = [
  {title: 'Teal', value: 'teal'},
  {title: 'Fuchsia', value: 'fuchsia'},
  {title: 'Yellow', value: 'yellow'},
]

const link = defineArrayMember({
  name: 'guideLink',
  title: 'Link',
  type: 'object',
  fields: [
    defineField({name: 'label', title: 'Label', type: 'string', validation: (Rule) => Rule.required()}),
    defineField({name: 'url', title: 'URL', type: 'url', validation: (Rule) => Rule.required()}),
  ],
  preview: {select: {title: 'label', subtitle: 'url'}},
})

const verdict = (name: string, title: string) =>
  defineField({
    name,
    title,
    type: 'object',
    fields: [
      defineField({name: 'heading', title: 'Heading', type: 'string'}),
      defineField({name: 'text', title: 'Text', type: 'text', rows: 2}),
    ],
  })

/**
 * An interactive guide at /resources/<slug>, such as Beyond Compliance:
 * checklists with sample language, a warrant checker, a printable ICE card
 * and Know Your Rights materials.
 */
export const employerGuideType = defineType({
  name: 'employerGuide',
  title: 'Employer Guide',
  type: 'document',
  groups: [
    {name: 'overview', title: 'Overview', default: true},
    {name: 'areas', title: 'Areas'},
    {name: 'warrant', title: 'Warrant Checker'},
    {name: 'ice', title: 'ICE Card'},
    {name: 'materials', title: 'Materials'},
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      group: 'overview',
      description: 'Such as “Beyond Compliance”. Also the browser tab title.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Address',
      type: 'slug',
      group: 'overview',
      description: 'The guide is at /resources/this-address. Changing it breaks links people already have.',
      options: {source: 'title', maxLength: 80},
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 2,
      group: 'overview',
      description: 'For search results and link previews.',
    }),
    defineField({name: 'eyebrow', title: 'Eyebrow', type: 'string', group: 'overview', description: 'Such as “Employer Guide · Updated October 2026”.'}),
    defineField({name: 'subtitle', title: 'Subtitle', type: 'string', group: 'overview'}),
    defineField({name: 'intro', title: 'Intro', type: 'text', rows: 3, group: 'overview'}),
    defineField({
      name: 'howToUse',
      title: 'How to use this guide',
      type: 'object',
      group: 'overview',
      fields: [
        defineField({name: 'heading', title: 'Heading', type: 'string'}),
        defineField({name: 'paragraphs', title: 'Paragraphs', type: 'array', of: [defineArrayMember({type: 'text', rows: 3})]}),
        defineField({
          name: 'pdf',
          title: 'Full guide PDF',
          type: 'reference',
          to: [{type: 'pdfDocument'}],
          description: 'Leave empty to hide the download button.',
        }),
        defineField({name: 'pdfLabel', title: 'PDF button text', type: 'string', initialValue: 'Download the full guide (PDF)'}),
      ],
    }),

    defineField({name: 'areasEyebrow', title: 'Eyebrow', type: 'string', group: 'areas'}),
    defineField({name: 'areasHeading', title: 'Heading', type: 'string', group: 'areas'}),
    defineField({
      name: 'areas',
      title: 'Areas',
      type: 'array',
      group: 'areas',
      description: 'Each opens like an accordion. The first is open when the page loads.',
      of: [
        defineArrayMember({
          name: 'area',
          title: 'Area',
          type: 'object',
          fields: [
            defineField({name: 'title', title: 'Title', type: 'string', validation: (Rule) => Rule.required()}),
            defineField({
              name: 'color',
              title: 'Color',
              type: 'string',
              options: {list: COLORS, layout: 'radio'},
              initialValue: 'teal',
            }),
            defineField({
              name: 'steps',
              title: 'Practices',
              type: 'array',
              of: [
                defineArrayMember({
                  name: 'practice',
                  title: 'Practice',
                  type: 'object',
                  fields: [
                    defineField({name: 'title', title: 'Title', type: 'string', validation: (Rule) => Rule.required()}),
                    defineField({name: 'text', title: 'Text', type: 'text', rows: 3}),
                    defineField({name: 'sampleLabel', title: 'Sample language label', type: 'string'}),
                    defineField({
                      name: 'sample',
                      title: 'Sample language',
                      type: 'text',
                      rows: 4,
                      description: 'Optional. Shown with a “Copy text” button.',
                    }),
                  ],
                  preview: {select: {title: 'title', subtitle: 'sampleLabel'}},
                }),
              ],
            }),
          ],
          preview: {select: {title: 'title'}},
        }),
      ],
    }),

    defineField({
      name: 'warrant',
      title: 'Warrant checker',
      type: 'object',
      group: 'warrant',
      fields: [
        defineField({name: 'eyebrow', title: 'Eyebrow', type: 'string'}),
        defineField({name: 'heading', title: 'Heading', type: 'string'}),
        defineField({name: 'intro', title: 'Intro', type: 'text', rows: 3}),
        defineField({name: 'note', title: 'Note', type: 'string', description: 'Such as “This is a guide, not legal advice. …”'}),
        defineField({
          name: 'questions',
          title: 'Yes or no questions',
          type: 'array',
          description: 'Any “No” shows the first verdict; all “Yes” shows the second.',
          of: [defineArrayMember({type: 'string'})],
        }),
        verdict('noVerdict', 'Verdict when any answer is No'),
        verdict('yesVerdict', 'Verdict when every answer is Yes'),
      ],
    }),

    defineField({
      name: 'ice',
      title: 'ICE card',
      type: 'object',
      group: 'ice',
      fields: [
        defineField({name: 'eyebrow', title: 'Eyebrow', type: 'string'}),
        defineField({name: 'heading', title: 'Heading', type: 'string'}),
        defineField({name: 'intro', title: 'Intro', type: 'text', rows: 2}),
        defineField({name: 'buttonLabel', title: 'Print button text', type: 'string', initialValue: 'Print the card'}),
        defineField({name: 'steps', title: 'Steps', type: 'array', of: [defineArrayMember({type: 'string'})]}),
      ],
    }),

    defineField({
      name: 'materials',
      title: 'Know Your Rights materials',
      type: 'object',
      group: 'materials',
      fields: [
        defineField({name: 'eyebrow', title: 'Eyebrow', type: 'string'}),
        defineField({name: 'heading', title: 'Heading', type: 'string'}),
        defineField({name: 'intro', title: 'Intro', type: 'text', rows: 2}),
        defineField({
          name: 'resources',
          title: 'Resources',
          type: 'array',
          of: [
            defineArrayMember({
              name: 'material',
              title: 'Resource',
              type: 'object',
              fields: [
                defineField({name: 'title', title: 'Title', type: 'string', validation: (Rule) => Rule.required()}),
                defineField({name: 'text', title: 'Text', type: 'text', rows: 2}),
                defineField({name: 'links', title: 'Downloads', type: 'array', description: 'Each opens in a new tab.', of: [link]}),
              ],
              preview: {select: {title: 'title'}},
            }),
          ],
        }),
        defineField({
          name: 'redCards',
          title: 'Red cards',
          type: 'object',
          fields: [
            defineField({
              name: 'title',
              title: 'Title',
              type: 'string',
              description: '{count} becomes the number of languages, such as “Red Cards in {count} Languages”.',
            }),
            defineField({name: 'text', title: 'Text', type: 'text', rows: 3}),
            defineField({name: 'chooseLabel', title: 'Language list label', type: 'string', initialValue: 'Choose a language'}),
            defineField({
              name: 'languages',
              title: 'Languages',
              type: 'array',
              description: 'Featured languages show first; the rest show after “Show all”. The first featured language is selected to start.',
              of: [
                defineArrayMember({
                  name: 'language',
                  title: 'Language',
                  type: 'object',
                  fields: [
                    defineField({name: 'name', title: 'Language', type: 'string', validation: (Rule) => Rule.required()}),
                    defineField({name: 'url', title: 'PDF', type: 'url', validation: (Rule) => Rule.required()}),
                    defineField({name: 'featured', title: 'Featured', type: 'boolean', initialValue: false}),
                    defineField({
                      name: 'order',
                      title: 'Featured order',
                      type: 'number',
                      description: 'Order among featured languages (1 first).',
                    }),
                  ],
                  preview: {
                    select: {title: 'name', featured: 'featured', subtitle: 'url'},
                    prepare: ({title, featured, subtitle}) => ({title: featured ? `${title} ★` : title, subtitle}),
                  },
                }),
              ],
            }),
          ],
        }),
        defineField({name: 'sourceNote', title: 'Source note', type: 'string', description: 'Such as “Files open from ilrc.org, so you always get their latest version.”'}),
        defineField({name: 'moreLink', title: 'More link', type: 'array', of: [link], validation: (Rule) => Rule.max(1)}),
        defineField({
          name: 'disclaimer',
          title: 'Disclaimer',
          type: 'text',
          rows: 3,
          description: 'Shown after a bold “Disclaimer:” at the bottom.',
        }),
      ],
    }),
  ],
  preview: {
    select: {title: 'title', slug: 'slug.current'},
    prepare: ({title, slug}) => ({title, subtitle: slug ? `/resources/${slug}` : undefined}),
  },
})
