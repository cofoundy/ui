import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from '../../components/ui/badge';

const meta: Meta<typeof Badge> = {
  title: 'UI/Badge',
  component: Badge,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: [
        'default',
        'secondary',
        'success',
        'warning',
        'error',
        'info',
        'outline',
        'telegram',
        'whatsapp',
        'email',
        'webchat',
        'instagram',
        'messenger',
        'sms',
      ],
      description: 'The visual style of the badge',
    },
    size: {
      control: 'select',
      options: ['sm', 'default', 'lg'],
      description: 'The size of the badge',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Default: Story = {
  args: {
    children: 'Badge',
    variant: 'default',
  },
};

export const Secondary: Story = {
  args: {
    children: 'Secondary',
    variant: 'secondary',
  },
};

export const Success: Story = {
  args: {
    children: 'Success',
    variant: 'success',
  },
};

export const Warning: Story = {
  args: {
    children: 'Warning',
    variant: 'warning',
  },
};

export const Error: Story = {
  args: {
    children: 'Error',
    variant: 'error',
  },
};

export const Info: Story = {
  args: {
    children: 'Info',
    variant: 'info',
  },
};

export const Outline: Story = {
  args: {
    children: 'Outline',
    variant: 'outline',
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div>
        <h4 className="text-sm font-medium text-foreground mb-2">Status Variants</h4>
        <div className="flex gap-2 flex-wrap">
          <Badge variant="default">Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="success">Success</Badge>
          <Badge variant="warning">Warning</Badge>
          <Badge variant="error">Error</Badge>
          <Badge variant="info">Info</Badge>
          <Badge variant="outline">Outline</Badge>
        </div>
      </div>
    </div>
  ),
};

export const ChannelVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <h4 className="text-sm font-medium text-foreground mb-2">Channel Variants</h4>
      <div className="flex gap-2 flex-wrap">
        <Badge variant="telegram">Telegram</Badge>
        <Badge variant="whatsapp">WhatsApp</Badge>
        <Badge variant="email">Email</Badge>
        <Badge variant="webchat">Web Chat</Badge>
        <Badge variant="instagram">Instagram</Badge>
        <Badge variant="messenger">Messenger</Badge>
        <Badge variant="sms">SMS</Badge>
      </div>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Badge size="sm">Small</Badge>
      <Badge size="default">Default</Badge>
      <Badge size="lg">Large</Badge>
    </div>
  ),
};

export const InContext: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <span className="text-sm text-foreground">Conversation Status:</span>
        <Badge variant="success">Active</Badge>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-foreground">Channel:</span>
        <Badge variant="whatsapp">WhatsApp</Badge>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-foreground">Priority:</span>
        <Badge variant="error">High</Badge>
      </div>
    </div>
  ),
};

export const ConversationList: Story = {
  render: () => (
    <div className="w-80 bg-card rounded-xl border border-border">
      {[
        { name: 'John Doe', channel: 'whatsapp', status: 'Active', unread: 3 },
        { name: 'Jane Smith', channel: 'telegram', status: 'Waiting', unread: 0 },
        { name: 'Bob Wilson', channel: 'email', status: 'Closed', unread: 1 },
      ].map((conv, i) => (
        <div
          key={i}
          className="flex items-center justify-between p-3 border-b border-border last:border-0"
        >
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-foreground">{conv.name}</span>
            <Badge variant={conv.channel as any} size="sm">
              {conv.channel}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            {conv.unread > 0 && (
              <Badge variant="error" size="sm">
                {conv.unread}
              </Badge>
            )}
          </div>
        </div>
      ))}
    </div>
  ),
};
