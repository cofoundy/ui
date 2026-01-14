import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Toast } from '../../components/ui/toast';
import { Button } from '../../components/ui/button';

const meta: Meta<typeof Toast> = {
  title: 'UI/Toast',
  component: Toast,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['success', 'error', 'warning', 'info'],
      description: 'The visual style of the toast',
    },
    message: {
      control: 'text',
      description: 'The message to display',
    },
    duration: {
      control: 'number',
      description: 'Auto-dismiss duration in milliseconds',
    },
  },
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof Toast>;

export const Success: Story = {
  args: {
    variant: 'success',
    message: 'Operation completed successfully!',
    onClose: () => {},
  },
};

export const Error: Story = {
  args: {
    variant: 'error',
    message: 'Something went wrong. Please try again.',
    onClose: () => {},
  },
};

export const Warning: Story = {
  args: {
    variant: 'warning',
    message: 'Please review before continuing.',
    onClose: () => {},
  },
};

export const Info: Story = {
  args: {
    variant: 'info',
    message: 'New updates are available.',
    onClose: () => {},
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="relative h-[400px] w-full">
      <div className="absolute bottom-4 right-4 flex flex-col gap-2">
        <Toast variant="success" message="Success message" onClose={() => {}} />
      </div>
      <div className="absolute bottom-20 right-4 flex flex-col gap-2">
        <Toast variant="error" message="Error message" onClose={() => {}} />
      </div>
      <div className="absolute bottom-36 right-4 flex flex-col gap-2">
        <Toast variant="warning" message="Warning message" onClose={() => {}} />
      </div>
      <div className="absolute bottom-52 right-4 flex flex-col gap-2">
        <Toast variant="info" message="Info message" onClose={() => {}} />
      </div>
    </div>
  ),
};

const InteractiveDemo = () => {
  const [toasts, setToasts] = useState<Array<{ id: number; variant: 'success' | 'error' | 'warning' | 'info'; message: string }>>([]);

  const showToast = (variant: 'success' | 'error' | 'warning' | 'info', message: string) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, variant, message }]);
  };

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="p-8">
      <div className="flex gap-2 flex-wrap">
        <Button onClick={() => showToast('success', 'Action completed!')}>
          Show Success
        </Button>
        <Button variant="destructive" onClick={() => showToast('error', 'Something failed!')}>
          Show Error
        </Button>
        <Button variant="outline" onClick={() => showToast('warning', 'Please check this!')}>
          Show Warning
        </Button>
        <Button variant="secondary" onClick={() => showToast('info', 'Did you know?')}>
          Show Info
        </Button>
      </div>
      <div className="fixed bottom-4 right-4 flex flex-col gap-2">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            variant={toast.variant}
            message={toast.message}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </div>
  );
};

export const Interactive: Story = {
  render: () => <InteractiveDemo />,
};
