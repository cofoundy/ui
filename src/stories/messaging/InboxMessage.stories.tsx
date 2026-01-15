import type { Meta, StoryObj } from "@storybook/react";
import { InboxMessage } from "../../components/messaging/composed/InboxMessage";
import type { UniversalMessage } from "../../types/message";

const meta: Meta<typeof InboxMessage> = {
  title: "Messaging/InboxMessage",
  component: InboxMessage,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="w-[500px] p-4 bg-[var(--chat-background)]">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    showAvatar: { control: "boolean" },
    showDeliveryStatus: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof InboxMessage>;

const inboundMessage: UniversalMessage = {
  id: "1",
  timestamp: new Date(),
  content: "Hi, I need help with scheduling a meeting",
  contentType: "text",
  direction: "inbound",
  sender: {
    name: "John Doe",
    type: "customer",
  },
  channel: "whatsapp",
  deliveryStatus: "delivered",
  aiGenerated: false,
};

const outboundAgentMessage: UniversalMessage = {
  id: "2",
  timestamp: new Date(),
  content: "Hello John! I'd be happy to help you schedule a meeting. What day works best for you?",
  contentType: "text",
  direction: "outbound",
  sender: {
    name: "Sarah Agent",
    type: "agent",
  },
  deliveryStatus: "read",
  aiGenerated: false,
};

const outboundAIMessage: UniversalMessage = {
  id: "3",
  timestamp: new Date(),
  content: "I can help you schedule a meeting! Here are some available slots for this week. Would any of these work for you?",
  contentType: "text",
  direction: "outbound",
  sender: {
    name: "AI Assistant",
    type: "ai",
  },
  deliveryStatus: "delivered",
  aiGenerated: true,
};

const messageWithMedia: UniversalMessage = {
  id: "4",
  timestamp: new Date(),
  content: "Here's the document you requested",
  contentType: "text",
  direction: "inbound",
  sender: {
    name: "John Doe",
    type: "customer",
  },
  channel: "telegram",
  deliveryStatus: "delivered",
  aiGenerated: false,
  media: [
    {
      type: "document",
      url: "#",
      filename: "contract.pdf",
      mimeType: "application/pdf",
    },
  ],
};

export const InboundCustomer: Story = {
  args: {
    message: inboundMessage,
  },
};

export const OutboundAgent: Story = {
  args: {
    message: outboundAgentMessage,
  },
};

export const OutboundAI: Story = {
  args: {
    message: outboundAIMessage,
  },
};

export const WithMediaAttachment: Story = {
  args: {
    message: messageWithMedia,
  },
};

export const DeliveryStatuses: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <InboxMessage
        message={{ ...outboundAgentMessage, id: "s1", deliveryStatus: "queued", content: "Queued message..." }}
      />
      <InboxMessage
        message={{ ...outboundAgentMessage, id: "s2", deliveryStatus: "sent", content: "Sent message ✓" }}
      />
      <InboxMessage
        message={{ ...outboundAgentMessage, id: "s3", deliveryStatus: "delivered", content: "Delivered message ✓✓" }}
      />
      <InboxMessage
        message={{ ...outboundAgentMessage, id: "s4", deliveryStatus: "read", content: "Read message ✓✓ (blue)" }}
      />
      <InboxMessage
        message={{ ...outboundAgentMessage, id: "s5", deliveryStatus: "failed", content: "Failed message !" }}
      />
    </div>
  ),
};

export const Conversation: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <InboxMessage message={inboundMessage} />
      <InboxMessage message={outboundAIMessage} />
      <InboxMessage
        message={{
          ...inboundMessage,
          id: "5",
          content: "Thursday at 2pm would be perfect!",
        }}
      />
      <InboxMessage message={outboundAgentMessage} />
    </div>
  ),
};
