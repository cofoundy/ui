import React from 'react';
import type { Preview } from '@storybook/react';
import './storybook.css';

// Theme toolbar configuration
export const globalTypes = {
  theme: {
    name: 'Theme',
    description: 'Global theme for components',
    defaultValue: 'dark',
    toolbar: {
      icon: 'paintbrush',
      items: [
        { value: 'dark', title: 'Dark', icon: 'moon' },
        { value: 'light', title: 'Light', icon: 'sun' },
      ],
      showName: true,
      dynamicTitle: true,
    },
  },
};

const preview: Preview = {
  parameters: {
    backgrounds: {
      disable: true, // We control background via theme
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
    (Story, context) => {
      const theme = context.globals.theme || 'dark';
      const bgColor = theme === 'light' ? '#f8fafc' : '#020916';

      return (
        <div
          data-theme={theme}
          style={{
            padding: '2rem',
            minHeight: '200px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: bgColor,
            transition: 'background 0.2s ease',
          }}
        >
          <Story />
        </div>
      );
    },
  ],
};

export default preview;
