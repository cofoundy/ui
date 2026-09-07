// __tests__/chat-sim/chatsim-cross-channel-states.test.tsx — qa's own write cell.
//
// react/__tests__/ChatSim.test.tsx ([app]'s own suite, out of qa's write cell) imports `ChatSim`
// directly from '../ChatSim', never through the public subpath barrel (`@cofoundy/ui/chat-sim`,
// i.e. `chat-sim/index.ts`) — so nothing exercises that barrel's own `ChatSim` re-export, and
// nothing there posts a message with a reaction, an edited label, or drives the Telegram-only
// `views` counter / own-row reaction layout. This closes those gaps through the SAME public
// `<ChatSim>` contract, imported the way a real `@cofoundy/ui/chat-sim` consumer would.

import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ChatSim } from '../../components/chat-sim';
import type { SimScript } from '../../components/chat-sim/core/types';

describe('<ChatSim> — imported via the public barrel', () => {
  it('is reachable as @cofoundy/ui/chat-sim\'s own export (not just react/ChatSim.tsx directly)', () => {
    const script: SimScript = [{ k: 'post', by: 'in', text: 'hola' }];
    render(<ChatSim script={script} channel="whatsapp" seed={1} mode="live" />);
    expect(screen.getByText('hola')).toBeInTheDocument();
  });

  // Was a KNOWN BUG (.cofoundy/tasks/T-010.md, role_owner: app) — the `&&` operator-precedence
  // defect in react/MessageThread.tsx:169-170 that made `reactionsInsideBubble`/`reactionsOwnRow`
  // plain booleans instead of the JSX element. Fixed by [app] in `7f88aae`; team-lead verified
  // with mutation (restoring the original `&&` breaks 3 of these 4 scenarios). Flipped from
  // `it.fails` back to a normal `it` — the tripwire did its job.
  it('WhatsApp: a reaction renders as an overlay pill anchored to its message', () => {
    const script: SimScript = [
      { k: 'post', by: 'in', text: 'reservado!' },
      { k: 'react', id: 'm0', emoji: '❤', by: 'out:ai' },
    ];
    const { container } = render(<ChatSim script={script} channel="whatsapp" seed={1} mode="live" />);
    const reactions = container.querySelector('.cf-reactions');
    expect(reactions).not.toBeNull();
    expect(reactions?.getAttribute('data-style')).toBe('overlay-below'); // adapters/whatsapp.ts
    expect(reactions?.textContent).toContain('❤');
  });

  it('an edited message carries the caller-supplied editedLabel', () => {
    const script: SimScript = [
      { k: 'post', by: 'out:ai', text: 'reservado para 4' },
      { k: 'edit', id: 'm0', v: 1 },
    ];
    render(<ChatSim script={script} channel="whatsapp" seed={1} mode="live" editedLabel="Editado" />);
    expect(screen.getByText('Editado')).toBeInTheDocument();
  });

  it('a deleted message never renders in the thread', () => {
    const script: SimScript = [
      { k: 'post', by: 'in', text: 'oops no debía salir' },
      { k: 'delete', id: 'm0', scope: 'all' },
    ];
    render(<ChatSim script={script} channel="whatsapp" seed={1} mode="live" />);
    expect(screen.queryByText('oops no debía salir')).not.toBeInTheDocument();
  });

  // Was: expected `counter:'views'` on Telegram's 1:1/group adapter. Retired by T-012
  // (adapters/telegram.ts:43 — 👁 N is broadcast-only, and this cycle's Telegram adapter models
  // 1:1/group, so `counter` is 'none' there too, same as WhatsApp). Rewritten against the live
  // contract: the ticks' GLYPH flips at read (color doesn't, telegram-fidelity-fix.md §F-2), and
  // the `.cf-views` slot never renders through this adapter.
  it('Telegram: tick glyph flips at read (color fixed) — no .cf-views, the slot is broadcast-only (T-012)', () => {
    const sentScript: SimScript = [
      { k: 'post', by: 'out:human:agent_1', text: 'promo del finde' },
      { k: 'receipt', id: 'm0', to: 'sent' },
    ];
    const readScript: SimScript = [...sentScript, { k: 'receipt', id: 'm0', to: 'read' }];
    const { container: sentContainer } = render(<ChatSim script={sentScript} channel="telegram" seed={1} mode="live" />);
    const { container: readContainer } = render(<ChatSim script={readScript} channel="telegram" seed={1} mode="live" />);
    const sentTick = sentContainer.querySelector<SVGSVGElement>('svg.cf-receipt')!;
    const readTick = readContainer.querySelector<SVGSVGElement>('svg.cf-receipt')!;
    expect(sentTick.querySelectorAll('path')).toHaveLength(1); // single tick
    expect(readTick.querySelectorAll('path')).toHaveLength(2); // double tick — glyph flipped
    expect(sentTick.style.color).toBe(readTick.style.color); // color fixed on Telegram
    expect(sentContainer.querySelector('.cf-views')).toBeNull();
    expect(readContainer.querySelector('.cf-views')).toBeNull();
  });

  // Same root cause as the WhatsApp case above (T-010, fixed in `7f88aae`) — the `own-row`
  // branch was also a boolean, never the element.
  it('Telegram: reactions render in their own row (own-row), not WhatsApp\'s overlay', () => {
    const script: SimScript = [
      { k: 'post', by: 'out:human:agent_1', text: 'promo del finde' },
      { k: 'react', id: 'm0', emoji: '🔥', by: 'in' },
    ];
    const { container } = render(<ChatSim script={script} channel="telegram" seed={1} mode="live" />);
    expect(container.querySelector('.cf-reactions')?.getAttribute('data-style')).toBe('own-row');
  });

  // Was: expected a `[data-read]` attribute. Retired in the migration to `ReceiptModel`
  // (adapters/whatsapp.ts:25 documents it) — color is now adapter data (`style.color`), not a DOM
  // attribute. Rewritten against the live contract: WhatsApp keeps the glyph fixed (double-check)
  // and flips COLOR to `#53bdeb` at read (telegram-fidelity-fix.md §F-2).
  it('WhatsApp: tick color flips to blue at read (glyph fixed at double-check) — the tick is ReceiptModel data', () => {
    const deliveredScript: SimScript = [
      { k: 'post', by: 'out:ai', text: 'listo' },
      { k: 'receipt', id: 'm0', to: 'delivered' },
    ];
    const readScript: SimScript = [...deliveredScript, { k: 'receipt', id: 'm0', to: 'read' }];
    const { container: deliveredContainer } = render(
      <ChatSim script={deliveredScript} channel="whatsapp" seed={1} mode="live" />,
    );
    const { container: readContainer } = render(<ChatSim script={readScript} channel="whatsapp" seed={1} mode="live" />);
    const deliveredTick = deliveredContainer.querySelector<SVGSVGElement>('svg.cf-receipt')!;
    const readTick = readContainer.querySelector<SVGSVGElement>('svg.cf-receipt')!;
    expect(deliveredTick.querySelectorAll('path')).toHaveLength(2);
    expect(readTick.querySelectorAll('path')).toHaveLength(2); // glyph fixed
    expect(deliveredTick.style.color).not.toBe(readTick.style.color); // color flipped
    expect(readTick.style.color).toBe('rgb(83, 189, 235)'); // adapters/whatsapp.ts's read state (#53bdeb)
  });
});
