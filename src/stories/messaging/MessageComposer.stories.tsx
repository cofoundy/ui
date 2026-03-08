import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { MessageComposer } from "../../components/messaging/inputs/MessageComposer";
import { MessageSquareText, Smile, StickyNote, Reply } from "lucide-react";

const meta: Meta<typeof MessageComposer> = {
  title: "Messaging/MessageComposer",
  component: MessageComposer,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="w-[500px] bg-[var(--chat-background)] p-4">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof MessageComposer>;

export const Default: Story = {
  args: {
    onSend: (message) => console.log("Send:", message),
    placeholder: "Type a message...",
  },
};

export const WithAttachment: Story = {
  args: {
    onSend: (message) => console.log("Send:", message),
    onAttach: (files) => console.log("Attach:", files),
    showAttachment: true,
  },
};

export const WithToolbarItems: Story = {
  args: {
    onSend: (message) => console.log("Send:", message),
    onAttach: (files) => console.log("Attach:", files),
    showAttachment: true,
    toolbarItems: [
      {
        id: "emoji",
        icon: <Smile className="w-[18px] h-[18px]" />,
        label: "Emojis",
        onClick: () => console.log("Emoji clicked"),
      },
      {
        id: "template",
        icon: <MessageSquareText className="w-[18px] h-[18px]" />,
        label: "WhatsApp Template",
        onClick: () => console.log("Template clicked"),
        hideInModes: ["note"],
      },
    ],
  },
};

/** Intercom/Front pattern: tabs to switch between Reply and Internal Note */
export const WithModeTabs = () => {
  const [mode, setMode] = useState("reply");

  return (
    <MessageComposer
      onSend={(msg) => console.log(`[${mode}] Send:`, msg)}
      onAttach={(files) => console.log("Attach:", files)}
      showAttachment={true}
      modes={[
        {
          id: "reply",
          label: "Responder",
          icon: <Reply className="w-3.5 h-3.5" />,
          placeholder: "Escribe un mensaje...",
          sendLabel: "Enviar",
        },
        {
          id: "note",
          label: "Nota interna",
          icon: <StickyNote className="w-3.5 h-3.5" />,
          placeholder: "Escribe una nota interna...",
          sendLabel: "Añadir",
          activeClass: "text-amber-400 border-amber-400",
        },
      ]}
      activeMode={mode}
      onModeChange={setMode}
      toolbarItems={[
        {
          id: "emoji",
          icon: <Smile className="w-[18px] h-[18px]" />,
          label: "Emojis",
          onClick: () => console.log("Emoji"),
        },
        {
          id: "template",
          icon: <MessageSquareText className="w-[18px] h-[18px]" />,
          label: "Plantilla WhatsApp",
          onClick: () => console.log("Template"),
          hideInModes: ["note"],
        },
      ]}
    />
  );
};

export const Disabled: Story = {
  args: {
    onSend: (message) => console.log("Send:", message),
    disabled: true,
    placeholder: "Conversation closed",
  },
};
