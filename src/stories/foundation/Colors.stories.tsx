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
          value="#059669"
          cssVar="--status-success"
        />
        <ColorSwatch
          name="Warning"
          value="#D97706"
          cssVar="--status-warning"
        />
        <ColorSwatch
          name="Error"
          value="#BE123C"
          cssVar="--status-error"
        />
        <ColorSwatch
          name="Info"
          value="#46A0D0"
          cssVar="--status-info"
        />
      </ColorRow>

      <ColorRow title="Destructive">
        <ColorSwatch
          name="Destructive"
          value="#BE123C"
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
    <div className="p-6 bg-[var(--chat-card)] rounded-xl border border-[var(--chat-border)] space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2 text-[var(--chat-foreground)]">Design System Overview</h2>
        <p className="text-[var(--chat-muted)]">
          Complete color palette available via CSS variables. Use the theme toggle to switch themes.
        </p>
      </div>

      {/* Brand Colors */}
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--chat-muted)] mb-3">Brand</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-4 rounded-lg bg-[var(--chat-primary)] text-white">
            <span className="text-sm font-medium">Primary</span>
            <span className="block text-xs opacity-70 font-mono">--chat-primary</span>
          </div>
          <div className="p-4 rounded-lg bg-[var(--secondary)] text-white">
            <span className="text-sm font-medium">Secondary</span>
            <span className="block text-xs opacity-70 font-mono">--secondary</span>
          </div>
          <div className="p-4 rounded-lg bg-[var(--chat-card)] border border-[var(--chat-border)]">
            <span className="text-sm font-medium text-[var(--chat-foreground)]">Card</span>
            <span className="block text-xs text-[var(--chat-muted)] font-mono">--chat-card</span>
          </div>
          <div className="p-4 rounded-lg bg-[var(--chat-card-hover)] border border-[var(--chat-border)]">
            <span className="text-sm font-medium text-[var(--chat-foreground)]">Card Hover</span>
            <span className="block text-xs text-[var(--chat-muted)] font-mono">--chat-card-hover</span>
          </div>
        </div>
      </div>

      {/* Semantic Colors */}
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--chat-muted)] mb-3">Semantic Status</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-4 rounded-lg bg-[var(--status-success)] text-white">
            <span className="text-sm font-medium">Success</span>
            <span className="block text-xs opacity-70 font-mono">--status-success</span>
          </div>
          <div className="p-4 rounded-lg bg-[var(--status-warning)] text-white">
            <span className="text-sm font-medium">Warning</span>
            <span className="block text-xs opacity-70 font-mono">--status-warning</span>
          </div>
          <div className="p-4 rounded-lg bg-[var(--status-error)] text-white">
            <span className="text-sm font-medium">Error</span>
            <span className="block text-xs opacity-70 font-mono">--status-error</span>
          </div>
          <div className="p-4 rounded-lg bg-[var(--status-info)] text-white">
            <span className="text-sm font-medium">Info</span>
            <span className="block text-xs opacity-70 font-mono">--status-info</span>
          </div>
        </div>
      </div>

      {/* Channel Colors */}
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--chat-muted)] mb-3">Channel Brands</h3>
        <div className="grid grid-cols-3 md:grid-cols-7 gap-2">
          <div className="p-3 rounded-lg bg-[var(--channel-whatsapp)] text-white text-center">
            <span className="text-xs font-medium">WhatsApp</span>
          </div>
          <div className="p-3 rounded-lg bg-[var(--channel-telegram)] text-white text-center">
            <span className="text-xs font-medium">Telegram</span>
          </div>
          <div className="p-3 rounded-lg bg-[var(--channel-instagram)] text-white text-center">
            <span className="text-xs font-medium">Instagram</span>
          </div>
          <div className="p-3 rounded-lg bg-[var(--channel-messenger)] text-white text-center">
            <span className="text-xs font-medium">Messenger</span>
          </div>
          <div className="p-3 rounded-lg bg-[var(--channel-email)] text-white text-center">
            <span className="text-xs font-medium">Email</span>
          </div>
          <div className="p-3 rounded-lg bg-[var(--channel-webchat)] text-white text-center">
            <span className="text-xs font-medium">Webchat</span>
          </div>
          <div className="p-3 rounded-lg bg-[var(--channel-sms)] text-white text-center">
            <span className="text-xs font-medium">SMS</span>
          </div>
        </div>
      </div>

      {/* Text Colors */}
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--chat-muted)] mb-3">Typography</h3>
        <div className="space-y-2 p-4 rounded-lg bg-[var(--chat-input-bg)] border border-[var(--chat-border)]">
          <p className="text-[var(--chat-foreground)] font-medium">
            Foreground <span className="text-xs font-mono text-[var(--chat-muted)] ml-2">--chat-foreground</span>
          </p>
          <p className="text-[var(--chat-muted)]">
            Muted text <span className="text-xs font-mono ml-2">--chat-muted</span>
          </p>
          <p className="text-[var(--chat-primary)]">
            Primary accent <span className="text-xs font-mono text-[var(--chat-muted)] ml-2">--chat-primary</span>
          </p>
          <p className="text-[var(--status-success)]">
            Success text <span className="text-xs font-mono text-[var(--chat-muted)] ml-2">--status-success</span>
          </p>
          <p className="text-[var(--status-error)]">
            Error text <span className="text-xs font-mono text-[var(--chat-muted)] ml-2">--status-error</span>
          </p>
        </div>
      </div>

      {/* Usage Examples */}
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--chat-muted)] mb-3">Usage Examples</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Problem/Solution Pattern */}
          <div className="space-y-2">
            <span className="text-xs text-[var(--chat-muted)]">Problem indicator</span>
            <div className="p-3 rounded-lg border-l-4 border-[var(--status-error)] bg-[var(--chat-card)]">
              <span className="text-[var(--status-error)] text-sm">No apareces en Google</span>
            </div>
          </div>
          <div className="space-y-2">
            <span className="text-xs text-[var(--chat-muted)]">Solution indicator</span>
            <div className="p-3 rounded-lg border-l-4 border-[var(--status-success)] bg-[var(--chat-card)]">
              <span className="text-[var(--status-success)] text-sm">Apareces en Google Maps</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 rounded-lg bg-[var(--chat-input-bg)] border border-[var(--chat-border)]">
        <p className="text-[var(--chat-muted)] text-sm">
          All components in @cofoundy/ui automatically adapt to the current theme via CSS variables.
          Use these tokens instead of hardcoded colors for consistency.
        </p>
      </div>
    </div>
  ),
};
