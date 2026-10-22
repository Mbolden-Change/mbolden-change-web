import {DocumentPdfIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

export const pdfDocumentType = defineType({
  name: 'pdfDocument',
  title: 'PDF File',
  type: 'document',
  icon: DocumentPdfIcon,
  description:
    'A PDF served from the site at /reports/address-name.pdf. Link to it from a pilot pop-up button or a resource row.',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'The name editors see in Studio, such as “TCPP Alum Rock Partner Report (public)”.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Address name',
      type: 'slug',
      description:
        'The file’s address on the site: /reports/this-name.pdf. Lowercase words with hyphens. Changing it breaks links people already have.',
      options: {source: 'title', maxLength: 80},
      validation: (Rule) =>
        Rule.required().custom((value) =>
          !value?.current || /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value.current)
            ? true
            : 'Use lowercase letters, numbers and hyphens.',
        ),
    }),
    defineField({
      name: 'file',
      title: 'PDF',
      type: 'file',
      description: 'Upload the public version only. Anyone with the address can open it.',
      options: {accept: 'application/pdf'},
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {title: 'title', slug: 'slug.current'},
    prepare({title, slug}) {
      return {title, subtitle: slug ? `/reports/${slug}.pdf` : 'No address yet'}
    },
  },
})
