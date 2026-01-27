import type { Meta, StoryObj } from '@storybook/react';
import { LogoHeader, Wordmark } from '../../components/ui/logo-header';

const meta: Meta<typeof LogoHeader> = {
  title: 'UI/LogoHeader',
  component: LogoHeader,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'default', 'lg', 'xl'],
      description: 'The size of the logo header',
    },
    mono: {
      control: 'boolean',
      description: 'Use monochrome version (inherits currentColor)',
    },
    wordmarkOnly: {
      control: 'boolean',
      description: 'Show only the wordmark without the isologo',
    },
    isologoOnly: {
      control: 'boolean',
      description: 'Show only the isologo without the wordmark',
    },
  },
  parameters: {
    docs: {
      description: {
        component: 'Cofoundy Logo Header - Horizontal layout combining the 3D isologo with the Space Grotesk Semibold wordmark.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof LogoHeader>;

export const Default: Story = {
  args: {
    size: 'default',
  },
};

export const Small: Story = {
  args: {
    size: 'sm',
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
  },
};

export const ExtraLarge: Story = {
  args: {
    size: 'xl',
  },
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <LogoHeader size="sm" />
        <span className="text-xs text-muted-foreground">sm</span>
      </div>
      <div className="flex flex-col gap-2">
        <LogoHeader size="default" />
        <span className="text-xs text-muted-foreground">default</span>
      </div>
      <div className="flex flex-col gap-2">
        <LogoHeader size="lg" />
        <span className="text-xs text-muted-foreground">lg</span>
      </div>
      <div className="flex flex-col gap-2">
        <LogoHeader size="xl" />
        <span className="text-xs text-muted-foreground">xl</span>
      </div>
    </div>
  ),
};

export const WordmarkOnly: Story = {
  args: {
    size: 'lg',
    wordmarkOnly: true,
  },
};

export const IsologoOnly: Story = {
  args: {
    size: 'lg',
    isologoOnly: true,
  },
};

export const Monochrome: Story = {
  args: {
    size: 'lg',
    mono: true,
  },
};

export const MonochromeColors: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <LogoHeader size="lg" mono className="text-primary" />
        <span className="text-xs text-muted-foreground">Primary</span>
      </div>
      <div className="flex flex-col gap-2">
        <LogoHeader size="lg" mono className="text-muted-foreground" />
        <span className="text-xs text-muted-foreground">Muted</span>
      </div>
      <div className="flex flex-col gap-2">
        <LogoHeader size="lg" mono className="text-white" />
        <span className="text-xs text-muted-foreground">White</span>
      </div>
    </div>
  ),
};

export const InHeader: Story = {
  render: () => (
    <header className="flex items-center justify-between w-full max-w-4xl px-8 py-4 bg-card rounded-xl border border-border gap-12">
      <LogoHeader size="default" />
      <nav className="flex items-center gap-8 text-sm text-muted-foreground">
        <a href="#" className="hover:text-foreground">Products</a>
        <a href="#" className="hover:text-foreground">About</a>
        <a href="#" className="hover:text-foreground">Contact</a>
      </nav>
    </header>
  ),
};

export const ThemeAdaptive: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <LogoHeader size="lg" />
      <p className="text-xs text-muted-foreground">
        El wordmark usa text-foreground y se adapta automáticamente al tema activo.
        Cambia el tema en Storybook para ver el comportamiento.
      </p>
    </div>
  ),
};

// Standalone Wordmark stories
export const StandaloneWordmark: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Wordmark className="h-6" />
        <span className="text-xs text-muted-foreground">h-6</span>
      </div>
      <div className="flex flex-col gap-2">
        <Wordmark className="h-8" />
        <span className="text-xs text-muted-foreground">h-8</span>
      </div>
      <div className="flex flex-col gap-2">
        <Wordmark className="h-12" />
        <span className="text-xs text-muted-foreground">h-12</span>
      </div>
    </div>
  ),
};

export const WordmarkBranded: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Wordmark className="h-10 text-primary" />
      <span className="text-xs text-muted-foreground">Wordmark in brand primary color</span>
    </div>
  ),
};
