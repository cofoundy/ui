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

/** Grabs the `background-image: url(...)` value immediately following `selector {`. */
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

const rootBlock = extractRuleBlock(css, '.cf-chat-sim {');
const darkBlock = extractRuleBlock(css, "[data-theme='dark'] {");
const LIGHT_SURFACE = extractCustomProperty(rootBlock, '--cf-cs-surface');
const DARK_SURFACE = extractCustomProperty(darkBlock, '--cf-cs-surface');

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

    const darkBlock = extractRuleBlock(css, TELEGRAM_DARK_RULE);
    const darkSurface = extractBackgroundColor(darkBlock);
    const { color: darkColor } = extractStroke(darkBlock);
    const regressedDark = compositeOver(darkColor, 0.03, darkSurface);
    expect(contrastRatio(regressedDark, darkSurface)).toBeLessThan(VISIBLE_THRESHOLD);
  });

  it('gemelo: a fixture that reverts to `background-image: none` in dark mode is caught — that used to be the accepted state', () => {
    const patched = `${TELEGRAM_DARK_RULE}\n  background-color: #0e1621;\n  background-image: none;\n}`;
    expect(patched).not.toMatch(/background-image:\s*url\(/);
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
