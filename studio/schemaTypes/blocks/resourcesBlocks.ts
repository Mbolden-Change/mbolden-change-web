import {defineArrayMember, defineField, defineType} from 'sanity'

/** A featured guide on black, with a three-item checklist preview. */
export const featuredGuideType = defineType({
  name: 'featuredGuide',
  title: 'Featured Guide',
  type: 'object',
  description: 'On black: a guide’s title and summary with a button, beside a short checklist visitors can tick.',
  fields: [
    defineField({name: 'eyebrow', title: 'Eyebrow', type: 'string'}),
    defineField({name: 'heading', title: 'Heading', type: 'string', validation: (Rule) => Rule.required()}),
    defineField({name: 'subtitle', title: 'Subtitle', type: 'string', description: 'In yellow under the heading.'}),
    defineField({name: 'text', title: 'Text', type: 'text', rows: 3}),
    defineField({name: 'link', title: 'Button', type: 'internalOrExternalLink', description: 'The button text is the link title.'}),
    defineField({name: 'note', title: 'Note', type: 'string', description: 'Small text beside the button.'}),
    defineField({name: 'previewHeading', title: 'Checklist heading', type: 'string'}),
    defineField({
      name: 'previewItems',
      title: 'Checklist',
      type: 'array',
      of: [
        defineArrayMember({
          name: 'previewItem',
          title: 'Item',
          type: 'object',
          fields: [
            defineField({name: 'text', title: 'Text', type: 'string', validation: (Rule) => Rule.required()}),
            defineField({name: 'checked', title: 'Ticked to start', type: 'boolean', initialValue: false}),
          ],
          preview: {
            select: {title: 'text', checked: 'checked'},
            prepare: ({title, checked}) => ({title: `${checked ? '☑' : '☐'} ${title ?? ''}`}),
          },
        }),
      ],
    }),
    defineField({
      name: 'previewNote',
      title: 'Checklist note',
      type: 'string',
      description: 'Follows “1 of 3 here.”, such as “The full guide has six areas to work through.”',
    }),
  ],
  preview: {select: {title: 'heading'}, prepare: ({title}) => ({title: `Featured Guide — ${title ?? ''}`})},
})

const KINDS = [
  {title: 'Guide', value: 'guide'},
  {title: 'Tool', value: 'tool'},
  {title: 'Briefing', value: 'briefing'},
  {title: 'Report', value: 'report'},
  {title: 'Video', value: 'video'},
]

/** Filterable library of guides, tools, briefings, reports and videos. */
export const resourceLibraryType = defineType({
  name: 'resourceLibrary',
  title: 'Resource Library',
  type: 'object',
  description:
    'Cards with filter chips for each kind. Videos open in a pop-up that plays from YouTube’s privacy-enhanced mode only after someone presses play.',
  fields: [
    defineField({name: 'eyebrow', title: 'Eyebrow', type: 'string'}),
    defineField({name: 'heading', title: 'Heading', type: 'string', validation: (Rule) => Rule.required()}),
    defineField({
      name: 'items',
      title: 'Items',
      type: 'array',
      description: 'In order; drag to reorder.',
      of: [
        defineArrayMember({
          name: 'resourceItem',
          title: 'Item',
          type: 'object',
          fields: [
            defineField({
              name: 'kind',
              title: 'Kind',
              type: 'string',
              options: {list: KINDS, layout: 'radio', direction: 'horizontal'},
              validation: (Rule) => Rule.required(),
            }),
            defineField({name: 'year', title: 'Year', type: 'string'}),
            defineField({name: 'title', title: 'Title', type: 'string', validation: (Rule) => Rule.required()}),
            defineField({name: 'text', title: 'Text', type: 'text', rows: 3}),
            defineField({
              name: 'actionLabel',
              title: 'Link text',
              type: 'string',
              description: 'Such as “Read the case study”. Videos always say “Watch”.',
              hidden: ({parent}) => parent?.kind === 'video',
            }),
            defineField({
              name: 'href',
              title: 'Link',
              type: 'string',
              description: 'A page on this site (/ready-to-grow/project-empower) or a full web address.',
              hidden: ({parent}) => parent?.kind === 'video',
              validation: (Rule) =>
                Rule.custom((value, context) => {
                  if ((context.parent as {kind?: string})?.kind === 'video') return true
                  if (!value) return 'Add a link.'
                  return /^(\/|https:\/\/)/.test(value) ? true : 'Start with / or https://.'
                }),
            }),
            defineField({
              name: 'newTab',
              title: 'Open in a new tab',
              type: 'boolean',
              initialValue: false,
              hidden: ({parent}) => parent?.kind === 'video',
            }),
            defineField({
              name: 'youtube',
              title: 'YouTube video ID or link',
              type: 'string',
              hidden: ({parent}) => parent?.kind !== 'video',
            }),
            defineField({
              name: 'thumbnail',
              title: 'Thumbnail (optional)',
              type: 'image',
              options: {hotspot: true},
              description: 'Shown in black and white. Leave empty to use the video’s YouTube thumbnail, served from our site.',
              hidden: ({parent}) => parent?.kind !== 'video',
            }),
          ],
          preview: {
            select: {title: 'title', kind: 'kind', year: 'year'},
            prepare: ({title, kind, year}) => ({title, subtitle: [kind, year].filter(Boolean).join(' · ')}),
          },
        }),
      ],
    }),
  ],
  preview: {select: {title: 'heading'}, prepare: ({title}) => ({title: `Resource Library — ${title ?? ''}`})},
})

/** Partner organizations with website and report links. */
export const partnerResourcesType = defineType({
  name: 'partnerResources',
  title: 'Partner Resources',
  type: 'object',
  description: 'On teal: a card per partner with links to their website and a report.',
  fields: [
    defineField({name: 'eyebrow', title: 'Eyebrow', type: 'string'}),
    defineField({name: 'heading', title: 'Heading', type: 'string', validation: (Rule) => Rule.required()}),
    defineField({name: 'intro', title: 'Intro', type: 'text', rows: 2}),
    defineField({
      name: 'partners',
      title: 'Partners',
      type: 'array',
      of: [
        defineArrayMember({
          name: 'partner',
          title: 'Partner',
          type: 'object',
          fields: [
            defineField({name: 'focus', title: 'Focus area', type: 'string'}),
            defineField({name: 'name', title: 'Name', type: 'string', validation: (Rule) => Rule.required()}),
            defineField({name: 'text', title: 'Text', type: 'text', rows: 2}),
            defineField({name: 'websiteUrl', title: 'Website', type: 'url'}),
            defineField({name: 'reportUrl', title: 'Report', type: 'string', description: 'A full web address or a /reports/… PDF address.'}),
          ],
          preview: {select: {title: 'name', subtitle: 'focus'}},
        }),
      ],
    }),
  ],
  preview: {select: {title: 'heading'}, prepare: ({title}) => ({title: `Partner Resources — ${title ?? ''}`})},
})
