// T-031 A — the real-browser gemelo the jsdom test (t031.test.ts) structurally cannot provide.
//
// team-lead's finding: jsdom does no layout, so `t031.test.ts`'s height tests can only assert
// that `--cf-cs-height` gets SET on the element's inline style — they never touch a real rendered
// box. Mutating styles.css's default to `auto` left all 16 of those tests green, because none of
// them ever asked the DOM "how tall are you". This drives the REAL `agent-browser` CLI + a real
// headless Chrome (agent-floor.md: "mocked-only tests are judgment-tier amend, not proof") against
// `.cf-frame`'s actual `getBoundingClientRect().height` — the one measurement that can't lie about
// whether the fixed-height CSS actually took effect.
//
// Reuses capture/**'s own harness rather than inventing a parallel one: `capture.html` already
// links the real `styles.css` + a fresh `cf-chat-sim` bundle, and `openCaptureSession`/
// `closeCaptureSession` are captureFrame.ts's OWN public batching contract (its comment: "this IS
// captureFrame's public batching contract, not an internal detail") — skin only has `R` on
// `capture/**` (file-ownership-matrix.md), and importing its exported functions as a library is
// exactly what `R` permits; nothing here writes into `capture/**`.

import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { closeCaptureSession, openCaptureSession } from '../../capture/captureFrame';
import { evalScript } from '../../capture/agentBrowser';

const SESSION = `chat-sim-t031-height-${process.pid}-${Date.now()}`;

const SHORT_SCRIPT = [{ k: 'post', by: 'in', text: 'hola' }];
// 25 posts, alternating actor, long text each — an order of magnitude more content than
// SHORT_SCRIPT. If `.cf-frame`'s height were content-driven (the operator's original report),
// this would render visibly taller than the short script's frame.
const LONG_SCRIPT = Array.from({ length: 25 }, (_, i) => ({
  k: 'post',
  by: i % 2 === 0 ? 'in' : 'out:ai',
  text: `mensaje número ${i} — bastante más largo que el anterior, para forzar overflow real del hilo si el alto no estuviera fijo`,
}));

interface MountSpec {
  readonly script: readonly unknown[];
  readonly attrs?: Readonly<Record<string, string>>;
}

/** Mounts one `<cf-chat-sim>` per spec (removing any prior ones first) and returns each one's
 * `.cf-frame` real rendered height, in DOM order. `specs` is JSON-stringify'd straight into the
 * source (settleScript.ts's own convention — JSON is valid JS literal syntax, safe to embed
 * without string-concatenation, message text included). */
function buildMountAndMeasureScript(specs: readonly MountSpec[]): string {
  return `(() => {
    document.querySelectorAll('cf-chat-sim').forEach((n) => n.remove());
    const specs = ${JSON.stringify(specs)};
    return specs.map((spec) => {
      const el = document.createElement('cf-chat-sim');
      el.setAttribute('t0', '1767261600000');
      Object.entries(spec.attrs || {}).forEach(([k, v]) => el.setAttribute(k, v));
      const s = document.createElement('script');
      s.type = 'application/json';
      s.textContent = JSON.stringify(spec.script);
      el.appendChild(s);
      document.body.appendChild(el);
      const frame = el.querySelector('.cf-frame');
      if (!frame) throw new Error('no .cf-frame — did T-031 regress the wrapper structure?');
      return frame.getBoundingClientRect().height;
    });
  })()`;
}

describe('T-031 A — .cf-frame real rendered height (real browser, not jsdom)', () => {
  beforeAll(() => {
    openCaptureSession(SESSION);
  }, 60_000);

  afterAll(() => {
    closeCaptureSession(SESSION);
  });

  it(
    'el gemelo: two scripts of very different length render the SAME .cf-frame height — the acceptance itself, measured for real',
    () => {
      const heights = evalScript(
        SESSION,
        buildMountAndMeasureScript([{ script: SHORT_SCRIPT }, { script: LONG_SCRIPT }]),
      ) as number[];
      expect(heights).toHaveLength(2);
      expect(heights[0]).toBeGreaterThan(0); // sanity: actually laid out, not a collapsed 0
      expect(heights[0]).toBe(heights[1]);
    },
    30_000,
  );

  it(
    'the default height matches the styles.css token (440px) — pins the number the operator/ChatDemo.astro both anchor on',
    () => {
      const heights = evalScript(SESSION, buildMountAndMeasureScript([{ script: SHORT_SCRIPT }])) as number[];
      expect(heights[0]).toBe(440);
    },
    30_000,
  );

  it(
    'the `height` attribute override is honored end-to-end (not just the custom property — the real box)',
    () => {
      const heights = evalScript(
        SESSION,
        buildMountAndMeasureScript([{ script: SHORT_SCRIPT, attrs: { height: '300' } }]),
      ) as number[];
      expect(heights[0]).toBe(300);
    },
    30_000,
  );

  it(
    "gemelo negativo: WITHOUT the fixed-height CSS (`height: auto`, the pre-T-031 shape), the two scripts DO render different heights — proves this instrument can actually go red",
    () => {
      const heights = evalScript(
        SESSION,
        buildMountAndMeasureScript([
          { script: SHORT_SCRIPT, attrs: { height: 'auto' } },
          { script: LONG_SCRIPT, attrs: { height: 'auto' } },
        ]),
      ) as number[];
      expect(heights).toHaveLength(2);
      expect(heights[0]).not.toBe(heights[1]);
      expect(heights[1]).toBeGreaterThan(heights[0]); // the long script grows the box, the exact bug report
    },
    30_000,
  );

  // ── the missing axis: DURING playback, not just at the end ──────────────────────────────────
  //
  // Everything above compares FINAL states — two fully-revealed scripts, or one script at its own
  // end. The operator's actual report was not "the two mocks differ", it was the proportion MOVING
  // while the script played. A box that grows from step 0 to step N and happens to land on the
  // same final height for both scripts satisfies every assertion above and still ships the exact
  // bug that was reported. So this walks ONE element across its whole timeline and measures at
  // every step.
  //
  // Advancing the SAME element (never remounting) is the point — remounting at step N measures
  // "what the box looks like if built at step N", which is a different question from "does the
  // box move as the box advances", and only the second one is the symptom.

  /** Mounts one `<cf-chat-sim>`, walks `data-step` across the script's ENTIRE timeline, and
   * returns `.cf-frame`'s real height at every step. Same embedding convention as
   * `buildMountAndMeasureScript` above (JSON.stringify'd into the source, never concatenated). */
  function buildAdvanceAndMeasureScript(
    script: readonly unknown[],
    attrs: Readonly<Record<string, string>> = {},
  ): string {
    return `(async () => {
      document.querySelectorAll('cf-chat-sim').forEach((n) => n.remove());
      const el = document.createElement('cf-chat-sim');
      el.setAttribute('t0', '1767261600000');
      Object.entries(${JSON.stringify(attrs)}).forEach(([k, v]) => el.setAttribute(k, v));
      const s = document.createElement('script');
      s.type = 'application/json';
      s.textContent = ${JSON.stringify(JSON.stringify(script))};
      el.appendChild(s);
      document.body.appendChild(el);
      await customElements.whenDefined('cf-chat-sim');
      // Fonts settle BEFORE the walk starts, so a late font swap can never masquerade as the
      // content-driven drift this test exists to detect (settleScript.ts's own discipline).
      await document.fonts.ready;

      const frame = el.querySelector('.cf-frame');
      if (!frame) throw new Error('no .cf-frame — did T-031 regress the wrapper structure?');

      // Mounted with no \`data-step\` attribute, the element seeds \`dataset.step\` to its OWN total
      // frame count (chat-sim-element.ts's connectedCallback). Reading it back is what makes the
      // walk range come from the COMPONENT rather than from a literal here that a later edit to
      // LONG_SCRIPT would silently invalidate — a hardcoded range that stops short of the end is
      // precisely how a "measured every step" probe quietly stops measuring the interesting ones.
      const total = Number(el.dataset.step);
      if (!Number.isFinite(total) || total < 2) {
        throw new Error('unusable frame count from dataset.step: ' + el.dataset.step);
      }

      const samples = [];
      for (let step = 0; step <= total; step++) {
        el.dataset.step = String(step);
        // One real frame per step — lets \`#measurePad\`'s re-measure and the seek's scroll write
        // land, so each sample is a settled layout rather than a mid-reflow read.
        await new Promise(requestAnimationFrame);
        samples.push({ step: step, height: frame.getBoundingClientRect().height });
      }
      return { total: total, samples: samples };
    })()`;
  }

  interface Walk {
    readonly total: number;
    readonly samples: readonly { readonly step: number; readonly height: number }[];
  }

  it(
    'el gemelo del síntoma reportado: el alto NO se mueve mientras el guion avanza — medido en cada data-step, no solo al final',
    () => {
      const walk = evalScript(SESSION, buildAdvanceAndMeasureScript(LONG_SCRIPT)) as Walk;

      expect(walk.total).toBeGreaterThan(2); // the walk covered a real timeline, not a 1-step stub
      expect(walk.samples).toHaveLength(walk.total + 1); // every step from 0..total inclusive
      expect(walk.samples[0].height).toBeGreaterThan(0); // sanity: laid out, not a collapsed 0

      // Asserted as "which samples drifted" rather than a set-size, so a red names the exact
      // {step, height} pairs where the box moved instead of just saying two numbers differ.
      const baseline = walk.samples[0].height;
      expect(walk.samples.filter((s) => s.height !== baseline)).toEqual([]);
    },
    60_000,
  );

  it(
    'gemelo negativo del mismo eje: con `height: auto` el alto SÍ se mueve paso a paso — prueba que el walk sabe ponerse rojo',
    () => {
      const walk = evalScript(
        SESSION,
        buildAdvanceAndMeasureScript(LONG_SCRIPT, { height: 'auto' }),
      ) as Walk;

      const baseline = walk.samples[0].height;
      const drifted = walk.samples.filter((s) => s.height !== baseline);
      // The positive test above asserts this same list is EMPTY. Pinning it non-empty here is what
      // makes that emptiness evidence instead of an assumption — and it lives in the suite, so it
      // re-proves itself on every run rather than depending on someone repeating a manual
      // mutate-and-restore ritual.
      expect(drifted.length).toBeGreaterThan(0);
      // ...and it grows monotonically as content is revealed, which is the bug as reported.
      expect(walk.samples[walk.samples.length - 1].height).toBeGreaterThan(baseline);
    },
    60_000,
  );
});
