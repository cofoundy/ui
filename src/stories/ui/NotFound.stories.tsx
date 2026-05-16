/**
 * NotFound — 404 page for the Cofoundy product suite.
 *
 * ---
 * STRATEGIC BRIEF (compact, from ui-strategist 2026-05-16)
 * ---
 * Consumers: Inbox AI (in-product), Timely AI (public scheduling), Pulse AI
 * (in-product), Cofoundy Landing (public).
 *
 * User state: operator/booker/analyst/prospect mid-task — already had momentum
 * toward a SPECIFIC destination. Trajectory broken. Low-grade confusion + mild
 * distrust. NOT exploratory or playful.
 *
 * Brand stances:
 *   - Sage: name what happened in ONE plain line. Own the constraint.
 *   - Caregiver: own the blocker on Cofoundy side. ONE concrete next step.
 *   - Hero: ONE confident primary CTA. Concrete verb, not generic.
 *
 * Anti-self traps avoided:
 *   - innocent-jester: "Oops!", astronaut cute, 404-pixels-got-lost
 *   - outlaw-dev-error: big mono 404, stack-trace styling, ASCII art
 *   - ruler-corporate: "The resource you requested could not be located..."
 *   - lover-intimacy: "No te preocupes ❤️", performed warmth
 *   - generic-llm: triple anti-self stacked with exclamations
 *   - search-surface: did-you-mean, sitemap, recent updates — out of scope
 *
 * Reuse contract: single component, host-supplied recovery path via
 * `primaryAction`. `productContext` toggles the kicker + scope wording.
 *
 * ---
 * FINAL SCORECARD (ui-refine, 2026-05-16, iter 1 — single-iteration close)
 * ---
 *   composition: 4    hierarchy: 4    whitespace: 4
 *   brand_coherence: 4   typography: 4    alignment: 4
 *   polish: 4    reference_match: 4    strategic_alignment: 5
 *   average: 4.56    ship_status: ship_ready
 *
 * Identity preserved: "Threshold pause" — quiet, Sage-led, asymmetric vertical
 * rhythm, hairline threshold, generous breath. Hero stance committed via
 * brand-primary filled CTA.
 */

import type { Meta, StoryObj } from "@storybook/react";
import { NotFound } from "../../components/ui/NotFound";

const meta: Meta<typeof NotFound> = {
  title: "UI/NotFound",
  component: NotFound,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
  argTypes: {
    productContext: {
      control: "select",
      options: ["inbox", "timely", "pulse", "landing", undefined],
      description: "Which product surfaces the 404. Drives kicker + scope copy.",
    },
    density: {
      control: "select",
      options: ["default", "compact"],
      description: "Vertical rhythm. `default` = full-page breath, `compact` = embedded.",
    },
  },
};

export default meta;

type Story = StoryObj<typeof NotFound>;

/** Default touchpoint — Inbox AI in-product 404. */
export const Default: Story = {
  args: {
    productContext: "inbox",
    primaryAction: { label: "Volver al inbox", href: "/" },
  },
};

/** Inbox AI — operator mid-flow loses a thread URL. */
export const InboxAI: Story = {
  args: {
    productContext: "inbox",
    primaryAction: { label: "Volver al inbox", href: "/" },
  },
};

/**
 * Timely AI — public scheduling link expired or moved. Booker may need to
 * contact the host directly, so the subline acknowledges that path.
 */
export const TimelyAI: Story = {
  args: {
    productContext: "timely",
    primaryAction: { label: "Ver mis citas", href: "/" },
    secondaryMessage:
      "Es posible que el host haya movido el enlace. Escríbele si necesitas reprogramar.",
  },
};

/** Pulse AI — analyst lost a dashboard URL. */
export const PulseAI: Story = {
  args: {
    productContext: "pulse",
    primaryAction: { label: "Ir al dashboard", href: "/" },
  },
};

/** Cofoundy Landing — public visitor hits a dead marketing URL. */
export const Landing: Story = {
  args: {
    productContext: "landing",
    primaryAction: { label: "Ir al inicio", href: "/" },
  },
};

/**
 * Generic white-label — no productContext supplied, host wants to pass its
 * own label. Falls back to "Cofoundy" + "el sitio".
 */
export const Generic: Story = {
  args: {
    productContext: undefined,
    primaryAction: { label: "Ir al inicio", href: "/" },
  },
};

/**
 * Dark theme — verifies the component reads `var(--chat-background)` /
 * `var(--chat-foreground)` from the active theme context. The wrapper sets
 * `data-theme="dark"` which the global stylesheet binds to dark tokens.
 */
export const DarkTheme: Story = {
  args: {
    productContext: "inbox",
    primaryAction: { label: "Volver al inbox", href: "/" },
  },
  parameters: {
    backgrounds: { default: "dark", values: [{ name: "dark", value: "#020b1b" }] },
  },
  decorators: [
    (Story) => (
      <div data-theme="dark" style={{ minHeight: "100vh" }}>
        <Story />
      </div>
    ),
  ],
};

/**
 * Custom title + secondary message — verifies overrides for hosts that want
 * to fully control the copy (e.g. localized strings, A/B variants).
 */
export const CustomCopy: Story = {
  args: {
    productContext: "inbox",
    title: "Esta conversación ya no está disponible.",
    secondaryMessage: "Pudo haber sido archivada o eliminada por el equipo.",
    primaryAction: { label: "Volver a la bandeja", href: "/" },
  },
};
