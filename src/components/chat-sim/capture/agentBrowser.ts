// Thin wrapper around the `agent-browser` CLI (in PATH — see capture.md report / T-004 delta from
// the team-lead: Playwright is not installed in this worktree and capture's scope.write doesn't
// include package.json, so devDependencies are off the table; `agent-browser` is what's available
// and is what [skin] already used for its own screenshot verification during T-002/T-003).
//
// Every call goes through `child_process.execFileSync` with an argv ARRAY, never a shell string —
// message text in a script can contain quotes/backticks/emoji, and an argv array sidesteps shell
// quoting entirely (this is also why settleScript.ts's JS payload is transported base64-encoded
// via `eval -b`, not interpolated into a shell command).
//
// REACTIVATION (team-lead, session-leak report): `agent-browser --session <new-name> eval ...`
// measurably failed with `"Resource temporarily unavailable (os error 35) (after 5 retries -
// daemon may be busy or unresponsive)"` under this cycle's real load (5 lanes sharing ONE
// `agent-browser` daemon). Reproduced directly: session count `["default"]` before, a fresh
// `chat-sim-capture-*` session leaked in the list AFTER the whole CLI process had already exited
// (its own `finally { ab.close(session) }` DID run — the leak was that `close()` swallowed its
// OWN failure against the same degraded daemon, silently). Two independent fixes, both applied:
// (1) `run()` now retries transient daemon errors with backoff instead of failing on the first
// EAGAIN, and (2) `close()` specifically gets MORE retries than other calls (it is the one call
// that must not just "fail fast" — a lost close is a leak, not a failed capture) and, if every
// retry is exhausted, WARNS on stderr instead of swallowing silently, so a leak is visible instead
// of invisible. See captureFrame.ts for the other half: session REUSE across a batch of captures,
// which cuts the number of Chrome processes spun per run from N to 1 and is the more durable fix —
// retries make a leak visible/rare, reuse makes the daemon see far less concurrent load to begin
// with.

import { execFileSync } from 'node:child_process';

export interface AgentBrowserError extends Error {
  readonly stdout: string;
  readonly stderr: string;
}

/** Matches the daemon-contention failure mode specifically — NOT a real page-side failure (an
 * actual thrown Error from settleScript.ts, e.g. "pad did not stabilize", must surface on the
 * first try, not get silently retried into a slower version of the same real bug). ETIMEDOUT is
 * included: measured directly (session-lifecycle.test.ts, under this cycle's real 5-lane shared
 * daemon load) — spinning a brand-new Chrome session can legitimately take longer than a single
 * attempt's timeout when the daemon is busy servicing other lanes, and that surfaces as our OWN
 * client-side `execFileSync` timeout (`spawnSync agent-browser ETIMEDOUT`), not as the daemon's
 * "os error 35" message — same underlying contention, different error shape. */
const TRANSIENT_PATTERN = /resource temporarily unavailable|daemon may be busy|os error 35|etimedout/i;

function errorText(err: unknown): string {
  const e = err as { message?: string; stdout?: Buffer | string; stderr?: Buffer | string };
  return `${e.message ?? ''} ${e.stdout ?? ''} ${e.stderr ?? ''}`;
}

/** Blocking sleep (these wrappers are all synchronous by design — captureFrame's orchestration
 * reads top-to-bottom without an async command queue) via Atomics.wait on a throwaway buffer. */
function sleepSync(ms: number): void {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

function wrap(err: unknown, args: readonly string[]): AgentBrowserError {
  const e = err as { stdout?: Buffer | string; stderr?: Buffer | string; message: string };
  const wrapped = new Error(
    `agent-browser ${args[0]} failed: ${e.message}\nstdout: ${e.stdout ?? ''}\nstderr: ${e.stderr ?? ''}`,
  ) as AgentBrowserError;
  (wrapped as { stdout: string }).stdout = String(e.stdout ?? '');
  (wrapped as { stderr: string }).stderr = String(e.stderr ?? '');
  return wrapped;
}

function run(args: readonly string[], o?: { retries?: number; timeoutMs?: number }): string {
  const retries = o?.retries ?? 2;
  const timeoutMs = o?.timeoutMs ?? 30_000;
  let lastErr: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return execFileSync('agent-browser', args, {
        encoding: 'utf8',
        maxBuffer: 32 * 1024 * 1024,
        timeout: timeoutMs,
      });
    } catch (err) {
      lastErr = err;
      const transient = TRANSIENT_PATTERN.test(errorText(err));
      if (attempt === retries || !transient) break;
      sleepSync(500 * (attempt + 1) ** 2); // 500ms, 2000ms, 4500ms
    }
  }
  throw wrap(lastErr, args);
}

/** `open` may need to spin a brand-new Chrome process (a session that doesn't exist yet) — the
 * single most contention-sensitive call under a shared daemon, so it gets the longer timeout. */
export function open(session: string, url: string): void {
  run(['--session', session, 'open', url], { timeoutMs: 60_000 });
}

export function setViewport(session: string, width: number, height: number, dpr: number): void {
  run(['--session', session, 'set', 'viewport', String(width), String(height), String(dpr)], {
    timeoutMs: 20_000,
  });
}

/** Runs `script` (already-complete JS source, e.g. an async IIFE) in the page and returns the
 * resolved value. Transported as base64 (`eval -b`) so no shell-quoting rule in the script's own
 * content — arbitrary message text included — can break the call. Throws (with stdout/stderr
 * attached) if the page-side script throws; this is what turns "pad never stabilized" or "element
 * not found" into a real process failure instead of a silently-wrong screenshot. Long timeout for
 * the same reason as `open` — the settle gate itself polls for a few frames, and on a contended
 * daemon the underlying Chrome round-trip can be slow even before that polling starts. */
export function evalScript(session: string, script: string): unknown {
  const b64 = Buffer.from(script, 'utf8').toString('base64');
  const out = run(['--session', session, 'eval', '-b', b64, '--json'], { timeoutMs: 60_000 });
  const parsed = JSON.parse(out) as { success: boolean; data?: { result?: unknown }; error?: string };
  if (!parsed.success) throw new Error(`agent-browser eval error: ${parsed.error ?? 'unknown'}`);
  return parsed.data?.result;
}

export function screenshotSelector(session: string, selector: string, outPath: string): void {
  run(['--session', session, 'screenshot', selector, outPath], { timeoutMs: 20_000 });
}

/** The cleanup path — gets MORE retries than everything else (a lost `open`/`eval` fails ONE
 * capture loudly; a lost `close` leaks a whole Chrome process silently, which is exactly what
 * compounded into the daemon going unresponsive). Warns on stderr rather than swallowing when
 * every retry is exhausted, so a leak is visible instead of invisible (team-lead's report: the
 * previous version's silent `catch {}` here was the actual bug, not just the daemon's flakiness). */
export function close(session: string): void {
  try {
    run(['--session', session, 'close'], { retries: 5, timeoutMs: 20_000 });
  } catch (err) {
    console.error(
      `agent-browser: failed to close session "${session}" after retries — LEAKED. ` +
        `Run \`agent-browser --session ${session} close\` manually, or \`agent-browser close --all\`.\n` +
        errorText(err),
    );
  }
}

export interface SessionListResult {
  readonly success: boolean;
  readonly data?: { readonly sessions: readonly string[] };
}

/** `agent-browser session list --json`'s sessions array — used by capture's own leak-regression
 * test (T-004 reactivation ask #4: "N capturas seguidas dejan el mismo número de sesiones que
 * antes de empezar"), not by the capture pipeline itself. */
export function listSessions(): readonly string[] {
  const out = run(['session', 'list', '--json'], { retries: 2, timeoutMs: 15_000 });
  const parsed = JSON.parse(out) as SessionListResult;
  return parsed.data?.sessions ?? [];
}
