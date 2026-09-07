// T-001 acceptance #6: "un Math.random() en core/ rompe CI. Demostralo con un commit temporal
// que falle y revertilo — el instrumento tiene que poder ponerse rojo."
//
// core/ has no ESLint infra to hook into (no eslint config, no eslint devDependency anywhere in
// this repo, and T-001's scope.write locks package.json to the `exports` field only — adding a
// devDependency would violate that). This vitest test IS the falsifiable instrument instead: it
// statically scans every core/**/*.ts file for the banned globals and fails loud if it finds one.
// It plugs into the same `vitest run chat-sim/core` command T-001 acceptance #1 already gates on.
// Filed as a non-blocking escalation for the CTO (real ESLint infra vs. this substitute, and
// whether T-002's invariant-5 Tailwind ban should follow the same pattern).

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const CORE_DIR = join(__dirname, '..');
const SELF = 'purity.test.ts';

const BANNED: readonly { name: string; re: RegExp }[] = [
  { name: 'Math.random(', re: /\bMath\.random\s*\(/ },
  { name: 'new Date(', re: /\bnew\s+Date\s*\(/ },
  { name: 'Date.now(', re: /\bDate\.now\s*\(/ },
  { name: 'window', re: /\bwindow\b/ },
  { name: 'document', re: /\bdocument\b/ },
  { name: 'fetch(', re: /\bfetch\s*\(/ },
];

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    if (entry === '__tests__') continue; // tests may legitimately reference these strings
    const p = join(dir, entry);
    const st = statSync(p);
    if (st.isDirectory()) out.push(...walk(p));
    else if (/\.tsx?$/.test(entry)) out.push(p);
  }
  return out;
}

// Comments are prose, not code — "window"/"document" show up legitimately when a file explains
// *why* it doesn't use them (see playhead.ts, compile.ts). Strip comments before scanning so the
// instrument catches real violations, not its own documentation.
function stripComments(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
}

function scan(files: readonly string[]): string[] {
  const violations: string[] = [];
  for (const f of files) {
    if (f.endsWith(SELF)) continue;
    const src = stripComments(readFileSync(f, 'utf8'));
    for (const b of BANNED) {
      if (b.re.test(src)) violations.push(`${f}: ${b.name}`);
    }
  }
  return violations;
}

describe('core purity (invariant 4)', () => {
  it('core/**/*.ts contains none of the banned globals', () => {
    expect(scan(walk(CORE_DIR))).toEqual([]);
  });

  it('the instrument can go red (positive twin)', () => {
    // Proves the scanner itself detects a violation — an assertion of absence that never goes
    // red is satisfied by a broken probe as easily as by a clean system (agent-floor.md).
    const fixture = 'export function tainted() { return Math.random(); }\n';
    const violations: string[] = [];
    for (const b of BANNED) {
      if (b.re.test(fixture)) violations.push(b.name);
    }
    expect(violations).toContain('Math.random(');
  });
});
