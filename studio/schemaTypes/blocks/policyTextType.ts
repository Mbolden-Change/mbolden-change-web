import {defineArrayMember, defineField, defineType} from 'sanity'

// Links only, no styles or lists, for the text inside a table cell.
const linkAnnotation = defineArrayMember({
  name: 'link',
  title: 'Link',
  type: 'object',
  fields: [
    defineField({
      name: 'href',
      title: 'URL',
      type: 'url',
      description: 'Web addresses open in a new tab. Use mailto: for an email address.',
      validation: (Rule) => Rule.uri({scheme: ['http', 'https', 'mailto', 'tel']}),
    }),
  ],
})

export const policyTableType = defineType({
  name: 'policyTable',
  title: 'Table',
  type: 'object',
  fields: [
    defineField({
      name: 'headers',
      title: 'Column headings',
      type: 'array',
      of: [defineArrayMember({type: 'string'})],
      validation: (Rule) => Rule.required().min(1).max(5),
    }),
    defineField({
      name: 'rows',
      title: 'Rows',
      type: 'array',
      of: [
        defineArrayMember({
          name: 'policyTableRow',
          title: 'Row',
          type: 'object',
          fields: [
            defineField({
              name: 'cells',
              title: 'Cells',
              type: 'array',
              description: 'One cell per column heading, in the same order.',
              of: [
                defineArrayMember({
                  name: 'policyTableCell',
                  title: 'Cell',
                  type: 'object',
                  fields: [
                    defineField({
                      name: 'text',
                      title: 'Text',
                      type: 'array',
                      of: [
                        defineArrayMember({
                          type: 'block',
                          styles: [{title: 'Normal', value: 'normal'}],
                          lists: [],
                          marks: {decorators: [], annotations: [linkAnnotation]},
                        }),
                      ],
                    }),
                  ],
                  preview: {
                    select: {text: 'text'},
                    prepare({text}) {
                      const plain = (text ?? [])
                        .map((block: {children?: {text?: string}[]}) =>
                          (block.children ?? []).map((child) => child.text).join(''),
                        )
                        .join(' ')
                      return {title: plain || 'Empty cell'}
                    },
                  },
                }),
              ],
            }),
          ],
          preview: {
            select: {first: 'cells.0.text.0.children.0.text', second: 'cells.1.text.0.children.0.text'},
            prepare({first, second}) {
              return {title: first || 'Row', subtitle: second}
            },
          },
        }),
      ],
    }),
  ],
  preview: {
    select: {headers: 'headers', rows: 'rows'},
    prepare({headers, rows}) {
      return {title: `Table — ${(headers ?? []).join(' · ')}`, subtitle: `${rows?.length ?? 0} rows`}
    },
  },
})

/**
 * A long-form policy, such as the Privacy Policy: a title, an effective date
 * and the text with headings, lists, links and tables, in a readable column.
 */
export const policyTextType = defineType({
  name: 'policyText',
  title: 'Policy Text',
  type: 'object',
  description:
    'Long-form text such as the Privacy Policy, on cream in a readable column. Use Heading 2 for each section.',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'The heading at the top, such as “Privacy Policy”.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'effectiveDate',
      title: 'Effective date',
      type: 'date',
      description: 'Shown under the title as “Effective date: October 23, 2026”. Update it when the policy changes.',
      options: {dateFormat: 'MMMM D, YYYY'},
    }),
    defineField({
      name: 'body',
      title: 'Text',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'block',
          styles: [
            {title: 'Normal', value: 'normal'},
            {title: 'Heading 2', value: 'h2'},
            {title: 'Heading 3', value: 'h3'},
          ],
          lists: [
            {title: 'Bullet', value: 'bullet'},
            {title: 'Numbered', value: 'number'},
          ],
          marks: {
            decorators: [
              {title: 'Bold', value: 'strong'},
              {title: 'Italic', value: 'em'},
            ],
            annotations: [linkAnnotation],
          },
        }),
        defineArrayMember({type: 'policyTable'}),
      ],
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {title: 'title', date: 'effectiveDate'},
    prepare({title, date}) {
      return {title: `Policy Text — ${title ?? ''}`, subtitle: date ? `Effective ${date}` : undefined}
    },
  },
})
