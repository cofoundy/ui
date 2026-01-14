import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta = {
  title: "Foundation/Tokens",
  parameters: {
    layout: "padded",
  },
};

export default meta;
type Story = StoryObj;

const TokenRow = ({
  name,
  value,
  description,
}: {
  name: string;
  value: string;
  description?: string;
}) => (
  <tr className="border-b border-[var(--chat-border)]">
    <td className="py-2 pr-4">
      <code className="text-xs bg-[var(--chat-input-bg)] px-2 py-1 rounded text-[var(--chat-foreground)]">{name}</code>
    </td>
    <td className="py-2 pr-4 font-mono text-xs text-[var(--chat-muted)]">{value}</td>
    <td className="py-2 text-xs text-[var(--chat-muted)]">{description}</td>
  </tr>
);

const TokenTable = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className="mb-8">
    <h3 className="text-lg font-semibold mb-3 text-[var(--chat-foreground)]">{title}</h3>
    <table className="w-full text-left">
      <thead>
        <tr className="border-b-2 border-[var(--chat-border)]">
          <th className="py-2 pr-4 text-xs font-semibold text-[var(--chat-muted)] uppercase">Token</th>
          <th className="py-2 pr-4 text-xs font-semibold text-[var(--chat-muted)] uppercase">Value</th>
          <th className="py-2 text-xs font-semibold text-[var(--chat-muted)] uppercase">Usage</th>
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  </div>
);

export const AllTokens: Story = {
  name: "All CSS Variables",
  render: () => (
    <div className="p-6 bg-[var(--chat-card)] rounded-xl border border-[var(--chat-border)]">
      <h2 className="text-2xl font-bold mb-2 text-[var(--chat-foreground)]">CSS Variable Reference</h2>
      <p className="text-[var(--chat-muted)] mb-8">
        Complete reference of all design tokens in @cofoundy/ui
      </p>

      <TokenTable title="Animation - Duration">
        <TokenRow name="--cf-duration-instant" value="100ms" description="Toggles, switches" />
        <TokenRow name="--cf-duration-fast" value="150ms" description="Hover, focus" />
        <TokenRow name="--cf-duration-normal" value="250ms" description="Modals, tabs" />
        <TokenRow name="--cf-duration-smooth" value="400ms" description="Cards, messages" />
        <TokenRow name="--cf-duration-slow" value="600ms" description="Hero reveals" />
      </TokenTable>

      <TokenTable title="Animation - Easing">
        <TokenRow name="--cf-ease-default" value="cubic-bezier(0.19, 1, 0.22, 1)" description="Primary easing" />
        <TokenRow name="--cf-ease-out" value="cubic-bezier(0.22, 1, 0.36, 1)" description="Standard out" />
        <TokenRow name="--cf-ease-in-out" value="cubic-bezier(0.45, 0, 0.55, 1)" description="Looping" />
        <TokenRow name="--cf-ease-emphasis" value="cubic-bezier(0.34, 1.3, 0.64, 1)" description="Confirmations" />
        <TokenRow name="--cf-ease-spring" value="cubic-bezier(0.34, 1.56, 0.64, 1)" description="Buttons" />
      </TokenTable>

      <TokenTable title="Animation - Stagger">
        <TokenRow name="--cf-stagger-fast" value="50ms" description="Lists" />
        <TokenRow name="--cf-stagger-normal" value="100ms" description="Grids" />
      </TokenTable>

      <TokenTable title="Colors - Brand">
        <TokenRow name="--primary" value="#46a0d0" description="Brand primary" />
        <TokenRow name="--primary-foreground" value="#ffffff" description="Text on primary" />
        <TokenRow name="--secondary" value="#1e293b" description="Secondary actions" />
        <TokenRow name="--destructive" value="#ef4444" description="Destructive actions" />
      </TokenTable>

      <TokenTable title="Colors - Semantic">
        <TokenRow name="--background" value="#020b1b" description="Page bg" />
        <TokenRow name="--foreground" value="#ffffff" description="Primary text" />
        <TokenRow name="--muted" value="#1e293b" description="Muted bg" />
        <TokenRow name="--muted-foreground" value="#94a3b8" description="Muted text" />
        <TokenRow name="--border" value="rgba(255,255,255,0.15)" description="Borders" />
        <TokenRow name="--input" value="#1e293b" description="Input bg" />
        <TokenRow name="--ring" value="#46a0d0" description="Focus ring" />
        <TokenRow name="--card" value="rgba(255,255,255,0.05)" description="Card bg" />
      </TokenTable>

      <TokenTable title="Colors - Status">
        <TokenRow name="--status-success" value="#22c55e" description="Success" />
        <TokenRow name="--status-warning" value="#eab308" description="Warning" />
        <TokenRow name="--status-error" value="#ef4444" description="Error" />
        <TokenRow name="--status-info" value="#3b82f6" description="Info" />
      </TokenTable>

      <TokenTable title="Colors - Channels">
        <TokenRow name="--channel-whatsapp" value="#25D366" description="WhatsApp" />
        <TokenRow name="--channel-telegram" value="#0088CC" description="Telegram" />
        <TokenRow name="--channel-instagram" value="#E4405F" description="Instagram" />
        <TokenRow name="--channel-messenger" value="#0084FF" description="Messenger" />
        <TokenRow name="--channel-email" value="#7C3AED" description="Email" />
        <TokenRow name="--channel-webchat" value="#0EA5E9" description="Webchat" />
        <TokenRow name="--channel-sms" value="#F97316" description="SMS" />
      </TokenTable>

      <TokenTable title="Chat Widget - Theme Aware">
        <TokenRow name="--chat-primary" value="var(--primary)" description="Widget primary" />
        <TokenRow name="--chat-background" value="var(--background)" description="Widget bg" />
        <TokenRow name="--chat-foreground" value="var(--foreground)" description="Widget text" />
        <TokenRow name="--chat-muted" value="var(--muted-foreground)" description="Widget muted" />
        <TokenRow name="--chat-border" value="var(--border)" description="Widget borders" />
        <TokenRow name="--chat-card" value="var(--card)" description="Widget cards" />
        <TokenRow name="--chat-card-hover" value="rgba(255,255,255,0.08)" description="Card hover" />
        <TokenRow name="--chat-input-bg" value="rgba(255,255,255,0.05)" description="Input bg" />
        <TokenRow name="--chat-shadow" value="0 4px 24px rgba(0,0,0,0.4)" description="Widget shadow" />
        <TokenRow name="--chat-success" value="#22c55e" description="Success feedback" />
        <TokenRow name="--chat-error" value="#ef4444" description="Error feedback" />
        <TokenRow name="--chat-warning" value="#eab308" description="Warning feedback" />
      </TokenTable>
    </div>
  ),
};

export const Usage: Story = {
  name: "How to Use Tokens",
  render: () => (
    <div className="p-6 bg-[var(--chat-card)] rounded-xl border border-[var(--chat-border)]">
      <h2 className="text-2xl font-bold mb-2 text-[var(--chat-foreground)]">Using Tokens</h2>
      <p className="text-[var(--chat-muted)] mb-8">Examples of how to use CSS variables</p>

      <div className="space-y-6">
        <div>
          <h4 className="font-semibold mb-2 text-[var(--chat-foreground)]">In CSS</h4>
          <pre className="text-xs bg-[#0f172a] text-[#22c55e] p-4 rounded-lg overflow-x-auto">
{`.my-component {
  background: var(--chat-card);
  color: var(--chat-foreground);
  border: 1px solid var(--chat-border);
  transition: all var(--cf-duration-fast) var(--cf-ease-default);
}`}
          </pre>
        </div>

        <div>
          <h4 className="font-semibold mb-2 text-[var(--chat-foreground)]">In Tailwind (arbitrary values)</h4>
          <pre className="text-xs bg-[#0f172a] text-[#22c55e] p-4 rounded-lg overflow-x-auto">
{`<div className="bg-[var(--chat-card)] text-[var(--chat-foreground)]">
  Content
</div>`}
          </pre>
        </div>

        <div>
          <h4 className="font-semibold mb-2 text-[var(--chat-foreground)]">Animation Classes</h4>
          <pre className="text-xs bg-[#0f172a] text-[#22c55e] p-4 rounded-lg overflow-x-auto">
{`// Entrance animations
<div className="cf-animate-fade-in">Fades in</div>
<div className="cf-animate-scale-in">Scales in</div>

// Hover effects
<button className="cf-hover-lift">Lifts on hover</button>
<button className="cf-hover-scale">Scales on hover</button>

// Transitions
<div className="cf-transition-fast">Fast transitions</div>

// Stagger
{items.map((item, i) => (
  <div
    className="cf-stagger-item"
    style={{ "--cf-stagger-index": i }}
  />
))}`}
          </pre>
        </div>

        <div>
          <h4 className="font-semibold mb-2 text-[var(--chat-foreground)]">Theme Switching</h4>
          <pre className="text-xs bg-[#0f172a] text-[#22c55e] p-4 rounded-lg overflow-x-auto">
{`// Add data-theme attribute to switch themes
<div data-theme="dark">Dark theme content</div>
<div data-theme="light">Light theme content</div>`}
          </pre>
        </div>
      </div>
    </div>
  ),
};
