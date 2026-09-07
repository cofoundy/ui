// settleScript(recipe) — builds the browser-side JS source that captureFrame() hands to
// `agent-browser eval -b <base64>`. One script does the whole job in a single round trip: build
// the <cf-chat-sim> element from the recipe, jump straight to the target step, and run the settle
// gate the team-lead specified — three things, not one:
//
//   1. `document.fonts.ready`
//   2. `--cf-cs-pad` (styles.css) stable across consecutive frames — element/ re-measures it per
//      message, per step (chat-sim-element.ts's `#measurePad`); this polls until two consecutive
//      rAF reads agree, instead of trusting a single sample.
//   3. `cf-static` (architecture-v1.md §1 class 4 — springs/integrators have memory, so they're
//      "fuera" of the seekable timeline and must be disabled before a capture).
//
// `cf-static` (styles.css) only kills `.cf-msg`'s fade-in — the typing dots (`cf-cs-dot`,
// `infinite`) are NOT covered by that selector, and an `infinite` CSS animation is a fourth
// impure clock capture must neutralize itself: two fresh browser sessions started at slightly
// different wall-clock offsets would sample that animation at different phases and produce
// different pixels for the exact same (script,seed,channel,locale,tz) — a determinism bug that
// has nothing to do with the sim's own PRNG. Fixed generically (not by patching styles.css, which
// [capture] doesn't own): every Animation on the subtree — springs included, redundantly, since
// `cf-static` already zeroes those — gets paused and pinned to `currentTime = 0` after the settle
// wait, so every capture samples the identical animation frame regardless of load timing.

import type { ChannelId, SimScript, Tick } from '../core/types';

export interface CaptureRecipe {
  readonly script: SimScript;
  readonly seed: number;
  readonly channel: ChannelId;
  readonly locale: string;
  readonly tz: string;
  readonly t0: Tick;
  readonly contactName?: string;
  readonly contactStatus?: string;
}

export interface SettleScriptOptions {
  readonly recipe: CaptureRecipe;
  readonly step: number;
  readonly widthPx: number;
  /** Max rAF ticks to wait for `--cf-cs-pad` to stabilize before treating it as a real hang
   * rather than one more in-flight reflow — not a tuning knob, a failure-mode boundary. */
  readonly maxSettleFrames?: number;
}

export function buildSettleScript(o: SettleScriptOptions): string {
  const r = o.recipe;
  const maxFrames = o.maxSettleFrames ?? 10;

  // Every value below is JSON.stringify'd into the source, never string-concatenated — this is
  // JS SOURCE being generated, so that's what makes arbitrary message text (quotes, backticks,
  // emoji) safe to embed. Shell-escaping is a non-issue on top of that: captureFrame.ts transports
  // this whole string base64-encoded (`agent-browser eval -b`), so nothing here ever touches a
  // shell.
  return `(async () => {
  const TAG = 'cf-chat-sim';
  document.querySelectorAll(TAG).forEach((n) => n.remove());
  const el = document.createElement(TAG);
  el.setAttribute('channel', ${JSON.stringify(r.channel)});
  el.setAttribute('seed', ${JSON.stringify(String(r.seed))});
  el.setAttribute('t0', ${JSON.stringify(String(r.t0))});
  el.setAttribute('locale', ${JSON.stringify(r.locale)});
  el.setAttribute('tz', ${JSON.stringify(r.tz)});
  el.setAttribute('contact-name', ${JSON.stringify(r.contactName ?? 'Chat')});
  el.setAttribute('contact-status', ${JSON.stringify(r.contactStatus ?? '')});
  el.style.width = ${JSON.stringify(`${o.widthPx}px`)};

  const scriptEl = document.createElement('script');
  scriptEl.type = 'application/json';
  scriptEl.textContent = ${JSON.stringify(JSON.stringify(r.script))};
  el.appendChild(scriptEl);

  document.body.innerHTML = '';
  document.body.appendChild(el);
  await customElements.whenDefined(TAG);

  // The ONE public reveal knob (architecture-v1.md §13 #2) — jump straight there, never play().
  el.classList.add('cf-static');
  el.dataset.step = ${JSON.stringify(String(o.step))};

  await document.fonts.ready;
  await new Promise(requestAnimationFrame);
  await new Promise(requestAnimationFrame);

  // Pin every Animation (springs + the typing dots' infinite keyframe loop) to one deterministic
  // frame — see this file's header for why the typing indicator needs this on top of cf-static.
  for (const a of el.getAnimations({ subtree: true })) {
    a.pause();
    a.currentTime = 0;
  }

  function pads() {
    return Array.from(el.querySelectorAll('.cf-bubble')).map((b) =>
      getComputedStyle(b).getPropertyValue('--cf-cs-pad').trim(),
    );
  }
  let prev = pads();
  let stable = false;
  for (let i = 0; i < ${JSON.stringify(maxFrames)}; i++) {
    await new Promise(requestAnimationFrame);
    const cur = pads();
    if (JSON.stringify(cur) === JSON.stringify(prev)) {
      stable = true;
      break;
    }
    prev = cur;
  }
  if (!stable) {
    throw new Error('cf-chat-sim capture: --cf-cs-pad did not stabilize after ' + ${JSON.stringify(maxFrames)} + ' frames');
  }

  const rect = el.getBoundingClientRect();
  return { width: rect.width, height: rect.height, step: el.dataset.step };
})();
`;
}
