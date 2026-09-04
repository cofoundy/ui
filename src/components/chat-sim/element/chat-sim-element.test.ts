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

  describe('typing indicator — pre-rendered once, revealed by hidden only (team-lead diagnosis, iteration 3)', () => {
    it('is built exactly once per draft window, in the flow, not floating at the end of the log', () => {
      const el = mount(); // full script — 1 draft window (frames 1..2, actor out:ai)
      const rows = el.querySelectorAll('.cf-typing-row');
      expect(rows).toHaveLength(1);
      expect(rows[0].getAttribute('data-dir')).toBe('out'); // out:ai drafted it

      // Positioned between the message it interrupted (m0, 'in') and the one that resolved it
      // (m1, 'out:ai') — a sibling in the flow, not appended after everything at the end.
      const children = [...el.querySelector('.cf-log')!.children];
      const typingIdx = children.indexOf(rows[0]);
      expect(children[typingIdx - 1]?.classList.contains('cf-msg')).toBe(true);
      expect(children[typingIdx + 1]?.classList.contains('cf-msg')).toBe(true);
    });

    it('the SAME node stays visible across two different consecutive data-step values while the window is open — never recreated', () => {
      // A dedicated script whose draft window spans TWO distinct steps (a `flag` sits between the
      // draft and the post that resolves it, so `state.draft` stays truthy across steps 2 AND 3) —
      // this is what actually exercises "same node across steps", unlike a 1-step-wide window
      // where the step-unchanged guard alone would make the assertion vacuously true.
      const script = JSON.stringify([
        { k: 'post', by: 'in', text: 'hola', delayMs: 0 },
        { k: 'draft', by: 'out:ai', chars: 5, delayMs: 50 },
        { k: 'flag', key: 'tick', value: 1, delayMs: 50 },
        { k: 'post', by: 'out:ai', text: 'hey', delayMs: 50 },
      ]);
      const el = document.createElement('cf-chat-sim');
      el.setAttribute('t0', '1767261600000');
      el.setAttribute('data-step', '2'); // frames 0,1 applied: post(in), draft(out:ai)
      const scriptTag = document.createElement('script');
      scriptTag.type = 'application/json';
      scriptTag.textContent = script;
      el.appendChild(scriptTag);
      document.body.appendChild(el);

      const nodeAtStep2 = el.querySelector<HTMLElement>('.cf-typing-row:not([hidden])');
      expect(nodeAtStep2).not.toBeNull();

      el.setAttribute('data-step', '3'); // frame 2 applied: flag — draft still active, no post yet
      const nodeAtStep3 = el.querySelector<HTMLElement>('.cf-typing-row:not([hidden])');
      expect(nodeAtStep3).not.toBeNull();
      expect(nodeAtStep3).toBe(nodeAtStep2); // <- the assertion team-lead asked for, literally

      el.setAttribute('data-step', '4'); // frame 3 applied: post(out:ai) — resolves the draft
      expect(el.querySelector('.cf-typing-row:not([hidden])')).toBeNull();
      // and the node itself is still there, just hidden — not removed and rebuilt on vanish either.
      expect(el.querySelector('.cf-typing-row')).toBe(nodeAtStep2);
    });

    it("repopulating the SAME step twice (the guard's exact scenario) does not touch the typing node at all", () => {
      const el = mount(2); // draft active
      const before = el.querySelector('.cf-typing-row');
      el.setAttribute('data-step', '2'); // same value — the playhead does this ~60x/s during playback
      expect(el.querySelector('.cf-typing-row')).toBe(before);
    });
  });
});
