import type { Meta, StoryObj } from '@storybook/react';
import { TypingIndicator } from '../../components/chat-widget/TypingIndicator';

const meta: Meta<typeof TypingIndicator> = {
  title: 'Chat/TypingIndicator',
  component: TypingIndicator,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="w-[400px] p-4 bg-[var(--chat-background)]">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof TypingIndicator>;

export const Default: Story = {};

export const InContext: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <div className="bg-[var(--chat-primary)] text-white px-4 py-2 rounded-2xl rounded-br-md max-w-[80%]">
          Hola, necesito ayuda
        </div>
      </div>
      <TypingIndicator />
    </div>
  ),
};
