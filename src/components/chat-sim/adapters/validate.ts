// adapters/validate.ts — validateScript, the falsifiable instrument
// (adapter-interface-draft.md §"La propiedad que hace falsable al adapter"). A script asking a
// channel for a delivery state it doesn't have, or a reaction emoji outside its allowlist, does
// not compile. Both checks read `getAdapter`/`isAllowedReactionEmoji` — the ChannelId literal
// never appears in a branch here, so this can't grow the `channel === ` hardcode T-005
// acceptance #4 warns about; the per-channel truth lives in `whatsapp.ts`/`telegram.ts`/`caps.ts`.

import type { Capability, ChannelId, Diagnostic, Json, SimScript } from '../core/types';
import { hasCapability, isAllowedReactionEmoji, normalizeReactionEmoji } from './caps';
import { getAdapter } from './registry';

function isJsonRecord(v: Json | undefined): v is { readonly [key: string]: Json } {
  return !!v && typeof v === 'object' && !Array.isArray(v);
}

// `media.kind === 'buttons' | 'list'` (T-028) is the same opaque-`Json`, no-new-SimStep-variant
// convention `service`/`card` already use in element/render.ts (T-027) — so this stays inside
// adapters/**'s scope.write with no core/types.ts change. A local copy of the narrow-record
// guard rather than an import from element/render.ts: adapters -> element isn't a dependency
// this tree has today (api-contract.md §"Árbol": adapters -> core only), and a two-line guard
// isn't worth opening that edge.
function interactiveCapabilityOf(media: Json | undefined): Capability | null {
  if (!isJsonRecord(media)) return null;
  if (media.kind === 'buttons') return 'buttons';
  if (media.kind === 'list') return 'list';
  return null;
}

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
    if (step.k === 'post') {
      const cap = interactiveCapabilityOf(step.media);
      if (cap && !hasCapability(adapter.capabilities, cap)) {
        diagnostics.push({
          code: 'unsupported-interactive-message',
          msg: `'${channel}' has no '${cap}' capability`,
          stepIdx,
        });
      }
    }
  });

  return diagnostics;
}
