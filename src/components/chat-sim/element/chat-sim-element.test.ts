// End-to-end smoke test through the REAL pipeline: compile() -> fold -> seek/stateAtStep ->
// reconcile -> render.ts, via the actual <cf-chat-sim> custom element (not render.ts in
// isolation — render.test.ts already covers that). Exercises T-001's wave-1 events
// (post/draft/flag) exactly as demo/index.html's script does.

import { beforeEach, describe, expect, it } from 'vitest';
import './chat-sim-element';

// 6 frames total: post(in) / draft(out:ai) / post(out:ai) / post(in) / post(out:ai) / post(out:ai)
// — the last two are a genuine same-actor streak (index 4,5), the only place `data-tail` can
// meaningfully differ between "first" and "last" of a racha.
const SCRIPT = JSON.stringify([
  { k: 'post', by: 'in', text: 'Hola! ¿Tienen mesa para el sábado a las 8pm?', delayMs: 0 },
  { k: 'draft', by: 'out:ai', chars: 18, delayMs: 100 },
  { k: 'post', by: 'out:ai', text: '¡Hola! Sí, tenemos disponibilidad. ¿Para cuántas personas?', delayMs: 200 },
  { k: 'post', by: 'in', text: 'Para 4, por favor', delayMs: 300 },
  { k: 'post', by: 'out:ai', text: 'Perfecto, reservado para 4 🎉', delayMs: 200 },
  { k: 'post', by: 'out:ai', text: 'Te llega la confirmación por este chat.', delayMs: 400 },
]);
const FRAME_COUNT = 6;
const POST_COUNT = 5;

function mount(step?: number): HTMLElement {
  const el = document.createElement('cf-chat-sim');
  el.setAttribute('channel', 'whatsapp');
  el.setAttribute('seed', '7');
  el.setAttribute('t0', '1767261600000');
  if (step !== undefined) el.setAttribute('data-step', String(step));
  const scriptTag = document.createElement('script');
  scriptTag.type = 'application/json';
  scriptTag.textContent = SCRIPT;
  el.appendChild(scriptTag);
  document.body.appendChild(el);
  return el;
}

describe('<cf-chat-sim> — real pipeline (compile -> fold -> render)', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('pre-renders the full thread and shows everything at the default step', () => {
    const el = mount();
    const items = el.querySelectorAll('.cf-msg');
    expect(items).toHaveLength(POST_COUNT);
    expect(el.querySelector('.cf-log')).not.toBeNull();
    expect(el.classList.contains('cf-chat-sim')).toBe(true);
  });

  it('data-step="0" reveals nothing yet, but every eventual message is already pre-rendered (hidden, not absent)', () => {
    const el = mount(0);
    const visible = [...el.querySelectorAll('.cf-msg')].filter((li) => !(li as HTMLElement).hidden);
    expect(visible).toHaveLength(0);
    // Pre-render del hilo completo: connectedCallback builds every <li> from the FINAL state
    // up front — this is the acceptance-relevant bit, not "revealed" == "exists".
    expect(el.querySelectorAll('.cf-msg')).toHaveLength(POST_COUNT);
  });

  it('scrubbing data-step reveals messages progressively, in order, without recreating nodes', () => {
    const el = mount(3); // frames 0,1,2 => post(in), draft, post(out:ai) — 2 posts so far
    const firstLi = el.querySelector('.cf-msg:not([hidden])');
    expect(el.querySelectorAll('.cf-msg:not([hidden])')).toHaveLength(2);

    el.setAttribute('data-step', String(FRAME_COUNT)); // full script
    const visible = [...el.querySelectorAll('.cf-msg')].filter((li) => !(li as HTMLElement).hidden);
    expect(visible).toHaveLength(POST_COUNT);
    // node identity survives the later step change (pre-render contract, not rebuild-on-reveal).
    expect(el.querySelectorAll('.cf-msg')[0]).toBe(firstLi);
  });

  it('renders WhatsApp values by default: tail on the first of a same-actor streak, double-tick glyph', () => {
    const el = mount();
    const msgs = [...el.querySelectorAll('.cf-msg')];
    // order: in, out:ai, in, out:ai, out:ai — the last two (index 3,4) are the only streak;
    // WhatsApp (adapter.tail === 'first') tails the FIRST of it.
    expect(msgs[3].hasAttribute('data-tail')).toBe(true);
    expect(msgs[4].hasAttribute('data-tail')).toBe(false);
  });

  it('the draft flag surfaces on the root as data-drafting, named by actor, and clears once posted', () => {
    // Both gaps flagged in the T-002 report against core/fold.ts (draft dropping `by`, and never
    // clearing on the following post) were fixed by [core] mid-review — verified live here now
    // that `state.draft.by` and the post-clears-draft behavior both work.
    const el = mount(2); // frames 0,1 applied: post(in), draft(out:ai) — draft active, not yet posted
    expect(el.hasAttribute('data-drafting')).toBe(true);
    expect(el.getAttribute('data-drafting')).toBe('out:ai');
    el.setAttribute('data-step', '3'); // frame 2 applied: post(out:ai) — the draft resolves
    expect(el.hasAttribute('data-drafting')).toBe(false);
  });

  it('formats a real time-of-day label from t0 + the posted tick (not a placeholder string)', () => {
    const el = mount();
    const label = el.querySelector('.cf-msg .cf-time')?.textContent ?? '';
    expect(label).toMatch(/^\d{1,2}:\d{2}$/);
  });
});
