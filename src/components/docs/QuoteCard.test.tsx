import { describe, it, expect, expectTypeOf } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QuoteCard, type QuoteCardProps } from './QuoteCard';
import { quoteCardSchema, type QuoteCardInput } from './QuoteCard.schema';

const canonical: QuoteCardInput = {
  client_name: 'XGodel',
  prepared_for: 'John Medina',
  valid_until: '2026-06-30',
  milestones: [
    {
      label: 'Hito 1 — Discovery',
      deliverable: 'Brief + IA + personas',
      amount: 'S/. 1,200',
      due: 'Semana 1',
    },
    {
      label: 'Hito 2 — Visual',
      deliverable: 'Brand direction + moodboard final',
      amount: 'S/. 1,800',
      due: 'Semana 3',
    },
    {
      label: 'Hito 3 — Build',
      deliverable: 'Landing page production-ready, deploy',
      amount: 'S/. 2,000',
      due: 'Semana 5',
    },
  ],
  total: 'S/. 5,000',
  payment_terms: '50% adelanto, 50% al aprobar entrega final.',
  notes: 'Precios en soles + IGV. No incluye dominio ni hosting.',
};

describe('QuoteCard schema', () => {
  it('parses canonical example', () => {
    expect(() => quoteCardSchema.parse(canonical)).not.toThrow();
  });

  it('types align with component props (subset)', () => {
    expectTypeOf<QuoteCardInput>().toMatchTypeOf<QuoteCardProps>();
  });

  it('rejects missing required `client_name`', () => {
    expect(quoteCardSchema.safeParse({ ...canonical, client_name: undefined }).success).toBe(false);
  });

  it('rejects empty milestones', () => {
    expect(quoteCardSchema.safeParse({ ...canonical, milestones: [] }).success).toBe(false);
  });

  it('rejects milestone missing required `amount`', () => {
    expect(
      quoteCardSchema.safeParse({
        ...canonical,
        milestones: [{ label: 'x', deliverable: 'y' }],
      }).success,
    ).toBe(false);
  });

  it('rejects missing required `total`', () => {
    expect(quoteCardSchema.safeParse({ ...canonical, total: undefined }).success).toBe(false);
  });

  it('rejects missing required `payment_terms`', () => {
    expect(quoteCardSchema.safeParse({ ...canonical, payment_terms: undefined }).success).toBe(false);
  });
});

describe('QuoteCard render', () => {
  it('renders all major slots', () => {
    const { container } = render(<QuoteCard {...(canonical as QuoteCardProps)} />);
    expect(container.querySelector('[data-slot="quote-card"]')).toBeTruthy();
    expect(container.querySelector('[data-slot="quote-card-prepared-for"]')).toBeTruthy();
    expect(container.querySelector('[data-slot="quote-card-valid-until"]')).toBeTruthy();
    expect(container.querySelector('[data-slot="quote-card-milestones"]')).toBeTruthy();
    expect(container.querySelector('[data-slot="quote-card-total"]')).toBeTruthy();
    expect(container.querySelector('[data-slot="quote-card-payment-terms"]')).toBeTruthy();
    expect(container.querySelector('[data-slot="quote-card-notes"]')).toBeTruthy();
  });

  it('renders milestones, total, terms', () => {
    render(<QuoteCard {...(canonical as QuoteCardProps)} />);
    expect(screen.getByText('Hito 1 — Discovery')).toBeTruthy();
    expect(screen.getByText('S/. 5,000')).toBeTruthy();
    expect(screen.getByText(/Términos de pago/i)).toBeTruthy();
  });

  it('renders minimal valid props', () => {
    const minimal: QuoteCardProps = {
      client_name: 'X',
      milestones: [{ label: 'a', deliverable: 'b', amount: 'c' }],
      total: 'd',
      payment_terms: 'e',
    };
    const { container } = render(<QuoteCard {...minimal} />);
    expect(container.querySelector('[data-slot="quote-card"]')).toBeTruthy();
    expect(container.querySelector('[data-slot="quote-card-notes"]')).toBeNull();
  });

  it('applies accent tone variant', () => {
    const { container } = render(<QuoteCard {...(canonical as QuoteCardProps)} tone="accent" />);
    expect(container.querySelector('[data-slot="quote-card"]')?.className).toMatch(/border-\[var\(--cf-primary\)\]/);
  });
});
