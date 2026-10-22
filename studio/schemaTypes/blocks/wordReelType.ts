import {defineArrayMember, defineField, defineType} from 'sanity'

const COLORS = [
  {title: 'Teal', value: 'teal'},
  {title: 'Yellow', value: 'yellow'},
  {title: 'Fuchsia', value: 'fuchsia'},
  {title: 'Yellow, stacked (larger, with fuchsia and teal behind)', value: 'stacked'},
]

export const wordReelWordType = defineType({
  name: 'wordReelWord',
  title: 'Word',
  type: 'object',
  fields: [
    defineField({
      name: 'word',
      title: 'Word',
      type: 'string',
      description: 'One word, such as “Audacious”. A period is added after it.',
      validation: (Rule) => Rule.required().max(20),
    }),
    defineField({
      name: 'color',
      title: 'Block color',
      type: 'string',
      description: 'The color block behind the word. Use “stacked” for the final word.',
      options: {list: COLORS, layout: 'radio'},
      initialValue: 'teal',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'opening',
      title: 'Opening phrase',
      type: 'string',
      description: 'Shown in bold at the start of the line, such as “We’re fearless.”',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'line',
      title: 'Line',
      type: 'text',
      rows: 2,
      description: 'The rest of the line under the word.',
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {title: 'word', subtitle: 'opening'},
  },
})

/**
 * “We are …” with one large word at a time. The words cycle on their own,
 * holding the last one longer; the tabs jump to any word.
 */
export const wordReelType = defineType({
  name: 'wordReel',
  title: 'Word Reel',
  type: 'object',
  description:
    'One large word at a time on a slanted color block, with its line underneath and tabs for every word. Cycles continuously, holding the last word a little longer; a tab shows its word for 8 seconds, then cycling resumes. Pauses while off-screen.',
  fields: [
    defineField({name: 'eyebrow', title: 'Eyebrow', type: 'string', description: 'For example “About Us · Who We Are”.'}),
    defineField({
      name: 'lead',
      title: 'Lead-in',
      type: 'string',
      initialValue: 'We are',
      description: 'Shown above the words.',
    }),
    defineField({
      name: 'words',
      title: 'Words',
      type: 'array',
      description: 'In order. The last word is held longer and is what shows with reduced motion.',
      of: [defineArrayMember({type: 'wordReelWord'})],
      validation: (Rule) => Rule.required().min(2).max(8),
    }),
    defineField({
      name: 'stepSeconds',
      title: 'Seconds per word',
      type: 'number',
      description: 'How long each word shows. Leave empty for 2.5.',
      validation: (Rule) => Rule.min(1).max(15),
    }),
    defineField({
      name: 'lastHoldSeconds',
      title: 'Seconds on the last word',
      type: 'number',
      description: 'How long the last word shows before it loops back to the first. Leave empty for 4.',
      validation: (Rule) => Rule.min(1).max(30),
    }),
  ],
  preview: {
    select: {lead: 'lead', words: 'words'},
    prepare({lead, words}) {
      const list = (words ?? []).map((w: {word?: string}) => w.word).filter(Boolean)
      return {title: `Word Reel — ${lead ?? 'We are'}`, subtitle: list.join(' · ')}
    },
  },
})
