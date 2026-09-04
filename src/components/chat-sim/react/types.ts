// react/types.ts — <ChatSim> public props (api-contract.md §"Firmas públicas":
// `<ChatSim script channel seed mode="demo"|"live" />`).

import type { ChannelId, SimScript, Tick } from '../core/types';

/**
 * `mode` is the one knob api-contract.md names without defining its semantics — that's ours
 * to own (`react/**` is `app`'s write cell). Decision, made explicit here rather than left to
 * be reverse-engineered from the code:
 *
 * - `'demo'`  — playback-driven, same contract as `<cf-chat-sim>` (T-002/[skin]): the script
 *   plays itself via the core `Playhead`, and the composer is VISUAL-ONLY (mirrors
 *   `element/`'s `.cf-composer` byte-for-byte — same markup, same classes) because nothing is
 *   listening for input. This is the mode the cross-DOM snapshot check (acceptance #1) compares
 *   against `<cf-chat-sim>`.
 * - `'live'`  — the script's `t0..duration` renders as the thread's history (frozen at the
 *   final step — no autoplay), and the composer becomes a REAL, operable `<textarea>` + send
 *   button: this is what closes "react/'s T-007" from element/chat-sim-element.ts's own
 *   docstring ("a real, operable composer with mobile keyboard handling"). A visitor can type
 *   and post a message; it folds onto the SAME `SimState` via `core/fold.ts`'s `applyEvent`,
 *   never a parallel state shape.
 */
export type ChatSimMode = 'demo' | 'live';

export interface ChatSimProps {
  readonly script: SimScript;
  readonly channel: ChannelId;
  readonly seed: number;
  readonly mode: ChatSimMode;
  readonly locale?: string; // default 'es-PE', matches element/chat-sim-element.ts's default
  readonly tz?: string; // default 'America/Lima' — same default, NEVER omitted from compile()
  readonly t0?: Tick; // default: 2026-01-01T09:00:00Z, same literal element/ falls back to
  readonly contactName?: string;
  readonly contactStatus?: string;
  readonly editedLabel?: string; // default 'Editado'
  /** `'live'` only: the actor id a visitor-typed message posts as. Default `'in'`. */
  readonly liveActorId?: string;
  /** `'live'` only: placeholder text for the real textarea. */
  readonly composerPlaceholder?: string;
  /** `'live'` only: fired every time a visitor sends a message. */
  readonly onLiveSend?: (text: string) => void;
  readonly className?: string;
}
