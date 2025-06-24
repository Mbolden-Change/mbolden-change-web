import { defineType, defineField } from 'sanity';

export const tabType = defineType({
    name: 'tab',
    title: 'Tab',
    type: 'object',
    fields: [
        defineField({
        name: 'label',
        title: 'Tab Label',
        type: 'string',
        description: 'This text appears as the clickable label for the tab in the UI. Keep it short and descriptive.',
        validation: Rule => Rule.required().error('Tab label is required.'),
        }),
        defineField({
        name: 'content',
        title: 'Tab Content',
        type: 'array',
        of: [{ type: 'block'}],
        validation: Rule => Rule.required().error('Tab content is required.'),
    }),
    ],
    preview: {
        select: { title: 'label'},
        prepare({ title}) {
            return {
            title: `Tab — ${title || 'label'}`,
            };
        }
    }
});
