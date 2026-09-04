// T-004 acceptance #1 + #2 — the acceptance that matters (team-lead): "cambiar la seed DEBE
// romper el byte-compare. Un test que no puede ponerse rojo no mide nada."
//
// Drives the REAL agent-browser CLI + a REAL headless Chrome — this is deliberately not mocked
// (agent-floor.md: "mocked-only tests are judgment-tier amend, not proof").
//
// REACTIVATION (team-lead, session-leak report): this file used to let captureFrame() open a
// brand-new `agent-browser` session (= a new Chrome process) for each of its 4 captures. Measured
// contributing to the shared daemon (every lane in this cycle hits the SAME `agent-browser`
// daemon) going unresponsive under load ("Resource temporarily unavailable (os error 35)"). All 4
// captures below now share ONE session, opened once in beforeAll and closed once in afterAll (see
// captureFrame.ts's `session` option) — settleScript.ts already tears down and rebuilds
// `<cf-chat-sim>` from scratch on every call, so reusing the underlying Chrome PROCESS doesn't
// weaken either acceptance line, it just stops spinning 4 of them for 4 captures.
//
// Why `t` is chosen the way it is below, not just "capture the final state": jitter (core/prng.ts,
// positional PRNG) only perturbs FRAME TIMING, never message content — a script whose only
// difference between two seeds is which minute a timestamp lands on can render byte-identical
// PNGs for TWO DIFFERENT SEEDS purely by chance (verified manually while building this: seed 7 vs
// seed 99 against this exact fixture at data-step=7 produced the identical PNG — a probe that
// can't fail, exactly what the team-lead warned against). Capturing an exact TICK instead of a
// step count is what makes the seed's effect observable: the two seeds compile to frames at
// DIFFERENT absolute ticks, so a `t` sitting between seed A's and seed B's arrival time for the
// same frame index makes `tickToStep` return a DIFFERENT step for each — one has one more message
// revealed than the other. That's a structural DOM difference (a whole extra bubble), not a
// coincidence of label text, so it's guaranteed to change the screenshot rather than merely
// probably changing it.

import { readFileSync } from 'node:fs';
import { mkdtempSync, rmSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { compile } from '../../index';
import type { SimScript } from '../../core/types';
import { captureFrame, closeCaptureSession, openCaptureSession } from '../captureFrame';

const here = dirname(fileURLToPath(import.meta.url));
const FIXTURE_SCRIPT: SimScript = JSON.parse(
  readFileSync(resolve(here, 'fixtures/reserva.json'), 'utf8'),
) as SimScript;

const RECIPE_BASE = {
  script: FIXTURE_SCRIPT,
  channel: 'whatsapp' as const,
  locale: 'es-PE',
  tz: 'America/Lima',
  t0: 1767261600000,
  contactName: 'Fovente — Reservas',
  contactStatus: 'en línea',
};

function sha256(path: string): string {
  return createHash('sha256').update(readFileSync(path)).digest('hex');
}

/** Finds a Tick that, for the SAME frame index `i`, has already arrived in one seed's timeline
 * but not the other's, and asserts one exists — the premise this whole test rests on (if
 * compile() ever stopped jittering, this throws loudly instead of the test below silently
 * degrading into a probe that can't fail). Frame ticks are non-decreasing (`clock` only
 * accumulates), so `t = min(a,b)` is enough: the timeline whose frame[i].t equals that minimum
 * counts frame i (`<= t`); the other timeline's frame[i].t is strictly greater than `t`, and every
 * later frame is >= it, so NONE of them count — the two step counts differ by at least 1. */
function findDivergingTick(seedA: number, seedB: number): number {
  const tlA = compile(FIXTURE_SCRIPT, { ...RECIPE_BASE, seed: seedA });
  const tlB = compile(FIXTURE_SCRIPT, { ...RECIPE_BASE, seed: seedB });
  for (let i = 0; i < tlA.frames.length; i++) {
    const a = tlA.frames[i].t;
    const b = tlB.frames[i].t;
    if (a !== b) return Math.min(a, b);
  }
  throw new Error(
    `test premise broken: seed ${seedA} and seed ${seedB} produced IDENTICAL frame timing for ` +
      `every step — pick a different seed pair (compile()'s jitter is positional; these two ` +
      `should not collide across every one of ${tlA.frames.length} frames).`,
  );
}

describe('capture determinism (T-004 acceptance #1 + #2)', () => {
  let outDir: string;
  const SEED_A = 7;
  const SEED_B = 99;
  const SESSION = `chat-sim-capture-determinism-${process.pid}`;

  beforeAll(() => {
    outDir = mkdtempSync(join(tmpdir(), 'chat-sim-capture-determinism-'));
    openCaptureSession(SESSION); // ONE Chrome process for every capture in this file — see header
  });
  afterAll(() => {
    closeCaptureSession(SESSION);
    rmSync(outDir, { recursive: true, force: true });
  });

  it(
    'two runs of the SAME (script,seed,channel,locale,tz) produce a byte-identical PNG',
    async () => {
      const t = findDivergingTick(SEED_A, SEED_B); // same t used below for the negative case too
      const tlA = compile(FIXTURE_SCRIPT, { ...RECIPE_BASE, seed: SEED_A });

      const outA1 = join(outDir, 'seedA-run1.png');
      const outA2 = join(outDir, 'seedA-run2.png');

      await captureFrame(tlA, t, {
        ...RECIPE_BASE,
        seed: SEED_A,
        width: 380,
        dpr: 2,
        out: outA1,
        session: SESSION,
      });
      await captureFrame(tlA, t, {
        ...RECIPE_BASE,
        seed: SEED_A,
        width: 380,
        dpr: 2,
        out: outA2,
        session: SESSION,
      });

      expect(sha256(outA1)).toBe(sha256(outA2));
    },
    120_000,
  );

  it(
    'gemelo positivo: changing ONLY the seed breaks the byte-compare',
    async () => {
      const t = findDivergingTick(SEED_A, SEED_B);
      const tlA = compile(FIXTURE_SCRIPT, { ...RECIPE_BASE, seed: SEED_A });
      const tlB = compile(FIXTURE_SCRIPT, { ...RECIPE_BASE, seed: SEED_B });

      const outA = join(outDir, 'seedA-twin.png');
      const outB = join(outDir, 'seedB-twin.png');

      await captureFrame(tlA, t, {
        ...RECIPE_BASE,
        seed: SEED_A,
        width: 380,
        dpr: 2,
        out: outA,
        session: SESSION,
      });
      await captureFrame(tlB, t, {
        ...RECIPE_BASE,
        seed: SEED_B,
        width: 380,
        dpr: 2,
        out: outB,
        session: SESSION,
      });

      expect(sha256(outA)).not.toBe(sha256(outB));
    },
    120_000,
  );
});
