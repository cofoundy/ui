import type { StoryObj, Meta } from "@storybook/react";
import { HorizontalBar } from "../../components/analytics/HorizontalBar";

const channelData = [
  { label: "WhatsApp", value: 312, color: "var(--channel-whatsapp)" },
  { label: "Telegram", value: 84, color: "var(--channel-telegram)" },
  { label: "Instagram", value: 156, color: "var(--channel-instagram)" },
  { label: "Email", value: 43, color: "var(--channel-email)" },
];

const meta: Meta<typeof HorizontalBar> = {
  title: "Analytics/HorizontalBar",
  component: HorizontalBar,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof HorizontalBar>;

export const ChannelBreakdown: Story = {
  name: "Canales",
  args: { items: channelData, showCounts: true, animate: true },
};

export const SingleChannel: Story = {
  name: "Un canal",
  args: {
    items: [{ label: "WhatsApp", value: 312, color: "var(--channel-whatsapp)" }],
    showCounts: true,
  },
};

export const NoCounts: Story = {
  name: "Sin conteo",
  args: { items: channelData, showCounts: false, animate: true },
};
