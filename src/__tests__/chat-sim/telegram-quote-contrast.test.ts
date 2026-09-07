// __tests__/chat-sim/telegram-quote-contrast.test.ts — qa's own write cell (T-032 Part B / T-025).
//
// T-025 (role: skin, filed by skin during T-023) already reproduces this exact finding —
// `.cf-quote-author`'s Telegram-scoped rules (`--channel-telegram` / `--channel-telegram-out`)
// fail WCAG AA in 3 of 4 real combinations — with `styles.css` + `element/__tests__/
// wallpaper-contrast.test.ts` as its `scope.write`. Both files are `skin`'s single-writer cell
// (`file-ownership-matrix.md`: `styles.css` row has exactly one `W`, `qa` gets `–`) — this task
// asks qa to extend "the test that already exists" for the same finding, which is a real
// collision: qa cannot write into `wallpaper-contrast.test.ts` without creating a second writer
// on a file the matrix says must have exactly one. Resolved by building an equivalent instrument
// here, in qa's own cell, that (a) proves the same 3/4 failure against the REAL, live styles.css
// (not a hand-typed copy of the hex values), (b) proves the check is falsifiable both ways, and
// (c) evaluates a proposed fix in isolation — never applied to styles.css, since that write
// belongs to skin/T-025. Team-lead's instruction stands: where the honest fix would compromise
// Telegram's brand identity, say so and let it be escalated rather than forcing a value.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const STYLES_PATH = join(__dirname, '..', '..', 'components', 'chat-sim', 'styles.css');
const css = readFileSync(STYLES_PATH, 'utf8');

type RGB = readonly [number, number, number];

// Same WCAG math as element/__tests__/wallpaper-contrast.test.ts, duplicated rather than
// imported: that file is outside qa's write cell (skin's), and its helpers are module-local, not
// exported — importing internals across an ownership boundary would silently couple two lanes'
// files. Ownership discipline over DRY here (agent-floor.md "Scope discipline").
function hexToRgb(hex: string): RGB {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const n = parseInt(full, 16);
  return [(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff];
}

function channelLuminance(c: number): number {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

function relativeLuminance([r, g, b]: RGB): number {
  return 0.2126 * channelLuminance(r) + 0.7152 * channelLuminance(g) + 0.0722 * channelLuminance(b);
}

function contrastRatio(a: RGB, b: RGB): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const lighter = Math.max(la, lb);
  const darker = Math.min(la, lb);
  return (lighter + 0.05) / (darker + 0.05);
}

const TEXT_AA_THRESHOLD = 4.5;

function extractRuleBlock(source: string, selectorLiteral: string): string {
  const idx = source.indexOf(selectorLiteral);
  if (idx === -1) throw new Error(`Selector not found in styles.css: ${selectorLiteral}`);
  const closeIdx = source.indexOf('}', idx);
  return source.slice(idx, closeIdx === -1 ? undefined : closeIdx);
}

function extractCustomProperty(cssChunk: string, prop: string): RGB {
  const m = cssChunk.match(new RegExp(`${prop}:\\s*(#[0-9a-fA-F]{3,6})`));
  if (!m) throw new Error(`${prop} not found in chunk: ${cssChunk.slice(0, 200)}`);
  return hexToRgb(m[1]);
}

function extractPropertyRaw(cssChunk: string, prop: string): string {
  const m = cssChunk.match(new RegExp(`${prop.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&')}:\\s*([^;]+);`));
  if (!m) throw new Error(`${prop} not found in chunk: ${cssChunk.slice(0, 200)}`);
  return m[1].trim();
}

// The two live tokens the Telegram `.cf-quote-author` rules resolve to (styles.css:103-104,
// 178-185) — read from the real sheet, never re-typed as bare literals.
const TELEGRAM_ROOT_RULE = "[data-channel='telegram'] {";
const telegramAccentIn = extractCustomProperty(extractRuleBlock(css, TELEGRAM_ROOT_RULE), '--channel-telegram');
const telegramAccentOut = extractCustomProperty(extractRuleBlock(css, TELEGRAM_ROOT_RULE), '--channel-telegram-out');

// The 4 real backgrounds those two colors actually sit on (styles.css: root bubble-in #fff,
// Telegram-light out-bubble #effdde at line ~120, Telegram-dark in-bubble #182533 via the
// generic dark block, Telegram-dark out-bubble #3e6aa7 — the operator-corrected value at
// line ~208).
const LIGHT_BUBBLE_IN = extractCustomProperty(extractRuleBlock(css, '.cf-chat-sim {'), '--cf-cs-bubble-in');
const TELEGRAM_LIGHT_OUT_BUBBLE = extractCustomProperty(
  extractRuleBlock(css, "[data-channel='telegram'] .cf-msg[data-dir='out'] .cf-bubble {"),
  'background',
);
const DARK_BUBBLE_IN = extractCustomProperty(extractRuleBlock(css, "[data-theme='dark'] {"), '--cf-cs-bubble-in');
const TELEGRAM_DARK_OUT_BUBBLE = extractCustomProperty(
  extractRuleBlock(css, "[data-channel='telegram'][data-theme='dark'] .cf-msg[data-dir='out'] .cf-bubble {"),
  'background',
);

describe('Telegram .cf-quote-author text contrast — current, live styles.css (T-025 finding, extended per T-032)', () => {
  // Confirms the rules actually route through the two brand tokens above, not a hardcoded
  // literal — if skin ever inlines the hex directly, this (not the ratio checks) is what would
  // catch the drift first.
  it('.cf-quote-author (dir=in) resolves through --channel-telegram', () => {
    const raw = extractPropertyRaw(
      extractRuleBlock(css, "[data-channel='telegram'] .cf-msg[data-dir='in'] .cf-quote-author {"),
      'color',
    );
    expect(raw).toBe('var(--channel-telegram)');
  });

  it('.cf-quote-author (dir=out) resolves through --channel-telegram-out', () => {
    const raw = extractPropertyRaw(
      extractRuleBlock(css, "[data-channel='telegram'] .cf-msg[data-dir='out'] .cf-quote-author {"),
      'color',
    );
    expect(raw).toBe('var(--channel-telegram-out)');
  });

  // The one combination that already passes — regression guard so a future change can't quietly
  // take this one below AA while "fixing" the other three.
  it('IN, dark bubble (#182533): already clears AA — must stay that way', () => {
    expect(contrastRatio(telegramAccentIn, DARK_BUBBLE_IN)).toBeGreaterThanOrEqual(TEXT_AA_THRESHOLD);
  });

  // The 3 open failures (T-025's own numbers, reproduced here against the live sheet rather than
  // trusted as prose). Written as "this currently fails" — an honest defect probe, not a green
  // gate someone could point to as "already handled". Flips to a real pass once skin applies a
  // fix under T-025; until then this is the tracked, falsifiable state of the bug.
  it('IN, light bubble (#ffffff): still fails AA — open (T-025)', () => {
    expect(contrastRatio(telegramAccentIn, LIGHT_BUBBLE_IN)).toBeLessThan(TEXT_AA_THRESHOLD);
  });

  it('OUT, light bubble (#effdde): still fails AA — open (T-025)', () => {
    expect(contrastRatio(telegramAccentOut, TELEGRAM_LIGHT_OUT_BUBBLE)).toBeLessThan(TEXT_AA_THRESHOLD);
  });

  it('OUT, dark bubble (#3e6aa7): still fails AA — open (T-025)', () => {
    expect(contrastRatio(telegramAccentOut, TELEGRAM_DARK_OUT_BUBBLE)).toBeLessThan(TEXT_AA_THRESHOLD);
  });

  it('gemelo: the check is falsifiable — a value that DOES clear AA passes the same assertion shape', () => {
    // Proves the "fails AA" checks above aren't vacuous (e.g. threshold typo'd backwards) by
    // running the identical comparison against a color known to pass.
    const knownGood = hexToRgb('0d7a3f'); // --cf-cs-accent-text, already proven >=4.5:1 elsewhere
    expect(contrastRatio(knownGood, LIGHT_BUBBLE_IN)).toBeGreaterThanOrEqual(TEXT_AA_THRESHOLD);
  });
});

describe('Proposed values (for skin/T-025 to apply — NOT written to styles.css from this cell)', () => {
  // Methodology: scale each brand hue toward black by a factor `k`, same derivation T-023 used
  // for --cf-cs-accent-text (#25d366 -> #0d7a3f). Search performed once, offline, to find the
  // minimal darkening that clears 4.5:1 with a safety margin; the two SAFE proposals below are
  // pinned as literals and asserted, so this file also serves as the acceptance test for T-025's
  // eventual token values (swap the literal for `getComputedStyle`/the real token once it lands).

  it('PROPOSED — IN, light theme only: darken --channel-telegram from #37a1de to #2979a7 (k=0.75)', () => {
    // Cannot be a single non-theme-aware swap of --channel-telegram itself: the SAME token also
    // backs the reply-bar border and avatar fill (decorative, T-023's "pueden quedar" precedent),
    // and re-checked against the dark bubble this darkened value would UNDERSHOOT dark's own
    // needs less than the original does — still clears it, but by less margin. A dedicated
    // `--channel-telegram-quote-text` token, overridden back to the plain `--channel-telegram` in
    // `[data-theme='dark']` (dark already clears AA at the undarkened value — no need to touch
    // it there), is the shape that avoids collateral changes to the avatar/reply-bar. This is a
    // safe, brand-preserving fix: same hue, same channel, no cross-theme conflict.
    const proposed = hexToRgb('2979a7');
    expect(contrastRatio(proposed, LIGHT_BUBBLE_IN)).toBeGreaterThanOrEqual(TEXT_AA_THRESHOLD);
    expect(contrastRatio(telegramAccentIn, DARK_BUBBLE_IN)).toBeGreaterThanOrEqual(TEXT_AA_THRESHOLD); // dark: leave as-is
  });

  it('PROPOSED — OUT, light theme only: darken --channel-telegram-out from #5eb854 to #417f3a (k=0.69)', () => {
    const proposed = hexToRgb('417f3a');
    expect(contrastRatio(proposed, TELEGRAM_LIGHT_OUT_BUBBLE)).toBeGreaterThanOrEqual(TEXT_AA_THRESHOLD);
  });

  // NOT proposed — this is the case to escalate, not force. See ESCALATE-2026-09-07-telegram-
  // quote-dark-out in qa's report / the message to team-lead.
  it('ESCALATE, not proposed — OUT, dark theme (text on #3e6aa7): no same-hue darkening reaches AA', () => {
    // Unlike the two cases above, Telegram's dark-mode OUT bubble (#3e6aa7) is BLUE, not a
    // darkened green — T-013's dark palette inverts the bubble's hue between themes on purpose
    // (styles.css:205-210). Darkening #5eb854 toward black REDUCES its contrast against a
    // medium-luminance blue background (both approach the same luminance band) instead of
    // increasing it — verified across the full darkening range, worst case documented below.
    // The only same-hue values that clear 4.5:1 are pastel/near-white greens (>=80% lightened
    // toward #fff) that no longer read as Telegram's outbound green at all. That trade — AA vs.
    // legible brand color — is a brand decision, not a mechanical fix, exactly the class of call
    // team-lead asked to be escalated rather than forced.
    const darkestReasonableGreen = hexToRgb('2a5326'); // k=0.45, as dark as T-023's own darkening ever went
    expect(contrastRatio(darkestReasonableGreen, TELEGRAM_DARK_OUT_BUBBLE)).toBeLessThan(TEXT_AA_THRESHOLD);
  });
});
