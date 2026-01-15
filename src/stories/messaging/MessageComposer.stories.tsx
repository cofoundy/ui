import type { Meta, StoryObj } from "@storybook/react";
import { MessageComposer } from "../../components/messaging/inputs/MessageComposer";
import { Calendar, Phone, XCircle } from "lucide-react";

const meta: Meta<typeof MessageComposer> = {
  title: "Messaging/MessageComposer",
  component: MessageComposer,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="w-[500px] bg-[var(--chat-background)]">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    disabled: { control: "boolean" },
    showAttachment: { control: "boolean" },
    showEmoji: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof MessageComposer>;

export const Default: Story = {
  args: {
    onSend: (message) => console.log("Send:", message),
    placeholder: "Type a message...",
  },
};

export const WithQuickActions: Story = {
  args: {
    onSend: (message) => console.log("Send:", message),
    quickActions: [
      {
        id: "schedule",
        label: "/schedule",
        icon: <Calendar className="w-3 h-3" />,
        onClick: () => console.log("Schedule clicked"),
      },
      {
        id: "call",
        label: "/call",
        icon: <Phone className="w-3 h-3" />,
        onClick: () => console.log("Call clicked"),
      },
      {
        id: "close",
        label: "/close",
        icon: <XCircle className="w-3 h-3" />,
        onClick: () => console.log("Close clicked"),
      },
    ],
  },
};

export const WithAttachment: Story = {
  args: {
    onSend: (message) => console.log("Send:", message),
    onAttach: (files) => console.log("Attach:", files),
    showAttachment: true,
  },
};

export const WithEmoji: Story = {
  args: {
    onSend: (message) => console.log("Send:", message),
    showEmoji: true,
  },
};

export const FullFeatured: Story = {
  args: {
    onSend: (message) => console.log("Send:", message),
    onAttach: (files) => console.log("Attach:", files),
    showAttachment: true,
    showEmoji: true,
    quickActions: [
      {
        id: "schedule",
        label: "/schedule",
        icon: <Calendar className="w-3 h-3" />,
        onClick: () => console.log("Schedule clicked"),
      },
      {
        id: "call",
        label: "/call",
        icon: <Phone className="w-3 h-3" />,
        onClick: () => console.log("Call clicked"),
      },
    ],
    placeholder: "Type your message or use quick actions...",
  },
};

export const Disabled: Story = {
  args: {
    onSend: (message) => console.log("Send:", message),
    disabled: true,
    placeholder: "Conversation closed",
  },
};

export const CustomPlaceholder: Story = {
  args: {
    onSend: (message) => console.log("Send:", message),
    placeholder: "Reply to customer...",
  },
};
