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
                    { title: 'Stripe (compact)', value: 'stripe-compact' },
                    { title: 'Zeffy', value: 'zeffy'},
                    { title: 'Zeffy (compact)', value: 'zeffy-compact'},
                ],
                layout: 'radio',
            },
            description: 'Toggle between payment processing platforms and styles. Full size Stripe is used by default',
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
            title: 'Primary Theme Color',
            type: 'string',
            description: 'Select a primary theme color for the block. For optimal visibility, consider primary and secondary theme combinations with high contrast. E.g.: yellow and black, fuchsia and beige, aqua teal and beige, etc.',
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
            title: 'Secondary Theme Color',
            type: 'string',
            description: 'Select a secondary theme color that applies directly to the form and elements like buttons. For optimal visibility, consider primary and secondary theme combinations with high contrast. E.g.: yellow and black, fuchsia and beige, aqua teal and beige, etc.',
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
