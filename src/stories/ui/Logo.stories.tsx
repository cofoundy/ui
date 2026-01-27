import type { Meta, StoryObj } from '@storybook/react';
import { Logo } from '../../components/ui/logo';

const meta: Meta<typeof Logo> = {
  title: 'UI/Logo',
  component: Logo,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'default', 'lg', 'xl', '2xl'],
      description: 'The size of the logo',
    },
    mono: {
      control: 'boolean',
      description: 'Use monochrome version (inherits currentColor)',
    },
  },
  parameters: {
    docs: {
      description: {
        component: 'Cofoundy Isologo - 3D isometric cube design representing innovation and building.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Logo>;

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

export const XXLarge: Story = {
  args: {
    size: '2xl',
  },
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-end gap-6">
      <div className="flex flex-col items-center gap-2">
        <Logo size="sm" />
        <span className="text-xs text-muted-foreground">sm</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Logo size="default" />
        <span className="text-xs text-muted-foreground">default</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Logo size="lg" />
        <span className="text-xs text-muted-foreground">lg</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Logo size="xl" />
        <span className="text-xs text-muted-foreground">xl</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Logo size="2xl" />
        <span className="text-xs text-muted-foreground">2xl</span>
      </div>
    </div>
  ),
};

export const Monochrome: Story = {
  args: {
    size: 'xl',
    mono: true,
  },
};

export const MonochromeColors: Story = {
  render: () => (
    <div className="flex items-center gap-8">
      <div className="flex flex-col items-center gap-2">
        <Logo size="lg" mono className="text-primary" />
        <span className="text-xs text-muted-foreground">Primary</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Logo size="lg" mono className="text-muted-foreground" />
        <span className="text-xs text-muted-foreground">Muted</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Logo size="lg" mono className="text-white" />
        <span className="text-xs text-muted-foreground">White</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Logo size="lg" mono className="text-green-500" />
        <span className="text-xs text-muted-foreground">Green</span>
      </div>
    </div>
  ),
};

export const WithBrandName: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Logo size="lg" />
      <div>
        <h1 className="text-2xl font-semibold text-foreground" style={{ fontFamily: "var(--font-brand)", letterSpacing: "-0.02em" }}>Cofoundy</h1>
        <p className="text-sm text-muted-foreground">Build with AI</p>
      </div>
    </div>
  ),
};

export const InHeader: Story = {
  render: () => (
    <header className="flex items-center justify-between w-full max-w-4xl px-6 py-4 bg-card rounded-xl border border-border">
      <div className="flex items-center gap-3">
        <Logo size="default" />
        <span className="text-lg font-semibold text-foreground" style={{ fontFamily: "var(--font-brand)", letterSpacing: "-0.02em" }}>Cofoundy</span>
      </div>
      <nav className="flex items-center gap-6 text-sm text-muted-foreground">
        <a href="#" className="hover:text-foreground">Products</a>
        <a href="#" className="hover:text-foreground">About</a>
        <a href="#" className="hover:text-foreground">Contact</a>
      </nav>
    </header>
  ),
};

export const LoadingWithLogo: Story = {
  render: () => (
    <div className="flex flex-col items-center gap-4 p-8">
      <Logo size="xl" className="animate-pulse" />
      <p className="text-sm text-muted-foreground">Loading Cofoundy...</p>
    </div>
  ),
};
