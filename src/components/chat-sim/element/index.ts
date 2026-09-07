// element/ barrel — importing this module registers <cf-chat-sim> as a side effect (matches the
// api-contract.md signature `<cf-chat-sim script="…" channel="…" seed="…">`, which is an HTML
// tag, not a JS call — the registration IS the public API).

export { CfChatSimElement } from './chat-sim-element';
export { WHATSAPP_REFERENCE_ADAPTER, CAPS_FIXTURE_INVERTED_ADAPTER } from './fixtures';
export {
  actorDir,
  actorSenderKind,
  buildMessageElement,
  computeGroupFlags,
  groupKeyOf,
  populateMessageElement,
} from './render';
export type { GroupFlags, RenderMessage } from './render';
