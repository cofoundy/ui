import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { ChatInput } from '../../components/chat-widget/ChatInput';

const meta: Meta<typeof ChatInput> = {
  title: 'Chat/ChatInput',
  component: ChatInput,
  tags: ['autodocs'],
  args: {
    onSendMessage: fn(),
  },
  argTypes: {
    disabled: {
      control: 'boolean',
      description: 'Whether the input is disabled',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text',
    },
  },
  decorators: [
    (Story) => (
      <div className="w-[400px] bg-[var(--chat-background)] rounded-xl p-4">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ChatInput>;

export const Default: Story = {
  args: {
    placeholder: 'Escribe tu mensaje...',
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    placeholder: 'Chat no disponible',
  },
};

export const Connecting: Story = {
  args: {
    disabled: true,
    placeholder: 'Conectando...',
  },
};

export const Processing: Story = {
  args: {
    disabled: true,
    placeholder: 'Procesando...',
  },
};

export const CustomPlaceholder: Story = {
  args: {
    placeholder: 'Preguntame lo que quieras...',
  },
};

export const AllStates: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-xs text-white/50 mb-2">Default</p>
        <ChatInput onSendMessage={fn()} placeholder="Escribe tu mensaje..." />
      </div>
      <div>
        <p className="text-xs text-white/50 mb-2">Disabled</p>
        <ChatInput onSendMessage={fn()} disabled placeholder="Chat no disponible" />
      </div>
      <div>
        <p className="text-xs text-white/50 mb-2">Connecting</p>
        <ChatInput onSendMessage={fn()} disabled placeholder="Conectando..." />
      </div>
    </div>
  ),
};
