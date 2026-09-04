// T-004 reactivation (team-lead, session-leak report) ask #4: "N capturas seguidas dejan el mismo
// número de sesiones que antes de empezar. Sin eso, la fuga vuelve en la primera refactorización."
//
// Two things get proven here, both against the REAL `agent-browser session list`, not a mock:
//   1. The happy path (N ephemeral/default-session captureFrame() calls) never accumulates.
//   2. The FAILURE path (a capture that throws) still closes its session — this is what would
//      have caught the original bug: `captureFrame`'s own `finally { ab.close(session) }` was
//      already present before this reactivation, but `agentBrowser.close()`'s `catch {}` silently
//      swallowed a close failure against a degraded daemon, so the finally RAN and still leaked.
//      Forcing a real failure (an unwritable output directory — `agent-browser screenshot` fails
//      to write the file) and then asserting the session count is unchanged is what actually
//      exercises that path; asserting "close() was called" would not have caught the original bug
//      (it WAS being called).

import { chmodSync, mkdirSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { compile } from '../../index';
import type { SimScript } from '../../core/types';
import { captureFrame } from '../captureFrame';
import { listSessions } from '../agentBrowser';

const here = dirname(fileURLToPath(import.meta.url));
const FIXTURE_SCRIPT: SimScript = JSON.parse(
  readFileSync(resolve(here, 'fixtures/reserva.json'), 'utf8'),
) as SimScript;

const RECIPE = {
  script: FIXTURE_SCRIPT,
  seed: 7,
  channel: 'whatsapp' as const,
  locale: 'es-PE',
  tz: 'America/Lima',
  t0: 1767261600000,
};

describe('capture session lifecycle (no leaks)', () => {
  it(
    'N ephemeral captures leave the session count exactly where it started',
    async () => {
      const before = listSessions().length;
      const outDir = mkdtempSync(join(tmpdir(), 'chat-sim-capture-lifecycle-'));
      try {
        const tl = compile(FIXTURE_SCRIPT, RECIPE);
        for (let i = 0; i < 3; i++) {
          // No `session` passed — each call owns (opens AND closes) its own ephemeral session.
          await captureFrame(tl, tl.duration, {
            ...RECIPE,
            width: 380,
            dpr: 2,
            out: join(outDir, `frame-${i}.png`),
          });
        }
      } finally {
        rmSync(outDir, { recursive: true, force: true });
      }
      expect(listSessions().length).toBe(before);
    },
    // Generous on purpose: each iteration spins a BRAND NEW Chrome session against a daemon
    // shared with every other lane in this cycle — agentBrowser.ts's own retry/backoff can
    // legitimately take a while under real contention before giving up for good.
    300_000,
  );

  it(
    'a FAILED capture still closes its own session (finally runs, close does not silently no-op)',
    async () => {
      const before = listSessions().length;
      const outDir = mkdtempSync(join(tmpdir(), 'chat-sim-capture-lifecycle-fail-'));
      const unwritableSubdir = join(outDir, 'locked');
      // Pre-create the dir ourselves and lock it down BEFORE captureFrame's own mkdirSync runs
      // against it (mkdirSync on an already-existing dir is a no-op, so this ordering matters).
      mkdirSync(unwritableSubdir, { recursive: true });
      chmodSync(unwritableSubdir, 0o555); // read+execute, no write

      try {
        const tl = compile(FIXTURE_SCRIPT, RECIPE);
        await expect(
          captureFrame(tl, tl.duration, {
            ...RECIPE,
            width: 380,
            dpr: 2,
            out: join(unwritableSubdir, 'frame.png'),
          }),
        ).rejects.toThrow();
      } finally {
        chmodSync(unwritableSubdir, 0o755); // restore before rmSync needs to delete it
        rmSync(outDir, { recursive: true, force: true });
      }

      expect(listSessions().length).toBe(before);
    },
    120_000,
  );
});
