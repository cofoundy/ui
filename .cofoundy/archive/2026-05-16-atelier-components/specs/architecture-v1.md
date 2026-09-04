# architecture-v1.md — atelier-components-xgodel-dogfood

**Cycle:** atelier-components-xgodel-dogfood
**Phase:** 2b → 2c (architecture draft, pending ceo-agent gate)
**Author:** Plan-agent (subagent, READ-ONLY) + /cto synthesis
**Date:** 2026-05-16
**Locked decisions inherited from brief.yaml:** D1 (location `packages/ui/src/components/docs/`), D2 (no hard-floor gates this cycle), D3 (no `atelier/` subfolder), D4 (audit-before-patch)
**Authoritative research:** R-A7 (portal UX 2026), R-A8 (registry pattern 2026)

---

## 1. Component audit matrix

| # | Component | Exists? | Props actuales | Props spec Atelier §6.2 / data shape XGodel | Delta | Verdict |
|---|---|---|---|---|---|---|
| 1 | **Sitemap** | NO | — | `nodes[]: { path, label, depth, intent?, nav_group?, children? }`; tree rendering (R-A7 §navigation: collapsible tree, current-path highlight); source: `07-information-architecture.md` | NEW — clean-slate | **NEW** |
| 2 | **QuoteCard** | NO | — | `client_name`, `prepared_for`, `valid_until`, `milestones[]: { label, deliverable, amount, due }`, `total`, `payment_terms`, `notes?`; source: `propuesta.html` | NEW — clean-slate | **NEW** |
| 3 | **PersonaCard** | YES (101 LOC) | `name`, `role`, `avatar?`, `demographics[]`, `painPoints[]`, `goals[]`, `quote?` | spec adds: `jtbd: string`, `objections[]`, `journey_stage: 'awareness'\|'research'\|'decision'\|'retention'`, `age?`, `income_range?`, `source?` (provenance — future gate `unverified_persona`) | Missing 5 fields, no breaking (all additive optional) | **PATCH** |
| 4 | **MoodBoard** | YES (58 LOC) | `items[]: { src, alt, caption? }`, `columns?` | spec adds: `items[].source_url?` (R-A7 §provenance), `items[].concept_tag?` (XGodel has 4 concepts A/B/C/D + final → grouping) | Fit OK for v1; add 2 optional fields | **PATCH** |
| 5 | **BuildProgress** | YES (104 LOC) | `steps[]: { label, status?, body? }` where status = `done\|current\|pending` | spec adds: `steps[].phase?: 'L0'..'L9'`, `steps[].owner?`, `steps[].started_at?`, `steps[].completed_at?`, `steps[].vikunja_project_id?` | Phase model L0-L9 not encoded; dates/owner missing | **PATCH** |
| 6 | **ComparisonMatrix** | YES (107 LOC) | `columns[]`, `rows[]: { feature, options[]: { name, value, highlight? } }` | spec needs: `traffic_light?: 'green'\|'yellow'\|'red'` per cell (R-A7 §comparison convergent pattern), `source?` per row | Shape solid; add traffic-light enum + per-row source | **PATCH** |
| 7 | **KPIBoard** | YES (96 LOC) | `kpis[]: { label, value, trend?, target?, status? }`, `columns?` | spec needs: `kpis[].baseline?`, `kpis[].source?: string` (16-cro-plan.md cites benchmarks — provenance required) | Almost ideal; add baseline + source | **PATCH** |
| 8 | **DesignSystemPanel** | YES (109 LOC) | `colors?`, `typography?`, `spacing?`, `radius?` (token arrays) | XGodel has 3 brand directions (emerald-academic, bordeaux-historic, editorial-premium); add `direction?: string` label + `usage_note?` per color | Render shape good; add direction grouping for A/B compare | **PATCH** |
| 9 | **TestimonialCard** | YES (80 LOC) | `quote`, `author`, `role?`, `avatar?`, `source?`, `sourceUrl?` | Spec match — XGodel sin testimonials públicos todavía → no rendered en v1, schema + story refresh still in scope | None | **KEEP** (schema only) |

**Out-of-scope (per brief.yaml D2 / scope):**
- `ContractTimeline` — excluded (XGodel sin contrato firmado, future gate `unsigned_contract` would block anyway)
- `UserFlow`, `MockupShowcase`, `DeployRecord`, `PersonaGrid`, `TimelineGantt`, `FaqAccordion`, `HandoffChecklist`, `BeforeAfterSlider` — deferred al segundo cliente
- Tangential email-derived (`AuthorNote`, `InfoBox`, `MetadataCard`, `NextStepCallout`, `ScopeList`) — shipped, NOT en registry (son docs-ai V2.1 generic, no Atelier-domain; leave exports untouched)

**Workload:** 2 NEW + 7 PATCH (6 light-additive + 1 schema-only) = 9 components en registry.

---

## 2. Registry shape

**Location:** `packages/ui/src/lib/atelier-registry.ts` (NEW dir `src/lib/`).

Rationale:
- No en `components/docs/` — no es componente, es manifest
- No en root `src/atelier-registry.ts` — pollutes package root; `services/`, `hooks/`, `stores/` siguen convención de subdir; `lib/` la sigue
- No en `docs-ai/lib/atelier-registry.ts` (donde Atelier PRD §7.2c originalmente lo puso) — D1 puso component SSOT en packages/ui, registry sigue components; CTO #2 `docs-ai/lib/chrome.ts` es para chrome routing, separado

**Shape (per R-A8 §registry-pattern recommendation — static `satisfies Record`):**

```ts
// packages/ui/src/lib/atelier-registry.ts
import type { ComponentType } from 'react';
import {
  PersonaCard, MoodBoard, BuildProgress, ComparisonMatrix,
  KPIBoard, DesignSystemPanel, TestimonialCard
} from '../components/docs';
import { Sitemap } from '../components/docs/Sitemap';
import { QuoteCard } from '../components/docs/QuoteCard';
import {
  personaCardSchema, moodBoardSchema, buildProgressSchema,
  comparisonMatrixSchema, kpiBoardSchema, designSystemPanelSchema,
  testimonialCardSchema, sitemapSchema, quoteCardSchema,
} from './atelier-schemas';
import type { ZodTypeAny } from 'zod';

export interface AtelierEntry {
  component: ComponentType<any>;
  schema: ZodTypeAny;       // Zod for prop validation (DX + future gate path)
  description: string;      // surfaces in AGENTS.md
  example: Record<string, unknown>;  // canonical MDX example for AGENTS.md
}

export const ATELIER_COMPONENTS = {
  PersonaCard:        { component: PersonaCard,        schema: personaCardSchema,        description: '...', example: {...} },
  MoodBoard:          { component: MoodBoard,          schema: moodBoardSchema,          description: '...', example: {...} },
  BuildProgress:      { component: BuildProgress,      schema: buildProgressSchema,      description: '...', example: {...} },
  ComparisonMatrix:   { component: ComparisonMatrix,   schema: comparisonMatrixSchema,   description: '...', example: {...} },
  KPIBoard:           { component: KPIBoard,           schema: kpiBoardSchema,           description: '...', example: {...} },
  DesignSystemPanel:  { component: DesignSystemPanel,  schema: designSystemPanelSchema,  description: '...', example: {...} },
  TestimonialCard:    { component: TestimonialCard,    schema: testimonialCardSchema,    description: '...', example: {...} },
  Sitemap:            { component: Sitemap,            schema: sitemapSchema,            description: '...', example: {...} },
  QuoteCard:          { component: QuoteCard,          schema: quoteCardSchema,          description: '...', example: {...} },
} satisfies Record<string, AtelierEntry>;

export type AtelierComponentName = keyof typeof ATELIER_COMPONENTS;
```

**Exports add to `packages/ui/src/index.ts`** (additive, follows existing pattern):

```ts
export { ATELIER_COMPONENTS } from './lib/atelier-registry';
export type { AtelierEntry, AtelierComponentName } from './lib/atelier-registry';
```

**CTO #2 consumes via:** `import { ATELIER_COMPONENTS } from '@cofoundy/ui'` en su nuevo `docs-ai/mdx-components.tsx` spread; o artifact-render (M1) para tag-config generation. Mi PR ships ÚNICAMENTE la line addition a `mdx-components.tsx` después de su chrome PR merges (per brief.yaml `serialization_with_cto2`).

---

## 3. AGENTS.md auto-gen

**Script:** `packages/ui/scripts/gen-atelier-agents-md.ts`.

**Why (R-A8 §recommendation):** single static registry must drive LLM allowlist. Hand-edited markdown drifts on first PR; auto-gen makes drift impossible (CI gate verifies `git diff --exit-code AGENTS.md` post-script-run).

**Inputs (read-only):**
- `src/lib/atelier-registry.ts` (component list + descriptions + examples)
- Per-component Zod schemas (introspected via `zod-to-json-schema` to render prop tables)

**Outputs (single file):** `packages/ui/AGENTS.md`. Structure:

```md
# Atelier Components — Agent Allowlist
<!-- AUTO-GENERATED by scripts/gen-atelier-agents-md.ts — DO NOT EDIT -->
<!-- Source: src/lib/atelier-registry.ts -->

## Available components
- `PersonaCard` — Target persona for UX research deliverables
- `Sitemap` — Hierarchical site map for landing-build clients
... (9 entries)

## PersonaCard
**Description:** ...
**Props (from Zod):**
| Name | Type | Required | Default | Description |
| name | string | yes | — | Persona display name |
...
**Example MDX:**
\`\`\`mdx
<PersonaCard name="John Medina" role="Cofounder, XGodel" jtbd="..." ... />
\`\`\`
```

**Invocation:**
- Local dev: `pnpm gen:agents` (npm script alias)
- CI gate: workflow `verify-agents-md.yml` runs `pnpm gen:agents && git diff --exit-code AGENTS.md` on every PR → fails si registry edits olvidaron regenerate
- NOT pre-commit hook (R-A8 §dx anti-pattern: pre-commit hooks fight the dev; CI gate is cheap + visible)

**Tech:** plain TS script, `tsx` runner. Deps: `zod`, `zod-to-json-schema` (R-A8 hybrid recommendation; both small).

---

## 4. Zod schema strategy

**Decision: per-component `.schema.ts` peer file, NOT collocated en `.tsx`, NOT centralized.**

| Option | Pros | Cons |
|---|---|---|
| A. Inline en `.tsx` | Locality, single file | Bundle pollution (zod pulled en every consumer chunk); test isolation harder |
| B. Single `lib/atelier-schemas.ts` | One file scans whole shape | God-file; merge conflicts on simultaneous edits; harder to delete |
| **C. Per-component `<Name>.schema.ts` peer** | Tree-shakeable; per-file ownership matches per-file PR review; registry imports explicit | Slightly more files |

**Chosen: C.** Pattern:

```
src/components/docs/
├── PersonaCard.tsx          # JSX + TS interface (unchanged exports)
├── PersonaCard.schema.ts    # NEW: exports `personaCardSchema`
├── PersonaCard.test.ts      # NEW: parse + validate canonical examples
├── MoodBoard.tsx
├── MoodBoard.schema.ts
... (9 components × 2 new files = 18 schema/test files)
```

**Convention (mirrors `render-email.ts` pattern):**

```ts
// PersonaCard.schema.ts
import { z } from 'zod';

export const personaCardSchema = z.object({
  name: z.string().min(1),
  role: z.string().min(1),
  avatar: z.string().url().optional(),
  demographics: z.array(z.string()).max(8).optional(),
  painPoints: z.array(z.string()).max(8).optional(),
  goals: z.array(z.string()).max(8).optional(),
  quote: z.string().max(500).optional(),
  // PATCH additions (Atelier §6.2):
  jtbd: z.string().max(280).optional(),
  objections: z.array(z.string()).max(6).optional(),
  journeyStage: z.enum(['awareness', 'research', 'decision', 'retention']).optional(),
  age: z.string().optional(),
  incomeRange: z.string().optional(),
  source: z.string().optional(),  // provenance — future gate `unverified_persona`
});

export type PersonaCardInput = z.infer<typeof personaCardSchema>;
```

**Important:** TS `interface PersonaCardProps` (component-facing) stays en `.tsx`. Zod schema is separate runtime contract used by (a) registry (b) AGENTS.md generator (c) future artifact-render gates (M1). Both stay in sync via Vitest test per component: `expectTypeOf<PersonaCardProps>().toMatchTypeOf<PersonaCardInput>()`.

**Dependency add:** `zod` a `dependencies` (ships en package consumed by docs-ai). `zod-to-json-schema` a devDependencies (build script only).

---

## 5. File ownership matrix

W = Write, R = Read-only, A = Append-only (single-line additive)

| Path-glob | Mi cycle (atelier-components) | CTO #2 (V2.6 chrome) | Collision risk |
|---|---|---|---|
| `packages/ui/src/components/docs/*.tsx` | **W** (patch 6, keep 1, add 2) | — | none |
| `packages/ui/src/components/docs/*.schema.ts` | **W** (9 NEW) | — | none |
| `packages/ui/src/components/docs/*.test.ts` | **W** (9 NEW) | — | none |
| `packages/ui/src/components/docs/index.ts` | **W** (add Sitemap, QuoteCard exports) | — | none |
| `packages/ui/src/lib/atelier-registry.ts` | **W** (NEW) | — | none |
| `packages/ui/src/lib/atelier-schemas.ts` | **W** (NEW barrel re-export) | — | none |
| `packages/ui/src/stories/docs/*.stories.tsx` | **W** (2 NEW + 7 audit-refresh) | — | none |
| `packages/ui/src/index.ts` | **A** (2 export lines) | — | none |
| `packages/ui/scripts/gen-atelier-agents-md.ts` | **W** (NEW) | — | none |
| `packages/ui/AGENTS.md` | **W** (auto-gen output, committed) | — | none |
| `packages/ui/package.json` | **W** (add zod, zod-to-json-schema, gen:agents) | — | none |
| `packages/ui/.github/workflows/verify-agents-md.yml` | **W** (NEW CI gate) | — | none |
| `docs-ai/components/{Deliverable,Vault,Reader,CreatorRibbon,RecipientStrip,ApprovalBlock,...}.tsx` | **R** | **W** | none — they own |
| `docs-ai/lib/chrome.ts` | **R** | **W** | none — they own |
| `docs-ai/lib/frontmatter-zod.ts` (chrome/kind/recipient/expires_at) | **R** | **W** | none — they own |
| `docs-ai/mdx-components.tsx` | **A** (single import + spread line, follow-up PR) | **W** (chrome PR) | **SERIALIZED** — mi PR después de su |
| `docs-ai/content/client/xgodel/propuesta.mdx` | **R** | **W** (stub) | none — naming-disjoint |
| `docs-ai/content/client/xgodel/{personas,sitemap,brand-moodboard,cotizacion,cronograma}.mdx` | **W** (5 docs) | **R** | none — naming-disjoint |
| `docs-ai/content/client/xgodel/vault.yaml` | **A** (toc entries for mis 5 docs) | **W** (initial) | **SERIALIZED** — append después de su initial commit |

**Zero 2W collisions confirmed.** Dos **2A serialization points** (`mdx-components.tsx`, `vault.yaml`) — ambos single-line append, ambos wait on CTO #2 PR merge primero.

---

## 6. XGodel dogfood plan

5 MDX docs bajo `~/cofoundy/products/cofoundy-platform/docs-ai/content/client/xgodel/`. CTO #2 owns `propuesta.mdx`.

| MDX doc | Components consumed | Source artifact (paths absolutas) | Notes |
|---|---|---|---|
| **`personas.mdx`** | `<PersonaCard>` ×3 | `~/cofoundy/deals/clients/XGodel/ux-research/02-user-personas.md` + `03-empathy-map.md` (JTBD/objections enrichment) | Hand-author MDX `chrome: deliverable`, `kind: report`. Cada persona = 1 PersonaCard con los 12 patched props. `source` field → research doc path |
| **`sitemap.mdx`** | `<Sitemap>` ×1 | `~/cofoundy/projects/xgodel-landing/research/07-information-architecture.md` + `06-userflow.md` (intent labels) | Tree built from IA section structure. `nav_group` → landing primary nav buckets |
| **`brand-moodboard.mdx`** | `<MoodBoard>` (4 XGodel concepts) + `<DesignSystemPanel>` ×3 (one per direction) + `<ComparisonMatrix>` ×1 (trade-off) | `~/cofoundy/deals/clients/XGodel/visual-design/concept-{A,B,C,D}/`, `final/` (PNG refs); `~/cofoundy/deals/clients/XGodel/work/brand-paletas-v2/{direccion-A-emerald-academic, direccion-B-bordeaux-historic, direccion-C-editorial-premium}/`; `visual-design/DECISIONS.md` | Heaviest doc — exercises 3 de 9 components. ComparisonMatrix rows = trade-off axes (academic-feel, mobile-perf, dev-cost); columns = 3 direcciones; cells nuevo `traffic_light` enum |
| **`cotizacion.mdx`** | `<QuoteCard>` ×1 | `~/cofoundy/deals/clients/XGodel/propuesta.html` (table extraction) + `addendum-pago-comprobante.md` (payment terms) | Frontmatter `recipient: { name: "John Medina", company: "XGodel" }`, `expires_at: 2026-06-30`. Primera production exercise QuoteCard |
| **`cronograma.mdx`** | `<BuildProgress>` ×1 + `<KPIBoard>` ×1 (delivery KPIs) | `~/cofoundy/deals/clients/XGodel/cronograma.tex` (parse phases L0-L9); Vikunja `delivery_project_id=22` (manual snapshot v1); `roadmap-hitos.md` | BuildProgress uses patched phase + owner + dates. KPIBoard: % phases done, days-elapsed-vs-planned, deliverables-shipped count |

**Components touched en dogfood:** 8 de 9 en registry (todos excepto TestimonialCard — sin testimonials XGodel; ships schema+story, exercised por segundo cliente).

**Render verification:** dev-server + prod Cloudflare — ambos sin warnings/errors. Andre shares URL con John Medina post-merge (success-signal en brief.yaml).

---

## 7. Open architectural questions — RESOLVED 2026-05-16 by ceo-agent (Phase 2c)

**Resolutions (locked):**
- **Q1 → Option B** (registry-only access, no public schema named-exports). Promote on demand.
- **Q2 → SKIP** Tailwind migration this cycle. NEW components follow CVA + Tailwind; 7 existing stay inline-style. File tag `atelier-tech-debt`.
- **Q3 → MANUAL snapshot** for BuildProgress / Vikunja. Add frontmatter convention `source_freshness: manual-snapshot-YYYY-MM-DD` en `cronograma.mdx` para encoded upgrade path.

Full decision rationale: `.cofoundy/context/decisions/2026-05-16-phase-2-architecture-gate.md`.

---

### Original questions (for historical reference)


**Q1. Zod schema export surface — public o internal?**
Should `personaCardSchema` (y los 8 otros) be exportados desde `@cofoundy/ui` para downstream consumers (docs-ai, artifact-render M1, future landing-pages), o kept package-internal y solo surfaced via `ATELIER_COMPONENTS[name].schema`?
- **Option A (export each schema):** more flexible; pollutes public API surface con 9 new named exports
- **Option B (registry-only access):** cleaner public API; consumers go through `ATELIER_COMPONENTS.PersonaCard.schema`; couples consumers tightly to registry shape
- **Plan-agent lean:** B (smaller blast radius); promote individual exports si real consumer asks

**Q2. JSX `style={{}}` legacy vs Tailwind migration scope?**
Los 7 existing `components/docs/*.tsx` usan inline `style={{}}` objects (verificado en PersonaCard, MoodBoard, etc.). Resto de `packages/ui` sigue CVA + Tailwind per CLAUDE.md "Component Patterns" §1-4. ¿Migrar los 7 a CVA + Tailwind while patching props, o leave inline-style as-is y solo follow CVA for los 2 NEW?
- **Cost migration:** ~2 días extra; visual regression risk on already-shipped
- **Cost skip:** registry components inconsistent con resto de `@cofoundy/ui`; future Atelier debe decidir cuál pattern
- **Plan-agent lean:** SKIP migration this cycle (scope creep — brief timeline 5-7 días). Nuevos (Sitemap, QuoteCard) follow CVA. File follow-up issue

**Q3. `BuildProgress` Vikunja integration — manual snapshot vs read-time fetch?**
`cronograma.mdx` needs current phase status. Two paths:
- **Manual snapshot:** human edita MDX cuando cambia (simple, stale; aligned con brief "MDX manual authoring")
- **Build-time fetch:** Next.js RSC fetches Vikunja API at build time, injects into BuildProgress (fresher; needs Vikunja token en docs-ai env; scope creep)
- **Plan-agent lean:** manual snapshot v1 (consistent con no-artifact-render); document upgrade path

---

### Critical Files for Implementation

- `/Users/styreep/cofoundy/packages/ui/src/lib/atelier-registry.ts` (NEW — SSOT)
- `/Users/styreep/cofoundy/packages/ui/scripts/gen-atelier-agents-md.ts` (NEW — build script)
- `/Users/styreep/cofoundy/packages/ui/src/components/docs/PersonaCard.tsx` (PATCH — reference shape for los otros 5)
- `/Users/styreep/cofoundy/packages/ui/src/components/docs/index.ts` (extend — add Sitemap + QuoteCard exports)
- `/Users/styreep/cofoundy/products/cofoundy-platform/docs-ai/mdx-components.tsx` (single-line append AFTER CTO #2 chrome PR merges)
