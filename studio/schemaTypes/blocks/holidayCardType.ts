import {defineField, defineType} from 'sanity'

export const holidayCardType = defineType({
  name: 'holidayCard',
  title: 'Holiday Card',
  type: 'object',
  fields: [
    defineField({
      name: 'text',
      title: 'Body',
      type: 'array',
      of: [{type: 'block'}, {type: 'image'}],
    }),
    defineField({
      name: 'image',
      title: 'Main Image',
      type: 'image',
      fields: [{title: 'Alt Text', name: 'alt', type: 'string'}],
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'imageText',
      title: 'Image Text',
      type: 'array',
      of: [{type: 'block'}, {type: 'image'}],
    }),
    defineField({
      name: 'link',
      title: 'Card Link',
      type: 'internalOrExternalLink',
    }),
  ],
  preview: {
    select: {
      image: 'image',
      linkTitle: 'link.title',
    },
    prepare({image, linkTitle}) {
      return {
        title: 'Holiday Card',
        subtitle: linkTitle ? `Link: ${linkTitle}` : 'Seasonal content block',
        media: image,
      }
    },
  },
})
