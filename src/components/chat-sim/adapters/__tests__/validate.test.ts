// T-005 acceptance #1/#2 — validateScript is the falsifiable instrument
// (adapter-interface-draft.md §"La propiedad que hace falsable al adapter").

import { describe, expect, it } from 'vitest';
import type { SimScript } from '../../core/types';
import { validateScript } from '../validate';

describe('validateScript — acceptance #1 (delivery state per channel)', () => {
  const script: SimScript = [
    { k: 'post', by: 'in', text: 'hola' },
    { k: 'receipt', id: 'm0', to: 'delivered' },
  ];

  it("receipt:'delivered' on telegram compiles to a Diagnostic — telegram has no delivered state", () => {
    const diagnostics = validateScript(script, 'telegram');
    expect(diagnostics).not.toEqual([]);
    expect(diagnostics[0]).toMatchObject({ code: 'unsupported-delivery-state', stepIdx: 1 });
  });

  it('gemelo positivo: the SAME script on whatsapp compiles with zero diagnostics', () => {
    expect(validateScript(script, 'whatsapp')).toEqual([]);
  });
});

describe('validateScript — acceptance #2 (reaction emoji allowlist)', () => {
  const outOfAllowlist = '🥸'; // not in Telegram's 73 (caps.ts / telegram_reactions.py)

  function reactScript(emoji: string): SimScript {
    return [
      { k: 'post', by: 'in', text: 'hola' },
      { k: 'react', id: 'm0', emoji, by: 'out:ai' },
    ];
  }

  it('emoji outside the 73-allowlist ⇒ Diagnostic on telegram', () => {
    const diagnostics = validateScript(reactScript(outOfAllowlist), 'telegram');
    expect(diagnostics).toEqual([
      expect.objectContaining({ code: 'unsupported-reaction-emoji', stepIdx: 1 }),
    ]);
  });

  it('gemelo positivo: the same emoji is unconstrained on whatsapp (any emoji allowed)', () => {
    expect(validateScript(reactScript(outOfAllowlist), 'whatsapp')).toEqual([]);
  });

  it('with U+FE0F and without ⇒ same result (in-allowlist, both compile clean)', () => {
    const withSelector = validateScript(reactScript('❤️'), 'telegram');
    const withoutSelector = validateScript(reactScript('❤'), 'telegram');
    expect(withSelector).toEqual([]);
    expect(withoutSelector).toEqual([]);
    expect(withSelector).toEqual(withoutSelector);
  });

  it('with U+FE0F and without ⇒ same result (out-of-allowlist, both flagged identically)', () => {
    const withSelector = validateScript(reactScript(`${outOfAllowlist}️`), 'telegram');
    const withoutSelector = validateScript(reactScript(outOfAllowlist), 'telegram');
    expect(withSelector).toEqual(withoutSelector);
    expect(withSelector).toHaveLength(1);
  });
});

// T-028 acceptance #3 — validateScript rejects an interactive message on a channel that
// doesn't support it, with its gemelo positivo on one that does.
describe('validateScript — acceptance #3 (interactive-message capability)', () => {
  function interactiveScript(kind: 'buttons' | 'list'): SimScript {
    return [{ k: 'post', by: 'in', text: 'elige una opción', media: { kind } }];
  }

  it("'list' on telegram compiles to a Diagnostic — the Bot API has no list-message primitive", () => {
    const diagnostics = validateScript(interactiveScript('list'), 'telegram');
    expect(diagnostics).toEqual([
      expect.objectContaining({ code: 'unsupported-interactive-message', stepIdx: 0 }),
    ]);
  });

  it('gemelo positivo: the SAME script compiles clean on whatsapp — list is a native WhatsApp interactive type', () => {
    expect(validateScript(interactiveScript('list'), 'whatsapp')).toEqual([]);
  });

  it("'buttons' compiles clean on BOTH channels — reply-buttons (WhatsApp) and inline keyboard (Telegram) are the same capability, different chrome", () => {
    expect(validateScript(interactiveScript('buttons'), 'whatsapp')).toEqual([]);
    expect(validateScript(interactiveScript('buttons'), 'telegram')).toEqual([]);
  });

  it('a non-interactive post (plain text, no media.kind) never triggers this diagnostic', () => {
    const script: SimScript = [{ k: 'post', by: 'in', text: 'hola' }];
    expect(validateScript(script, 'telegram')).toEqual([]);
  });
});

describe('validateScript — a clean script produces zero diagnostics on both implemented channels', () => {
  const script: SimScript = [
    { k: 'post', by: 'in', text: 'hola' },
    { k: 'react', id: 'm0', emoji: '👍', by: 'out:ai' },
    { k: 'receipt', id: 'm0', to: 'read' },
  ];

  it.each(['whatsapp', 'telegram'] as const)('%s', (channel) => {
    expect(validateScript(script, channel)).toEqual([]);
  });
});
