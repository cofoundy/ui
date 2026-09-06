// element/icons.ts — SVG icon kit for <cf-chat-sim>'s own chrome (T-017 Alcance A).
//
// core/types.ts's `ReceiptIconId` ('clock' | 'check' | 'double-check' | 'alert') names WHICH
// icon a receipt state means (T-016); this file owns HOW it draws — vector paths, not a font
// glyph (types.ts:55-56). The composer's clip/emoji/mic icons are the same fix applied to the
// other literal-emoji spot this task's Alcance names ('📎'/'😊'/'➤', formerly
// chat-sim-element.ts:280-284): an emoji renders via the OS's own font (Apple Color Emoji, Segoe
// UI Emoji, Noto), so two machines give two different pixel grids for what's supposed to be the
// SAME chrome — exactly the gap capture/'s byte-identical-PNG guarantee can't survive.

const SVG_NS = 'http://www.w3.org/2000/svg';

function svg(viewBox: string, width: number, height: number, strokeWidth: string): SVGSVGElement {
  const el = document.createElementNS(SVG_NS, 'svg');
  el.setAttribute('viewBox', viewBox);
  el.setAttribute('width', String(width));
  el.setAttribute('height', String(height));
  el.setAttribute('fill', 'none');
  el.setAttribute('stroke', 'currentColor');
  el.setAttribute('stroke-width', strokeWidth);
  el.setAttribute('stroke-linecap', 'round');
  el.setAttribute('stroke-linejoin', 'round');
  return el;
}

function addPath(el: SVGSVGElement, d: string): void {
  const p = document.createElementNS(SVG_NS, 'path');
  p.setAttribute('d', d);
  el.appendChild(p);
}

function addDot(el: SVGSVGElement, cx: number, cy: number, r: number): void {
  const c = document.createElementNS(SVG_NS, 'circle');
  c.setAttribute('cx', String(cx));
  c.setAttribute('cy', String(cy));
  c.setAttribute('r', String(r));
  c.setAttribute('fill', 'currentColor');
  c.setAttribute('stroke', 'none');
  el.appendChild(c);
}

function addRing(el: SVGSVGElement, cx: number, cy: number, r: number): void {
  const c = document.createElementNS(SVG_NS, 'circle');
  c.setAttribute('cx', String(cx));
  c.setAttribute('cy', String(cy));
  c.setAttribute('r', String(r));
  el.appendChild(c); // inherits the <svg>'s stroke/fill=none — an unfilled ring
}

/** Single/double tick — a real WhatsApp/Telegram screenshot shows a vector checkmark, not a raw
 * '✓' rendered in the body font (kept from render.ts's original reasoning; only the call site
 * moved). `color` is set inline, straight from `TickReceiptStateStyle.color`. */
export function tickIcon(ticks: 1 | 2, color: string): SVGSVGElement {
  const el = svg('0 0 18 12', 15, 10, '1.7');
  el.classList.add('cf-receipt');
  el.style.color = color;
  addPath(el, ticks === 2 ? 'M1 6.7 4.1 9.8 10.2 2.4' : 'M4.5 6.7 7.6 9.8 13.7 2.4');
  if (ticks === 2) addPath(el, 'M7.6 6.7 10.7 9.8 16.8 2.4');
  return el;
}

/** `queued` — used to be the literal '🕐' glyph, T-016's whole reason for existing. */
export function clockIcon(color: string): SVGSVGElement {
  const el = svg('0 0 14 14', 12, 12, '1.3');
  el.classList.add('cf-receipt');
  el.style.color = color;
  addRing(el, 7, 7, 5.8);
  addPath(el, 'M7 3.8V7l2.6 1.5');
  return el;
}

/** `failed` — used to be a plain '!' character. */
export function alertIcon(color: string): SVGSVGElement {
  const el = svg('0 0 14 14', 12, 12, '1.3');
  el.classList.add('cf-receipt');
  el.style.color = color;
  addRing(el, 7, 7, 5.8);
  addPath(el, 'M7 4.2V8');
  addDot(el, 7, 10.4, 0.75);
  return el;
}

/** Telegram broadcast view-counter — was CSS `content: '👁 '` (styles.css), a font-rendered
 * emoji pseudo-element with the exact same cross-machine problem as the receipt glyphs above. */
export function eyeIcon(): SVGSVGElement {
  const el = svg('0 0 16 16', 13, 13, '1.3');
  addPath(el, 'M1 8s2.8-5 7-5 7 5 7 5-2.8 5-7 5-7-5-7-5z');
  addRing(el, 8, 8, 1.7);
  return el;
}

/** Composer — was the literal '📎' character. */
export function clipIcon(): SVGSVGElement {
  const el = svg('0 0 24 24', 15, 15, '2');
  addPath(
    el,
    'M20.5 12.5 12 21a5.5 5.5 0 0 1-7.8-7.8l8.5-8.5a3.5 3.5 0 1 1 5 5L9.2 18.2a1.5 1.5 0 0 1-2.1-2.1l7.4-7.4',
  );
  return el;
}

/** Composer — was the literal '😊' character. */
export function emojiIcon(): SVGSVGElement {
  const el = svg('0 0 24 24', 15, 15, '2');
  addRing(el, 12, 12, 9.5);
  addPath(el, 'M8 14.5s1.6 2 4 2 4-2 4-2');
  addDot(el, 9, 9.5, 0.9);
  addDot(el, 15, 9.5, 0.9);
  return el;
}

/** Composer's trailing action — was the literal '➤' character. Always mic, never a send arrow:
 * the composer input is a static placeholder ("Mensaje"), never real typed text, so the idle
 * affordance both real apps actually show for an empty box is the mic, not an arrow that implies
 * a message is ready to go (T-017 dispatch note on the composer icon set). */
export function micIcon(): SVGSVGElement {
  const el = svg('0 0 24 24', 14, 14, '2');
  addPath(el, 'M12 1.5a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0v-7a3 3 0 0 0-3-3z');
  addPath(el, 'M19 10.5v1.5a7 7 0 0 1-14 0v-1.5');
  addPath(el, 'M12 19v3');
  addPath(el, 'M8.5 22h7');
  return el;
}
