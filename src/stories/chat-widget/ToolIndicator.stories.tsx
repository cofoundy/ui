import type { Meta, StoryObj } from '@storybook/react';
import { ToolIndicator } from '../../components/chat-widget/ToolIndicator';
import type { Message } from '../../types';

const meta: Meta<typeof ToolIndicator> = {
  title: 'Chat/ToolIndicator',
  component: ToolIndicator,
  tags: ['autodocs'],
  argTypes: {
    compact: {
      control: 'boolean',
      description: 'Show compact version',
    },
  },
  decorators: [
    (Story) => (
      <div className="w-[400px] p-4 bg-[var(--chat-background)]">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ToolIndicator>;

const runningTool: Message = {
  id: 'tool-1',
  role: 'tool',
  content: 'Consultando calendario',
  timestamp: new Date(),
  toolName: 'check_availability',
  toolStatus: 'running',
};

const successTool: Message = {
  id: 'tool-2',
  role: 'tool',
  content: 'Horarios encontrados',
  timestamp: new Date(),
  toolName: 'check_availability',
  toolStatus: 'success',
};

const errorTool: Message = {
  id: 'tool-3',
  role: 'tool',
  content: 'Error de conexión',
  timestamp: new Date(),
  toolName: 'check_availability',
  toolStatus: 'error',
};

export const Running: Story = {
  args: {
    message: runningTool,
  },
};

export const Success: Story = {
  args: {
    message: successTool,
  },
};

export const Error: Story = {
  args: {
    message: errorTool,
  },
};

export const Compact: Story = {
  args: {
    message: runningTool,
    compact: true,
  },
};

export const AllStatuses: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-xs text-white/50 mb-2">Running</p>
        <ToolIndicator message={runningTool} />
      </div>
      <div>
        <p className="text-xs text-white/50 mb-2">Success</p>
        <ToolIndicator message={successTool} />
      </div>
      <div>
        <p className="text-xs text-white/50 mb-2">Error</p>
        <ToolIndicator message={errorTool} />
      </div>
    </div>
  ),
};
