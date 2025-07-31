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
        },
    ],
    }),
    defineField({
    name: 'CTA',
    title: 'CTA',
    type: 'internalOrExternalLink',
    }),
],
})
