import {defineField, defineType} from 'sanity'

export const personType = defineType({
  name: 'person',
  title: 'Person',
  type: 'object',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (Rule) => Rule.required().error('Name is required.'),
    }),
    defineField({
      name: 'role',
      title: 'Role / Title',
      type: 'string',
      description: 'Optional job title or role.',
    }),
    defineField({
      name: 'bio',
      title: 'Bio',
      type: 'text',
      rows: 4,
    }),
    defineField({
      name: 'image',
      title: 'Headshot',
      type: 'image',
      description: 'Optional. Leave empty for a text-only card — no placeholder is shown.',
      options: {hotspot: true},
      fields: [{name: 'alt', title: 'Alt text', type: 'string'}],
    }),
    defineField({
      name: 'link',
      title: 'Link URL',
      type: 'url',
      description: 'Optional — e.g. a LinkedIn profile.',
    }),
    defineField({
      name: 'linkLabel',
      title: 'Link Label',
      type: 'string',
      description: 'Optional. Defaults to “Connect on LinkedIn”.',
    }),
  ],
  preview: {
    select: {title: 'name', subtitle: 'role', media: 'image'},
    prepare({title, subtitle, media}) {
      return {title: title || 'Person', subtitle, media}
    },
  },
})
