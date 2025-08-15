import {defineField, defineType} from 'sanity'

export const popUpModalType = defineType({
name: 'popUpModal',
title: 'Pop-Up Modal',
type: 'document',
fields: [
    defineField({
    name: 'visibility',
    title: 'Show Pop-up?',
    type: 'boolean',
    initialValue: true,
    description: 'Control pop-up visibility by toggling on or off. ',
    }),
    defineField({
    name: 'title',
    title: 'Title',
    type: 'string',
    validation: (Rule) => Rule.required(),
    }),
    defineField({
    name: 'body',
    title: 'Body',
    type: 'string',
    }),
    defineField({
    name: 'image',
    title: 'Image',
    type: 'image',
    options: {
        collapsed: false,
        collapsible: true,
        hotspot: true,
    },
    fields: [
        {
        title: 'Alt Text',
        name: 'alt',
        type: 'string',
        validation: Rule => Rule.custom((alt, context) => {
            //@ts-ignore
        const image = context.parent.asset;

        if (image && !alt) {
          return 'Alt text is required when an image is set';
        }
        if (!image && alt) {
          return 'You must upload an image if you provide alt text';
        }
        return true;
      })
        },
    ],

    // validation: Rule => Rule.required().error('A main image is required.')

    }),
    defineField({
    name: 'CTA',
    title: 'CTA',
    type: 'internalOrExternalLink',
    }),
],
})
