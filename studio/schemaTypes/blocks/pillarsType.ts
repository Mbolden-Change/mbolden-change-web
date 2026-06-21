import {defineField, defineType} from 'sanity'

export const pillarsType = defineType({
  name: 'pillars',
  title: 'Pillars',
  type: 'object',
  fields: [
    defineField({
      name: 'eyebrow',
      title: 'Eyebrow',
      type: 'string',
      description: 'Optional label above the section title.',
    }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'array',
      of: [{type: 'block'}],
    }),
    defineField({
      name: 'pillars',
      title: 'Pillars',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'pillarCard'}]}],
      validation: (Rule) => Rule.required().min(1),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'eyebrow',
    },
    prepare({title, subtitle}) {
      return {
        title: title ? `Pillars — ${title}` : 'Pillars',
        subtitle,
      }
    },
  },
})
