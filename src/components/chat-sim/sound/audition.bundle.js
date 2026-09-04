"use strict";
var CfChatSimSound = (() => {
  var __typeError = (msg) => {
    throw TypeError(msg);
  };
  var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
  var __privateGet = (obj, member, getter) => (__accessCheck(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
  var __privateAdd = (obj, member, value) => member.has(obj) ? __typeError("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
  var __privateSet = (obj, member, value, setter) => (__accessCheck(obj, member, "write to private field"), setter ? setter.call(obj, value) : member.set(obj, value), value);

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

  // src/components/chat-sim/sound/synth.ts
  var SAMPLE_RATE = 44100;
  var GAP_MS = 150;
  function seedFromId(id) {
    let h = 0;
    for (let i = 0; i < id.length; i++) h = h * 31 + id.charCodeAt(i) | 0;
    return h >>> 0;
  }
  function waveformAt(wave, phase) {
    switch (wave) {
      case "sine":
        return Math.sin(phase);
      case "square":
        return Math.sin(phase) >= 0 ? 1 : -1;
      case "triangle":
        return 2 / Math.PI * Math.asin(Math.sin(phase));
      case "noise":
        return 0;
    }
  }
  function envelopeAt(i, n, attackSamples) {
    const releaseSamples = Math.min(attackSamples || Math.round(SAMPLE_RATE * 8e-3), n - attackSamples, Math.round(SAMPLE_RATE * 8e-3));
    if (attackSamples > 0 && i < attackSamples) return i / attackSamples;
    if (releaseSamples > 0 && i >= n - releaseSamples) return (n - i) / releaseSamples;
    return 1;
  }
  function sweptFreqAt(freq, t, durSec) {
    if (typeof freq === "number") return freq;
    const [from, to] = freq;
    return from + (to - from) * Math.min(1, t / durSec);
  }
  function renderLayer(layer, cueId, layerIndex) {
    const n = Math.max(1, Math.round(layer.durMs / 1e3 * SAMPLE_RATE));
    const attackSamples = Math.round(layer.attackMs / 1e3 * SAMPLE_RATE);
    const out = new Float32Array(n);
    const seed = seedFromId(cueId);
    const durSec = layer.durMs / 1e3;
    if (layer.wave === "noise") {
      const cutoff = typeof layer.freq === "number" ? layer.freq : layer.freq[0];
      const alpha = Math.min(1, 2 * Math.PI * cutoff / SAMPLE_RATE);
      let prev = 0;
      for (let i = 0; i < n; i++) {
        const white = rand(seed, layerIndex, i) * 2 - 1;
        prev += alpha * (white - prev);
        out[i] = prev * envelopeAt(i, n, attackSamples);
      }
      return out;
    }
    const jitter = layer.jitterHz ? (rand(seed, layerIndex, 0) * 2 - 1) * layer.jitterHz : 0;
    let phase = 0;
    for (let i = 0; i < n; i++) {
      const t = i / SAMPLE_RATE;
      const f = sweptFreqAt(layer.freq, t, durSec) + jitter;
      phase += 2 * Math.PI * f / SAMPLE_RATE;
      out[i] = waveformAt(layer.wave, phase) * envelopeAt(i, n, attackSamples);
    }
    return out;
  }
  function renderCue(cue) {
    const rendered = cue.layers.map((layer, i) => ({
      buf: renderLayer(layer, cue.id, i),
      offset: Math.round(layer.startMs / 1e3 * SAMPLE_RATE)
    }));
    const totalLen = rendered.reduce((max, r) => Math.max(max, r.offset + r.buf.length), 1);
    const mix = new Float32Array(totalLen);
    for (const r of rendered) {
      for (let i = 0; i < r.buf.length; i++) mix[r.offset + i] += r.buf[i];
    }
    for (let i = 0; i < mix.length; i++) mix[i] = Math.max(-1, Math.min(1, mix[i] * cue.gain));
    const times = cue.repeat && cue.repeat > 1 ? cue.repeat : 1;
    if (times === 1) return mix;
    const out = new Float32Array(mix.length * times);
    for (let r = 0; r < times; r++) out.set(mix, r * mix.length);
    return out;
  }
  function renderPack(cues) {
    if (cues.length === 0) return new Float32Array(0);
    const gapSamples = Math.round(GAP_MS / 1e3 * SAMPLE_RATE);
    const rendered = cues.map(renderCue);
    const totalLen = rendered.reduce((sum, b) => sum + b.length, 0) + gapSamples * (cues.length - 1);
    const out = new Float32Array(totalLen);
    let cursor = 0;
    rendered.forEach((buf, i) => {
      out.set(buf, cursor);
      cursor += buf.length + (i < rendered.length - 1 ? gapSamples : 0);
    });
    return out;
  }
  function pcmDigest(buf) {
    let s = "";
    for (let i = 0; i < buf.length; i++) {
      const clamped = Math.max(-1, Math.min(1, buf[i]));
      const int16 = Math.round(clamped * 32767) + 32768;
      s += String.fromCharCode(int16);
    }
    return digestOf(s);
  }

  // src/components/chat-sim/sound/audio-sink.ts
  var _ctx, _master, _muted, _live;
  var AudioSink = class {
    constructor(ctx) {
      __privateAdd(this, _ctx);
      __privateAdd(this, _master);
      __privateAdd(this, _muted, true);
      __privateAdd(this, _live, /* @__PURE__ */ new Set());
      __privateSet(this, _ctx, ctx);
      __privateSet(this, _master, ctx.createGain());
      __privateGet(this, _master).gain.value = 0;
      __privateGet(this, _master).connect(ctx.destination);
    }
    get muted() {
      return __privateGet(this, _muted);
    }
    mute() {
      __privateSet(this, _muted, true);
      __privateGet(this, _master).gain.value = 0;
    }
    unmute() {
      __privateSet(this, _muted, false);
      __privateGet(this, _master).gain.value = 1;
    }
    /** Currently-scheduled-and-not-yet-ended nodes — the number acceptance #1 asserts >0 before a
     * seek and 0 after. Mute state never affects this count: scheduling/cancellation is a
     * bookkeeping property, audibility is a gain value — conflating them is exactly what makes "no
     * queda cola sonando" vacuously true when muted (T-006 Acceptance #1's own wording). */
    get liveNodeCount() {
      return __privateGet(this, _live).size;
    }
    /** Renders `cue` (synth.ts — one mixed-down buffer, layers/gain/repeat already applied) and
     * schedules it at `when` (AudioContext-clock seconds; defaults to "now"). */
    schedule(cue, when) {
      const mix = renderCue(cue);
      const buffer = __privateGet(this, _ctx).createBuffer(1, Math.max(1, mix.length), SAMPLE_RATE);
      if (buffer.copyToChannel) buffer.copyToChannel(mix, 0);
      else buffer.getChannelData(0).set(mix);
      const src = __privateGet(this, _ctx).createBufferSource();
      src.buffer = buffer;
      src.connect(__privateGet(this, _master));
      __privateGet(this, _live).add(src);
      src.addEventListener("ended", () => {
        __privateGet(this, _live).delete(src);
      });
      src.start(when ?? __privateGet(this, _ctx).currentTime);
    }
    /** The seek/scrub hook (architecture-v1.md §1, class 5). Stops every currently-live node NOW —
     * not wired to any real Timeline/playhead here: `element/**` is outside T-006's scope.write, so
     * a future integration is what calls this on every seek. Tested directly (acceptance #1). */
    cancelAll() {
      for (const node of [...__privateGet(this, _live)]) {
        node.stop(0);
        __privateGet(this, _live).delete(node);
      }
    }
  };
  _ctx = new WeakMap();
  _master = new WeakMap();
  _muted = new WeakMap();
  _live = new WeakMap();

  // src/components/chat-sim/sound/packs.ts
  var WHATSAPP = [
    {
      id: "wa-message-in",
      gain: 0.55,
      layers: [
        { freq: 880, startMs: 0, durMs: 90, wave: "sine", attackMs: 4 },
        { freq: 1318.5, startMs: 45, durMs: 130, wave: "sine", attackMs: 6 }
        // a fifth above — the two-tone "ding"
      ]
    },
    {
      id: "wa-message-out",
      gain: 0.4,
      layers: [{ freq: [620, 480], startMs: 0, durMs: 70, wave: "sine", attackMs: 3 }]
    },
    {
      id: "wa-notification",
      gain: 0.5,
      layers: [
        { freq: 660, startMs: 0, durMs: 90, wave: "sine", attackMs: 5 },
        { freq: 880, startMs: 70, durMs: 90, wave: "sine", attackMs: 5 },
        { freq: 1108.7, startMs: 140, durMs: 160, wave: "sine", attackMs: 6 }
      ]
    }
  ];
  var TELEGRAM = [
    {
      id: "tg-message-in",
      gain: 0.5,
      layers: [
        { freq: 2600, startMs: 0, durMs: 35, wave: "noise", attackMs: 2 },
        // bright transient click
        { freq: 720, startMs: 10, durMs: 110, wave: "sine", attackMs: 8, jitterHz: 6 }
      ]
    },
    {
      id: "tg-message-out",
      gain: 0.45,
      layers: [
        { freq: 1400, startMs: 0, durMs: 140, wave: "noise", attackMs: 4 },
        // the "whoosh" body
        { freq: 950, startMs: 20, durMs: 70, wave: "sine", attackMs: 3 }
      ]
    },
    {
      id: "tg-notification",
      gain: 0.5,
      layers: [
        { freq: 3200, startMs: 0, durMs: 25, wave: "noise", attackMs: 1 },
        { freq: 784, startMs: 15, durMs: 100, wave: "sine", attackMs: 6, jitterHz: 4 },
        { freq: 1046.5, startMs: 90, durMs: 130, wave: "sine", attackMs: 6 }
      ]
    }
  ];
  var DEFAULT_CUE_PACK = {
    whatsapp: WHATSAPP,
    telegram: TELEGRAM
  };

  // src/components/chat-sim/sound/audition-entry.ts
  function el(tag, props = {}) {
    const node = document.createElement(tag);
    Object.assign(node, props);
    return node;
  }
  function mount() {
    const root = document.getElementById("root");
    if (!root) return;
    const ctx = new AudioContext();
    const sink = new AudioSink(ctx);
    const unmuteBtn = el("button", { textContent: "\u{1F507} muted (click to unmute)" });
    unmuteBtn.addEventListener("click", () => {
      if (sink.muted) {
        sink.unmute();
        unmuteBtn.textContent = "\u{1F50A} unmuted";
      } else {
        sink.mute();
        unmuteBtn.textContent = "\u{1F507} muted (click to unmute)";
      }
    });
    root.appendChild(unmuteBtn);
    ["whatsapp", "telegram"].forEach((channel) => {
      const cues = DEFAULT_CUE_PACK[channel] ?? [];
      const section = el("section");
      section.appendChild(el("h2", { textContent: channel }));
      const digest = pcmDigest(renderPack(cues));
      section.appendChild(el("p", { textContent: `pack digest: ${digest} (${cues.length} cues)` }));
      cues.forEach((cue) => {
        const btn = el("button", { textContent: `\u25B6 ${cue.id}` });
        btn.addEventListener("click", () => {
          if (ctx.state === "suspended") ctx.resume();
          sink.schedule(cue);
        });
        section.appendChild(btn);
      });
      const cancelBtn = el("button", { textContent: "\u23F9 cancelAll() \u2014 the seek/scrub hook" });
      cancelBtn.addEventListener("click", () => sink.cancelAll());
      section.appendChild(cancelBtn);
      root.appendChild(section);
    });
  }
  mount();
})();
