import {defineField, defineType} from 'sanity'

export const popUpModalType = defineType({
name: 'popUpModal',
title: 'Pop-Up Modal',
type: 'document',
fields: [
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
