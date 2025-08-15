import {defineField, defineType} from 'sanity'

export const cardType = defineType({
  name: 'card',
  title: 'Card',
  type: 'object',
  fields: [
    defineField({
      name: 'titleLine1',
      title: 'Title Line 1',
      type: 'string',
      description: 'Add first line of card title here.',
    }),
    defineField({
      name: 'titleLine2',
      title: 'Title Line 2',
      type: 'string',
      description: 'Add card title here.',
    }),
    defineField({
      name: 'text',
      title: 'Text',
      type: 'text',
      description: 'Add card text here.',
    }),
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      description: 'Optional image to add to the card.',
      fields: [{title: 'Alt Text', name: 'alt', type: 'string'}],
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'link',
      title: 'Card Link (Optional)',
      type: 'internalOrExternalLink',
      description: 'Put link text here. Entire card will be clickable, with link',
    }),
  ],
  preview: {
    select: { title: 'title', media: 'image'},
    prepare({ title, media}) {
        return {
        title: title ? `Card — ${title}` : 'Card',
        media
        };
    }
  }
})
