import { describe, expect, it } from 'vitest';
import { isAllowedReactionEmoji, normalizeReactionEmoji, TELEGRAM_REACTIONS } from '../caps';

describe('TELEGRAM_REACTIONS', () => {
  it('has exactly 73 entries, no duplicates', () => {
    expect(TELEGRAM_REACTIONS.size).toBe(73);
  });

  it('normalizes entries that Telegram spells WITHOUT U+FE0F, so the picker form still hits', () => {
    expect(TELEGRAM_REACTIONS.has('❤️')).toBe(false); // raw picker form (with selector) is not a member…
    expect(TELEGRAM_REACTIONS.has(normalizeReactionEmoji('❤️'))).toBe(true); // …its normalized form is
    expect(TELEGRAM_REACTIONS.has('❤')).toBe(true); // Telegram's own doc spelling, already normalized
  });
});

describe('normalizeReactionEmoji', () => {
  it('strips U+FE0F', () => {
    expect(normalizeReactionEmoji('❤️')).toBe('❤');
  });

  it('is idempotent', () => {
    const once = normalizeReactionEmoji('❤️');
    expect(normalizeReactionEmoji(once)).toBe(once);
  });

  it('is safe on the empty string', () => {
    expect(normalizeReactionEmoji('')).toBe('');
  });
});

describe('isAllowedReactionEmoji', () => {
  it('whatsapp accepts anything (no allowlist)', () => {
    expect(isAllowedReactionEmoji('whatsapp', '🥸')).toBe(true);
    expect(isAllowedReactionEmoji('whatsapp', '❤️')).toBe(true);
  });

  it('telegram rejects an emoji outside its 73-entry allowlist', () => {
    expect(isAllowedReactionEmoji('telegram', '🥸')).toBe(false);
  });

  it('telegram accepts an allowlisted emoji with or without U+FE0F', () => {
    expect(isAllowedReactionEmoji('telegram', '❤')).toBe(true);
    expect(isAllowedReactionEmoji('telegram', '❤️')).toBe(true);
  });
});
