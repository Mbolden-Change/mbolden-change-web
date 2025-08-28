import { link } from 'fs';
import {defineField, defineType} from 'sanity'
import { isExternal } from 'util/types';

export const cardType = defineType({
  name: 'card',
  title: 'Card',
  type: 'object',
  fields: [
    defineField({
      name: 'titleLine1',
      title: 'Title Line 1',
      type: 'string',
      description: 'Add first line of card title here.',
    }),
    defineField({
      name: 'titleLine2',
      title: 'Title Line 2',
      type: 'string',
      description: 'Add card title here.',
    }),
    defineField({
      name: 'text',
      title: 'Text',
      type: 'text',
      description: 'Add card text here.',
    }),
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      description: 'Optional image to add to the card.',
      fields: [{title: 'Alt Text', name: 'alt', type: 'string'}],
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'addVideoLink',
      title: 'Add Video Link?',
      type: 'boolean',
      initialValue: false,
      description: 'Toggle on and add a video link to have a video popup enabled. The other link toggle must be off',
      validation: (Rule) =>
        Rule.custom((value, context): any  => {
          const addVideoLink = (context.parent as any).addVideoLink;
          const videoField= (context.parent as any).videoURL;
          const addLink = (context.parent as any).addLink;
          const videoTitle= (context.parent as any).videoTitle;
          if (value && addLink) 
          {
            return 'If you want to add a video link, please toggle off the "Add Link" switch';
          }
          if ((videoTitle || videoField) && addVideoLink === false){
            return 'If you want to turn off video toggle, clear video field'
          }
          return true
        }),
    }),
    defineField({
      name: 'videoTitle',
      title: 'Video Title',
      type: 'string',
      hidden: ({parent}) => parent?.addVideoLink === false,
      description: 'Add video title for the button here.',
    }),
    defineField({
      name: 'videoURL',
      title: 'Video URL',
      type: 'url',
      hidden: ({parent}) => parent?.addVideoLink === false,
      description:`Paste your Youtube or Google Drive video urls. For Youtube, copy the browser url, then paste. For Google Drive, click 'Share' tab and 'copy link', then paste. (e.g. Valid url -> 'https://drive.google.com/file/d/FILE_ID/view?usp=sharing'),
      (e.g. Invalid url -> 'https://drive.google.com/drive/folders/FOLDER_ID'.)`,  
    }),

      defineField({
      name: 'addLink',
      title: 'Add Link?',
      type: 'boolean',
      initialValue: false,
      description: 'Toggle on and add a link to navigate to a different page. The other video toggle must be off',
      validation: (Rule) =>
        Rule.custom((value, context): any  => {
          const addVideoLink = (context.parent as any).addVideoLink;
          const linkField= (context.parent as any).link
          const addLinkToggle= (context.parent as any).addLink
          if (value && addVideoLink) {
            return 'If you want to add a link, please toggle off the "Add Video Link" switch';
          }
          if ((linkField.isActive || linkField.title || linkField.reference || linkField.isExternalLink) && addLinkToggle === false )  {
            return 'If you want to turn off link toggle, clear link field and toggle external link';
          }
          return true
        }),
    }),
    defineField({
      name: 'link',
      title: 'Card Link (Optional)',
      type: 'internalOrExternalLink',
      hidden: ({parent}) => parent?.addLink === false,
      description: 'Put link text here. Entire card will be clickable, with link',
      // validation: (Rule) =>
      //   Rule.custom((value, context): any => {
      //     const linkField= (context.parent as any).link
      //     const addLinkToggle= (context.parent as any).addLink
      //     if (value && linkField && !addLinkToggle)  {
      //       return 'If you want to add a video link, please toggle off the "Add Link" switch';
      //     }
      //     return true
      //   })
    }),
  ],
  preview: {
    select: { title: 'title'},
    prepare({ title}) {
        return {
        title: `Card — ${title || 'Card'}`,
        };
    }
  }
})
