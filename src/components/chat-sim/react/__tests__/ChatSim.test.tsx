// react/__tests__/ChatSim.test.tsx — smoke coverage for the public `<ChatSim>` component itself
// (T-007's actual export), on top of the acceptance-mapped suites (snapshot-cross-check.test.tsx,
// mobile-viewport.test.tsx, mobile-checklist.test.ts) which cover the acceptance criteria via
// the lower-level pieces directly.

import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { ChatSim } from '../ChatSim';
import type { SimScript } from '../../core/types';

const SCRIPT: SimScript = [
  { k: 'post', by: 'in', text: 'Hola', delayMs: 0 },
  { k: 'post', by: 'out:ai', text: 'Hola, ¿en qué te ayudo?', delayMs: 100 },
];

describe('<ChatSim>', () => {
  it('mode="demo" renders the visual-only composer, never a real textarea', () => {
    const { container, unmount } = render(<ChatSim script={SCRIPT} channel="whatsapp" seed={1} mode="demo" />);
    expect(container.querySelector('.cf-composer')).not.toBeNull();
    expect(container.querySelector('.cf-live-composer')).toBeNull();
    expect(container.querySelector('textarea')).toBeNull();
    unmount(); // stops the internal Playhead's rAF loop (T-007 must not leak it past unmount)
  });

  it('mode="live" renders the real composer and freezes the thread at its final step', () => {
    render(<ChatSim script={SCRIPT} channel="whatsapp" seed={1} mode="live" />);
    expect(screen.getByText('Hola')).toBeInTheDocument();
    expect(screen.getByText('Hola, ¿en qué te ayudo?')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Mensaje')).toBeInTheDocument();
  });

  it('mode="live" — typing and sending appends the message and fires onLiveSend', () => {
    const onLiveSend = vi.fn();
    render(<ChatSim script={SCRIPT} channel="whatsapp" seed={1} mode="live" onLiveSend={onLiveSend} />);

    const textarea = screen.getByPlaceholderText('Mensaje');
    fireEvent.change(textarea, { target: { value: '  Para 4 por favor  ' } });
    fireEvent.click(screen.getByRole('button', { name: 'Enviar' }));

    expect(onLiveSend).toHaveBeenCalledWith('Para 4 por favor'); // trimmed
    expect(screen.getByText('Para 4 por favor')).toBeInTheDocument();
    expect((textarea as HTMLTextAreaElement).value).toBe(''); // cleared after send
  });

  it('mode="live" — sending an empty/whitespace-only message is a no-op', () => {
    const onLiveSend = vi.fn();
    render(<ChatSim script={SCRIPT} channel="whatsapp" seed={1} mode="live" onLiveSend={onLiveSend} />);

    fireEvent.change(screen.getByPlaceholderText('Mensaje'), { target: { value: '   ' } });
    expect(screen.getByRole('button', { name: 'Enviar' })).toBeDisabled();
    expect(onLiveSend).not.toHaveBeenCalled();
  });
});
