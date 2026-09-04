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
import { actorDir, computeGroupFlags, populateMessageElement } from './render';
import type { RenderMessage } from './render';

/** One [appearStep, vanishStep) window during which `state.draft` is active for a given actor —
 * team-lead's root-cause diagnosis (T-002 iteration 3): re-populating/re-inserting the typing
 * node on every reconcile pass kills its CSS animation loop, because `data-step` changes on
 * EVERY rAF tick during playback (~60/s), not just at script-step boundaries — most of those
 * ticks fall between steps and would otherwise still churn every visible node. The fix is
 * structural: figure out, once, every step-range where a draft is active, build ONE stable <li>
 * per range at its correct position in the flow, and during playback only ever flip `hidden` on
 * it — matching exactly what messages already do post-pre-render. */
interface TypingInterval {
  readonly by: string;
  readonly appearStep: number;
  readonly vanishStep: number;
  /** The last posted MsgId strictly before this window opens, or `null` if the draft opens before
   * any message has posted — this is what lets connectedCallback place the <li> at its real
   * position in the flow, built once, instead of appending it wherever playback happens to be. */
  readonly afterMsgId: MsgId | null;
  li: HTMLLIElement | null;
}

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

/** One forward fold pass computing every `state.draft` active window, generically — this asks
 * "when was `draft` non-null" rather than hardcoding "drafts end at the next post", so it keeps
 * working however core/fold.ts's clearing rule evolves (T-003 may add more ways a draft ends).
 * Also records `afterMsgId` (the last posted MsgId strictly before the window opens, or `null`)
 * so the caller can place the interval's <li> at its real position in the flow. */
function draftIntervals(tl: Timeline): TypingInterval[] {
  const out: TypingInterval[] = [];
  let state = initialState();
  let openSince: number | null = null;
  let openBy = '';
  let openAfter: MsgId | null = null;
  let lastMsgId: MsgId | null = null;

  for (let i = 0; i < tl.frames.length; i++) {
    const ev = tl.frames[i].ev;
    const wasOpen = state.draft !== null;
    state = applyEvent(state, ev);
    const step = i + 1;
    if (!wasOpen && state.draft) {
      openSince = step;
      openBy = state.draft.by;
      openAfter = lastMsgId;
    } else if (wasOpen && !state.draft) {
      out.push({ by: openBy, appearStep: openSince!, vanishStep: step, afterMsgId: openAfter, li: null });
      openSince = null;
    }
    if (ev.k === 'post') lastMsgId = ev.id;
  }
  if (openSince !== null) {
    out.push({ by: openBy, appearStep: openSince, vanishStep: tl.frames.length, afterMsgId: openAfter, li: null });
  }
  return out;
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

/** `en-CA` always renders `YYYY-MM-DD` regardless of the CALLER's `locale` — used only as a
 * stable comparison key for "did the day change", never shown. Deliberately NOT "HOY"/"AYER":
 * that reads real-world wall-clock "now" at VIEW time, which would make the same
 * (script, seed, channel, locale, tz) render different text depending on which day you open the
 * page — breaking exactly the determinism architecture-v1.md §1 invariant 2 exists to guarantee
 * (T-004's byte-identical PNG comparison would be false for this exact reason). The date pill
 * always shows the actual formatted date instead. */
function dayKeyOf(t0Epoch: number, tick: number, tz: string): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: tz }).format(new Date(t0Epoch + tick));
}

function dayLabelOf(t0Epoch: number, tick: number, locale: string, tz: string): string {
  return new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long', timeZone: tz }).format(
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
  #typingIntervals: TypingInterval[] = [];
  #dateSeps: { triggerId: MsgId; li: HTMLLIElement }[] = [];
  #playhead: Playhead | null = null;
  #adapter: ChannelAdapter = WHATSAPP_REFERENCE_ADAPTER;
  /** Guards against redoing any work when `data-step` is set to the value it already holds — the
   * root cause of the animation bug (team-lead, iteration 3): the playhead writes this attribute
   * on EVERY rAF tick (~60/s), and most ticks land between script steps, so without this guard
   * every visible node got repopulated/reinserted dozens of times per script step for no reason. */
  #lastStep: number | null = null;

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
    // Force the next #applyStep through even if `data-step`'s value is literally unchanged — the
    // step-unchanged guard exists to skip REDUNDANT work, and this isn't redundant: the adapter
    // itself changed, so every visible node's structure needs repopulating against it.
    this.#lastStep = null;
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

    this.textContent = '';
    this.appendChild(this.#buildHead());

    this.#log = document.createElement('ol');
    this.#log.className = 'cf-log';
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

    // Date separators (team-lead, iteration 3): "sin ella, la captura no se lee como una
    // conversación real." One pill per calendar-day boundary crossed by the script, built once at
    // its real position — same pre-render contract as messages and typing rows. Hidden until the
    // message it introduces is actually revealed (#reconcile), so it can't appear ahead of the
    // step that's supposed to introduce it.
    let lastDayKey: string | null = null;
    finalState.order.forEach((id) => {
      const tick = this.#postedAt.get(id) ?? 0;
      const dayKey = dayKeyOf(t0, tick, tz);
      if (dayKey === lastDayKey) return;
      lastDayKey = dayKey;
      const sep = document.createElement('li');
      sep.className = 'cf-date-sep';
      sep.hidden = true;
      sep.innerHTML = `<span class="cf-date-pill">${dayLabelOf(t0, tick, locale, tz)}</span>`;
      this.#log!.insertBefore(sep, this.#msgEls.get(id)!);
      this.#dateSeps.push({ triggerId: id, li: sep });
    });

    // Typing/"…" indicators: ONE stable <li> per draft window, built here at its real position in
    // the flow (never moved, never re-populated during playback — see TypingInterval's comment).
    const intervals = draftIntervals(this.#timeline);
    intervals.forEach((interval) => {
      const li = document.createElement('li');
      li.className = 'cf-typing-row';
      li.dataset.dir = actorDir(interval.by);
      li.hidden = true;
      li.innerHTML = '<span class="cf-bubble cf-typing"><i></i><i></i><i></i></span>';
      interval.li = li;

      const anchorIdx = interval.afterMsgId ? finalState.order.indexOf(interval.afterMsgId) + 1 : 0;
      const anchor = anchorIdx < finalState.order.length ? this.#msgEls.get(finalState.order[anchorIdx])! : null;
      this.#log!.insertBefore(li, anchor);
    });
    this.#typingIntervals = intervals;

    this.appendChild(this.#buildComposer());

    const initialStep = this.hasAttribute('data-step')
      ? Number(this.getAttribute('data-step'))
      : this.#timeline.frames.length;
    this.dataset.step = String(initialStep);
    this.#applyStep(initialStep);
  }

  /** Header — ChatDemo.astro precedent (`.chat-head`: avatar + name + meta). Visual-only, driven
   * by attributes so any consumer can set it; falls back to a channel-neutral default rather than
   * hardcoding a business name into a shared component. */
  #buildHead(): HTMLElement {
    const name = this.getAttribute('contact-name') || 'Chat';
    const status = this.getAttribute('contact-status') || '';
    const head = document.createElement('header');
    head.className = 'cf-head';

    const avatar = document.createElement('span');
    avatar.className = 'cf-avatar';
    avatar.textContent = name.charAt(0).toUpperCase();
    head.appendChild(avatar);

    const who = document.createElement('span');
    who.className = 'cf-who';
    const nameEl = document.createElement('b');
    nameEl.textContent = name;
    who.appendChild(nameEl);
    if (status) {
      const statusEl = document.createElement('em');
      statusEl.textContent = status;
      who.appendChild(statusEl);
    }
    head.appendChild(who);

    return head;
  }

  /** Composer — WhatsApp always shows one (visual-only for this wave; a real, operable composer
   * with mobile keyboard handling is react/'s T-007). Its absence read as "broken" rather than
   * "conversation ended" in review — this closes that gap without claiming interactivity it
   * doesn't have. */
  #buildComposer(): HTMLElement {
    const bar = document.createElement('div');
    bar.className = 'cf-composer';
    bar.innerHTML =
      '<span class="cf-composer-icon" aria-hidden="true">😊</span>' +
      '<span class="cf-composer-input" aria-hidden="true">Mensaje</span>' +
      '<span class="cf-composer-icon cf-composer-send" aria-hidden="true">➤</span>';
    return bar;
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
    // The root cause behind both the duplicate-bubble bug (iteration 1) and the typing animation
    // never looping (iteration 3, team-lead's diagnosis): play()'s onFrame callback writes
    // `data-step` on EVERY rAF tick (~60/s), and only a fraction of those ticks land on a value
    // that actually differs from the last one applied. Without this guard, every visible node got
    // repopulated dozens of times per script step for no reason — including nodes whose CSS
    // animation state that repopulation was silently resetting.
    if (step === this.#lastStep) return;
    this.#lastStep = step;
    const state = stateAtStep(this.#timeline, step);
    this.#reconcile(state, step);
  }

  /** ChatDemo.astro's exact trick (`s.offsetWidth + 10`, global.css's `measure()`): `--cf-cs-pad`
   * (styles.css) is a static FALLBACK only — a stamp with a receipt glyph is measurably wider
   * than one without (measured live: 50px vs 31px), so one static reservation either overlaps
   * the wider ones or over-gaps the narrower ones. Re-measured per message, per step, since
   * content driving stamp width (receipt glyph, views counter) can change between steps. Only
   * meaningful for `timestamp: 'inside-pad'` — the other two placements don't use `.cf-pad`. */
  #measurePad(li: HTMLLIElement): void {
    if (this.#adapter.timestamp !== 'inside-pad') return;
    const bubble = li.querySelector<HTMLElement>('.cf-bubble');
    const stamp = li.querySelector<HTMLElement>('.cf-stamp');
    if (!bubble || !stamp) return;
    bubble.style.setProperty('--cf-cs-pad', `${stamp.offsetWidth + 10}px`);
  }

  /** Pre-render contract: every MsgId's <li> already exists (built in connectedCallback from the
   * final state) — this only repopulates content for currently-visible messages and flips
   * `hidden`. It never creates, removes, or reorders nodes. */
  #reconcile(state: SimState, step: number): void {
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
      this.#measurePad(li);
    });

    // Not (yet, or no longer) in `order` at this step => hidden, never removed — the nodes stay
    // exactly where connectedCallback put them (post is append-only in T-001, so build order ===
    // final DOM order already; pin reordering is T-003's problem, not this loop's).
    this.#msgEls.forEach((li, id) => {
      if (!visibleIds.has(id)) li.hidden = true;
    });

    // A separator reveals exactly when the message it introduces does — never ahead of it.
    this.#dateSeps.forEach((sep) => {
      sep.li.hidden = !visibleIds.has(sep.triggerId);
    });

    if (state.draft) this.setAttribute('data-drafting', state.draft.by);
    else this.removeAttribute('data-drafting');

    // Typing indicators: flip `hidden` on the ALREADY-BUILT <li> for whichever window contains
    // `step` — never innerHTML, never appendChild/insertBefore here. That's what keeps the CSS
    // animation looping instead of restarting every time this runs (team-lead's diagnosis).
    this.#typingIntervals.forEach((interval) => {
      if (!interval.li) return;
      interval.li.hidden = !(step >= interval.appearStep && step < interval.vanishStep);
    });

    this.#applyBottomAnchor();
  }

  /** Team-lead, iteration 3: measured 41% of the log's height sitting empty at the BOTTOM (216px
   * of 522px) — a short thread should hug the composer and grow upward, not float at the top.
   * `.cf-anchor-top` (styles.css) only ever lives on the first VISIBLE child at any moment; date
   * separators (below) and typing rows are ordinary flex items too, so whichever of the three
   * kinds happens to be first-and-visible gets it. */
  #applyBottomAnchor(): void {
    if (!this.#log) return;
    const prev = this.#log.querySelector<HTMLElement>('.cf-anchor-top');
    if (prev) prev.classList.remove('cf-anchor-top');
    const firstVisible = [...this.#log.children].find((el) => !(el as HTMLElement).hidden);
    (firstVisible as HTMLElement | undefined)?.classList.add('cf-anchor-top');
  }
}
customElements.define('cf-chat-sim', CfChatSimElement);
