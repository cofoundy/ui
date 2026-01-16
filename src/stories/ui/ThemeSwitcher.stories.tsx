import type { Meta, StoryObj } from '@storybook/react';
import { useState, useEffect } from 'react';
import { ThemeSwitcher } from '../../components/ui/theme-switcher';

const meta: Meta<typeof ThemeSwitcher> = {
  title: 'UI/ThemeSwitcher',
  component: ThemeSwitcher,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'An animated sun/moon theme switcher component. Uses smooth CSS transitions for the morph animation between light and dark mode icons.',
      },
    },
  },
  argTypes: {
    theme: {
      control: 'radio',
      options: ['light', 'dark'],
      description: 'Current theme state',
    },
    size: {
      control: 'radio',
      options: ['sm', 'default', 'lg'],
      description: 'Size of the switcher',
    },
    duration: {
      control: { type: 'range', min: 200, max: 1000, step: 50 },
      description: 'Animation duration in milliseconds',
    },
  },
};

export default meta;
type Story = StoryObj<typeof ThemeSwitcher>;

// Interactive wrapper with background container to demo theme changes
const InteractiveWrapper = ({
  initialTheme = 'dark',
  size,
  duration,
  showContainer = true,
}: {
  initialTheme?: 'light' | 'dark';
  size?: 'sm' | 'default' | 'lg';
  duration?: number;
  showContainer?: boolean;
}) => {
  const [theme, setTheme] = useState<'light' | 'dark'>(initialTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    return () => {
      document.documentElement.setAttribute('data-theme', 'dark');
    };
  }, [theme]);

  const switcher = <ThemeSwitcher theme={theme} onThemeChange={setTheme} size={size} duration={duration} />;

  if (!showContainer) return switcher;

  return (
    <div
      className="flex items-center justify-center p-12 rounded-xl transition-colors"
      style={{
        background: theme === 'dark' ? '#020b1b' : '#ffffff',
        transition: 'background 500ms cubic-bezier(0.19, 1, 0.22, 1)',
      }}
    >
      {switcher}
    </div>
  );
};

export const Default: Story = {
  render: () => <InteractiveWrapper initialTheme="dark" />,
};

export const LightMode: Story = {
  render: () => <InteractiveWrapper initialTheme="light" />,
};

export const Small: Story = {
  render: () => <InteractiveWrapper size="sm" />,
};

export const Large: Story = {
  render: () => <InteractiveWrapper size="lg" />,
};

// All sizes comparison
export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-8">
      <div className="flex flex-col items-center gap-2">
        <InteractiveWrapper size="sm" />
        <span className="text-xs text-muted-foreground">Small</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <InteractiveWrapper size="default" />
        <span className="text-xs text-muted-foreground">Default</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <InteractiveWrapper size="lg" />
        <span className="text-xs text-muted-foreground">Large</span>
      </div>
    </div>
  ),
};

// Interactive with label
const WithLabel = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  return (
    <div className="flex flex-col items-center gap-6">
      <ThemeSwitcher theme={theme} onThemeChange={setTheme} />
      <p className="text-sm text-muted-foreground">
        Current theme: <span className="font-medium text-foreground">{theme}</span>
      </p>
    </div>
  );
};

export const Interactive: Story = {
  render: () => <WithLabel />,
  parameters: {
    docs: {
      description: {
        story: 'Click the switcher to toggle between light and dark themes.',
      },
    },
  },
};

// Theme toggle with actual document theme change
const LiveThemeToggle = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    // Apply theme to the storybook preview container
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    return () => {
      root.setAttribute('data-theme', 'dark');
    };
  }, [theme]);

  return (
    <div
      className="p-8 rounded-xl border border-border transition-colors"
      style={{
        backgroundColor: 'var(--background)',
        transition: 'background-color 500ms cubic-bezier(0.19, 1, 0.22, 1)',
      }}
    >
      <div className="flex items-center justify-between gap-8">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Theme</h3>
          <p className="text-sm text-muted-foreground">Toggle between light and dark mode</p>
        </div>
        <ThemeSwitcher theme={theme} onThemeChange={setTheme} />
      </div>
    </div>
  );
};

export const LiveTheme: Story = {
  render: () => <LiveThemeToggle />,
  parameters: {
    docs: {
      description: {
        story: 'This example applies the theme change to the document, demonstrating real theme switching.',
      },
    },
  },
};

// Settings panel example
const SettingsPanel = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  return (
    <div className="w-80 p-6 bg-card rounded-xl border border-border">
      <h3 className="text-lg font-semibold text-foreground mb-6">Appearance</h3>

      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium text-foreground">Theme</span>
          <span className="text-xs text-muted-foreground">
            {theme === 'dark' ? 'Dark mode is on' : 'Light mode is on'}
          </span>
        </div>
        <ThemeSwitcher size="sm" theme={theme} onThemeChange={setTheme} />
      </div>

      <div className="mt-6 pt-6 border-t border-border">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Preference saved</span>
          <span className="text-primary">Auto-sync enabled</span>
        </div>
      </div>
    </div>
  );
};

export const InSettingsPanel: Story = {
  render: () => <SettingsPanel />,
  parameters: {
    docs: {
      description: {
        story: 'ThemeSwitcher integrated within a settings panel UI.',
      },
    },
  },
};

// Custom duration examples
export const SlowAnimation: Story = {
  render: () => <InteractiveWrapper duration={1000} />,
  parameters: {
    docs: {
      description: {
        story: 'Slower animation (1000ms) for dramatic effect.',
      },
    },
  },
};

export const FastAnimation: Story = {
  render: () => <InteractiveWrapper duration={200} />,
  parameters: {
    docs: {
      description: {
        story: 'Faster animation (200ms) for snappy interactions.',
      },
    },
  },
};
