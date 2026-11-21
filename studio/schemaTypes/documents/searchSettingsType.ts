import {defineArrayMember, defineField, defineType} from 'sanity'
import {SearchIcon} from '@sanity/icons'

/** Pages built in code, which have no document of their own to hold keywords. */
export const CODE_PAGES = [
  {title: 'Safety Net Simulator (/simulator)', value: '/simulator'},
  {title: 'Request for Funds (/legal-providers)', value: '/legal-providers'},
  {title: 'Building the Road to Systemic Equity (/building-the-road)', value: '/building-the-road'},
]

/** What the search panel suggests before and after someone types. */
export const searchSettingsType = defineType({
  name: 'searchSettings',
  title: 'Search settings',
  type: 'document',
  icon: SearchIcon,
  fields: [
    defineField({
      name: 'tryWords',
      title: '“Try” words',
      type: 'array',
      of: [{type: 'string', validation: (Rule) => Rule.max(30)}],
      description:
        'Up to 6 short words shown after “Try:” under the search box. Choosing one searches for it.',
      validation: (Rule) => Rule.max(6).unique(),
    }),
    defineField({
      name: 'popularLinks',
      title: 'Popular links',
      type: 'array',
      of: [defineArrayMember({type: 'internalOrExternalLink'})],
      description:
        'Up to 6 links listed under “Popular” before someone types and when a search finds nothing.',
      validation: (Rule) => Rule.max(6),
    }),
    defineField({
      name: 'codePageKeywords',
      title: 'Search keywords for pages built in code',
      type: 'array',
      description:
        'The Simulator, the Request for Funds form and Building the Road have no page in Studio, so their search keywords live here. Visitors never see them.',
      of: [
        defineArrayMember({
          name: 'codePage',
          type: 'object',
          fields: [
            defineField({
              name: 'path',
              title: 'Page',
              type: 'string',
              options: {list: CODE_PAGES},
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'searchKeywords',
              title: 'Search keywords (not shown on the site)',
              type: 'array',
              of: [{type: 'string'}],
              options: {layout: 'tags'},
              validation: (Rule) => Rule.unique().max(20),
            }),
          ],
          preview: {
            select: {title: 'path', words: 'searchKeywords'},
            prepare: ({title, words}) => ({title, subtitle: (words ?? []).join(', ')}),
          },
        }),
      ],
      validation: (Rule) =>
        Rule.custom((value) => {
          const paths = ((value ?? []) as Array<{path?: string}>).map((item) => item.path)
          return new Set(paths).size === paths.length ? true : 'List each page once.'
        }),
    }),
  ],
  preview: {
    prepare() {
      return {title: 'Search settings'}
    },
  },
})
