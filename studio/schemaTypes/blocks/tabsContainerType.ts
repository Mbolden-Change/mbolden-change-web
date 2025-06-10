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
        description: 'Add a tab page',
        of: [{ type: 'tab' }],
        }),
        defineField({
        name: 'defaultTabIndex',
        title: 'Default Selected Tab Index',
        description: 'The index of the tab that should be open by default (e.g. 0 for the first tab).',
        type: 'number',
        initialValue: 0,
        validation: Rule => Rule.min(0),
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
