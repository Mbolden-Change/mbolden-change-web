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
    defineField({
      name: 'invite',
      title: 'Invitation pop-up',
      type: 'object',
      description:
        'Featured layout only. A button after the groups that opens a pop-up, such as an invitation to join the board. Leave empty to show no button.',
      hidden: ({parent}) => parent?.layout !== 'featured',
      options: {collapsible: true, collapsed: true},
      fields: [
        defineField({
          name: 'buttonLabel',
          title: 'Button label',
          type: 'string',
          validation: (Rule) =>
            Rule.custom((value, context) => {
              const invite = context.parent as Record<string, unknown> | undefined
              const anySet = Object.entries(invite ?? {}).some(
                ([key, field]) => key !== '_type' && key !== 'buttonLabel' && field,
              )
              return anySet && !value?.trim() ? 'Add a button label, or clear the pop-up fields.' : true
            }),
        }),
        defineField({name: 'heading', title: 'Heading', type: 'string'}),
        defineField({
          name: 'body',
          title: 'Body',
          type: 'array',
          description: 'Paragraphs, with bold, italic and links.',
          of: [
            defineArrayMember({
              type: 'block',
              styles: [{title: 'Normal', value: 'normal'}],
              lists: [],
              marks: {
                decorators: [
                  {title: 'Bold', value: 'strong'},
                  {title: 'Italic', value: 'em'},
                ],
              },
            }),
          ],
        }),
        defineField({
          name: 'closingLine',
          title: 'Closing line',
          type: 'array',
          description: 'Shown above the email address, such as “Ready to take action? Introduce yourself to Minh.”',
          of: [
            defineArrayMember({
              type: 'block',
              styles: [{title: 'Normal', value: 'normal'}],
              lists: [],
              marks: {
                decorators: [
                  {title: 'Bold', value: 'strong'},
                  {title: 'Italic', value: 'em'},
                ],
                annotations: [],
              },
            }),
          ],
        }),
        defineField({
          name: 'email',
          title: 'Email address',
          type: 'string',
          description: 'Shown as text and as an email link, with a Copy button.',
          validation: (Rule) => Rule.email().error('Enter a valid email address.'),
        }),
        defineField({
          name: 'emailSubject',
          title: 'Email subject',
          type: 'string',
          description: 'Optional. When set, pre-fills the subject of the email link.',
        }),
        defineField({
          name: 'sectionId',
          title: 'Section ID',
          type: 'string',
          description:
            'Optional. Lowercase words separated by hyphens, such as shape-the-future. The address /about#shape-the-future opens the pop-up, and so does any link to that section.',
          validation: (Rule) =>
            Rule.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).error('Use lowercase letters, numbers, and hyphens.'),
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
