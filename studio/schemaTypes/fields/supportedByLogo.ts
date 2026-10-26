import {defineField, type ConditionalProperty} from 'sanity'

/**
 * Optional funder logo and link for a "Supported by" line. Shared by the
 * blocks that have one; place right after the block's supportedBy field.
 */
export const supportedByLogoFields = ({hidden}: {hidden?: ConditionalProperty} = {}) => [
  defineField({
    name: 'supportedByLogo',
    title: 'Supported by logo',
    type: 'image',
    description:
      'Optional funder logo shown with the Supported by line. Use the funder’s full-color horizontal PNG with a transparent background.',
    fields: [
      defineField({
        name: 'alt',
        title: 'Alt text',
        type: 'string',
        description: 'The funder’s name, such as “San Francisco Foundation”. Required when a logo is set.',
        validation: (Rule) =>
          Rule.custom((value, context) => {
            const parent = context.parent as {asset?: unknown} | undefined
            return !parent?.asset || value?.trim() ? true : 'Required when a logo is set.'
          }),
      }),
    ],
    hidden,
  }),
  defineField({
    name: 'supportedByLink',
    title: 'Supported by link',
    type: 'url',
    description: 'The funder’s website. Required when a logo is set; the logo links here.',
    validation: (Rule) => [
      Rule.uri({scheme: ['http', 'https']}),
      Rule.custom((value, context) => {
        const parent = context.parent as {supportedByLogo?: {asset?: unknown}} | undefined
        return !parent?.supportedByLogo?.asset || value ? true : 'Required when a logo is set.'
      }).error(),
    ],
    hidden,
  }),
]
