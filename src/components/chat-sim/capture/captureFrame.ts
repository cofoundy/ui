// captureFrame(tl, t, o) — api-contract.md § "Firmas públicas": `captureFrame(tl, t, o:{width;
// dpr;out}): Promise<string> — tras el settle gate`.
//
// DEVIATION (disclosed, not silent — floor "Deviations from spec... with rationale"): the
// documented `o` shape (`{width;dpr;out}`) has no way to reconstruct WHAT to render. `Timeline`
// (core/types.ts) carries `t0`/`frames`/`keys`/`checkpoints`/`duration`/`digest` — not the raw
// `script`/`seed`/`channel`/`locale`/`tz` that produced it — and `element/`'s only public
// reconstruction path is declarative (`<cf-chat-sim script channel seed locale tz t0>`, which
// recompiles internally). So the browser side needs that recipe verbatim, byte-for-byte the same
// one the caller used to build `tl`, or its own internal `compile()` call won't reproduce `tl`.
// `o` is extended with `CaptureRecipe`'s fields to carry it — arity stays 3 params, only the 3rd
// widens. Kept as a genuine extension rather than a 4th positional arg so a future strict-shape
// check against the contract table sees one options bag, not a signature change.
//
// CI prerequisite: this drives the `agent-browser` CLI (not Playwright — see agentBrowser.ts's
// header), which must be on PATH with Chrome already fetched (`agent-browser install`) in
// whatever environment runs T-004's tests, same as any other headless-browser-based capture tool.

import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import type { Tick, Timeline } from '../core/types';
import * as ab from './agentBrowser';
import { buildSettleScript, type CaptureRecipe } from './settleScript';
import { tickToStep } from './tickToStep';

const CAPTURE_HTML_PATH = join(dirname(fileURLToPath(import.meta.url)), 'capture.html');
const CAPTURE_HTML_URL = pathToFileURL(CAPTURE_HTML_PATH).href;

export interface CaptureFrameOptions extends CaptureRecipe {
  readonly width: number;
  readonly dpr: number;
  readonly out: string;
  /** `agent-browser --session` name.
   *
   * OMITTED (default): captureFrame owns the session's whole lifecycle — opens a freshly-named
   * one, closes it before returning (even on failure). Simplest for a single one-off capture (the
   * CLI, one process, one Chrome), but each call spins its own Chrome process — team-lead's
   * session-leak report measured this compounding across a batch (a full test run, N marketing
   * frames from one script) into daemon contention shared with every other lane's own
   * `agent-browser` usage.
   *
   * PROVIDED: the CALLER owns the session's lifecycle (open it once before the batch, close it
   * once after — see agentBrowser.ts's `close`/`listSessions`). captureFrame still navigates
   * (`open`) on every call — cheap on an EXISTING session (no new Chrome process, just a
   * reload — settleScript.ts's own `document.querySelectorAll(TAG).forEach(remove)` plus a fresh
   * navigate is what guarantees no state leaks between captures on a reused session) — but never
   * closes it. Determinism (acceptance #1) is unaffected either way: every capture always
   * rebuilds `<cf-chat-sim>` from scratch and drives it to an exact step, regardless of whether
   * the underlying Chrome PROCESS is fresh or reused. */
  readonly session?: string;
}

let captureCounter = 0;

function defaultSession(): string {
  captureCounter += 1;
  return `chat-sim-capture-${process.pid}-${Date.now()}-${captureCounter}`;
}

/** Viewport tall enough that the element's intrinsic content height never gets clipped before the
 * selector-scoped screenshot crops to it — `.cf-chat-sim` has no fixed height in styles.css (see
 * capture.html's header), so this only needs to outsize any realistic script, not match it. */
const VIEWPORT_HEIGHT_PX = 6000;

export async function captureFrame(tl: Timeline, t: Tick, o: CaptureFrameOptions): Promise<string> {
  const step = tickToStep(tl, t);
  const ownsSession = o.session === undefined;
  const session = o.session ?? defaultSession();

  mkdirSync(dirname(o.out), { recursive: true });

  try {
    ab.open(session, CAPTURE_HTML_URL);
    ab.setViewport(session, o.width, VIEWPORT_HEIGHT_PX, o.dpr);
    const script = buildSettleScript({ recipe: o, step, widthPx: o.width });
    ab.evalScript(session, script);
    ab.screenshotSelector(session, '.cf-chat-sim', o.out);
  } finally {
    // Only close a session THIS call created — closing a caller-owned shared session out from
    // under a batch would break every capture after this one in the same run.
    if (ownsSession) ab.close(session);
  }

  return o.out;
}

/** Explicit lifecycle for a shared session — a batch of captures (a multi-frame CLI run, a test
 * suite) opens once, passes the same `session` name to every `captureFrame()` call, then closes
 * once. Re-exported here (not just from agentBrowser.ts) since this IS captureFrame's public
 * batching contract, not an internal detail. */
export function openCaptureSession(session: string): void {
  ab.open(session, CAPTURE_HTML_URL);
}

export function closeCaptureSession(session: string): void {
  ab.close(session);
}
