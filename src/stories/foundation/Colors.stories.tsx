import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta = {
  title: "Foundation/Colors",
  parameters: {
    layout: "padded",
  },
};

export default meta;
type Story = StoryObj;

const ColorSwatch = ({
  name,
  value,
  cssVar,
  textColor = "white",
}: {
  name: string;
  value: string;
  cssVar?: string;
  textColor?: string;
}) => (
  <div className="flex flex-col">
    <div
      className="w-24 h-24 rounded-lg shadow-md flex items-end p-2"
      style={{ backgroundColor: value, color: textColor }}
    >
      <span className="text-xs font-mono opacity-80">{value}</span>
    </div>
    <span className="text-sm font-medium mt-2">{name}</span>
    {cssVar && (
      <span className="text-xs text-gray-500 font-mono">{cssVar}</span>
    )}
  </div>
);

const ColorRow = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className="mb-8">
    <h3 className="text-lg font-semibold mb-4 text-gray-700">{title}</h3>
    <div className="flex flex-wrap gap-4">{children}</div>
  </div>
);

export const BrandColors: Story = {
  name: "Brand Colors",
  render: () => (
    <div className="p-6 bg-white rounded-xl">
      <h2 className="text-2xl font-bold mb-2">Cofoundy Brand Colors</h2>
      <p className="text-gray-600 mb-8">
        Official brand colors from the Brand Book MVP
      </p>

      <ColorRow title="Primary">
        <ColorSwatch
          name="Primary"
          value="#46A0D0"
          cssVar="--primary"
        />
        <ColorSwatch
          name="Secondary"
          value="#1B577E"
          cssVar="--secondary"
        />
      </ColorRow>

      <ColorRow title="Backgrounds">
        <ColorSwatch
          name="Deep Blue"
          value="#23435F"
          cssVar="--background"
        />
        <ColorSwatch
          name="Midnight"
          value="#020b1b"
          cssVar="--chat-background"
        />
        <ColorSwatch
          name="Card"
          value="rgba(255,255,255,0.05)"
          cssVar="--chat-card"
          textColor="#46A0D0"
        />
      </ColorRow>

      <ColorRow title="Text">
        <ColorSwatch
          name="Foreground"
          value="#FFFFFF"
          cssVar="--foreground"
          textColor="#020b1b"
        />
        <ColorSwatch
          name="Muted"
          value="#94a3b8"
          cssVar="--muted-foreground"
          textColor="#020b1b"
        />
        <ColorSwatch
          name="Secondary Text"
          value="#B0B0B0"
          cssVar="--chat-muted"
          textColor="#020b1b"
        />
      </ColorRow>
    </div>
  ),
};

export const SemanticColors: Story = {
  name: "Semantic Colors",
  render: () => (
    <div className="p-6 bg-white rounded-xl">
      <h2 className="text-2xl font-bold mb-2">Semantic Colors</h2>
      <p className="text-gray-600 mb-8">
        Status and feedback colors
      </p>

      <ColorRow title="Status">
        <ColorSwatch
          name="Success"
          value="#22c55e"
          cssVar="--status-success"
        />
        <ColorSwatch
          name="Warning"
          value="#eab308"
          cssVar="--status-warning"
          textColor="#020b1b"
        />
        <ColorSwatch
          name="Error"
          value="#ef4444"
          cssVar="--status-error"
        />
        <ColorSwatch
          name="Info"
          value="#3b82f6"
          cssVar="--status-info"
        />
      </ColorRow>

      <ColorRow title="Destructive">
        <ColorSwatch
          name="Destructive"
          value="#ef4444"
          cssVar="--destructive"
        />
      </ColorRow>
    </div>
  ),
};

export const ChannelColors: Story = {
  name: "Channel Colors",
  render: () => (
    <div className="p-6 bg-white rounded-xl">
      <h2 className="text-2xl font-bold mb-2">Channel Brand Colors</h2>
      <p className="text-gray-600 mb-8">
        Official brand colors for messaging platforms (InboxAI)
      </p>

      <ColorRow title="Messaging Platforms">
        <ColorSwatch
          name="WhatsApp"
          value="#25D366"
          cssVar="--channel-whatsapp"
        />
        <ColorSwatch
          name="Telegram"
          value="#0088CC"
          cssVar="--channel-telegram"
        />
        <ColorSwatch
          name="Instagram"
          value="#E4405F"
          cssVar="--channel-instagram"
        />
        <ColorSwatch
          name="Messenger"
          value="#0084FF"
          cssVar="--channel-messenger"
        />
        <ColorSwatch
          name="Email"
          value="#7C3AED"
          cssVar="--channel-email"
        />
        <ColorSwatch
          name="Webchat"
          value="#0EA5E9"
          cssVar="--channel-webchat"
        />
        <ColorSwatch
          name="SMS"
          value="#F97316"
          cssVar="--channel-sms"
        />
      </ColorRow>
    </div>
  ),
};

export const DarkTheme: Story = {
  name: "Dark Theme Preview",
  render: () => (
    <div className="p-6 bg-[#020b1b] rounded-xl" data-theme="dark">
      <h2 className="text-2xl font-bold mb-2 text-white">Dark Theme</h2>
      <p className="text-gray-400 mb-8">
        Default theme for Cofoundy products
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)]">
          <span className="text-white text-sm">Card</span>
        </div>
        <div className="p-4 rounded-lg bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.1)]">
          <span className="text-white text-sm">Card Hover</span>
        </div>
        <div className="p-4 rounded-lg bg-[#46A0D0]">
          <span className="text-white text-sm">Primary</span>
        </div>
        <div className="p-4 rounded-lg bg-[#1e293b]">
          <span className="text-white text-sm">Secondary</span>
        </div>
      </div>
    </div>
  ),
};

export const LightTheme: Story = {
  name: "Light Theme Preview",
  render: () => (
    <div className="p-6 bg-white rounded-xl border" data-theme="light">
      <h2 className="text-2xl font-bold mb-2 text-gray-900">Light Theme</h2>
      <p className="text-gray-600 mb-8">
        Alternative theme for light mode contexts
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
          <span className="text-gray-900 text-sm">Card</span>
        </div>
        <div className="p-4 rounded-lg bg-gray-100 border border-gray-200">
          <span className="text-gray-900 text-sm">Card Hover</span>
        </div>
        <div className="p-4 rounded-lg bg-[#2984ad]">
          <span className="text-white text-sm">Primary</span>
        </div>
        <div className="p-4 rounded-lg bg-[#1e293b]">
          <span className="text-white text-sm">Secondary</span>
        </div>
      </div>
    </div>
  ),
};
