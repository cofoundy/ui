// Thin wrapper around the `agent-browser` CLI (in PATH — see capture.md report / T-004 delta from
// the team-lead: Playwright is not installed in this worktree and capture's scope.write doesn't
// include package.json, so devDependencies are off the table; `agent-browser` is what's available
// and is what [skin] already used for its own screenshot verification during T-002/T-003).
//
// Every call goes through `child_process.execFileSync` with an argv ARRAY, never a shell string —
// message text in a script can contain quotes/backticks/emoji, and an argv array sidesteps shell
// quoting entirely (this is also why settleScript.ts's JS payload is transported base64-encoded
// via `eval -b`, not interpolated into a shell command).

import { execFileSync } from 'node:child_process';

export interface AgentBrowserError extends Error {
  readonly stdout: string;
  readonly stderr: string;
}

function run(args: readonly string[]): string {
  try {
    return execFileSync('agent-browser', args, { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });
  } catch (err) {
    const e = err as { stdout?: Buffer | string; stderr?: Buffer | string; message: string };
    const wrapped = new Error(
      `agent-browser ${args[0]} failed: ${e.message}\nstdout: ${e.stdout ?? ''}\nstderr: ${e.stderr ?? ''}`,
    ) as AgentBrowserError;
    (wrapped as { stdout: string }).stdout = String(e.stdout ?? '');
    (wrapped as { stderr: string }).stderr = String(e.stderr ?? '');
    throw wrapped;
  }
}

export function open(session: string, url: string): void {
  run(['--session', session, 'open', url]);
}

export function setViewport(session: string, width: number, height: number, dpr: number): void {
  run(['--session', session, 'set', 'viewport', String(width), String(height), String(dpr)]);
}

/** Runs `script` (already-complete JS source, e.g. an async IIFE) in the page and returns the
 * resolved value. Transported as base64 (`eval -b`) so no shell-quoting rule in the script's own
 * content — arbitrary message text included — can break the call. Throws (with stdout/stderr
 * attached) if the page-side script throws; this is what turns "pad never stabilized" or "element
 * not found" into a real process failure instead of a silently-wrong screenshot. */
export function evalScript(session: string, script: string): unknown {
  const b64 = Buffer.from(script, 'utf8').toString('base64');
  const out = run(['--session', session, 'eval', '-b', b64, '--json']);
  const parsed = JSON.parse(out) as { success: boolean; data?: { result?: unknown }; error?: string };
  if (!parsed.success) throw new Error(`agent-browser eval error: ${parsed.error ?? 'unknown'}`);
  return parsed.data?.result;
}

export function screenshotSelector(session: string, selector: string, outPath: string): void {
  run(['--session', session, 'screenshot', selector, outPath]);
}

export function close(session: string): void {
  try {
    run(['--session', session, 'close']);
  } catch {
    // Best-effort cleanup — a session that failed mid-capture may already be gone; the capture's
    // own error (thrown earlier) is what the caller needs to see, not a cleanup failure masking it.
  }
}
