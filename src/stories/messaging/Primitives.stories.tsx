import type { Meta, StoryObj } from "@storybook/react";
import { MessageStatus } from "../../components/messaging/primitives/MessageStatus";
import { MessageTimestamp } from "../../components/messaging/primitives/MessageTimestamp";
import { AIBadge } from "../../components/messaging/indicators/AIBadge";
import { MessageBubble } from "../../components/messaging/primitives/MessageBubble";
import { MessageAvatar } from "../../components/messaging/primitives/MessageAvatar";
import { MessageContent } from "../../components/messaging/primitives/MessageContent";

// MessageStatus Stories
const statusMeta: Meta<typeof MessageStatus> = {
  title: "Messaging/Primitives/MessageStatus",
  component: MessageStatus,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="p-4 bg-[var(--chat-background)]">
        <Story />
      </div>
    ),
  ],
};

export default statusMeta;
type StatusStory = StoryObj<typeof MessageStatus>;

export const Queued: StatusStory = {
  args: { status: "queued" },
};

export const Sent: StatusStory = {
  args: { status: "sent" },
};

export const Delivered: StatusStory = {
  args: { status: "delivered" },
};

export const Read: StatusStory = {
  args: { status: "read" },
};

export const Failed: StatusStory = {
  args: { status: "failed" },
};

export const AllStatuses: StatusStory = {
  render: () => (
    <div className="flex items-center gap-6">
      <div className="flex items-center gap-2">
        <span className="text-sm text-[var(--chat-muted)]">Queued:</span>
        <MessageStatus status="queued" />
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-[var(--chat-muted)]">Sent:</span>
        <MessageStatus status="sent" />
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-[var(--chat-muted)]">Delivered:</span>
        <MessageStatus status="delivered" />
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-[var(--chat-muted)]">Read:</span>
        <MessageStatus status="read" />
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-[var(--chat-muted)]">Failed:</span>
        <MessageStatus status="failed" />
      </div>
    </div>
  ),
};

// MessageTimestamp - separate export
export const TimestampFormats: StatusStory = {
  render: () => {
    const now = new Date();
    const hourAgo = new Date(now.getTime() - 3600000);
    const yesterday = new Date(now.getTime() - 86400000);

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <span className="text-sm text-[var(--chat-muted)] w-20">Time:</span>
          <MessageTimestamp timestamp={now} format="time" />
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-[var(--chat-muted)] w-20">Relative:</span>
          <MessageTimestamp timestamp={hourAgo} format="relative" />
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-[var(--chat-muted)] w-20">Full:</span>
          <MessageTimestamp timestamp={yesterday} format="full" />
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-[var(--chat-muted)] w-20">Date:</span>
          <MessageTimestamp timestamp={yesterday} format="date" />
        </div>
      </div>
    );
  },
};

// AIBadge
export const AIBadgeFull: StatusStory = {
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <span className="text-sm text-[var(--chat-muted)]">Full:</span>
        <AIBadge variant="full" />
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-[var(--chat-muted)]">Icon only:</span>
        <AIBadge variant="icon-only" />
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-[var(--chat-muted)]">Custom label:</span>
        <AIBadge variant="full" label="Auto-reply" />
      </div>
    </div>
  ),
};

// MessageBubble variants
export const BubbleVariants: StatusStory = {
  render: () => (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-[var(--chat-muted)] mb-2">Widget variant:</p>
        <div className="space-y-2">
          <MessageBubble variant="widget" direction="inbound">
            <MessageContent content="Inbound widget message" format="text" />
          </MessageBubble>
          <MessageBubble variant="widget" direction="outbound">
            <MessageContent content="Outbound widget message" format="text" />
          </MessageBubble>
        </div>
      </div>
      <div>
        <p className="text-sm text-[var(--chat-muted)] mb-2">Inbox variant:</p>
        <div className="space-y-2">
          <MessageBubble variant="inbox" direction="inbound">
            <MessageContent content="Inbound inbox message" format="text" />
          </MessageBubble>
          <MessageBubble variant="inbox" direction="outbound">
            <MessageContent content="Outbound agent message" format="text" />
          </MessageBubble>
          <MessageBubble variant="inbox" direction="outbound" aiGenerated>
            <AIBadge variant="full" className="mb-1" />
            <MessageContent content="Outbound AI message" format="text" />
          </MessageBubble>
        </div>
      </div>
    </div>
  ),
};

// MessageAvatar
export const AvatarVariants: StatusStory = {
  render: () => (
    <div className="flex items-center gap-6">
      <div className="text-center">
        <MessageAvatar
          direction="inbound"
          sender={{ name: "John Doe", type: "customer" }}
        />
        <p className="text-xs text-[var(--chat-muted)] mt-1">Customer</p>
      </div>
      <div className="text-center">
        <MessageAvatar
          direction="outbound"
          sender={{ name: "Sarah", type: "agent" }}
        />
        <p className="text-xs text-[var(--chat-muted)] mt-1">Agent</p>
      </div>
      <div className="text-center">
        <MessageAvatar
          direction="outbound"
          sender={{ name: "AI", type: "ai" }}
        />
        <p className="text-xs text-[var(--chat-muted)] mt-1">AI</p>
      </div>
      <div className="text-center">
        <MessageAvatar
          direction="inbound"
          sender={{ name: "System", type: "system" }}
        />
        <p className="text-xs text-[var(--chat-muted)] mt-1">System</p>
      </div>
    </div>
  ),
};

// MessageContent
export const ContentFormats: StatusStory = {
  render: () => (
    <div className="space-y-6 max-w-md">
      <div>
        <p className="text-sm text-[var(--chat-muted)] mb-2">Plain text:</p>
        <div className="p-3 bg-[var(--chat-card-hover)] rounded-lg">
          <MessageContent
            content="This is plain text content.\nWith line breaks preserved."
            format="text"
          />
        </div>
      </div>
      <div>
        <p className="text-sm text-[var(--chat-muted)] mb-2">Markdown:</p>
        <div className="p-3 bg-[var(--chat-card-hover)] rounded-lg">
          <MessageContent
            content={`## Hello!

This is **bold** and *italic* text.

- Item 1
- Item 2

Check out [this link](https://example.com).`}
            format="markdown"
          />
        </div>
      </div>
    </div>
  ),
};
