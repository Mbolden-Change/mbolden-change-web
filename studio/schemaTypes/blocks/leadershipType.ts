import {defineField, defineType} from 'sanity'

export const leadershipType = defineType({
  name: 'leadership',
  title: 'Leadership',
  type: 'object',
  description:
    'A set of horizontal people cards — name, bio, and an optional headshot and link. Use for leadership or team sections; can also be added inside a tab.',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'Optional section heading above the cards.',
    }),
    defineField({
      name: 'people',
      title: 'People',
      type: 'array',
      of: [{type: 'person'}],
      validation: (Rule) => Rule.required().min(1).error('Add at least one person.'),
    }),
  ],
  preview: {
    select: {title: 'title', people: 'people'},
    prepare({title, people}) {
      const count = people?.length ?? 0
      return {
        title: title ? `Leadership — ${title}` : 'Leadership',
        subtitle: count ? `${count} ${count === 1 ? 'person' : 'people'}` : 'No people',
      }
    },
  },
})
