import type { ChannelType } from "../utils/channel";

/**
 * Delivery status for outbound messages
 */
export type DeliveryStatus = "queued" | "sent" | "delivered" | "read" | "failed";

/**
 * Sender type for messages
 */
export type SenderType = "customer" | "agent" | "ai" | "system";

/**
 * Content format for messages
 */
export type ContentFormat = "text" | "markdown";

/**
 * Message direction
 */
export type MessageDirection = "inbound" | "outbound";

/**
 * Media attachment types
 */
export type MediaType = "image" | "video" | "audio" | "document";

/**
 * Media attachment in a message
 */
export interface MediaAttachment {
  type: MediaType;
  url: string;
  filename?: string;
  mimeType?: string;
  thumbnailUrl?: string;
}

/**
 * Sender information
 */
export interface MessageSender {
  id?: string;
  name: string;
  type: SenderType;
  avatar?: string;
}

/**
 * Tool execution status
 */
export interface ToolExecution {
  name: string;
  icon?: string;
  status: "running" | "success" | "error";
  result?: unknown;
}

/**
 * Universal message type that supports both widget and inbox use cases.
 * This is the canonical message type for all Cofoundy messaging components.
 */
/**
 * DEUDA CONOCIDA — dos modelos de Message coexisten en este paquete y NO son intercambiables.
 *
 * - `UniversalMessage` (este archivo): omnicanal, direction-based, con `channel`,
 *   `deliveryStatus` (5 estados incl. `queued`/`read`), `sender`, `media`.
 * - `Message` (src/types/index.ts): widget/Zustand, role-based, `sendStatus` (4 estados
 *   incl. `sending`). Sin `channel`, `sender` ni `media`.
 *
 * NO existe funcion de conversion entre ambos. El campo `role?` de abajo es el unico
 * puente y es parcial. Transports y stores usan exclusivamente el segundo.
 *
 * El ciclo chat-sim-rewrite (2026-09-04) AISLA esta deuda en vez de repararla: escribir
 * el conversor toca transports/stores y el chat-widget de TimelyAI, superficies sin
 * criterio de exito ni tests en ese ciclo. Ver `.cofoundy/specs/architecture-v1.md` §5.
 */
export interface UniversalMessage {
  id: string;
  timestamp: Date;

  // Core content
  content: string;
  contentType: ContentFormat;
  direction: MessageDirection;

  // Sender information (for multi-party conversations)
  sender?: MessageSender;

  // Channel (for omnichannel)
  channel?: ChannelType;

  // Status
  deliveryStatus?: DeliveryStatus;
  aiGenerated?: boolean;

  // Attachments
  media?: MediaAttachment[];

  // Tool execution (AI agents)
  tool?: ToolExecution;

  // Legacy role support (for widget compatibility)
  role?: "user" | "assistant" | "tool";
}

/**
 * Props for message list grouping functions
 */
export interface MessageGroup {
  type: "messages" | "tools" | "date";
  messages?: UniversalMessage[];
  tools?: UniversalMessage[];
  date?: Date;
}
