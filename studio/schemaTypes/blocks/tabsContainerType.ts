import { defineType, defineField } from 'sanity';

export const tabsContainerType = defineType({
    name: 'tabsContainer',
    title: 'Tabs Container',
    type: 'object',
    fields: [
        defineField({
        name: 'tabs',
        title: 'Tabs',
        type: 'array',
        description: 'You can add up to 5 page tabs',
        of: [{ type: 'tab' }],
        validation: (Rule) => Rule.required().max(5).error('You can only add up to 5 tabs.'),
        }),
        defineField({
        name: 'defaultTabIndex',
        title: 'Default Selected Tab Index',
        description: 'The index of the tab that should be open by default (e.g. 0 for the first tab).',
        type: 'number',
        initialValue: 0,
        validation: Rule => Rule.min(0).max(4),
        }),
    ],
        preview: {
        select: { title: 'title'},
        prepare({ title}) {
            return {
            title: title || 'Tabbed Content',
            };
        }
    }
});
