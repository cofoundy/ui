// T-001 acceptance #5: "ChannelAdapter y Diagnostic exportados desde core/types.ts y
// consumibles por element/ sin importar de adapters/**."
//
// Type-level proof: this file imports ONLY from '../types' (never 'adapters/**') and typechecks
// (tsc --noEmit / `npm run typecheck`) using ChannelAdapter + Diagnostic as element/ would. The
// runtime assertions below now read REAL production values (`getAdapter`/`validateScript`)
// instead of locally-constructed literals (T-022 §B) — TS still erases the *type* contract, so
// the pure-type half of this proof is `tsc --noEmit`, verified separately by
// `types-contract.typecheck.test.ts`. The circularity twin (`madge --circular src/components/chat-sim`
// => vacío) is a separate CLI check, not a vitest test.

import { describe, expect, it } from 'vitest';
import type { ChannelAdapter } from '../types';
import * as chatSim from '../../index';
import { getAdapter } from '../../adapters/registry';
import { validateScript } from '../../adapters/validate';

// The 16 fields, cero opcionales (adapter-interface-draft.md) — the exact field NAMES, not just
// a count, so swapping in 16 different keys wouldn't slip past this.
const CHANNEL_ADAPTER_FIELDS: readonly (keyof ChannelAdapter)[] = [
  'tail',
  'wallpaper',
  'reactions',
  'reactionConstraint',
  'groupKey',
  'deliveryStates',
  'receipt',
  'counter',
  'timestamp',
  'quote',
  'bubbleTransport',
  'senderKinds',
  'keyboard',
  'album',
  'e2eNotice',
  'avatarSide',
];

describe('type contract exports (acceptance #5)', () => {
  it('the REAL whatsapp adapter is fully populated with zero optional fields (T-022 §B: real, not local)', () => {
    const wa = getAdapter('whatsapp');
    expect(Object.keys(wa).sort()).toEqual([...CHANNEL_ADAPTER_FIELDS].sort());
  });

  it('a REAL Diagnostic (from validateScript, not hand-built) always carries stepIdx when it fires', () => {
    // Telegram's real deliveryStates (adapters/telegram.ts) has no 'delivered' — this script is a
    // genuinely invalid script for the channel, so the Diagnostic below is production output, not
    // a literal the test invented.
    const diagnostics = validateScript(
      [{ k: 'receipt', id: 'm0', to: 'delivered' }],
      'telegram',
    );
    expect(diagnostics).toHaveLength(1);
    expect(diagnostics[0].code).toBe('unsupported-delivery-state');
    expect(diagnostics[0].stepIdx).toBe(0);
    // A valid script for the same channel produces zero diagnostics — proves `Diagnostic[]` can
    // legitimately be empty, not just non-empty-with-stepIdx.
    expect(validateScript([{ k: 'receipt', id: 'm0', to: 'read' }], 'telegram')).toHaveLength(0);
  });

  it('the chat-sim subpath barrel re-exports the type contract + compile/seek/getAdapter/validateScript', () => {
    expect(typeof chatSim.compile).toBe('function');
    expect(typeof chatSim.seek).toBe('function');
    expect(typeof chatSim.createPlayhead).toBe('function');
    expect(typeof chatSim.getAdapter).toBe('function');
    expect(typeof chatSim.validateScript).toBe('function');
    // Real ChannelId member, exercised through the barrel's own getAdapter — not a bare literal
    // assignment (T-022 §B).
    expect(chatSim.getAdapter('telegram').tail).toBe('last');
  });
});
