// T-001 acceptance #5: "ChannelAdapter y Diagnostic exportados desde core/types.ts y
// consumibles por element/ sin importar de adapters/**."
//
// Type-level proof: this file imports ONLY from '../types' (never 'adapters/**') and typechecks
// (tsc --noEmit / `npm run typecheck`) using ChannelAdapter + Diagnostic as element/ would. The
// runtime assertions below are secondary — TS erases types, so the real gate is the typecheck.
// The circularity twin (`madge --circular src/components/chat-sim` => vacío) is a separate CLI
// check, not a vitest test — there is nothing to import-cycle yet since core/types.ts imports
// nothing.

import { describe, expect, it } from 'vitest';
import type { ChannelAdapter, ChannelId, Diagnostic } from '../types';
import * as chatSim from '../../index';

describe('type contract exports (acceptance #5)', () => {
  it('ChannelAdapter is fully populated with zero optional fields when constructed', () => {
    const wa: ChannelAdapter = {
      tail: 'first',
      wallpaper: 'pattern',
      reactions: 'overlay-below',
      reactionConstraint: {
        emoji: 'any',
        allowlistSize: 0,
        maxAgeDays: 30,
        canTargetReaction: false,
        canTargetOutbound: true,
        maxPerMessage: 0,
      },
      groupKey: 'actor',
      deliveryStates: ['queued', 'sent', 'delivered', 'read', 'failed'],
      receiptGlyph: 'double-tick',
      counter: 'none',
      timestamp: 'inside-pad',
      quote: 'color-bar',
      bubbleTransport: 'per-conversation',
      senderKinds: ['human', 'ai'],
      keyboard: 'os-qwerty',
      album: 'grid-in-one-bubble',
      e2eNotice: true,
      avatarSide: 'inbound',
    };
    expect(Object.keys(wa)).toHaveLength(16);
  });

  it('Diagnostic constructs with an optional stepIdx', () => {
    const d: Diagnostic = { code: 'unsupported-receipt', msg: 'delivered not valid on telegram' };
    const d2: Diagnostic = { ...d, stepIdx: 3 };
    expect(d2.stepIdx).toBe(3);
  });

  it('the chat-sim subpath barrel re-exports the type contract + compile/seek', () => {
    expect(typeof chatSim.compile).toBe('function');
    expect(typeof chatSim.seek).toBe('function');
    expect(typeof chatSim.createPlayhead).toBe('function');
    const channel: ChannelId = 'telegram';
    expect(channel).toBe('telegram');
  });
});
