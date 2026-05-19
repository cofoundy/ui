# Changelog

All notable changes to `@cofoundy/ui` are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
