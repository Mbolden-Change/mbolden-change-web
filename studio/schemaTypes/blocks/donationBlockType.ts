import { defineField, defineType } from 'sanity'

export const donationBlockType = defineType({
    name: 'donationBlock',
    title: 'Donation Block',
    type: 'object',
    fields: [
        defineField({
            name: 'paymentsPlatform',
            title: 'Payments Platform',
            type: 'string',
            options: {
                list: [
                    { title: 'Stripe', value: 'stripe' },
                    { title: 'Zeffy', value: 'zeffy'},
                ],
                layout: 'radio',
            },
            description: 'Toggle between two payment processing platforms. Stripe is used by default',
        }),
        defineField({
            name: 'headline',
            title: 'Headline',
            type: 'string',
            description: 'Main heading text for the donation block.',
        }),
        defineField({
            name: 'text',
            title: 'Text',
            type: 'array',
            of: [{type: 'block'}, {type: 'image'}],
            description: 'Optional text to encourage donations.',
        }),
        defineField({
            name: 'blockTheme',
            title: 'Block Theme Color',
            type: 'string',
            description: 'Select a theme color for the block.',
            options: {
                list: [
                    {title: 'Warm Yellow', value: 'var(--brand-warm-yellow)'},
                    {title: 'Aqua Teal', value: 'var(--brand-aqua-teal)'},
                    {title: 'Fuchsia', value: 'var(--brand-fuchsia)'},
                    {title: 'Black', value: 'var(--brand-black)'},
                    {title: 'White', value: 'var(--brand-white)'},
                    {title: 'Light Gray', value: 'var(--brand-light-gray)'},
                    {title: 'Creamy Beige', value: 'var(--brand-creamy-beige)'},
                ],
            layout: 'radio',
            },
        }),
        defineField({
            name: 'formTheme',
            title: 'Form Theme Color',
            type: 'string',
            description: 'Select a theme color for the donation form.',
            options: {
                list: [
                    {title: 'Warm Yellow', value: 'var(--brand-warm-yellow)'},
                    {title: 'Aqua Teal', value: 'var(--brand-aqua-teal)'},
                    {title: 'Fuchsia', value: 'var(--brand-fuchsia)'},
                    {title: 'Black', value: 'var(--brand-black)'},
                    {title: 'Light Gray', value: 'var(--brand-light-gray)'},
                    {title: 'Creamy Beige', value: 'var(--brand-creamy-beige)'},
                ],
            layout: 'radio',
        },
        }),
    ],
    initialValue: {
        paymentsPlatform: 'stripe',
    },
    preview: {
        select: { title: 'headline' },
        prepare({ title }) {
        return {
            title: title ? `Donation Block — ${title}` : 'Donation Block',
        };
        },
    },
});
