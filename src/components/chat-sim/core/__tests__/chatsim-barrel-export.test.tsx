// api-contract.md §"Firmas públicas": `<ChatSim script channel seed mode="demo"|"live" />` must
// be reachable from `@cofoundy/ui/chat-sim` the way compile/seek/getAdapter already are.
// react/ (app, T-007) shipped the component but couldn't wire it into the barrel itself —
// chat-sim/index.ts is [core]'s write cell (file-ownership-matrix.md). This is the falsifiable
// gate: import ONLY from the public barrel, fail if ChatSim isn't there.

import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { ChatSim } from '../../index';
import type { ChatSimMode, ChatSimProps, SimScript } from '../../index';
import { getAdapter } from '../../adapters/registry';

const SCRIPT: SimScript = [{ k: 'post', by: 'in', text: 'hola', delayMs: 0 }];

describe('ChatSim exported from the public chat-sim barrel', () => {
  it('is reachable from @cofoundy/ui/chat-sim without importing react/** directly', () => {
    expect(ChatSim).toBeDefined();
    expect(typeof ChatSim).toBe('function');
  });

  // T-022 §B: the previous version of this test assigned a literal to a locally-declared
  // `ChatSimMode`/`ChatSimProps` variable and asserted the literal equals itself — always true,
  // regardless of whether the exported types mean anything. Fixed by feeding the typed values
  // into the REAL exported `ChatSim` (via the barrel, not a direct react/ import) and asserting
  // on the real DOM effect they produce.
  it('ChatSimMode/ChatSimProps type real props consumed by the real barrel-exported ChatSim', () => {
    const mode: ChatSimMode = 'demo';
    const channel: Pick<ChatSimProps, 'channel'>['channel'] = 'whatsapp';
    const { container } = render(<ChatSim script={SCRIPT} channel={channel} seed={1} mode={mode} />);
    const root = container.querySelector('.cf-chat-sim');
    expect(root?.getAttribute('data-mode')).toBe(mode);
    // `channel` drives the real adapter lookup inside ChatSim — asserted against the SAME
    // `getAdapter` the component itself calls, not a re-typed copy of its output.
    expect(root?.getAttribute('data-wallpaper')).toBe(getAdapter(channel).wallpaper);
  });
});
