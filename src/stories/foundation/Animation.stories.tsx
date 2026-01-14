import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";

const meta: Meta = {
  title: "Foundation/Animation",
  parameters: {
    layout: "padded",
  },
};

export default meta;
type Story = StoryObj;

const AnimationDemo = ({
  name,
  className,
  description,
}: {
  name: string;
  className: string;
  description: string;
}) => {
  const [key, setKey] = useState(0);

  return (
    <div className="flex items-center gap-4 p-4 bg-[var(--chat-input-bg)] rounded-lg border border-[var(--chat-border)]">
      <div
        key={key}
        className={`w-16 h-16 bg-[var(--chat-primary)] rounded-lg ${className}`}
      />
      <div className="flex-1">
        <span className="font-mono text-sm font-medium text-[var(--chat-foreground)]">.{name}</span>
        <p className="text-xs text-[var(--chat-muted)]">{description}</p>
      </div>
      <button
        onClick={() => setKey((k) => k + 1)}
        className="px-3 py-1 text-xs bg-[var(--chat-card-hover)] text-[var(--chat-foreground)] rounded hover:bg-[var(--chat-primary)]/20 border border-[var(--chat-border)]"
      >
        Replay
      </button>
    </div>
  );
};

export const Principles: Story = {
  name: "Animation Principles",
  render: () => (
    <div className="p-6 bg-[var(--chat-card)] rounded-xl border border-[var(--chat-border)]">
      <h2 className="text-2xl font-bold mb-2 text-[var(--chat-foreground)]">Animation Principles</h2>
      <p className="text-[var(--chat-muted)] mb-8">
        Based on Cofoundy Brand Book personality
      </p>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="p-4 bg-[var(--chat-primary)]/10 rounded-lg border border-[var(--chat-primary)]/30">
          <h4 className="font-semibold text-[var(--chat-primary)] mb-2">
            Velocidad con Proposito
          </h4>
          <p className="text-sm text-[var(--chat-foreground)]">
            Fast but deliberate. 150-300ms for micro-interactions. No animation
            should feel gratuitous.
          </p>
        </div>

        <div className="p-4 bg-[var(--chat-primary)]/10 rounded-lg border border-[var(--chat-primary)]/30">
          <h4 className="font-semibold text-[var(--chat-primary)] mb-2">
            Tecnico pero Accesible
          </h4>
          <p className="text-sm text-[var(--chat-foreground)]">
            Precise mathematical easings (expo, quint). Smooth and controlled,
            not elastic or bouncy.
          </p>
        </div>

        <div className="p-4 bg-[var(--chat-success)]/10 rounded-lg border border-[var(--chat-success)]/30">
          <h4 className="font-semibold text-[var(--chat-success)] mb-2">Directo</h4>
          <p className="text-sm text-[var(--chat-foreground)]">
            No unnecessary delays. Immediate feedback on interactions. One
            smooth motion, not multi-stage.
          </p>
        </div>

        <div className="p-4 bg-[var(--chat-warning)]/10 rounded-lg border border-[var(--chat-warning)]/30">
          <h4 className="font-semibold text-[var(--chat-warning)] mb-2">Cercano (75%)</h4>
          <p className="text-sm text-[var(--chat-foreground)]">
            Warm but not playful. Subtle scale effects (1.02-1.05x). Hover
            states that invite, not jump.
          </p>
        </div>
      </div>
    </div>
  ),
};

export const DurationTokens: Story = {
  name: "Duration Tokens",
  render: () => (
    <div className="p-6 bg-[var(--chat-card)] rounded-xl border border-[var(--chat-border)]">
      <h2 className="text-2xl font-bold mb-2 text-[var(--chat-foreground)]">Duration Tokens</h2>
      <p className="text-[var(--chat-muted)] mb-8">CSS variables for animation timing</p>

      <div className="space-y-4">
        {[
          { name: "--cf-duration-instant", value: "100ms", use: "Toggles, switches" },
          { name: "--cf-duration-fast", value: "150ms", use: "Hover, focus, micro-interactions" },
          { name: "--cf-duration-normal", value: "250ms", use: "Modals, tabs, dropdowns" },
          { name: "--cf-duration-smooth", value: "400ms", use: "Card entrances, messages" },
          { name: "--cf-duration-slow", value: "600ms", use: "Hero reveals, dramatic effects" },
        ].map((token) => (
          <div
            key={token.name}
            className="flex items-center gap-4 p-3 bg-[var(--chat-input-bg)] rounded-lg border border-[var(--chat-border)]"
          >
            <div
              className="h-2 bg-[var(--chat-primary)] rounded-full"
              style={{ width: parseInt(token.value) / 3 }}
            />
            <div className="flex-1">
              <span className="font-mono text-sm text-[var(--chat-foreground)]">{token.name}</span>
              <span className="text-[var(--chat-muted)] text-sm ml-2">{token.value}</span>
            </div>
            <span className="text-xs text-[var(--chat-muted)]">{token.use}</span>
          </div>
        ))}
      </div>
    </div>
  ),
};

export const EasingTokens: Story = {
  name: "Easing Tokens",
  render: () => {
    const [playing, setPlaying] = useState<string | null>(null);

    const easings = [
      {
        name: "--cf-ease-default",
        value: "cubic-bezier(0.19, 1, 0.22, 1)",
        label: "The Cofoundy Easing",
        description: "Technical, confident. Default for everything.",
      },
      {
        name: "--cf-ease-out",
        value: "cubic-bezier(0.22, 1, 0.36, 1)",
        label: "Smooth Out",
        description: "Standard smooth deceleration.",
      },
      {
        name: "--cf-ease-in-out",
        value: "cubic-bezier(0.45, 0, 0.55, 1)",
        label: "Symmetric",
        description: "For looping animations.",
      },
      {
        name: "--cf-ease-emphasis",
        value: "cubic-bezier(0.34, 1.3, 0.64, 1)",
        label: "Subtle Overshoot",
        description: "Success confirmations, celebrations.",
      },
      {
        name: "--cf-ease-spring",
        value: "cubic-bezier(0.34, 1.56, 0.64, 1)",
        label: "Subtle Bounce",
        description: "Buttons on hover. Use sparingly.",
      },
    ];

    return (
      <div className="p-6 bg-[var(--chat-card)] rounded-xl border border-[var(--chat-border)]">
        <h2 className="text-2xl font-bold mb-2 text-[var(--chat-foreground)]">Easing Tokens</h2>
        <p className="text-[var(--chat-muted)] mb-8">Click to see easing curve in action</p>

        <div className="space-y-4">
          {easings.map((easing) => (
            <div
              key={easing.name}
              className="p-4 bg-[var(--chat-input-bg)] rounded-lg cursor-pointer hover:bg-[var(--chat-card-hover)] border border-[var(--chat-border)]"
              onClick={() => {
                setPlaying(easing.name);
                setTimeout(() => setPlaying(null), 1000);
              }}
            >
              <div className="flex items-center gap-4 mb-2">
                <div className="relative w-48 h-2 bg-[var(--chat-card-hover)] rounded-full overflow-hidden">
                  <div
                    className={`absolute h-full bg-[var(--chat-primary)] rounded-full ${
                      playing === easing.name ? "animate-[slideRight_1s_forwards]" : "w-0"
                    }`}
                    style={{
                      animationTimingFunction: playing === easing.name ? easing.value : undefined,
                    }}
                  />
                </div>
                <span className="font-mono text-sm text-[var(--chat-foreground)]">{easing.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-[var(--chat-foreground)]">{easing.label}</span>
                <span className="text-xs text-[var(--chat-muted)]">{easing.description}</span>
              </div>
            </div>
          ))}
        </div>

        <style>{`
          @keyframes slideRight {
            from { width: 0; }
            to { width: 100%; }
          }
        `}</style>
      </div>
    );
  },
};

export const EntranceAnimations: Story = {
  name: "Entrance Animations",
  render: () => (
    <div className="p-6 bg-[var(--chat-card)] rounded-xl border border-[var(--chat-border)]">
      <h2 className="text-2xl font-bold mb-2 text-[var(--chat-foreground)]">Entrance Animations</h2>
      <p className="text-[var(--chat-muted)] mb-8">Click Replay to see animation again</p>

      <div className="space-y-4">
        <AnimationDemo
          name="cf-animate-fade-in"
          className="cf-animate-fade-in"
          description="Primary entrance - fade + subtle rise (8px). For messages, cards."
        />
        <AnimationDemo
          name="cf-animate-scale-in"
          className="cf-animate-scale-in"
          description="Scale entrance - fade + scale from 95%. For modals, popovers."
        />
        <AnimationDemo
          name="cf-animate-slide-up"
          className="cf-animate-slide-up"
          description="Slide from bottom - for toasts, bottom sheets."
        />
        <AnimationDemo
          name="cf-animate-slide-right"
          className="cf-animate-slide-right"
          description="Slide from left - for sidebars, drawers."
        />
        <AnimationDemo
          name="cf-animate-slide-left"
          className="cf-animate-slide-left"
          description="Slide from right - for panels, drawers."
        />
      </div>
    </div>
  ),
};

export const FeedbackAnimations: Story = {
  name: "Feedback Animations",
  render: () => (
    <div className="p-6 bg-[var(--chat-card)] rounded-xl border border-[var(--chat-border)]">
      <h2 className="text-2xl font-bold mb-2 text-[var(--chat-foreground)]">Feedback Animations</h2>
      <p className="text-[var(--chat-muted)] mb-8">Animations for user feedback</p>

      <div className="space-y-4">
        <AnimationDemo
          name="cf-animate-success"
          className="cf-animate-success !bg-[var(--chat-success)]"
          description="Success pulse - green glow for confirmations."
        />
        <AnimationDemo
          name="cf-animate-error"
          className="cf-animate-error !bg-[var(--chat-error)]"
          description="Error shake - horizontal shake for validation errors."
        />
        <AnimationDemo
          name="cf-animate-attention"
          className="cf-animate-attention"
          description="Attention pulse - subtle scale for notifications."
        />
      </div>
    </div>
  ),
};

export const LoadingAnimations: Story = {
  name: "Loading Animations",
  render: () => (
    <div className="p-6 bg-[var(--chat-card)] rounded-xl border border-[var(--chat-border)]">
      <h2 className="text-2xl font-bold mb-2 text-[var(--chat-foreground)]">Loading Animations</h2>
      <p className="text-[var(--chat-muted)] mb-8">Continuous animations for loading states</p>

      <div className="space-y-6">
        <div className="p-4 bg-[var(--chat-input-bg)] rounded-lg border border-[var(--chat-border)]">
          <span className="font-mono text-sm font-medium block mb-4 text-[var(--chat-foreground)]">
            .cf-animate-spin
          </span>
          <div className="w-8 h-8 border-2 border-[var(--chat-primary)] border-t-transparent rounded-full cf-animate-spin" />
        </div>

        <div className="p-4 bg-[var(--chat-input-bg)] rounded-lg border border-[var(--chat-border)]">
          <span className="font-mono text-sm font-medium block mb-4 text-[var(--chat-foreground)]">
            .cf-animate-shimmer
          </span>
          <div className="w-full h-12 rounded-lg cf-animate-shimmer" />
        </div>

        <div className="p-4 bg-[var(--chat-input-bg)] rounded-lg border border-[var(--chat-border)]">
          <span className="font-mono text-sm font-medium block mb-4 text-[var(--chat-foreground)]">
            .cf-animate-glow
          </span>
          <div className="w-16 h-16 bg-[var(--chat-primary)] rounded-lg cf-animate-glow" />
        </div>

        <div className="p-4 bg-[var(--chat-background)] rounded-lg border border-[var(--chat-border)]">
          <span className="font-mono text-sm font-medium block mb-4 text-[var(--chat-foreground)]">
            Folding Cube Spinner (Branded)
          </span>
          <div className="cf-folding-cube cf-spinner-default">
            <div className="cf-cube cf-cube1" />
            <div className="cf-cube cf-cube2" />
            <div className="cf-cube cf-cube3" />
            <div className="cf-cube cf-cube4" />
          </div>
        </div>
      </div>
    </div>
  ),
};

export const HoverUtilities: Story = {
  name: "Hover Utilities",
  render: () => (
    <div className="p-6 bg-[var(--chat-card)] rounded-xl border border-[var(--chat-border)]">
      <h2 className="text-2xl font-bold mb-2 text-[var(--chat-foreground)]">Hover Utilities</h2>
      <p className="text-[var(--chat-muted)] mb-8">Hover over boxes to see effects</p>

      <div className="flex flex-wrap gap-6">
        <div className="text-center">
          <div className="w-24 h-24 bg-[var(--chat-primary)] rounded-lg cf-hover-lift cursor-pointer" />
          <span className="text-xs font-mono mt-2 block text-[var(--chat-foreground)]">.cf-hover-lift</span>
          <span className="text-xs text-[var(--chat-muted)]">translateY + shadow</span>
        </div>

        <div className="text-center">
          <div className="w-24 h-24 bg-[var(--chat-primary)] rounded-lg cf-hover-scale cursor-pointer" />
          <span className="text-xs font-mono mt-2 block text-[var(--chat-foreground)]">.cf-hover-scale</span>
          <span className="text-xs text-[var(--chat-muted)]">scale(1.02)</span>
        </div>

        <div className="text-center">
          <div className="w-24 h-24 bg-[var(--chat-primary)] rounded-lg cf-hover-glow cursor-pointer" />
          <span className="text-xs font-mono mt-2 block text-[var(--chat-foreground)]">.cf-hover-glow</span>
          <span className="text-xs text-[var(--chat-muted)]">Primary color glow</span>
        </div>
      </div>
    </div>
  ),
};

export const StaggerSystem: Story = {
  name: "Stagger System",
  render: () => {
    const [key, setKey] = useState(0);

    return (
      <div className="p-6 bg-[var(--chat-card)] rounded-xl border border-[var(--chat-border)]">
        <h2 className="text-2xl font-bold mb-2 text-[var(--chat-foreground)]">Stagger System</h2>
        <p className="text-[var(--chat-muted)] mb-4">
          Use <code className="bg-[var(--chat-input-bg)] px-1 rounded">.cf-stagger-item</code> with{" "}
          <code className="bg-[var(--chat-input-bg)] px-1 rounded">--cf-stagger-index</code> for cascading animations
        </p>

        <button
          onClick={() => setKey((k) => k + 1)}
          className="px-4 py-2 bg-[var(--chat-primary)] text-white rounded-lg mb-6"
        >
          Replay Stagger
        </button>

        <div key={key} className="flex gap-4">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="w-16 h-16 bg-[var(--chat-primary)] rounded-lg cf-stagger-item"
              style={{ "--cf-stagger-index": i } as React.CSSProperties}
            />
          ))}
        </div>

        <div className="mt-6 p-4 bg-[#0f172a] rounded-lg">
          <h4 className="font-semibold mb-2 text-white">Usage</h4>
          <pre className="text-xs text-[#22c55e] overflow-x-auto">
{`{items.map((item, i) => (
  <div
    key={item.id}
    className="cf-stagger-item"
    style={{ "--cf-stagger-index": i }}
  />
))}`}
          </pre>
        </div>
      </div>
    );
  },
};

export const ReducedMotion: Story = {
  name: "Reduced Motion",
  render: () => (
    <div className="p-6 bg-[var(--chat-card)] rounded-xl border border-[var(--chat-border)]">
      <h2 className="text-2xl font-bold mb-2 text-[var(--chat-foreground)]">Reduced Motion Support</h2>
      <p className="text-[var(--chat-muted)] mb-8">
        Accessibility: animations are disabled when user prefers reduced motion
      </p>

      <div className="p-4 bg-[var(--chat-warning)]/10 rounded-lg border border-[var(--chat-warning)]/30">
        <h4 className="font-semibold text-[var(--chat-warning)] mb-2">
          @media (prefers-reduced-motion: reduce)
        </h4>
        <ul className="text-sm text-[var(--chat-foreground)] space-y-1">
          <li>• All animation durations set to 0.01ms</li>
          <li>• Transition durations set to 0.01ms</li>
          <li>• Scroll behavior set to auto</li>
          <li>• Hover transform effects disabled</li>
          <li>• Essential feedback animations (success, error) kept minimal</li>
        </ul>
      </div>

      <div className="mt-6 p-4 bg-[var(--chat-input-bg)] rounded-lg border border-[var(--chat-border)]">
        <h4 className="font-semibold mb-2 text-[var(--chat-foreground)]">Testing</h4>
        <p className="text-sm text-[var(--chat-muted)]">
          Enable "Reduce motion" in your OS accessibility settings to test.
          <br />
          <strong className="text-[var(--chat-foreground)]">macOS:</strong> System Preferences → Accessibility → Display → Reduce motion
          <br />
          <strong className="text-[var(--chat-foreground)]">Windows:</strong> Settings → Ease of Access → Display → Show animations
        </p>
      </div>
    </div>
  ),
};
