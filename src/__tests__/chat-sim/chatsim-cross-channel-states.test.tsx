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

  // KNOWN BUG, filed as .cofoundy/tasks/T-010.md (role_owner: app) — NOT fixed here, `react/**`
  // is `app`'s write cell (file-ownership-matrix.md), qa only has `R`. Root cause: `MessageThread
  // .tsx:169-170` writes `reactionsEl && adapter.reactions !== 'own-row'` — `a && b` evaluates to
  // `b` (a plain boolean) when `a` is truthy, never to `a` itself, so `reactionsInsideBubble` /
  // `reactionsOwnRow` are booleans, never the JSX element — React renders `{true}`/`{false}` as
  // nothing. Confirmed independently of this test (compile()+seek() show the reaction IS present
  // in SimState; rendering <MessageThread> directly with hand-built props reproduces the same
  // empty output) — this isn't a fixture/mapping issue on qa's side.
  // `it.fails`: this documents the CURRENT (broken) behavior without silently passing against
  // it — flip to `it` once T-010 lands; if this block ever starts passing unexpectedly, vitest
  // reports IT as the failure, which is the point (a tripwire, not a green light).
  it.fails('WhatsApp: a reaction renders as an overlay pill anchored to its message', () => {
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

  it('Telegram: views counter renders (whatsapp.ts has counter:"none", telegram.ts has "views")', () => {
    const script: SimScript = [
      { k: 'post', by: 'out:human:agent_1', text: 'promo del finde' },
      { k: 'views', id: 'm0', n: 42 },
    ];
    const { container } = render(<ChatSim script={script} channel="telegram" seed={1} mode="live" />);
    const views = container.querySelector('.cf-views');
    expect(views).not.toBeNull();
    expect(views?.textContent).toBe('42');
  });

  // Same root cause as the WhatsApp case above (T-010) — the `own-row` branch is also a boolean,
  // never the element.
  it.fails('Telegram: reactions render in their own row (own-row), not WhatsApp\'s overlay', () => {
    const script: SimScript = [
      { k: 'post', by: 'out:human:agent_1', text: 'promo del finde' },
      { k: 'react', id: 'm0', emoji: '🔥', by: 'in' },
    ];
    const { container } = render(<ChatSim script={script} channel="telegram" seed={1} mode="live" />);
    expect(container.querySelector('.cf-reactions')?.getAttribute('data-style')).toBe('own-row');
  });

  it('read receipt renders the blue tick (data-read="true") on WhatsApp\'s double-tick glyph', () => {
    const script: SimScript = [
      { k: 'post', by: 'out:ai', text: 'listo' },
      { k: 'receipt', id: 'm0', to: 'read' },
    ];
    const { container } = render(<ChatSim script={script} channel="whatsapp" seed={1} mode="live" />);
    const tick = container.querySelector('.cf-receipt');
    expect(tick?.getAttribute('data-read')).toBe('true');
  });
});
