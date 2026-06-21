import { defineField, defineType } from 'sanity';

export const heroCarouselType = defineType({
    name: 'heroCarousel',
    title: 'Hero Carousel',
    type: 'object',
    fields: [
        defineField({
        name: 'slides',
        title: 'Slides',
        description: 'Add one or more slides. Carousel activates when slide count is two or higher.',
        type: 'array',
        of: [{ type: 'hero' }],
        validation: (Rule) => Rule.min(1).warning('Add at least one slide.'),
        }),
    ],
    preview: {
        select: {
            slides: 'slides',
        },
        prepare({slides}) {
            const count = slides?.length ?? 0
            const firstTitle = slides?.[0]?.title
            return {
                title: firstTitle
                    ? `Hero Carousel (Legacy) — ${firstTitle}`
                    : 'Hero Carousel (Legacy)',
                subtitle: count
                    ? `${count} slide${count === 1 ? '' : 's'}`
                    : 'No slides',
            }
        },
    },
});
