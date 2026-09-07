// adapters/caps.ts — leaf. Mirrors inbox-ai's capabilities.py: the reaction vocabulary + the ONE
// normalizeReactionEmoji, with zero imports of chat-sim's own runtime code so `whatsapp.ts` and
// `telegram.ts` can depend on it without risk of the cycle api-contract.md warns about
// (base -> capabilities -> whatsapp -> base). The `import type` below is erased at compile — it
// cannot be the source of a runtime cycle (arruga honesta, adapter-interface-draft.md).

import type { ChannelAdapter, ChannelId } from '../core/types';

export const VARIATION_SELECTOR_16 = '\uFE0F';

/**
 * Strip the emoji-presentation variation selector so `❤️` and `❤` compare equal. THE one
 * implementation — the allowlist below, validateScript, and any future outbound adapter all
 * call this. Two copies of this rule drifting apart is the failure mode this exists to prevent.
 */
export function normalizeReactionEmoji(emoji: string): string {
  return (emoji ?? '').replaceAll(VARIATION_SELECTOR_16, '');
}

// Verbatim from https://core.telegram.org/bots/api#reactiontypeemoji (`ReactionTypeEmoji.emoji`),
// last-fetched 2026-08-01 — the same 73 entries, same doc order, as
// inbox-ai/backend/src/services/channel_adapters/telegram_reactions.py. Telegram spells several
// of these WITHOUT U+FE0F (`❤`, `⚡`, `🕊`, `✍`, `☃`, the `🤷` family); every emoji picker
// (ours included) emits the variation-selector form, so the set is stored normalized below —
// comparing raw is a guaranteed miss.
const TELEGRAM_REACTIONS_RAW: readonly string[] = [
  '❤', '👍', '👎', '🔥', '🥰', '👏',
  '😁', '🤔', '🤯', '😱', '🤬', '😢',
  '🎉', '🤩', '🤮', '💩', '🙏', '👌',
  '🕊', '🤡', '🥱', '🥴', '😍', '🐳',
  '❤‍🔥', '🌚', '🌭', '💯', '🤣', '⚡',
  '🍌', '🏆', '💔', '🤨', '😐', '🍓',
  '🍾', '💋', '🖕', '😈', '😴', '😭',
  '🤓', '👻', '👨‍💻', '👀', '🎃', '🙈',
  '😇', '😨', '🤝', '✍', '🤗', '🫡',
  '🎅', '🎄', '☃', '💅', '🤪', '🗿',
  '🆒', '💘', '🙉', '🦄', '😘', '💊',
  '🙊', '😎', '👾', '🤷‍♂', '🤷', '🤷‍♀',
  '😡',
];

/** The lookup set. Normalized on construction so `❤️` and `❤` both hit. */
export const TELEGRAM_REACTIONS: ReadonlySet<string> = new Set(
  TELEGRAM_REACTIONS_RAW.map(normalizeReactionEmoji),
);

/**
 * Per-channel reaction allowlist, keyed by `ChannelId` so nothing that consumes this ever has to
 * branch on the channel literal itself — `null` = any emoji accepted (WhatsApp today).
 * `imessage` has no real entry: its adapter is out of scope this cycle (architecture-v1.md §10,
 * "Adapter iMessage completo") — `isAllowedReactionEmoji` never gets asked about it because
 * `registry.ts`'s `getAdapter` throws first.
 */
const REACTION_ALLOWLIST: Readonly<Record<ChannelId, ReadonlySet<string> | null>> = {
  whatsapp: null,
  telegram: TELEGRAM_REACTIONS,
  imessage: null,
};

export function isAllowedReactionEmoji(channel: ChannelId, emoji: string): boolean {
  const allowlist = REACTION_ALLOWLIST[channel];
  if (allowlist === null) return true;
  return allowlist.has(normalizeReactionEmoji(emoji));
}

// ---------------------------------------------------------------------------
// Capability vocabulary (T-028) — mirrors inbox-ai's `Capability` StrEnum +
// `registry.py`'s `Constraint | None` map, scoped to the two members this cycle's
// script authoring actually needs. `REACTION`/`AUDIO_SEND` stay out: reactions already have
// their own dedicated `reactions`/`reactionConstraint` fields (folding them in here would be a
// second way to ask the same question, the exact drift `normalizeReactionEmoji`'s docstring
// warns about above), and nothing in chat-sim sends outbound audio yet.
//
// A capability entry's VALUE is always `null` today — "supported, nothing (yet) to constrain",
// same as prod's `Capability.BUTTONS: None`. What matters is KEY PRESENCE, not the value:
// absent = unsupported. Ask `hasCapability`, never `cap in set` by hand, and never read the
// value's truthiness — prod's own docstring flags this as the footgun
// (`constraint_for(...) is None` does NOT mean unsupported).
// ---------------------------------------------------------------------------

export type Capability = 'buttons' | 'list';

export type CapabilitySet = Readonly<Partial<Record<Capability, null>>>;

export function hasCapability(capabilities: CapabilitySet, cap: Capability): boolean {
  return cap in capabilities;
}

/**
 * `ChannelAdapter` (core/types.ts, T-001) + `capabilities` — kept OUT of the core 16-field
 * interface on purpose: T-028's `scope.write` is `adapters/**`, core/ is a different task's
 * surface. `extends` makes this a NEW type, so core/types.ts stays untouched; every existing
 * consumer of `ChannelAdapter` (element/render.ts, react/ChatSim.tsx, tests) keeps working
 * unmodified because a `ChannelAdapterWithCapabilities` is structurally still a `ChannelAdapter`.
 * If `capabilities` earns a permanent 17th slot, that's a follow-up task against core/types.ts,
 * not this one.
 */
export interface ChannelAdapterWithCapabilities extends ChannelAdapter {
  readonly capabilities: CapabilitySet;
}
