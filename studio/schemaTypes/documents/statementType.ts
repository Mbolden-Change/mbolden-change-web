import {defineArrayMember, defineField, defineType} from 'sanity'
import {articleBlock} from '../objects/articleBlock'

export const statementType = defineType({
  name: 'statement',
  title: 'Statement',
  type: 'document',
  groups: [
    {name: 'overview', title: 'Overview', default: true},
    {name: 'text', title: 'Text'},
    {name: 'sources', title: 'Sources'},
    {name: 'closing', title: 'Closing'},
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      group: 'overview',
      validation: (Rule) => Rule.required().min(5).max(120),
      description: 'The title of the statement',
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'overview',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'date',
      title: 'Date',
      type: 'datetime',
      group: 'overview',
      validation: (Rule) => Rule.required(),
      description: 'The date the statement was created or published',
    }),
    defineField({
      name: 'datePrecision',
      title: 'Show the date as',
      type: 'string',
      group: 'overview',
      options: {
        list: [
          {title: 'Month and year (June 2025)', value: 'month'},
          {title: 'Full date (June 12, 2025)', value: 'day'},
        ],
        layout: 'radio',
      },
      initialValue: 'month',
    }),
    defineField({
      name: 'issue',
      title: 'Issue',
      type: 'string',
      group: 'overview',
      description: 'Shown as a tag beside "Statement", such as Tax Justice.',
    }),
    defineField({
      name: 'lead',
      title: 'Lead line',
      type: 'string',
      group: 'overview',
      description: 'A large fuchsia line under the title. Optional.',
    }),
    defineField({
      name: 'description',
      title: 'Search description',
      type: 'text',
      rows: 2,
      group: 'overview',
      description: 'One or two sentences for search engines and link previews.',
    }),
    defineField({
      name: 'pdfDownload',
      title: 'PDF Download',
      type: 'file',
      group: 'overview',
      options: {
        accept: 'application/pdf',
      },
      description: 'Optional PDF version of the statement. When attached, a PDF button appears beside the share links.',
    }),
    defineField({
      name: 'text',
      title: 'Text',
      type: 'array',
      group: 'text',
      description:
        'Section headings build the "On this page" menu. Mark a footnote number, such as 1, with the footnote button so it links to the matching source.',
      of: [
        articleBlock,
        defineArrayMember({type: 'image'}),
        defineArrayMember({type: 'sectionHeading'}),
        defineArrayMember({type: 'punchLine'}),
        defineArrayMember({type: 'pullQuote'}),
        defineArrayMember({type: 'thenNow'}),
        defineArrayMember({type: 'requirementCards'}),
        defineArrayMember({type: 'statBand'}),
        defineArrayMember({type: 'checklist'}),
      ],
    }),
    defineField({
      name: 'sources',
      title: 'Sources',
      type: 'array',
      group: 'sources',
      description: 'Numbered in order. Footnote 1 links to the first source.',
      of: [
        defineArrayMember({
          name: 'source',
          title: 'Source',
          type: 'object',
          fields: [
            defineField({name: 'text', title: 'Citation', type: 'text', rows: 2, validation: (Rule) => Rule.required()}),
            defineField({
              name: 'url',
              title: 'Link',
              type: 'url',
              description: 'The link shows as the site name, such as census.gov.',
            }),
          ],
          preview: {select: {title: 'text', subtitle: 'url'}},
        }),
      ],
    }),
    defineField({
      name: 'closing',
      title: 'Closing',
      type: 'object',
      group: 'closing',
      description: 'The black block at the end of the statement.',
      fields: [
        defineField({name: 'eyebrow', title: 'Eyebrow', type: 'string'}),
        defineField({name: 'text', title: 'Paragraph', type: 'text', rows: 3}),
        defineField({name: 'line', title: 'Closing line', type: 'string', description: 'The large white part.'}),
        defineField({name: 'lineAccent', title: 'Closing line, yellow part', type: 'string', description: 'Follows the closing line, in yellow. A space goes between them unless the closing line ends with a dash.'}),
        defineField({
          name: 'cta',
          title: 'Call to action',
          type: 'text',
          rows: 4,
          description: 'Beside the closing line. A blank line starts a new paragraph.',
        }),
        defineField({
          name: 'newsletterLabel',
          title: 'Newsletter button',
          type: 'string',
          initialValue: 'Get our statements by email',
          description: 'Opens the newsletter sign-up. Leave blank to hide it.',
        }),
        defineField({
          name: 'moreLabel',
          title: 'News & Statements button',
          type: 'string',
          initialValue: 'More statements and letters',
          description: 'Links to News & Statements. Leave blank to hide it.',
        }),
      ],
    }),
  ],
  preview: {
    select: {title: 'title', subtitle: 'issue'},
  },
})
