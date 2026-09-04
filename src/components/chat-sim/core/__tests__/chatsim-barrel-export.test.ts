// api-contract.md §"Firmas públicas": `<ChatSim script channel seed mode="demo"|"live" />` must
// be reachable from `@cofoundy/ui/chat-sim` the way compile/seek/getAdapter already are.
// react/ (app, T-007) shipped the component but couldn't wire it into the barrel itself —
// chat-sim/index.ts is [core]'s write cell (file-ownership-matrix.md). This is the falsifiable
// gate: import ONLY from the public barrel, fail if ChatSim isn't there.

import { describe, expect, it } from 'vitest';
import { ChatSim } from '../../index';
import type { ChatSimMode, ChatSimProps } from '../../index';

describe('ChatSim exported from the public chat-sim barrel', () => {
  it('is reachable from @cofoundy/ui/chat-sim without importing react/** directly', () => {
    expect(ChatSim).toBeDefined();
    expect(typeof ChatSim).toBe('function');
  });

  it('ChatSimMode/ChatSimProps types are exported too (api-contract.md firma)', () => {
    const mode: ChatSimMode = 'demo';
    const props: Pick<ChatSimProps, 'channel'> = { channel: 'whatsapp' };
    expect(mode).toBe('demo');
    expect(props.channel).toBe('whatsapp');
  });
});
