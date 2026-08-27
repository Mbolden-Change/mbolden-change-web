import type { Preview } from '@storybook/nextjs-vite';

import '../app/globals.css';
import '../app/design-tokens.scss';
import './storybook.css';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    layout: 'fullscreen',
    options: {
      storySort: {
        order: ['Components', '*'],
      },
    },
    a11y: {
      test: 'todo',
    },
  },
};

export default preview;
