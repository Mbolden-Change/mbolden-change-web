import {defineArrayMember, defineField, defineType} from 'sanity'

export const leadershipType = defineType({
  name: 'leadership',
  title: 'Leadership',
  type: 'object',
  description:
    'A set of horizontal people cards — name, bio, and an optional headshot and link. Use for leadership or team sections; can also be added inside a tab.',
  fields: [
    defineField({
      name: 'layout',
      title: 'Layout',
      type: 'string',
      description:
        'Cards: a row of people cards. Featured: each person in People gets a large card with their headshot, role, name, bio and link, followed by the groups below (About page).',
      options: {
        list: [
          {title: 'Cards', value: 'cards'},
          {title: 'Featured', value: 'featured'},
        ],
        layout: 'radio',
      },
      initialValue: 'cards',
    }),
    defineField({
      name: 'eyebrow',
      title: 'Eyebrow',
      type: 'string',
      description: 'Featured layout only, such as “The People Behind the Work”.',
      hidden: ({parent}) => parent?.layout !== 'featured',
    }),
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
      description:
        'One card per person, in the order they should appear. A photo is optional. Name, role, and bio are enough.',
      of: [{type: 'person'}],
      validation: (Rule) => Rule.required().min(1).error('Add at least one person.'),
    }),
    defineField({
      name: 'groups',
      title: 'Groups',
      type: 'array',
      description:
        'Featured layout only. Lists such as Board of Directors and Advisory Members, each with a name, role and link per person. Add, remove or reorder people as membership changes.',
      hidden: ({parent}) => parent?.layout !== 'featured',
      of: [
        defineArrayMember({
          name: 'leadershipGroup',
          title: 'Group',
          type: 'object',
          fields: [
            defineField({name: 'title', title: 'Title', type: 'string', validation: (Rule) => Rule.required()}),
            defineField({name: 'people', title: 'People', type: 'array', of: [{type: 'person'}]}),
          ],
          preview: {
            select: {title: 'title', people: 'people'},
            prepare({title, people}) {
              return {title, subtitle: `${people?.length ?? 0} people`}
            },
          },
        }),
      ],
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
