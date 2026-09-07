// T-002 acceptance #3: "Cero utilidades Tailwind en chat-sim/**: el lint las rechaza. Gemelo
// positivo: agregá una `flex` temporal, verificá que CI falla, revertí."
//
// No ESLint infra exists in this repo (core found the same gap for T-001's purity lint —
// core/__tests__/purity.test.ts — and this test copies that pattern per the team-lead's
// resolution: a static-scan vitest test is the falsifiable instrument instead, same CI, no new
// devDependency, no package.json touch). Same shape as core's: walk the tree, extract every
// `class`/`className`/`classList.add(...)` string literal, flag any token that matches a
// Tailwind-utility shape, and carry a positive twin so the probe can be shown going red.
//
// Scans `chat-sim/**` (the ask) AND `demo/**` (this task's own deliverable, one directory
// outside chat-sim/ — cheap to include, closes a gap the literal glob would otherwise miss).

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const CHAT_SIM_DIR = join(__dirname, '..', '..'); // src/components/chat-sim
const DEMO_DIR = join(__dirname, '..', '..', '..', '..', '..', 'demo');
const SELF = 'no-tailwind.test.ts';

// Deliberately broad — matching real utility-class SHAPES, not an exhaustive Tailwind dictionary.
// False positives on a semantic class are unlikely: every class this family sets is `cf-`-prefixed
// (cf-msg, cf-bubble, cf-stamp, cf-log, ...), and none of those shapes match this regex.
const TAILWIND_UTILITY_RE =
  /^-?(?:m|p|gap|space-[xy])[trblxy]?-\d|^(?:w|h|min-w|min-h|max-w|max-h|size)-|^text-(?:xs|sm|base|lg|xl|\d|left|center|right|\[)|^font-(?:thin|extralight|light|normal|medium|semibold|bold|extrabold|black|sans|serif|mono)|^leading-|^tracking-|^bg-(?:red|blue|green|gray|slate|white|black|transparent|\[|\d)|^border(?:-[trblxy])?(?:-\d|$)|^rounded(?:-(?:none|sm|md|lg|xl|2xl|3xl|full|[trbl][trbl]?))?$|^shadow(?:-|$)|^ring(?:-|$)|^flex$|^flex-(?:row|col|wrap|nowrap|1|auto|none|initial)|^grid$|^grid-(?:cols|rows|flow)-|^inline(?:-flex|-block|-grid)?$|^block$|^hidden$|^absolute$|^relative$|^fixed$|^sticky$|^static$|^justify-(?:start|end|center|between|around|evenly)|^items-(?:start|end|center|baseline|stretch)|^content-|^self-|^order-\d|^z-\d|^opacity-\d|^transition(?:-|$)|^duration-\d|^ease-|^animate-|^translate-|^scale-\d|^rotate-\d|^cursor-|^select-(?:none|text|all|auto)|^overflow-(?:auto|hidden|visible|scroll)|^(?:top|right|bottom|left|inset)-\d|^divide-|^placeholder-|^aspect-|^object-(?:contain|cover|fill|none)|^outline-|^decoration-|^whitespace-(?:nowrap|pre|normal)|^break-(?:words|all|normal)|^truncate$|^uppercase$|^lowercase$|^capitalize$/;

function walk(dir: string, extRe: RegExp): string[] {
  const out: string[] = [];
  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return out; // demo/ or similar may not exist in some checkouts — scan what's there
  }
  for (const entry of entries) {
    if (entry === 'node_modules' || entry === '__tests__') continue;
    const p = join(dir, entry);
    const st = statSync(p);
    if (st.isDirectory()) out.push(...walk(p, extRe));
    else if (extRe.test(entry)) out.push(p);
  }
  return out;
}

function stripComments(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
}

const CLASS_ATTR_RE = /\bclass(?:Name)?\s*=\s*(["'`])([^"'`]*)\1/g;
const CLASSLIST_ADD_RE = /\bclassList\.add\(\s*(["'`])([^"'`]*)\1/g;

function extractClassTokens(src: string): string[] {
  const tokens: string[] = [];
  for (const re of [CLASS_ATTR_RE, CLASSLIST_ADD_RE]) {
    let m: RegExpExecArray | null;
    re.lastIndex = 0;
    while ((m = re.exec(src))) {
      tokens.push(...m[2].split(/\s+/).filter(Boolean));
    }
  }
  return tokens;
}

function scan(files: readonly string[]): string[] {
  const violations: string[] = [];
  for (const f of files) {
    if (f.endsWith(SELF)) continue;
    const src = stripComments(readFileSync(f, 'utf8'));
    for (const token of extractClassTokens(src)) {
      if (TAILWIND_UTILITY_RE.test(token)) violations.push(`${f}: "${token}"`);
    }
  }
  return violations;
}

describe('chat-sim Tailwind ban (T-002 acceptance #3, architecture-v1.md §12 point 3)', () => {
  it('chat-sim/**/*.{ts,tsx,html} and demo/**/*.html contain no Tailwind utility classes', () => {
    const files = [
      ...walk(CHAT_SIM_DIR, /\.(tsx?|html)$/),
      ...walk(DEMO_DIR, /\.html$/),
    ];
    expect(scan(files)).toEqual([]);
  });

  it('the instrument can go red (positive twin)', () => {
    // Same shape the acceptance text asks for manually ("agregá una `flex` temporal, verificá que
    // CI falla, revertí") — this fixture proves the SCANNER catches it, without needing to leave
    // a real violation committed anywhere. The literal manual version was also run once by hand
    // (documented in .cofoundy/state/reports/skin.md) against element/chat-sim-element.ts.
    const fixture = '<div class="cf-msg flex items-center gap-2"></div>';
    const violations: string[] = [];
    for (const token of extractClassTokens(fixture)) {
      if (TAILWIND_UTILITY_RE.test(token)) violations.push(token);
    }
    expect(violations).toEqual(expect.arrayContaining(['flex', 'items-center', 'gap-2']));
    expect(violations).not.toContain('cf-msg'); // semantic classes must NOT false-positive
  });
});
