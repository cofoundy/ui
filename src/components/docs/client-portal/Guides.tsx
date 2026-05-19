import * as React from 'react';
import type { GuideItem, GuideKind, PortalGuidesProps } from '../ClientPortalPanel.schema';
import { SectionHeading } from './SectionHeading';

/* ============================================================
   ClientPortalPanel.Guides — TILE-GRID archetype
   ============================================================
   Knowledge base entries. Auto-fit tile grid. Each tile:
   thumbnail-or-icon-band, kind chip, title, duration.
   ============================================================ */

const wrap: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '1.5em' };

const grid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
  gap: 'clamp(16px, 2vw, 24px)',
};

const tile: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.85em',
  textDecoration: 'none',
  color: 'inherit',
  minWidth: 0,
};

const thumbWrap: React.CSSProperties = {
  position: 'relative',
  width: '100%',
  aspectRatio: '16 / 10',
  background: 'var(--cf-card)',
  border: '1px solid var(--cf-border)',
  overflow: 'hidden',
  transition: 'border-color var(--cf-duration-fast, 150ms) var(--cf-ease-default, ease)',
};

const thumbImg: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  objectFit: 'cover',
};

const placeholderStyle: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontFamily: 'var(--font-mono)',
  fontSize: 11,
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  color: 'var(--cf-muted)',
};

const kindChip: React.CSSProperties = {
  position: 'absolute',
  top: 10,
  left: 10,
  padding: '0.3em 0.6em',
  background: 'var(--cf-bg)',
  border: '1px solid var(--cf-border)',
  fontFamily: 'var(--font-mono)',
  fontSize: 9,
  fontWeight: 600,
  letterSpacing: '0.14em',
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

const duration: React.CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: 10,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color: 'var(--cf-muted)',
};

const kindLabel: Record<GuideKind, string> = {
  video: 'Video',
  article: 'Artículo',
  tutorial: 'Tutorial',
};

const kindPlaceholder: Record<GuideKind, string> = {
  video: '▶',
  article: '¶',
  tutorial: '⌘',
};

export function Guides({ heading = 'Guías', items }: PortalGuidesProps) {
  if (!items || items.length === 0) return null;

  return (
    <section data-slot="portal-guides" style={wrap}>
      <SectionHeading>{heading}</SectionHeading>
      <div style={grid}>
        {items.map((g, i) => (
          <a
            key={`${g.title}-${i}`}
            href={g.url}
            target="_blank"
            rel="noopener noreferrer"
            data-slot="portal-guide-tile"
            data-kind={g.kind}
            style={tile}
          >
            <div style={thumbWrap} className="cf-portal-guide-thumb">
              <span style={kindChip}>{kindLabel[g.kind]}</span>
              {g.thumbnail ? (
                <img src={g.thumbnail} alt={g.title} style={thumbImg} loading="lazy" />
              ) : (
                <div style={{ ...placeholderStyle, fontSize: 36 }} aria-hidden="true">{kindPlaceholder[g.kind]}</div>
              )}
            </div>
            <h3 style={title}>{g.title}</h3>
            {g.duration && <span style={duration}>{g.duration}</span>}
          </a>
        ))}
      </div>
      <style>{`
        [data-slot="portal-guide-tile"]:hover .cf-portal-guide-thumb {
          border-color: var(--portal-accent, var(--cf-primary));
        }
      `}</style>
    </section>
  );
}
