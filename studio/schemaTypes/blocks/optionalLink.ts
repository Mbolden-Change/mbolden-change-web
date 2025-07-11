import {defineField, defineType} from 'sanity'

export const optionalLinkType = defineType({
  name: 'optionalLink',
  title: 'Optional Link',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      description: 'Must have title to add link'
    }),
    defineField({
      name: 'isExternalLink',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'url',
      type: 'url',
      hidden: ({parent}) => parent?.isExternalLink === false,
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const parent = context.parent as any
          if (parent && parent.isExternalLink === true && parent.title && !value) {
            return 'Url is required for external links'
          }
          return true
        }),
    }),
    defineField({
      name: 'target',
      type: 'string',
      options: {
        list: ['_self', '_blank'],
      },
      description: 'Select click behavior. "Self" opens the link on the same page, while "Blank" opens the link in a new page.',
      initialValue: '_self',
      hidden: ({parent}) => parent?.isExternalLink === false,
    }),
    defineField({
      name: 'reference',
      type: 'reference',
      to: [{type: 'page'}, {type: 'statement'}, {type: 'caseStudy'}],
      hidden: ({parent}) => parent?.isExternalLink === true,
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const parent = context.parent as any
          if (parent && parent.isExternalLink === false && parent.title && !value) {
            return 'Reference is required for internal links'
          }
          return true
        }),
    }),
  ],
})
