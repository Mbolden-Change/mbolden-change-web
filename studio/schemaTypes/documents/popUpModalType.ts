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
    }),
    defineField({
      name: 'CTA',
      title: 'CTA',
      type: 'internalOrExternalLink',
    }),
    defineField({
      name: 'openActionNetworkModal',
      title: 'Open Action Network Modal',
      type: 'boolean',
      initialValue: false,
      description: 'Toggle this on to open the Action Network modal when CTA button is clicked.',
      hidden: ({ document }) => !document?.CTA,
      validation: (Rule) => Rule.custom((value, context) => {
        const cta = (context.document as any)?.CTA;
        if (value === true && cta?.url) {
          return 'Please clear the CTA URL field before enabling Action Network Modal toggle.';
        }
        return true;
      })
    }),
  ],
})
