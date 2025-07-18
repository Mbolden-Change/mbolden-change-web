import {defineField, defineType} from 'sanity'

export const optionalLinkType = defineType({
  name: 'optionalLink',
  title: 'Optional External Link',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      description: 'Must have title to add link'
    }),
    defineField({
      name: 'url',
      type: 'url',
      title: 'External URL',
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const parent = context.parent as any
          if (value && !parent?.title) {
            return 'Must have title to add URL'
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
      initialValue: '_blank',
    }),
  ],
})
