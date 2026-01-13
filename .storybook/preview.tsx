import React from 'react';
import type { Preview } from '@storybook/react';
import './storybook.css';

const preview: Preview = {
  parameters: {
    backgrounds: {
      default: 'cofoundy-dark',
      values: [
        { name: 'cofoundy-dark', value: '#020916' },   // --cf-midnight
        { name: 'cofoundy-navy', value: '#0D3A59' },   // --cf-navy
        { name: 'cofoundy-deep', value: '#072235' },   // --cf-deep
        { name: 'light', value: '#ffffff' },
      ],
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div
        style={{
          padding: '2rem',
          minHeight: '200px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Story />
      </div>
    ),
  ],
};

export default preview;
