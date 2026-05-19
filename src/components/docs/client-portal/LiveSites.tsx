import * as React from 'react';
import type { PortalLiveSitesProps } from '../ClientPortalPanel.schema';
import { SectionHeading } from './SectionHeading';

/* ============================================================
   ClientPortalPanel.LiveSites
   ============================================================
   Bento variance: primary URL gets 65% width; secondary 35%.
   Each tile = sharp 1px screenshot + mono small-caps caption
   row (URL + updated hint). When only 1 site, occupies full row.
   When 0 sites, section is hidden by parent (Root composes
   conditionally; component returns null defensively).
   ============================================================ */

const wrapStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1.5em',
};

const imageWrap: React.CSSProperties = {
  position: 'relative',
  aspectRatio: '16 / 10',
  width: '100%',
  border: '1px solid var(--cf-border)',
  background: 'var(--cf-card)',
  overflow: 'hidden',
  transition: 'border-color var(--cf-duration-fast, 150ms) var(--cf-ease-default, ease)',
};

const imageStyle: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  display: 'block',
};

const captionStyle: React.CSSProperties = {
  marginTop: '0.75em',
  display: 'flex',
  justifyContent: 'space-between',
  gap: '1em',
  fontFamily: 'var(--font-mono)',
  fontSize: 11,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: 'var(--cf-muted)',
};

const labelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontSize: 18,
  fontWeight: 600,
  color: 'var(--cf-fg)',
  marginBottom: '0.4em',
};

const linkStyle: React.CSSProperties = {
  textDecoration: 'none',
  color: 'inherit',
  display: 'block',
  minWidth: 0,
};

const soonStyle: React.CSSProperties = {
  ...imageWrap,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'var(--cf-muted)',
  fontFamily: 'var(--font-mono)',
  fontSize: 12,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
};

export function LiveSites({ heading = 'Dónde vive el sitio', sites }: PortalLiveSitesProps) {
  if (!sites || sites.length === 0) return null;
  const [primary, ...rest] = sites;
  const secondary = rest[0];

  return (
    <section data-slot="portal-live-sites" style={wrapStyle}>
      <SectionHeading>{heading}</SectionHeading>
      <div
        className="cf-portal-livesites-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: secondary ? '65fr 35fr' : '1fr',
          gap: 'clamp(16px, 2.5vw, 32px)',
        }}
      >
        <a href={primary.url} target="_blank" rel="noopener noreferrer" style={linkStyle}>
          <div style={labelStyle}>{primary.label}</div>
          {primary.screenshot ? (
            <div style={imageWrap}>
              <img src={primary.screenshot} alt={primary.label} style={imageStyle} loading="lazy" />
            </div>
          ) : (
            <div style={soonStyle}>captura próximamente</div>
          )}
          <div style={captionStyle}>
            <span>{primary.url}</span>
            {primary.updatedHint && <span>{primary.updatedHint}</span>}
          </div>
        </a>
        {secondary && (
          <a href={secondary.url} target="_blank" rel="noopener noreferrer" style={linkStyle}>
            <div style={labelStyle}>{secondary.label}</div>
            {secondary.screenshot ? (
              <div style={imageWrap}>
                <img src={secondary.screenshot} alt={secondary.label} style={imageStyle} loading="lazy" />
              </div>
            ) : (
              <div style={soonStyle}>captura próximamente</div>
            )}
            <div style={captionStyle}>
              <span>{secondary.url}</span>
              {secondary.updatedHint && <span>{secondary.updatedHint}</span>}
            </div>
          </a>
        )}
      </div>
      <style>{`
        @media (max-width: 768px) {
          .cf-portal-livesites-grid { grid-template-columns: 1fr !important; }
        }
        [data-slot="portal-live-sites"] a:hover > div:nth-child(2) { border-color: var(--portal-accent, var(--cf-primary)); }
      `}</style>
    </section>
  );
}
