import {defineField, defineType} from 'sanity'

export const richText = defineType({
  name: 'richText',
  title: 'Rich Text',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: 'Headline',
      type: 'string',
    }),
    defineField({
      name: 'text',
      title: 'Text',
      type: 'array',
      of: [{type: 'block'}, {type: 'image'}],
    }),
  ],
  preview: {
    select: { title: 'title'},
    prepare({ title}) {
        return {
        title: title ? `Rich Text — ${title}` : 'Rich Text',
        };
    }
  }
})
