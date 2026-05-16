import { describe, it, expect, expectTypeOf } from 'vitest';
import { render } from '@testing-library/react';
import { TestimonialCard, type TestimonialCardProps } from './TestimonialCard';
import { testimonialCardSchema, type TestimonialCardInput } from './TestimonialCard.schema';

const canonical: TestimonialCardInput = {
  quote: 'Cofoundy entregó nuestro portal en 3 semanas; competencia pedía 3 meses.',
  author: 'Cliente Tier-2',
  role: 'CEO, Empresa SAC',
  avatar: 'https://example.com/a.png',
  source: 'WhatsApp 2026-05-12',
  sourceUrl: 'https://example.com/source',
};

describe('TestimonialCard schema', () => {
  it('parses canonical example', () => {
    expect(() => testimonialCardSchema.parse(canonical)).not.toThrow();
  });

  it('matches TS interface', () => {
    expectTypeOf<TestimonialCardInput>().toMatchTypeOf<TestimonialCardProps>();
  });

  it('rejects missing required `quote`', () => {
    expect(testimonialCardSchema.safeParse({ ...canonical, quote: undefined }).success).toBe(false);
  });

  it('rejects missing required `author`', () => {
    expect(testimonialCardSchema.safeParse({ ...canonical, author: undefined }).success).toBe(false);
  });

  it('rejects empty `quote`', () => {
    expect(testimonialCardSchema.safeParse({ ...canonical, quote: '' }).success).toBe(false);
  });
});

describe('TestimonialCard render', () => {
  it('renders quote, author, role, source link', () => {
    const { getByText, container } = render(<TestimonialCard {...canonical} />);
    expect(getByText(canonical.quote)).toBeTruthy();
    expect(getByText('Cliente Tier-2')).toBeTruthy();
    expect(container.querySelector('a[href="https://example.com/source"]')).toBeTruthy();
  });

  it('renders minimal valid props', () => {
    const { getByText } = render(<TestimonialCard quote="x" author="y" />);
    expect(getByText('x')).toBeTruthy();
    expect(getByText('y')).toBeTruthy();
  });
});
