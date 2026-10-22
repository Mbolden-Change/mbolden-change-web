import {BoltIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

const layerImage = (name: string, title: string, description: string) =>
  defineField({
    name,
    title,
    type: 'image',
    description,
    validation: (Rule) => Rule.required().error(`${title} is required.`),
  })

export const boltStepType = defineType({
  name: 'boltStep',
  title: 'Step',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required().error('Step title is required.'),
    }),
    defineField({
      name: 'body',
      title: 'Text',
      type: 'text',
      rows: 3,
      description: 'One or two short sentences.',
      validation: (Rule) => Rule.required().error('Step text is required.'),
    }),
    defineField({
      name: 'color',
      title: 'Color',
      type: 'string',
      description: 'Colors this step’s part of the bolt, its bar and its sound waves.',
      options: {
        list: [
          {title: 'Teal', value: 'teal'},
          {title: 'Yellow', value: 'yellow'},
          {title: 'Fuchsia', value: 'fuchsia'},
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'motion',
      title: 'Illustration motion',
      type: 'string',
      description:
        'The animation for this step’s two image layers. Each is tuned to its silhouettes: Listen (speaker behind, listener in front: the listener leans in and nods, ripples come from the speaker), Build (tree behind, people in front: the tree grows from a sprout and sways), Advocate (body behind, arm with megaphone in front: the arm rises and sound waves pulse).',
      options: {
        list: [
          {title: 'Listen', value: 'listen'},
          {title: 'Build', value: 'build'},
          {title: 'Advocate', value: 'advocate'},
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
    }),
    layerImage('backLayer', 'Back layer', 'Transparent PNG. Speaker, tree or body, depending on the motion.'),
    layerImage(
      'frontLayer',
      'Front layer',
      'Transparent PNG, the same size as the back layer. Listener, people or arm with megaphone.',
    ),
    defineField({
      name: 'alt',
      title: 'Illustration description',
      type: 'string',
      description: 'Describes the two layers together for screen readers.',
      validation: (Rule) => Rule.required().error('Describe the illustration for screen readers.'),
    }),
  ],
  preview: {
    select: {title: 'title', color: 'color', media: 'frontLayer'},
    prepare({title, color, media}) {
      return {title, subtitle: color, media}
    },
  },
})

export const boltStepsType = defineType({
  name: 'boltSteps',
  title: 'Bolt Steps',
  type: 'object',
  icon: BoltIcon,
  description:
    'Three steps with animated silhouettes, along a rising three-color bolt or as three cards. Plays once when it scrolls into view.',
  fields: [
    defineField({
      name: 'layout',
      title: 'Layout',
      type: 'string',
      description:
        'Bolt sets the steps along a rising bolt (What We’re Tackling); on phones the bolt runs down the left edge. Cards sets three white cards on cream (homepage).',
      options: {
        list: [
          {title: 'Bolt', value: 'bolt'},
          {title: 'Cards', value: 'cards'},
        ],
        layout: 'radio',
      },
      initialValue: 'bolt',
    }),
    defineField({name: 'eyebrow', title: 'Eyebrow', type: 'string', description: 'For example “Our Model”.'}),
    defineField({
      name: 'title',
      title: 'Heading',
      type: 'string',
      validation: (Rule) => Rule.required().error('Heading is required.'),
    }),
    defineField({name: 'intro', title: 'Introduction', type: 'text', rows: 3}),
    defineField({
      name: 'steps',
      title: 'Steps',
      type: 'array',
      description: 'Exactly three, in order from left to right.',
      of: [defineArrayMember({type: 'boltStep'})],
      validation: (Rule) => Rule.required().length(3).error('Add exactly three steps.'),
    }),
  ],
  preview: {
    select: {title: 'title'},
    prepare({title}) {
      return {title: title ? `Bolt Steps — ${title}` : 'Bolt Steps'}
    },
  },
})
