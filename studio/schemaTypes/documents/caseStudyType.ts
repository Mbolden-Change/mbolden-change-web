import {defineType, defineField} from 'sanity'

export const caseStudyType = defineType({
  name: 'caseStudy',
  title: 'Case Study',
  type: 'document',
  fields: [
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      validation: (Rule) => Rule.required().min(5).max(100),
      description: 'The title of the case study',
    }),
    defineField({
      name: 'subheading',
      title: 'Sub Heading',
      type: 'string',
      description: 'The subheading of the case study',
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'heading',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'date',
      title: 'Date',
      type: 'datetime',
      validation: (Rule) => Rule.required(),
      description: 'The date the case study was created or published',
    }),
    defineField({
      name: 'pdfDownload',
      title: 'PDF Download',
      type: 'file',
      options: {
        accept: 'application/pdf',
      },
      description: 'Optional PDF version of the case study for download',
    }),
    defineField({
      name: 'text',
      title: 'Text',
      type: 'array',
      of: [{type: 'block'}, {type: 'image'}],
    }),
  ],
})