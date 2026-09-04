# Phase 5 Task Graph Gate Decision

**Decision:** amend
**At:** 2026-05-16T12:05:00-05:00
**Reviewer:** ceo-agent
**Cycle:** atelier-components-xgodel-dogfood
**Authority:** ceo-agent (tier-1 partner delegation, /cto Phase 5 gate)
**Status:** amended — single minor amendment to T-004; on patch, Phase 6 spawn approved

---

## Question
Approve the 8-task graph (T-001..T-008) as dispatch-ready for Phase 6 subagent fanout? Verify (a) testable acceptance, (b) zero 2W collisions, (c) DAG integrity, (d) scope alignment vs brief.mvp_scope, plus /goal directive checks: (e) ≥80% coverage gate, (f) visual QA gate, (g) deploy validation, (h) task completeness.

## Validation results

### (a) Testable acceptance — PASS
Each task ships measurable, machine-checkable criteria. Examples:
- T-001 `pnpm test --coverage ≥80% per file`, Chrome MCP `≤2% pixel diff`, bundle size `<2%` delta.
- T-002 acceptance bullets cite schema parse + `expectTypeOf` type compat + negative cases.
- T-004 `git diff --exit-code AGENTS.md` after regen — binary pass/fail.
- T-008 `Lighthouse ≥90`, `axe-core zero violations`, `≤5% pixel diff` on 5 URLs.

No vague terms like "looks good" or "works correctly" anywhere in acceptance blocks.

### (b) Zero 2W collisions — PASS
`file-ownership-matrix.md` line 75 explicitly: **"2W cells: 0"**. Two 2A serialization points (`docs-ai/mdx-components.tsx`, `docs-ai/content/client/xgodel/vault.yaml`) — both gated post chrome-cto PR merge per `brief.serialization_with_cto2`. Matrix Phase 3 validation already states "ZERO 2W cells. No halt required."

Re-verified independently: T-006 owns 5 xgodel/*.mdx files chrome-cto does not write (propuesta.mdx is the only one chrome owns, mine excluded). T-007 is the single-line append to mdx-components.tsx, gated on `chrome-cto:chrome-pr-merged`.

### (c) DAG structure — PASS
Topological order verified:
```
Layer 0:  T-001, T-002  (no deps)
Layer 1:  T-003 [T-001, T-002], T-005 [T-001, T-002]
Layer 2:  T-004 [T-003]
Layer 3:  T-006 [T-003, T-004, chrome-cto:vault-init, chrome-cto:propuesta-mdx]
Layer 4:  T-007 [T-006, chrome-cto:chrome-pr-merged]
Layer 5:  T-008 [T-007]
```
No cycles. External deps on chrome-cto are explicit + blocking-only (subagent-dispatcher will hold T-006/T-007 until those signals fire). Parallel branch T-005 sits off layer 1 alongside T-003, neither blocks the other — correct.

(Note: prompt-described shape "3+4 → 6 → 7 → 8" matches T-006's two-internal-dep cone; T-005 is correctly modeled as an independent infra branch that does not gate T-006, only the QA snapshot baselines T-008 will compare against.)

### (d) Scope alignment vs brief.mvp_scope — PASS
- `mvp_scope.components_audit_and_patch` (7 items) → T-001 covers all 7 incl. TestimonialCard (schema-only)
- `mvp_scope.components_new` (Sitemap, QuoteCard) → T-002
- `mvp_scope.infra` (registry, gen script, Zod schemas, Storybook) → T-003 (registry + barrel), T-004 (gen + CI), T-005 (Storybook)
- `done_definition` "XGodel client portal renderea 5 docs con Deliverable chrome + Atelier components" → T-006 (5 MDX), T-007 (wire-up)
- `out_of_scope` items (ContractTimeline, UserFlow, etc.) — not present in any task. Negative test PASS.
- Zero scope drift detected.

### (e) Coverage gate — PASS
≥80% baked into:
- T-001 line 34 (per-file ≥80%)
- T-002 line 33 (≥80% on Sitemap + QuoteCard)
- T-003 line 30 (≥80% on lib/atelier-*)
- T-004 line 30 (≥80% on scripts/gen-*)
- T-008 line 24 (aggregate ≥80% over `components/docs/**` + `lib/atelier-registry.ts` + `scripts/gen-*`) — this is the HARD aggregate gate per `escalation-thresholds.yaml` line 19-22.

Per-task floors + aggregate ceiling = redundant defense. Good.

### (f) Visual QA gate — PASS
Three-stage visual defense:
- T-001 ≤2% pixel diff (existing components must look identical post-patch)
- T-005 captures baselines for all 9 stories to `.cofoundy/state/visual-baselines/`
- T-008 ≤5% pixel diff on 5 XGodel URLs vs Phase 9 baseline (looser threshold for full-page composition vs per-component)

Tighter per-component gate + looser composition gate is correctly modeled.

### (g) Deploy validation — PASS (split-correctly)
Pre-merge validation lives in T-008 (E2E + Lighthouse + axe + visual diff on dev server). Post-deploy validation (canary-monitor 30-min window on prod Cloudflare) lives in /cto Phase 11 per `brief.success_signals` line 155. This split is correct: T-008 cannot validate prod URLs that don't exist yet pre-merge. Phase 11 auto-approves per `escalation-thresholds.yaml.autonomy_overrides.auto_approve_main_deploy: true`. Three-strikes canary FAIL → escalate per thresholds line 23-25.

### (h) Task completeness — PASS with 1 amendment
8 tasks cover: components (T-001/T-002), infra (T-003/T-004), Storybook (T-005), dogfood content (T-006), integration (T-007), validation (T-008). Cross-checked against `success_signals` (10 items): all 10 mapped.

**One gap identified:** `api-contract.md` §1 line 46 commits to "packages/ui minor bump (additive)" — but no task acceptance enforces the version bump in `package.json`. T-004 already owns `package.json` (deps + script additions), so the version-bump assertion belongs there. Without it, `@cofoundy/ui` external consumers (and pnpm-lock determinism) won't see the new exports surface correctly.

Not a new-task gap — a single-line acceptance addition to T-004. Below the threshold for escalation; within Phase 5 ceo-agent amendment authority.

CHANGELOG: not blocking. `@cofoundy/ui` does not currently maintain a CHANGELOG.md (verified absence is the team's current convention); imposing one in this cycle would be scope creep beyond /goal authorization.

## Amendments required

**Amend T-004 acceptance block — add one bullet:**

```md
- [ ] `package.json` `version` field bumped per semver minor (additive exports per api-contract.md §1 line 46). If a pre-existing version-bump script exists in the repo, prefer it; otherwise edit version field directly.
```

Rationale: api-contract.md commits to a minor bump for consumers. No other task touches package.json version. T-004 is the right home because it already opens that file. Single-line addition; no DAG impact; no scope expansion.

No other amendments. Tasks T-001/T-002/T-003/T-005/T-006/T-007/T-008 ship as-is.

## Sign-off
Apply the T-004 version-bump amendment, then green-light Phase 6 subagent-dispatcher fanout. Layer-0 (T-001 + T-002) dispatches in parallel immediately; T-005 unblocks as soon as either layer-0 task lands schema files; T-003 → T-004 sequentially; T-006/T-007 await chrome-cto signals; T-008 closes the cycle pre-Phase 10.

## Sources
- `.cofoundy/brief.yaml` (mvp_scope, success_signals, user_authorization_2026-05-16)
- `.cofoundy/specs/file-ownership-matrix.md` (collision summary line 75)
- `.cofoundy/specs/api-contract.md` (§1 versioning line 46, §3 AGENTS.md format, §5 frontmatter)
- `.cofoundy/state/escalation-thresholds.yaml` (auto_approve_main_deploy override, coverage hard floor)
- `.cofoundy/tasks/T-001.md` through `T-008.md`
- Prior decision: `.cofoundy/context/decisions/2026-05-16-phase-2-architecture-gate.md` (D1-D4 locked, not relitigated)

## Next action
/cto applies the one-line amendment to T-004, then enters Phase 6 with all 8 tasks dispatch-ready. ceo-agent next involvement: Phase 11 deploy gate (auto-approve per overrides; canary 3xFAIL → escalate).
