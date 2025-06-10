import { defineField, defineType } from 'sanity'

export const fiftyfiftyType = defineType({
    name: 'fiftyFifty',
    title: 'Fifty-Fifty Section',
    type: 'object',
    fields: [
        defineField({
            name: 'mediaType',
            title: 'Media Type',
            type: 'string',
            options: {
                list: [
                    { title: 'Image', value: 'image' },
                    { title: 'Video', value: 'video' },
                ],
                layout: 'radio'
            },
            validation: (Rule) =>
                Rule.custom((value, context) => {
                    const parent = context.parent as any;

                    if (value === 'image' && (parent?.leftVideoUrl || parent?.rightVideoUrl)) {
                        return 'To display Image, please delete video URL fields.';
                    }

                    if (value === 'video' && (parent?.leftImage || parent?.rightImage)) {
                        return 'To display Video, please clear image fields.';
                    }

                    return true;
                })
        }),
        defineField({
            name: 'videoTitle',
            title: 'Video Title',
            type: 'string',
            hidden: ({ parent }) => parent?.mediaType !== 'video',
            description: 'Optional title to display above the video.'
        }),
        defineField({
            name: 'imageAspectRatio',
            title: 'Image Aspect Ratio',
            type: 'string',
            options: {
                list: [
                    { title: 'Original Image Ratio', value: 'original'},
                    { title: '16:9', value: '16:9' },
                    { title: '1:1', value: '1:1' },
                    { title: '4:3', value: '4:3'},
                    { title: '9:16', value: '9:16'},
                ],
                layout: 'radio',
            },
            initialValue: 'original',
            hidden: ({ parent }) => parent?.mediaType !== 'image',
        }),
        defineField({
            name: 'leftOrRightImage',
            title: 'Media Position',
            type: 'string',
            options: {
                list: [
                    { title: 'Media Left', value: 'left' },
                    { title: 'Media Right', value: 'right' },
                ],
                layout: 'radio',
            },
        }),
        defineField({
            name: 'mobileLayout',
            title: 'Mobile Layout',
            type: 'string',
            options: {
                list: [
                    { title: 'Media on Top', value: 'imageTop' },
                    { title: 'Text on Top', value: 'textTop'},
                ],
                layout: 'radio',
            },
        }),
        defineField({
            name: 'leftVideoUrl',
            title: 'Left Video URL',
            type: 'url',
            description:`Paste your Google Drive video url. Click 'Share' tab and 'copy link', then paste. (e.g. Valid url -> 'https://drive.google.com/file/d/FILE_ID/view?usp=sharing'),
            (e.g. Invalid url -> 'https://drive.google.com/drive/folders/FOLDER_ID'.)`,

            hidden: ({ parent }) => parent?.mediaType !== 'video' || parent?.leftOrRightImage !== 'left',
            validation: (Rule) =>
                Rule.custom((value, context) => {
                    const parent = context.parent as any;

                    if (parent?.mediaType !== 'video' || parent?.leftOrRightImage !== 'left') {
                        return true;
                    }

                    if (value && parent?.rightVideoUrl) {
                        return 'Cannot have both left and right video URLs - please remove one';
                    }
                    return true;
                })
        }),
        defineField({
            name: 'rightVideoUrl',
            title: 'Right Video URL',
            type: 'url',
            description:`Paste your Google Drive video url. Click 'Share' tab and 'copy link', then paste. (e.g. Valid url -> 'https://drive.google.com/file/d/FILE_ID/view?usp=sharing'),
            (e.g. Invalid url -> 'https://drive.google.com/drive/folders/FOLDER_ID'.)`,
            hidden: ({ parent }) => parent?.mediaType !== 'video' || parent?.leftOrRightImage!== 'right',
            validation: (Rule) =>
                Rule.custom((value, context) => {
                    const parent = context.parent as any;

                    if (parent?.mediaType !== 'video' || parent?.leftOrRightImage !== 'right') {
                        return true;
                    }

                    if (value && parent?.leftVideoUrl) {
                        return 'Cannot have both left and right video URLs - please remove one';
                    }
                    return true;
                })
        }),
        defineField({
            name: 'rightImage',
            title: 'Right Column Image',
            type: 'image',
            fields: [{ title: 'Alt Text', name: 'alt', type: 'string' }],
            options: {
                hotspot: true,
            },
            hidden: ({ parent }) => parent?.leftOrRightImage !== 'right'  || parent?.mediaType !== 'image',
        }),
        defineField({
            name: 'leftImage',
            title: 'Left Column Image',
            type: 'image',
            fields: [{ title: 'Alt Text', name: 'alt', type: 'string' }],
            options: {
                hotspot: true,
            },
            hidden: ({ parent }) => parent?.leftOrRightImage !== 'left'  || parent?.mediaType !== 'image',
        }),
        defineField({
            name: 'leftTitle',
            title: 'Left Column Title',
            type: 'string',
            hidden: ({ parent }) => parent?.leftOrRightImage !== 'right',
            validation: (Rule) =>
                Rule.custom((value, context): any  => {
                  const leftImage = (context.parent as any).leftImage;
                  if (value && leftImage) {
                    return 'Cannot add with left image present';
                  }
                  return true
                }),
        }),
        defineField({
            name: 'leftText',
            title: 'Left Column Text',
            type: 'array',
            of: [{ type: 'block' }],
            hidden: ({ parent }) => parent?.leftOrRightImage !== 'right',
            validation: (Rule) =>
                Rule.custom((value, context): any  => {
                    const leftImage = (context.parent as any).leftImage;
                    if (value && leftImage) {
                      return 'Cannot add with left image present';
                    }
                    return true
                  }),
            }),

        defineField({
            name: 'rightTitle',
            title: 'Right Column Title',
            type: 'string',
            hidden: ({ parent }) => parent?.leftOrRightImage !== 'left',
            validation: (Rule) =>
                Rule.custom((value, context): any  => {
                    const rightImage = (context.parent as any).rightImage;
                    if (value && rightImage) {
                      return 'Cannot add with right image present';
                    }
                    return true
                  }),
        }),
        defineField({
            name: 'rightText',
            title: 'Right Column Text',
            type: 'array',
            of: [{ type: 'block' }],
            hidden: ({ parent }) => parent?.leftOrRightImage !== 'left',
            validation: (Rule) =>
                Rule.custom((value, context): any  => {
                    const rightImage = (context.parent as any).rightImage;
                    if (value && rightImage) {
                      return 'Cannot add with right image present';
                    }
                    return true
                  }),
        }),
    ],
    preview: {
        select: {
            leftText: 'leftText',
            rightText: 'rightText'
        },
        prepare({ leftText, rightText }) {
            let title;
            if (leftText) {
                title = '50/50 — Text Left, Media Right';
            } else if (rightText) {
                title = '50/50 — Media Left, Text Right';
            } else {
                title = '50/50 Section';
            }

            return { title };
        },
    },
})
