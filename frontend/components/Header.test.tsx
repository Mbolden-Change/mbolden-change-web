import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { track } from '@vercel/analytics';
import Header from './Header';
import type { Header as HeaderType } from '@/sanity/types';

jest.mock('@vercel/analytics', () => ({ track: jest.fn() }));
jest.mock('next/navigation', () => ({ usePathname: () => '/' }));
jest.mock('next/dynamic', () => () => function SearchPanel({ open }: { open: boolean }) {
  return open ? <div role="dialog" aria-label="Search" /> : null;
});
jest.mock('@/lib/search/client', () => ({ preloadSearch: jest.fn() }));
jest.mock('./SanityNextImage', () => () => null);

const donatePage = { _type: 'page', slug: { current: 'donate' } };
const headerData = {
  logo: null,
  navigationLinks: [
    { title: 'Who We Are', isExternalLink: false, reference: { _type: 'page', slug: { current: 'who-we-are' } } },
  ],
  donateCTA: { text: 'Donate', buttonLink: { title: 'Donate', isExternalLink: false, reference: donatePage } },
} as unknown as HeaderType;

const setup = () => {
  const user = userEvent.setup();
  render(<Header headerData={headerData} />);
  // jsdom can't follow links.
  document.addEventListener('click', (event) => event.preventDefault());
  const menu = screen.getByRole('list');
  // The phone header row: Donate and the menu button, outside the menu list.
  const mobileDonate = screen.getAllByRole('link', { name: 'Donate' }).find((link) => !menu.contains(link))!;
  return { user, menu, mobileDonate };
};

describe('Header on phones', () => {
  it('shows a Donate link to /donate beside the menu button, with no search button there', () => {
    const { menu, mobileDonate } = setup();
    expect(mobileDonate).toHaveAttribute('href', '/donate');
    expect(mobileDonate).not.toHaveAttribute('target');
    const row = mobileDonate.closest('div')!;
    expect(within(row).getByRole('button', { name: 'Toggle menu' })).toBeInTheDocument();
    expect(within(row).queryByRole('button', { name: /search/i })).not.toBeInTheDocument();
    expect(menu).toBeInTheDocument();
  });

  it('reports the header Donate as a Donate Click from the mobile header', async () => {
    const { user, menu, mobileDonate } = setup();
    await user.click(mobileDonate);
    expect(track).toHaveBeenCalledWith('Donate Click', { location: 'header', placement: 'mobile-header' });

    await user.click(within(menu).getByRole('link', { name: 'Donate' }));
    expect(track).toHaveBeenLastCalledWith('Donate Click', { location: 'header' });
  });

  it('puts the search field first in the menu; it closes the menu and opens the search panel', async () => {
    const { user, menu } = setup();
    const menuButton = screen.getByRole('button', { name: 'Toggle menu' });
    await user.click(menuButton);
    expect(menuButton).toHaveAttribute('aria-expanded', 'true');

    const field = within(menu.firstElementChild as HTMLElement).getByRole('button', { name: 'Search the site' });
    expect(field).toHaveAttribute('aria-haspopup', 'dialog');
    expect(field).toHaveAttribute('aria-expanded', 'false');

    await user.click(field);
    expect(menuButton).toHaveAttribute('aria-expanded', 'false');
    expect(field).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('dialog', { name: 'Search' })).toBeInTheDocument();
  });
});
