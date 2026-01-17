import type { Meta, StoryObj } from "@storybook/react";
import { ChannelBadge } from "../../components/ui/channel-badge";

const meta: Meta<typeof ChannelBadge> = {
  title: "UI/ChannelBadge",
  component: ChannelBadge,
  tags: ["autodocs"],
  argTypes: {
    channel: {
      control: "select",
      options: [
        "whatsapp",
        "telegram",
        "email",
        "webchat",
        "instagram",
        "messenger",
        "sms",
      ],
      description: "The channel type to display",
    },
    size: {
      control: "select",
      options: ["sm", "default", "lg"],
      description: "The size of the badge",
    },
    showLabel: {
      control: "boolean",
      description: "Show the channel label alongside the icon",
    },
  },
};

export default meta;
type Story = StoryObj<typeof ChannelBadge>;

export const Default: Story = {
  args: {
    channel: "whatsapp",
  },
};

export const WithLabel: Story = {
  args: {
    channel: "whatsapp",
    showLabel: true,
  },
};

export const AllChannelsIconOnly: Story = {
  name: "All Channels (Icon Only)",
  render: () => (
    <div className="flex flex-col gap-6">
      <div>
        <h4 className="text-sm font-medium text-foreground mb-3">
          Icon Only - Default Size
        </h4>
        <div className="flex gap-3 flex-wrap items-center">
          <ChannelBadge channel="whatsapp" />
          <ChannelBadge channel="telegram" />
          <ChannelBadge channel="email" />
          <ChannelBadge channel="webchat" />
          <ChannelBadge channel="instagram" />
          <ChannelBadge channel="messenger" />
          <ChannelBadge channel="sms" />
        </div>
      </div>
    </div>
  ),
};

export const AllChannelsWithLabels: Story = {
  name: "All Channels (With Labels)",
  render: () => (
    <div className="flex flex-col gap-6">
      <div>
        <h4 className="text-sm font-medium text-foreground mb-3">
          With Labels - Default Size
        </h4>
        <div className="flex gap-2 flex-wrap">
          <ChannelBadge channel="whatsapp" showLabel />
          <ChannelBadge channel="telegram" showLabel />
          <ChannelBadge channel="email" showLabel />
          <ChannelBadge channel="webchat" showLabel />
          <ChannelBadge channel="instagram" showLabel />
          <ChannelBadge channel="messenger" showLabel />
          <ChannelBadge channel="sms" showLabel />
        </div>
      </div>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-8">
      <div>
        <h4 className="text-sm font-medium text-foreground mb-3">
          Icon Only - All Sizes
        </h4>
        <div className="flex gap-4 items-center">
          <div className="flex flex-col items-center gap-2">
            <ChannelBadge channel="whatsapp" size="sm" />
            <span className="text-xs text-muted">sm</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <ChannelBadge channel="whatsapp" size="default" />
            <span className="text-xs text-muted">default</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <ChannelBadge channel="whatsapp" size="lg" />
            <span className="text-xs text-muted">lg</span>
          </div>
        </div>
      </div>
      <div>
        <h4 className="text-sm font-medium text-foreground mb-3">
          With Labels - All Sizes
        </h4>
        <div className="flex gap-4 items-center">
          <ChannelBadge channel="telegram" size="sm" showLabel />
          <ChannelBadge channel="telegram" size="default" showLabel />
          <ChannelBadge channel="telegram" size="lg" showLabel />
        </div>
      </div>
    </div>
  ),
};

export const InConversationList: Story = {
  name: "In Conversation List",
  render: () => (
    <div className="w-80 bg-card rounded-xl border border-border">
      {[
        { name: "John Doe", channel: "whatsapp", message: "Hey, quick question..." },
        { name: "Jane Smith", channel: "telegram", message: "Thanks for the update!" },
        { name: "support@acme.com", channel: "email", message: "Re: Invoice #1234" },
        { name: "Bob Wilson", channel: "instagram", message: "Loved your post!" },
        { name: "Customer", channel: "webchat", message: "Need help with order" },
      ].map((conv, i) => (
        <div
          key={i}
          className="flex items-center gap-3 p-3 border-b border-border last:border-0 hover:bg-accent/50 cursor-pointer"
        >
          <ChannelBadge channel={conv.channel} size="default" />
          <div className="flex flex-col gap-0.5 min-w-0 flex-1">
            <span className="text-sm font-medium text-foreground truncate">
              {conv.name}
            </span>
            <span className="text-xs text-muted truncate">{conv.message}</span>
          </div>
        </div>
      ))}
    </div>
  ),
};

export const InMessageHeader: Story = {
  name: "In Message Header",
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 p-3 bg-card rounded-lg border border-border">
        <div className="size-10 rounded-full bg-accent flex items-center justify-center text-foreground font-medium">
          JD
        </div>
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">John Doe</span>
            <ChannelBadge channel="whatsapp" size="sm" />
          </div>
          <span className="text-xs text-muted">+1 (555) 123-4567</span>
        </div>
      </div>
      <div className="flex items-center gap-2 p-3 bg-card rounded-lg border border-border">
        <div className="size-10 rounded-full bg-accent flex items-center justify-center text-foreground font-medium">
          JS
        </div>
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">Jane Smith</span>
            <ChannelBadge channel="email" size="sm" showLabel />
          </div>
          <span className="text-xs text-muted">jane@example.com</span>
        </div>
      </div>
    </div>
  ),
};

export const ChannelFilter: Story = {
  name: "Channel Filter",
  render: () => (
    <div className="flex flex-col gap-4">
      <h4 className="text-sm font-medium text-foreground">Filter by Channel</h4>
      <div className="flex gap-2 flex-wrap">
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent text-foreground text-sm hover:bg-accent/80 transition-colors">
          All
        </button>
        <ChannelBadge
          channel="whatsapp"
          showLabel
          className="cursor-pointer hover:opacity-80 transition-opacity"
        />
        <ChannelBadge
          channel="telegram"
          showLabel
          className="cursor-pointer hover:opacity-80 transition-opacity"
        />
        <ChannelBadge
          channel="email"
          showLabel
          className="cursor-pointer hover:opacity-80 transition-opacity"
        />
        <ChannelBadge
          channel="instagram"
          showLabel
          className="cursor-pointer hover:opacity-80 transition-opacity"
        />
      </div>
    </div>
  ),
};

export const ComparisonWithTextBadge: Story = {
  name: "Comparison: Icons vs Text",
  render: () => (
    <div className="flex flex-col gap-6">
      <div>
        <h4 className="text-sm font-medium text-foreground mb-3">
          With Icons (ChannelBadge)
        </h4>
        <div className="flex gap-2 flex-wrap">
          <ChannelBadge channel="whatsapp" showLabel />
          <ChannelBadge channel="telegram" showLabel />
          <ChannelBadge channel="email" showLabel />
        </div>
      </div>
      <div>
        <h4 className="text-sm font-medium text-foreground mb-3">
          Icon Only - Compact
        </h4>
        <div className="flex gap-2">
          <ChannelBadge channel="whatsapp" />
          <ChannelBadge channel="telegram" />
          <ChannelBadge channel="email" />
          <ChannelBadge channel="instagram" />
          <ChannelBadge channel="messenger" />
          <ChannelBadge channel="sms" />
          <ChannelBadge channel="webchat" />
        </div>
      </div>
    </div>
  ),
};
