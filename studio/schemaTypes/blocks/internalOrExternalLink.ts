import SectionAnchorInput from '../../components/SectionAnchorInput'
import LinkDestinationInput from '../../components/LinkDestinationInput'
import {defineField, defineType} from 'sanity'

export const internalOrExternalLinkType = defineType({
  name: 'internalOrExternalLink',
  type: 'object',
  components: {input: LinkDestinationInput},
  validation: (Rule) =>
    Rule.custom((value) => {
      if (!value) return true
      const link = value as {
        title?: string
        anchor?: string
        isExternalLink?: boolean
        url?: string
        reference?: {_ref?: string}
      }
      if (!(link.title?.trim() || link.anchor || link.url || link.reference?._ref)) return true
      if (!link.title?.trim()) return 'Add a label for this link.'
      if (typeof link.anchor === 'string')
        return link.anchor.trim() ? true : 'Choose a section on this page.'
      if (link.isExternalLink) return link.url ? true : 'Add an external URL or a section anchor.'
      return link.reference?._ref ? true : 'Choose a page or add a section anchor.'
    }),
  fields: [
    defineField({
      name: 'title',
      title: 'Label',
      type: 'string',
      description:
        'The words people click. On a resource row or tool card this can match the title, because the whole row or card is the link.',
    }),
    defineField({
      name: 'anchor',
      title: 'Section on this page',
      components: {input: SectionAnchorInput},
      hidden: ({parent}) => typeof parent?.anchor !== 'string',
      type: 'string',
      description: 'Choose a Text & Media section with a Section ID.',
      validation: (Rule) =>
        Rule.custom((value, context) => {
          if (!value) return true
          const content = context.document?.content as
            | Array<{_type?: string; sectionId?: string}>
            | undefined
          return content?.some((block) => block._type === 'textMedia' && block.sectionId === value)
            ? true
            : 'This section no longer exists. Choose another destination.'
        }),
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
      hidden: true,
    }),
    defineField({
      name: 'url',
      title: 'URL',
      type: 'url',
      description: 'The address. Required when this is an external link.',
      hidden: ({parent}) => typeof parent?.anchor === 'string' || parent?.isExternalLink !== true,
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const parent = context.parent as any
          if (parent && parent.isExternalLink === true && !parent.anchor && !value) {
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
      hidden: ({parent}) => typeof parent?.anchor === 'string' || parent?.isExternalLink !== true,
    }),
    defineField({
      name: 'reference',
      title: 'Page',
      type: 'reference',
      description:
        'The page, statement, case study, report or PDF file this link opens. PDF files open in a new tab.',
      to: [
        {type: 'page'},
        {type: 'statement'},
        {type: 'caseStudy'},
        {type: 'report'},
        {type: 'pdfDocument'},
      ],
      hidden: ({parent}) => typeof parent?.anchor === 'string' || parent?.isExternalLink === true,
    }),
  ],
})
