// T-020 acceptance #1/#2: the instrument that was missing — "ningún test mira el wallpaper".
//
// Operator report: "te quitaste los fondos de pantalla doodles". They were never removed: the
// WhatsApp doodle's stroke is hardcoded `stroke='%23000'` (BLACK) at 4.5% opacity. That reads as
// a faint texture on the light surface, but once T-013's dark theme flips `--cf-cs-surface` to
// near-black, it's black-on-black — invisible. The stroke never adapted to theme.
//
// Same shape as no-tailwind.test.ts / bundle-freshness.test.ts (agent-floor.md precedent in this
// family): a static scan of styles.css as the falsifiable instrument, not a rendered-DOM
// screenshot diff — this repo has neither a browser test runner nor a way to rasterize a CSS
// `background-image` data URI in jsdom.
//
// Contrast is measured as a real WCAG relative-luminance ratio between the doodle stroke
// (alpha-composited over the resolved `--cf-cs-surface`) and the bare surface — not just "is the
// hex different". A ratio of 1.0 means the two are visually identical (invisible); the threshold
// below (1.05) sits strictly between the measured BUG case (~1.009, black-on-dark) and both the
// existing light-mode design and the fix (~1.10 / ~1.16) — see the twin test for the exact
// numbers that justify it.
//
// T-023 grew this file past "just the wallpaper": B fixed a gemelo that asserted against a local
// string instead of the real sheet (see the Telegram describe block below); A/D added WCAG text-
// contrast coverage (dark-mode stamp/tick meta color, quote-author, avatar initial) and C added a
// presence + readability check for `:focus-visible`. Same falsifiable-static-scan shape throughout
// — "es el único gate del ciclo que mide percepción" is exactly why it grows here, not in a
// parallel file.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const STYLES_PATH = join(__dirname, '..', '..', 'styles.css');
const css = readFileSync(STYLES_PATH, 'utf8');

type RGB = readonly [number, number, number];

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

/** WCAG contrast ratio, order-independent (always >= 1). */
function contrastRatio(a: RGB, b: RGB): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const lighter = Math.max(la, lb);
  const darker = Math.min(la, lb);
  return (lighter + 0.05) / (darker + 0.05);
}

/** Alpha-composite `fg` over opaque `bg` — enough for a single low-opacity stroke over a solid
 * surface (no other layers involved in `.cf-log`'s background stack). */
function compositeOver(fg: RGB, alpha: number, bg: RGB): RGB {
  return [0, 1, 2].map((i) => fg[i] * alpha + bg[i] * (1 - alpha)) as unknown as RGB;
}

/** A ratio this low means the stroke is not meaningfully distinguishable from the surface it
 * sits on — this is the exact failure mode the operator reported. Chosen strictly between the
 * measured bug (~1.009) and the measured working cases (~1.10 light, ~1.16 dark-fixed) — see the
 * twin test below for the numbers. */
const VISIBLE_THRESHOLD = 1.05;

/** WCAG 2.x AA: normal text needs >= 4.5:1 against its background (T-023 A/D). */
const TEXT_AA_THRESHOLD = 4.5;

/** WCAG 2.x AA: non-text UI components (e.g. a focus indicator) need >= 3:1 (T-023 C). */
const NON_TEXT_AA_THRESHOLD = 3;

/** Extract the first `stroke='%23HEX'` + `stroke-opacity='N'` pair out of a background-image
 * data-URI chunk of styles.css (the doodle SVGs only ever declare one stroke color). */
function extractStroke(cssChunk: string): { color: RGB; opacity: number } {
  const colorMatch = cssChunk.match(/stroke=%27%23([0-9a-fA-F]{3,6})%27|stroke='%23([0-9a-fA-F]{3,6})'/);
  const opacityMatch = cssChunk.match(/stroke-opacity=%27([\d.]+)%27|stroke-opacity='([\d.]+)'/);
  if (!colorMatch || !opacityMatch) {
    throw new Error(`Could not find stroke/stroke-opacity in CSS chunk: ${cssChunk.slice(0, 200)}`);
  }
  const hex = colorMatch[1] ?? colorMatch[2];
  const opacity = Number(opacityMatch[1] ?? opacityMatch[2]);
  return { color: hexToRgb(hex), opacity };
}

/** Grabs the CSS rule body immediately following `selector {`. */
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

/** Raw (un-parsed) value of a CSS property/custom-property — e.g. `"2px solid var(--cf-cs-ink)"`
 * or `"var(--cf-cs-accent-text)"`. Used where the declared value isn't a literal hex (T-023). */
function extractPropertyRaw(cssChunk: string, prop: string): string {
  const m = cssChunk.match(new RegExp(`${prop.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&')}:\\s*([^;]+);`));
  if (!m) throw new Error(`${prop} not found in chunk: ${cssChunk.slice(0, 200)}`);
  return m[1].trim();
}

/** `{ "--token": "raw value" }` for every custom property declared directly in a rule block —
 * used to resolve one level of `var(--x)` indirection (T-023: tokens like `--cf-cs-accent-text`
 * are declared as `var(--cf-cs-accent)` in dark theme, not a literal hex). */
function buildTokenMap(block: string): Record<string, string> {
  const map: Record<string, string> = {};
  const re = /(--[\w-]+):\s*([^;]+);/g;
  let m: RegExpExecArray | null;
  // eslint-disable-next-line no-cond-assign
  while ((m = re.exec(block))) {
    map[m[1]] = m[2].trim();
  }
  return map;
}

/** Resolves a raw CSS color value to RGB, following at most one `var(--token)` indirection
 * through the supplied token map (this file's tokens never chain deeper than that). */
function resolveColor(raw: string, tokens: Record<string, string>): RGB {
  const varMatch = raw.match(/^var\((--[\w-]+)\)$/);
  if (varMatch) {
    const resolved = tokens[varMatch[1]];
    if (!resolved) throw new Error(`Unresolved token ${varMatch[1]} (raw: ${raw})`);
    return resolveColor(resolved, tokens);
  }
  return hexToRgb(raw);
}

const rootBlock = extractRuleBlock(css, '.cf-chat-sim {');
const darkBlock = extractRuleBlock(css, "[data-theme='dark'] {");
const LIGHT_SURFACE = extractCustomProperty(rootBlock, '--cf-cs-surface');
const DARK_SURFACE = extractCustomProperty(darkBlock, '--cf-cs-surface');
const ROOT_TOKENS = buildTokenMap(rootBlock);
const DARK_TOKENS = { ...ROOT_TOKENS, ...buildTokenMap(darkBlock) };

const GENERIC_PATTERN_RULE = "[data-wallpaper='pattern'] .cf-log {";
const WHATSAPP_DARK_RULE = "[data-channel='whatsapp'][data-theme='dark'] .cf-log {";
const TELEGRAM_DARK_RULE = "[data-channel='telegram'][data-theme='dark'] .cf-log {";

describe('WhatsApp wallpaper contrast (T-020 acceptance #1)', () => {
  it('the doodle stroke is visibly distinct from the log background in LIGHT mode', () => {
    const { color, opacity } = extractStroke(extractRuleBlock(css, GENERIC_PATTERN_RULE));
    const composited = compositeOver(color, opacity, LIGHT_SURFACE);
    expect(contrastRatio(composited, LIGHT_SURFACE)).toBeGreaterThanOrEqual(VISIBLE_THRESHOLD);
  });

  it('the doodle stroke is visibly distinct from the log background in DARK mode', () => {
    const { color, opacity } = extractStroke(extractRuleBlock(css, WHATSAPP_DARK_RULE));
    const composited = compositeOver(color, opacity, DARK_SURFACE);
    expect(contrastRatio(composited, DARK_SURFACE)).toBeGreaterThanOrEqual(VISIBLE_THRESHOLD);
  });

  it('gemelo: reverting the dark stroke back to BLACK (the shipped regression) DOES fail the check', () => {
    // Not a mutation of the real file (agent-floor.md's dedupe-on-writer concern doesn't apply
    // here, but the no-tailwind.test.ts precedent is: express the "bad" state as an inline
    // fixture, prove the instrument catches it, never touch the committed file to do so).
    const regressedBlackStroke: RGB = [0x00, 0x00, 0x00];
    const regressedOpacity = 0.045; // the value that actually shipped in T-013
    const composited = compositeOver(regressedBlackStroke, regressedOpacity, DARK_SURFACE);
    const ratio = contrastRatio(composited, DARK_SURFACE);
    expect(ratio).toBeLessThan(VISIBLE_THRESHOLD); // proves the probe can go red, not just green
  });
});

// T-021 acceptance #1: this describe block used to assert the OPPOSITE — that Telegram-dark had
// `background-image: none` and was "correct fidelity to real Telegram, not a gap". That assertion
// came from telegram-fidelity-fix.md's own "~2% de contraste, casi imperceptible" number, which
// that SAME research flagged as NOT verified ("el default vivo del servidor puede ser un gradiente
// animado ... no lo pude verificar sin sesión"). The CTO shipped the unverified value anyway. The
// operator's real Telegram screenshot shows a clearly visible wallpaper in both themes, contradicting
// the spec — field truth wins over an admittedly-unverified number. So this block is inverted: it
// now asserts Telegram's wallpaper IS visible (same instrument as the WhatsApp block above), and the
// old "no image in dark mode" assertion is gone for good, not just weakened.
const TELEGRAM_LIGHT_RULE = "[data-channel='telegram'] .cf-log {";

function extractBackgroundColor(cssChunk: string): RGB {
  return extractCustomProperty(cssChunk, 'background-color');
}

describe('Telegram wallpaper contrast (T-021 acceptance #1 — reverses T-020’s Telegram-dark call)', () => {
  it('the doodle stroke is visibly distinct from the log background in LIGHT mode', () => {
    const block = extractRuleBlock(css, TELEGRAM_LIGHT_RULE);
    const surface = extractBackgroundColor(block);
    const { color, opacity } = extractStroke(block);
    const composited = compositeOver(color, opacity, surface);
    expect(contrastRatio(composited, surface)).toBeGreaterThanOrEqual(VISIBLE_THRESHOLD);
  });

  it('the doodle stroke is visibly distinct from the log background in DARK mode', () => {
    const block = extractRuleBlock(css, TELEGRAM_DARK_RULE);
    const surface = extractBackgroundColor(block);
    const { color, opacity } = extractStroke(block);
    const composited = compositeOver(color, opacity, surface);
    expect(contrastRatio(composited, surface)).toBeGreaterThanOrEqual(VISIBLE_THRESHOLD);
  });

  it('gemelo: reverting either theme back to the shipped 3% opacity DOES fail the check', () => {
    const lightBlock = extractRuleBlock(css, TELEGRAM_LIGHT_RULE);
    const lightSurface = extractBackgroundColor(lightBlock);
    const { color: lightColor } = extractStroke(lightBlock);
    const regressedLight = compositeOver(lightColor, 0.03, lightSurface);
    expect(contrastRatio(regressedLight, lightSurface)).toBeLessThan(VISIBLE_THRESHOLD);

    const darkBlock2 = extractRuleBlock(css, TELEGRAM_DARK_RULE);
    const darkSurface = extractBackgroundColor(darkBlock2);
    const { color: darkColor } = extractStroke(darkBlock2);
    const regressedDark = compositeOver(darkColor, 0.03, darkSurface);
    expect(contrastRatio(regressedDark, darkSurface)).toBeLessThan(VISIBLE_THRESHOLD);
  });

  // T-023 B: this used to be
  //   const patched = `${TELEGRAM_DARK_RULE}\n  background-color: #0e1621;\n  background-image: none;\n}`;
  //   expect(patched).not.toMatch(/background-image:\s*url\(/);
  // — a check against a hand-built LOCAL STRING that never read `css`/`TELEGRAM_DARK_RULE`'s
  // actual extracted content at all. It could not fail: the literal always lacked `url(`, no
  // matter what styles.css said. An auditor injected exactly the regression this test claims to
  // catch (styles.css:137 `background-image: none` in dark) and this test stayed green while its
  // 3 siblings above went red. Fixed shape: read the REAL rule, assert on THAT, then prove the
  // SAME assertion flips red when the real rule's content (not a disconnected literal) is mutated.
  it('the dark-mode rule ships a real background-image, not `none`', () => {
    const block = extractRuleBlock(css, TELEGRAM_DARK_RULE);
    expect(block).toMatch(/background-image:\s*url\(/);
  });

  it('gemelo: reverting the REAL rule’s background-image to `none` in dark mode is caught by the same check', () => {
    const block = extractRuleBlock(css, TELEGRAM_DARK_RULE);
    expect(block).toMatch(/background-image:\s*url\(/); // sanity: starts passing, not red-only
    const regressed = block.replace(/background-image:\s*url\([^)]*\)/, 'background-image: none');
    expect(regressed).not.toMatch(/background-image:\s*url\(/);
  });
});

describe('Telegram vs WhatsApp doodle silhouettes stay distinct (T-021 acceptance #3)', () => {
  it('the two light-mode background-image data URIs differ', () => {
    const whatsappImage = extractRuleBlock(css, GENERIC_PATTERN_RULE).match(/background-image:\s*url\([^)]*\)/)?.[0];
    const telegramImage = extractRuleBlock(css, TELEGRAM_LIGHT_RULE).match(/background-image:\s*url\([^)]*\)/)?.[0];
    expect(whatsappImage).toBeTruthy();
    expect(telegramImage).toBeTruthy();
    expect(telegramImage).not.toBe(whatsappImage);
  });

  it('the two dark-mode background-image data URIs differ', () => {
    const whatsappDarkImage = extractRuleBlock(css, WHATSAPP_DARK_RULE).match(/background-image:\s*url\([^)]*\)/)?.[0];
    const telegramDarkImage = extractRuleBlock(css, TELEGRAM_DARK_RULE).match(/background-image:\s*url\([^)]*\)/)?.[0];
    expect(whatsappDarkImage).toBeTruthy();
    expect(telegramDarkImage).toBeTruthy();
    expect(telegramDarkImage).not.toBe(whatsappDarkImage);
  });
});

// T-023 acceptance A: the dark theme block never redefined `--cf-cs-bubble-out-meta` (the stamp's
// time/edited text color, and — via fixtures.ts/adapters/*.ts — the receipt-tick color too), so
// it stayed the light-mode #5b8a55 against the operator's corrected dark outgoing bubbles.
describe('Dark-mode outgoing-bubble meta text (time + ticks) contrast (T-023 acceptance A)', () => {
  const WHATSAPP_DARK_ROOT_RULE = "[data-channel='whatsapp'][data-theme='dark'] {";
  const TELEGRAM_DARK_ROOT_RULE = "[data-channel='telegram'][data-theme='dark'] {";
  const WHATSAPP_DARK_OUT_BUBBLE_RULE = "[data-channel='whatsapp'][data-theme='dark'] .cf-msg[data-dir='out'] .cf-bubble {";
  const TELEGRAM_DARK_OUT_BUBBLE_RULE = "[data-channel='telegram'][data-theme='dark'] .cf-msg[data-dir='out'] .cf-bubble {";

  it('WhatsApp: meta text is WCAG AA readable against the operator-corrected dark outgoing bubble', () => {
    const meta = extractCustomProperty(extractRuleBlock(css, WHATSAPP_DARK_ROOT_RULE), '--cf-cs-bubble-out-meta');
    const bubbleBg = extractCustomProperty(extractRuleBlock(css, WHATSAPP_DARK_OUT_BUBBLE_RULE), 'background');
    expect(contrastRatio(meta, bubbleBg)).toBeGreaterThanOrEqual(TEXT_AA_THRESHOLD);
  });

  it('Telegram: meta text is WCAG AA readable against the operator-corrected dark outgoing bubble', () => {
    const meta = extractCustomProperty(extractRuleBlock(css, TELEGRAM_DARK_ROOT_RULE), '--cf-cs-bubble-out-meta');
    const bubbleBg = extractCustomProperty(extractRuleBlock(css, TELEGRAM_DARK_OUT_BUBBLE_RULE), 'background');
    expect(contrastRatio(meta, bubbleBg)).toBeGreaterThanOrEqual(TEXT_AA_THRESHOLD);
  });

  it('gemelo: the pre-fix shipped meta color (#5b8a55, no per-channel override) fails against both operator-corrected backgrounds', () => {
    const shippedMeta: RGB = [0x5b, 0x8a, 0x55];
    const whatsappBg = extractCustomProperty(extractRuleBlock(css, WHATSAPP_DARK_OUT_BUBBLE_RULE), 'background');
    const telegramBg = extractCustomProperty(extractRuleBlock(css, TELEGRAM_DARK_OUT_BUBBLE_RULE), 'background');
    expect(contrastRatio(shippedMeta, whatsappBg)).toBeLessThan(TEXT_AA_THRESHOLD);
    expect(contrastRatio(shippedMeta, telegramBg)).toBeLessThan(TEXT_AA_THRESHOLD);
  });
});

// T-023 acceptance D: text colored directly with the brand accent (#25d366) fails AA on the
// surfaces it actually sits on. "Accent oscurecido para el texto; la barra y el fondo pueden
// quedar" — the border-bar/background USES of --cf-cs-accent are untouched; only the two TEXT
// uses (quote author, avatar initial) get a darkened value.
describe('Quote-author + avatar-initial text contrast (T-023 acceptance D)', () => {
  // Leading `\n` matters: `.cf-quote-author {` alone also matches inside the Telegram-scoped
  // `.cf-msg[data-dir='in'] .cf-quote-author {` rules earlier in the file (indexOf finds the
  // FIRST occurrence) — this pins it to the standalone top-level rule, which is what governs
  // the default/WhatsApp case this describe block tests.
  const QUOTE_AUTHOR_RULE = '\n.cf-quote-author {';
  const AVATAR_RULE = '.cf-avatar {';
  const TELEGRAM_ROOT_RULE = "[data-channel='telegram'] {";
  const LIGHT_BUBBLE_IN = extractCustomProperty(rootBlock, '--cf-cs-bubble-in'); // #ffffff
  const LIGHT_BUBBLE_OUT = extractCustomProperty(rootBlock, '--cf-cs-bubble-out'); // #d9fdd3

  it('default/WhatsApp quote-author text is WCAG AA readable on the light inbound bubble', () => {
    const raw = extractPropertyRaw(extractRuleBlock(css, QUOTE_AUTHOR_RULE), 'color');
    const color = resolveColor(raw, ROOT_TOKENS);
    expect(contrastRatio(color, LIGHT_BUBBLE_IN)).toBeGreaterThanOrEqual(TEXT_AA_THRESHOLD);
  });

  it('default/WhatsApp quote-author text is WCAG AA readable on the light outbound bubble', () => {
    const raw = extractPropertyRaw(extractRuleBlock(css, QUOTE_AUTHOR_RULE), 'color');
    const color = resolveColor(raw, ROOT_TOKENS);
    expect(contrastRatio(color, LIGHT_BUBBLE_OUT)).toBeGreaterThanOrEqual(TEXT_AA_THRESHOLD);
  });

  it('gemelo: the pre-fix shipped color (--cf-cs-accent, #25d366 unresolved) fails on both light bubbles', () => {
    const shipped = resolveColor('var(--cf-cs-accent)', ROOT_TOKENS);
    expect(contrastRatio(shipped, LIGHT_BUBBLE_IN)).toBeLessThan(TEXT_AA_THRESHOLD);
    expect(contrastRatio(shipped, LIGHT_BUBBLE_OUT)).toBeLessThan(TEXT_AA_THRESHOLD);
  });

  it('avatar-initial text is WCAG AA readable on the default/WhatsApp accent fill', () => {
    const textRaw = extractPropertyRaw(extractRuleBlock(css, AVATAR_RULE), 'color');
    const bgRaw = extractPropertyRaw(extractRuleBlock(css, AVATAR_RULE), 'background');
    const text = resolveColor(textRaw, ROOT_TOKENS);
    const bg = resolveColor(bgRaw, ROOT_TOKENS);
    expect(contrastRatio(text, bg)).toBeGreaterThanOrEqual(TEXT_AA_THRESHOLD);
  });

  it('avatar-initial text is ALSO WCAG AA readable on Telegram’s blue avatar fill (same token, no per-channel override needed)', () => {
    const textRaw = extractPropertyRaw(extractRuleBlock(css, AVATAR_RULE), 'color');
    const text = resolveColor(textRaw, ROOT_TOKENS);
    const telegramAccent = extractCustomProperty(extractRuleBlock(css, TELEGRAM_ROOT_RULE), '--channel-telegram');
    expect(contrastRatio(text, telegramAccent)).toBeGreaterThanOrEqual(TEXT_AA_THRESHOLD);
  });

  it('gemelo: the pre-fix shipped avatar text (--cf-cs-accent-ink, #fff unresolved) fails on the accent fill', () => {
    const shipped = resolveColor('var(--cf-cs-accent-ink)', ROOT_TOKENS);
    const bg = resolveColor('var(--cf-cs-accent)', ROOT_TOKENS);
    expect(contrastRatio(shipped, bg)).toBeLessThan(TEXT_AA_THRESHOLD);
  });
});

// T-023 acceptance C: `grep -rn "focus-visible\|:focus" src/components/chat-sim/` returned ZERO
// hits before this task. This is the static-scan equivalent of that grep, plus a check that the
// ring it adds is actually readable (a focus indicator nobody can see doesn't satisfy the intent).
describe('Focus-visible ring exists and is readable (T-023 acceptance C)', () => {
  const FOCUS_VISIBLE_RULE = ':focus-visible {';

  it('a :focus-visible rule exists for interactive elements in the family', () => {
    expect(css).toMatch(/:focus-visible\s*\{/);
  });

  it('gemelo: a sheet with the rule stripped does NOT match', () => {
    const stripped = css.replace(/[^{}]*:focus-visible[^{}]*\{[^}]*\}/g, '');
    expect(stripped).not.toMatch(/:focus-visible\s*\{/);
  });

  it('the ring color clears the non-text 3:1 minimum against both themes’ surfaces', () => {
    const block = extractRuleBlock(css, FOCUS_VISIBLE_RULE);
    const outlineRaw = extractPropertyRaw(block, 'outline');
    const varMatch = outlineRaw.match(/var\((--[\w-]+)\)/);
    if (!varMatch) throw new Error(`Expected a var(--token) in outline value: ${outlineRaw}`);
    const ringLight = resolveColor(`var(${varMatch[1]})`, ROOT_TOKENS);
    const ringDark = resolveColor(`var(${varMatch[1]})`, DARK_TOKENS);
    expect(contrastRatio(ringLight, LIGHT_SURFACE)).toBeGreaterThanOrEqual(NON_TEXT_AA_THRESHOLD);
    expect(contrastRatio(ringDark, DARK_SURFACE)).toBeGreaterThanOrEqual(NON_TEXT_AA_THRESHOLD);
  });

  it('gemelo: the brand accent (the obvious-but-wrong choice) fails that same check in light mode', () => {
    const accent = resolveColor('var(--cf-cs-accent)', ROOT_TOKENS);
    expect(contrastRatio(accent, LIGHT_SURFACE)).toBeLessThan(NON_TEXT_AA_THRESHOLD);
  });
});
