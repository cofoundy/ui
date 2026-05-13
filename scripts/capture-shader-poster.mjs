#!/usr/bin/env node
/**
 * Capture a frame-canonical poster of a ShaderHero render.
 *
 * Pipeline:
 *   1. Patch a target file to set animate="off" (deterministic frame).
 *   2. Wait for HMR.
 *   3. Headless Playwright capture at viewport 1920×1080, DSF 2.25 → ≈4286×1926 PNG.
 *      Hardware-accelerated via ANGLE/Metal on macOS, falls back gracefully elsewhere.
 *   4. Restore the patched file (animate="on").
 *   5. Resize + encode to WebP (1600w q78 by default).
 *
 * Usage:
 *   node capture-shader-poster.mjs \
 *     --url http://localhost:3000/ \
 *     --component path/to/ShaderCanvasInner.tsx \
 *     --out public/v2/hero/hero-poster.webp \
 *     --hero-selector .v2-hero \
 *     --content-selector .v2-hero-canvas \
 *     [--width 1600] [--quality 78] [--settle 4000]
 *
 * Requirements (caller's responsibility):
 *   - dev server running at --url
 *   - playwright + chromium installed (npx playwright install chromium)
 *   - imagemagick (`magick`) + cwebp on PATH
 *
 * Why animate=off:
 *   With animate=on, ShaderGradient's uTime advances per rAF tick from mount.
 *   The captured frame would depend on settle timing → non-reproducible. Toggling
 *   to animate=off + uTime=0 gives a deterministic t=0 frame. The script reverts
 *   the file before exit so the live shader keeps animating.
 */

import { chromium } from 'playwright';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

function parseArgs(argv) {
  const out = {};
  for (let i = 2; i < argv.length; i++) {
    const k = argv[i];
    if (!k.startsWith('--')) continue;
    const v = argv[i + 1];
    out[k.slice(2)] = v;
    i++;
  }
  return out;
}

const args = parseArgs(process.argv);
const URL = args.url || 'http://localhost:3000/';
const COMPONENT = args.component;
const OUT = args.out;
const HERO_SELECTOR = args['hero-selector'] || '.v2-hero';
const CONTENT_SELECTOR = args['content-selector'] || '.v2-hero-canvas';
const SHADER_SELECTOR = `${HERO_SELECTOR} canvas`;
const WIDTH = parseInt(args.width || '1600', 10);
const QUALITY = parseInt(args.quality || '78', 10);
const SETTLE_MS = parseInt(args.settle || '4000', 10);

if (!COMPONENT || !OUT) {
  console.error('Missing required flags: --component <path> --out <path>');
  process.exit(1);
}
if (!existsSync(COMPONENT)) {
  console.error(`Component file not found: ${COMPONENT}`);
  process.exit(1);
}

// Toggle animate="on" → animate="off" so the captured frame is deterministic.
const original = readFileSync(COMPONENT, 'utf8');
if (!/animate=(["'])on\1/.test(original)) {
  console.error(`Could not find animate="on" in ${COMPONENT}. Aborting.`);
  process.exit(1);
}
const patched = original.replace(/animate=(["'])on\1/, 'animate="off"');
writeFileSync(COMPONENT, patched);
console.log(`Patched ${COMPONENT}: animate=on → animate=off`);

// Restore on any exit (success, error, signal).
let restored = false;
function restore() {
  if (restored) return;
  writeFileSync(COMPONENT, original);
  restored = true;
  console.log(`Restored ${COMPONENT}`);
}
process.on('exit', restore);
process.on('SIGINT', () => { restore(); process.exit(130); });
process.on('SIGTERM', () => { restore(); process.exit(143); });
process.on('uncaughtException', (err) => { restore(); console.error(err); process.exit(1); });

const tmpPng = join(tmpdir(), `shader-poster-${Date.now()}.png`);

try {
  const browser = await chromium.launch({
    headless: false,
    args: [
      '--use-angle=metal',
      '--enable-gpu',
      '--ignore-gpu-blocklist',
      '--enable-features=Vulkan,UseSkiaRenderer',
    ],
  });
  const ctx = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 2.25,
    reducedMotion: 'no-preference',
  });
  const page = await ctx.newPage();
  page.on('pageerror', (err) => console.error('PAGE ERR:', err.message));

  await page.goto(URL, { waitUntil: 'networkidle' });
  await page.waitForSelector(SHADER_SELECTOR, { timeout: 15000 });
  await page.waitForTimeout(SETTLE_MS);

  const gpu = await page.evaluate(() => {
    const c = document.createElement('canvas');
    const gl = c.getContext('webgl2') || c.getContext('webgl');
    if (!gl) return 'no-webgl';
    const dbg = gl.getExtension('WEBGL_debug_renderer_info');
    return dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : 'no-debug-info';
  });
  console.log(`GPU renderer: ${gpu}`);
  if (/swiftshader/i.test(gpu)) {
    console.warn('WARNING: capture is running on swiftshader (software). Quality will be degraded.');
  }

  await page.evaluate((sel) => {
    const content = document.querySelector(sel);
    if (content instanceof HTMLElement) content.style.visibility = 'hidden';
    document.querySelectorAll('nav').forEach((n) => { n.style.visibility = 'hidden'; });
  }, CONTENT_SELECTOR);
  await page.waitForTimeout(500);

  const heroBox = await page.locator(HERO_SELECTOR).boundingBox();
  if (!heroBox) throw new Error(`Hero not found: ${HERO_SELECTOR}`);

  await page.screenshot({ path: tmpPng, clip: heroBox, type: 'png' });
  console.log(`Captured PNG: ${tmpPng} (${JSON.stringify(heroBox)})`);
  await browser.close();

  const tmpResized = tmpPng.replace('.png', `-${WIDTH}.png`);
  execFileSync('magick', [tmpPng, '-resize', `${WIDTH}x`, '-strip', tmpResized], { stdio: 'inherit' });
  execFileSync('cwebp', ['-q', String(QUALITY), tmpResized, '-o', OUT], { stdio: 'inherit' });
  console.log(`\n✓ Poster written: ${OUT}`);
} finally {
  restore();
}
