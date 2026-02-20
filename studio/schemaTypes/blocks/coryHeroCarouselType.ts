import { defineField, defineType } from 'sanity';

export const coryHeroCarouselType = defineType({
    name: 'coryHeroCarousel',
    title: 'Cory Hero Carousel',
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
        select: { title: 'Cory Hero Carousel'},
        prepare({ title}) {
            return {
            title: title || 'Cory Hero Carousel',
            };
        }
    }
});
