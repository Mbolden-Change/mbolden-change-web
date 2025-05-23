import {defineField, defineType} from 'sanity'

export const footertype = defineField({
  name: 'footer',
  title: 'Footer',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Footer Title',
      type: 'string',
    }),
    defineField({
      name: 'primaryLogo',
      title: 'Primary Logo',
      type: 'image',
      options: {
        hotspot: true,
      },
      fields: [
        {
          title: 'Alt Text',
          name: 'alt',
          type: 'string',
        },
      ],
    }),
    defineField({
      name: 'columnCategories',
      title: 'Column Categories',
      type: 'array',
      of: [
        defineField({
          name: 'footerColumn',
          title: 'Footer Column',
          type: 'object',
          fields: [
            defineField({
              name: 'title',
              title: 'Category Header',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'links',
              title: 'Subcategories',
              type: 'array',
              of: [
                defineField({
                  name: 'link',
                  title: 'Link',
                  type: 'internalOrExternalLink',
                }),
              ],
            }),
          ],
        }),
      ],
    }),
    defineField({
      name: 'socialLinks',
      title: 'Social Links',
      type: 'array',
      of: [
        defineField({
          name: 'socialLink',
          title: 'Social Link',
          type: 'object',
          fields: [
            defineField({
              name: 'platform',
              title: 'Platform',
              type: 'string',
              options: {
                list: [
                  {title: 'Facebook', value: 'facebook'},
                  {title: 'Instagram', value: 'instagram'},
                  {title: 'X (formerly Twitter)', value: 'x'},
                  {title: 'LinkedIn', value: 'linkedin'},
                  {title: 'Youtube', value: 'youtube'},
                  {title: 'BlueSky', value: 'bluesky'},
                ],
                layout: 'dropdown',
              },
            }),
            defineField({
              name: 'url',
              title: 'URL',
              type: 'url',
              validation: (Rule) => Rule.required(),
            }),
          ],
        }),
      ],
    }),
    defineField({
      name: 'organizationInfo',
      title: 'Organization Info',
      type: 'object',
      fields: [
        defineField({
          name: 'address',
          title: 'Address',
          type: 'text',
          rows: 2,
          description: 'Enter the address in two lines',
        }),
        defineField({
          name: 'contact',
          title: 'Contact Info',
          type: 'text',
          rows: 2,
          description: 'List each contact item (phone, email) on a separate line',
        }),
        defineField({
          name: 'nonProfitDisclaimer',
          title: 'Non-Profit Disclaimer',
          type: 'text',
          rows: 2,
          description: 'Provide the 501(c)3 disclaimer and EIN number.',
        }),
      ],
    }),
  ],
})
