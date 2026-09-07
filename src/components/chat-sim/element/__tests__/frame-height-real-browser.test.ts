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
});
