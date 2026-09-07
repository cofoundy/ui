// T-022 §B — the audit's core finding: it mutated `core/types.ts` (`ReceiptIconId` -> a single
// bogus literal, `ReceiptModel` -> `{MUTATED}`, `ChannelId` -> a single bogus literal) and 9
// vitest tests across this family stayed green, because they only used `import type` and
// re-asserted literals the tests themselves had constructed. Rewriting those 9 to assert against
// real runtime values (this file's siblings) closes the "asserts against itself" hole, but a
// PURE type-level mutation to a file with zero runtime code (core/types.ts's own header:
// "This file is types-only — it has zero runtime code") is erased by the TS-to-JS transpile
// before any vitest assertion ever runs. No runtime probe, however written, can ever see it.
//
// The sound gate for that class of defect already exists — `npm run typecheck` (`tsc --noEmit`,
// referenced by exports.test.ts's own header: "the real gate is the typecheck") — this file wires
// it into the vitest run so "tests are green" stops meaning "the runtime probes passed" and starts
// meaning "the runtime probes passed AND the type contract still typechecks". It also reproduces
// the audit's exact mutation once, empirically, to prove the gate actually reddens (verified by
// hand while authoring this fix: 0 chat-sim errors before, 157 after, restore-and-diff clean).

import { execFileSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';

function runTypecheck(): { exitCode: number; output: string } {
  try {
    const output = execFileSync('npx', ['tsc', '-p', 'tsconfig.json', '--noEmit'], {
      encoding: 'utf-8',
      cwd: process.cwd(),
    });
    return { exitCode: 0, output };
  } catch (err) {
    const e = err as { status?: number; stdout?: string };
    return { exitCode: e.status ?? 1, output: e.stdout ?? '' };
  }
}

describe('core/types.ts type contract typechecks (T-022 §B gemelo)', () => {
  it(
    'tsc --noEmit reports zero errors under chat-sim/ — the gate a pure type mutation cannot ' +
      'hide from (unlike the 9 vitest probes the audit found)',
    () => {
      const { output } = runTypecheck();
      const chatSimErrors = output
        .split('\n')
        .filter((line) => line.includes('chat-sim') && line.includes('error TS'));
      expect(chatSimErrors).toEqual([]);
    },
    30_000,
  );
});
