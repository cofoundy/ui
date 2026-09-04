import { describe, expect, it } from 'vitest';
import { rand } from '../prng';

describe('rand() — positional PRNG', () => {
  it('is deterministic: same (seed, stepIdx, slot) => same draw', () => {
    expect(rand(1, 2, 3)).toBe(rand(1, 2, 3));
  });

  it('does not depend on draws made by other steps (positional, not stream-based)', () => {
    const isolated = rand(1, 40, 0);
    for (let i = 0; i < 10; i++) rand(1, 3, i); // simulate step 3 doing extra draws
    const afterNoise = rand(1, 40, 0);
    expect(afterNoise).toBe(isolated);
  });

  it('varies across seed/stepIdx/slot', () => {
    const a = rand(1, 0, 0);
    const b = rand(2, 0, 0);
    const c = rand(1, 1, 0);
    const d = rand(1, 0, 1);
    expect(new Set([a, b, c, d]).size).toBe(4);
  });

  it('returns a value in [0, 1)', () => {
    for (let i = 0; i < 50; i++) {
      const v = rand(i, i * 3, i % 5);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
});
