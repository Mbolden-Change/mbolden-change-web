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
      name: 'openActionNetworkModal',
      title: 'Open Action Network Modal',
      type: 'boolean',
      initialValue: false,
      description: 'Toggle ON to open the Action Network signup modal. Toggle OFF to use a custom link.',
      validation: (Rule) => 
        Rule.custom((value, context) => {
          const buttonText = (context.document as any)?.newsletterButtonText;
          const button = (context.document as any)?.newsletterButton;
          
          if (value === false && buttonText) {
            return 'Please clear the Newsletter Button Text field before disabling the Action Network Modal toggle.';
          }
          if (value === true && button?.url) {
            return 'Please clear the Newsletter Button Link URL before enabling the Action Network Modal toggle.';
          }
          return true;
        }),
    }),
    defineField({
      name: 'newsletterButtonText',
      title: 'Newsletter Button Text',
      type: 'string',
      initialValue: 'Sign up for our Newsletter',
      description: 'Text displayed on the newsletter button.',
      hidden: ({document}) => document?.openActionNetworkModal !== true,
      validation: (Rule) => 
        Rule.custom((value, context) => {
          const openModal = (context.document as any)?.openActionNetworkModal;
          if (openModal === true && !value) {
            return 'Button text is required when Action Network Modal is enabled.';
          }
          return true;
        }),
    }),
    defineField({
      name: 'newsletterButton',
      title: 'Newsletter Button Link',
      type: 'internalOrExternalLink',
      description: 'Only used when "Open Action Network Modal" is toggled OFF.',
      hidden: ({document}) => document?.openActionNetworkModal === true,
      validation: (Rule) => 
        Rule.custom((value, context) => {
          const openModal = (context.document as any)?.openActionNetworkModal;
          if (openModal === false && !value) {
            return 'Newsletter button link is required when Action Network Modal is disabled.';
          }
          return true;
        }),
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
