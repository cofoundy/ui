# File Ownership Matrix — atelier-components-xgodel-dogfood

**Phase:** 3 (Contract + ownership matrix)
**Authored:** 2026-05-16 by /cto (Phase 1 IC continuation)
**Source:** extracted + canonicalized from `architecture-v1.md` §5

**Legend:**
- **W** = Write (create/edit, owner)
- **R** = Read-only (consumer)
- **A** = Append-only (single-line additive, serialized)
- **—** = out of scope for that role

**Roles:**
- `atelier-cto` = this cycle (Andre, packages/ui-driven)
- `chrome-cto` = parallel CTO #2 (V2.6 chrome system, docs-ai-driven)

---

## packages/ui scope (mine, no collisions)

| Path-glob | atelier-cto | chrome-cto | Notes |
|---|---|---|---|
| `packages/ui/src/components/docs/PersonaCard.tsx` | W | — | PATCH (+5 props) |
| `packages/ui/src/components/docs/MoodBoard.tsx` | W | — | PATCH (+2 props) |
| `packages/ui/src/components/docs/BuildProgress.tsx` | W | — | PATCH (+phase/owner/dates) |
| `packages/ui/src/components/docs/ComparisonMatrix.tsx` | W | — | PATCH (+traffic_light, +row.source) |
| `packages/ui/src/components/docs/KPIBoard.tsx` | W | — | PATCH (+baseline, +source) |
| `packages/ui/src/components/docs/DesignSystemPanel.tsx` | W | — | PATCH (+direction, +usage_note) |
| `packages/ui/src/components/docs/TestimonialCard.tsx` | R | — | KEEP (schema-only ship; no XGodel render) |
| `packages/ui/src/components/docs/Sitemap.tsx` | W | — | NEW |
| `packages/ui/src/components/docs/QuoteCard.tsx` | W | — | NEW |
| `packages/ui/src/components/docs/*.schema.ts` | W | — | 9 NEW per-component Zod schemas |
| `packages/ui/src/components/docs/*.test.ts` | W | — | 9 NEW (parse + canonical example + type-match) |
| `packages/ui/src/components/docs/index.ts` | W | — | extend (add Sitemap, QuoteCard exports) |
| `packages/ui/src/lib/atelier-registry.ts` | W | — | NEW SSOT registry |
| `packages/ui/src/lib/atelier-schemas.ts` | W | — | NEW barrel re-export |
| `packages/ui/src/stories/docs/PersonaCard.stories.tsx` | W | — | refresh (audit + new props) |
| `packages/ui/src/stories/docs/MoodBoard.stories.tsx` | W | — | refresh |
| `packages/ui/src/stories/docs/BuildProgress.stories.tsx` | W | — | refresh |
| `packages/ui/src/stories/docs/ComparisonMatrix.stories.tsx` | W | — | refresh |
| `packages/ui/src/stories/docs/KPIBoard.stories.tsx` | W | — | refresh |
| `packages/ui/src/stories/docs/DesignSystemPanel.stories.tsx` | W | — | refresh |
| `packages/ui/src/stories/docs/TestimonialCard.stories.tsx` | W | — | refresh (Zod parse-validation test added) |
| `packages/ui/src/stories/docs/Sitemap.stories.tsx` | W | — | NEW |
| `packages/ui/src/stories/docs/QuoteCard.stories.tsx` | W | — | NEW |
| `packages/ui/src/index.ts` | A | — | 2-line append (registry export + type export) |
| `packages/ui/scripts/gen-atelier-agents-md.ts` | W | — | NEW build script |
| `packages/ui/AGENTS.md` | W | — | auto-gen output, committed |
| `packages/ui/package.json` | W | — | + zod (deps), + zod-to-json-schema (devDeps), + gen:agents script |
| `packages/ui/.github/workflows/verify-agents-md.yml` | W | — | NEW CI gate (auto-gen drift check) |

## docs-ai scope (their primary, my single-line touches at end)

| Path-glob | atelier-cto | chrome-cto | Notes |
|---|---|---|---|
| `docs-ai/components/{DeliverableLayout,VaultLayout,Reader*}.tsx` | R | W | their chrome PR |
| `docs-ai/components/{CreatorRibbon,RecipientStrip,ApprovalBlock,ReaderToggle,ComingSoonModal}.tsx` | R | W | their chrome PR |
| `docs-ai/lib/chrome.ts` | R | W | their selector |
| `docs-ai/lib/frontmatter-zod.ts` (chrome/kind/recipient/expires_at) | R | W | their extension |
| `docs-ai/app/[project]/[...slug]/page.tsx` | R | W | their dispatch |
| `docs-ai/app/globals.css` (chrome layouts + Reader mode) | R | W | their styles |
| `docs-ai/mdx-components.tsx` | **A** (1-line, serialized) | W | **SERIALIZED:** my PR ships single `import { ATELIER_COMPONENTS } from '@cofoundy/ui'` + spread, AFTER chrome PR merges |
| `docs-ai/content/client/xgodel/propuesta.mdx` | R | W | their stub |
| `docs-ai/content/client/xgodel/personas.mdx` | W | R | mine (3× PersonaCard) |
| `docs-ai/content/client/xgodel/sitemap.mdx` | W | R | mine (Sitemap) |
| `docs-ai/content/client/xgodel/brand-moodboard.mdx` | W | R | mine (MoodBoard + DesignSystemPanel + ComparisonMatrix) |
| `docs-ai/content/client/xgodel/cotizacion.mdx` | W | R | mine (QuoteCard) |
| `docs-ai/content/client/xgodel/cronograma.mdx` | W | R | mine (BuildProgress + KPIBoard) |
| `docs-ai/content/client/xgodel/vault.yaml` | **A** (toc entries, serialized) | W | **SERIALIZED:** I append my 5 doc toc entries after their initial commit |

---

## Collision summary

- **2W cells:** 0 (zero direct write collisions)
- **2A serialization points:** 2 (`docs-ai/mdx-components.tsx`, `docs-ai/content/client/xgodel/vault.yaml`) — both single-line append, both gated on chrome PR merge first

## Validation

Per /cto Phase 3 spec: *"every cell with 2+ W = halt and serialize (carve up the paths or sequence the roles)."* ✅ ZERO 2W cells. No halt required. Two 2A cells already serialized by `serialization_with_cto2` contract in brief.yaml.
