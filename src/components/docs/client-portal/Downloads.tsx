import * as React from 'react';
import type { DownloadItem, PortalDownloadsProps } from '../ClientPortalPanel.schema';
import { SectionHeading } from './SectionHeading';

/* ============================================================
   ClientPortalPanel.Downloads — LIST archetype with prominent
   download affordance per row.
   ============================================================
   Each row: format chip (left) · title + optional description
   (center) · size (right) · download arrow.
   ============================================================ */

const wrap: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '1.5em' };

const list: React.CSSProperties = { display: 'flex', flexDirection: 'column' };

const row: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '64px 1fr auto auto',
  gap: 'clamp(12px, 2vw, 24px)',
  alignItems: 'center',
  padding: '1.1em 0',
  borderBottom: '1px solid var(--cf-border)',
  textDecoration: 'none',
  color: 'inherit',
  transition: 'background var(--cf-duration-fast, 150ms) var(--cf-ease-default, ease)',
};

const formatChip: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 48,
  height: 48,
  background: 'var(--cf-card)',
  border: '1px solid var(--cf-border)',
  fontFamily: 'var(--font-mono)',
  fontSize: 10,
  fontWeight: 600,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color: 'var(--cf-fg)',
};

const title: React.CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontSize: 16,
  fontWeight: 600,
  color: 'var(--cf-fg)',
  margin: 0,
  lineHeight: 1.3,
};

const desc: React.CSSProperties = {
  fontFamily: 'Georgia, "Times New Roman", serif',
  fontStyle: 'italic',
  fontSize: 13,
  color: 'var(--cf-muted)',
  margin: '0.3em 0 0',
  lineHeight: 1.4,
};

const size: React.CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: 11,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color: 'var(--cf-muted)',
};

const arrow: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 32,
  height: 32,
  background: 'var(--portal-accent-soft, color-mix(in srgb, var(--cf-primary) 12%, transparent))',
  color: 'var(--portal-accent, var(--cf-primary))',
  fontFamily: 'var(--font-mono)',
  fontSize: 16,
  fontWeight: 600,
};

export function Downloads({ heading = 'Descargas', items }: PortalDownloadsProps) {
  if (!items || items.length === 0) return null;
  return (
    <section data-slot="portal-downloads" style={wrap}>
      <SectionHeading>{heading}</SectionHeading>
      <div style={list}>
        {items.map((d, i) => (
          <a
            key={`${d.title}-${i}`}
            href={d.url}
            target="_blank"
            rel="noopener noreferrer"
            download
            data-slot="portal-download-row"
            style={row}
            className="cf-portal-download-row"
          >
            <span style={formatChip}>{d.format}</span>
            <div style={{ minWidth: 0 }}>
              <h3 style={title}>{d.title}</h3>
              {d.description && <p style={desc}>{d.description}</p>}
            </div>
            <span style={size}>{d.size ?? ''}</span>
            <span style={arrow} aria-label="Descargar">↓</span>
          </a>
        ))}
      </div>
      <style>{`
        .cf-portal-download-row:hover { background: var(--cf-card); }
      `}</style>
    </section>
  );
}
