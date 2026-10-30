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
      name: 'candidSeal',
      title: 'Candid Seal of Transparency',
      type: 'object',
      description:
        'Shown in the footer next to the Charity Navigator badge. The seal image comes live from Candid, so a new year’s seal appears on its own. Turn it off to hide it.',
      options: {collapsible: true, collapsed: false},
      fields: [
        defineField({
          name: 'enabled',
          title: 'Show the seal',
          type: 'boolean',
          initialValue: true,
        }),
        defineField({
          name: 'url',
          title: 'Link',
          type: 'url',
          description: 'Our Candid profile, including the pkId Candid uses to count clicks. Opens in a new tab.',
          validation: (Rule) => Rule.uri({scheme: ['https']}),
        }),
        defineField({
          name: 'sealSrc',
          title: 'Seal image address',
          type: 'url',
          description: 'The image address from Candid’s Dynamic Seal widget code (widgets.guidestar.org …/svg).',
          validation: (Rule) => Rule.uri({scheme: ['https']}),
        }),
        defineField({
          name: 'alt',
          title: 'Alt text',
          type: 'string',
          initialValue: 'Candid Platinum Seal of Transparency',
          description: 'For example “Candid Platinum Seal of Transparency”.',
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
