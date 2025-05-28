import {defineField, defineType} from 'sanity'

export const cardType = defineType({
  name: 'card',
  title: 'Card',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
    }),
    defineField({
      name: 'text',
      title: 'Text',
      type: 'text',
    }),
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      fields: [{title: 'Alt Text', name: 'alt', type: 'string'}],
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'link',
      title: 'Card Link (Optional)',
      type: 'internalOrExternalLink',
      description: 'Entire card will be clickable, with link',
    }),
  ],
})
