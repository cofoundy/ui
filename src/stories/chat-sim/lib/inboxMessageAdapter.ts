// stories/chat-sim/lib/inboxMessageAdapter.ts — qa's own write cell (file-ownership-matrix.md:
// `src/stories/chat-sim/**` is `W` for qa). Turns a REAL inbox-ai `Message` (typed against the
// actual interface, not a hand-copied mirror — T-008 acceptance #1) into the `SimStep[]` the
// public chat-sim contract already understands (`post` / `receipt` / `edit` / `react`,
// api-contract.md § "Tipos núcleo"). Nothing here reaches into chat-sim internals: every step
// this file emits is something `compile()` already accepts.
//
// Why route through SimStep instead of building a RenderMessage/MsgState by hand: those are
// react/'s and core/'s internal shapes (`R`, not `W`, for qa per the ownership matrix), and
// bypassing `compile`/`fold` would test a shortcut nobody ships, not the real replacement.

import type { Message } from '../../../../../../products/cofoundy-platform/inbox-ai/frontend/src/lib/api';
import type { ActorId, DeliveryState, SimStep } from '../../../components/chat-sim/core/types';

/**
 * `by: ActorId` convention (element/render.ts's own comment, api-contract.md's `Ev.draft`
 * amendment): 'in' | 'out:ai' | 'out:human:<id>' — the same three shapes inbox-ai's
 * `lib/messageGrouping.ts:25` groups by. Derived from `Message.direction` + `Message.sender`,
 * never invented.
 */
export function messageToActorId(message: Message): ActorId {
  if (message.direction === 'inbound') return 'in';
  if (message.sender.type === 'ai') return 'out:ai';
  return `out:human:${message.sender.id}`;
}

/** The 5 delivery states chat-sim's `DeliveryState` models (core/types.ts). */
const DELIVERY_STATES: ReadonlySet<string> = new Set([
  'queued',
  'sent',
  'delivered',
  'read',
  'failed',
]);

/**
 * `Message.delivery_status` is a bare `string` in the real interface (comment at api.ts:252-255:
 * "'draft' / 'discarded' added cycle-11 (#61) on top of queued|sent|delivered|read|failed").
 * `draft`/`discarded` are a DIFFERENT concept from chat-sim's own `Ev.draft` (a typing-indicator
 * blip, not a held-for-human-approval message) — there is no chat-sim state that means "composed
 * but not yet sent", so a message in either of those two real states has no `SimStep` this cycle
 * and is intentionally excluded, not coerced into the nearest-looking one.
 */
export function isPostableDeliveryStatus(status: string): status is DeliveryState {
  return DELIVERY_STATES.has(status);
}

export interface ReactionInput {
  readonly emoji: string;
  readonly by: ActorId;
}

export interface MapMessageOptions {
  /** Reactions anchored to this message. NEVER read off `Message` — the real interface has no
   * `reactions` field; inbox-ai's own `MessageBubbleProps.reactions` is a sibling prop, pulled
   * out of the timeline upstream (`prepareTimeline`, MessageBubble.tsx:73-75). Mirroring that
   * split here (instead of inventing a `Message.reactions` that doesn't exist) is what keeps
   * this an honest replacement rather than a loosened one. */
  readonly reactions?: readonly ReactionInput[];
  readonly delayMs?: number;
}

/**
 * One real `Message` -> the `SimStep[]` that reproduce it. Returns `null` for a message this
 * cycle has no representation for (see `isPostableDeliveryStatus`) — the caller filters those
 * out rather than the mapper silently downgrading them to something they aren't.
 *
 * Soft/hard-deleted messages (`deleted_at` set, or `content_type === 'deleted'` /
 * `metadata.deleted === true`) DO get a `post` step here, immediately followed by a `delete`
 * step — but this is a DIVERGENCE worth naming, not a silent match: the real product renders a
 * muted tombstone bubble (`SystemPlaceholder`, MessageBubble.tsx:1153-1179) in the deleted
 * message's place, while chat-sim's `delete` Ev removes the message from `SimState.order`
 * entirely (`fold.ts`'s visibility filter is `deleted === null`) — the thread behaves as if it
 * never happened, not as if it happened-and-was-retracted. `InboxAIReplacement.stories.tsx`
 * documents this at the story level; it is why the "N KB reemplazables" count in qa.md does NOT
 * include `SystemPlaceholder` — that block is not actually covered.
 */
export function messageToSteps(message: Message, opts: MapMessageOptions = {}): SimStep[] | null {
  if (!isPostableDeliveryStatus(message.delivery_status)) return null;

  const by = messageToActorId(message);
  const steps: SimStep[] = [
    { k: 'post', by, text: message.content, delayMs: opts.delayMs ?? 400 },
  ];

  // `metadata.edited === true` — NOT `Message.edited_at` — is what MessageBubble.tsx:182 actually
  // reads to decide whether to render the "Editado" indicator. `Message` carries both fields;
  // only one drives the UI. Mirrored here rather than the more-obvious-looking `edited_at`, on
  // purpose — a mapper that used `edited_at` would compile fine and still not match production.
  const isEdited = message.metadata?.edited === true;

  const isDeleted =
    Boolean(message.deleted_at) ||
    message.content_type === 'deleted' ||
    message.metadata?.deleted === true;

  for (const r of opts.reactions ?? []) {
    steps.push({ k: 'react', id: PENDING_ID, emoji: r.emoji, by: r.by });
  }
  if (isEdited) {
    steps.push({ k: 'edit', id: PENDING_ID, v: 1 });
  }
  if (isDeleted) {
    steps.push({ k: 'delete', id: PENDING_ID, scope: 'all' });
  } else {
    steps.push({ k: 'receipt', id: PENDING_ID, to: message.delivery_status });
  }

  return steps;
}

/**
 * `post` is the only step that ASSIGNS a `MsgId` (compile() does it in script order, `m0`,
 * `m1`, ... — api-contract.md's comment on `SimStep`). Every step targeting an existing message
 * has to reference that id, but it isn't known until the whole script is assembled — scripts
 * built one `Message` at a time can't know their own future index. `PENDING_ID` is a marker
 * `resolveStepTargets` rewrites to the real `mN` once the full script (and therefore each
 * message's position) is fixed; it is never passed to `compile()` itself.
 */
export const PENDING_ID = '__pending__';

/** Assembles N messages' steps into one script, rewriting each `PENDING_ID` to that message's
 * own `post` index (`m0`, `m1`, ...) — the same assignment order `compile()` uses. */
export function messagesToScript(
  messages: readonly Message[],
  optsByMessage?: ReadonlyMap<string, MapMessageOptions>,
): SimStep[] {
  const script: SimStep[] = [];
  let postIdx = 0;
  for (const message of messages) {
    const steps = messageToSteps(message, optsByMessage?.get(message.id));
    if (!steps) continue;
    const id = `m${postIdx}`;
    postIdx += 1;
    for (const step of steps) {
      script.push(resolvePendingId(step, id));
    }
  }
  return script;
}

function resolvePendingId(step: SimStep, id: string): SimStep {
  if (step.k === 'post') return step;
  if ('id' in step && step.id === PENDING_ID) return { ...step, id };
  return step;
}
