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
        return { ...state, msgs, order: [...state.order, ev.id], scrollId: ev.id, draft: null };
      }
      case "draft": {
        const draft = { by: ev.by, chars: ev.chars };
        return { ...state, draft };
      }
      case "flag":
        return { ...state, flags: { ...state.flags, [ev.key]: ev.value } };
      case "edit": {
        const msg = state.msgs.get(ev.id);
        if (!msg) return state;
        const msgs = new Map(state.msgs);
        msgs.set(ev.id, { ...msg, v: ev.v });
        return { ...state, msgs };
      }
      case "delete": {
        const msg = state.msgs.get(ev.id);
        if (!msg) return state;
        const msgs = new Map(state.msgs);
        msgs.set(ev.id, { ...msg, deleted: ev.scope });
        return { ...state, msgs };
      }
      case "react": {
        const msg = state.msgs.get(ev.id);
        if (!msg) return state;
        const reactions = ev.remove ? msg.reactions.filter((r) => !(r.by === ev.by && r.emoji === ev.emoji)) : [...msg.reactions, { emoji: ev.emoji, by: ev.by }];
        const msgs = new Map(state.msgs);
        msgs.set(ev.id, { ...msg, reactions });
        return { ...state, msgs };
      }
      case "pin":
        return state.msgs.has(ev.id) ? { ...state, pinned: ev.id } : state;
      case "unpin":
        return state.pinned === ev.id ? { ...state, pinned: null } : state;
      case "receipt": {
        const msg = state.msgs.get(ev.id);
        if (!msg) return state;
        const msgs = new Map(state.msgs);
        msgs.set(ev.id, { ...msg, receipt: ev.to });
        return { ...state, msgs };
      }
      case "read": {
        const uptoIdx = state.order.indexOf(ev.upTo);
        if (uptoIdx === -1) return state;
        const msgs = new Map(state.msgs);
        for (let i = 0; i <= uptoIdx; i++) {
          const msg = msgs.get(state.order[i]);
          if (msg && msg.receipt !== "read" && msg.receipt !== "failed") {
            msgs.set(msg.id, { ...msg, receipt: "read" });
          }
        }
        return { ...state, msgs };
      }
      case "views": {
        const msg = state.msgs.get(ev.id);
        if (!msg) return state;
        const msgs = new Map(state.msgs);
        msgs.set(ev.id, { ...msg, views: ev.n });
        return { ...state, msgs };
      }
      default:
        return state;
    }
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
  var CHECKPOINT_INTERVAL = 64;
  function stepToEv(step, id) {
    switch (step.k) {
      case "post":
        return { k: "post", id, step };
      case "draft":
        return { k: "draft", by: step.by, chars: step.chars };
      case "flag":
        return { k: "flag", key: step.key, value: step.value };
      case "edit":
        return { k: "edit", id: step.id, v: step.v };
      case "delete":
        return { k: "delete", id: step.id, scope: step.scope };
      case "react":
        return { k: "react", id: step.id, emoji: step.emoji, by: step.by, remove: step.remove };
      case "pin":
      case "unpin":
        return { k: step.k, id: step.id };
      case "receipt":
        return { k: "receipt", id: step.id, to: step.to };
      case "read":
        return { k: "read", upTo: step.upTo };
      case "views":
        return { k: "views", id: step.id, n: step.n };
    }
  }
  function compile(script, o) {
    const frames = [];
    let clock = 0;
    let nextMsgId = 0;
    script.forEach((step, stepIdx) => {
      const jitter = Math.floor(rand(o.seed, stepIdx, 0) * JITTER_MS_MAX);
      clock += (step.delayMs ?? 0) + jitter;
      const id = step.k === "post" ? `m${nextMsgId++}` : "";
      frames.push({ t: clock, ev: stepToEv(step, id) });
    });
    const keys = Int32Array.from(frames.map((f) => f.t));
    const duration = frames.length > 0 ? frames[frames.length - 1].t : 0;
    const digest = digestOf(
      JSON.stringify({ script, seed: o.seed, channel: o.channel, locale: o.locale, tz: o.tz })
    );
    const checkpoints = [initialState()];
    let state = checkpoints[0];
    for (let idx = 0; idx < frames.length; idx++) {
      state = applyEvent(state, frames[idx].ev);
      if ((idx + 1) % CHECKPOINT_INTERVAL === 0) checkpoints.push(state);
    }
    return {
      t0: o.t0,
      frames,
      keys,
      checkpoints,
      duration,
      digest
    };
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
  function foldFromCheckpoint(tl, upto) {
    const checkpointIdx = Math.floor(upto / CHECKPOINT_INTERVAL);
    const from = checkpointIdx * CHECKPOINT_INTERVAL;
    let state = tl.checkpoints[checkpointIdx];
    let foldSteps = 0;
    for (let i = from; i < upto; i++) {
      state = applyEvent(state, tl.frames[i].ev);
      foldSteps++;
    }
    return { state, foldSteps };
  }
  function seekTraced(tl, t) {
    return foldFromCheckpoint(tl, upperBound(tl.keys, t));
  }
  function seek(tl, t) {
    return seekTraced(tl, t).state;
  }
  function stateAtStep(tl, step) {
    const upto = Math.max(0, Math.min(step, tl.frames.length));
    return foldFromCheckpoint(tl, upto).state;
  }

  // src/components/chat-sim/core/playhead.ts
  function createPlayhead(tl) {
    let playing = false;
    let playRate = 1;
    let virtualT = 0;
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

  // src/components/chat-sim/core/draft-intervals.ts
  function draftIntervals(tl) {
    const out = [];
    let state = initialState();
    let openSince = null;
    let openBy = "";
    let openAfter = null;
    let lastMsgId = null;
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
        out.push({ by: openBy, appearStep: openSince, vanishStep: step, afterMsgId: openAfter });
        openSince = null;
      }
      if (ev.k === "post") lastMsgId = ev.id;
    }
    if (openSince !== null) {
      out.push({ by: openBy, appearStep: openSince, vanishStep: tl.frames.length, afterMsgId: openAfter });
    }
    return out;
  }

  // src/components/chat-sim/adapters/caps.ts
  var VARIATION_SELECTOR_16 = "\uFE0F";
  function normalizeReactionEmoji(emoji) {
    return (emoji ?? "").replaceAll(VARIATION_SELECTOR_16, "");
  }
  var TELEGRAM_REACTIONS_RAW = [
    "\u2764",
    "\u{1F44D}",
    "\u{1F44E}",
    "\u{1F525}",
    "\u{1F970}",
    "\u{1F44F}",
    "\u{1F601}",
    "\u{1F914}",
    "\u{1F92F}",
    "\u{1F631}",
    "\u{1F92C}",
    "\u{1F622}",
    "\u{1F389}",
    "\u{1F929}",
    "\u{1F92E}",
    "\u{1F4A9}",
    "\u{1F64F}",
    "\u{1F44C}",
    "\u{1F54A}",
    "\u{1F921}",
    "\u{1F971}",
    "\u{1F974}",
    "\u{1F60D}",
    "\u{1F433}",
    "\u2764\u200D\u{1F525}",
    "\u{1F31A}",
    "\u{1F32D}",
    "\u{1F4AF}",
    "\u{1F923}",
    "\u26A1",
    "\u{1F34C}",
    "\u{1F3C6}",
    "\u{1F494}",
    "\u{1F928}",
    "\u{1F610}",
    "\u{1F353}",
    "\u{1F37E}",
    "\u{1F48B}",
    "\u{1F595}",
    "\u{1F608}",
    "\u{1F634}",
    "\u{1F62D}",
    "\u{1F913}",
    "\u{1F47B}",
    "\u{1F468}\u200D\u{1F4BB}",
    "\u{1F440}",
    "\u{1F383}",
    "\u{1F648}",
    "\u{1F607}",
    "\u{1F628}",
    "\u{1F91D}",
    "\u270D",
    "\u{1F917}",
    "\u{1FAE1}",
    "\u{1F385}",
    "\u{1F384}",
    "\u2603",
    "\u{1F485}",
    "\u{1F92A}",
    "\u{1F5FF}",
    "\u{1F192}",
    "\u{1F498}",
    "\u{1F649}",
    "\u{1F984}",
    "\u{1F618}",
    "\u{1F48A}",
    "\u{1F64A}",
    "\u{1F60E}",
    "\u{1F47E}",
    "\u{1F937}\u200D\u2642",
    "\u{1F937}",
    "\u{1F937}\u200D\u2640",
    "\u{1F621}"
  ];
  var TELEGRAM_REACTIONS = new Set(
    TELEGRAM_REACTIONS_RAW.map(normalizeReactionEmoji)
  );

  // src/components/chat-sim/adapters/telegram.ts
  var telegram = {
    tail: "last",
    wallpaper: "pattern",
    reactions: "own-row",
    reactionConstraint: {
      emoji: "allowlist",
      allowlistSize: TELEGRAM_REACTIONS.size,
      maxAgeDays: 0,
      canTargetReaction: false,
      canTargetOutbound: true,
      maxPerMessage: 0
    },
    groupKey: "actor",
    deliveryStates: ["queued", "sent", "read", "failed"],
    // Real Telegram 1:1/group: color is constant, the GLYPH flips at `read` — the inverse twin of
    // WhatsApp (telegram-fidelity-fix.md §F-2). `delivered` is unreachable (not in deliveryStates
    // above) but `states` is a total map over DeliveryState (cero opcionales, core/types.ts) — it
    // mirrors `sent`, same convention core/__tests__/receipt-model.test.ts already fixtures.
    receipt: {
      kind: "ticks",
      states: {
        queued: { glyph: "\u{1F550}", color: "var(--cf-cs-bubble-out-meta)" },
        sent: { glyph: "\u2713", color: "var(--cf-cs-bubble-out-meta)" },
        delivered: { glyph: "\u2713", color: "var(--cf-cs-bubble-out-meta)" },
        // unreachable, mirrors sent
        read: { glyph: "\u2713\u2713", color: "var(--cf-cs-bubble-out-meta)" },
        // glyph flips, color doesn't
        // Not in telegram-fidelity-fix.md (out of scope for the F-2 fix) — standard failed-send
        // red, unconfirmed byte-exact against a real Telegram capture.
        failed: { glyph: "!", color: "#e53935" }
      },
      placement: "in-bubble",
      scope: "every"
    },
    counter: "none",
    timestamp: "inside-plain",
    quote: "thin-bar",
    bubbleTransport: "per-conversation",
    senderKinds: ["human", "ai", "bot", "forwarded", "channel"],
    keyboard: "inline-in-message",
    album: "grid-in-one-bubble",
    e2eNotice: false,
    avatarSide: "inbound"
  };

  // src/components/chat-sim/adapters/whatsapp.ts
  var whatsapp = {
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
    // Real WhatsApp: glyph is constant across queued->sent->delivered->read (clock, then 1 tick,
    // then 2 ticks that STAY 2 ticks) — only the COLOR flips at `read` (telegram-fidelity-fix.md
    // §F-2). `#53bdeb` is the same literal styles.css already hardcodes at `.cf-receipt[data-read]`
    // (T-011 escalation E-002) — sourcing it from here retires that selector, doesn't reinvent it.
    receipt: {
      kind: "ticks",
      states: {
        queued: { glyph: "\u{1F550}", color: "var(--cf-cs-bubble-out-meta)" },
        sent: { glyph: "\u2713", color: "var(--cf-cs-bubble-out-meta)" },
        delivered: { glyph: "\u2713\u2713", color: "var(--cf-cs-bubble-out-meta)" },
        read: { glyph: "\u2713\u2713", color: "#53bdeb" },
        // color flips, glyph doesn't
        // Not in telegram-fidelity-fix.md (out of scope for the F-2 fix) — standard failed-send
        // red, unconfirmed byte-exact against a real WhatsApp capture.
        failed: { glyph: "!", color: "#e53935" }
      },
      placement: "in-bubble",
      scope: "every"
    },
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

  // src/components/chat-sim/adapters/registry.ts
  var ADAPTERS = {
    whatsapp,
    telegram
  };
  function getAdapter(channel) {
    const adapter = ADAPTERS[channel];
    if (!adapter) {
      throw new Error(
        `chat-sim: no adapter registered for channel '${channel}' \u2014 out of scope this cycle (architecture-v1.md \xA710, "Adapter iMessage completo").`
      );
    }
    return adapter;
  }

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
  function buildTickSvg(ticks, color) {
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
    svg.style.color = color;
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
  function buildReceiptGlyph(msg, adapter, flags) {
    const { kind, states, scope } = adapter.receipt;
    if (kind === "none" || kind === "metric") return null;
    if (scope === "last-only" && !flags.tailHere) return null;
    const style = states[msg.receipt];
    const tickCount = (style.glyph.match(/✓/gu) ?? []).length;
    if (kind === "ticks" && tickCount > 0) {
      return buildTickSvg(Math.min(tickCount, 2), style.color);
    }
    const el = document.createElement("span");
    el.className = kind === "text" ? "cf-receipt-label" : "cf-receipt";
    el.style.color = style.color;
    el.textContent = style.glyph;
    return el;
  }
  function buildStamp(msg, adapter) {
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
    const stamp = buildStamp(msg, adapter);
    const receiptEl = dir === "out" ? buildReceiptGlyph(msg, adapter, flags) : null;
    if (receiptEl && adapter.receipt.placement === "in-bubble") stamp.appendChild(receiptEl);
    if (adapter.timestamp === "inside-pad") {
      const pad = document.createElement("span");
      pad.className = "cf-pad";
      bubble.append(pad, stamp);
    } else if (adapter.timestamp === "inside-plain") {
      bubble.appendChild(stamp);
    }
    let belowBubbleReceipt = null;
    if (receiptEl && adapter.receipt.placement === "below-bubble") {
      belowBubbleReceipt = document.createElement("span");
      belowBubbleReceipt.className = "cf-receipt-below";
      belowBubbleReceipt.appendChild(receiptEl);
    }
    if (msg.reactions.length > 0) {
      const reactionsEl = buildReactions(msg.reactions, adapter.reactions);
      if (adapter.reactions === "own-row") {
        li.append(bubble);
        if (adapter.timestamp === "gutter") li.appendChild(stamp);
        if (belowBubbleReceipt) li.appendChild(belowBubbleReceipt);
        li.appendChild(reactionsEl);
        return;
      }
      reactionsEl.dataset.style = adapter.reactions;
      bubble.appendChild(reactionsEl);
    }
    li.appendChild(bubble);
    if (adapter.timestamp === "gutter") li.appendChild(stamp);
    if (belowBubbleReceipt) li.appendChild(belowBubbleReceipt);
  }
  function buildMessageElement(msg, adapter, flags) {
    const li = document.createElement("li");
    populateMessageElement(li, msg, adapter, flags);
    return li;
  }

  // src/components/chat-sim/element/chat-sim-element.ts
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
  function dayKeyOf(t0Epoch, tick, tz) {
    return new Intl.DateTimeFormat("en-CA", { timeZone: tz }).format(new Date(t0Epoch + tick));
  }
  function dayLabelOf(t0Epoch, tick, locale, tz) {
    return new Intl.DateTimeFormat(locale, { day: "numeric", month: "long", timeZone: tz }).format(
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
  var _timeline, _postedAt, _msgEls, _log, _typingRows, _dateSeps, _playhead, _adapter, _lastStep, _CfChatSimElement_instances, buildHead_fn, buildComposer_fn, readScript_fn, applyStep_fn, measurePad_fn, reconcile_fn, applyBottomAnchor_fn;
  var CfChatSimElement = class extends HTMLElement {
    constructor() {
      super(...arguments);
      __privateAdd(this, _CfChatSimElement_instances);
      __privateAdd(this, _timeline, null);
      __privateAdd(this, _postedAt, /* @__PURE__ */ new Map());
      __privateAdd(this, _msgEls, /* @__PURE__ */ new Map());
      __privateAdd(this, _log, null);
      __privateAdd(this, _typingRows, []);
      __privateAdd(this, _dateSeps, []);
      __privateAdd(this, _playhead, null);
      /** Bug found by `app`, confirmed reading this file (T-002 iteration 5): this used to be a fixed
       * `WHATSAPP_REFERENCE_ADAPTER` fixture, and the `channel` attribute only ever fed `compile()` —
       * nothing ever called `getAdapter(channel)`, so `<cf-chat-sim channel="telegram">` silently
       * rendered WhatsApp chrome. Not this lane's fault at the time: T-005's registry didn't exist yet
       * when this was written (see the fixture's own now-removed "once it lands" comment) — it landed
       * and nobody closed the loop. `connectedCallback` overwrites this with the real adapter before
       * anything gets built; the default here only matters for the instant before that runs. */
      __privateAdd(this, _adapter, getAdapter("whatsapp"));
      /** Guards against redoing any work when `data-step` is set to the value it already holds — the
       * root cause of the animation bug (team-lead, iteration 3): the playhead writes this attribute
       * on EVERY rAF tick (~60/s), and most ticks land between script steps, so without this guard
       * every visible node got repopulated/reinserted dozens of times per script step for no reason. */
      __privateAdd(this, _lastStep, null);
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
      __privateSet(this, _lastStep, null);
      if (__privateGet(this, _timeline)) __privateMethod(this, _CfChatSimElement_instances, applyStep_fn).call(this, Number(this.dataset.step ?? __privateGet(this, _timeline).frames.length));
    }
    connectedCallback() {
      this.classList.add("cf-chat-sim");
      if (!this.hasAttribute("role")) this.setAttribute("role", "log");
      const script = __privateMethod(this, _CfChatSimElement_instances, readScript_fn).call(this);
      const channel = this.getAttribute("channel") || "whatsapp";
      const seed = Number(this.getAttribute("seed") ?? "1");
      const locale = this.getAttribute("locale") || "es-PE";
      const tz = this.getAttribute("tz") || "America/Lima";
      const t0 = Number(this.getAttribute("t0") ?? String(Date.UTC(2026, 0, 1, 9, 0, 0)));
      __privateSet(this, _adapter, getAdapter(channel));
      this.dataset.wallpaper = __privateGet(this, _adapter).wallpaper;
      this.dataset.channel = channel;
      __privateSet(this, _timeline, compile(script, { seed, channel, locale, tz, t0 }));
      __privateSet(this, _postedAt, postedAtByMsgId(__privateGet(this, _timeline).frames));
      this.textContent = "";
      this.appendChild(__privateMethod(this, _CfChatSimElement_instances, buildHead_fn).call(this));
      __privateSet(this, _log, document.createElement("ol"));
      __privateGet(this, _log).className = "cf-log";
      this.appendChild(__privateGet(this, _log));
      const finalState = stateAtStep(__privateGet(this, _timeline), __privateGet(this, _timeline).frames.length);
      finalState.order.forEach((id) => {
        const li = document.createElement("li");
        li.className = "cf-msg";
        li.hidden = true;
        __privateGet(this, _msgEls).set(id, li);
        __privateGet(this, _log).appendChild(li);
      });
      let lastDayKey = null;
      finalState.order.forEach((id) => {
        const tick = __privateGet(this, _postedAt).get(id) ?? 0;
        const dayKey = dayKeyOf(t0, tick, tz);
        if (dayKey === lastDayKey) return;
        lastDayKey = dayKey;
        const sep = document.createElement("li");
        sep.className = "cf-date-sep";
        sep.hidden = true;
        sep.innerHTML = `<span class="cf-date-pill">${dayLabelOf(t0, tick, locale, tz)}</span>`;
        __privateGet(this, _log).insertBefore(sep, __privateGet(this, _msgEls).get(id));
        __privateGet(this, _dateSeps).push({ triggerId: id, li: sep });
      });
      __privateSet(this, _typingRows, draftIntervals(__privateGet(this, _timeline)).map((interval) => {
        const li = document.createElement("li");
        li.className = "cf-typing-row";
        li.dataset.dir = actorDir(interval.by);
        li.hidden = true;
        li.innerHTML = '<span class="cf-bubble cf-typing"><i></i><i></i><i></i></span>';
        const anchorIdx = interval.afterMsgId ? finalState.order.indexOf(interval.afterMsgId) + 1 : 0;
        const anchor = anchorIdx < finalState.order.length ? __privateGet(this, _msgEls).get(finalState.order[anchorIdx]) : null;
        __privateGet(this, _log).insertBefore(li, anchor);
        return { interval, li };
      }));
      this.appendChild(__privateMethod(this, _CfChatSimElement_instances, buildComposer_fn).call(this, channel));
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
  _typingRows = new WeakMap();
  _dateSeps = new WeakMap();
  _playhead = new WeakMap();
  _adapter = new WeakMap();
  _lastStep = new WeakMap();
  _CfChatSimElement_instances = new WeakSet();
  /** Header — ChatDemo.astro precedent (`.chat-head`: avatar + name + meta). Visual-only, driven
   * by attributes so any consumer can set it; falls back to a channel-neutral default rather than
   * hardcoding a business name into a shared component. */
  buildHead_fn = function() {
    const name = this.getAttribute("contact-name") || "Chat";
    const status = this.getAttribute("contact-status") || "";
    const head = document.createElement("header");
    head.className = "cf-head";
    const avatar = document.createElement("span");
    avatar.className = "cf-avatar";
    avatar.textContent = name.charAt(0).toUpperCase();
    head.appendChild(avatar);
    const who = document.createElement("span");
    who.className = "cf-who";
    const nameEl = document.createElement("b");
    nameEl.textContent = name;
    who.appendChild(nameEl);
    if (status) {
      const statusEl = document.createElement("em");
      statusEl.textContent = status;
      who.appendChild(statusEl);
    }
    head.appendChild(who);
    return head;
  };
  /** Composer — always shown (visual-only for this wave; a real, operable composer with mobile
   * keyboard handling is react/'s T-007). Its absence read as "broken" rather than "conversation
   * ended" in review — this closes that gap without claiming interactivity it doesn't have.
   * Icon order is brand identity, not adapter structure (T-013 fidelity fix, §"Composer"):
   * Telegram puts 📎 on the LEFT with 😊 + send on the RIGHT; WhatsApp inverts that (😊 left,
   * send right, no clip). */
  buildComposer_fn = function(channel) {
    const bar = document.createElement("div");
    bar.className = "cf-composer";
    bar.innerHTML = channel === "telegram" ? '<span class="cf-composer-icon" aria-hidden="true">\u{1F4CE}</span><span class="cf-composer-input" aria-hidden="true">Mensaje</span><span class="cf-composer-icon" aria-hidden="true">\u{1F60A}</span><span class="cf-composer-icon cf-composer-send" aria-hidden="true">\u27A4</span>' : '<span class="cf-composer-icon" aria-hidden="true">\u{1F60A}</span><span class="cf-composer-input" aria-hidden="true">Mensaje</span><span class="cf-composer-icon cf-composer-send" aria-hidden="true">\u27A4</span>';
    return bar;
  };
  readScript_fn = function() {
    const inline = this.querySelector('script[type="application/json"]');
    const raw = inline?.textContent ?? this.getAttribute("script");
    if (!raw) throw new Error("cf-chat-sim: no script provided (attribute or inline JSON child)");
    return JSON.parse(raw);
  };
  applyStep_fn = function(step) {
    if (!__privateGet(this, _timeline) || !__privateGet(this, _log)) return;
    if (step === __privateGet(this, _lastStep)) return;
    __privateSet(this, _lastStep, step);
    const state = stateAtStep(__privateGet(this, _timeline), step);
    __privateMethod(this, _CfChatSimElement_instances, reconcile_fn).call(this, state, step);
  };
  /** ChatDemo.astro's exact trick (`s.offsetWidth + 10`, global.css's `measure()`): `--cf-cs-pad`
   * (styles.css) is a static FALLBACK only — a stamp with a receipt glyph is measurably wider
   * than one without (measured live: 50px vs 31px), so one static reservation either overlaps
   * the wider ones or over-gaps the narrower ones. Re-measured per message, per step, since
   * content driving stamp width (receipt glyph, views counter) can change between steps. Only
   * meaningful for `timestamp: 'inside-pad'` — the other two placements don't use `.cf-pad`. */
  measurePad_fn = function(li) {
    if (__privateGet(this, _adapter).timestamp !== "inside-pad") return;
    const bubble = li.querySelector(".cf-bubble");
    const stamp = li.querySelector(".cf-stamp");
    if (!bubble || !stamp) return;
    bubble.style.setProperty("--cf-cs-pad", `${stamp.offsetWidth + 10}px`);
  };
  /** Pre-render contract: every MsgId's <li> already exists (built in connectedCallback from the
   * final state) — this only repopulates content for currently-visible messages and flips
   * `hidden`. It never creates, removes, or reorders nodes. */
  reconcile_fn = function(state, step) {
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
      __privateMethod(this, _CfChatSimElement_instances, measurePad_fn).call(this, li);
    });
    __privateGet(this, _msgEls).forEach((li, id) => {
      if (!visibleIds.has(id)) li.hidden = true;
    });
    __privateGet(this, _dateSeps).forEach((sep) => {
      sep.li.hidden = !visibleIds.has(sep.triggerId);
    });
    if (state.draft) this.setAttribute("data-drafting", state.draft.by);
    else this.removeAttribute("data-drafting");
    __privateGet(this, _typingRows).forEach((row) => {
      row.li.hidden = !(step >= row.interval.appearStep && step < row.interval.vanishStep);
    });
    __privateMethod(this, _CfChatSimElement_instances, applyBottomAnchor_fn).call(this);
  };
  /** Team-lead, iteration 3: measured 41% of the log's height sitting empty at the BOTTOM (216px
   * of 522px) — a short thread should hug the composer and grow upward, not float at the top.
   * `.cf-anchor-top` (styles.css) only ever lives on the first VISIBLE child at any moment; date
   * separators (below) and typing rows are ordinary flex items too, so whichever of the three
   * kinds happens to be first-and-visible gets it. */
  applyBottomAnchor_fn = function() {
    if (!__privateGet(this, _log)) return;
    const prev = __privateGet(this, _log).querySelector(".cf-anchor-top");
    if (prev) prev.classList.remove("cf-anchor-top");
    const firstVisible = [...__privateGet(this, _log).children].find((el) => !el.hidden);
    firstVisible?.classList.add("cf-anchor-top");
  };
  __publicField(CfChatSimElement, "observedAttributes", ["data-step"]);
  customElements.define("cf-chat-sim", CfChatSimElement);

  // src/components/chat-sim/element/fixtures.ts
  var DOUBLE_TICK_RECEIPT = {
    kind: "ticks",
    states: {
      queued: { glyph: "\u{1F550}", color: "var(--cf-cs-bubble-out-meta)" },
      sent: { glyph: "\u2713", color: "var(--cf-cs-bubble-out-meta)" },
      delivered: { glyph: "\u2713\u2713", color: "var(--cf-cs-bubble-out-meta)" },
      read: { glyph: "\u2713\u2713", color: "#53bdeb" },
      failed: { glyph: "!", color: "#e34a4a" }
    },
    placement: "in-bubble",
    scope: "every"
  };
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
    receipt: DOUBLE_TICK_RECEIPT,
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
  var SINGLE_TICK_RECEIPT = {
    ...DOUBLE_TICK_RECEIPT,
    states: {
      ...DOUBLE_TICK_RECEIPT.states,
      delivered: { glyph: "\u2713", color: DOUBLE_TICK_RECEIPT.states.sent.color },
      read: { glyph: "\u2713", color: DOUBLE_TICK_RECEIPT.states.sent.color }
    }
  };
  var CAPS_FIXTURE_INVERTED_ADAPTER = {
    ...WHATSAPP_REFERENCE_ADAPTER,
    tail: "last",
    receipt: SINGLE_TICK_RECEIPT,
    timestamp: "inside-plain",
    reactions: "own-row"
  };
  return __toCommonJS(index_exports);
})();
