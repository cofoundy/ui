// T-016 acceptance #2: "un test que escanee `adapters/**` y `element/**` buscando emoji en el
// rango U+1F300-U+1FAFF y U+2600-U+27BF falla si aparece uno. Demostralo en rojo metiendo uno y
// revirtiendo."
//
// This lane's scope.write is core/** only (agent-floor.md) — it cannot write into adapters/** or
// element/** even transiently to stage the red/green demonstration. So the twin below proves the
// SCANNER PRIMITIVE goes red/green against synthetic strings (entirely in-scope), and a separate
// check walks the real files. Same split as core/__tests__/purity.test.ts (positive twin vs. the
// real scan), and the same "tests may legitimately reference these strings" exclusion for
// `__tests__`/`*.test.ts` files (a simulated chat message or a reaction fixture is real emoji-as-
// CONTENT, not a rendering-glyph token — `chat-sim-element.test.ts` posting "...4 🎉" or
// `render.test.ts`'s `reactions: [{ emoji: '👍' }]` are exactly that, same as this repo's own
// purity-test precedent for banned-globals-in-prose).
//
// One more exclusion beyond purity.test.ts's: `adapters/caps.ts` — Telegram's 73-emoji reaction
// ALLOWLIST (T-005, verified byte-identical to inbox-ai's prod `telegram_reactions.py`). Those
// emoji are the reaction picker's actual values, not a per-channel glyph baked into a rendered
// receipt/composer icon — banning them would break real, already-shipped, already-verified
// product data. The bug this task fixes is specifically "a channel bakes a raw glyph character
// into UI chrome" (receipt ticks, composer buttons), not "emoji exist anywhere in this package."
//
// Real-file result today: adapters/telegram.ts, adapters/whatsapp.ts, element/fixtures.ts still
// carry literal receipt glyphs ('🕐'/'✓'/'✓✓'), and element/chat-sim-element.ts still carries
// literal composer icons ('📎'/'😊'/'➤') — none of those are in this lane's scope.write, so this
// task lands the instrument RED on purpose (see escalation E-003). `it.fails` below is the same
// tripwire idiom this cycle already uses (T-008/T-010, history.jsonl 2026-09-04): it marks the
// CURRENT failure as expected, and flips to an unexpected-pass (loud, visible) the moment T-017
// (blockedBy T-016, owns element/**) and a follow-up adapters/** fix land — that's the signal to
// change `it.fails` back to plain `it`.

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const CHAT_SIM_DIR = join(__dirname, '..', '..');
// E-005/E-007 (CTO): 'react' agregado. `app` (T-019) tuvo que hacer grep MANUAL porque el
// gate no cubria su celda — un gate que no cubre un tercio del codigo no es un gate.
const SCAN_DIRS = ['adapters', 'element', 'react'];

// Same two Unicode blocks named in T-016's acceptance #2.
const EMOJI_RE = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu;

// File-level exceptions: real product data that legitimately contains emoji as CONTENT, not as a
// rendering-glyph token. Each entry needs a reason — this is a hand-audited list, not a rule.
const CONTENT_EXCEPTIONS = new Set([
  'adapters/caps.ts', // T-005: Telegram's real 73-emoji reaction allowlist, byte-verified vs prod
]);

function stripComments(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
}

function isScannedFile(name: string): boolean {
  if (!/\.(ts|tsx|js|mjs|html|css)$/.test(name)) return false;
  if (/\.test\.tsx?$/.test(name)) return false; // fixtures/prose may legitimately hold emoji
  return true;
}

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    if (entry === '__tests__') continue; // same exclusion as purity.test.ts, same rationale
    const p = join(dir, entry);
    const st = statSync(p);
    if (st.isDirectory()) out.push(...walk(p));
    else if (isScannedFile(entry)) out.push(p);
  }
  return out;
}

function scanEmoji(text: string): string[] {
  return [...stripComments(text).matchAll(EMOJI_RE)].map((m) => m[0]);
}

function scanRealFiles(): string[] {
  const violations: string[] = [];
  for (const dir of SCAN_DIRS) {
    for (const f of walk(join(CHAT_SIM_DIR, dir))) {
      const rel = f.slice(CHAT_SIM_DIR.length + 1).split('\\').join('/');
      if (CONTENT_EXCEPTIONS.has(rel)) continue;
      const hits = scanEmoji(readFileSync(f, 'utf8'));
      if (hits.length > 0) violations.push(`${rel}: ${[...new Set(hits)].join(' ')}`);
    }
  }
  return violations;
}

describe('emoji scan primitive (T-016 acceptance #2 twin)', () => {
  it('flags a synthetic clock emoji — the instrument can go red', () => {
    expect(scanEmoji("glyph: '🕐'")).toEqual(['🕐']);
  });

  it('flags a dingbat check mark (U+2713, same range the bug actually used)', () => {
    expect(scanEmoji("glyph: '✓✓'")).toEqual(['✓', '✓']);
  });

  it('passes a clean semantic id — the instrument can go green', () => {
    expect(scanEmoji("glyph: 'double-check'")).toEqual([]);
  });

  it('ignores emoji inside comments, same convention as purity.test.ts', () => {
    expect(scanEmoji("// the old glyph was '🕐'\nconst x = 1;")).toEqual([]);
  });
});

describe('adapters/** and element/** are free of literal emoji (T-016 acceptance #2)', () => {
  // RED by design at this task's boundary — see the file header and E-003. Flip to plain `it`
  // once the real violations below are gone (T-017 covers element/**; adapters/** needs a
  // follow-up task this lane cannot claim, per scope.write).
  // E-005 (CTO): era `it.fails` mientras T-017/T-018 tenian el gap abierto. Ambas cerraron,
  // el tripwire dio pase-inesperado, y aca pasa a ser un gate normal. Lo hizo el CTO porque
  // la lane duena (`core`) ya termino y el cambio es mecanico — disposition 3, con disclosure.
  it('no receipt/composer glyph literal remains outside the content exceptions', () => {
    expect(scanRealFiles()).toEqual([]);
  });
});
