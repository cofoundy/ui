import type { Meta, StoryObj } from '@storybook/react';
import { Spinner } from '../../components/ui/spinner';

const meta: Meta<typeof Spinner> = {
  title: 'UI/Spinner',
  component: Spinner,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'default', 'lg', 'xl'],
      description: 'The size of the spinner',
    },
  },
  parameters: {
    docs: {
      description: {
        component: 'Cofoundy branded folding cube spinner with 3D animation.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Spinner>;

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
    <div className="flex items-center gap-8">
      <div className="flex flex-col items-center gap-3">
        <Spinner size="sm" />
        <span className="text-xs text-muted-foreground">sm (20px)</span>
      </div>
      <div className="flex flex-col items-center gap-3">
        <Spinner size="default" />
        <span className="text-xs text-muted-foreground">default (32px)</span>
      </div>
      <div className="flex flex-col items-center gap-3">
        <Spinner size="lg" />
        <span className="text-xs text-muted-foreground">lg (48px)</span>
      </div>
      <div className="flex flex-col items-center gap-3">
        <Spinner size="xl" />
        <span className="text-xs text-muted-foreground">xl (64px)</span>
      </div>
    </div>
  ),
};

export const LoadingState: Story = {
  render: () => (
    <div className="flex flex-col items-center gap-4 p-8 rounded-xl bg-card border border-border">
      <Spinner size="lg" />
      <p className="text-sm text-muted-foreground">Cargando...</p>
    </div>
  ),
};

export const InCard: Story = {
  render: () => (
    <div className="w-64 h-48 flex flex-col items-center justify-center gap-4 rounded-xl bg-card border border-border">
      <Spinner size="default" />
      <div className="text-center">
        <p className="text-sm font-medium text-foreground">Procesando</p>
        <p className="text-xs text-muted-foreground">Por favor espere...</p>
      </div>
    </div>
  ),
};

export const FullPage: Story = {
  render: () => (
    <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        <Spinner size="xl" />
        <p className="text-lg font-medium text-foreground">Cargando aplicación</p>
      </div>
    </div>
  ),
  parameters: {
    layout: 'fullscreen',
  },
};
