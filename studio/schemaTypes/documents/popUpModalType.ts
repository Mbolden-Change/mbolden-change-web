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
      name: 'openActionNetworkModal',
      title: 'Open Action Network Modal',
      type: 'boolean',
      initialValue: false,
      description: 'Toggle ON to open the Action Network modal when CTA is clicked. Toggle OFF to use the CTA link below.',
      validation: (Rule) => Rule.custom((value, context) => {
        const cta = (context.document as any)?.CTA;
        
        if (value === true && (cta?.url || cta?.title)) {
          return 'Please clear the CTA Link field before enabling Action Network Modal toggle.';
        }
        return true;
      })
    }),
    defineField({
      name: 'CTA',
      title: 'CTA',
      type: 'internalOrExternalLink',
      hidden: ({ document }) => document?.openActionNetworkModal === true,
      validation: (Rule) => 
        Rule.custom((value, context) => {
          const openModal = (context.document as any)?.openActionNetworkModal;
          if (openModal === false && !value) {
            return 'CTA link is required when Action Network Modal is disabled.';
          }
          return true;
        }),
    }),
  ],
})
