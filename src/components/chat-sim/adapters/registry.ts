// adapters/registry.ts — channel -> adapter. Imports the two adapters; nothing imports this in
// return, so the direction stays acyclic (`caps` <- `whatsapp`/`telegram` <- `registry`,
// api-contract.md §"Tipos núcleo"). Merging this file with `caps.ts` would close the cycle
// `base -> capabilities -> whatsapp -> base` that the split exists to avoid.

import type { ChannelAdapter, ChannelId } from '../core/types';
import { telegram } from './telegram';
import { whatsapp } from './whatsapp';

// `imessage` has no entry — its adapter is explicitly out of scope this cycle
// (architecture-v1.md §10, "Adapter iMessage completo"; §9 iteration 3 lands only its `ChannelId`
// member and CSS token, not the adapter). `Partial` makes that omission visible in the type.
const ADAPTERS: Readonly<Partial<Record<ChannelId, ChannelAdapter>>> = {
  whatsapp,
  telegram,
};

export function getAdapter(channel: ChannelId): ChannelAdapter {
  const adapter = ADAPTERS[channel];
  if (!adapter) {
    throw new Error(
      `chat-sim: no adapter registered for channel '${channel}' — out of scope this cycle ` +
        '(architecture-v1.md §10, "Adapter iMessage completo").',
    );
  }
  return adapter;
}
