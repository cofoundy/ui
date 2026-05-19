import * as React from 'react';
import type { PortalConceptsProps } from '../ClientPortalPanel.schema';
import { SectionHeading } from './SectionHeading';

/* ============================================================
   ClientPortalPanel.Concepts
   ============================================================
   Structured 4-up grid (auto-fits down to 2-col then 1-col).
   Chosen direction gets a subtle accent-tinted top border + chip.
   Others labelled in mono small caps below.
   ============================================================ */

const wrap: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '1.5em' };

const grid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  gap: 'clamp(16px, 2vw, 24px)',
};

const tile = (chosen?: boolean): React.CSSProperties => ({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.75em',
  position: 'relative',
});

const imageWrap = (chosen?: boolean): React.CSSProperties => ({
  position: 'relative',
  aspectRatio: '4 / 3',
  width: '100%',
  border: `${chosen ? '2px' : '1px'} solid ${chosen ? 'var(--portal-accent, var(--cf-primary))' : 'var(--cf-border)'}`,
  background: 'var(--cf-card)',
  overflow: 'hidden',
});

const image: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  objectFit: 'cover',
};

const caption: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'baseline',
  gap: '0.5em',
};

const labelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontSize: 14,
  fontWeight: 600,
  color: 'var(--cf-fg)',
};

const chipStyle: React.CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: 10,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  padding: '0.2em 0.55em',
  background: 'var(--portal-accent-soft, color-mix(in srgb, var(--cf-primary) 12%, transparent))',
  color: 'var(--portal-accent, var(--cf-primary))',
};

const explorationStyle: React.CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: 10,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color: 'var(--cf-muted)',
};

export function Concepts({ heading = 'Concepts explorados', concepts }: PortalConceptsProps) {
  if (!concepts || concepts.length === 0) return null;
  return (
    <section data-slot="portal-concepts" style={wrap}>
      <SectionHeading>{heading}</SectionHeading>
      <div style={grid}>
        {concepts.map((c) => (
          <div key={c.label} style={tile(c.chosen)}>
            <div style={imageWrap(c.chosen)}>
              <img src={c.thumbnail} alt={c.label} style={image} loading="lazy" />
            </div>
            <div style={caption}>
              <span style={labelStyle}>{c.label}</span>
              {c.chosen ? <span style={chipStyle}>Final</span> : <span style={explorationStyle}>Exploración</span>}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
