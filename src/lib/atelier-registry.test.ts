import { describe, it, expect } from 'vitest';
import { ATELIER_COMPONENTS, type AtelierComponentName } from './atelier-registry';

const EXPECTED_NAMES: AtelierComponentName[] = [
  'BuildProgress',
  'ComparisonMatrix',
  'DesignSystemPanel',
  'KPIBoard',
  'MoodBoard',
  'PersonaCard',
  'QuoteCard',
  'Sitemap',
  'TestimonialCard',
];

describe('ATELIER_COMPONENTS registry', () => {
  it('exposes all 9 atelier components', () => {
    const keys = Object.keys(ATELIER_COMPONENTS).sort();
    expect(keys).toEqual([...EXPECTED_NAMES].sort());
    expect(keys).toHaveLength(9);
  });

  it('keeps registry order alphabetical for diff stability', () => {
    const keys = Object.keys(ATELIER_COMPONENTS);
    const sorted = [...keys].sort();
    expect(keys).toEqual(sorted);
  });

  it.each(EXPECTED_NAMES)('entry %s has component + schema + description + example', (name) => {
    const entry = ATELIER_COMPONENTS[name];
    expect(entry.component).toBeTypeOf('function');
    expect(entry.schema).toBeDefined();
    expect(typeof entry.description).toBe('string');
    expect(entry.description.length).toBeGreaterThan(0);
    expect(entry.description.length).toBeLessThanOrEqual(220);
    expect(entry.example).toBeTypeOf('object');
  });

  it.each(EXPECTED_NAMES)('entry %s example parses against its schema', (name) => {
    const { schema, example } = ATELIER_COMPONENTS[name];
    const result = schema.safeParse(example);
    if (!result.success) {
      // Surface a readable error on failure.
      // eslint-disable-next-line no-console
      console.error(`Schema parse failed for ${name}:`, result.error.format());
    }
    expect(result.success).toBe(true);
  });
});
