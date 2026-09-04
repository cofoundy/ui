// <cf-chat-sim> — api-contract.md §"Firmas públicas": `<cf-chat-sim script="…" channel="…"
// seed="…">` · `data-step` attribute on the root.
//
// "Pre-render del hilo completo + revelado por data-step" (T-002 Alcance): every message the
// script will ever post gets a real <li>, built once and cached by MsgId; `data-step` is the ONE
// public knob that decides what's currently visible/mutated. It is not a side-effect of playback
// — playback (play()) is implemented BY writing this same attribute, so a human scrubbing it in
// devtools and the internal playhead go through the identical code path. This is what replaces
// ChatDemo.astro's accumulated `.on` classes (architecture-v1.md §13 #2): that scheme is
// monotonic-only, and the fold isn't (edit/delete/react/pin land in T-003).
//
// core/** (compile/seek/createPlayhead/initialState/applyEvent) is [core]'s W cell; this file only
// reads it (file-ownership-matrix.md gives [skin] `R` on core/**).

import {
  applyEvent,
  compile,
  createPlayhead,
  initialState,
  type ChannelAdapter,
  type ChannelId,
  type Frame,
  type MsgId,
  type MsgState,
  type Playhead,
  type SimScript,
  type SimState,
  type Timeline,
} from '../index';
import { WHATSAPP_REFERENCE_ADAPTER } from './fixtures';
import { computeGroupFlags, populateMessageElement } from './render';
import type { RenderMessage } from './render';

/** Exact frame count applied — the integer `data-step` counts, NOT a raw Tick (architecture-v1.md
 * §13 #2: "N clases acumuladas" becomes "N frames applied"). Deliberately its own tiny fold
 * instead of `seek(tl, t)`: `seek` resolves by Tick, and two frames with equal jitter-adjusted
 * ticks would make a Tick-keyed step ambiguous. Frame-count is unambiguous by construction. */
function stateAtStep(tl: Timeline, step: number): SimState {
  let state = initialState();
  const upto = Math.max(0, Math.min(step, tl.frames.length));
  for (let i = 0; i < upto; i++) state = applyEvent(state, tl.frames[i].ev);
  return state;
}

/** First `post` frame per MsgId → the Tick to format as this message's displayed time. `Frame.t`
 * already includes t0 + cumulative delay/jitter (core/compile.ts), so no arithmetic is redone
 * here — just a lookup, formatted with Intl (element/ is NOT core/, the no-Date lint doesn't
 * apply here — architecture-v1.md §1 "Disposición de las 10 clases impuras" #1 keeps wall-clock
 * formatting explicitly outside core's purity boundary). */
function postedAtByMsgId(frames: readonly Frame[]): Map<MsgId, number> {
  const out = new Map<MsgId, number>();
  for (const f of frames) if (f.ev.k === 'post') out.set(f.ev.id, f.t);
  return out;
}

function formatTime(t0Epoch: number, tick: number, locale: string, tz: string): string {
  return new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: tz,
  }).format(
    new Date(t0Epoch + tick),
  );
}

function toRenderMessage(
  msg: MsgState,
  atLabel: string,
  editedLabel: string | undefined,
): RenderMessage {
  return {
    id: msg.id,
    by: msg.by,
    text: msg.text ?? '',
    atLabel,
    receipt: msg.receipt,
    views: msg.views,
    reactions: msg.reactions,
    editedLabel: msg.v > 0 ? editedLabel : undefined,
  };
}

export class CfChatSimElement extends HTMLElement {
  static readonly observedAttributes = ['data-step'];

  #timeline: Timeline | null = null;
  #postedAt = new Map<MsgId, number>();
  #msgEls = new Map<MsgId, HTMLLIElement>();
  #log: HTMLOListElement | null = null;
  #typingEl: HTMLLIElement | null = null;
  #playhead: Playhead | null = null;
  #adapter: ChannelAdapter = WHATSAPP_REFERENCE_ADAPTER;

  /** Settable so a caller (a devtools console, a future capture/ harness, or T-005's real
   * `getAdapter(channel)` once it lands) can swap the whole 16-field object and see the DOM
   * change — this is the property the caps fixture test (render.test.ts) exercises directly,
   * without going through a DOM element at all; here it's wired for the live demo. */
  get adapter(): ChannelAdapter {
    return this.#adapter;
  }
  set adapter(next: ChannelAdapter) {
    this.#adapter = next;
    this.dataset.wallpaper = next.wallpaper;
    if (this.#timeline) this.#applyStep(Number(this.dataset.step ?? this.#timeline.frames.length));
  }

  connectedCallback(): void {
    this.classList.add('cf-chat-sim');
    if (!this.hasAttribute('role')) this.setAttribute('role', 'log');
    this.dataset.wallpaper = this.#adapter.wallpaper;

    const script = this.#readScript();
    const channel = (this.getAttribute('channel') as ChannelId) || 'whatsapp';
    const seed = Number(this.getAttribute('seed') ?? '1');
    const locale = this.getAttribute('locale') || 'es-PE';
    const tz = this.getAttribute('tz') || 'America/Lima';
    const t0 = Number(this.getAttribute('t0') ?? String(Date.UTC(2026, 0, 1, 9, 0, 0)));

    this.#timeline = compile(script, { seed, channel, locale, tz, t0 });
    this.#postedAt = postedAtByMsgId(this.#timeline.frames);

    this.#log = document.createElement('ol');
    this.#log.className = 'cf-log';
    this.textContent = '';
    this.appendChild(this.#log);

    // Pre-render del hilo completo (T-002 Alcance): every message the script will EVER post gets
    // its <li> now, in final order, hidden — before any reveal happens. From here on, `data-step`
    // only ever toggles `hidden` + repopulates content on the nodes built here; it never creates
    // or reorders nodes. `deleted` messages (T-003) still get a node — hidden is what stands in
    // for "not shown" per architecture-v1.md §10 (delete-for-all has no chrome, so hidden IS the
    // whole treatment, not a placeholder for a tombstone that's out of scope).
    const finalState = stateAtStep(this.#timeline, this.#timeline.frames.length);
    finalState.order.forEach((id) => {
      const li = document.createElement('li');
      li.className = 'cf-msg'; // #reconcile only ever repopulates children, never this base class
      li.hidden = true;
      this.#msgEls.set(id, li);
      this.#log!.appendChild(li);
    });

    this.#typingEl = document.createElement('li');
    this.#typingEl.className = 'cf-typing-row';
    this.#typingEl.hidden = true;
    this.#typingEl.innerHTML = '<span class="cf-typing"><i></i><i></i><i></i></span>';
    this.#log.appendChild(this.#typingEl);

    const initialStep = this.hasAttribute('data-step')
      ? Number(this.getAttribute('data-step'))
      : this.#timeline.frames.length;
    this.dataset.step = String(initialStep);
    this.#applyStep(initialStep);
  }

  disconnectedCallback(): void {
    this.#playhead?.pause();
  }

  attributeChangedCallback(name: string): void {
    if (name === 'data-step' && this.#timeline) {
      this.#applyStep(Number(this.dataset.step ?? this.#timeline.frames.length));
    }
  }

  /** Drives `data-step` from the real core playhead — see file header: same attribute, same path
   * as manual scrubbing. Returns the Playhead so callers can pause()/rate() it. */
  play(): Playhead {
    if (!this.#timeline) throw new Error('cf-chat-sim: play() before connectedCallback');
    this.#playhead?.pause();
    const tl = this.#timeline;
    const ph = createPlayhead(tl);
    ph.onFrame((_state, t) => {
      // Convert Tick -> exact frame count via the same monotonic scan stateAtStep uses, so the
      // attribute always reflects a real "N frames applied", never an interpolated Tick.
      let step = 0;
      while (step < tl.frames.length && tl.frames[step].t <= t) step++;
      this.dataset.step = String(step);
    });
    this.#playhead = ph;
    ph.play();
    return ph;
  }

  #readScript(): SimScript {
    const inline = this.querySelector('script[type="application/json"]');
    const raw = inline?.textContent ?? this.getAttribute('script');
    if (!raw) throw new Error('cf-chat-sim: no script provided (attribute or inline JSON child)');
    return JSON.parse(raw) as SimScript;
  }

  #applyStep(step: number): void {
    if (!this.#timeline || !this.#log) return;
    const state = stateAtStep(this.#timeline, step);
    this.#reconcile(state);
  }

  /** Pre-render contract: every MsgId's <li> already exists (built in connectedCallback from the
   * final state) — this only repopulates content for currently-visible messages and flips
   * `hidden`. It never creates, removes, or reorders nodes. */
  #reconcile(state: SimState): void {
    // `t0` IS the epoch: architecture-v1.md §1 defines it as "epoch virtual — dato del GUION, no
    // del reloj", and connectedCallback() compiles with a real epoch-ms value, so no fabrication
    // needed here — Timeline.t0 already carries it, untouched, straight from core/types.ts.
    const t0 = this.#timeline!.t0;
    const locale = this.getAttribute('locale') || 'es-PE';
    const tz = this.getAttribute('tz') || 'America/Lima';
    const editedLabel = this.getAttribute('edited-label') || 'Editado';

    const visible: RenderMessage[] = state.order
      .map((id) => state.msgs.get(id))
      .filter((m): m is MsgState => !!m && m.deleted === null)
      .map((m) => {
        const tick = this.#postedAt.get(m.id) ?? 0;
        return toRenderMessage(m, formatTime(t0, tick, locale, tz), editedLabel);
      });

    const flags = computeGroupFlags(visible, this.#adapter.tail);
    const visibleIds = new Set(visible.map((m) => m.id));

    visible.forEach((rm) => {
      const li = this.#msgEls.get(rm.id);
      if (!li) return; // shouldn't happen — every eventual MsgId was pre-built in connectedCallback
      populateMessageElement(li, rm, this.#adapter, flags.get(rm.id)!);
      li.hidden = false;
    });

    // Not (yet, or no longer) in `order` at this step => hidden, never removed — the nodes stay
    // exactly where connectedCallback put them (post is append-only in T-001, so build order ===
    // final DOM order already; pin reordering is T-003's problem, not this loop's).
    this.#msgEls.forEach((li, id) => {
      if (!visibleIds.has(id)) li.hidden = true;
    });

    if (state.draft) {
      this.setAttribute('data-drafting', state.draft.by);
      if (this.#typingEl) {
        this.#typingEl.hidden = false;
        this.#log!.appendChild(this.#typingEl); // keep it last — right after the newest visible message
      }
    } else {
      this.removeAttribute('data-drafting');
      if (this.#typingEl) this.#typingEl.hidden = true;
    }
  }
}
customElements.define('cf-chat-sim', CfChatSimElement);
