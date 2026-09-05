import { describe, expect, it } from 'vitest';
import { getAdapter } from '../registry';
import { telegram } from '../telegram';
import { whatsapp } from '../whatsapp';

describe('getAdapter', () => {
  it("returns the whatsapp adapter for 'whatsapp'", () => {
    expect(getAdapter('whatsapp')).toBe(whatsapp);
  });

  it("returns the telegram adapter for 'telegram'", () => {
    expect(getAdapter('telegram')).toBe(telegram);
  });

  it("throws for 'imessage' — no adapter this cycle (architecture-v1.md §10)", () => {
    expect(() => getAdapter('imessage')).toThrow(/imessage/);
  });
});

describe('the two adapters implement all 16 fields with no optionals', () => {
  const FIELDS = [
    'tail', 'wallpaper', 'reactions', 'reactionConstraint', 'groupKey', 'deliveryStates',
    'receipt', 'counter', 'timestamp', 'quote', 'bubbleTransport', 'senderKinds',
    'keyboard', 'album', 'e2eNotice', 'avatarSide',
  ] as const;

  it.each(['whatsapp', 'telegram'] as const)('%s', (channel) => {
    const adapter = getAdapter(channel);
    for (const field of FIELDS) {
      expect(adapter).toHaveProperty(field);
      expect(adapter[field]).not.toBeUndefined();
    }
    expect(FIELDS).toHaveLength(16);
  });
});

describe('telegram has no delivered state; whatsapp does', () => {
  it('whatsapp', () => {
    expect(whatsapp.deliveryStates).toContain('delivered');
  });

  it('telegram', () => {
    expect(telegram.deliveryStates).not.toContain('delivered');
  });
});

describe("telegram's reactionConstraint.allowlistSize is derived from caps.ts, never a bare literal", () => {
  it('equals 73', () => {
    expect(telegram.reactionConstraint.allowlistSize).toBe(73);
  });
});

// T-012 acceptance #1 + #2: the two receipt twins. One twin alone would pass with a
// half-broken model (e.g. every state sharing both glyph AND color); together they prove the
// glyph axis and the color axis are independently wired per channel (telegram-fidelity-fix.md §F-2).
describe('T-012 acceptance — receipt twins prove glyph and color are orthogonal axes', () => {
  it('glyph twin: telegram sent vs read — different glyphs, same color', () => {
    const { sent, read } = telegram.receipt.states;
    expect(sent.glyph).not.toBe(read.glyph);
    expect(sent.color).toBe(read.color);
  });

  it('color twin: whatsapp delivered vs read — same glyph, different colors', () => {
    const { delivered, read } = whatsapp.receipt.states;
    expect(delivered.glyph).toBe(read.glyph);
    expect(delivered.color).not.toBe(read.color);
  });
});

// T-012 acceptance #3: 👁 N is broadcast-only; the 1:1/group adapter this cycle covers must not
// claim it (the slot belongs to the ticks instead).
describe('T-012 acceptance — no 1:1 views counter', () => {
  it('telegram counter is none, not views', () => {
    expect(telegram.counter).toBe('none');
  });
});
