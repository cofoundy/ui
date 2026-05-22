# Changelog

All notable changes to `@cofoundy/ui` are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.6.0] — 2026-05-22

### Added

- **`CommandPalette`** + **`CommandPaletteTrigger`** — generalized vault/search palette, extracted from `docs-ai-vault-search` and reshaped for shared consumption. Props-driven (`searchFn`, `onNavigate`, `recents`, `recentSearches`, `emptyActions`), brand-themed via the existing `--cf-*` CSS variables (with safe `:where(...)` fallbacks for standalone use), and shipped with two themes (light/dark) + a mobile bottom-sheet variant.
- **`useCommandPaletteHotkeys`** — minimal hook that binds the canonical `Cmd+K` / `Ctrl+K`, `/`, and `Esc` keys to a controlled `open` state. Respects `INPUT`/`TEXTAREA`/`contenteditable` so native typeahead and prose editing keep working.
- Types: `CommandPaletteProps`, `CommandPaletteTriggerProps`, `SearchHit`, `SearchResponse`, `SearchFn`, `DocRole`, `RecentDoc`, `RecentSearch`, `EmptyAction`.
- Telemetry hooks: `onSearch?(query, hits, took_ms?)` and `onSelect?(hit, idx, source: 'click' | 'enter')` — consumer-level analytics without wrapping `searchFn`.

### Safety + a11y

- Snippet HTML is sanitized by default (allow-only `<mark>`); consumers with trusted backends opt in via `trustSnippetHtml`.
- External-origin hits open in a new tab with `rel="noopener noreferrer"` automatically.
- Focus trap on the dialog; `aria-controls` only references the listbox when mounted; option IDs namespaced via `useId` to prevent collisions between parallel instances; focus restore guarded by `isConnected`; full `prefers-reduced-motion` fallback.

### Performance

- Singleton CSS injection (`<style id="cp-styles">` appended once to `<head>`) — no per-mount re-parse.
- Refcounted body scroll-lock — composes safely with sibling modals.
- `minQueryLength` prop (default 2) + stale-results indicator during debounce — fewer wasted fetches, clearer typing feedback.

### Notes

- `SearchHit.role` is now optional; when present it renders as a small role badge next to the title.
- Trigger pill's 44×44 minimum hit target is gated behind `@media (pointer: coarse)` so desktop keeps the visually-designed 32px height.

Files: `src/components/command-palette/CommandPalette.tsx`, `src/__tests__/components/command-palette/CommandPalette.test.tsx` (21 tests), `src/stories/command-palette/CommandPalette.stories.tsx`, `src/index.ts` (new public exports).

## [0.5.3] — 2026-05-20

### Fixed

- **`Message.tsx` — preserve `<StreamingMarkdown>` render path after stream finishes.** Previously the component swapped from `<StreamingMarkdown>` to `<MessageContent>` at end-of-stream. `MessageContent` relies on Tailwind's `prose` class for heading styles, but `@tailwindcss/typography` is not installed in the consuming apps — so `h2` (e.g. "Estimación rápida") collapsed from `1.35em` (StreamingMarkdown's inline `BLOCK_STYLES`) to the browser default ~21px, producing a visible heading-shrink regression at end-of-stream. Fix: render `<StreamingMarkdown>` for ALL assistant messages and toggle the `isStreaming` prop based on `isStreamingThis`. User messages keep `<MessageContent>` (user input rarely contains markdown). The wrapper's `.cf-stream-root` stays mounted; only `.cf-stream-active` drops at completion, freezing chars in place with zero layout shift.

  Files: `src/components/chat-widget/Message.tsx`, `src/__tests__/components/Message.streaming.test.tsx`.

## [0.5.2] — 2026-05-20

### Added

- **`StreamingMarkdown`** + **`useStreamingDrip`** — per-char wave reveal for LLM streaming output. The primitive walks the hast tree via `react-markdown` overrides and emits flat `<span>` elements keyed by absolute source offset, so markdown structure changes mid-stream (e.g., `**` closing into a `<strong>`) don't remount existing chars — only their className transitions. Wired into `Message.tsx`: renders `<StreamingMarkdown>` while `useChatStore.isStreaming && streamingMessageId === message.id`, falls back to `<MessageContent>` otherwise.

  **Drip hook (`useStreamingDrip`):** decouples network arrival from visual reveal rate. Modes: `adaptive` (default — caps `cps` at `incomingCps × 1.2` to avoid burst-catchup), `typewriter` (fixed rate), `off` (passthrough).

  **CSS:** `display: inline` (no per-char inline-block gaps), `.cf-stream-active` parent class gates the keyframe so completed spans freeze in place when the stream ends — no flicker, no layout shift. Respects `prefers-reduced-motion`.

  **Storybook:** `Chat/Message → Streaming Chunky / Smooth / Finished` exercises the wiring via the actual `chatStore`. `Chat/Streaming Animation Playground` retained as design exploration (7 strategies; Wave + MD won).

  Files: `src/components/messaging/primitives/StreamingMarkdown.tsx`, `src/hooks/useStreamingDrip.ts`, `src/__tests__/components/{StreamingMarkdown.debug,Message.streaming}.test.tsx` (8 tests), `docs/superpowers/specs/2026-05-14-streaming-markdown-wave-design.md`.

## [0.5.1] — 2026-05-20

### Added

- **`LinkPreviewProvider`** — wikilink hover preview for docs.cofoundy.dev. Mounts once around a doc-content tree; same-origin anchors with `data-link-preview` opt in via event delegation. Sage-pure surface (variant `quiet` canonical; `card` + `glass` available as variants).

  **Data contract — agnostic:** consumer passes `getPreview(href)` (sync cache hit) and/or `fetchPreview(href)` (async fallback with skeleton). Both modes supported simultaneously — sync first, async on miss.

  **Behavior:** 180ms open delay, 120ms close grace; cursor into popover resets the close timer. Dismiss on ESC, scroll (outside popover), click-outside. Smart positioning — anchors below trigger, flips to top near viewport bottom, clamps horizontally inside viewport. Auto-disables on `(hover: none)` media (touch).

  **A11y:** `role="tooltip"`, `aria-busy` skeleton, keyboard mirroring via `focusin`/`focusout`. Respects `prefers-reduced-motion` — instant show/hide when set.

  **Variants:**
  - `quiet` (default) — minimal chrome, hairline border, no accent stripe. Sage-pure.
  - `card` — index-card / citation. Kind-tag + display title + footnote meta.
  - `glass` — 4px brand-blue leading ribbon + backdrop-filter. Matches AuthorNote / NextStepCallout family.

  Surface dispatcher allows future variants without touching the orchestration layer (provider stays variant-agnostic).

  Files: `src/components/docs/link-preview/{LinkPreviewProvider,LinkPreviewSurface,types,usePreviewPosition}.tsx` + `surfaces/LinkPreview{Quiet,Card,Glass}.tsx`. Test: `src/__tests__/components/docs/link-preview.test.tsx` (7 tests). Story: `src/stories/docs/LinkPreview.stories.tsx` (8 stories: CacheHit, CacheMiss, Hybrid, LightTheme, ReducedMotion, SlowFetch, ErrorState).

  **Integration:** import `{ LinkPreviewProvider }` from `@cofoundy/ui`. Wrap the doc content (e.g., inside `<DocLayout>` around the `.reader-prose` article). Anchors in precompiled HTML must include `data-link-preview` attribute — the docs-ai publish pipeline can inject this on internal links during MDX → HTML compile.

## [0.5.0] — 2026-05-19

### Added

- **`ClientPortalPanel`** — slot-composable client portal page (23 slots). Notion-style dashboard for `/client/{slug}/` routes in DocsAI V2.6, gated by CF Access role=client. Editorial-bento layout with size variance enforced. Per-client brand accent via `--portal-accent` CSS var prop.

  **10 v1 slots:** `Root`, `Hero`, `Phase`, `LiveSites`, `Brand`, `Strategy`, `Concepts`, `Build`, `Payments`, `Activity`, `Team`, `ArtifactTile`, `SectionHeading`.

  **10 v2 slots** (this release): `Approvals` (queue-cards, weekly-return driver), `Documents` (quote/contract/nda/invoice tile-grid), `Meetings` (past+upcoming timeline), `Tasks` (Vikunja snapshot), `Milestones` (status list), `Guides` (knowledge tiles), `Downloads` (asset list), `AccessRegistry` (system inventory, **NEVER credential values** — Bitwarden Send out-of-band), `OnboardingChecklist` (first-2-weeks), `ScheduleCTA` (Cal.com block).

  **NOT in atelier-registry** (which is for single-component-with-schema entries). ClientPortalPanel is a compound component family; consumers import slots directly: `import { ClientPortalPanel } from '@cofoundy/ui'` then compose `<ClientPortalPanel.Root>...<ClientPortalPanel.Hero/>...</ClientPortalPanel.Root>`.

  Tests: 43 (15 v1 + 28 v2). Coverage: 96.4% statements, 96.9% lines on new files. Cross-mode verified: light/dark × mobile-390/desktop-1400.

### Notes for consumers

- Downstream consumers (e.g. `docs-ai`) using `github:cofoundy/ui#main` must register the 23 slots in their MDX components map after pulling 0.5.0, and run `pnpm allowlist:write` to refresh brand-validator allowlist (`@cofoundy/ui@0.4.0` → `@cofoundy/ui@0.5.0`).

## [0.4.0] — 2026-05-16

### Added

- **Atelier components (9)** — `BuildProgress`, `ComparisonMatrix`, `DesignSystemPanel`, `KPIBoard`, `MoodBoard`, `PersonaCard`, `QuoteCard`, `Sitemap`, `TestimonialCard`. Each with Zod schema, MDX-ready props, atelier-registry entry, auto-generated `AGENTS.md`.
- Frame B classic-JSX support — explicit `import * as React from 'react'` on all atelier components for esbuild precompile (PR #4).
- CI drift gates: `verify-agents-md.yml` (registry ↔ docs sync).

## [0.3.x] and earlier

See git history.
