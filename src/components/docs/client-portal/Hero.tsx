import * as React from 'react';
import type { PortalHeroProps } from '../ClientPortalPanel.schema';

/* ============================================================
   ClientPortalPanel.Hero
   ============================================================
   Editorial hero. 2-col 40/60 desktop, stacked mobile.
   Eyebrow (mono small caps) → project name (display, clamp) →
   subtitle (serif italic) → optional status chip.
   Right: hero screenshot, sharp 1px border, captioned in mono.

   Caregiver-Sage voice. No welcome theatre, no emoji.
   When no heroImage: collapses to muted "soon" tile.
   ============================================================ */

const eyebrowStyle: React.CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: 11,
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  color: 'var(--cf-muted)',
  margin: 0,
};

const nameStyle: React.CSSProperties = {
  fontFamily: 'var(--portal-display-font, var(--font-display))',
  fontSize: 'clamp(40px, 8vw, 84px)',
  fontWeight: 600,
  lineHeight: 0.95,
  letterSpacing: '-0.02em',
  color: 'var(--cf-fg)',
  margin: '0.25em 0 0',
};

const subtitleStyle: React.CSSProperties = {
  fontFamily: 'Georgia, "Times New Roman", serif',
  fontStyle: 'italic',
  fontSize: 'clamp(16px, 2vw, 22px)',
  lineHeight: 1.4,
  color: 'var(--cf-muted)',
  margin: '1.25em 0 0',
  maxWidth: '36ch',
};

const chipStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  marginTop: '1.5em',
  padding: '0.45em 0.9em',
  borderRadius: 999,
  background: 'var(--portal-accent-soft, color-mix(in srgb, var(--cf-primary) 12%, transparent))',
  color: 'var(--portal-accent, var(--cf-primary))',
  fontFamily: 'var(--font-mono)',
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
};

const imageWrapStyle: React.CSSProperties = {
  position: 'relative',
  aspectRatio: '16 / 10',
  width: '100%',
  border: '1px solid var(--cf-border)',
  background: 'var(--cf-card)',
  overflow: 'hidden',
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

const soonStyle: React.CSSProperties = {
  ...imageWrapStyle,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'var(--cf-muted)',
  fontFamily: 'var(--font-mono)',
  fontSize: 13,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
};

export function Hero({
  category,
  projectName,
  subtitle,
  statusChip,
  heroImage,
  heroUrl,
  heroUpdatedHint,
}: PortalHeroProps) {
  return (
    <header
      data-slot="portal-hero"
      style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 3fr)',
        gap: 'clamp(24px, 4vw, 64px)',
        alignItems: 'center',
      }}
      className="cf-portal-hero"
    >
      <div style={{ minWidth: 0 }}>
        {category && <p style={eyebrowStyle}>{category}</p>}
        <h1 style={nameStyle}>{projectName}</h1>
        {subtitle && <p style={subtitleStyle}>{subtitle}</p>}
        {statusChip && <span style={chipStyle}>{statusChip}</span>}
      </div>
      <div style={{ minWidth: 0 }}>
        {heroImage ? (
          <>
            <div style={imageWrapStyle}>
              <img src={heroImage} alt={projectName} style={imageStyle} loading="lazy" />
            </div>
            {(heroUrl || heroUpdatedHint) && (
              <div style={captionStyle}>
                <span>{heroUrl}</span>
                {heroUpdatedHint && <span>{heroUpdatedHint}</span>}
              </div>
            )}
          </>
        ) : (
          <div style={soonStyle}>captura próximamente</div>
        )}
      </div>
      <style>{`
        @media (max-width: 768px) {
          .cf-portal-hero { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </header>
  );
}
