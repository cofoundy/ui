# Phase 2 Architecture Gate Decision

**Decision:** approve
**At:** 2026-05-16T00:00:00-05:00
**Reviewer:** ceo-agent
**Cycle:** atelier-components-xgodel-dogfood
**Artifact gated:** packages/ui/.cofoundy/specs/architecture-v1.md

## Coherence check vs brief.yaml

- **D1 (location `packages/ui/src/components/docs/`):** respected — §1, §5 keep all components there; no `atelier/` subfolder created.
- **D2 (no hard-floor gates):** respected — Zod schemas shipped as runtime contracts only (DX + future M1 path), no gate enforcement wired this cycle.
- **D3 (no atelier subfolder):** respected — `src/components/docs/` is the home; only NEW dir is `src/lib/` for the registry, which is manifest not component.
- **D4 (audit-before-patch):** respected — §1 audit matrix is the gate before any `.tsx` edit; verdicts PATCH/KEEP/NEW are derived from delta columns.
- **mvp_scope alignment:** 9 components (2 NEW + 7 audit) = exact match with brief §scope.mvp_scope.
- **file-ownership 2W collisions:** §5 confirms zero 2W collisions; two 2A serialization points (`docs-ai/mdx-components.tsx`, `vault.yaml`) explicitly contracted as "wait for CTO #2 PR merge first" — matches brief `serialization_with_cto2`.
- **out_of_scope respected:** ContractTimeline, UserFlow, MockupShowcase, etc. all explicitly excluded in §1; tangential email components (AuthorNote, InfoBox, etc.) explicitly left out of registry.

Architecture is internally consistent and faithful to all locked decisions.

## Verdict per Q1/Q2/Q3

- **Q1 (Zod export surface — public vs internal):** **Option B (registry-only access)** — smaller public API surface, easier to evolve schema shape without semver pressure; downstream consumers (docs-ai, future artifact-render M1) hit `ATELIER_COMPONENTS[name].schema` which is the canonical path. If a real consumer asks for a direct named export later, promote on demand — cheap reversal.

- **Q2 (Tailwind migration scope — 7 inline-style):** **SKIP-FOR-NOW** — brief timeline is 5-7 days; +2 days for migration + visual-regression risk on already-shipped components is pure scope creep against the dogfood goal (Andre shipping URL to John Medina inside 48h post-merge). NEW components (Sitemap, QuoteCard) MUST follow CVA + Tailwind so the new pattern is set; the 7 existing stay inline-style. File a follow-up issue tagged `atelier-tech-debt` so it doesn't get lost. **Not escalated** — clear scope decision within tier-1 partner authority; the trade-off (consistency debt) is small and explicitly documented as recoverable in a follow-up cycle.

- **Q3 (Vikunja BuildProgress — manual snapshot vs build-time fetch):** **MANUAL snapshot v1** — consistent with the no-artifact-render posture this cycle (brief D2 + out_of_scope), avoids dragging a Vikunja token into docs-ai env, and keeps `cronograma.mdx` honest as a human-curated artifact. Document the upgrade path in `cronograma.mdx` frontmatter (`source_freshness: manual-snapshot-YYYY-MM-DD`) so future M1 wiring is obvious.

## Amendments required

None blocking. Two minor doc additions encouraged (non-blocking, can be folded into implementation):

1. **§7 close-out:** mark Q1=B, Q2=SKIP, Q3=MANUAL as resolved (so plan-agent's open questions don't leak into Phase 3 as unresolved).
2. **§6 cronograma row:** append `source_freshness: manual-snapshot-{date}` convention note so the manual-snapshot decision is encoded where it lives.

## Escalation reason

N/A — no threshold tripped. Q2 was the only candidate (timeline trade-off), but +2 days against a 5-7 day budget is well under the 50% scope-creep threshold, and "consistency debt" is recoverable in a tagged follow-up. Andre as CTO of this cycle already locked the timeline in brief; spending it on visual-regression risk on shipped components contradicts the dogfood-first frame.

## Gaps surfaced

1. **Visual-regression strategy for the 7 PATCH components is implicit.** §1 marks them as "additive optional" props (non-breaking), but there is no explicit "run existing stories + snapshot diff = zero pixel delta" step in §3 or §4. Recommend adding to the implementation checklist (Phase 3+): "for each PATCH'd component, run its existing Storybook story unchanged and confirm visual snapshot is identical pre/post patch."

2. **`zod-to-json-schema` version pin not specified.** §3 cites it as a devDep but no version. Low risk (small lib, stable), but pin a caret range in the implementation PR to avoid surprise major bumps from breaking AGENTS.md output format.

3. **AGENTS.md CI gate failure mode UX not specified.** §3 says `git diff --exit-code AGENTS.md` fails the PR. Worth adding a one-line CI error message ("Run `pnpm gen:agents` and commit the updated AGENTS.md") so contributors aren't lost. Not a blocker.

4. **TestimonialCard schema-only ship:** §1 verdict is KEEP (schema only), but Storybook story refresh is listed in §1 footnote. Confirm in Phase 3 dispatch whether the existing story is acceptable as-is or needs the Zod schema parse-validation test added.

None of these gaps are architecture-level concerns; they're implementation hygiene items the dispatcher can pick up in Phase 3.

## Sign-off

architecture-v1.md is sound for Phase 3 (task graph composition) to begin. D1-D4 honored, mvp_scope matches, file-ownership matrix has zero 2W collisions and contracted serialization for the two 2A points. Q1/Q2/Q3 resolved above. Recommend the dispatcher fold the four minor gaps into the Phase 3 task graph as part of the standard implementation checklist.

## Sources

- `.cofoundy/specs/architecture-v1.md` (full read)
- `.cofoundy/brief.yaml` (full read — D1-D4, mvp_scope, serialization_with_cto2, success_signals)
- Brief inherited research pointers: R-A7 (portal UX 2026), R-A8 (registry pattern 2026) — cited in architecture, not re-validated this gate
- No prior decisions in `.cofoundy/context/decisions/` for this cycle (this is the first gate)

## Next action

/cto enters Phase 3 (task graph composition + dispatch readiness). Pass this decision file path to plan-agent / task-decomposer so Q1/Q2/Q3 resolutions and the 4 gap items propagate into the work breakdown.
