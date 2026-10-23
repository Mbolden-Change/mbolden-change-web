import {defineArrayMember} from 'sanity'
import {HighlightIcon} from '@sanity/icons'
import SupIcon from '../../components/SupIcon'

// Shared rich text for statements and letters. Kept out of blocks/index.ts,
// which registers every export as a schema type.

/** Yellow marker that draws under the text as it scrolls into view. */
export const highlightDecorator = {title: 'Highlight', value: 'highlight', icon: HighlightIcon}

/** A footnote number, such as 1, that jumps to the matching source. */
export const footnoteDecorator = {title: 'Footnote number', value: 'footnote', icon: SupIcon}

/** Paragraphs and lists for statements and letters: bold, italic, highlight, footnotes and links. */
export const articleBlock = defineArrayMember({
  type: 'block',
  styles: [{title: 'Normal', value: 'normal'}],
  lists: [
    {title: 'Bullet', value: 'bullet'},
    {title: 'Numbered', value: 'number'},
  ],
  marks: {
    decorators: [
      {title: 'Bold', value: 'strong'},
      {title: 'Italic', value: 'em'},
      highlightDecorator,
      footnoteDecorator,
    ],
  },
})
