import {defineField, defineType} from 'sanity'

export const internalOrExternalLinkType = defineType({
  name: 'internalOrExternalLink',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      description: 'A button must have a title label.',
    }),
    defineField({
      name: 'isExternalLink',
      type: 'boolean',
      description: 'Toggle on if the button will link to an external URL.',
      initialValue: false,
    }),
    defineField({
      name: 'url',
      type: 'url',
      hidden: ({parent}) => parent?.isExternalLink === false,
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const parent = context.parent as any
          if (parent && parent.isExternalLink === true && !value) {
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
      description: 'Select a reference if the button will link to an internal page.',
      to: [{type: 'page'}, {type: 'statement'}],
      hidden: ({parent}) => parent?.isExternalLink === true,
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const parent = context.parent as any
          if (parent && parent.isExternalLink === false && !value) {
            return 'Reference is required for internal links'
          }
          return true
        }),
    }),
  ],
})
