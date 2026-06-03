# @cofoundy/ui

Shared UI component library for the Cofoundy product suite.

> **Looking for a component to use?** Open [`COMPONENTS.md`](./COMPONENTS.md) — intent map + section tables for all current exports. This file covers setup, theming, transport contracts, and AI-assistant rules.
>
> **SSOT rule:** `COMPONENTS.md` owns the components index. When you add or remove exports from `src/index.ts`, update `COMPONENTS.md` (header count + relevant section table). `AI.md` never needs editing — it only points here.

## Quick Reference

```bash
# Storybook
npm run storybook        # http://localhost:6006

# Tests
npm test                 # Run tests
npm run test:watch       # Watch mode
npm run test:coverage    # Coverage report

# Build IIFE (standalone widget)
npm run build:iife
```

## Package Structure

```
src/
├── components/
│   ├── ui/                    # shadcn/ui primitives
│   │   ├── button.tsx
│   │   ├── badge.tsx
│   │   ├── input.tsx
│   │   └── ...
│   │
│   ├── chat-widget/           # Chat widget system
│   │   ├── ChatWidget.tsx         # Main embedded widget
│   │   ├── ChatWidgetFloating.tsx # Floating bubble widget
│   │   ├── FloatingLauncher.tsx   # Bubble button
│   │   ├── FloatingWindow.tsx     # Popup window
│   │   ├── ChatHeader.tsx
│   │   ├── ChatInput.tsx
│   │   ├── Message.tsx
│   │   └── ...
│   │
│   ├── messaging/             # InboxAI messaging primitives
│   │   ├── MessageBubble.tsx
│   │   ├── InboxMessage.tsx
│   │   └── ...
│   │
│   └── analytics/             # Pure CSS data visualization (15 components)
│       ├── StatCard.tsx           # KPI metric card (CVA: size)
│       ├── SparkLine.tsx          # Inline SVG mini trend line
│       ├── BarChart.tsx           # Vertical bar chart
│       ├── StackedBar.tsx         # Horizontal segmented bar
│       ├── DonutChart.tsx         # Circular ring chart (conic-gradient)
│       ├── ProgressBar.tsx        # Progress bar with target
│       ├── Heatmap.tsx            # Day/hour grid (GitHub-style)
│       ├── FunnelChart.tsx        # Conversion funnel
│       ├── DataTable.tsx          # Minimal stats table
│       ├── Leaderboard.tsx        # Ranked list with bars
│       ├── HorizontalBar.tsx      # Horizontal bar breakdown
│       ├── ActivityFeed.tsx       # Timeline of recent events
│       ├── EmptyState.tsx         # Analytics empty state
│       ├── TimeRangeSelector.tsx  # Segmented time picker
│       ├── AnalyticsSectionHeader.tsx
│       └── index.ts
│
├── transports/                # Backend connection adapters
│   ├── types.ts               # Transport interfaces
│   ├── WebSocketTransport.ts  # For TimelyAI
│   └── SocketIOTransport.ts   # For InboxAI (dynamic import)
│
├── hooks/
│   ├── useChatTransport.ts    # Unified transport hook
│   ├── useWebSocket.ts        # Raw WebSocket hook
│   ├── useAutoScroll.ts
│   └── useSession.ts
│
├── stores/
│   └── chatStore.ts           # Zustand chat state
│
├── styles/
│   └── index.css              # CSS variables & theme tokens
│
├── stories/                   # Storybook stories
│   ├── chat-widget/           # Chat component stories
│   ├── messaging/             # Messaging component stories
│   ├── ui/                    # UI primitive stories
│   └── foundation/            # Design token stories
│
├── iife/                      # Standalone widget build
│   └── index.tsx              # IIFE entry point
│
└── __tests__/                 # Vitest tests
    ├── components/
    ├── hooks/
    └── transports/
```

## Key Exports

### Chat Widget (for TimelyAI, Landing Page)
```typescript
import {
  ChatWidget,           // Embedded mode
  ChatWidgetFloating,   // Floating bubble mode
  FloatingLauncher,     // Just the bubble button
  FloatingWindow        // Just the popup container
} from '@cofoundy/ui'
```

### Transport Layer
```typescript
import {
  useChatTransport,           // Unified hook
  createTransportConfigFromUrl
} from '@cofoundy/ui'

// Config types
type TransportConfig =
  | { type: 'websocket', url: string }
  | { type: 'socketio', url: string, tenantId: string }
```

### UI Primitives
```typescript
import {
  Button, Badge, Input, Avatar,
  Tabs, Switch, Spinner, Logo
} from '@cofoundy/ui'
```

### Messaging (for InboxAI)
```typescript
import {
  MessageBubble,
  InboxMessage,
  InboxMessageList,
  MessageComposer
} from '@cofoundy/ui'
```

### ClientPortalPanel (for DocsAI `/client/{slug}/` routes)

**Slot-composable** — 23 slots, NOT in atelier-registry (it's a compound family, not a single component). Used in MDX to author per-client portals. Per-client brand accent via `--portal-accent` CSS var prop on `<Root>`.

```typescript
import { ClientPortalPanel } from '@cofoundy/ui'

<ClientPortalPanel.Root accentColor="#0F5132">
  <ClientPortalPanel.Hero title="XGodel" status="en-build" tagline="..." />
  <ClientPortalPanel.Approvals items={[...]} />     {/* P0: weekly-return driver */}
  <ClientPortalPanel.Phase percent={78} stages={[...]} current="build" />
  <ClientPortalPanel.Milestones items={[...]} />
  <ClientPortalPanel.LiveSites items={[...]} />
  <ClientPortalPanel.Brand palette={[...]} type={[...]} pdfCover="..." />
  <ClientPortalPanel.Strategy ... />
  <ClientPortalPanel.Concepts items={[...]} chosen="C" />
  <ClientPortalPanel.Tasks projectId={22} columns={[...]} />   {/* Vikunja snapshot */}
  <ClientPortalPanel.Build repos={[...]} cronograma={...} />
  <ClientPortalPanel.Documents items={[...]} />     {/* quote/contract/nda/invoice */}
  <ClientPortalPanel.Meetings past={[...]} upcoming={[...]} />
  <ClientPortalPanel.Payments total={...} paid={...} next={...} />
  <ClientPortalPanel.Activity events={[...]} />
  <ClientPortalPanel.Guides items={[...]} />
  <ClientPortalPanel.Downloads items={[...]} />
  <ClientPortalPanel.AccessRegistry items={[...]} />   {/* NEVER credential values */}
  <ClientPortalPanel.OnboardingChecklist items={[...]} />
  <ClientPortalPanel.Team members={[...]} />
  <ClientPortalPanel.ScheduleCTA url="https://cal.cofoundy.dev/..." />
</ClientPortalPanel.Root>
```

**Slot inventory:** `Root`, `Hero`, `Phase`, `LiveSites`, `Brand`, `Strategy`, `Concepts`, `Build`, `Payments`, `Activity`, `Team`, `ArtifactTile`, `SectionHeading`, `Approvals`, `Documents`, `Meetings`, `Tasks`, `Milestones`, `Guides`, `Downloads`, `AccessRegistry`, `OnboardingChecklist`, `ScheduleCTA`.

**`<AccessRegistry>` security policy** — inventory ONLY (system name + status: `granted`/`bitwarden-send-issued`/`pending`/`not-applicable`). NEVER renders password/secret values. Actual credentials go via Bitwarden Send (TTL, single-fetch) by WhatsApp/email out-of-band. Reasons: Bitwarden is purpose-built (audit log, rotation), CF Access cookie-stealing blast radius, Peru Law 29733 compliance, drift between SoT systems.

**Source code:** `src/components/docs/ClientPortalPanel.tsx` (facade) + `src/components/docs/client-portal/*.tsx` (23 slot impls). Stories at `src/stories/docs/ClientPortalPanel.stories.tsx` (XGodel-Full, XGodel-Onboarding, Acme-Mid-Build, Acme-Post-Launch, Minimal, Light).

### Analytics (for PulseAI, dashboards)
```typescript
import {
  // KPI & Metrics
  StatCard,              // KPI metric card (number/duration/percentage, trend arrows)
  SparkLine,             // Inline SVG mini trend line (fits in StatCard/DataTable)
  DonutChart,            // Circular ring chart (CSAT, resolution rate)
  ProgressBar,           // Progress bar with label + target

  // Charts
  BarChart,              // Vertical bar chart (pure CSS, animated)
  StackedBar,            // Horizontal segmented bar (AI vs Agent)
  HorizontalBar,         // Horizontal bars (channel breakdown)
  Heatmap,               // Day/hour grid (peak hours analysis)
  FunnelChart,           // Conversion funnel with dropoff indicators

  // Tables & Lists
  DataTable,             // Minimal stats table with best-value highlighting
  Leaderboard,           // Ranked list with podium styling + bars
  ActivityFeed,          // Timeline of recent events with actors

  // Layout & Controls
  AnalyticsSectionHeader,// Section title + action slot
  TimeRangeSelector,     // Segmented pill control (7d/30d/90d)
  EmptyState,            // Centered empty state with CTA
} from '@cofoundy/ui'
```

## Theming

All components use CSS variables for theming:

```css
:root {
  /* Brand colors */
  --chat-primary: #2984AD;
  --chat-background: #020916;
  --chat-foreground: #ffffff;
  --chat-muted: #848386;
  --chat-border: rgba(255, 255, 255, 0.1);
  --chat-card: rgba(255, 255, 255, 0.05);

  /* Shadcn-compatible tokens */
  --primary: var(--chat-primary);
  --background: var(--chat-background);
  --foreground: var(--chat-foreground);
}
```

## Usage in Projects

### In package.json
```json
"@cofoundy/ui": "file:../../packages/ui"
```

### Next.js Configuration

**1. Use Webpack (Turbopack has symlink issues):**
```json
"scripts": {
  "dev": "next dev --webpack"
}
```

**2. Add to next.config.ts:**
```typescript
transpilePackages: ['@cofoundy/ui'],
```

### Import Styles (REQUIRED)

**⚠️ IMPORTANT: Import via JavaScript, NOT CSS @import**

```typescript
// In your app/layout.tsx (or _app.tsx)
import '@cofoundy/ui/styles';  // ← MUST be first
import './globals.css';         // Then your local styles
```

**Why JS import instead of CSS @import?**
- `@import "@cofoundy/ui/styles"` fails with PostCSS + symlinks
- `import '@cofoundy/ui/styles'` works because bundler uses Node resolution

**DO NOT do this:**
```css
/* ❌ This FAILS with symlinked packages */
@import "@cofoundy/ui/styles";
```

## Development Guidelines

### Adding Components
1. Check if shadcn/ui has it: `npx shadcn@latest add [component]`
2. Customize with Cofoundy theme tokens
3. Add Storybook story in `src/stories/`
4. Export from `src/index.ts`
5. Add tests in `src/__tests__/`

### Story Location
- UI primitives: `stories/ui/ComponentName.stories.tsx`
- Chat widget: `stories/chat-widget/ComponentName.stories.tsx`
- Messaging: `stories/messaging/ComponentName.stories.tsx`
- Analytics: `stories/analytics/ComponentName.stories.tsx` (individual files + Dashboard.stories.tsx for composed views)

### Testing
```bash
npm test                    # Run all tests
npm run test:coverage       # With coverage
```

## Deployment

Storybook is deployed to **Cloudflare Pages** (not Railway) at **ui.cofoundy.dev**.
- **Auto-deploy on push to `main`** via GitHub Actions (`.github/workflows/deploy.yml`)
- Chromatic visual testing also runs on push
- No manual deploy needed — just push

## Products Using This Package

| Product | Components Used |
|---------|-----------------|
| **TimelyAI** | ChatWidget, ChatWidgetFloating, transports |
| **InboxAI** | Badge, Avatar, Messaging components |
| **Landing Page** | ChatWidgetFloating, FloatingLauncher |
| **PulseAI** | UI primitives, Analytics components |

## Transport Layer API

### Supported Transports

| Type | Backend | Protocol |
|------|---------|----------|
| `websocket` | TimelyAI | Raw WebSocket + AG-UI events |
| `socketio` | InboxAI | Socket.IO + AG-UI relay |

### AG-UI Event Protocol

The frontend expects these AG-UI events from the backend:

```typescript
// Message streaming
{ type: "TEXT_MESSAGE_CONTENT", delta: "Hello..." }
{ type: "TEXT_MESSAGE_END" }
{ type: "RUN_ERROR", message: "Error description" }

// Tool execution
{ type: "TOOL_CALL_START", toolCallName: "schedule_appointment", toolCallId: "..." }
{ type: "TOOL_CALL_END", toolCallId: "..." }
{ type: "TOOL_CALL_RESULT", toolCallId: "...", result: "<JSON string>" }
```

### TimelyAI Tool Output Schemas

#### `schedule_appointment` (triggers ConfirmationCard)

```json
{
  "success": true,           // ← REQUIRED for confirmation trigger
  "datetime": "2025-01-27 10:00 AM PST",
  "client_name": "John Doe",
  "client_email": "john@example.com",
  "topic": "Consultoría técnica",
  "event_id": "calendar_event_id",   // optional
  "event_link": "https://calendar.google.com/...",  // optional
  "invitation_mode": "resend",       // not used by frontend
  "email_sent": true,                // not used by frontend
  "message": "Appointment confirmed" // not used by frontend
}
```

#### `check_availability` (triggers TimeSlotGrid)

```json
{
  "success": true,
  "date": "2025-01-27",
  "available_slots": ["10:00 AM EST", "2:00 PM EST", "4:00 PM EST"],
  "source": "google_calendar",
  "message": "Found 3 available time slots"
}
```

### Frontend Types (must match backend)

```typescript
// AppointmentConfirmation - parsed from schedule_appointment result
interface AppointmentConfirmation {
  datetime: string;      // from result.datetime
  client_name: string;   // from result.client_name
  client_email: string;  // from result.client_email
  topic: string;         // from result.topic
  event_id?: string;     // from result.event_id
  event_link?: string;   // from result.event_link
}
```

### Socket.IO Transport (InboxAI)

```typescript
// Connection config
{
  type: 'socketio',
  url: 'https://inbox.cofoundy.dev',
  tenantId: 'ten_xxx',
  namespace: '/'  // optional
}

// Auth: Widgets use { auth: { widget: true } } to bypass JWT
// Init: Sends 'widget_init' event on connect
// Messages: Sends 'widget_message' event
// Receives: 'ag_ui:event', 'message:new', 'widget:session'
```

---

## Component Patterns

Every component in this library follows these conventions:

```typescript
// 1. CVA for variants
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../utils/cn";

const fooVariants = cva("base-classes", { variants: { ... }, defaultVariants: { ... } });

// 2. Props interface extends VariantProps
export interface FooProps extends VariantProps<typeof fooVariants> { ... }

// 3. data-slot on root element
<div data-slot="foo" className={cn(fooVariants({ size }), className)}>

// 4. Export both component and variants
export { fooVariants };
```

- All colors via CSS variables (`var(--chat-*)`, `var(--channel-*)`, `var(--status-*)`)
- `font-mono` for numbers/stats, `font-sans` for labels, `font-display` for headings
- Animations use `cf-animate-*` utility classes or `var(--cf-duration-*)` / `var(--cf-ease-*)` tokens
- Light/dark mode via `[data-theme="light"]` / `[data-theme="dark"]` selectors in `styles/index.css`

## Mobile-state stories — `MobileBaseline` contract

Every **interactive primitive** (Button, Input, NavDropdown, DataTable, Sheet,
Tabs, Switch, Select, anything users tap/type/drag) **MUST** export a story
named `MobileBaseline` that renders the component at the canonical mobile
viewport (375 px, iPhone SE). This makes the mobile-first contract visible
at story-review time, not after a real device exposes the regression.

```ts
import { VIEWPORT_MOBILE } from '../_shared/viewports';

export const MobileBaseline: Story = {
  parameters: { viewport: VIEWPORT_MOBILE },
  // …render the component — verify ≥ 44×44 px tap targets + ≥ 16 px input
  //  font-size + clamp() widths.
};
```

Shared viewport constants live in `src/stories/_shared/viewports.ts`
(`VIEWPORT_MOBILE`, `VIEWPORT_MOBILE_LANDSCAPE`, `VIEWPORT_TABLET`,
`VIEWPORT_DESKTOP`). Never redeclare these constants per-story — import them.

**Tier-1 pilot scope (this cycle).** `Button`, `Input`, `NavDropdown`. Backfill
of remaining 91 stories is deferred to Tier 2, one task per category.

**Source.** docs-ai `.cofoundy/specs/architecture-v1.md` §8 + the canonical PRD
at `docs.cofoundy.dev/team/docs-ai/mobile-first-contract-v1` (§7).

## AI Assistant Rules

1. **ALWAYS add Storybook stories** for new components
2. **ALWAYS add tests** for hooks and transports
3. **Use CSS variables** - never hardcode colors
4. **Export from index.ts** - all public components must be exported
5. **Check multiple projects** - changes here affect TimelyAI, InboxAI, Landing
6. **Run Storybook** to verify visual changes: `npm run storybook`
7. **Keep schemas synced** - frontend types MUST match backend tool outputs
8. **No external charting libraries** - analytics components use pure CSS/Tailwind
9. **Push to main auto-deploys** Storybook to ui.cofoundy.dev via Cloudflare Pages
