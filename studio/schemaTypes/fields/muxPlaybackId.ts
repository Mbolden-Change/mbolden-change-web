import {defineField, type ConditionalProperty} from 'sanity'

/**
 * Optional Mux playback ID for a video. Shared by the blocks that have one;
 * when set, the front end plays from Mux and ignores the YouTube URL.
 */
export const muxPlaybackIdField = ({hidden}: {hidden?: ConditionalProperty} = {}) =>
  defineField({
    name: 'muxPlaybackId',
    title: 'Mux playback ID',
    type: 'string',
    description:
      'Optional. The public playback ID from the Mux dashboard (Playback and Thumbnails). When set, the video plays from Mux and the YouTube URL is ignored.',
    validation: (Rule) =>
      Rule.custom((value?: string) =>
        !value || /^[A-Za-z0-9]+$/.test(value.trim())
          ? true
          : 'Use the playback ID only: letters and numbers, no spaces or links.',
      ),
    hidden,
  })
