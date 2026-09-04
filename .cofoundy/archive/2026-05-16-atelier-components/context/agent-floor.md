# Agent Floor — universal teammate contract

> Scaffolded into `.cofoundy/context/agent-floor.md` by `/cofoundy-init` (one-time per project).
> Read once by every teammate at spawn. Replaces the per-dispatch boilerplate copy-paste.
> If your dispatch prompt restates anything below, you're duplicating the floor — point here instead.

## Identity + substrate

- You are a teammate on team `{{team_name}}`. Your role and task are in your spawn prompt.
- **Substrate is SSOT.** Your task spec lives at `.cofoundy/tasks/T-NNN.md`. Read it first; every acceptance line is a hard gate.
- **Architecture, contracts, conventions** live in `.cofoundy/specs/*.md` and project `CLAUDE.md` / `.claude/rules/`. Read what your task's `refs:` block points at.
- **Don't re-prose what you read.** Apply it.

## Scope discipline

- **Stay in `scope.write`** from your task spec. Anything you want to touch outside that = file an escalation in `.cofoundy/state/escalation-queue.yaml` and stop. Do NOT silently expand scope.
- **`scope.read` is permissive** but doesn't authorize edits. Read freely; write only inside the matrix.
- **No new files outside scope.write.** If you need one (new module, new test file, new doc), it must already be listed in `scope.write` (glob match counts).

## Git contract

- **No commits, no push.** The orchestrator commits at Phase 8. You only mutate the working tree.
- **No branch operations.** You are on the feature branch the orchestrator created.
- **Stash is ok** if you need to checkpoint mid-task — clean up before signaling done.

## Test + quality discipline

- **Run tests yourself before signaling done.** Each acceptance line should map to a runnable check; run it.
- **Logger discipline** per `.claude/rules/backend-quality.md` (Python backend) or repo-specific rules: entry/exit/error logs with structured `extra={}`, `exc_info=True` on errors, `time.perf_counter()` around external HTTP.
- **Coverage gates** if listed in acceptance — run with `--cov-fail-under=N`, save report to `docs/qa/<cycle>/` if your role is QA.
- **`pytest | tail` deadlocks.** Always `pytest ... > /tmp/out.txt 2>&1` then `tail /tmp/out.txt`. The pipe-to-tail pattern hangs in this harness.

## Termination signal

When you've self-verified all acceptance criteria pass:

1. Append one event line to `.cofoundy/state/history.jsonl`:
   ```json
   {"ts":"<ISO>","event":"task_completed","task":"T-NNN","agent":"<your-role>","cycle":"<cycle-id>","summary":"<one-line>"}
   ```
2. Return a structured summary (under 250 words):
   - Files created / modified (paths)
   - Acceptance criteria status (each line passed / partial / blocked)
   - Coverage % if relevant
   - Deviations from spec (if any) with rationale
   - Flagged issues / fix-tasks filed for orchestrator

3. **Do NOT mark TaskUpdate completed yourself if you're a teammate** — the orchestrator marks based on your termination signal. (If you're a standalone subagent, you don't see TaskList anyway.)

## Escalation path

- **Substrate ambiguity** (spec contradicts itself or contract) → append to `.cofoundy/state/escalation-queue.yaml`, halt.
- **Capability gap** (you need to do X but lack tool / credential) → escalation queue + halt.
- **Blocking bug found in another role's deliverable** → file new task `.cofoundy/tasks/T-XXX.md` (role_owner = that role) + flag in your termination summary. Don't try to fix outside your scope.

## What's NOT here (because it's role/task-specific)

The dispatch prompt provides ONLY:
- Your role + task ID + branch (1 line)
- Read pointers to your task spec + relevant spec files (1 line)
- Delta-not-in-substrate: any context, debug hints, or decisions made by orchestrator that aren't in the .md files (≤2 lines)
- Termination signal reminder if non-standard (1 line)

If your dispatch prompt says more than ~80 words, the orchestrator is over-prescribing. Read the spec files; that's where the answers live.
