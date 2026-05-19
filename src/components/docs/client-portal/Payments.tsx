import * as React from 'react';
import type { PortalPaymentsProps } from '../ClientPortalPanel.schema';
import { SectionHeading } from './SectionHeading';
import { ArtifactTile } from './ArtifactTile';

/* ============================================================
   ClientPortalPanel.Payments
   ============================================================
   Full-width band: thin progress bar + amount label + next
   milestone in serif italic. Optional cotización PDF to the right.
   Calm, no chunkiness.
   ============================================================ */

const wrap: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '1.5em' };

const layout: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 280px',
  gap: 'clamp(24px, 4vw, 48px)',
  alignItems: 'center',
};

const head: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'baseline',
  gap: '1em',
  marginBottom: '0.85em',
};

const amount: React.CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: 18,
  color: 'var(--cf-fg)',
  letterSpacing: '0.02em',
};

const pctLabel: React.CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: 11,
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  color: 'var(--cf-muted)',
};

const barWrap: React.CSSProperties = {
  width: '100%',
  height: 6,
  background: 'var(--cf-card)',
  border: '1px solid var(--cf-border)',
  overflow: 'hidden',
};

const milestone: React.CSSProperties = {
  marginTop: '1em',
  fontFamily: 'Georgia, "Times New Roman", serif',
  fontStyle: 'italic',
  fontSize: 16,
  color: 'var(--cf-muted)',
};

export function Payments({ heading = 'Pagos', state, cotizacion }: PortalPaymentsProps) {
  const safe = Math.max(0, Math.min(100, Math.round(state.percentPaid)));
  return (
    <section data-slot="portal-payments" style={wrap}>
      <SectionHeading>{heading}</SectionHeading>
      <div className="cf-portal-payments-grid" style={cotizacion ? layout : { display: 'block' }}>
        <div>
          <div style={head}>
            <span style={amount}>{state.amountLabel ?? `${safe}% pagado`}</span>
            <span style={pctLabel}>{safe}%</span>
          </div>
          <div style={barWrap} aria-label="Progreso de pago">
            <div
              style={{
                width: `${safe}%`,
                height: '100%',
                background: 'var(--portal-accent, var(--cf-primary))',
                transition: 'width var(--cf-duration-smooth, 400ms) var(--cf-ease-default, ease)',
              }}
            />
          </div>
          {state.nextMilestone && <p style={milestone}>Hito siguiente: {state.nextMilestone}</p>}
        </div>
        {cotizacion && (
          <div>
            <ArtifactTile artifact={cotizacion} aspect="portrait" />
          </div>
        )}
      </div>
      <style>{`
        @media (max-width: 768px) {
          .cf-portal-payments-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
