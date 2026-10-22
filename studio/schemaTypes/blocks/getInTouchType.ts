import {defineField, defineType} from 'sanity'

/**
 * Contact band on yellow. The email, phone and mailing address come from the
 * Footer (Organization info), so they stay in one place.
 */
export const getInTouchType = defineType({
  name: 'getInTouch',
  title: 'Get in Touch',
  type: 'object',
  description:
    'Text, a Donate button and a newsletter button, with a card showing the email, phone and mailing address from the Footer’s Organization info.',
  fields: [
    defineField({name: 'eyebrow', title: 'Eyebrow', type: 'string', initialValue: 'Contact'}),
    defineField({name: 'heading', title: 'Heading', type: 'string', validation: (Rule) => Rule.required()}),
    defineField({name: 'text', title: 'Text', type: 'text', rows: 2}),
    defineField({
      name: 'donateLink',
      title: 'Donate button',
      type: 'internalOrExternalLink',
      description: 'The button text is the link title, such as “Donate”.',
    }),
    defineField({
      name: 'newsletterLabel',
      title: 'Newsletter button text',
      type: 'string',
      initialValue: 'Sign up for our newsletter',
      description: 'Opens the same newsletter sign-up as the footer. Leave empty to hide.',
    }),
  ],
  preview: {
    select: {title: 'heading'},
    prepare({title}) {
      return {title: title || 'Get in Touch', subtitle: 'Get in Touch'}
    },
  },
})
