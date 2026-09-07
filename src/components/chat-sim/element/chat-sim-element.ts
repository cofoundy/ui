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

// Deliberately NOT importing from '../index' (the chat-sim barrel): it re-exports `ChatSim` from
// `./react` (T-007), so going through it would pull React transitively into this bundle even
// though nothing here uses it — confirmed the hard way (assert-no-react.mjs caught 97KB of React
// the first time this file switched to core's promoted stateAtStep/draftIntervals via the
// barrel). Direct file imports instead — file-ownership-matrix.md gives [skin] `R` on `core/**`
// and `adapters/**`, and a direct import can't accidentally drag in a sibling subpath's deps.
import { compile } from '../core/compile';
import { createPlayhead, type Playhead } from '../core/playhead';
import { stateAtStep } from '../core/seek';
import { draftIntervals, type DraftInterval } from '../core/draft-intervals';
import { getAdapter } from '../adapters/registry';
import type {
  ChannelAdapter,
  ChannelId,
  Chrome,
  Frame,
  MsgId,
  MsgState,
  SimScript,
  SimState,
  Timeline,
} from '../core/types';
import { actorDir, asReplyFast, computeGroupFlags, populateMessageElement } from './render';
import type { RenderMessage } from './render';
import { clipIcon, emojiIcon, micIcon } from './icons';

/** A `DraftInterval` (core/draft-intervals.ts — promoted from this file, T-002/T-006, so
 * app/'s T-007 and this file read the same implementation instead of a third copy) plus the
 * DOM bookkeeping that's genuinely element/'s own: the pre-built, stable `<li>` for this window.
 * Team-lead's root-cause diagnosis (T-002 iteration 3) for why the node must be built ONCE and
 * only ever `hidden`-toggled: re-populating/re-inserting it on every reconcile pass kills its CSS
 * animation loop, because `data-step` changes on EVERY rAF tick during playback (~60/s), not just
 * at script-step boundaries. */
interface TypingRow {
  readonly interval: DraftInterval;
  readonly li: HTMLLIElement;
}

/** T-031 B — one per script the element was handed (`<script type="application/json">` children,
 * in document order; the single `script` attribute still works exactly as before and just yields
 * an array of length 1). Every slide's DOM is pre-built ONCE in `connectedCallback` — same
 * pre-render contract as a single script — so cycling back to an already-visited slide during
 * rotation only ever flips `log.hidden`, never rebuilds it (acceptance #2's gemelo: "no se
 * recrean"). `scriptEl` is the actual `<script>` child when the slide came from inline JSON
 * (`null` for the attribute-sourced fallback) — T-031 D reads its `data-tag-*` attributes for a
 * PER-SLIDE label override, the same "element/'s own reading of a convention" pattern
 * `asServiceMedia` (render.ts) already established for `media.kind`. */
interface Slide {
  readonly scriptEl: Element | null;
  readonly timeline: Timeline;
  readonly postedAt: Map<MsgId, number>;
  readonly log: HTMLOListElement;
  readonly msgEls: Map<MsgId, HTMLLIElement>;
  readonly typingRows: TypingRow[];
  readonly dateSeps: { triggerId: MsgId; li: HTMLLIElement }[];
  lastStep: number | null;
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
  replyLabel: string | undefined,
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
    // T-027: WHETHER is per-message (`media.replyFast`, script-authored), the TEXT is the
    // caller's `reply-label` attribute (#reconcile) — same split as editedLabel/edited-label.
    replyLabel: asReplyFast(msg.media) ? replyLabel : undefined,
    media: msg.media,
  };
}

/** T-027 E: the third chrome value, LOCAL to element/ — `Chrome` (core/types.ts) stays exactly
 * `'fidelity' | 'consistent'`, unchanged, because nothing in core/ or adapters/ ever branches on
 * it (file header, core/types.ts:94-102: "typed here only; no consumer wiring in core"). Adding
 * 'branded' to core's type would be a scope.write violation for zero benefit — this file is the
 * ONLY reader, so widening the type here is exactly as safe and stays inside element/**. */
type ChromeMode = Chrome | 'branded';

export class CfChatSimElement extends HTMLElement {
  static readonly observedAttributes = ['data-step'];

  /** T-031 B — one entry per script; N===1 is the pre-existing single-script shape verbatim (same
   * fields that used to live directly on the instance, just addressed through `this.#active` now
   * — see that getter's own comment for why every existing single-script code path is unchanged
   * by this indirection). */
  #slides: Slide[] = [];
  #activeIndex = 0;
  /** T-031 A/D — the visual "phone frame" (head + logs + composer): fixed-height and the tag
   * pill (D) live OUTSIDE it, as siblings on the host, so an optional tag never eats into the
   * fixed pixel budget acceptance #1 asks for. `null` only for the instant before
   * `connectedCallback` runs. */
  #frame: HTMLDivElement | null = null;
  #tagEl: HTMLElement | null = null;
  #tagIconEl: HTMLElement | null = null;
  #tagLabelEl: HTMLElement | null = null;
  /** Head refs, same reason as the tag refs above: the header is built ONCE, and rotation
   * repaints its text instead of rebuilding it. Kept so `#applyContactForActiveSlide` can write
   * into them without re-querying the DOM on every slide change. */
  #avatarEl: HTMLElement | null = null;
  #nameEl: HTMLElement | null = null;
  #statusEl: HTMLElement | null = null;
  /** T-031 C — badge is a SLOT, not logic: `null` key means "consumer didn't ask for one", and
   * nothing renders. `#badgeFlagKey` names which `SimState.flags` key (core's existing `flag`
   * event, architecture-v1.md — T-001 already ships it) drives it; `#badgeEl` is only ever created
   * by `#buildHead` when the key is set. Mount-time-only, same as every other playback attribute
   * here (channel/seed/locale/tz/t0/loop). */
  #badgeFlagKey: string | null = null;
  #badgeOnLabel = 'ON';
  #badgeOffLabel = 'OFF';
  #badgeEl: HTMLElement | null = null;
  #playhead: Playhead | null = null;
  /** T-027 A: true only while `dataset.step` is being written FROM `play()`'s own onFrame — i.e.
   * a playback tick, not an external scrub/seek. `#applyStep` reads it synchronously (custom
   * elements' `attributeChangedCallback` fires synchronously off the `dataset.step =` assignment
   * below, same turn) to decide animate-vs-jump for `#applyScroll`. Defaults false, so the
   * initial `connectedCallback` render and any manual `data-step` write (devtools, a consumer's
   * own scrub UI) are always an instant jump — "seek debe ser instantáneo" (acceptance #1). */
  #fromPlayhead = false;
  #scrollRaf: number | null = null;
  #scrollCatchup: ReturnType<typeof setTimeout> | null = null;
  /** T-027 B: `<cf-chat-sim loop>` — read once in connectedCallback, immutable after (matches
   * every other playback attribute here: channel/seed/locale/tz/t0 are all mount-time-only). */
  #loop = false;
  #loopPauseMs = 1500;
  #loopTimer: ReturnType<typeof setTimeout> | null = null;
  /** Bug found by `app`, confirmed reading this file (T-002 iteration 5): this used to be a fixed
   * `WHATSAPP_REFERENCE_ADAPTER` fixture, and the `channel` attribute only ever fed `compile()` —
   * nothing ever called `getAdapter(channel)`, so `<cf-chat-sim channel="telegram">` silently
   * rendered WhatsApp chrome. Not this lane's fault at the time: T-005's registry didn't exist yet
   * when this was written (see the fixture's own now-removed "once it lands" comment) — it landed
   * and nobody closed the loop. `connectedCallback` overwrites this with the real adapter before
   * anything gets built; the default here only matters for the instant before that runs. */
  #adapter: ChannelAdapter = getAdapter('whatsapp');

  /** The slide currently shown — every method below that used to read a singular `#timeline` /
   * `#log` / `#msgEls` / etc. field now reads it off this. `undefined` only before
   * `connectedCallback` has built at least one slide. */
  get #active(): Slide | undefined {
    return this.#slides[this.#activeIndex];
  }

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
    // itself changed, so every visible node's structure needs repopulating against it. Every
    // slide gets the guard reset (the adapter is global, not per-slide) even though only the
    // ACTIVE one re-renders immediately — an inactive slide picks up the new adapter the moment
    // rotation activates it (see #activateSlide).
    this.#slides.forEach((s) => {
      s.lastStep = null;
    });
    const active = this.#active;
    if (active) this.#applyStep(Number(this.dataset.step ?? active.timeline.frames.length));
  }

  connectedCallback(): void {
    this.classList.add('cf-chat-sim');
    // T-024 §E: `<cf-chat-sim>` has no `mode="live"` — every message is pre-rendered timeline
    // playback (`data-step` scrubbing), never a human-typed send (the composer is a static,
    // `aria-hidden` placeholder — see #buildComposer). No human action ever causes a message
    // here, so `role="group"` (not `log`/`aria-live`, which would narrate decorative content).
    if (!this.hasAttribute('role')) this.setAttribute('role', 'group');

    const scripts = this.#readScripts();
    const channel = (this.getAttribute('channel') as ChannelId) || 'whatsapp';
    // Chrome axis (T-017 Alcance B, core/types.ts:94-102): 'fidelity' — each channel looks like
    // itself, composer controls move side per real app (simulator, marketing capture). 'consistent'
    // — Cofoundy's own composer layout, fixed regardless of channel (the app: an operator works
    // both channels in one session, and controls moving between them reads as a UX bug, not
    // fidelity). 'branded' (T-027 E, element-local — see ChromeMode above) — Fovente's real
    // production case: the outbound palette is the CONSUMER's brand color, not the channel's real
    // one; structure (tail/ticks/grouping) stays exactly the channel's, only paints differently
    // (styles.css `[data-chrome='branded']`). Not a `ChannelAdapter` field on purpose — it's how
    // THIS component draws its own chrome, not a per-channel fact core/adapters own.
    const chromeAttr = this.getAttribute('chrome');
    const chrome: ChromeMode =
      chromeAttr === 'consistent' ? 'consistent' : chromeAttr === 'branded' ? 'branded' : 'fidelity';
    this.#loop = this.hasAttribute('loop');
    this.#loopPauseMs = Number(this.getAttribute('loop-pause-ms') ?? '1500');
    const seed = Number(this.getAttribute('seed') ?? '1');
    const locale = this.getAttribute('locale') || 'es-PE';
    const tz = this.getAttribute('tz') || 'America/Lima';
    const t0 = Number(this.getAttribute('t0') ?? String(Date.UTC(2026, 0, 1, 9, 0, 0)));

    // THE fix (T-002 iteration 5): resolve the real adapter from the `channel` attribute instead
    // of leaving the class-field default in place. `getAdapter` throws for a channel with no
    // registered adapter (only 'imessage', by design — architecture-v1.md §10); that's a real
    // authoring error in the markup, not something to swallow into a silent WhatsApp fallback.
    this.#adapter = getAdapter(channel);
    this.dataset.wallpaper = this.#adapter.wallpaper;
    // Brand identity (T-013): wallpaper texture, date-pill treatment, corner-radius scheme and
    // composer icon order are NOT ChannelAdapter fields — they're per-brand chrome the 16-field
    // contract deliberately excludes (same reasoning as `--channel-imessage`, styles.css:51).
    // `data-channel` is the one attribute styles.css keys those off; every STRUCTURAL rule stays
    // adapter-field-driven per this file's header.
    this.dataset.channel = channel;
    this.dataset.chrome = chrome;

    // T-031 A: fixed-height, configurable-not-hardcoded (operator: "el ratio del celular mocked
    // tiene que ser fixed, como la izquierda" — ChatDemo.astro's own comment: "el alto de la caja
    // es FIJO, igual para todos los rubros, no se achica"). A bare number is treated as px;
    // anything else (`"60vh"`, `"100%"`) passes through verbatim. The default lives in
    // styles.css's `--cf-cs-height` token (440px, ChatDemo.astro's own value) — an unset attribute
    // is a no-op, never a blank/collapsed frame.
    const heightAttr = this.getAttribute('height');
    if (heightAttr) {
      this.style.setProperty('--cf-cs-height', /^\d+$/.test(heightAttr) ? `${heightAttr}px` : heightAttr);
    }

    // T-031 C: badge is an opt-in SLOT — no `badge-flag` means no badge, ever (no default text
    // imposed on every consumer, no vocabulary guessed on their behalf). `#buildHead` below only
    // creates `#badgeEl` when this is set.
    this.#badgeFlagKey = this.getAttribute('badge-flag');
    this.#badgeOnLabel = this.getAttribute('badge-on-label') || 'ON';
    this.#badgeOffLabel = this.getAttribute('badge-off-label') || 'OFF';

    this.textContent = '';

    // T-031 D — the tag pill lives OUTSIDE `#frame` (built next), a sibling on the host itself:
    // "encima del chat" literally, not eating into the fixed-height budget above.
    this.#tagEl = this.#buildTag();
    this.appendChild(this.#tagEl);

    this.#frame = document.createElement('div');
    this.#frame.className = 'cf-frame';
    this.appendChild(this.#frame);

    // `scripts` (read at the top, BEFORE `this.textContent = ''` wiped the light DOM) is the only
    // place the per-slide contact data still exists at this point — the `<script>` nodes are
    // detached by now, so `#buildHead` can't query for them itself.
    this.#frame.appendChild(
      this.#buildHead(scripts.some(({ scriptEl }) => scriptEl?.hasAttribute('data-contact-status'))),
    );

    // T-031 B — one fully pre-rendered slide per script, exactly the T-002 pre-render contract
    // this loop used to run once for the single script. All N are built up front and stay in the
    // DOM for the component's whole lifetime (only `log.hidden` ever toggles) — that's what makes
    // "cycling back to slide 0 doesn't recreate it" true by construction, not by a cache that
    // could go stale.
    this.#slides = scripts.map(({ script, scriptEl }) => {
      const timeline = compile(script, { seed, channel, locale, tz, t0 });
      const postedAt = postedAtByMsgId(timeline.frames);
      const msgEls = new Map<MsgId, HTMLLIElement>();
      const dateSeps: { triggerId: MsgId; li: HTMLLIElement }[] = [];

      const log = document.createElement('ol');
      log.className = 'cf-log';
      log.hidden = true; // activated below, after every slide exists

      // Pre-render del hilo completo (T-002 Alcance): every message the script will EVER post
      // gets its <li> now, in final order, hidden — before any reveal happens. From here on,
      // `data-step` only ever toggles `hidden` + repopulates content on the nodes built here; it
      // never creates or reorders nodes. `deleted` messages (T-003) still get a node — hidden is
      // what stands in for "not shown" per architecture-v1.md §10.
      const finalState = stateAtStep(timeline, timeline.frames.length);
      finalState.order.forEach((id) => {
        const li = document.createElement('li');
        li.className = 'cf-msg'; // #reconcile only ever repopulates children, never this base class
        li.hidden = true;
        msgEls.set(id, li);
        log.appendChild(li);
      });

      // Date separators (team-lead, iteration 3): "sin ella, la captura no se lee como una
      // conversación real." One pill per calendar-day boundary crossed by the script, built once
      // at its real position — same pre-render contract as messages and typing rows. Hidden until
      // the message it introduces is actually revealed (#reconcile), so it can't appear ahead of
      // the step that's supposed to introduce it.
      let lastDayKey: string | null = null;
      finalState.order.forEach((id) => {
        const tick = postedAt.get(id) ?? 0;
        const dayKey = dayKeyOf(t0, tick, tz);
        if (dayKey === lastDayKey) return;
        lastDayKey = dayKey;
        const sep = document.createElement('li');
        sep.className = 'cf-date-sep';
        sep.hidden = true;
        sep.innerHTML = `<span class="cf-date-pill">${dayLabelOf(t0, tick, locale, tz)}</span>`;
        log.insertBefore(sep, msgEls.get(id)!);
        dateSeps.push({ triggerId: id, li: sep });
      });

      // Typing/"…" indicators: ONE stable <li> per draft window, built here at its real position
      // in the flow (never moved, never re-populated during playback — see TypingRow's comment).
      const typingRows = draftIntervals(timeline).map((interval) => {
        const li = document.createElement('li');
        li.className = 'cf-typing-row';
        li.dataset.dir = actorDir(interval.by);
        li.hidden = true;
        li.innerHTML = '<span class="cf-bubble cf-typing"><i></i><i></i><i></i></span>';

        const anchorIdx = interval.afterMsgId ? finalState.order.indexOf(interval.afterMsgId) + 1 : 0;
        const anchor = anchorIdx < finalState.order.length ? msgEls.get(finalState.order[anchorIdx])! : null;
        log.insertBefore(li, anchor);
        return { interval, li };
      });

      this.#frame!.appendChild(log);
      return { scriptEl, timeline, postedAt, log, msgEls, typingRows, dateSeps, lastStep: null };
    });

    this.#activeIndex = 0;
    this.#slides[0].log.hidden = false;
    this.#applyTagForActiveSlide();
    // Slide 0 too, not just rotations: `#buildHead` only ever saw the HOST attributes, so without
    // this the first pass would show the host contact and every later pass slide 0's own — a
    // difference that only appears once the loop comes back around.
    this.#applyContactForActiveSlide();

    this.#frame.appendChild(this.#buildComposer(channel, chrome));

    const initialStep = this.hasAttribute('data-step')
      ? Number(this.getAttribute('data-step'))
      : this.#slides[0].timeline.frames.length;
    this.dataset.step = String(initialStep);
    this.#applyStep(initialStep);
  }

  /** Header — ChatDemo.astro precedent (`.chat-head`: avatar + name + meta). Visual-only, driven
   * by attributes so any consumer can set it; falls back to a channel-neutral default rather than
   * hardcoding a business name into a shared component. */
  #buildHead(anySlideStatus: boolean): HTMLElement {
    const name = this.getAttribute('contact-name') || 'Chat';
    const status = this.getAttribute('contact-status') || '';
    const head = document.createElement('header');
    head.className = 'cf-head';

    const avatar = document.createElement('span');
    avatar.className = 'cf-avatar';
    avatar.textContent = name.charAt(0).toUpperCase();
    head.appendChild(avatar);
    this.#avatarEl = avatar;

    const who = document.createElement('span');
    who.className = 'cf-who';
    const nameEl = document.createElement('b');
    nameEl.textContent = name;
    who.appendChild(nameEl);
    this.#nameEl = nameEl;
    // The `<em>` exists when the host declares a status OR when ANY slide does — not only when
    // one is present at mount. Rotation repaints text, it never restructures the header, so a
    // rubro carrying a status after one that doesn't would otherwise have nowhere to write it and
    // the bug would surface on the second slide only — the kind that ships.
    //
    // Deliberately NOT unconditional: `react/__tests__/snapshot-cross-check.test.tsx` compares the
    // element's DOM against React's node for node, and React emits no `<em>` when there is no
    // status. An always-present empty `<em>` broke all 7 whatsapp cases of that cross-check
    // (telegram passed — its fixture has a status, which is exactly why a partial run would have
    // hidden this). Scanning the light DOM keeps both properties: same shape as React when nobody
    // declares a status, and a place to write when somebody does.
    if (status || anySlideStatus) {
      const statusEl = document.createElement('em');
      statusEl.textContent = status;
      statusEl.hidden = !status;
      who.appendChild(statusEl);
      this.#statusEl = statusEl;
    }
    head.appendChild(who);

    // T-031 C — opt-in slot: only built when a consumer named a flag to watch (`badge-flag`,
    // read in connectedCallback before this runs). `#reconcile` is the only place that ever
    // touches its text/`data-on` after this — this method never renders "ON"/"OFF" itself, only
    // creates the node the reconcile loop then drives from `SimState.flags`.
    if (this.#badgeFlagKey) {
      const badge = document.createElement('span');
      badge.className = 'cf-badge';
      head.appendChild(badge);
      this.#badgeEl = badge;
    }

    return head;
  }

  /** T-031 D — "encima del chat", cromo del CONSUMIDOR: an icon+label pill this element renders,
   * but whose content is never a literal here — `#applyTagForActiveSlide` is the only place that
   * ever sets `textContent` on `#tagIconEl`/`#tagLabelEl`, straight from attributes. Built once,
   * hidden by default; a mount with no `tag-icon`/`tag-label` anywhere (host or per-slide) never
   * shows it — same "opt-in slot" discipline as the badge above. */
  #buildTag(): HTMLElement {
    const tag = document.createElement('div');
    tag.className = 'cf-tag';
    tag.hidden = true;

    const icon = document.createElement('span');
    icon.className = 'cf-tag-icon';
    icon.setAttribute('aria-hidden', 'true');
    tag.appendChild(icon);

    const label = document.createElement('span');
    label.className = 'cf-tag-label';
    tag.appendChild(label);

    this.#tagIconEl = icon;
    this.#tagLabelEl = label;
    return tag;
  }

  /** Reads the ACTIVE slide's own `<script data-tag-icon="…" data-tag-label="…">` first (T-031 B
   * rotation — production's real shape: each rubro carries its own tag), falling back to the
   * host-level `tag-icon`/`tag-label` attributes for the common single-script case. Neither source
   * is a literal owned by this file — both are the consumer's data, read verbatim. */
  #applyTagForActiveSlide(): void {
    if (!this.#tagEl || !this.#tagIconEl || !this.#tagLabelEl) return;
    const slide = this.#active;
    const icon = slide?.scriptEl?.getAttribute('data-tag-icon') || this.getAttribute('tag-icon') || '';
    const label = slide?.scriptEl?.getAttribute('data-tag-label') || this.getAttribute('tag-label') || '';
    if (!icon && !label) {
      this.#tagEl.hidden = true;
      return;
    }
    this.#tagEl.hidden = false;
    this.#tagIconEl.hidden = !icon;
    this.#tagIconEl.textContent = icon;
    this.#tagLabelEl.textContent = label;
  }

  /** Same shape as `#applyTagForActiveSlide` above, for the header's contact: the ACTIVE slide's
   * own `<script data-contact-name="…" data-contact-status="…">` wins, falling back to the
   * host-level `contact-name`/`contact-status` for the single-script case.
   *
   * Why it exists: `#buildHead` reads those host attributes ONCE at mount, so before this the
   * header kept one contact across every rubro while the script and the tag rotated underneath —
   * visible as the same person selling catering, then running a restaurant, then a real-estate
   * agency. `ChatDemo.astro` (production) rotates `contact.name`/`contact.meta` per rubro, so
   * shipping without this would have been a regression in the hero of a live landing.
   *
   * The avatar letter is derived here too, not just the name. Rotating the name while the initial
   * stays put reads worse than not rotating at all. */
  #applyContactForActiveSlide(): void {
    // `#statusEl` is intentionally NOT in this guard: it is absent by design when nobody declares
    // a status, and the name/avatar must still rotate in that case.
    if (!this.#nameEl || !this.#avatarEl) return;
    const el = this.#active?.scriptEl ?? null;
    const name = el?.getAttribute('data-contact-name') || this.getAttribute('contact-name') || 'Chat';
    const status = el?.getAttribute('data-contact-status') || this.getAttribute('contact-status') || '';
    this.#nameEl.textContent = name;
    this.#avatarEl.textContent = name.charAt(0).toUpperCase();
    if (this.#statusEl) {
      this.#statusEl.textContent = status;
      this.#statusEl.hidden = !status;
    }
  }

  /** T-031 B — advances rotation to slide `index`: hides the current slide's (already fully
   * built) log, shows the target's, and resets ITS `lastStep` guard so the next `#applyStep` does
   * a real reconcile even if `data-step` happens to already equal the value being written (the
   * step-unchanged guard's own reasoning, applied across a slide switch instead of across rAF
   * ticks). Never creates or removes a node — the gemelo (acceptance #2) this exists to satisfy. */
  #activateSlide(index: number): void {
    const current = this.#active;
    if (current) current.log.hidden = true;
    this.#activeIndex = index;
    const next = this.#slides[index];
    next.log.hidden = false;
    next.lastStep = null;
    this.#applyTagForActiveSlide();
    this.#applyContactForActiveSlide();
  }

  /** Composer — always shown (visual-only for this wave; a real, operable composer with mobile
   * keyboard handling is react/'s T-007). Its absence read as "broken" rather than "conversation
   * ended" in review — this closes that gap without claiming interactivity it doesn't have.
   *
   * Icon order is brand identity, not adapter structure (T-013 fidelity fix, §"Composer": clip
   * LEFT on Telegram, mirrored to the RIGHT on WhatsApp) — `ChannelAdapter` deliberately excludes
   * it, same reasoning as wallpaper texture and date-pill treatment (file header). `chrome`
   * (T-017 Alcance B) decides whether that per-channel mirroring happens at all: 'fidelity' keeps
   * it (simulator/marketing — each channel looks like itself); 'consistent' always renders
   * Telegram's arrangement, on both channels, so the app's operator never sees a control move
   * between channels in the same session. Either way, `.cf-bubble`/`.cf-receipt`/wallpaper stay
   * exactly what the channel and adapter say — only the composer's OWN chrome is what `chrome`
   * touches (T-017 acceptance #3, "el gemelo").
   */
  #buildComposer(channel: ChannelId, chrome: ChromeMode): HTMLElement {
    const bar = document.createElement('div');
    bar.className = 'cf-composer';

    const clip = this.#composerIcon('clip', clipIcon());
    const emoji = this.#composerIcon('emoji', emojiIcon());
    // Trailing action is always the mic, never a send arrow: `input` below is a static
    // placeholder ("Mensaje"), never real typed text, so the idle affordance both real apps show
    // for an empty box is the honest one here (icons.ts's micIcon doc comment).
    const mic = this.#composerIcon('mic', micIcon(), 'cf-composer-send');

    const input = document.createElement('span');
    input.className = 'cf-composer-input';
    input.setAttribute('aria-hidden', 'true');
    input.textContent = 'Mensaje';

    const fidelityOrder = channel === 'telegram' ? [clip, input, emoji, mic] : [emoji, input, mic, clip];
    bar.append(...(chrome === 'consistent' ? [clip, input, emoji, mic] : fidelityOrder));
    return bar;
  }

  #composerIcon(name: 'clip' | 'emoji' | 'mic', icon: SVGSVGElement, extraClass?: string): HTMLElement {
    const span = document.createElement('span');
    span.className = extraClass ? `cf-composer-icon ${extraClass}` : 'cf-composer-icon';
    span.dataset.icon = name;
    span.setAttribute('aria-hidden', 'true');
    span.appendChild(icon);
    return span;
  }

  disconnectedCallback(): void {
    this.#playhead?.pause();
    this.#cancelScrollAnimation();
    this.#clearLoopTimer();
  }

  attributeChangedCallback(name: string): void {
    const active = this.#active;
    if (name === 'data-step' && active) {
      this.#applyStep(Number(this.dataset.step ?? active.timeline.frames.length));
    }
  }

  /** Drives `data-step` from the real core playhead — see file header: same attribute, same path
   * as manual scrubbing. Returns the Playhead so callers can pause()/rate() it.
   *
   * T-027 B (loop): each call constructs a brand-NEW `createPlayhead(tl)` — never reuses
   * `this.#playhead` — so it always starts from `virtualT = 0` regardless of why it's being
   * called. That sidesteps the real quirk `core/__tests__` documents (calling `.play()` again on
   * the SAME Playhead after natural completion does NOT reset its internal `virtualT`, so it
   * "replays" the true last frame): since `#onPlaybackComplete` below calls `this.play()` again —
   * a NEW Playhead — instead of reusing the old one's handle, the loop restarts from the real
   * beginning for free. No DOM node is created or removed by this — `#applyStep`/`#reconcile`
   * only ever repopulate/hide the SAME pre-built `<li>`s (connectedCallback), the exact contract
   * T-017's typing-animation regression exists to protect (acceptance #2's gemelo). */
  play(): Playhead {
    const active = this.#active;
    if (!active) throw new Error('cf-chat-sim: play() before connectedCallback');
    this.#playhead?.pause();
    this.#clearLoopTimer();
    const tl = active.timeline;
    const ph = createPlayhead(tl);
    ph.onFrame((_state, t) => {
      // Convert Tick -> exact frame count via the same monotonic scan stateAtStep uses, so the
      // attribute always reflects a real "N frames applied", never an interpolated Tick.
      let step = 0;
      while (step < tl.frames.length && tl.frames[step].t <= t) step++;
      this.#fromPlayhead = true;
      this.dataset.step = String(step);
      this.#fromPlayhead = false;
      // emit() (core/playhead.ts) clamps virtualT to tl.duration and stops rescheduling exactly
      // once it's reached — this fires exactly once per play() cycle, never mid-playback.
      if (t >= tl.duration) this.#onPlaybackComplete();
    });
    this.#playhead = ph;
    ph.play();
    return ph;
  }

  /** T-027 B acceptance: "el loop reinicia sin recrear nodos" — restarting is just calling
   * `play()` again (see its own comment above for why that's safe); the pause between rubros in
   * ChatDemo.astro (4200ms, a full context-switch to a DIFFERENT script) doesn't apply here for
   * the single-script case, so the default is shorter and consumer-tunable via `loop-pause-ms`.
   *
   * T-031 B extends this to N>1 scripts: when there's more than one slide, "restart" means
   * "advance to the next one" (wrapping back to the first after the last — the acceptance's own
   * "al terminar el último vuelve al primero"), gated behind the SAME `loop` attribute rather than
   * being unconditional — consistent with every other opt-in playback attribute here (chrome,
   * badge, tag). `#activateSlide` only ever hides/shows already-built logs, never recreates one,
   * so `play()` right after it operates on `this.#active`'s (now the next slide's) real
   * timeline — same "brand-new Playhead" reasoning as the single-script restart above. */
  #onPlaybackComplete(): void {
    if (!this.#loop) return;
    this.#loopTimer = setTimeout(() => {
      this.#loopTimer = null;
      if (this.#slides.length > 1) {
        this.#activateSlide((this.#activeIndex + 1) % this.#slides.length);
      }
      this.play();
    }, this.#loopPauseMs);
  }

  #clearLoopTimer(): void {
    if (this.#loopTimer !== null) {
      clearTimeout(this.#loopTimer);
      this.#loopTimer = null;
    }
  }

  /** T-031 B — every `<script type="application/json">` child, in document order, is its own
   * rotation slide; the pre-existing single `script` ATTRIBUTE stays a single-slide fallback
   * (unchanged priority: inline children win when both are present, exactly like `#readScript`
   * did before this). `scriptEl` lets `#applyTagForActiveSlide` read a per-slide
   * `data-tag-icon`/`data-tag-label` override straight off the markup — `null` for the
   * attribute-sourced fallback, which has no element to read one from. */
  #readScripts(): { script: SimScript; scriptEl: Element | null }[] {
    const inlineScripts = [...this.querySelectorAll('script[type="application/json"]')];
    if (inlineScripts.length > 0) {
      return inlineScripts.map((scriptEl) => ({
        script: JSON.parse(scriptEl.textContent ?? '[]') as SimScript,
        scriptEl,
      }));
    }
    const raw = this.getAttribute('script');
    if (!raw) throw new Error('cf-chat-sim: no script provided (attribute or inline JSON child)');
    return [{ script: JSON.parse(raw) as SimScript, scriptEl: null }];
  }

  #applyStep(step: number): void {
    const slide = this.#active;
    if (!slide) return;
    // The root cause behind both the duplicate-bubble bug (iteration 1) and the typing animation
    // never looping (iteration 3, team-lead's diagnosis): play()'s onFrame callback writes
    // `data-step` on EVERY rAF tick (~60/s), and only a fraction of those ticks land on a value
    // that actually differs from the last one applied. Without this guard, every visible node got
    // repopulated dozens of times per script step for no reason — including nodes whose CSS
    // animation state that repopulation was silently resetting. `#activateSlide` (T-031 B) resets
    // this per-slide, so switching slides always forces a real reconcile too.
    if (step === slide.lastStep) return;
    slide.lastStep = step;
    // Captured BEFORE stateAtStep/#reconcile run: `#fromPlayhead` is only ever true for the exact
    // synchronous turn play()'s onFrame wrote `dataset.step` (see that field's own comment).
    const animate = this.#fromPlayhead;
    const state = stateAtStep(slide.timeline, step);
    this.#reconcile(slide, state, step, animate);
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
  #reconcile(slide: Slide, state: SimState, step: number, animate: boolean): void {
    // `t0` IS the epoch: architecture-v1.md §1 defines it as "epoch virtual — dato del GUION, no
    // del reloj", and connectedCallback() compiles with a real epoch-ms value, so no fabrication
    // needed here — Timeline.t0 already carries it, untouched, straight from core/types.ts.
    const t0 = slide.timeline.t0;
    const locale = this.getAttribute('locale') || 'es-PE';
    const tz = this.getAttribute('tz') || 'America/Lima';
    const editedLabel = this.getAttribute('edited-label') || 'Editado';
    const replyLabel = this.getAttribute('reply-label') || 'Respondió rápido';

    const visible: RenderMessage[] = state.order
      .map((id) => state.msgs.get(id))
      .filter((m): m is MsgState => !!m && m.deleted === null)
      .map((m) => {
        const tick = slide.postedAt.get(m.id) ?? 0;
        return toRenderMessage(m, formatTime(t0, tick, locale, tz), editedLabel, replyLabel);
      });

    const flags = computeGroupFlags(visible, this.#adapter.tail);
    const visibleIds = new Set(visible.map((m) => m.id));

    visible.forEach((rm) => {
      const li = slide.msgEls.get(rm.id);
      if (!li) return; // shouldn't happen — every eventual MsgId was pre-built in connectedCallback
      populateMessageElement(li, rm, this.#adapter, flags.get(rm.id)!);
      li.hidden = false;
      this.#measurePad(li);
    });

    // Not (yet, or no longer) in `order` at this step => hidden, never removed — the nodes stay
    // exactly where connectedCallback put them (post is append-only in T-001, so build order ===
    // final DOM order already; pin reordering is T-003's problem, not this loop's).
    slide.msgEls.forEach((li, id) => {
      if (!visibleIds.has(id)) li.hidden = true;
    });

    // A separator reveals exactly when the message it introduces does — never ahead of it.
    slide.dateSeps.forEach((sep) => {
      sep.li.hidden = !visibleIds.has(sep.triggerId);
    });

    if (state.draft) this.setAttribute('data-drafting', state.draft.by);
    else this.removeAttribute('data-drafting');

    // Typing indicators: flip `hidden` on the ALREADY-BUILT <li> for whichever window contains
    // `step` — never innerHTML, never appendChild/insertBefore here. That's what keeps the CSS
    // animation looping instead of restarting every time this runs (team-lead's diagnosis).
    slide.typingRows.forEach((row) => {
      row.li.hidden = !(step >= row.interval.appearStep && step < row.interval.vanishStep);
    });

    // T-031 C — badge slot: reads whichever `SimState.flags` key the consumer named via
    // `badge-flag`; no key set (`#badgeEl` never built) is the common no-op case. Never a literal
    // "IA ACTIVA"/rubro string here — only the consumer's own on/off labels.
    if (this.#badgeFlagKey && this.#badgeEl) {
      const on = Boolean(state.flags[this.#badgeFlagKey]);
      this.#badgeEl.textContent = on ? this.#badgeOnLabel : this.#badgeOffLabel;
      this.#badgeEl.dataset.on = String(on);
    }

    this.#applyBottomAnchor(slide.log);
    this.#applyScroll(slide.log, state.scrollId, animate);
  }

  /** Team-lead, iteration 3: measured 41% of the log's height sitting empty at the BOTTOM (216px
   * of 522px) — a short thread should hug the composer and grow upward, not float at the top.
   * `.cf-anchor-top` (styles.css) only ever lives on the first VISIBLE child at any moment; date
   * separators (below) and typing rows are ordinary flex items too, so whichever of the three
   * kinds happens to be first-and-visible gets it. */
  #applyBottomAnchor(log: HTMLOListElement): void {
    const prev = log.querySelector<HTMLElement>('.cf-anchor-top');
    if (prev) prev.classList.remove('cf-anchor-top');
    const firstVisible = [...log.children].find((el) => !(el as HTMLElement).hidden);
    (firstVisible as HTMLElement | undefined)?.classList.add('cf-anchor-top');
  }

  /** T-027 A — `core`'s `scrollId` (fold.ts: set to the MsgId on every `post`, types.ts:269)
   * consumed for the first time: this is the ONLY place anything reads `state.scrollId`. Follows
   * ChatDemo.astro's own `glide()` exactly (file header there): 220ms rAF, cubic ease-out, plus a
   * hard 260ms catch-up `setTimeout` in case a late reflow (a `--cf-cs-pad` remeasure, a font
   * swap) moved `scrollHeight` after the animation's own final frame already ran.
   *
   * `animate` is false for the initial render and any external/manual `data-step` write (devtools
   * scrub, a consumer's own seek UI) — acceptance #1's "instantáneo al seek": those jump straight
   * to bottom, never glide. `scrollId === null` (nothing posted yet) is a no-op. */
  #applyScroll(log: HTMLOListElement, scrollId: MsgId | null, animate: boolean): void {
    if (scrollId === null) return;
    this.#cancelScrollAnimation();
    const to = Math.max(0, log.scrollHeight - log.clientHeight);
    const reduceMotion =
      typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!animate || reduceMotion) {
      log.scrollTop = to;
      return;
    }
    const from = log.scrollTop;
    if (to - from < 1) return;
    const duration = 220;
    const t0 = performance.now();
    const tick = (now: number): void => {
      const p = Math.min(1, (now - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      log.scrollTop = from + (to - from) * eased;
      this.#scrollRaf = p < 1 ? requestAnimationFrame(tick) : null;
    };
    this.#scrollRaf = requestAnimationFrame(tick);
    this.#scrollCatchup = setTimeout(() => {
      this.#scrollCatchup = null;
      log.scrollTop = log.scrollHeight - log.clientHeight;
    }, 260);
  }

  #cancelScrollAnimation(): void {
    if (this.#scrollRaf !== null) {
      cancelAnimationFrame(this.#scrollRaf);
      this.#scrollRaf = null;
    }
    if (this.#scrollCatchup !== null) {
      clearTimeout(this.#scrollCatchup);
      this.#scrollCatchup = null;
    }
  }
}
customElements.define('cf-chat-sim', CfChatSimElement);
