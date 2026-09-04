// T-007 acceptance #1: "Snapshot cruzado: element y react en el mismo t producen el mismo DOM
// semántico." — mounts the REAL `<cf-chat-sim>` custom element ([skin], T-002) and the REAL
// `<MessageThread>` ([app], this task) against the identical (script, seed, channel, locale, tz,
// t0) and the same step, then diffs a recursive, order-preserving canonicalization of both DOMs
// (tag, sorted classes, non-style attributes, direct text, children) — not a raw HTML string
// compare, which would be defeated by attribute-ordering or self-closing-tag noise that carries
// no semantic meaning.
//
// Deliberately imports `../../element/chat-sim-element` HERE (test-only) to register
// `<cf-chat-sim>` — the shipped react/ files never do this (see engine.ts's header: the SSR/
// double-registration hazard). A test file isn't shipped, so there's no such hazard here.

import { afterEach, describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import '../../element/chat-sim-element';
import { compile } from '../../core/compile';
import { getAdapter } from '../../adapters/registry';
import type { ChannelId, SimScript } from '../../core/types';
import {
  dateSeparators,
  draftIntervals,
  fullSequence,
  postedAtByMsgId,
  stateAtStep,
} from '../engine';
import { MessageThread } from '../MessageThread';

const T0 = 1767261600000; // same literal element/chat-sim-element.test.ts uses
const LOCALE = 'es-PE';
const TZ = 'America/Lima';
const SEED = 7;

// Same 6-frame script as element/chat-sim-element.test.ts (post/draft/post/post/post/post, with
// a genuine same-actor streak at the end) — deliberately reused so this test rides the same
// fixture element/'s own suite already trusts, rather than inventing a second "reference" script
// whose correctness nobody has checked.
const SCRIPT: SimScript = [
  { k: 'post', by: 'in', text: 'Hola! ¿Tienen mesa para el sábado a las 8pm?', delayMs: 0 },
  { k: 'draft', by: 'out:ai', chars: 18, delayMs: 100 },
  { k: 'post', by: 'out:ai', text: '¡Hola! Sí, tenemos disponibilidad. ¿Para cuántas personas?', delayMs: 200 },
  { k: 'post', by: 'in', text: 'Para 4, por favor', delayMs: 300 },
  { k: 'post', by: 'out:ai', text: 'Perfecto, reservado para 4 🎉', delayMs: 200 },
  { k: 'post', by: 'out:ai', text: 'Te llega la confirmación por este chat.', delayMs: 400 },
];

interface Canon {
  tag: string;
  classes: string[];
  attrs: Record<string, string>;
  text: string;
  children: Canon[];
}

function directText(el: Element): string {
  let s = '';
  el.childNodes.forEach((n) => {
    if (n.nodeType === Node.TEXT_NODE) s += n.textContent ?? '';
  });
  return s.trim();
}

function attrsOf(el: Element): Record<string, string> {
  const out: Record<string, string> = {};
  for (const a of Array.from(el.attributes)) {
    if (a.name === 'style' || a.name === 'class') continue;
    out[a.name] = a.value;
  }
  return out;
}

function canon(el: Element): Canon {
  return {
    tag: el.tagName.toLowerCase(),
    classes: Array.from(el.classList).sort(),
    attrs: attrsOf(el),
    text: directText(el),
    children: Array.from(el.children).map(canon),
  };
}

function mountElement(channel: ChannelId, step: number): HTMLElement {
  const el = document.createElement('cf-chat-sim');
  el.setAttribute('channel', channel);
  el.setAttribute('seed', String(SEED));
  el.setAttribute('t0', String(T0));
  el.setAttribute('locale', LOCALE);
  el.setAttribute('tz', TZ);
  el.setAttribute('data-step', String(step));
  const scriptTag = document.createElement('script');
  scriptTag.type = 'application/json';
  scriptTag.textContent = JSON.stringify(SCRIPT);
  el.appendChild(scriptTag);
  document.body.appendChild(el);
  // KNOWN GAP (flagged to [skin] in T-007's termination report, not fixed here — out of
  // react/**'s write cell): connectedCallback() only wires the `channel` HTML attribute into
  // compile()'s fold; `#adapter` (what actually drives rendering) stays hard-defaulted to
  // WHATSAPP_REFERENCE_ADAPTER regardless of `channel`, UNTIL a caller sets the `.adapter`
  // property directly (its own doc comment: "Settable so a caller ... can swap the whole
  // 16-field object and see the DOM change"). Without this line every `channel="telegram"`
  // mount here would silently render WhatsApp chrome, and the cross-check would be comparing
  // react's real getAdapter('telegram') against element's WhatsApp default — not a same-channel
  // comparison at all. This IS the documented, intended way to drive it today.
  if (channel !== 'whatsapp') {
    (el as unknown as { adapter: ReturnType<typeof getAdapter> }).adapter = getAdapter(channel);
  }
  return el;
}

function canonLog(root: HTMLElement): Canon[] {
  const log = root.querySelector('.cf-log')!;
  return Array.from(log.children)
    .filter((c) => !(c as HTMLElement).hidden)
    .map(canon);
}

function canonHead(root: HTMLElement): Canon {
  return canon(root.querySelector('.cf-head')!);
}

function renderReactAt(channel: ChannelId, step: number): HTMLElement {
  const timeline = compile(SCRIPT, { seed: SEED, channel, locale: LOCALE, tz: TZ, t0: T0 });
  const adapter = getAdapter(channel);
  const postedAt = postedAtByMsgId(timeline.frames);
  const finalState = stateAtStep(timeline, timeline.frames.length);
  const seps = dateSeparators(finalState.order, postedAt, T0, LOCALE, TZ);
  const typing = draftIntervals(timeline);
  const seq = fullSequence(finalState.order, seps, typing);
  const visibleIds = new Set(
    stateAtStep(timeline, step).order.filter((id) => stateAtStep(timeline, step).msgs.get(id)?.deleted === null),
  );

  const { container } = render(
    <MessageThread
      finalOrder={finalState.order}
      seq={seq}
      visibleIds={visibleIds}
      step={step}
      msgs={finalState.msgs}
      postedAt={postedAt}
      adapter={adapter}
      locale={LOCALE}
      tz={TZ}
      t0={T0}
      editedLabel="Editado"
      contactName="Chat"
      contactStatus=""
    />,
  );
  return container;
}

// Local, not global setup.ts: only this file mounts raw custom elements into document.body
// across multiple cases in the same run — RTL's own render output is already auto-cleaned
// (vitest.config.ts's `globals: true` + @testing-library/react's automatic afterEach hook).
afterEach(() => {
  document.body.innerHTML = '';
});

describe('T-007 acceptance #1 — element vs react, same DOM at the same step', () => {
  it.each([0, 1, 2, 3, 4, 5, 6])('whatsapp, step=%i', (step) => {
    const elRoot = mountElement('whatsapp', step);
    const reactRoot = renderReactAt('whatsapp', step);
    expect(canonLog(reactRoot)).toEqual(canonLog(elRoot));
    expect(canonHead(reactRoot)).toEqual(canonHead(elRoot));
  });

  it.each([0, 3, 6])('telegram, step=%i (different adapter: single-tick, views, own-row)', (step) => {
    const elRoot = mountElement('telegram', step);
    const reactRoot = renderReactAt('telegram', step);
    expect(canonLog(reactRoot)).toEqual(canonLog(elRoot));
  });

  it('positive twin — the comparator actually discriminates a real difference', () => {
    // If the instrument can't fail, it can't pass meaningfully either (same "gemelo" convention
    // as no-tailwind.test.ts / core's digest test). Prove it here instead of hand-breaking react/
    // and reverting.
    const elRoot = mountElement('whatsapp', 6);
    const reactRoot = renderReactAt('whatsapp', 6);
    const reactSnap = canonLog(reactRoot);
    const elSnap = canonLog(elRoot);
    expect(reactSnap).toEqual(elSnap);

    const mutated = structuredClone(reactSnap);
    mutated[0].classes.push('cf-injected-drift');
    expect(mutated).not.toEqual(elSnap);
  });
});
