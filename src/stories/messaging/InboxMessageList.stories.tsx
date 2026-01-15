import type { Meta, StoryObj } from "@storybook/react";
import { InboxMessageList } from "../../components/messaging/composed/InboxMessageList";
import type { UniversalMessage } from "../../types/message";

const meta: Meta<typeof InboxMessageList> = {
  title: "Messaging/InboxMessageList",
  component: InboxMessageList,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="w-[500px] h-[600px] bg-[var(--chat-background)]">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof InboxMessageList>;

// Helper to create messages at different times
const createMessage = (
  id: string,
  content: string,
  direction: "inbound" | "outbound",
  daysAgo: number = 0,
  hoursAgo: number = 0
): UniversalMessage => {
  const timestamp = new Date();
  timestamp.setDate(timestamp.getDate() - daysAgo);
  timestamp.setHours(timestamp.getHours() - hoursAgo);

  return {
    id,
    timestamp,
    content,
    contentType: "text",
    direction,
    sender: {
      name: direction === "inbound" ? "John Customer" : "Sarah Agent",
      type: direction === "inbound" ? "customer" : "agent",
    },
    deliveryStatus: "delivered",
    aiGenerated: false,
  };
};

const todayMessages: UniversalMessage[] = [
  createMessage("1", "Hi, I need help with my order", "inbound", 0, 2),
  createMessage("2", "Hello! I'd be happy to help. What's your order number?", "outbound", 0, 1.5),
  createMessage("3", "It's #12345", "inbound", 0, 1),
  createMessage("4", "Thank you! Let me look that up for you.", "outbound", 0, 0.5),
];

const yesterdayMessages: UniversalMessage[] = [
  createMessage("5", "Is anyone there?", "inbound", 1, 5),
  createMessage("6", "Hi! Yes, how can I help you today?", "outbound", 1, 4),
];

const olderMessages: UniversalMessage[] = [
  createMessage("7", "Thanks for your help last week!", "inbound", 3, 0),
  createMessage("8", "You're welcome! Let us know if you need anything else.", "outbound", 3, 0),
];

export const Default: Story = {
  args: {
    messages: todayMessages,
  },
};

export const WithDateGroups: Story = {
  args: {
    messages: [...olderMessages, ...yesterdayMessages, ...todayMessages],
  },
};

export const Loading: Story = {
  args: {
    messages: [],
    loading: true,
  },
};

export const Empty: Story = {
  args: {
    messages: [],
    emptyMessage: "No messages in this conversation yet",
  },
};

export const LongConversation: Story = {
  args: {
    messages: [
      ...Array.from({ length: 20 }, (_, i) =>
        createMessage(
          `msg-${i}`,
          i % 2 === 0 ? `Customer message ${i + 1}` : `Agent response ${i + 1}`,
          i % 2 === 0 ? "inbound" : "outbound",
          0,
          20 - i
        )
      ),
    ],
  },
};
