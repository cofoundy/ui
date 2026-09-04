// stories/chat-sim/lib/inboxMessageFixtures.ts — qa's own write cell.
//
// Representative inbox-ai `Message` objects, typed against the REAL interface
// (inbox-ai/frontend/src/lib/api.ts:229) — every required field is filled in explicitly, on
// purpose: this is exactly what the "sin escape hatch" acceptance line is checking. Shared by
// InboxAIReplacement.stories.tsx (visual) and __tests__/chat-sim/inbox-message-adapter.test.ts
// (behavioral) so both exercise the identical data.

import type { Message } from '../../../../../../products/cofoundy-platform/inbox-ai/frontend/src/lib/api';

const BASE_TS = '2026-09-04T15:00:00.000Z';

/** Plain inbound text — the simplest real row: a customer message, `queued` never applies
 * inbound (that's an outbound-only concept), so this is `delivered` (WhatsApp confirmed receipt
 * server-side; inbox-ai never marks its own inbound rows `read` — that's the AGENT reading it). */
export const INBOUND_TEXT: Message = {
  id: 'msg_1',
  conversation_id: 'conv_1',
  direction: 'inbound',
  content: '¿Tienen mesa para el sábado a las 8pm?',
  content_type: 'text',
  sender: { type: 'contact', id: 'contact_1', name: 'María' },
  channel: 'whatsapp',
  delivery_status: 'delivered',
  ai_generated: false,
  metadata: {},
  timestamp: BASE_TS,
  created_at: BASE_TS,
};

/** AI-generated outbound reply, read by the customer — the case that exercises the read-blue
 * tick (`.cf-receipt[data-read='true']`, styles.css:333). */
export const OUTBOUND_AI_READ: Message = {
  id: 'msg_2',
  conversation_id: 'conv_1',
  direction: 'outbound',
  content: 'Sí, tenemos disponibilidad. ¿Para cuántas personas?',
  content_type: 'text',
  sender: { type: 'ai', id: 'ai_1', name: 'Fovente AI' },
  channel: 'whatsapp',
  delivery_status: 'read',
  ai_generated: true,
  metadata: {},
  timestamp: BASE_TS,
  created_at: BASE_TS,
};

/** Edited outbound message. `metadata.edited === true` is what MessageBubble.tsx:182 actually
 * reads — `edited_at` is populated too (real rows carry both), but it is NOT the flag the real
 * UI branches on, and this fixture exists specifically so the mapper is tested against the
 * field that matters, not the more-obvious-looking one that doesn't. */
export const OUTBOUND_EDITED: Message = {
  id: 'msg_3',
  conversation_id: 'conv_1',
  direction: 'outbound',
  content: 'Perfecto, reservado para 4 el sábado a las 8pm',
  content_type: 'text',
  sender: { type: 'agent', id: 'agent_1', name: 'Camila' },
  channel: 'whatsapp',
  delivery_status: 'sent',
  ai_generated: false,
  metadata: { edited: true },
  timestamp: BASE_TS,
  created_at: BASE_TS,
  edited_at: BASE_TS,
  original_content: 'Perfecto, reservado para el sábado a las 8pm',
};

/** Soft-deleted by the operator (#604) — `deleted_at` set, `channel_revoked: false` (WhatsApp
 * itself exposes no retraction; the customer's phone still shows it). See
 * `inboxMessageAdapter.ts`'s own doc comment for why chat-sim's `delete` Ev does NOT reproduce
 * inbox-ai's real tombstone rendering, and why that's a named divergence, not a bug. */
export const OUTBOUND_SOFT_DELETED: Message = {
  id: 'msg_4',
  conversation_id: 'conv_1',
  direction: 'outbound',
  content: 'esto no debía salir así',
  content_type: 'text',
  sender: { type: 'agent', id: 'agent_1', name: 'Camila' },
  channel: 'whatsapp',
  delivery_status: 'sent',
  ai_generated: false,
  metadata: {},
  timestamp: BASE_TS,
  created_at: BASE_TS,
  deleted_at: BASE_TS,
  channel_revoked: false,
};

/** Held-for-approval AI draft (cycle-11, #61) — never sent, so `messageToSteps` returns `null`
 * for it (see `isPostableDeliveryStatus`). Included so the exclusion itself is testable, not
 * merely asserted. */
export const AI_DRAFT_PENDING: Message = {
  id: 'msg_5',
  conversation_id: 'conv_1',
  direction: 'outbound',
  content: 'un borrador que un humano todavía no aprueba',
  content_type: 'text',
  sender: { type: 'ai', id: 'ai_1', name: 'Fovente AI' },
  channel: 'whatsapp',
  delivery_status: 'draft',
  ai_generated: true,
  metadata: { draft: { proposed_by: 'ai' } },
  timestamp: BASE_TS,
  created_at: BASE_TS,
};

/** Telegram: `counter: 'views'` is the one adapter field that only renders on this channel
 * (`whatsapp.ts`'s `counter: 'none'`) — a fixture pinned to Telegram is the only way this state
 * is ever visible at all. */
export const TELEGRAM_CHANNEL_POST: Message = {
  id: 'msg_6',
  conversation_id: 'conv_2',
  direction: 'outbound',
  content: 'Promo del fin de semana 🎉',
  content_type: 'text',
  sender: { type: 'agent', id: 'agent_1', name: 'Camila' },
  channel: 'telegram',
  delivery_status: 'read',
  ai_generated: false,
  metadata: {},
  timestamp: BASE_TS,
  created_at: BASE_TS,
};

export const ALL_FIXTURES: readonly Message[] = [
  INBOUND_TEXT,
  OUTBOUND_AI_READ,
  OUTBOUND_EDITED,
  OUTBOUND_SOFT_DELETED,
  AI_DRAFT_PENDING,
];
