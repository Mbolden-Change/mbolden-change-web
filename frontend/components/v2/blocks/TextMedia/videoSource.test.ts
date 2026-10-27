import {getMuxPlaybackId, getVideoSource} from './videoSource'

jest.mock('@/sanity/lib/image', () => ({urlFor: jest.fn(), getDimensionsFromRef: jest.fn(() => ({}))}))

const MUX_ID = 'CiP7O9em3lzgEir017eprS6j9vVZtWczhsfAF1T7z400Q'
const YOUTUBE = 'https://www.youtube.com/watch?v=abc123'

test('a Mux playback ID wins over a YouTube URL', () => {
  expect(getVideoSource(MUX_ID, YOUTUBE)).toEqual({kind: 'mux', playbackId: MUX_ID})
})

test('a Mux playback ID on its own plays from Mux', () => {
  expect(getVideoSource(MUX_ID, undefined)).toEqual({kind: 'mux', playbackId: MUX_ID})
})

test('without a Mux playback ID the YouTube URL is used', () => {
  expect(getVideoSource(undefined, YOUTUBE)).toEqual({kind: 'youtube', videoId: 'abc123'})
  expect(getVideoSource('', YOUTUBE)).toEqual({kind: 'youtube', videoId: 'abc123'})
  expect(getVideoSource('   ', YOUTUBE)).toEqual({kind: 'youtube', videoId: 'abc123'})
})

test('no video without either', () => {
  expect(getVideoSource(undefined, undefined)).toBeNull()
  expect(getVideoSource(null, 'https://example.org/video')).toBeNull()
})

test('a playback ID is trimmed; a pasted link or stray text is not one', () => {
  expect(getMuxPlaybackId(`  ${MUX_ID}\n`)).toBe(MUX_ID)
  expect(getMuxPlaybackId(`https://stream.mux.com/${MUX_ID}.m3u8`)).toBeNull()
  expect(getMuxPlaybackId('two words')).toBeNull()
  expect(getVideoSource('https://stream.mux.com/x.m3u8', YOUTUBE)).toEqual({
    kind: 'youtube',
    videoId: 'abc123',
  })
})
