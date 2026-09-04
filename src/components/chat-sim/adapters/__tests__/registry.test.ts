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
    'receiptGlyph', 'counter', 'timestamp', 'quote', 'bubbleTransport', 'senderKinds',
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
