import {defineField, defineType} from 'sanity'

/** Site-wide settings that aren't part of the header or footer menus. */
export const siteSettingsType = defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  fields: [
    defineField({
      name: 'charityBadge',
      title: 'Charity Navigator badge',
      type: 'object',
      description:
        'Shown in the footer next to the EIN and in Get in Touch sections that turn it on. Swap the image each year; leave the image empty to hide the badge everywhere.',
      options: {collapsible: true, collapsed: false},
      fields: [
        defineField({
          name: 'image',
          title: 'Badge image',
          type: 'image',
          description: 'Upload the badge exactly as Charity Navigator provides it (PNG). It is shown uncropped.',
        }),
        defineField({
          name: 'alt',
          title: 'Alt text',
          type: 'string',
          description: 'For example “Charity Navigator Four-Star Charity 2026”.',
          validation: (Rule) =>
            Rule.custom((value, context) => {
              const parent = context.parent as {image?: {asset?: unknown}} | undefined
              return parent?.image?.asset && !value ? 'Alt text is required when there is a badge image.' : true
            }),
        }),
        defineField({
          name: 'url',
          title: 'Link',
          type: 'url',
          description: 'Our Charity Navigator profile. Opens in a new tab.',
          validation: (Rule) => Rule.uri({scheme: ['https']}),
        }),
      ],
    }),
    defineField({
      name: 'advancementContact',
      title: 'Advancement contact',
      type: 'object',
      description:
        'Named under funder buttons, such as “Talk with Sue Sutherland, Director of Advancement, at sue@mboldenchange.org.” Funder email buttons go to this address.',
      options: {collapsible: true, collapsed: false},
      fields: [
        defineField({name: 'name', title: 'Name', type: 'string'}),
        defineField({name: 'title', title: 'Job title', type: 'string'}),
        defineField({name: 'email', title: 'Email', type: 'string', validation: (Rule) => Rule.email()}),
      ],
    }),
  ],
  preview: {
    prepare() {
      return {title: 'Site Settings'}
    },
  },
})
