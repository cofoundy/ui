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
  border = false,
}: {
  name: string;
  value: string;
  cssVar?: string;
  border?: boolean;
}) => (
  <div className="flex flex-col">
    <div
      className={`w-24 h-24 rounded-lg shadow-md flex items-end p-2 ${border ? "border border-[var(--chat-border)]" : ""}`}
      style={{ backgroundColor: value }}
    >
      <span className="text-xs font-mono text-white mix-blend-difference">{value}</span>
    </div>
    <span className="text-sm font-medium mt-2 text-[var(--chat-foreground)]">{name}</span>
    {cssVar && (
      <span className="text-xs text-[var(--chat-muted)] font-mono">{cssVar}</span>
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
    <h3 className="text-lg font-semibold mb-4 text-[var(--chat-foreground)]">{title}</h3>
    <div className="flex flex-wrap gap-4">{children}</div>
  </div>
);

export const BrandColors: Story = {
  name: "Brand Colors",
  render: () => (
    <div className="p-6 bg-[var(--chat-card)] rounded-xl border border-[var(--chat-border)]">
      <h2 className="text-2xl font-bold mb-2 text-[var(--chat-foreground)]">Cofoundy Brand Colors</h2>
      <p className="text-[var(--chat-muted)] mb-8">
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
          border
        />
      </ColorRow>

      <ColorRow title="Text">
        <ColorSwatch
          name="Foreground"
          value="#FFFFFF"
          cssVar="--foreground"
          border
        />
        <ColorSwatch
          name="Muted"
          value="#94a3b8"
          cssVar="--muted-foreground"
        />
        <ColorSwatch
          name="Secondary Text"
          value="#B0B0B0"
          cssVar="--chat-muted"
        />
      </ColorRow>
    </div>
  ),
};

export const SemanticColors: Story = {
  name: "Semantic Colors",
  render: () => (
    <div className="p-6 bg-[var(--chat-card)] rounded-xl border border-[var(--chat-border)]">
      <h2 className="text-2xl font-bold mb-2 text-[var(--chat-foreground)]">Semantic Colors</h2>
      <p className="text-[var(--chat-muted)] mb-8">
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
    <div className="p-6 bg-[var(--chat-card)] rounded-xl border border-[var(--chat-border)]">
      <h2 className="text-2xl font-bold mb-2 text-[var(--chat-foreground)]">Channel Brand Colors</h2>
      <p className="text-[var(--chat-muted)] mb-8">
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

export const ThemePreview: Story = {
  name: "Theme Preview",
  render: () => (
    <div className="p-6 bg-[var(--chat-card)] rounded-xl border border-[var(--chat-border)]">
      <h2 className="text-2xl font-bold mb-2 text-[var(--chat-foreground)]">Current Theme</h2>
      <p className="text-[var(--chat-muted)] mb-8">
        Use the theme toggle in the Storybook toolbar to switch themes
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg bg-[var(--chat-card)] border border-[var(--chat-border)]">
          <span className="text-[var(--chat-foreground)] text-sm">Card</span>
        </div>
        <div className="p-4 rounded-lg bg-[var(--chat-card-hover)] border border-[var(--chat-border)]">
          <span className="text-[var(--chat-foreground)] text-sm">Card Hover</span>
        </div>
        <div className="p-4 rounded-lg bg-[var(--chat-primary)]">
          <span className="text-white text-sm">Primary</span>
        </div>
        <div className="p-4 rounded-lg bg-[var(--secondary)]">
          <span className="text-white text-sm">Secondary</span>
        </div>
      </div>

      <div className="mt-6 p-4 rounded-lg bg-[var(--chat-input-bg)] border border-[var(--chat-border)]">
        <p className="text-[var(--chat-muted)] text-sm">
          All components in @cofoundy/ui automatically adapt to the current theme via CSS variables.
        </p>
      </div>
    </div>
  ),
};
