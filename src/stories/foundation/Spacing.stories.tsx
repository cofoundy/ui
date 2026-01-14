import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta = {
  title: "Foundation/Spacing",
  parameters: {
    layout: "padded",
  },
};

export default meta;
type Story = StoryObj;

const SpacingSwatch = ({
  name,
  size,
  pixels,
}: {
  name: string;
  size: string;
  pixels: string;
}) => (
  <div className="flex items-center gap-4 mb-3">
    <div
      className="bg-[var(--chat-primary)] rounded"
      style={{ width: size, height: "24px" }}
    />
    <div className="flex items-baseline gap-2">
      <span className="font-mono text-sm font-medium w-12 text-[var(--chat-foreground)]">{name}</span>
      <span className="text-[var(--chat-muted)] text-sm">{pixels}</span>
    </div>
  </div>
);

export const SpacingScale: Story = {
  name: "Spacing Scale",
  render: () => (
    <div className="p-6 bg-[var(--chat-card)] rounded-xl border border-[var(--chat-border)]">
      <h2 className="text-2xl font-bold mb-2 text-[var(--chat-foreground)]">Spacing Scale</h2>
      <p className="text-[var(--chat-muted)] mb-8">
        Tailwind CSS spacing scale (4px base unit)
      </p>

      <div className="space-y-1">
        <SpacingSwatch name="0" size="0px" pixels="0px" />
        <SpacingSwatch name="0.5" size="2px" pixels="2px" />
        <SpacingSwatch name="1" size="4px" pixels="4px" />
        <SpacingSwatch name="1.5" size="6px" pixels="6px" />
        <SpacingSwatch name="2" size="8px" pixels="8px" />
        <SpacingSwatch name="2.5" size="10px" pixels="10px" />
        <SpacingSwatch name="3" size="12px" pixels="12px" />
        <SpacingSwatch name="4" size="16px" pixels="16px" />
        <SpacingSwatch name="5" size="20px" pixels="20px" />
        <SpacingSwatch name="6" size="24px" pixels="24px" />
        <SpacingSwatch name="8" size="32px" pixels="32px" />
        <SpacingSwatch name="10" size="40px" pixels="40px" />
        <SpacingSwatch name="12" size="48px" pixels="48px" />
        <SpacingSwatch name="16" size="64px" pixels="64px" />
        <SpacingSwatch name="20" size="80px" pixels="80px" />
        <SpacingSwatch name="24" size="96px" pixels="96px" />
      </div>
    </div>
  ),
};

export const BorderRadius: Story = {
  name: "Border Radius",
  render: () => (
    <div className="p-6 bg-[var(--chat-card)] rounded-xl border border-[var(--chat-border)]">
      <h2 className="text-2xl font-bold mb-2 text-[var(--chat-foreground)]">Border Radius</h2>
      <p className="text-[var(--chat-muted)] mb-8">
        Radius tokens used across components
      </p>

      <div className="flex flex-wrap gap-6">
        {[
          { name: "rounded-none", value: "0px" },
          { name: "rounded-sm", value: "2px" },
          { name: "rounded", value: "4px" },
          { name: "rounded-md", value: "6px" },
          { name: "rounded-lg", value: "8px" },
          { name: "rounded-xl", value: "12px" },
          { name: "rounded-2xl", value: "16px" },
          { name: "rounded-3xl", value: "24px" },
          { name: "rounded-full", value: "9999px" },
        ].map((item) => (
          <div key={item.name} className="text-center">
            <div
              className={`w-20 h-20 bg-[var(--chat-primary)] mb-2 ${item.name}`}
            />
            <span className="text-xs font-mono text-[var(--chat-foreground)]">{item.name}</span>
            <span className="text-xs text-[var(--chat-muted)] block">{item.value}</span>
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 bg-[var(--chat-input-bg)] rounded-lg border border-[var(--chat-border)]">
        <h4 className="font-semibold mb-2 text-[var(--chat-foreground)]">Common Usage</h4>
        <ul className="text-sm text-[var(--chat-muted)] space-y-1">
          <li>• <strong className="text-[var(--chat-foreground)]">Buttons:</strong> rounded-md to rounded-lg</li>
          <li>• <strong className="text-[var(--chat-foreground)]">Cards:</strong> rounded-xl to rounded-2xl</li>
          <li>• <strong className="text-[var(--chat-foreground)]">Chat bubbles:</strong> rounded-2xl with rounded-tl-sm/tr-sm</li>
          <li>• <strong className="text-[var(--chat-foreground)]">Avatars:</strong> rounded-full</li>
          <li>• <strong className="text-[var(--chat-foreground)]">Inputs:</strong> rounded-md</li>
        </ul>
      </div>
    </div>
  ),
};

export const Shadows: Story = {
  name: "Shadows",
  render: () => (
    <div className="p-6 bg-[var(--chat-card)] rounded-xl border border-[var(--chat-border)]">
      <h2 className="text-2xl font-bold mb-2 text-[var(--chat-foreground)]">Shadows</h2>
      <p className="text-[var(--chat-muted)] mb-8">
        Shadow tokens for depth and elevation
      </p>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        {[
          { name: "shadow-sm", class: "shadow-sm" },
          { name: "shadow", class: "shadow" },
          { name: "shadow-md", class: "shadow-md" },
          { name: "shadow-lg", class: "shadow-lg" },
          { name: "shadow-xl", class: "shadow-xl" },
          { name: "shadow-2xl", class: "shadow-2xl" },
        ].map((item) => (
          <div key={item.name} className="text-center">
            <div
              className={`w-24 h-24 bg-[var(--chat-card-hover)] rounded-lg mx-auto border border-[var(--chat-border)] ${item.class}`}
            />
            <span className="text-xs font-mono text-[var(--chat-foreground)] mt-2 block">{item.name}</span>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <h4 className="font-semibold mb-4 text-[var(--chat-foreground)]">Chat Widget Shadow</h4>
        <div className="flex gap-6">
          <div className="text-center">
            <div
              className="w-32 h-24 bg-[var(--chat-background)] rounded-2xl border border-[var(--chat-border)]"
              style={{ boxShadow: "var(--chat-shadow)" }}
            />
            <span className="text-xs font-mono text-[var(--chat-foreground)] block mt-2">--chat-shadow</span>
            <span className="text-xs text-[var(--chat-muted)]">Theme aware</span>
          </div>
        </div>
      </div>
    </div>
  ),
};

export const LayoutPatterns: Story = {
  name: "Layout Patterns",
  render: () => (
    <div className="p-6 bg-[var(--chat-card)] rounded-xl border border-[var(--chat-border)]">
      <h2 className="text-2xl font-bold mb-2 text-[var(--chat-foreground)]">Layout Patterns</h2>
      <p className="text-[var(--chat-muted)] mb-8">
        Common spacing patterns used in components
      </p>

      <div className="space-y-8">
        <div>
          <h4 className="font-semibold mb-4 text-[var(--chat-foreground)]">Card Padding</h4>
          <div className="flex gap-4">
            {[
              { name: "p-3", label: "12px" },
              { name: "p-4", label: "16px" },
              { name: "p-6", label: "24px" },
            ].map((item) => (
              <div key={item.name} className="border-2 border-dashed border-[var(--chat-border)] rounded-lg">
                <div className={`bg-[var(--chat-input-bg)] rounded-lg ${item.name}`}>
                  <span className="text-xs text-[var(--chat-foreground)]">{item.name} ({item.label})</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-4 text-[var(--chat-foreground)]">Gap Spacing</h4>
          <div className="space-y-4">
            {[
              { gap: "gap-1", label: "4px", desc: "Tight" },
              { gap: "gap-2", label: "8px", desc: "Compact" },
              { gap: "gap-4", label: "16px", desc: "Default" },
              { gap: "gap-6", label: "24px", desc: "Spacious" },
            ].map((item) => (
              <div key={item.gap} className={`flex ${item.gap} items-center`}>
                <div className="w-8 h-8 bg-[var(--chat-primary)] rounded" />
                <div className="w-8 h-8 bg-[var(--chat-primary)] rounded" />
                <div className="w-8 h-8 bg-[var(--chat-primary)] rounded" />
                <span className="text-xs text-[var(--chat-muted)] ml-2">
                  {item.gap} ({item.label}) - {item.desc}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  ),
};
