import {defineField, defineType} from 'sanity'

export const internalOrExternalLinkType = defineType({
  name: 'internalOrExternalLink',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: 'Label',
      type: 'string',
      description:
        'The words people click. On a resource row or tool card this can match the title, because the whole row or card is the link.',
    }),
    defineField({
      name: 'isActive',
      type: 'boolean',
      hidden: true,
      initialValue: false,
    }),
    defineField({
      name: 'isExternalLink',
      title: 'External link',
      type: 'boolean',
      description:
        'Turn this on for an address outside the site. Leave it off to choose a page, statement, case study, or report.',
      initialValue: false,
    }),
    defineField({
      name: 'url',
      title: 'URL',
      type: 'url',
      description: 'The address. Required when this is an external link.',
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
      title: 'Open in',
      type: 'string',
      options: {
        list: [
          {title: 'Same tab', value: '_self'},
          {title: 'New tab', value: '_blank'},
        ],
      },
      description: 'Same tab, or a new tab. Used for external links.',
      initialValue: '_self',
      hidden: ({parent}) => parent?.isExternalLink === false,
    }),
    defineField({
      name: 'reference',
      title: 'Page',
      type: 'reference',
      description: 'The page, statement, case study, or report this link opens.',
      to: [{type: 'page'}, {type: 'statement'}, {type: 'caseStudy'}, {type: 'report'}],
      hidden: ({parent}) => parent?.isExternalLink === true,
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const parent = context.parent as any
          if (parent && parent.isActive && parent.isExternalLink === false && !value) {
            return 'Reference is required for internal links'
          }
          return true
        }),
    }),
  ],
})
