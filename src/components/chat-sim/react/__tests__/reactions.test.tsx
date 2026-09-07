// T-010: reactions never rendered via <ChatSim>, any channel — `a && b` in MessageThread.tsx
// evaluated to a plain boolean (`b`), never to the reaction element itself, so
// `{reactionsInsideBubble}`/`{reactionsOwnRow}` rendered `{true}`/`{false}` (nothing). Found by
// [qa] via the public barrel (`src/__tests__/chat-sim/chatsim-cross-channel-states.test.tsx`,
// their `it.fails` tripwires — not edited here, that file is qa's write cell per
// file-ownership-matrix.md; T-010.md's own acceptance says not to touch it). This is [app]'s own
// coverage of the fix, at both the `<ChatSim>` public-contract level and the `MessageThread`
// adapter-inversion level T-010 acceptance #2 names as the falsifiable twin.

import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { ChatSim } from '../ChatSim';
import { MessageThread } from '../MessageThread';
import { compile } from '../../core/compile';
import { getAdapter } from '../../adapters/registry';
import type { ChannelAdapter, SimScript } from '../../core/types';
import { dateSeparators, draftIntervals, fullSequence, postedAtByMsgId, stateAtStep } from '../engine';

describe('T-010 — reactions render (regression coverage)', () => {
  it('WhatsApp (overlay-below): reaction renders nested inside .cf-bubble', () => {
    const script: SimScript = [
      { k: 'post', by: 'in', text: 'reservado!' },
      { k: 'react', id: 'm0', emoji: '❤', by: 'out:ai' },
    ];
    const { container } = render(<ChatSim script={script} channel="whatsapp" seed={1} mode="live" />);
    const bubble = container.querySelector('.cf-bubble');
    const reactions = bubble?.querySelector('.cf-reactions');
    expect(reactions).not.toBeNull();
    expect(reactions?.getAttribute('data-style')).toBe('overlay-below');
    expect(reactions?.textContent).toContain('❤');
  });

  it('Telegram (own-row): reaction renders as a sibling of .cf-bubble, not nested in it', () => {
    const script: SimScript = [
      { k: 'post', by: 'out:human:agent_1', text: 'promo del finde' },
      { k: 'react', id: 'm0', emoji: '🔥', by: 'in' },
    ];
    const { container } = render(<ChatSim script={script} channel="telegram" seed={1} mode="live" />);
    const li = container.querySelector('.cf-msg')!;
    const reactions = li.querySelector('.cf-reactions');
    expect(reactions).not.toBeNull();
    expect(reactions?.getAttribute('data-style')).toBe('own-row');
    expect(li.querySelector('.cf-bubble')?.contains(reactions)).toBe(false); // sibling, not nested
    expect(reactions?.textContent).toContain('🔥');
  });

  it('gemelo negativo: zero reactions renders neither node (this direction already worked)', () => {
    const script: SimScript = [{ k: 'post', by: 'in', text: 'sin reacciones' }];
    const { container } = render(<ChatSim script={script} channel="whatsapp" seed={1} mode="live" />);
    expect(container.querySelector('.cf-reactions')).toBeNull();
  });

  it('gemelo: inverting adapter.reactions (own-row <-> overlay-below) moves the node — MessageThread level', () => {
    const script: SimScript = [
      { k: 'post', by: 'in', text: 'hola' },
      { k: 'react', id: 'm0', emoji: '👍', by: 'out:ai' },
    ];
    const T0 = 1767261600000;
    const timeline = compile(script, { seed: 1, channel: 'whatsapp', locale: 'es-PE', tz: 'America/Lima', t0: T0 });
    const postedAt = postedAtByMsgId(timeline.frames);
    const finalState = stateAtStep(timeline, timeline.frames.length);
    const seps = dateSeparators(finalState.order, postedAt, T0, 'es-PE', 'America/Lima');
    const typing = draftIntervals(timeline);
    const seq = fullSequence(finalState.order, seps, typing);
    const visibleIds = new Set(finalState.order);
    const baseAdapter = getAdapter('whatsapp'); // overlay-below

    const threadProps = {
      finalOrder: finalState.order,
      seq,
      visibleIds,
      step: timeline.frames.length,
      msgs: finalState.msgs,
      postedAt,
      locale: 'es-PE',
      tz: 'America/Lima',
      t0: T0,
      editedLabel: 'Editado',
      contactName: 'Chat',
      contactStatus: '',
    };

    const overlay = render(<MessageThread {...threadProps} adapter={baseAdapter} />);
    const overlayReactions = overlay.container.querySelector('.cf-reactions');
    expect(overlayReactions?.getAttribute('data-style')).toBe('overlay-below');
    expect(overlay.container.querySelector('.cf-bubble')?.contains(overlayReactions)).toBe(true);
    overlay.unmount();

    const invertedAdapter: ChannelAdapter = { ...baseAdapter, reactions: 'own-row' };
    const ownRow = render(<MessageThread {...threadProps} adapter={invertedAdapter} />);
    const ownRowReactions = ownRow.container.querySelector('.cf-reactions');
    expect(ownRowReactions?.getAttribute('data-style')).toBe('own-row');
    expect(ownRow.container.querySelector('.cf-bubble')?.contains(ownRowReactions)).toBe(false);
  });
});
