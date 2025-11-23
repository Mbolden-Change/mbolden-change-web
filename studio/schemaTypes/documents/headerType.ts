import {defineField, defineType} from 'sanity'

export const headerType = defineType({
  name: 'header',
  title: 'Header',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      initialValue: 'Header',
      hidden: true,
    }),
    defineField({
      name: 'logo',
      title: 'Logo',
      type: 'image',
      options: {
        collapsed: true,
        collapsible: true,
      },
      fields: [
        {
          title: 'Alt Text',
          name: 'alt',
          type: 'string',
        },
      ],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'navigationLinks',
      title: 'Navigation Links',
      type: 'array',
      of: [{type: 'internalOrExternalLink'}],
    }),
    defineField({
      name: 'donateCTA',
      title: 'Donate CTA',
      type: 'object',
      fields: [
        defineField({
          name: 'buttonLink',
          title: 'Button Link',
          type: 'internalOrExternalLink',
        }),
      ],
    }),
  ],
})
