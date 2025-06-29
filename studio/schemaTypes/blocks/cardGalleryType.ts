import {defineField, defineType} from 'sanity'

export const cardGalleryType = defineType({
  name: 'cardGallery',
  title: 'Card Gallery',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'Optional title above the card gallery.',
    }),
    defineField({
      name: 'text',
      title: 'Text',
      type: 'text',
      description: 'Optional text above the card gallery.',
      rows: 3,
    }),
    defineField({
      name: 'cards',
      title: 'Cards',
      type: 'array',
      description: 'Add up to 4 cards to this gallery.',
      of: [{type: 'card'}],
      validation: (Rule) => Rule.required().min(1).max(4),
    }),
  ],
  preview: {
    select: { title: 'title'},
    prepare({ title}) {
        return {
        title: `Card Gallery — ${title || 'Card Gallery'}`,
        };
    }
  }
})
