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
                            description: 'Description of logo'
                        }
                    ],
                    options: {
                        hotspot: true,
                    }
                }
            ],
            validation: (Rule) => Rule.required().min(4).error('At least 4 logos required')
        })
    ],  
})