import {defineField} from 'sanity'

/**
 * Words people search for that the content itself doesn't use, such as
 * "SIJS" for the Gateway Fund. Read only by site search: never shown on the
 * site and never sent to search engines.
 */
export const searchKeywordsField = (options: {hidden?: Parameters<typeof defineField>[0]['hidden']} = {}) =>
  defineField({
    name: 'searchKeywords',
    title: 'Search keywords (not shown on the site)',
    type: 'array',
    of: [{type: 'string'}],
    options: {layout: 'tags'},
    description:
      'Optional. Words or short phrases people might type into site search to find this, when the text itself doesn’t use them. Site search reads them. Visitors never see them.',
    validation: (Rule) => Rule.unique().max(20),
    ...options,
  })
