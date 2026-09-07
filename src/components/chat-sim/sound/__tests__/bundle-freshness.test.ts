// Same gate as element/__tests__/bundle-freshness.test.ts (T-002 iteration 3, team-lead) applied
// to sound/audition.bundle.js — same committed-build-artifact risk (R-1-style "no build step to
// open" contract, no watch/CI wiring), so the same instrument, not a special case.

import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '../../../../..');
const entry = resolve(here, '../audition-entry.ts');
const committedBundlePath = resolve(here, '../audition.bundle.js');
const esbuildBin = resolve(repoRoot, 'node_modules/.bin/esbuild');

const REGEN_COMMAND =
  'npx esbuild src/components/chat-sim/sound/audition-entry.ts --bundle --format=iife ' +
  '--global-name=CfChatSimSound --outfile=src/components/chat-sim/sound/audition.bundle.js --target=es2020';

let tmpDir: string;

beforeEach(() => {
  tmpDir = mkdtempSync(join(tmpdir(), 'chat-sim-sound-bundle-'));
});
afterEach(() => {
  rmSync(tmpDir, { recursive: true, force: true });
});

function rebuildBundle(): string {
  const out = join(tmpDir, 'audition.bundle.js');
  execFileSync(esbuildBin, [
    entry,
    '--bundle',
    '--format=iife',
    '--global-name=CfChatSimSound',
    `--outfile=${out}`,
    '--target=es2020',
  ]);
  return readFileSync(out, 'utf8');
}

describe('sound/audition.bundle.js is fresh', () => {
  it('matches a fresh rebuild of audition-entry.ts byte-for-byte', () => {
    const fresh = rebuildBundle();
    const committed = readFileSync(committedBundlePath, 'utf8');
    if (fresh !== committed) {
      throw new Error(
        `sound/audition.bundle.js is STALE relative to sound/audition-entry.ts (or its imports).\n` +
          `Regenerate it with:\n\n  ${REGEN_COMMAND}\n\nthen commit the updated file.`,
      );
    }
    expect(fresh).toBe(committed);
  });

  it('the instrument can go red (positive twin): a truncated fresh build IS caught', () => {
    const fresh = rebuildBundle();
    const truncated = fresh.slice(0, Math.floor(fresh.length / 2));
    const committed = readFileSync(committedBundlePath, 'utf8');
    expect(truncated).not.toBe(committed);
  });
});
