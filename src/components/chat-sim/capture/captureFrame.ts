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
  /** Isolated `agent-browser --session` name. Auto-generated (unique per call) when omitted, so
   * two captures run back-to-back never share browser state — see agentBrowser.ts's header on why
   * that matters for determinism (T-004 acceptance #1: two runs of the SAME recipe must produce
   * byte-identical PNGs, which a leaked session — a stale animation frame, a cached layout —
   * could quietly break). */
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
  const session = o.session ?? defaultSession();

  mkdirSync(dirname(o.out), { recursive: true });

  ab.open(session, CAPTURE_HTML_URL);
  try {
    ab.setViewport(session, o.width, VIEWPORT_HEIGHT_PX, o.dpr);
    const script = buildSettleScript({ recipe: o, step, widthPx: o.width });
    ab.evalScript(session, script);
    ab.screenshotSelector(session, '.cf-chat-sim', o.out);
  } finally {
    ab.close(session);
  }

  return o.out;
}
