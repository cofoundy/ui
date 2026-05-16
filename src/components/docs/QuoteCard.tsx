import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';

export interface QuoteMilestone {
  /** Hito label (e.g. "Hito 1 — Discovery + Brief"). */
  label: string;
  /** Plain-text or formatted deliverable description. */
  deliverable: string;
  /** Total or per-hito monetary amount as a pre-formatted string. */
  amount: string;
  /** Optional ISO-ish due date string ("2026-06-15", "Semana 3"). */
  due?: string;
}

const quoteCardVariants = cva(
  'cf-quote-card my-6 rounded-2xl border border-[var(--cf-border)] bg-[var(--cf-card)] p-6 shadow-sm',
  {
    variants: {
      tone: {
        default: '',
        accent: 'border-[var(--cf-primary)]',
      },
    },
    defaultVariants: {
      tone: 'default',
    },
  },
);

export interface QuoteCardProps extends VariantProps<typeof quoteCardVariants> {
  /** Client display name (typically `recipient.company`). */
  client_name: string;
  /** Preparado para — primary contact / decision-maker. */
  prepared_for?: string;
  /** Cotización valid-until date (ISO string). */
  valid_until?: string;
  /** Hitos / milestones table. */
  milestones: QuoteMilestone[];
  /** Total monetary amount (pre-formatted). */
  total: string;
  /** Payment terms paragraph (e.g. "50% adelanto, 50% al aprobar"). */
  payment_terms: string;
  /** Optional notes / disclaimers. */
  notes?: string;
  /** Optional className passthrough. */
  className?: string;
}

export function QuoteCard({
  client_name,
  prepared_for,
  valid_until,
  milestones,
  total,
  payment_terms,
  notes,
  tone,
  className,
}: QuoteCardProps) {
  return (
    <section
      data-slot="quote-card"
      aria-label={`Cotización para ${client_name}`}
      className={cn(quoteCardVariants({ tone }), className)}
    >
      <header className="cf-quote-card__header mb-4 flex flex-wrap items-baseline justify-between gap-3 border-b border-[var(--cf-border)] pb-3">
        <div>
          <div className="text-[0.72em] font-semibold uppercase tracking-wider text-[var(--cf-muted)]">
            Cotización
          </div>
          <h3 className="m-0 font-[var(--font-brand)] text-[1.3em] font-bold text-[var(--cf-fg)]">
            {client_name}
          </h3>
          {prepared_for && (
            <div data-slot="quote-card-prepared-for" className="text-[0.9em] text-[var(--cf-muted)]">
              Preparado para: <span className="text-[var(--cf-fg)]">{prepared_for}</span>
            </div>
          )}
        </div>
        {valid_until && (
          <div
            data-slot="quote-card-valid-until"
            className="rounded-md border border-[var(--cf-border)] px-3 py-1 text-right text-[0.78em] text-[var(--cf-muted)]"
          >
            <div className="uppercase tracking-wider">Válido hasta</div>
            <div className="font-mono text-[var(--cf-fg)]">{valid_until}</div>
          </div>
        )}
      </header>

      <div className="cf-quote-card__milestones overflow-x-auto">
        <table className="w-full border-collapse text-[0.95em]" data-slot="quote-card-milestones">
          <thead>
            <tr>
              <th className="border-b border-[var(--cf-border)] px-3 py-2 text-left text-[0.72em] font-semibold uppercase tracking-wider text-[var(--cf-muted)]">
                Hito
              </th>
              <th className="border-b border-[var(--cf-border)] px-3 py-2 text-left text-[0.72em] font-semibold uppercase tracking-wider text-[var(--cf-muted)]">
                Entregable
              </th>
              <th className="border-b border-[var(--cf-border)] px-3 py-2 text-left text-[0.72em] font-semibold uppercase tracking-wider text-[var(--cf-muted)]">
                Fecha
              </th>
              <th className="border-b border-[var(--cf-border)] px-3 py-2 text-right text-[0.72em] font-semibold uppercase tracking-wider text-[var(--cf-muted)]">
                Monto
              </th>
            </tr>
          </thead>
          <tbody>
            {milestones.map((m, i) => (
              <tr key={i}>
                <td className="border-b border-[var(--cf-border)] px-3 py-2 align-top font-semibold text-[var(--cf-fg)]">
                  {m.label}
                </td>
                <td className="border-b border-[var(--cf-border)] px-3 py-2 align-top text-[var(--cf-fg)]">
                  {m.deliverable}
                </td>
                <td className="border-b border-[var(--cf-border)] px-3 py-2 align-top font-mono text-[0.85em] text-[var(--cf-muted)]">
                  {m.due ?? '—'}
                </td>
                <td className="border-b border-[var(--cf-border)] px-3 py-2 text-right align-top font-mono text-[var(--cf-fg)]">
                  {m.amount}
                </td>
              </tr>
            ))}
            <tr>
              <td colSpan={3} className="px-3 pt-3 text-right text-[0.85em] font-semibold uppercase tracking-wider text-[var(--cf-muted)]">
                Total
              </td>
              <td
                data-slot="quote-card-total"
                className="px-3 pt-3 text-right font-mono text-[1.1em] font-bold text-[var(--cf-fg)]"
              >
                {total}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div data-slot="quote-card-payment-terms" className="cf-quote-card__terms mt-4 rounded-md bg-[rgba(70,160,208,0.08)] p-3 text-[0.9em] text-[var(--cf-fg)]">
        <span className="font-semibold">Términos de pago: </span>
        {payment_terms}
      </div>

      {notes && (
        <div data-slot="quote-card-notes" className="cf-quote-card__notes mt-3 text-[0.85em] italic text-[var(--cf-muted)]">
          {notes}
        </div>
      )}
    </section>
  );
}

export { quoteCardVariants };
