# design-sync notes — @cofoundy/ui

Durable learnings for future syncs. Read this before doing anything.

## Repo shape

- Shape: **storybook**. `.storybook/` is at the package root; this package is its
  own git repo (`git rev-parse --show-toplevel` returns `packages/ui`, NOT the
  `cofoundy/` workspace root). Do not build `sb-reference` into
  `$(git rev-parse --show-toplevel)/packages/ui/...` — that nests `packages/ui`
  twice.
- Package manager: **pnpm** (`pnpm-lock.yaml`, Sep 2026) even though a stale
  `package-lock.json` is also committed. `pnpm-lock.yaml` is gitignored here,
  which is odd for a lockfile — worth revisiting separately.

## Fixes this sync had to make

- `[GENERAL]` **The package had no build and no `.d.ts` tree.** `main` pointed at
  `src/index.ts`. Added `vite.config.lib.ts` (ES lib build of the full
  `src/index.ts`, React externalized → `dist/index.mjs`) and
  `tsconfig.build.json` (`emitDeclarationOnly` → `dist/types/`). `buildCmd` in
  config runs both.
- `[GENERAL]` **`package.json` needed a `types` field.** The converter's
  `dts.mjs projectFor()` resolves the entry from `types`/`typings`, falling back
  to `<root>/index.d.ts`. Without it the parse found 0 symbols and ALL 71 story
  titles dropped as `[TITLE_UNMAPPED]`. Added `"types": "./dist/types/index.d.ts"`.
  This is the single highest-leverage fix — if a future sync reports 0 components,
  check this field first.
- `[GENERAL]` **`PersonalNote.tsx` imported an undeclared package.** It imported
  `Markdown` from `@react-email/markdown`, which is only a transitive of
  `@react-email/components` and so is not hoisted under pnpm — `storybook build`
  failed outright on a clean install. Changed to import `Markdown` from
  `@react-email/components` (verified it re-exports it at runtime). This was a
  real repo bug, not a sync workaround.
- `[GENERAL]` **Decorator bundling fails** (`Could not resolve "tailwindcss"` —
  `.storybook/preview.tsx` pulls the vite plugin). Set `cfg.provider` to
  `DsPreviewTheme`, a small wrapper in `.design-sync/support/preview-theme.tsx`
  registered via `extraEntries`. It mirrors the decorator: `data-theme` + bg +
  centered padding. The DS has **no ThemeProvider export** — theming is the
  `data-theme` attribute alone (see `src/styles/index.css`).
- `[GENERAL]` **No stylesheet ships in `dist/`.** Tailwind v4 runs through the
  vite plugin, so no `index.css` asset is emitted. The compiled CSS is scraped
  from the storybook build and copied to `.design-sync/support/compiled.css`
  (committed), which `cfg.cssEntry` points at. Copy it rather than pointing at
  `sb-reference/assets/preview-<hash>.css` — that hash changes every rebuild.
  **Refresh this copy whenever `src/styles/index.css` or Tailwind usage changes.**

## titleMap decisions

- Real renames: `ChatWidget (Full)`→`ChatWidget`, `Launcher`→`FloatingLauncher`,
  `Cotización Followup`→`CotizacionFollowup` (accent stripped by the slug rule),
  `Sonner`→`Toaster`.
- Excluded as `null` — **not public exports**, so the design agent cannot use
  them: the chat-widget internals (`ChatHeader`, `ChatInput`, `ConfirmationCard`,
  `Message`, `MessageList`, `QuickActions`, `TimeSlotGrid`, `ToolIndicator`,
  `TypingIndicator`). They render only inside `ChatWidget`.
- Excluded as `null` — **not components**: `Analytics/Dashboard` (composed demo),
  `Email/Primitives` (sampler), and the 5 `Foundation/*` token-documentation
  stories.
- Story-title oddity in the repo: `src/stories/analytics/Leaderboard.stories.tsx`
  has `title: 'Soporte L2'`(a copy-paste slip). It still resolves because the
  export name matches; worth fixing upstream.

## The shadcn lowercase-filename trap `[GENERAL]`

**Symptom:** 27 of 53 components rendered with an empty root — no JS errors, no
caught exceptions, just nothing. Every failing one was in `ui/`, `messaging/`,
`navigation/`; every `analytics/` and `email/` one was fine.

**Root cause:** `lib/story-imports.mjs` redirects a story's relative component
import to the shipped bundle (`window.CofoundyUI`) by matching the resolved path
against the exported component name. This repo follows the shadcn convention of
lowercase filenames — `src/components/ui/button.tsx` exporting `Button` — so the
path `.../components/ui/button` never matched the export `Button` and fell
through to rule 3 (bundle from source). Those previews then inlined a SECOND copy
of React (134 KB vs ~8 KB for a correctly-shimmed one) and mounted into a
different React instance than the page rendered — hence an empty root with no
error. `analytics/` stories were unaffected because those files ARE PascalCase
(`ActivityFeed.tsx`), so the name matched.

**Fix:** `cfg.storyImports.shim` with directory-prefix patterns for every group
whose filenames are lowercase (`/src/components/ui/`, `/src/components/messaging/`,
`/src/components/navigation/`, `/src/components/chat-widget/`,
`/src/components/effects/`).

**Diagnostic that finds this fast:** compare `_preview/<Name>.js` sizes. ~8-16 KB
with `grep -c CofoundyUI` ≥ 1 is correct; ~130 KB with 0 references means the
component was source-bundled and will render empty.

**Note:** `storyImports` is part of the grade contract, so changing it requires a
FULL `package-build.mjs` — `preview-rebuild.mjs` refuses with `[CONFIG_STALE]`.

## Gotcha: don't chain validate onto build in one command

`package-build.mjs` writes previews for ~4 minutes after its component count is
printed. Chaining `build && validate` in one shell line ran validate against a
half-written `_preview/` and reported 13 phantom "root empty" failures that were
just files not yet on disk (alphabetically from `Logo` onward). Wait for
`✓ wrote ./ds-bundle` in the log before validating.

## The dark-mode contrast bug `[GENERAL]` — fixed 2026-09-06

**Symptom:** across many components, primary text was near-invisible on the dark
canvas: `Separator` ("Radix Primitives", "Dashboard/Settings/Profile", "Option
1/2/3"), `Collapsible` (nearly every trigger row), `Logo`/`LogoHeader`
(Monochrome variant), `Tabs` (the ACTIVE tab pill — the highest-signal element).
Contrast was *inverted*: text with an explicit `text-[var(--muted-foreground)]`
read fine, while primary text with no color class did not.

**Root cause — ONE line, not one bug per component.** `.storybook/storybook.css`
declared in its Tailwind `@theme` block:
`--color-background: #ffffff; --color-foreground: #171717;`
Tailwind v4 derives the `bg-background` / `text-foreground` utilities (and the
inherited body color) from those `--color-*` names. The DS itself defines the
correct dark values in `src/styles/index.css` (`--background: #020b1b;
--foreground: #ffffff`), but the storybook `@theme` overrode them with LIGHT
values — so every element relying on inherited or `text-foreground` color
rendered ~black (#171717) on the ~black canvas (#020916).

**Fix — TWO parts, both required:**
1. `.storybook/storybook.css`: set the `@theme` values to the DS dark tokens
   (`--color-background: #020b1b; --color-foreground: #ffffff`). This fixes the
   `text-foreground` / `bg-background` utilities.
2. `src/styles/index.css`: added a base `body { background-color:
   var(--background); color: var(--foreground); }` rule. **This was the bigger
   half.** Part 1 alone did NOT fix it: the failing text carries no color class
   at all (e.g. `<h4 className="text-sm font-medium">`), so it inherited the
   browser default — measured as literal `rgb(0,0,0)` on the `rgb(2,9,22)`
   canvas. Nothing in the DS stylesheet ever applied `--foreground` to the body.
   The rule uses `var(--background)`/`var(--foreground)`, which `[data-theme=
   "light"]` redefines, so light mode still works.

**Verified by measurement, not by eye:** a playwright probe
(`.design-sync/probe.mjs`, kept for re-use) reads `getComputedStyle` on the
failing elements. Before: `rgb(0, 0, 0)`. After: `rgb(255, 255, 255)`.

**This affected the real Storybook too**, not just design-sync previews — the
sync only made it visible. If these two token sets ever drift apart again, the
same class of bug returns. Keep `.storybook/storybook.css`'s `@theme`
background/foreground in sync with `src/styles/index.css`.

## Verified NOT defects (do not re-chase)

- **Animated components photograph at their start frame.** `HorizontalBar`,
  `FunnelChart`, `ProgressBar` and `BarChart` use `useMountTransition` (double
  `requestAnimationFrame`) to grow bars from `width: 0%`. The render-check and
  compare harness freeze animations for comparability, so bars capture at 0% and
  look "missing". Confirmed identical on BOTH panels of the compare sheet — the
  storybook oracle shows the same thing. This is a capture artifact, not a
  component or sync defect.
- **Grid-cell cropping** (DataTable's last column, StatCard KPIROW labels, email
  templates clipped at the right edge, MessageComposer overlap). The product
  card shrinks stories into grid cells; the components themselves are fine.
  `BarChart`/`DonutChart`/`Heatmap` already carry `cardMode: "column"` for this.

## Still open (next sync)

- `NavDropdown` story `ALLFEATUREDEFFECTS` renders a light card but keeps
  dark-mode foreground colors → white-on-white labels. Sibling light stories
  (`FEATUREDLIGHTMODE`, `LIGHTVARIANT`, `LIGHTWITHACTIVE`) render correctly, so
  this one story is missing the light-mode class the others apply. Story bug.
- `MessageStatus` story `TIMESTAMPFORMATS`: the value column ("05:19 PM", "1h
  ago") renders dark navy on the dark ground while its labels read fine.
- The "AI Response" badge on purple AI bubbles (`InboxMessage` CONVERSATION /
  OUTBOUNDAI, `MessageStatus` BUBBLEVARIANTS) sits at very low opacity over the
  saturated purple; body text right below it is full white.
- `Spinner` story `FULLSCREEN`: white label over a light `bg-background/80`
  overlay.
- `CalBookingButton` ALLVARIANTS / `CofoundyBadge` INFOOTERCONTEXT / `Logo`
  INHEADER: layout overflow clipping labels mid-word.

## Re-sync risks — read this first next time

- **`.design-sync/support/compiled.css` is a SNAPSHOT**, copied out of the
  storybook build. It does NOT auto-refresh. If `src/styles/index.css`, the
  Tailwind config, or utility usage changes, re-copy it after rebuilding the
  reference storybook:
  `cp .design-sync/sb-reference/assets/preview-*.css .design-sync/support/compiled.css`
  Skipping this ships stale colors/tokens to every design.
- **`dist/` and `dist/types/` are gitignored**, so a fresh clone has neither.
  Run `buildCmd` (vite lib build + `tsc -p tsconfig.build.json`) before the
  converter, or it finds 0 components.
- **This sync was uploaded WITHOUT the storybook compare/grading pass**, at the
  user's explicit request (they wanted the components visible immediately).
  The build passed `package-validate.mjs` with 54/55 render-clean, and the
  contact sheets were eyeballed — but no preview was pixel-compared against its
  storybook render, so no `.grade.json` files exist. **The next sync should run
  the full compare loop** (`storybook/compare.mjs`) to establish real grades;
  everything will re-verify because there are no carried-forward grades.
- **`ChatWidget` renders empty** and is the one `[RENDER]` failure. It is the
  full widget and needs a live transport connection, so it cannot render
  statically. Either add `cfg.overrides.ChatWidget.skip` for its stories or
  accept the floor card. Not yet decided.
- **`FloatingLauncher` is flagged `[GRID_OVERFLOW] escape`** (fixed/portal
  positioning). The suggested fix is `cfg.overrides.FloatingLauncher` with
  `{"cardMode": "single", "primaryStory": "<one of its stories>"}`. Not applied
  yet — apply it on the next sync.
- **The `provider` is a distillation, not the real decorator.** `DsPreviewTheme`
  hardcodes `theme: "dark"`. The storybook decorator supports a light/dark
  toolbar toggle; previews only ever render dark. If light-mode fidelity starts
  mattering, this is the file to revisit.
- Story cap: compare captures at most 6 stories per component by default, and
  several components here have far more (503 stories across 55 components).
