import {defineField, defineType} from 'sanity'

export const pageType = defineType({
  name: 'page',
  title: 'Page',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'The page name in Studio and the browser tab.',
      validation: (Rule) => Rule.required().min(1).max(100),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      description:
        "The address of the page, usually generated from the title. What we're tackling uses what-were-tackling.",
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
      description:
        'For search results and link previews. Leave empty to use the site description.',
      validation: (Rule) => Rule.max(200),
    }),
    defineField({
      name: 'content',
      title: 'Content',
      type: 'pageBuilder',
      validation: (Rule) =>
        Rule.custom((value) => {
          const sections = (value ?? []) as Array<{_type?: string; sectionId?: string}>
          const ids = sections
            .filter((block) => block._type === 'textMedia' && block.sectionId)
            .map((block) => block.sectionId)
          return new Set(ids).size === ids.length
            ? true
            : 'Section IDs must be unique on this page.'
        }),
      description: 'The blocks on the page, in the order they appear.',
    }),
  ],
})
