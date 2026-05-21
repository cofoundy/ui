# @cofoundy/ui — Component Catalog

**Last updated:** 2026-05-20 · **Storybook:** [ui.cofoundy.dev](https://ui.cofoundy.dev) · **Total exports:** ~83

> **For agents:** start at the [Intent Map](#intent-map) below — maps "I need X" → component name + import + story URL. If you don't find your need there, fall through to the [Section tables](#chat) (alphabetical) or run `grep '^export' ~/cofoundy/packages/ui/src/index.ts` for the raw export list. Storybook auto-discovery: `curl -sS https://ui.cofoundy.dev/index.json` returns 598 entries (all stories, parseable JSON).

This file is the **primary discovery surface** for `@cofoundy/ui`. It is hand-curated and complements (does NOT replace) `packages/ui/CLAUDE.md` (which covers setup, theming, transport contracts).

---

## Intent Map

Most common needs first. Story URL pattern: `https://ui.cofoundy.dev/?path=/docs/<slug>--docs`.

| Need | Component | Section | Slug |
|---|---|---|---|
| Build an **embedded chat widget** | `ChatWidget` | Chat | `chat-chatwidget-full` |
| Build a **floating chat bubble** | `ChatWidgetFloating`, `FloatingLauncher`, `FloatingWindow` | Chat | `chat-floating-launcher` |
| Render **streaming LLM markdown** (per-char wave) | `StreamingMarkdown` + `useChatStore` | Messaging | `chat-message`, story `streaming-chunky` |
| Decouple network arrival from visual reveal rate | `useStreamingDrip` (hook) | Hooks | (see [Hooks](#hooks)) |
| Custom message bubble rendering | `MessageBubble`, `MessageContent`, `MessageAvatar`, `MessageTimestamp` | Messaging | `messaging-primitives-*` |
| Compose user input (multi-modal, quick actions, toolbar) | `MessageComposer` | Messaging | `messaging-messagecomposer` |
| Inbox-style message list (Cofoundy InboxAI) | `InboxMessage`, `InboxMessageList` | Messaging | `messaging-inboxmessage` |
| KPI metric tile (number / duration / percentage + trend) | `StatCard` | Analytics | `analytics-statcard` |
| Inline mini trend line (fits in StatCard / DataTable) | `SparkLine` | Analytics | `analytics-sparkline` |
| Vertical bar chart (CSS-only, animated) | `BarChart` | Analytics | `analytics-barchart` |
| Horizontal segmented bar (e.g. AI vs Agent) | `StackedBar` | Analytics | `analytics-stackedbar` |
| Horizontal bar breakdown (channel mix) | `HorizontalBar` | Analytics | `analytics-horizontalbar` |
| Donut / ring chart (CSAT, resolution rate) | `DonutChart` | Analytics | `analytics-donutchart` |
| Conversion funnel with dropoff indicators | `FunnelChart` | Analytics | `analytics-funnelchart` |
| Day × hour heatmap (peak hours, GitHub-style) | `Heatmap` | Analytics | `analytics-heatmap` |
| Minimal stats table (best-value highlighting) | `DataTable` | Analytics | `analytics-datatable` |
| Ranked list (podium + bars) | `Leaderboard` | Analytics | `analytics-leaderboard` |
| Timeline of recent events | `ActivityFeed` | Analytics | `analytics-activityfeed` |
| Progress bar with label + target | `ProgressBar` | Analytics | `analytics-progressbar` |
| Empty state (centered + CTA) | `EmptyState` | Analytics | `analytics-emptystate` |
| Time range picker (7d / 30d / 90d) | `TimeRangeSelector` | Analytics | `analytics-timerangeselector` |
| Section title + action slot | `AnalyticsSectionHeader` | Analytics | `analytics-analyticssectionheader` |
| Cal.com booking CTA | `CalBookingButton` (canonical) / `CalendlyButton` (legacy alias) | UI | `ui-calbookingbutton` |
| **Cofoundy branding** (logo, footer attribution, shimmer) | `Logo`, `LogoHeader`, `Wordmark`, `CofoundyBadge`, `ShimmerText`, `GradientBorder` | UI | use `/branding` skill (it handles these) |
| 404 / not-found page | `NotFound` | UI | `ui-notfound` |
| Sidebar layout system (composable) | `Sidebar*` (Provider / Content / Header / Footer / Menu / ...) | UI | `ui-sidebar` |
| Dialog / modal | `Dialog` (+ `DialogContent`, `DialogTrigger`, ...) | UI | `ui-dialog` |
| Confirm + danger-zone | `ConfirmDialog`, `DangerZone`, `DangerZoneItem` | UI | `ui-confirmdialog` |
| Dropdown menu | `DropdownMenu` (+ subcomponents) | UI | `ui-dropdownmenu` |
| Bottom sheet / side sheet | `Sheet` (+ subcomponents) | UI | `ui-sheet` |
| Select / combobox | `Select` (+ subcomponents) | UI | `ui-select` |
| Tabs | `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` | UI | `ui-tabs` |
| Tooltip | `Tooltip` (+ `TooltipContent`, `TooltipTrigger`, `TooltipProvider`) | UI | `ui-tooltip` |
| Collapsible | `Collapsible`, `CollapsibleContent`, `CollapsibleTrigger` | UI | `ui-collapsible` |
| Breadcrumb | `Breadcrumb` (+ subcomponents) | UI | `ui-breadcrumb` |
| Avatar | `Avatar`, `AvatarImage`, `AvatarFallback` | UI | `ui-avatar` |
| Badge (channel-aware variants) | `Badge`, `ChannelBadge`, `CofoundyBadge` | UI | `ui-badge`, `ui-channelbadge` |
| Button (CVA variants) | `Button` | UI | `ui-button` |
| Input | `Input` | UI | `ui-input` |
| Spinner / skeleton | `Spinner`, `Skeleton` | UI | `ui-spinner`, `ui-skeleton` |
| Theme toggle | `ThemeSwitcher` | UI | `ui-themeswitcher` |
| Toast notifications | `Toaster`, `toast` | UI | `ui-toaster` |
| Switch / Separator | `Switch`, `Separator` | UI | `ui-switch`, `ui-separator` |
| Logo (3D cube isologo) | `Logo` | UI | `ui-logo` |
| Dropdown nav (mega-menu-lite) | `NavDropdown` | Navigation | `navigation-navdropdown` |
| Hero with animated WebGL gradient + poster fallback | `ShaderHero` | Hero | `hero-shaderhero` |
| Transactional email template (rendered server-side) | see [Email](#email) (9 templates) | Email | `email-*` |
| **Docs MDX components** (allowlist for `docs-ai/content/*`) | see [Docs](#docs) (15 components) | Docs | `docs-*` |
| Slot-composable client portal page | `ClientPortalPanel` | Docs | `docs-clientportalpanel` |
| Wikilink hover preview in docs | `LinkPreviewProvider` | Docs | `docs-linkpreview` |

---

## Hooks

| Hook | Description |
|---|---|
| `useChatTransport` | Unified hook over WebSocket + Socket.IO transports (TimelyAI + InboxAI). Returns AG-UI event stream. |
| `useWebSocket` | Raw WebSocket hook (TimelyAI). |
| `useAGUI` | AG-UI event protocol consumer. Tool-call lifecycle states. |
| `useChatStore` | Zustand chat store (messages, streaming state, suggested slots, appointment confirmation). |
| `useStreamingDrip` | Decouples network arrival from visual reveal rate. Modes: `adaptive` / `typewriter` / `off`. |
| `useSession` | Session lifecycle helper. |
| `useAutoScroll` | Auto-scroll to bottom on new content, respects user scroll intent. |
| `useIsMobile` | Viewport breakpoint hook. |
| `useAnimatedValue` | Animate a number/value between renders. |
| `useMountTransition` | Mount/unmount transition timing helper. |

---

## Section tables

### Chat

12 stories. Chat widget surface (TimelyAI, landing chat, InboxAI shell).

| Component | Description |
|---|---|
| `ChatWidget` | Full embedded widget. Reads chat store + transports, renders header/list/input. |
| `ChatWidgetFloating` / `FloatingChatWidget` | Floating bubble variant. Same store, popup window. |
| `FloatingLauncher` | Just the bubble button (compose your own window). |
| `FloatingWindow` | Just the popup window (compose your own launcher). |
| `ChatHeader` | Brand name + subtitle + connection status. |
| `ChatInput` | Bottom input bar with send button. |
| `Message` | Single message bubble. Auto-uses `StreamingMarkdown` when assistant + active stream. |
| `ConfirmationCard` | Appointment confirmation card (rendered when `schedule_appointment` tool result arrives). |
| `TimeSlotGrid` | Time slot picker (rendered when `check_availability` tool result arrives). |
| `TypingIndicator` | Animated "typing..." indicator. |
| `ToolIndicator` | "AI is checking calendar..." inline tool-execution indicator. |
| `QuickActions` | Inline quick-reply buttons. |

### Messaging

Generic messaging primitives (used by InboxAI; reusable for any chat surface).

| Component | Description |
|---|---|
| `MessageBubble` | Bubble container with role-based styling. |
| `MessageContent` | Markdown / plain text renderer (fallback path; static, no animation). |
| `MessageAvatar` | Sender avatar with role-aware fallback. |
| `MessageTimestamp` | Timestamp with relative / absolute format. |
| `MessageStatus` | Sent / delivered / read indicator. |
| `MessageContainer` | Layout primitive (flex row + alignment). |
| `MessageMedia` | Media attachment renderer (image / file / audio). |
| **`StreamingMarkdown`** | **NEW (v0.5.1)** — Per-char wave reveal for LLM streaming. Walks hast tree, emits flat spans keyed by source offset. Drops to `<MessageContent>` when content > 5000 chars or `prefers-reduced-motion`. |
| `InboxMessage`, `InboxMessageList` | Composed message list (InboxAI). |
| `MessageComposer` | Multi-modal input (text + attachments + toolbar + quick actions). |
| `AIBadge` | "AI" inline pill (mark AI-generated content). |

### Analytics

16 components. **Pure CSS / Tailwind — no charting libraries.**

| Component | Description |
|---|---|
| `StatCard` | KPI metric tile (number / duration / percentage + trend arrow). CVA size. |
| `SparkLine` | Inline SVG mini trend line. Fits inside StatCard / DataTable. |
| `BarChart` | Vertical bar chart (CSS, animated). |
| `StackedBar` | Horizontal segmented bar (AI vs Agent breakdown). |
| `HorizontalBar` | Horizontal bars (channel breakdown). |
| `DonutChart` | Circular ring chart (conic-gradient). For CSAT / resolution rate. |
| `FunnelChart` | Conversion funnel with dropoff indicators. |
| `Heatmap` | Day × hour grid (GitHub-style contribution heatmap). |
| `DataTable` | Minimal stats table with best-value highlighting. |
| `Leaderboard` | Ranked list with podium styling + inline bars. |
| `ActivityFeed` | Timeline of recent events with actors. |
| `ProgressBar` | Progress bar with label + target. |
| `EmptyState` | Centered empty state with CTA. |
| `TimeRangeSelector` | Segmented pill control (7d / 30d / 90d). |
| `AnalyticsSectionHeader` | Section title + action slot. |
| `(Dashboard story)` | Composed analytics dashboard (no canonical export — see `Analytics/Dashboard` story for layout). |

### UI

25 primitives. shadcn/ui base, theme-tokenized.

`Button`, `Input`, `Badge`, `ChannelBadge`, `Avatar`, `Spinner`, `Skeleton`, `Switch`, `Separator`, `Tabs`, `Tooltip`, `Collapsible`, `Select`, `DropdownMenu`, `Sheet`, `Dialog`, `Breadcrumb`, `Sidebar` (+ ~20 subcomponents), `Toaster`/`toast`, `ConfirmDialog`, `DangerZone`/`DangerZoneItem`, `Logo`, `LogoHeader`/`Wordmark`, `CofoundyBadge`, `ChannelBadge`, `CalBookingButton`/`CalendlyButton` (legacy alias), `NotFound`, `ThemeSwitcher`, `ShimmerText`, `GradientBorder`.

For **brand identity work** (badge, logo, attribution) use the `/branding` skill — it covers `Logo`, `LogoHeader`, `CofoundyBadge`, `ShimmerText`, `GradientBorder` with brand-aligned variants.

### Foundation

5 design-token stories. **Not importable components** — these document the system.

| Story | What it documents |
|---|---|
| `Foundation/Tokens` | All CSS variables (chat-*, channel-*, status-*, cf-*). |
| `Foundation/Colors` | Brand palette + channel-aware colors. |
| `Foundation/Typography` | Inter / Space Grotesk / JetBrains Mono pairings. |
| `Foundation/Spacing` | Spacing scale (Tailwind-aligned). |
| `Foundation/Animation` | Duration / easing / stagger tokens. |

### Hero

| Component | Description |
|---|---|
| `ShaderHero` | Animated WebGL gradient hero (shadergradient.react) + mobile/reduced-motion poster fallback. See `/hero-shader` skill for config conventions. |

### Navigation

| Component | Description |
|---|---|
| `NavDropdown` | Mega-menu-lite dropdown for top nav. |

### Email

9 transactional templates (server-side render via `scripts/render-email.ts`).

| Template | Purpose |
|---|---|
| `BienvenidaCliente` | Onboarding email (welcome + next steps). |
| `CotizacionFollowup` | Quote follow-up. |
| `CierreProyecto` | Project close-out. |
| `DevEntrega` | Dev hand-off / delivery. |
| `EnvioContrato` | Contract send (with host logo). |
| `PersonalNote` | Markdown-driven personal note (agent writes md → system renders brand). |
| `Email/Primitives` | Building blocks (InfoBox, Header, Footer, etc.). |
| `Reactivacion` | Re-engagement template. |
| `RecuperacionCarrito` | Cart recovery (e-commerce client projects). |

### Docs

15 components for `docs.cofoundy.dev` (MDX-ready). The first 9 are in the **atelier registry** (`src/lib/atelier-registry.ts`) and are auto-allowlisted for agents authoring MDX via `AGENTS.md`.

**Atelier-registered (allowlist for `docs-ai/content/*.mdx`):**

| Component | Description |
|---|---|
| `BuildProgress` | Phased delivery timeline (L0-L9). |
| `ComparisonMatrix` | Trade-off matrix with traffic-light enum per cell. |
| `DesignSystemPanel` | Brand direction sample (colors, typography, spacing). |
| `KPIBoard` | Grid of KPI tiles with trend / target / baseline. |
| `MoodBoard` | Image grid with concept-tag grouping. |
| `PersonaCard` | Target persona (demographics, pains, JTBD). |
| `QuoteCard` | Itemized cotización with milestones + total. |
| `Sitemap` | Hierarchical site map (collapsible tree). |
| `TestimonialCard` | Single client testimonial. |

**Other docs components (NOT in atelier allowlist):**

| Component | Description |
|---|---|
| `AuthorNote` | Inline author note callout. |
| `InfoBox` | Generic callout (info / warn / tip variants). |
| `LinkPreviewProvider` | **NEW (v0.5.1)** — wikilink hover preview. Same-origin anchors with `data-link-preview` opt in via event delegation. |
| `ClientPortalPanel` | Slot-composable client portal page (23 slots). For `/client/{slug}/` routes. |
| `NextStepCallout` | Sequenced next-step callout. |

### Effects

| Component | Description |
|---|---|
| `ShimmerText` | Animated gradient text. Used inside `CofoundyBadge` and brand elements. |

---

## When this file goes stale

This file is **hand-curated**. If you add an export to `src/index.ts` and don't update this file, agents will not discover your component.

Tooling to detect drift (TODO):

- `scripts/audit-components-md.ts` — list exports in `src/index.ts` that are not mentioned in `COMPONENTS.md`. Run on CI as a non-blocking warning until coverage reaches 100%.

For now, before merging a PR that adds an export, search this file for the component name. If not present, add a row to the Intent Map + Section table.
