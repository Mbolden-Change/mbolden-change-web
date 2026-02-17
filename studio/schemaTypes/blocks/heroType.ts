import {defineField, defineType} from 'sanity'

export const heroType = defineType({
  name: 'hero',
  title: 'Hero Section',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: 'Headline',
      type: 'string',
      description: 'A headline is optional but recommended.',
    }),
    defineField({
      name: 'subheading',
      title: 'Subheading',
      type: 'string',
      description: 'Optional subheading below the main headline.',
    }),
    defineField({
      name: 'text',
      title: 'Body',
      type: 'array',
      of: [{type: 'block'}, {type: 'image'}],
    }),
    defineField({
      name: 'hasButton',
      title: 'Add Button?',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'link',
      title: 'Button Link',
      type: 'internalOrExternalLink',
      hidden: ({parent}) => !parent?.hasButton,
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const parent = context.parent as any
          if (parent?.hasButton && !value) {
            return 'A button link is required if "Display Button?" is checked.'
          }
          return true
        }).optional(),
    }),
    defineField({
      name: 'layout',
      title: 'Slide Layout',
      type: 'string',
      options: {
        list: [
          { title: 'Full width (image + overlay)', value: 'full' },
          { title: 'Split (left content, right image)', value: 'split' },
        ],
        layout: 'radio',
      },
      initialValue: 'split',
    }),
    // Full layout media controls.
    defineField({
      name: 'fullMediaType',
      title: 'Media Type',
      type: 'string',
      options: {
        list: [
          { title: 'Image', value: 'image' },
          { title: 'Video', value: 'video' },
        ],
        layout: 'radio',
      },
      initialValue: 'image',
      hidden: ({ parent }) => parent?.layout !== 'full',
    }),
    defineField({
      name: 'fullVideoFile',
      title: 'Upload Video File',
      type: 'file',
      options: {
        accept: 'video/*',
      },
      hidden: ({ parent }) =>
        parent?.layout !== 'full' || parent?.fullMediaType !== 'video',
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const parent = context.parent as {
            layout?: string;
            fullMediaType?: string;
          };
          if (
            parent?.layout === 'full' &&
            parent?.fullMediaType === 'video' &&
            !value
          ) {
            return 'Video file is required when full layout media type is Video.'
          }
          return true
        }),
    }),
    defineField({
      name: 'leftBackgroundType',
      title: 'Left Side (Color or Image)',
      type: 'string',
      options: {
        list: [
          {title: 'Solid color', value: 'color'},
          {title: 'Image / pattern', value: 'image'},
        ],
        layout: 'radio',
      },
      initialValue: 'color',
      // Left-side controls only apply to split layout.
      hidden: ({ parent }) => parent?.layout !== 'split',
    }),
    defineField({
      name: 'backgroundColor',
      title: 'Left Side Color',
      type: 'string',
      options: {
        list: [
          {title: 'Aqua teal', value: 'aqua-teal'},
          {title: 'Warm yellow', value: 'warm-yellow'},
          {title: 'White', value: 'white'},
          {title: 'Black', value: 'black'},
        ],
        layout: 'dropdown',
      },
      initialValue: 'aqua-teal',
      // For split layout only, and only when left side is color mode.
      hidden: ({ parent }) =>
        parent?.layout !== 'split' || parent?.leftBackgroundType !== 'color',
    }),
    defineField({
      name: 'leftBackgroundImage',
      title: 'Background image (left side)',
      type: 'image',
      description: 'Image or pattern for the left 50%. Use for gradients, textures, or photos.',
      fields: [{title: 'Alt Text', name: 'alt', type: 'string'}],
      options: {hotspot: true},
      // For split layout only, and only when left side is image mode.
      hidden: ({ parent }) =>
        parent?.layout !== 'split' || parent?.leftBackgroundType !== 'image',
    }),
    // Full layout image upload.
    defineField({
      name: 'fullImage',
      title: 'Main Image',
      type: 'image',
      description: 'Upload image for full-width slides.',
      fields: [{title: 'Alt Text', name: 'alt', type: 'string'}],
      options: {
        hotspot: true,
      },
      hidden: ({ parent }) =>
        parent?.layout !== 'full' || parent?.fullMediaType === 'video',
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const parent = context.parent as {
            layout?: string;
            fullMediaType?: string;
          };
          if (
            parent?.layout === 'full' &&
            parent?.fullMediaType !== 'video' &&
            !value
          ) {
            return 'Main Image is required when full layout media type is Image.'
          }
          return true
        }),
    }),
    // Split layout controls:
    // Left side can be color or image, and right side has its own media type.
    defineField({
      name: 'splitRightMediaType',
      title: 'Right Side Media (Image or Video)',
      type: 'string',
      options: {
        list: [
          { title: 'Image', value: 'image' },
          { title: 'Video', value: 'video' },
        ],
        layout: 'radio',
      },
      initialValue: 'image',
      hidden: ({ parent }) => parent?.layout !== 'split',
    }),
    defineField({
      name: 'splitRightImage',
      title: 'Main Image (right side)',
      type: 'image',
      description: 'Upload image for the right side of split slides.',
      fields: [{title: 'Alt Text', name: 'alt', type: 'string'}],
      options: {
        hotspot: true,
      },
      hidden: ({ parent }) =>
        parent?.layout !== 'split' || parent?.splitRightMediaType === 'video',
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const parent = context.parent as {
            layout?: string;
            splitRightMediaType?: string;
          };
          if (
            parent?.layout === 'split' &&
            parent?.splitRightMediaType !== 'video' &&
            !value
          ) {
            return 'Main Image (right side) is required when right side media type is Image.'
          }
          return true
        }),
    }),
    defineField({
      name: 'splitRightVideoFile',
      title: 'Right Side Video Upload',
      type: 'file',
      options: {
        accept: 'video/*',
      },
      hidden: ({ parent }) =>
        parent?.layout !== 'split' || parent?.splitRightMediaType !== 'video',
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const parent = context.parent as {
            layout?: string;
            splitRightMediaType?: string;
          };
          if (
            parent?.layout === 'split' &&
            parent?.splitRightMediaType === 'video' &&
            !value
          ) {
            return 'Right side video file is required when right side media type is Video.'
          }
          return true
        }),
    }),
    // Legacy support: older hero docs used `image`.
    // Keep this hidden so Studio no longer shows "Unknown field found",
    // while frontend query still coalesces it as a fallback.
    defineField({
      name: 'image',
      title: 'Legacy Image',
      type: 'image',
      hidden: true,
      readOnly: true,
      fields: [{title: 'Alt Text', name: 'alt', type: 'string'}],
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'mediaType',
      title: 'Legacy mediaType',
      type: 'string',
      hidden: true,
      readOnly: true,
    }),
    defineField({
      name: 'videoFile',
      title: 'Legacy videoFile',
      type: 'file',
      hidden: true,
      readOnly: true,
    }),
  ],
  preview: {
    select: {
      title: 'title',
      fullMedia: 'fullImage',
      splitMedia: 'splitRightImage',
      // Kept as fallback so older docs still preview with an image.
      legacyMedia: 'image',
    },
    prepare({ title, fullMedia, splitMedia, legacyMedia }) {
      return {
        title: `Slide — ${title || 'Untitled'}`,
        media: splitMedia || fullMedia || legacyMedia,
      };
    },
  },
})
