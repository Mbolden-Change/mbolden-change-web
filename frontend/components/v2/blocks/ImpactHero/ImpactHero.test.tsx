import { fireEvent, render, screen } from '@testing-library/react';
import ImpactHero from './ImpactHero';
import type { ImpactHero as ImpactHeroType } from '@/sanity/types';

jest.mock('@/lib/analytics', () => ({ isDonateCta: () => false, trackDonateClick: jest.fn() }));
jest.mock('@/sanity/lib/image', () => ({
  urlFor: () => {
    const builder = {
      width: () => builder,
      fit: () => builder,
      auto: () => builder,
      url: () => 'https://cdn.test/logo.png',
    };
    return builder;
  },
  getDimensionsFromRef: (ref: string) => {
    const [width, height] = ref.split('-')[2].split('x').map(Number);
    return { imageWidth: width, imageHeight: height };
  },
}));
jest.mock('@/components/SanityNextImage', () => ({ __esModule: true, default: () => <img alt="Hero photo" /> }));

const hero: ImpactHeroType = {
  _type: 'impactHero',
  heading: 'Meeting Urgent Needs. Driving Systemic Change.',
  media: { image: { _type: 'image', asset: { _type: 'reference', _ref: 'image-hero-1200x800-jpg' }, alt: 'Hero photo' } },
  supportedBy: 'The Gateway Fund is supported by a grant from a foundation.',
};

const logo = {
  _type: 'image' as const,
  asset: { _type: 'reference' as const, _ref: 'image-logo-2156x610-png' },
  alt: 'A Foundation',
};

test('a funder logo under the Supported by line links to the funder in a new tab', () => {
  render(<ImpactHero {...hero} supportedByLogo={logo} supportedByLink="https://example.org" />);
  const link = screen.getByRole('link', { name: 'A Foundation' });
  expect(link).toHaveAttribute('href', 'https://example.org');
  expect(link).toHaveAttribute('target', '_blank');
  expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  const image = link.querySelector('img');
  expect(image).toHaveAttribute('width', '180');
  expect(image).toHaveAttribute('height', '51');
  const note = screen.getByText(hero.supportedBy!);
  expect(note.compareDocumentPosition(link) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
});

test('a logo without a link is not shown', () => {
  render(<ImpactHero {...hero} supportedByLogo={logo} />);
  expect(screen.queryByRole('link', { name: 'A Foundation' })).toBeNull();
});

test('without a logo the Supported by line stays a single line of text', () => {
  const { container } = render(<ImpactHero {...hero} />);
  const note = container.querySelector('[class*="supporter"]');
  expect(note?.tagName).toBe('P');
  expect(note).toHaveTextContent(hero.supportedBy!);
  expect(container.querySelector('a[target="_blank"]')).toBeNull();
});

const MUX_ID = 'CiP7O9em3lzgEir017eprS6j9vVZtWczhsfAF1T7z400Q';
const cover = { _type: 'image' as const, asset: { _type: 'reference' as const, _ref: 'image-cover-1600x900-jpg' } };

test('a Mux video shows the cover first and plays from Mux in one click, ignoring the YouTube URL', () => {
  const { container } = render(
    <ImpactHero
      {...hero}
      media={{
        muxPlaybackId: MUX_ID,
        videoUrl: 'https://www.youtube.com/watch?v=abc123',
        videoCover: cover,
        videoTitle: 'The Gateway Fund video',
      }}
    />,
  );
  expect(screen.queryByTestId('mux-player')).toBeNull();
  expect(container.querySelector('iframe')).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Play video: The Gateway Fund video' }));
  const player = screen.getByTestId('mux-player');
  expect(player).toHaveAttribute('data-playback-id', MUX_ID);
  expect(player).toHaveAttribute('data-video-title', 'The Gateway Fund video');
  expect(player).toHaveAttribute('data-autoplay', 'true');
  expect(player).toHaveAttribute('data-poster', 'https://cdn.test/logo.png');
  expect(container.querySelector('iframe')).toBeNull();
  expect(screen.getByRole('group', { name: 'The Gateway Fund video' })).toHaveFocus();
});

test('a Mux video replaces the hero image', () => {
  render(<ImpactHero {...hero} media={{ ...hero.media, muxPlaybackId: MUX_ID }} />);
  expect(screen.queryByAltText('Hero photo')).toBeNull();
  expect(screen.getByRole('button', { name: `Play video: ${hero.heading}` })).toBeInTheDocument();
});

test('without a Mux playback ID the YouTube video plays as before', () => {
  const { container } = render(
    <ImpactHero {...hero} media={{ videoUrl: 'https://www.youtube.com/watch?v=abc123', videoTitle: 'A video' }} />,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Play video: A video' }));
  expect(screen.queryByTestId('mux-player')).toBeNull();
  expect(container.querySelector('iframe')).toHaveAttribute(
    'src',
    'https://www.youtube-nocookie.com/embed/abc123?autoplay=1&rel=0&playsinline=1',
  );
});
