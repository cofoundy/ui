// Same gate as element/__tests__/bundle-freshness.test.ts, applied to capture's OWN bundle.
// capture.bundle.js is a separate checked-in artifact from demo/chat-sim.bundle.js — capture only
// has R on demo/** (file-ownership-matrix.md), so it can't rely on skin's build output; it bundles
// element/index.ts itself, into capture/**, which capture does own. Same rationale as skin's:
// nothing rebuilds this automatically, so a stale bundle would silently capture PRE-change DOM —
// exactly the kind of "byte-identical PNG" false confidence T-004 acceptance #2 exists to catch.

import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '../../../../..');
const entry = resolve(here, '../../element/index.ts');
const committedBundlePath = resolve(here, '../capture.bundle.js');
const esbuildBin = resolve(repoRoot, 'node_modules/.bin/esbuild');

const REGEN_COMMAND =
  'npx esbuild src/components/chat-sim/element/index.ts --bundle --format=iife ' +
  '--global-name=CfChatSimCapture --outfile=src/components/chat-sim/capture/capture.bundle.js ' +
  '--target=es2020';

let tmpDir: string;

beforeEach(() => {
  tmpDir = mkdtempSync(join(tmpdir(), 'chat-sim-capture-bundle-'));
});
afterEach(() => {
  rmSync(tmpDir, { recursive: true, force: true });
});

function rebuildBundle(): string {
  const out = join(tmpDir, 'capture.bundle.js');
  execFileSync(esbuildBin, [
    entry,
    '--bundle',
    '--format=iife',
    '--global-name=CfChatSimCapture',
    `--outfile=${out}`,
    '--target=es2020',
  ]);
  return readFileSync(out, 'utf8');
}

describe('capture/capture.bundle.js is fresh', () => {
  it('matches a fresh rebuild of element/index.ts byte-for-byte', () => {
    const fresh = rebuildBundle();
    const committed = readFileSync(committedBundlePath, 'utf8');
    if (fresh !== committed) {
      throw new Error(
        `capture/capture.bundle.js is STALE relative to src/components/chat-sim/element/**.\n` +
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
