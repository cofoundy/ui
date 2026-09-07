// T-022 §A acceptance: every chat-sim subpath promised by package.json `exports` must actually
// resolve. The Storybook stories import `styles.css` by RELATIVE path, so a missing `exports`
// entry stays green there while any real consumer (`require.resolve('@cofoundy/ui/chat-sim/...')`)
// gets ERR_PACKAGE_PATH_NOT_EXPORTED — exactly the false-green this test replaces.
//
// Gemelo: reading the promised list straight from package.json (not hardcoding it here) means
// deleting an `exports` entry breaks this test automatically — there is no separate list to forget
// to update.

import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const require = createRequire(join(process.cwd(), 'package.json'));
const pkgPath = join(process.cwd(), 'package.json');
const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8')) as { exports: Record<string, unknown> };

const chatSimSubpaths = Object.keys(pkg.exports).filter(
  (subpath) => subpath === './chat-sim' || subpath.startsWith('./chat-sim/'),
);

describe('package.json exports every promised chat-sim subpath (T-022 §A)', () => {
  it('found at least the two subpaths this task exists to fix', () => {
    // Not the falsifiable gate itself (that's the loop below, driven by package.json, not this
    // literal) — just a guard against the loop silently iterating zero times if `exports` were
    // ever emptied out from under it.
    expect(chatSimSubpaths).toEqual(
      expect.arrayContaining(['./chat-sim', './chat-sim/styles.css', './chat-sim/element']),
    );
  });

  it.each(chatSimSubpaths)('%s resolves via require.resolve', (subpath) => {
    const specifier = subpath === '.' ? '@cofoundy/ui' : `@cofoundy/ui/${subpath.slice(2)}`;
    expect(() => require.resolve(specifier)).not.toThrow();
  });
});
