import { defineField, defineType } from 'sanity'

export const logoGardenType = defineType({
    name: 'logoGarden',
    title: 'Logo Garden',
    type: 'object',
    fields: [
        defineField({
            name: 'title',
            title: 'Section title',
            type: 'string',
            description: 'Optional title to display above logos',
        }),
        defineField({
            name: 'layout',
            title: 'Layout',
            type: 'string',
            options: {
                list: [
                    { title: 'Single Row', value: 'single' },
                    { title: 'Two Rows', value: 'double' }
                ],
                layout: 'radio'
            },
            initialValue: 'single',
            description: 'Choose between single or double rows'
        }),
        defineField({
            name: 'logos',
            title: 'Partner Logos',
            type: 'array',
            of: [
                {
                    type: 'image',
                    fields: [
                        {
                            name: 'alt',
                            type: 'string',
                            title: 'Alt Text',
                            description: 'Description of logo',
                        },
                        {
                        name: 'link',
                        type: 'internalOrExternalLink',
                        title: 'Logo Link (Optional',
                        description: 'Optional link when clicking logo',
                        }
                    ],
                    options: {
                        hotspot: true,
                    }
                }
            ],
            validation: (Rule) => Rule.required().min(4).error('At least 4 logos required')
        }),
        defineField({
            name: 'secondRowLogos',
            title: 'Second Row Logos (Optional)',
            type: 'array',
            of: [
                {
                    type: 'image',
                    fields: [
                        {
                            name: 'alt',
                            type: 'string',
                            title: 'Alt Text',
                            description: 'Description of Logo',
                        },
                        {
                        name: 'link',
                        type: 'internalOrExternalLink',
                        title: 'Logo Link (Optional',
                        description: 'Optional link when clicking logo', 
                        },
                    ],
                    options: {
                        hotspots: true,
                    }
                }
            ],
            hidden: ({ parent }) =>parent?.layout !== 'double',
            validation: (Rule) =>
                Rule.custom((value, context) => {
                    const parent = context.parent as any;
                    if (parent?.layout === 'double' && (!value || value.length < 4)) {
                        return 'At least 4 logos are required for the second row when using double row';
                    }
                    return true
                }),
        }),
    ],
    preview: {
        select: {
            title: 'title',
            layout: 'layout',
            logoCount: 'logos.length',
            secondRowCount: 'secondRowLogos.length'
        },
        prepare({ title, layout, logoCount, secondRowCount }) {
            const subtitle = layout === 'double'
            ?`${logoCount || 0} + ${secondRowCount || 0} logos (Double Row)`
            :`${logoCount || 0} logos (Single Row)`;
            return {
                title: title || 'Logo Garden',
                subtitle
            };
        }
    }  
});