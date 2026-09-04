// adapters/validate.ts — validateScript, the falsifiable instrument
// (adapter-interface-draft.md §"La propiedad que hace falsable al adapter"). A script asking a
// channel for a delivery state it doesn't have, or a reaction emoji outside its allowlist, does
// not compile. Both checks read `getAdapter`/`isAllowedReactionEmoji` — the ChannelId literal
// never appears in a branch here, so this can't grow the `channel === ` hardcode T-005
// acceptance #4 warns about; the per-channel truth lives in `whatsapp.ts`/`telegram.ts`/`caps.ts`.

import type { ChannelId, Diagnostic, SimScript } from '../core/types';
import { isAllowedReactionEmoji, normalizeReactionEmoji } from './caps';
import { getAdapter } from './registry';

export function validateScript(script: SimScript, channel: ChannelId): Diagnostic[] {
  const adapter = getAdapter(channel);
  const diagnostics: Diagnostic[] = [];

  script.forEach((step, stepIdx) => {
    if (step.k === 'receipt' && !adapter.deliveryStates.includes(step.to)) {
      diagnostics.push({
        code: 'unsupported-delivery-state',
        msg: `'${channel}' has no '${step.to}' delivery state (has: ${adapter.deliveryStates.join(' → ')})`,
        stepIdx,
      });
    }
    if (step.k === 'react' && !isAllowedReactionEmoji(channel, step.emoji)) {
      diagnostics.push({
        code: 'unsupported-reaction-emoji',
        msg: `'${normalizeReactionEmoji(step.emoji)}' is outside '${channel}'s reaction allowlist`,
        stepIdx,
      });
    }
  });

  return diagnostics;
}
