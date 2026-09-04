"use strict";
var CfChatSim = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __typeError = (msg) => {
    throw TypeError(msg);
  };
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
  var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
  var __privateGet = (obj, member, getter) => (__accessCheck(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
  var __privateAdd = (obj, member, value) => member.has(obj) ? __typeError("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
  var __privateSet = (obj, member, value, setter) => (__accessCheck(obj, member, "write to private field"), setter ? setter.call(obj, value) : member.set(obj, value), value);
  var __privateMethod = (obj, member, method) => (__accessCheck(obj, member, "access private method"), method);

  // src/components/chat-sim/element/index.ts
  var index_exports = {};
  __export(index_exports, {
    CAPS_FIXTURE_INVERTED_ADAPTER: () => CAPS_FIXTURE_INVERTED_ADAPTER,
    CfChatSimElement: () => CfChatSimElement,
    WHATSAPP_REFERENCE_ADAPTER: () => WHATSAPP_REFERENCE_ADAPTER,
    actorDir: () => actorDir,
    actorSenderKind: () => actorSenderKind,
    buildMessageElement: () => buildMessageElement,
    computeGroupFlags: () => computeGroupFlags,
    groupKeyOf: () => groupKeyOf,
    populateMessageElement: () => populateMessageElement
  });

  // src/components/chat-sim/core/digest.ts
  function digestOf(input) {
    let h1 = 3735928559 ^ input.length;
    let h2 = 1103547991 ^ input.length;
    for (let i = 0; i < input.length; i++) {
      const ch = input.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ h1 >>> 16, 2246822507) ^ Math.imul(h2 ^ h2 >>> 13, 3266489909);
    h2 = Math.imul(h2 ^ h2 >>> 16, 2246822507) ^ Math.imul(h1 ^ h1 >>> 13, 3266489909);
    return (h1 >>> 0).toString(16).padStart(8, "0") + (h2 >>> 0).toString(16).padStart(8, "0");
  }

  // src/components/chat-sim/core/prng.ts
  function xmur3(str) {
    let h = 1779033703 ^ str.length;
    for (let i = 0; i < str.length; i++) {
      h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
      h = h << 13 | h >>> 19;
    }
    return function next() {
      h = Math.imul(h ^ h >>> 16, 2246822507);
      h = Math.imul(h ^ h >>> 13, 3266489909);
      h ^= h >>> 16;
      return h >>> 0;
    };
  }
  function sfc32(a, b, c, d) {
    let sa = a >>> 0;
    let sb = b >>> 0;
    let sc = c >>> 0;
    let sd = d >>> 0;
    return function next() {
      let t = sa + sb | 0;
      sa = sb ^ sb >>> 9;
      sb = sc + (sc << 3) | 0;
      sc = sc << 21 | sc >>> 11;
      sd = sd + 1 | 0;
      t = t + sd | 0;
      sc = sc + t | 0;
      return (t >>> 0) / 4294967296;
    };
  }
  function rand(seed, stepIdx, slot) {
    const seedWords = xmur3(`${seed}:${stepIdx}:${slot}`);
    const gen = sfc32(seedWords(), seedWords(), seedWords(), seedWords());
    gen();
    gen();
    gen();
    return gen();
  }

  // src/components/chat-sim/core/compile.ts
  var JITTER_MS_MAX = 400;
  function stepToEv(step, id, idx) {
    switch (step.k) {
      case "post":
        return { k: "post", id, step };
      case "draft":
        return { k: "draft", idx, chars: step.chars };
      case "flag":
        return { k: "flag", key: step.key, value: step.value };
    }
  }
  function compile(script, o) {
    const frames = [];
    let clock = o.t0;
    let nextMsgId = 0;
    script.forEach((step, stepIdx) => {
      const jitter = Math.floor(rand(o.seed, stepIdx, 0) * JITTER_MS_MAX);
      clock += (step.delayMs ?? 0) + jitter;
      const id = step.k === "post" ? `m${nextMsgId++}` : "";
      frames.push({ t: clock, ev: stepToEv(step, id, stepIdx) });
    });
    const keys = Int32Array.from(frames.map((f) => f.t));
    const duration = frames.length > 0 ? frames[frames.length - 1].t : o.t0;
    const digest = digestOf(
      JSON.stringify({ script, seed: o.seed, channel: o.channel, locale: o.locale, tz: o.tz })
    );
    return {
      t0: o.t0,
      frames,
      keys,
      checkpoints: [],
      // full checkpointing is T-003 (architecture-v1.md §1, "cada K=64 frames")
      duration,
      digest
    };
  }

  // src/components/chat-sim/core/fold.ts
  function initialState() {
    return {
      msgs: /* @__PURE__ */ new Map(),
      order: [],
      pinned: null,
      draft: null,
      flags: {},
      overlays: [],
      scrollId: null
    };
  }
  function applyEvent(state, ev) {
    switch (ev.k) {
      case "post": {
        const authored = ev.step;
        const msg = {
          id: ev.id,
          by: authored.k === "post" ? authored.by : "",
          v: 0,
          text: authored.k === "post" ? authored.text : void 0,
          media: authored.k === "post" ? authored.media : void 0,
          deleted: null,
          reactions: [],
          receipt: "queued",
          views: 0
        };
        const msgs = new Map(state.msgs);
        msgs.set(ev.id, msg);
        return { ...state, msgs, order: [...state.order, ev.id], scrollId: ev.id };
      }
      case "draft": {
        const draft = { by: "", chars: ev.chars };
        return { ...state, draft };
      }
      case "flag":
        return { ...state, flags: { ...state.flags, [ev.key]: ev.value } };
      default:
        return state;
    }
  }

  // src/components/chat-sim/core/seek.ts
  function upperBound(keys, t) {
    let lo = 0;
    let hi = keys.length;
    while (lo < hi) {
      const mid = lo + hi >>> 1;
      if (keys[mid] <= t) lo = mid + 1;
      else hi = mid;
    }
    return lo;
  }
  function seek(tl, t) {
    const upto = upperBound(tl.keys, t);
    let state = initialState();
    for (let i = 0; i < upto; i++) {
      state = applyEvent(state, tl.frames[i].ev);
    }
    return state;
  }

  // src/components/chat-sim/core/playhead.ts
  function createPlayhead(tl) {
    let playing = false;
    let playRate = 1;
    let virtualT = tl.t0;
    let rafId = null;
    let lastWall = null;
    const listeners = /* @__PURE__ */ new Set();
    function emit() {
      const clamped = Math.min(virtualT, tl.duration);
      const state = seek(tl, clamped);
      listeners.forEach((cb) => cb(state, clamped));
    }
    function tick(wallNow) {
      if (!playing) return;
      if (lastWall !== null) {
        virtualT += (wallNow - lastWall) * playRate;
      }
      lastWall = wallNow;
      emit();
      if (virtualT < tl.duration) {
        rafId = requestAnimationFrame(tick);
      } else {
        playing = false;
        rafId = null;
      }
    }
    return {
      play() {
        if (playing) return;
        playing = true;
        lastWall = null;
        rafId = requestAnimationFrame(tick);
      },
      pause() {
        playing = false;
        if (rafId !== null) {
          cancelAnimationFrame(rafId);
          rafId = null;
        }
      },
      rate(n) {
        playRate = n;
      },
      onFrame(cb) {
        listeners.add(cb);
        return () => listeners.delete(cb);
      }
    };
  }

  // src/components/chat-sim/element/fixtures.ts
  var WHATSAPP_REFERENCE_ADAPTER = {
    tail: "first",
    wallpaper: "pattern",
    reactions: "overlay-below",
    reactionConstraint: {
      emoji: "any",
      allowlistSize: 0,
      maxAgeDays: 30,
      canTargetReaction: false,
      canTargetOutbound: true,
      maxPerMessage: 0
    },
    groupKey: "actor",
    deliveryStates: ["queued", "sent", "delivered", "read", "failed"],
    receiptGlyph: "double-tick",
    counter: "none",
    timestamp: "inside-pad",
    quote: "color-bar",
    bubbleTransport: "per-conversation",
    senderKinds: ["human", "ai"],
    keyboard: "os-qwerty",
    album: "grid-in-one-bubble",
    e2eNotice: true,
    avatarSide: "inbound"
  };
  var CAPS_FIXTURE_INVERTED_ADAPTER = {
    ...WHATSAPP_REFERENCE_ADAPTER,
    tail: "last",
    receiptGlyph: "single-tick",
    timestamp: "inside-plain",
    reactions: "own-row"
  };

  // src/components/chat-sim/element/render.ts
  function actorDir(by) {
    return by === "in" ? "in" : "out";
  }
  function actorSenderKind(by) {
    if (by === "out:ai") return "ai";
    if (by.startsWith("out:human:")) return "human";
    return "human";
  }
  function groupKeyOf(by) {
    return by;
  }
  function computeGroupFlags(order, tail) {
    const out = /* @__PURE__ */ new Map();
    let prevKey = null;
    let streakStart = 0;
    const closeStreak = (from, to) => {
      const tailIdx = tail === "first" ? from : to;
      for (let i = from; i <= to; i++) {
        const m = order[i];
        out.set(m.id, { tailHere: i === tailIdx, grouped: i !== from });
      }
    };
    order.forEach((m, i) => {
      const key = groupKeyOf(m.by);
      if (key !== prevKey) {
        if (prevKey !== null) closeStreak(streakStart, i - 1);
        streakStart = i;
        prevKey = key;
      }
    });
    if (order.length > 0) closeStreak(streakStart, order.length - 1);
    return out;
  }
  function receiptGlyphLabel(state) {
    switch (state) {
      case "read":
        return "Le\xEDdo";
      case "delivered":
        return "Entregado";
      case "sent":
        return "Enviado";
      case "failed":
        return "Fallido";
      case "queued":
      default:
        return "En cola";
    }
  }
  function buildTickSvg(ticks, read) {
    const NS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(NS, "svg");
    svg.setAttribute("viewBox", "0 0 18 12");
    svg.setAttribute("width", "15");
    svg.setAttribute("height", "10");
    svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", "currentColor");
    svg.setAttribute("stroke-width", "1.7");
    svg.setAttribute("stroke-linecap", "round");
    svg.setAttribute("stroke-linejoin", "round");
    svg.classList.add("cf-receipt");
    svg.dataset.read = String(read);
    const p1 = document.createElementNS(NS, "path");
    p1.setAttribute("d", ticks === 2 ? "M1 6.7 4.1 9.8 10.2 2.4" : "M4.5 6.7 7.6 9.8 13.7 2.4");
    svg.appendChild(p1);
    if (ticks === 2) {
      const p2 = document.createElementNS(NS, "path");
      p2.setAttribute("d", "M7.6 6.7 10.7 9.8 16.8 2.4");
      svg.appendChild(p2);
    }
    return svg;
  }
  function buildStamp(msg, adapter, dir) {
    const stamp = document.createElement("span");
    stamp.className = "cf-stamp";
    if (msg.editedLabel) {
      const edited = document.createElement("em");
      edited.className = "cf-edited";
      edited.textContent = msg.editedLabel;
      stamp.appendChild(edited);
    }
    const time = document.createElement("span");
    time.className = "cf-time";
    time.textContent = msg.atLabel;
    stamp.appendChild(time);
    if (adapter.counter === "views") {
      const views = document.createElement("span");
      views.className = "cf-views";
      views.textContent = String(msg.views);
      stamp.appendChild(views);
    }
    if (dir === "out") {
      if (adapter.receiptGlyph === "trailing-label") {
        const label = document.createElement("span");
        label.className = "cf-receipt-label";
        label.textContent = receiptGlyphLabel(msg.receipt);
        stamp.appendChild(label);
      } else {
        const ticks = adapter.receiptGlyph === "double-tick" ? 2 : 1;
        stamp.appendChild(buildTickSvg(ticks, msg.receipt === "read"));
      }
    }
    return stamp;
  }
  function buildReactions(reactions, style) {
    const el = document.createElement("span");
    el.className = "cf-reactions";
    el.dataset.style = style;
    reactions.forEach((r) => {
      const pill = document.createElement("span");
      pill.className = "cf-reaction";
      pill.textContent = r.emoji;
      el.appendChild(pill);
    });
    return el;
  }
  function buildQuote(quote, style) {
    const el = document.createElement("span");
    el.className = "cf-quote";
    el.dataset.style = style;
    const author = document.createElement("b");
    author.className = "cf-quote-author";
    author.textContent = quote.author;
    const text = document.createElement("span");
    text.className = "cf-quote-text";
    text.textContent = quote.text;
    el.append(author, text);
    return el;
  }
  function populateMessageElement(li, msg, adapter, flags) {
    li.replaceChildren();
    const dir = actorDir(msg.by);
    li.className = "cf-msg";
    li.dataset.dir = dir;
    li.dataset.by = msg.by;
    if (flags.tailHere) li.dataset.tail = "";
    else delete li.dataset.tail;
    if (flags.grouped) li.dataset.grouped = "";
    else delete li.dataset.grouped;
    const bubble = document.createElement("span");
    bubble.className = "cf-bubble";
    if (msg.quote) bubble.appendChild(buildQuote(msg.quote, adapter.quote));
    const text = document.createElement("span");
    text.className = "cf-text";
    text.textContent = msg.text;
    bubble.appendChild(text);
    const stamp = buildStamp(msg, adapter, dir);
    if (adapter.timestamp === "inside-pad") {
      const pad = document.createElement("span");
      pad.className = "cf-pad";
      bubble.append(pad, stamp);
    } else if (adapter.timestamp === "inside-plain") {
      bubble.appendChild(stamp);
    }
    if (msg.reactions.length > 0) {
      const reactionsEl = buildReactions(msg.reactions, adapter.reactions);
      if (adapter.reactions === "own-row") {
        li.append(bubble);
        if (adapter.timestamp === "gutter") li.appendChild(stamp);
        li.appendChild(reactionsEl);
        return;
      }
      reactionsEl.dataset.style = adapter.reactions;
      bubble.appendChild(reactionsEl);
    }
    li.appendChild(bubble);
    if (adapter.timestamp === "gutter") li.appendChild(stamp);
  }
  function buildMessageElement(msg, adapter, flags) {
    const li = document.createElement("li");
    populateMessageElement(li, msg, adapter, flags);
    return li;
  }

  // src/components/chat-sim/element/chat-sim-element.ts
  function stateAtStep(tl, step) {
    let state = initialState();
    const upto = Math.max(0, Math.min(step, tl.frames.length));
    for (let i = 0; i < upto; i++) state = applyEvent(state, tl.frames[i].ev);
    return state;
  }
  function postedAtByMsgId(frames) {
    const out = /* @__PURE__ */ new Map();
    for (const f of frames) if (f.ev.k === "post") out.set(f.ev.id, f.t);
    return out;
  }
  function formatTime(t0Epoch, tick, locale, tz) {
    return new Intl.DateTimeFormat(locale, {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: tz
    }).format(
      new Date(t0Epoch + tick)
    );
  }
  function toRenderMessage(msg, atLabel, editedLabel) {
    return {
      id: msg.id,
      by: msg.by,
      text: msg.text ?? "",
      atLabel,
      receipt: msg.receipt,
      views: msg.views,
      reactions: msg.reactions,
      editedLabel: msg.v > 0 ? editedLabel : void 0
    };
  }
  var _timeline, _postedAt, _msgEls, _log, _typingEl, _playhead, _adapter, _CfChatSimElement_instances, readScript_fn, applyStep_fn, reconcile_fn;
  var CfChatSimElement = class extends HTMLElement {
    constructor() {
      super(...arguments);
      __privateAdd(this, _CfChatSimElement_instances);
      __privateAdd(this, _timeline, null);
      __privateAdd(this, _postedAt, /* @__PURE__ */ new Map());
      __privateAdd(this, _msgEls, /* @__PURE__ */ new Map());
      __privateAdd(this, _log, null);
      __privateAdd(this, _typingEl, null);
      __privateAdd(this, _playhead, null);
      __privateAdd(this, _adapter, WHATSAPP_REFERENCE_ADAPTER);
    }
    /** Settable so a caller (a devtools console, a future capture/ harness, or T-005's real
     * `getAdapter(channel)` once it lands) can swap the whole 16-field object and see the DOM
     * change — this is the property the caps fixture test (render.test.ts) exercises directly,
     * without going through a DOM element at all; here it's wired for the live demo. */
    get adapter() {
      return __privateGet(this, _adapter);
    }
    set adapter(next) {
      __privateSet(this, _adapter, next);
      this.dataset.wallpaper = next.wallpaper;
      if (__privateGet(this, _timeline)) __privateMethod(this, _CfChatSimElement_instances, applyStep_fn).call(this, Number(this.dataset.step ?? __privateGet(this, _timeline).frames.length));
    }
    connectedCallback() {
      this.classList.add("cf-chat-sim");
      if (!this.hasAttribute("role")) this.setAttribute("role", "log");
      this.dataset.wallpaper = __privateGet(this, _adapter).wallpaper;
      const script = __privateMethod(this, _CfChatSimElement_instances, readScript_fn).call(this);
      const channel = this.getAttribute("channel") || "whatsapp";
      const seed = Number(this.getAttribute("seed") ?? "1");
      const locale = this.getAttribute("locale") || "es-PE";
      const tz = this.getAttribute("tz") || "America/Lima";
      const t0 = Number(this.getAttribute("t0") ?? String(Date.UTC(2026, 0, 1, 9, 0, 0)));
      __privateSet(this, _timeline, compile(script, { seed, channel, locale, tz, t0 }));
      __privateSet(this, _postedAt, postedAtByMsgId(__privateGet(this, _timeline).frames));
      __privateSet(this, _log, document.createElement("ol"));
      __privateGet(this, _log).className = "cf-log";
      this.textContent = "";
      this.appendChild(__privateGet(this, _log));
      const finalState = stateAtStep(__privateGet(this, _timeline), __privateGet(this, _timeline).frames.length);
      finalState.order.forEach((id) => {
        const li = document.createElement("li");
        li.className = "cf-msg";
        li.hidden = true;
        __privateGet(this, _msgEls).set(id, li);
        __privateGet(this, _log).appendChild(li);
      });
      __privateSet(this, _typingEl, document.createElement("li"));
      __privateGet(this, _typingEl).className = "cf-typing-row";
      __privateGet(this, _typingEl).hidden = true;
      __privateGet(this, _typingEl).innerHTML = '<span class="cf-typing"><i></i><i></i><i></i></span>';
      __privateGet(this, _log).appendChild(__privateGet(this, _typingEl));
      const initialStep = this.hasAttribute("data-step") ? Number(this.getAttribute("data-step")) : __privateGet(this, _timeline).frames.length;
      this.dataset.step = String(initialStep);
      __privateMethod(this, _CfChatSimElement_instances, applyStep_fn).call(this, initialStep);
    }
    disconnectedCallback() {
      __privateGet(this, _playhead)?.pause();
    }
    attributeChangedCallback(name) {
      if (name === "data-step" && __privateGet(this, _timeline)) {
        __privateMethod(this, _CfChatSimElement_instances, applyStep_fn).call(this, Number(this.dataset.step ?? __privateGet(this, _timeline).frames.length));
      }
    }
    /** Drives `data-step` from the real core playhead — see file header: same attribute, same path
     * as manual scrubbing. Returns the Playhead so callers can pause()/rate() it. */
    play() {
      if (!__privateGet(this, _timeline)) throw new Error("cf-chat-sim: play() before connectedCallback");
      __privateGet(this, _playhead)?.pause();
      const tl = __privateGet(this, _timeline);
      const ph = createPlayhead(tl);
      ph.onFrame((_state, t) => {
        let step = 0;
        while (step < tl.frames.length && tl.frames[step].t <= t) step++;
        this.dataset.step = String(step);
      });
      __privateSet(this, _playhead, ph);
      ph.play();
      return ph;
    }
  };
  _timeline = new WeakMap();
  _postedAt = new WeakMap();
  _msgEls = new WeakMap();
  _log = new WeakMap();
  _typingEl = new WeakMap();
  _playhead = new WeakMap();
  _adapter = new WeakMap();
  _CfChatSimElement_instances = new WeakSet();
  readScript_fn = function() {
    const inline = this.querySelector('script[type="application/json"]');
    const raw = inline?.textContent ?? this.getAttribute("script");
    if (!raw) throw new Error("cf-chat-sim: no script provided (attribute or inline JSON child)");
    return JSON.parse(raw);
  };
  applyStep_fn = function(step) {
    if (!__privateGet(this, _timeline) || !__privateGet(this, _log)) return;
    const state = stateAtStep(__privateGet(this, _timeline), step);
    __privateMethod(this, _CfChatSimElement_instances, reconcile_fn).call(this, state);
  };
  /** Pre-render contract: every MsgId's <li> already exists (built in connectedCallback from the
   * final state) — this only repopulates content for currently-visible messages and flips
   * `hidden`. It never creates, removes, or reorders nodes. */
  reconcile_fn = function(state) {
    const t0 = __privateGet(this, _timeline).t0;
    const locale = this.getAttribute("locale") || "es-PE";
    const tz = this.getAttribute("tz") || "America/Lima";
    const editedLabel = this.getAttribute("edited-label") || "Editado";
    const visible = state.order.map((id) => state.msgs.get(id)).filter((m) => !!m && m.deleted === null).map((m) => {
      const tick = __privateGet(this, _postedAt).get(m.id) ?? 0;
      return toRenderMessage(m, formatTime(t0, tick, locale, tz), editedLabel);
    });
    const flags = computeGroupFlags(visible, __privateGet(this, _adapter).tail);
    const visibleIds = new Set(visible.map((m) => m.id));
    visible.forEach((rm) => {
      const li = __privateGet(this, _msgEls).get(rm.id);
      if (!li) return;
      populateMessageElement(li, rm, __privateGet(this, _adapter), flags.get(rm.id));
      li.hidden = false;
    });
    __privateGet(this, _msgEls).forEach((li, id) => {
      if (!visibleIds.has(id)) li.hidden = true;
    });
    if (state.draft) {
      this.setAttribute("data-drafting", state.draft.by);
      if (__privateGet(this, _typingEl)) {
        __privateGet(this, _typingEl).hidden = false;
        __privateGet(this, _log).appendChild(__privateGet(this, _typingEl));
      }
    } else {
      this.removeAttribute("data-drafting");
      if (__privateGet(this, _typingEl)) __privateGet(this, _typingEl).hidden = true;
    }
  };
  __publicField(CfChatSimElement, "observedAttributes", ["data-step"]);
  customElements.define("cf-chat-sim", CfChatSimElement);
  return __toCommonJS(index_exports);
})();
