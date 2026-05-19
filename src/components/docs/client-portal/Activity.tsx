import * as React from 'react';
import type { PortalActivityProps } from '../ClientPortalPanel.schema';
import { SectionHeading } from './SectionHeading';

/* ============================================================
   ClientPortalPanel.Activity
   ============================================================
   Typographic list, max 6 items.
   Each row: date (mono small caps, fixed-width) · description (serif).
   No chrome, no avatars. Calm chronological list.
   ============================================================ */

const wrap: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '1.5em' };

const list: React.CSSProperties = { display: 'flex', flexDirection: 'column' };

const row: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '120px 1fr',
  gap: 'clamp(16px, 2vw, 32px)',
  alignItems: 'baseline',
  padding: '1em 0',
  borderBottom: '1px solid var(--cf-border)',
};

const dateStyle: React.CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: 11,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color: 'var(--cf-muted)',
};

const descStyle: React.CSSProperties = {
  fontFamily: 'Georgia, "Times New Roman", serif',
  fontSize: 16,
  lineHeight: 1.4,
  color: 'var(--cf-fg)',
};

export function Activity({ heading = 'Actividad', items }: PortalActivityProps) {
  if (!items || items.length === 0) return null;
  return (
    <section data-slot="portal-activity" style={wrap}>
      <SectionHeading>{heading}</SectionHeading>
      <div style={list}>
        {items.slice(0, 6).map((it, i) => (
          <div key={`${it.date}-${i}`} style={row}>
            <span style={dateStyle}>{it.date}</span>
            <span style={descStyle}>{it.description}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
