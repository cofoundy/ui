import { describe, it, expect, expectTypeOf } from 'vitest';
import { render } from '@testing-library/react';
import { MoodBoard, type MoodBoardProps } from './MoodBoard';
import { moodBoardSchema, type MoodBoardInput } from './MoodBoard.schema';

const canonical: MoodBoardInput = {
  items: [
    { src: 'https://example.com/a.png', alt: 'Concept A', caption: 'editorial', concept_tag: 'A', source_url: 'https://example.com/src/a' },
    { src: 'https://example.com/b.png', alt: 'Concept B', caption: 'historic', concept_tag: 'B' },
    { src: 'https://example.com/c.png', alt: 'Concept C' },
  ],
  columns: 3,
};

describe('MoodBoard schema', () => {
  it('parses canonical example', () => {
    expect(() => moodBoardSchema.parse(canonical)).not.toThrow();
  });

  it('matches TS interface', () => {
    expectTypeOf<MoodBoardInput>().toMatchTypeOf<MoodBoardProps>();
  });

  it('rejects empty items array', () => {
    const result = moodBoardSchema.safeParse({ items: [] });
    expect(result.success).toBe(false);
  });

  it('rejects item without required `src`', () => {
    const result = moodBoardSchema.safeParse({ items: [{ alt: 'x' }] });
    expect(result.success).toBe(false);
  });

  it('rejects item without required `alt`', () => {
    const result = moodBoardSchema.safeParse({ items: [{ src: 'x' }] });
    expect(result.success).toBe(false);
  });
});

describe('MoodBoard render', () => {
  it('renders concept_tag and source link', () => {
    const { container, getByText } = render(<MoodBoard items={canonical.items as any} />);
    expect(container.querySelector('[data-slot="mood-board-concept-tag"]')).toBeTruthy();
    expect(container.querySelector('[data-slot="mood-board-source"]')).toBeTruthy();
    expect(getByText('editorial')).toBeTruthy();
  });

  it('renders minimal items without optional fields', () => {
    const { container } = render(<MoodBoard items={[{ src: 'a', alt: 'b' }]} />);
    expect(container.querySelectorAll('figure').length).toBe(1);
  });
});
