import type { Meta, StoryObj } from '@storybook/react';
import { ChatHeader } from '../../components/chat-widget/ChatHeader';

const meta: Meta<typeof ChatHeader> = {
  title: 'Chat/ChatHeader',
  component: ChatHeader,
  tags: ['autodocs'],
  argTypes: {
    connectionStatus: {
      control: 'select',
      options: ['connecting', 'connected', 'disconnected', 'error'],
      description: 'WebSocket connection status',
    },
    brandName: {
      control: 'text',
      description: 'Brand name to display',
    },
    brandSubtitle: {
      control: 'text',
      description: 'Subtitle below brand name',
    },
  },
  decorators: [
    (Story) => (
      <div className="w-[400px] bg-[var(--chat-background)] rounded-xl overflow-hidden">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ChatHeader>;

export const Connected: Story = {
  args: {
    connectionStatus: 'connected',
    brandName: 'Cofoundy',
    brandSubtitle: 'Consultoria de Software & IA',
  },
};

export const Connecting: Story = {
  args: {
    connectionStatus: 'connecting',
    brandName: 'Cofoundy',
    brandSubtitle: 'Consultoria de Software & IA',
  },
};

export const Disconnected: Story = {
  args: {
    connectionStatus: 'disconnected',
    brandName: 'Cofoundy',
    brandSubtitle: 'Consultoria de Software & IA',
  },
};

export const Error: Story = {
  args: {
    connectionStatus: 'error',
    brandName: 'Cofoundy',
    brandSubtitle: 'Consultoria de Software & IA',
  },
};

export const WithoutSubtitle: Story = {
  args: {
    connectionStatus: 'connected',
    brandName: 'Cofoundy',
  },
};

export const AllStatuses: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="bg-[var(--chat-background)] rounded-xl overflow-hidden">
        <ChatHeader connectionStatus="connected" brandName="Connected" brandSubtitle="Online" />
      </div>
      <div className="bg-[var(--chat-background)] rounded-xl overflow-hidden">
        <ChatHeader connectionStatus="connecting" brandName="Connecting" brandSubtitle="Please wait..." />
      </div>
      <div className="bg-[var(--chat-background)] rounded-xl overflow-hidden">
        <ChatHeader connectionStatus="disconnected" brandName="Disconnected" brandSubtitle="Offline" />
      </div>
      <div className="bg-[var(--chat-background)] rounded-xl overflow-hidden">
        <ChatHeader connectionStatus="error" brandName="Error" brandSubtitle="Connection failed" />
      </div>
    </div>
  ),
};
