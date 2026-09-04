// sound/packs.ts — the cue-pack DATA (T-006's actual deliverable per the Fase-5 amendment: "el
// trabajo duro ya está hecho... falta autoría de datos, no diseño"). Everything synthesized —
// zero third-party samples (T-006 acceptance #2); WhatsApp/Telegram's real notification audio is
// copyrighted, unlike the prior art's MIT-licensed code (architecture-v1.md §7).
//
// Cap (T-006 Alcance, A-1 scope cap — verified by cap.test.ts): ≤6 cues per channel, ≤3 layers
// per cue. 3 cues per channel here — under cap by choice ("si no entra, entregá menos cues, no
// otro artefacto"): three well-shaped cues that are genuinely distinguishable beats "six thin
// ones," and it's what the ≤0.5d budget for this deliverable actually bought.
//
// WhatsApp: bright, tonal, sine-only — a "ding," never a "whoosh". Telegram: textured — every cue
// carries a filtered-noise layer, which is what finding 03 §4 names as the axis that actually
// distinguishes the two (texture, not pitch).

import type { Cue, CuePack } from './types';

const WHATSAPP: readonly Cue[] = [
  {
    id: 'wa-message-in',
    gain: 0.55,
    layers: [
      { freq: 880, startMs: 0, durMs: 90, wave: 'sine', attackMs: 4 },
      { freq: 1318.5, startMs: 45, durMs: 130, wave: 'sine', attackMs: 6 }, // a fifth above — the two-tone "ding"
    ],
  },
  {
    id: 'wa-message-out',
    gain: 0.4,
    layers: [{ freq: [620, 480], startMs: 0, durMs: 70, wave: 'sine', attackMs: 3 }],
  },
  {
    id: 'wa-notification',
    gain: 0.5,
    layers: [
      { freq: 660, startMs: 0, durMs: 90, wave: 'sine', attackMs: 5 },
      { freq: 880, startMs: 70, durMs: 90, wave: 'sine', attackMs: 5 },
      { freq: 1108.7, startMs: 140, durMs: 160, wave: 'sine', attackMs: 6 },
    ],
  },
];

const TELEGRAM: readonly Cue[] = [
  {
    id: 'tg-message-in',
    gain: 0.5,
    layers: [
      { freq: 2600, startMs: 0, durMs: 35, wave: 'noise', attackMs: 2 }, // bright transient click
      { freq: 720, startMs: 10, durMs: 110, wave: 'sine', attackMs: 8, jitterHz: 6 },
    ],
  },
  {
    id: 'tg-message-out',
    gain: 0.45,
    layers: [
      { freq: 1400, startMs: 0, durMs: 140, wave: 'noise', attackMs: 4 }, // the "whoosh" body
      { freq: 950, startMs: 20, durMs: 70, wave: 'sine', attackMs: 3 },
    ],
  },
  {
    id: 'tg-notification',
    gain: 0.5,
    layers: [
      { freq: 3200, startMs: 0, durMs: 25, wave: 'noise', attackMs: 1 },
      { freq: 784, startMs: 15, durMs: 100, wave: 'sine', attackMs: 6, jitterHz: 4 },
      { freq: 1046.5, startMs: 90, durMs: 130, wave: 'sine', attackMs: 6 },
    ],
  },
];

/** `imessage` is absent by design — no adapter, no cue authoring for it this cycle (only its
 * ChannelId + `--channel-imessage` token are in scope). `getCuePack('imessage')` returning
 * `undefined` and the sink surviving that is exactly acceptance #4's degenerate case. */
export const DEFAULT_CUE_PACK: CuePack = {
  whatsapp: WHATSAPP,
  telegram: TELEGRAM,
};
