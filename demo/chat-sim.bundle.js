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
          at: authored.k === "post" ? authored.at : void 0,
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
        queued: { glyph: "clock", color: "var(--cf-cs-bubble-out-meta)" },
        sent: { glyph: "check", color: "var(--cf-cs-bubble-out-meta)" },
        delivered: { glyph: "check", color: "var(--cf-cs-bubble-out-meta)" },
        // unreachable, mirrors sent
        read: { glyph: "double-check", color: "var(--cf-cs-bubble-out-meta)" },
        // glyph flips, color doesn't
        // Not in telegram-fidelity-fix.md (out of scope for the F-2 fix) — standard failed-send
        // red, unconfirmed byte-exact against a real Telegram capture.
        failed: { glyph: "alert", color: "#e53935" }
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
    avatarSide: "inbound",
    // T-028: Telegram bots attach an inline keyboard TO the message (`keyboard:
    // 'inline-in-message'` above) — the same interactive-buttons capability as WhatsApp, just its
    // own chrome; render.ts reads `adapter.keyboard` for that, never a channel branch. `list` is
    // deliberately ABSENT: the Bot API has no separate "list message" primitive the way WhatsApp
    // does — a list is just more inline-keyboard rows, i.e. still `buttons`. Declaring it here
    // would be the exact invented-primitive mistake T-028 exists to undo, one file over.
    capabilities: {
      buttons: null
    }
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
    // §F-2). `#53bdeb` was the same literal styles.css hardcoded at `.cf-receipt[data-read]`
    // (T-011 escalation E-002); both now resolve through `--channel-whatsapp-read` instead (T-028
    // follow-up, team-lead/skin) so a `branded` chrome consumer can retint the read-tick color —
    // the fallback keeps stock WhatsApp fidelity when nobody overrides the var.
    receipt: {
      kind: "ticks",
      states: {
        queued: { glyph: "clock", color: "var(--cf-cs-bubble-out-meta)" },
        sent: { glyph: "check", color: "var(--cf-cs-bubble-out-meta)" },
        delivered: { glyph: "double-check", color: "var(--cf-cs-bubble-out-meta)" },
        // `read` is the only one of the four that needs a brand override slot: the other three
        // already resolve `var(--cf-cs-bubble-out-meta)` through real CSSOM (icons.ts sets
        // `el.style.color = color`, not an inert SVG attribute), so a `branded` chrome consumer
        // can already retint them; `read`'s literal couldn't. `skin` owns the
        // `[data-chrome='branded']` override for this var.
        read: { glyph: "double-check", color: "var(--channel-whatsapp-read, #53bdeb)" },
        // color flips, glyph doesn't
        // Not in telegram-fidelity-fix.md (out of scope for the F-2 fix) — standard failed-send
        // red, unconfirmed byte-exact against a real WhatsApp capture.
        failed: { glyph: "alert", color: "#e53935" }
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
    avatarSide: "inbound",
    // T-028: WhatsApp Business's `interactive.type: "buttons"|"list"` — each its own native
    // message type with its own chrome (reply-buttons, and a scrollable list opened via a button).
    // Both supported, nothing to constrain yet (inbox-ai capabilities.py/registry.py's model).
    capabilities: {
      buttons: null,
      list: null
    }
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

  // src/components/chat-sim/element/icons.ts
  var SVG_NS = "http://www.w3.org/2000/svg";
  function svg(viewBox, width, height, strokeWidth) {
    const el = document.createElementNS(SVG_NS, "svg");
    el.setAttribute("viewBox", viewBox);
    el.setAttribute("width", String(width));
    el.setAttribute("height", String(height));
    el.setAttribute("fill", "none");
    el.setAttribute("stroke", "currentColor");
    el.setAttribute("stroke-width", strokeWidth);
    el.setAttribute("stroke-linecap", "round");
    el.setAttribute("stroke-linejoin", "round");
    return el;
  }
  function addPath(el, d) {
    const p = document.createElementNS(SVG_NS, "path");
    p.setAttribute("d", d);
    el.appendChild(p);
  }
  function addDot(el, cx, cy, r) {
    const c = document.createElementNS(SVG_NS, "circle");
    c.setAttribute("cx", String(cx));
    c.setAttribute("cy", String(cy));
    c.setAttribute("r", String(r));
    c.setAttribute("fill", "currentColor");
    c.setAttribute("stroke", "none");
    el.appendChild(c);
  }
  function addRing(el, cx, cy, r) {
    const c = document.createElementNS(SVG_NS, "circle");
    c.setAttribute("cx", String(cx));
    c.setAttribute("cy", String(cy));
    c.setAttribute("r", String(r));
    el.appendChild(c);
  }
  function tickIcon(ticks, color) {
    const el = svg("0 0 18 12", 15, 10, "1.7");
    el.classList.add("cf-receipt");
    el.setAttribute("aria-hidden", "true");
    el.style.color = color;
    addPath(el, ticks === 2 ? "M1 6.7 4.1 9.8 10.2 2.4" : "M4.5 6.7 7.6 9.8 13.7 2.4");
    if (ticks === 2) addPath(el, "M7.6 6.7 10.7 9.8 16.8 2.4");
    return el;
  }
  function clockIcon(color) {
    const el = svg("0 0 14 14", 12, 12, "1.3");
    el.classList.add("cf-receipt");
    el.setAttribute("aria-hidden", "true");
    el.style.color = color;
    addRing(el, 7, 7, 5.8);
    addPath(el, "M7 3.8V7l2.6 1.5");
    return el;
  }
  function alertIcon(color) {
    const el = svg("0 0 14 14", 12, 12, "1.3");
    el.classList.add("cf-receipt");
    el.setAttribute("aria-hidden", "true");
    el.style.color = color;
    addRing(el, 7, 7, 5.8);
    addPath(el, "M7 4.2V8");
    addDot(el, 7, 10.4, 0.75);
    return el;
  }
  function eyeIcon() {
    const el = svg("0 0 16 16", 13, 13, "1.3");
    addPath(el, "M1 8s2.8-5 7-5 7 5 7 5-2.8 5-7 5-7-5-7-5z");
    addRing(el, 8, 8, 1.7);
    return el;
  }
  function clipIcon() {
    const el = svg("0 0 24 24", 15, 15, "2");
    addPath(
      el,
      "M20.5 12.5 12 21a5.5 5.5 0 0 1-7.8-7.8l8.5-8.5a3.5 3.5 0 1 1 5 5L9.2 18.2a1.5 1.5 0 0 1-2.1-2.1l7.4-7.4"
    );
    return el;
  }
  function emojiIcon() {
    const el = svg("0 0 24 24", 15, 15, "2");
    addRing(el, 12, 12, 9.5);
    addPath(el, "M8 14.5s1.6 2 4 2 4-2 4-2");
    addDot(el, 9, 9.5, 0.9);
    addDot(el, 15, 9.5, 0.9);
    return el;
  }
  function micIcon() {
    const el = svg("0 0 24 24", 14, 14, "2");
    addPath(el, "M12 1.5a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0v-7a3 3 0 0 0-3-3z");
    addPath(el, "M19 10.5v1.5a7 7 0 0 1-14 0v-1.5");
    addPath(el, "M12 19v3");
    addPath(el, "M8.5 22h7");
    return el;
  }

  // src/components/chat-sim/element/render.ts
  function isJsonRecord(v) {
    return !!v && typeof v === "object" && !Array.isArray(v);
  }
  function asServiceMedia(media) {
    if (!isJsonRecord(media) || media.kind !== "service") return null;
    const v = media.variant;
    const variant = v === "warn" || v === "success" ? v : "neutral";
    return { kind: "service", variant };
  }
  function asReplyFast(media) {
    return isJsonRecord(media) && media.replyFast === true;
  }
  function asLinkBubble(media) {
    return isJsonRecord(media) && media.link === true;
  }
  function populateServiceElement(li, msg, service) {
    li.className = "cf-msg cf-msg-service";
    delete li.dataset.dir;
    delete li.dataset.by;
    delete li.dataset.tail;
    delete li.dataset.grouped;
    li.dataset.variant = service.variant;
    li.setAttribute("aria-label", "Mensaje del sistema");
    const pill = document.createElement("span");
    pill.className = "cf-service-pill";
    pill.textContent = msg.text;
    li.appendChild(pill);
  }
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
  var TICK_ICONS = {
    clock: clockIcon,
    check: (color) => tickIcon(1, color),
    "double-check": (color) => tickIcon(2, color),
    alert: alertIcon
  };
  function buildReceiptGlyph(msg, adapter, flags) {
    const model = adapter.receipt;
    if (model.kind === "none" || model.kind === "metric") return null;
    if (model.scope === "last-only" && !flags.tailHere) return null;
    if (model.kind === "ticks") {
      const style2 = model.states[msg.receipt];
      return TICK_ICONS[style2.glyph](style2.color);
    }
    const style = model.states[msg.receipt];
    const el = document.createElement("span");
    el.className = "cf-receipt-label";
    el.style.color = style.color;
    el.textContent = style.glyph;
    return el;
  }
  function buildStamp(msg, adapter) {
    const stamp = document.createElement("span");
    stamp.className = "cf-stamp";
    if (msg.replyLabel) {
      const reply = document.createElement("em");
      reply.className = "cf-reply-in";
      reply.textContent = msg.replyLabel;
      stamp.appendChild(reply);
    }
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
      views.appendChild(eyeIcon());
      views.appendChild(document.createTextNode(String(msg.views)));
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
    const service = asServiceMedia(msg.media);
    if (service) {
      populateServiceElement(li, msg, service);
      return;
    }
    const dir = actorDir(msg.by);
    li.className = "cf-msg";
    li.setAttribute("aria-label", dir === "out" ? "Mensaje enviado" : "Mensaje recibido");
    li.dataset.dir = dir;
    li.dataset.by = msg.by;
    if (flags.tailHere) li.dataset.tail = "";
    else delete li.dataset.tail;
    if (flags.grouped) li.dataset.grouped = "";
    else delete li.dataset.grouped;
    const bubble = document.createElement("span");
    bubble.className = asLinkBubble(msg.media) ? "cf-bubble cf-bubble-link" : "cf-bubble";
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
  function toRenderMessage(msg, atLabel, editedLabel, replyLabel) {
    return {
      id: msg.id,
      by: msg.by,
      text: msg.text ?? "",
      atLabel,
      receipt: msg.receipt,
      views: msg.views,
      reactions: msg.reactions,
      editedLabel: msg.v > 0 ? editedLabel : void 0,
      // T-027: WHETHER is per-message (`media.replyFast`, script-authored), the TEXT is the
      // caller's `reply-label` attribute (#reconcile) — same split as editedLabel/edited-label.
      replyLabel: asReplyFast(msg.media) ? replyLabel : void 0,
      media: msg.media
    };
  }
  var _slides, _activeIndex, _frame, _tagEl, _tagIconEl, _tagLabelEl, _avatarEl, _nameEl, _statusEl, _badgeFlagKey, _badgeOnLabel, _badgeOffLabel, _badgeEl, _playhead, _fromPlayhead, _scrollRaf, _scrollCatchup, _loop, _loopPauseMs, _loopTimer, _adapter, _CfChatSimElement_instances, active_get, buildHead_fn, buildTag_fn, applyTagForActiveSlide_fn, applyContactForActiveSlide_fn, activateSlide_fn, buildComposer_fn, composerIcon_fn, onPlaybackComplete_fn, clearLoopTimer_fn, readScripts_fn, applyStep_fn, measurePad_fn, reconcile_fn, applyBottomAnchor_fn, applyScroll_fn, cancelScrollAnimation_fn;
  var CfChatSimElement = class extends HTMLElement {
    constructor() {
      super(...arguments);
      __privateAdd(this, _CfChatSimElement_instances);
      /** T-031 B — one entry per script; N===1 is the pre-existing single-script shape verbatim (same
       * fields that used to live directly on the instance, just addressed through `this.#active` now
       * — see that getter's own comment for why every existing single-script code path is unchanged
       * by this indirection). */
      __privateAdd(this, _slides, []);
      __privateAdd(this, _activeIndex, 0);
      /** T-031 A/D — the visual "phone frame" (head + logs + composer): fixed-height and the tag
       * pill (D) live OUTSIDE it, as siblings on the host, so an optional tag never eats into the
       * fixed pixel budget acceptance #1 asks for. `null` only for the instant before
       * `connectedCallback` runs. */
      __privateAdd(this, _frame, null);
      __privateAdd(this, _tagEl, null);
      __privateAdd(this, _tagIconEl, null);
      __privateAdd(this, _tagLabelEl, null);
      /** Head refs, same reason as the tag refs above: the header is built ONCE, and rotation
       * repaints its text instead of rebuilding it. Kept so `#applyContactForActiveSlide` can write
       * into them without re-querying the DOM on every slide change. */
      __privateAdd(this, _avatarEl, null);
      __privateAdd(this, _nameEl, null);
      __privateAdd(this, _statusEl, null);
      /** T-031 C — badge is a SLOT, not logic: `null` key means "consumer didn't ask for one", and
       * nothing renders. `#badgeFlagKey` names which `SimState.flags` key (core's existing `flag`
       * event, architecture-v1.md — T-001 already ships it) drives it; `#badgeEl` is only ever created
       * by `#buildHead` when the key is set. Mount-time-only, same as every other playback attribute
       * here (channel/seed/locale/tz/t0/loop). */
      __privateAdd(this, _badgeFlagKey, null);
      __privateAdd(this, _badgeOnLabel, "ON");
      __privateAdd(this, _badgeOffLabel, "OFF");
      __privateAdd(this, _badgeEl, null);
      __privateAdd(this, _playhead, null);
      /** T-027 A: true only while `dataset.step` is being written FROM `play()`'s own onFrame — i.e.
       * a playback tick, not an external scrub/seek. `#applyStep` reads it synchronously (custom
       * elements' `attributeChangedCallback` fires synchronously off the `dataset.step =` assignment
       * below, same turn) to decide animate-vs-jump for `#applyScroll`. Defaults false, so the
       * initial `connectedCallback` render and any manual `data-step` write (devtools, a consumer's
       * own scrub UI) are always an instant jump — "seek debe ser instantáneo" (acceptance #1). */
      __privateAdd(this, _fromPlayhead, false);
      __privateAdd(this, _scrollRaf, null);
      __privateAdd(this, _scrollCatchup, null);
      /** T-027 B: `<cf-chat-sim loop>` — read once in connectedCallback, immutable after (matches
       * every other playback attribute here: channel/seed/locale/tz/t0 are all mount-time-only). */
      __privateAdd(this, _loop, false);
      __privateAdd(this, _loopPauseMs, 1500);
      __privateAdd(this, _loopTimer, null);
      /** Bug found by `app`, confirmed reading this file (T-002 iteration 5): this used to be a fixed
       * `WHATSAPP_REFERENCE_ADAPTER` fixture, and the `channel` attribute only ever fed `compile()` —
       * nothing ever called `getAdapter(channel)`, so `<cf-chat-sim channel="telegram">` silently
       * rendered WhatsApp chrome. Not this lane's fault at the time: T-005's registry didn't exist yet
       * when this was written (see the fixture's own now-removed "once it lands" comment) — it landed
       * and nobody closed the loop. `connectedCallback` overwrites this with the real adapter before
       * anything gets built; the default here only matters for the instant before that runs. */
      __privateAdd(this, _adapter, getAdapter("whatsapp"));
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
      __privateGet(this, _slides).forEach((s) => {
        s.lastStep = null;
      });
      const active = __privateGet(this, _CfChatSimElement_instances, active_get);
      if (active) __privateMethod(this, _CfChatSimElement_instances, applyStep_fn).call(this, Number(this.dataset.step ?? active.timeline.frames.length));
    }
    connectedCallback() {
      this.classList.add("cf-chat-sim");
      if (!this.hasAttribute("role")) this.setAttribute("role", "group");
      const scripts = __privateMethod(this, _CfChatSimElement_instances, readScripts_fn).call(this);
      const channel = this.getAttribute("channel") || "whatsapp";
      const chromeAttr = this.getAttribute("chrome");
      const chrome = chromeAttr === "consistent" ? "consistent" : chromeAttr === "branded" ? "branded" : "fidelity";
      __privateSet(this, _loop, this.hasAttribute("loop"));
      __privateSet(this, _loopPauseMs, Number(this.getAttribute("loop-pause-ms") ?? "1500"));
      const seed = Number(this.getAttribute("seed") ?? "1");
      const locale = this.getAttribute("locale") || "es-PE";
      const tz = this.getAttribute("tz") || "America/Lima";
      const t0 = Number(this.getAttribute("t0") ?? String(Date.UTC(2026, 0, 1, 9, 0, 0)));
      __privateSet(this, _adapter, getAdapter(channel));
      this.dataset.wallpaper = __privateGet(this, _adapter).wallpaper;
      this.dataset.channel = channel;
      this.dataset.chrome = chrome;
      const heightAttr = this.getAttribute("height");
      if (heightAttr) {
        this.style.setProperty("--cf-cs-height", /^\d+$/.test(heightAttr) ? `${heightAttr}px` : heightAttr);
      }
      __privateSet(this, _badgeFlagKey, this.getAttribute("badge-flag"));
      __privateSet(this, _badgeOnLabel, this.getAttribute("badge-on-label") || "ON");
      __privateSet(this, _badgeOffLabel, this.getAttribute("badge-off-label") || "OFF");
      this.textContent = "";
      __privateSet(this, _tagEl, __privateMethod(this, _CfChatSimElement_instances, buildTag_fn).call(this));
      this.appendChild(__privateGet(this, _tagEl));
      __privateSet(this, _frame, document.createElement("div"));
      __privateGet(this, _frame).className = "cf-frame";
      this.appendChild(__privateGet(this, _frame));
      __privateGet(this, _frame).appendChild(
        __privateMethod(this, _CfChatSimElement_instances, buildHead_fn).call(this, scripts.some(({ scriptEl }) => scriptEl?.hasAttribute("data-contact-status")))
      );
      __privateSet(this, _slides, scripts.map(({ script, scriptEl }) => {
        const timeline = compile(script, { seed, channel, locale, tz, t0 });
        const postedAt = postedAtByMsgId(timeline.frames);
        const msgEls = /* @__PURE__ */ new Map();
        const dateSeps = [];
        const log = document.createElement("ol");
        log.className = "cf-log";
        log.hidden = true;
        const finalState = stateAtStep(timeline, timeline.frames.length);
        finalState.order.forEach((id) => {
          const li = document.createElement("li");
          li.className = "cf-msg";
          li.hidden = true;
          msgEls.set(id, li);
          log.appendChild(li);
        });
        let lastDayKey = null;
        finalState.order.forEach((id) => {
          const tick = postedAt.get(id) ?? 0;
          const dayKey = dayKeyOf(t0, tick, tz);
          if (dayKey === lastDayKey) return;
          lastDayKey = dayKey;
          const sep = document.createElement("li");
          sep.className = "cf-date-sep";
          sep.hidden = true;
          sep.innerHTML = `<span class="cf-date-pill">${dayLabelOf(t0, tick, locale, tz)}</span>`;
          log.insertBefore(sep, msgEls.get(id));
          dateSeps.push({ triggerId: id, li: sep });
        });
        const typingRows = draftIntervals(timeline).map((interval) => {
          const li = document.createElement("li");
          li.className = "cf-typing-row";
          li.dataset.dir = actorDir(interval.by);
          li.hidden = true;
          li.innerHTML = '<span class="cf-bubble cf-typing"><i></i><i></i><i></i></span>';
          const anchorIdx = interval.afterMsgId ? finalState.order.indexOf(interval.afterMsgId) + 1 : 0;
          const anchor = anchorIdx < finalState.order.length ? msgEls.get(finalState.order[anchorIdx]) : null;
          log.insertBefore(li, anchor);
          return { interval, li };
        });
        __privateGet(this, _frame).appendChild(log);
        return { scriptEl, timeline, postedAt, log, msgEls, typingRows, dateSeps, lastStep: null };
      }));
      __privateSet(this, _activeIndex, 0);
      __privateGet(this, _slides)[0].log.hidden = false;
      __privateMethod(this, _CfChatSimElement_instances, applyTagForActiveSlide_fn).call(this);
      __privateMethod(this, _CfChatSimElement_instances, applyContactForActiveSlide_fn).call(this);
      __privateGet(this, _frame).appendChild(__privateMethod(this, _CfChatSimElement_instances, buildComposer_fn).call(this, channel, chrome));
      const initialStep = this.hasAttribute("data-step") ? Number(this.getAttribute("data-step")) : __privateGet(this, _slides)[0].timeline.frames.length;
      this.dataset.step = String(initialStep);
      __privateMethod(this, _CfChatSimElement_instances, applyStep_fn).call(this, initialStep);
    }
    disconnectedCallback() {
      __privateGet(this, _playhead)?.pause();
      __privateMethod(this, _CfChatSimElement_instances, cancelScrollAnimation_fn).call(this);
      __privateMethod(this, _CfChatSimElement_instances, clearLoopTimer_fn).call(this);
    }
    attributeChangedCallback(name) {
      const active = __privateGet(this, _CfChatSimElement_instances, active_get);
      if (name === "data-step" && active) {
        __privateMethod(this, _CfChatSimElement_instances, applyStep_fn).call(this, Number(this.dataset.step ?? active.timeline.frames.length));
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
    play() {
      const active = __privateGet(this, _CfChatSimElement_instances, active_get);
      if (!active) throw new Error("cf-chat-sim: play() before connectedCallback");
      __privateGet(this, _playhead)?.pause();
      __privateMethod(this, _CfChatSimElement_instances, clearLoopTimer_fn).call(this);
      const tl = active.timeline;
      const ph = createPlayhead(tl);
      ph.onFrame((_state, t) => {
        let step = 0;
        while (step < tl.frames.length && tl.frames[step].t <= t) step++;
        __privateSet(this, _fromPlayhead, true);
        this.dataset.step = String(step);
        __privateSet(this, _fromPlayhead, false);
        if (t >= tl.duration) __privateMethod(this, _CfChatSimElement_instances, onPlaybackComplete_fn).call(this);
      });
      __privateSet(this, _playhead, ph);
      ph.play();
      return ph;
    }
  };
  _slides = new WeakMap();
  _activeIndex = new WeakMap();
  _frame = new WeakMap();
  _tagEl = new WeakMap();
  _tagIconEl = new WeakMap();
  _tagLabelEl = new WeakMap();
  _avatarEl = new WeakMap();
  _nameEl = new WeakMap();
  _statusEl = new WeakMap();
  _badgeFlagKey = new WeakMap();
  _badgeOnLabel = new WeakMap();
  _badgeOffLabel = new WeakMap();
  _badgeEl = new WeakMap();
  _playhead = new WeakMap();
  _fromPlayhead = new WeakMap();
  _scrollRaf = new WeakMap();
  _scrollCatchup = new WeakMap();
  _loop = new WeakMap();
  _loopPauseMs = new WeakMap();
  _loopTimer = new WeakMap();
  _adapter = new WeakMap();
  _CfChatSimElement_instances = new WeakSet();
  active_get = function() {
    return __privateGet(this, _slides)[__privateGet(this, _activeIndex)];
  };
  /** Header — ChatDemo.astro precedent (`.chat-head`: avatar + name + meta). Visual-only, driven
   * by attributes so any consumer can set it; falls back to a channel-neutral default rather than
   * hardcoding a business name into a shared component. */
  buildHead_fn = function(anySlideStatus) {
    const name = this.getAttribute("contact-name") || "Chat";
    const status = this.getAttribute("contact-status") || "";
    const head = document.createElement("header");
    head.className = "cf-head";
    const avatar = document.createElement("span");
    avatar.className = "cf-avatar";
    avatar.textContent = name.charAt(0).toUpperCase();
    head.appendChild(avatar);
    __privateSet(this, _avatarEl, avatar);
    const who = document.createElement("span");
    who.className = "cf-who";
    const nameEl = document.createElement("b");
    nameEl.textContent = name;
    who.appendChild(nameEl);
    __privateSet(this, _nameEl, nameEl);
    if (status || anySlideStatus) {
      const statusEl = document.createElement("em");
      statusEl.textContent = status;
      statusEl.hidden = !status;
      who.appendChild(statusEl);
      __privateSet(this, _statusEl, statusEl);
    }
    head.appendChild(who);
    if (__privateGet(this, _badgeFlagKey)) {
      const badge = document.createElement("span");
      badge.className = "cf-badge";
      head.appendChild(badge);
      __privateSet(this, _badgeEl, badge);
    }
    return head;
  };
  /** T-031 D — "encima del chat", cromo del CONSUMIDOR: an icon+label pill this element renders,
   * but whose content is never a literal here — `#applyTagForActiveSlide` is the only place that
   * ever sets `textContent` on `#tagIconEl`/`#tagLabelEl`, straight from attributes. Built once,
   * hidden by default; a mount with no `tag-icon`/`tag-label` anywhere (host or per-slide) never
   * shows it — same "opt-in slot" discipline as the badge above. */
  buildTag_fn = function() {
    const tag = document.createElement("div");
    tag.className = "cf-tag";
    tag.hidden = true;
    const icon = document.createElement("span");
    icon.className = "cf-tag-icon";
    icon.setAttribute("aria-hidden", "true");
    tag.appendChild(icon);
    const label = document.createElement("span");
    label.className = "cf-tag-label";
    tag.appendChild(label);
    __privateSet(this, _tagIconEl, icon);
    __privateSet(this, _tagLabelEl, label);
    return tag;
  };
  /** Reads the ACTIVE slide's own `<script data-tag-icon="…" data-tag-label="…">` first (T-031 B
   * rotation — production's real shape: each rubro carries its own tag), falling back to the
   * host-level `tag-icon`/`tag-label` attributes for the common single-script case. Neither source
   * is a literal owned by this file — both are the consumer's data, read verbatim. */
  applyTagForActiveSlide_fn = function() {
    if (!__privateGet(this, _tagEl) || !__privateGet(this, _tagIconEl) || !__privateGet(this, _tagLabelEl)) return;
    const slide = __privateGet(this, _CfChatSimElement_instances, active_get);
    const icon = slide?.scriptEl?.getAttribute("data-tag-icon") || this.getAttribute("tag-icon") || "";
    const label = slide?.scriptEl?.getAttribute("data-tag-label") || this.getAttribute("tag-label") || "";
    if (!icon && !label) {
      __privateGet(this, _tagEl).hidden = true;
      return;
    }
    __privateGet(this, _tagEl).hidden = false;
    __privateGet(this, _tagIconEl).hidden = !icon;
    __privateGet(this, _tagIconEl).textContent = icon;
    __privateGet(this, _tagLabelEl).textContent = label;
  };
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
  applyContactForActiveSlide_fn = function() {
    if (!__privateGet(this, _nameEl) || !__privateGet(this, _avatarEl)) return;
    const el = __privateGet(this, _CfChatSimElement_instances, active_get)?.scriptEl ?? null;
    const name = el?.getAttribute("data-contact-name") || this.getAttribute("contact-name") || "Chat";
    const status = el?.getAttribute("data-contact-status") || this.getAttribute("contact-status") || "";
    __privateGet(this, _nameEl).textContent = name;
    __privateGet(this, _avatarEl).textContent = name.charAt(0).toUpperCase();
    if (__privateGet(this, _statusEl)) {
      __privateGet(this, _statusEl).textContent = status;
      __privateGet(this, _statusEl).hidden = !status;
    }
  };
  /** T-031 B — advances rotation to slide `index`: hides the current slide's (already fully
   * built) log, shows the target's, and resets ITS `lastStep` guard so the next `#applyStep` does
   * a real reconcile even if `data-step` happens to already equal the value being written (the
   * step-unchanged guard's own reasoning, applied across a slide switch instead of across rAF
   * ticks). Never creates or removes a node — the gemelo (acceptance #2) this exists to satisfy. */
  activateSlide_fn = function(index) {
    const current = __privateGet(this, _CfChatSimElement_instances, active_get);
    if (current) current.log.hidden = true;
    __privateSet(this, _activeIndex, index);
    const next = __privateGet(this, _slides)[index];
    next.log.hidden = false;
    next.lastStep = null;
    __privateMethod(this, _CfChatSimElement_instances, applyTagForActiveSlide_fn).call(this);
    __privateMethod(this, _CfChatSimElement_instances, applyContactForActiveSlide_fn).call(this);
  };
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
  buildComposer_fn = function(channel, chrome) {
    const bar = document.createElement("div");
    bar.className = "cf-composer";
    const clip = __privateMethod(this, _CfChatSimElement_instances, composerIcon_fn).call(this, "clip", clipIcon());
    const emoji = __privateMethod(this, _CfChatSimElement_instances, composerIcon_fn).call(this, "emoji", emojiIcon());
    const mic = __privateMethod(this, _CfChatSimElement_instances, composerIcon_fn).call(this, "mic", micIcon(), "cf-composer-send");
    const input = document.createElement("span");
    input.className = "cf-composer-input";
    input.setAttribute("aria-hidden", "true");
    input.textContent = "Mensaje";
    const fidelityOrder = channel === "telegram" ? [clip, input, emoji, mic] : [emoji, input, mic, clip];
    bar.append(...chrome === "consistent" ? [clip, input, emoji, mic] : fidelityOrder);
    return bar;
  };
  composerIcon_fn = function(name, icon, extraClass) {
    const span = document.createElement("span");
    span.className = extraClass ? `cf-composer-icon ${extraClass}` : "cf-composer-icon";
    span.dataset.icon = name;
    span.setAttribute("aria-hidden", "true");
    span.appendChild(icon);
    return span;
  };
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
  onPlaybackComplete_fn = function() {
    if (!__privateGet(this, _loop)) return;
    __privateSet(this, _loopTimer, setTimeout(() => {
      __privateSet(this, _loopTimer, null);
      if (__privateGet(this, _slides).length > 1) {
        __privateMethod(this, _CfChatSimElement_instances, activateSlide_fn).call(this, (__privateGet(this, _activeIndex) + 1) % __privateGet(this, _slides).length);
      }
      this.play();
    }, __privateGet(this, _loopPauseMs)));
  };
  clearLoopTimer_fn = function() {
    if (__privateGet(this, _loopTimer) !== null) {
      clearTimeout(__privateGet(this, _loopTimer));
      __privateSet(this, _loopTimer, null);
    }
  };
  /** T-031 B — every `<script type="application/json">` child, in document order, is its own
   * rotation slide; the pre-existing single `script` ATTRIBUTE stays a single-slide fallback
   * (unchanged priority: inline children win when both are present, exactly like `#readScript`
   * did before this). `scriptEl` lets `#applyTagForActiveSlide` read a per-slide
   * `data-tag-icon`/`data-tag-label` override straight off the markup — `null` for the
   * attribute-sourced fallback, which has no element to read one from. */
  readScripts_fn = function() {
    const inlineScripts = [...this.querySelectorAll('script[type="application/json"]')];
    if (inlineScripts.length > 0) {
      return inlineScripts.map((scriptEl) => ({
        script: JSON.parse(scriptEl.textContent ?? "[]"),
        scriptEl
      }));
    }
    const raw = this.getAttribute("script");
    if (!raw) throw new Error("cf-chat-sim: no script provided (attribute or inline JSON child)");
    return [{ script: JSON.parse(raw), scriptEl: null }];
  };
  applyStep_fn = function(step) {
    const slide = __privateGet(this, _CfChatSimElement_instances, active_get);
    if (!slide) return;
    if (step === slide.lastStep) return;
    slide.lastStep = step;
    const animate = __privateGet(this, _fromPlayhead);
    const state = stateAtStep(slide.timeline, step);
    __privateMethod(this, _CfChatSimElement_instances, reconcile_fn).call(this, slide, state, step, animate);
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
  reconcile_fn = function(slide, state, step, animate) {
    const t0 = slide.timeline.t0;
    const locale = this.getAttribute("locale") || "es-PE";
    const tz = this.getAttribute("tz") || "America/Lima";
    const editedLabel = this.getAttribute("edited-label") || "Editado";
    const replyLabel = this.getAttribute("reply-label") || "Respondi\xF3 r\xE1pido";
    const visible = state.order.map((id) => state.msgs.get(id)).filter((m) => !!m && m.deleted === null).map((m) => {
      const tick = slide.postedAt.get(m.id) ?? 0;
      return toRenderMessage(m, m.at ?? formatTime(t0, tick, locale, tz), editedLabel, replyLabel);
    });
    const flags = computeGroupFlags(visible, __privateGet(this, _adapter).tail);
    const visibleIds = new Set(visible.map((m) => m.id));
    visible.forEach((rm) => {
      const li = slide.msgEls.get(rm.id);
      if (!li) return;
      populateMessageElement(li, rm, __privateGet(this, _adapter), flags.get(rm.id));
      li.hidden = false;
      __privateMethod(this, _CfChatSimElement_instances, measurePad_fn).call(this, li);
    });
    slide.msgEls.forEach((li, id) => {
      if (!visibleIds.has(id)) li.hidden = true;
    });
    slide.dateSeps.forEach((sep) => {
      sep.li.hidden = !visibleIds.has(sep.triggerId);
    });
    if (state.draft) this.setAttribute("data-drafting", state.draft.by);
    else this.removeAttribute("data-drafting");
    slide.typingRows.forEach((row) => {
      row.li.hidden = !(step >= row.interval.appearStep && step < row.interval.vanishStep);
    });
    if (__privateGet(this, _badgeFlagKey) && __privateGet(this, _badgeEl)) {
      const on = Boolean(state.flags[__privateGet(this, _badgeFlagKey)]);
      __privateGet(this, _badgeEl).textContent = on ? __privateGet(this, _badgeOnLabel) : __privateGet(this, _badgeOffLabel);
      __privateGet(this, _badgeEl).dataset.on = String(on);
    }
    __privateMethod(this, _CfChatSimElement_instances, applyBottomAnchor_fn).call(this, slide.log);
    __privateMethod(this, _CfChatSimElement_instances, applyScroll_fn).call(this, slide.log, state.scrollId, animate);
  };
  /** Team-lead, iteration 3: measured 41% of the log's height sitting empty at the BOTTOM (216px
   * of 522px) — a short thread should hug the composer and grow upward, not float at the top.
   * `.cf-anchor-top` (styles.css) only ever lives on the first VISIBLE child at any moment; date
   * separators (below) and typing rows are ordinary flex items too, so whichever of the three
   * kinds happens to be first-and-visible gets it. */
  applyBottomAnchor_fn = function(log) {
    const prev = log.querySelector(".cf-anchor-top");
    if (prev) prev.classList.remove("cf-anchor-top");
    const firstVisible = [...log.children].find((el) => !el.hidden);
    firstVisible?.classList.add("cf-anchor-top");
  };
  /** T-027 A — `core`'s `scrollId` (fold.ts: set to the MsgId on every `post`, types.ts:269)
   * consumed for the first time: this is the ONLY place anything reads `state.scrollId`. Follows
   * ChatDemo.astro's own `glide()` exactly (file header there): 220ms rAF, cubic ease-out, plus a
   * hard 260ms catch-up `setTimeout` in case a late reflow (a `--cf-cs-pad` remeasure, a font
   * swap) moved `scrollHeight` after the animation's own final frame already ran.
   *
   * `animate` is false for the initial render and any external/manual `data-step` write (devtools
   * scrub, a consumer's own seek UI) — acceptance #1's "instantáneo al seek": those jump straight
   * to bottom, never glide. `scrollId === null` (nothing posted yet) is a no-op. */
  applyScroll_fn = function(log, scrollId, animate) {
    if (scrollId === null) return;
    __privateMethod(this, _CfChatSimElement_instances, cancelScrollAnimation_fn).call(this);
    const to = Math.max(0, log.scrollHeight - log.clientHeight);
    const reduceMotion = typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!animate || reduceMotion) {
      log.scrollTop = to;
      return;
    }
    const from = log.scrollTop;
    if (to - from < 1) return;
    const duration = 220;
    const t0 = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      log.scrollTop = from + (to - from) * eased;
      __privateSet(this, _scrollRaf, p < 1 ? requestAnimationFrame(tick) : null);
    };
    __privateSet(this, _scrollRaf, requestAnimationFrame(tick));
    __privateSet(this, _scrollCatchup, setTimeout(() => {
      __privateSet(this, _scrollCatchup, null);
      log.scrollTop = log.scrollHeight - log.clientHeight;
    }, 260));
  };
  cancelScrollAnimation_fn = function() {
    if (__privateGet(this, _scrollRaf) !== null) {
      cancelAnimationFrame(__privateGet(this, _scrollRaf));
      __privateSet(this, _scrollRaf, null);
    }
    if (__privateGet(this, _scrollCatchup) !== null) {
      clearTimeout(__privateGet(this, _scrollCatchup));
      __privateSet(this, _scrollCatchup, null);
    }
  };
  __publicField(CfChatSimElement, "observedAttributes", ["data-step"]);
  customElements.define("cf-chat-sim", CfChatSimElement);

  // src/components/chat-sim/element/fixtures.ts
  var DOUBLE_TICK_RECEIPT = {
    kind: "ticks",
    states: {
      queued: { glyph: "clock", color: "var(--cf-cs-bubble-out-meta)" },
      sent: { glyph: "check", color: "var(--cf-cs-bubble-out-meta)" },
      delivered: { glyph: "double-check", color: "var(--cf-cs-bubble-out-meta)" },
      read: { glyph: "double-check", color: "#53bdeb" },
      failed: { glyph: "alert", color: "#e34a4a" }
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
    avatarSide: "inbound",
    // T-029: core grew ChannelAdapter to 17 fields (capabilities describes what a channel can DO,
    // same category as the other 16) — mirrors adapters/whatsapp.ts's real value (both buttons and
    // list supported, nothing to constrain yet), since this fixture's whole point is staying a
    // plausible reading of the real WhatsApp column, not "WhatsApp minus whatever's newest".
    capabilities: {
      buttons: null,
      list: null
    }
  };
  var SINGLE_TICK_RECEIPT = {
    ...DOUBLE_TICK_RECEIPT,
    states: {
      ...DOUBLE_TICK_RECEIPT.states,
      delivered: { glyph: "check", color: DOUBLE_TICK_RECEIPT.states.sent.color },
      read: { glyph: "check", color: DOUBLE_TICK_RECEIPT.states.sent.color }
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
