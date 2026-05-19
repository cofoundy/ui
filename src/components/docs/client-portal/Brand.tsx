import * as React from 'react';
import type { PortalBrandProps } from '../ClientPortalPanel.schema';
import { SectionHeading } from './SectionHeading';
import { ArtifactTile } from './ArtifactTile';

/* ============================================================
   ClientPortalPanel.Brand
   ============================================================
   2-col 50/50: palette (left) + type specimens (right).
   Below, full-width: brand book PDF tile.
   When palette/typography/brandBook absent individually,
   their sub-block hides. When all absent, section hides.
   ============================================================ */

const wrapStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'clamp(24px, 3vw, 40px)',
};

const splitStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: 'clamp(24px, 4vw, 64px)',
};

const subhead: React.CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: 11,
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  color: 'var(--cf-muted)',
  margin: '0 0 1em',
};

const chipsGrid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)',
  gap: 'clamp(12px, 2vw, 20px)',
};

const chipStyle = (value: string): React.CSSProperties => ({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.6em',
});

const swatchStyle = (value: string): React.CSSProperties => ({
  width: '100%',
  aspectRatio: '1 / 1',
  background: value,
  border: '1px solid var(--cf-border)',
});

const chipMeta: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.2em',
};

const chipName: React.CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontSize: 14,
  fontWeight: 600,
  color: 'var(--cf-fg)',
};

const chipHex: React.CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: 12,
  color: 'var(--cf-muted)',
  letterSpacing: '0.06em',
};

const chipUsage: React.CSSProperties = {
  fontFamily: 'Georgia, "Times New Roman", serif',
  fontStyle: 'italic',
  fontSize: 11,
  color: 'var(--cf-muted)',
  marginTop: '0.2em',
};

const typeRow: React.CSSProperties = {
  padding: '0.85em 0',
  borderBottom: '1px solid var(--cf-border)',
};

const typeSlotLabel: React.CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: 11,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color: 'var(--cf-muted)',
  marginBottom: '0.3em',
};

export function Brand({ heading = 'El brand', palette, typography, brandBook }: PortalBrandProps) {
  const hasPalette = palette && palette.length > 0;
  const hasType = typography && typography.length > 0;
  if (!hasPalette && !hasType && !brandBook) return null;

  return (
    <section data-slot="portal-brand" style={wrapStyle}>
      <SectionHeading>{heading}</SectionHeading>
      {(hasPalette || hasType) && (
        <div className="cf-portal-brand-split" style={splitStyle}>
          {hasPalette && (
            <div style={{ minWidth: 0 }}>
              <h3 style={subhead}>Paleta</h3>
              <div style={chipsGrid}>
                {palette!.map((c) => (
                  <div key={c.name} style={chipStyle(c.value)}>
                    <div style={swatchStyle(c.value)} aria-hidden="true" />
                    <div style={chipMeta}>
                      <span style={chipName}>{c.name}</span>
                      <span style={chipHex}>{c.value}</span>
                      {c.usage && <span style={chipUsage}>{c.usage}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {hasType && (
            <div style={{ minWidth: 0 }}>
              <h3 style={subhead}>Tipografía</h3>
              <div>
                {typography!.map((t) => (
                  <div key={t.slot} style={typeRow}>
                    <div style={typeSlotLabel}>
                      {t.slot} · {t.family}{t.weight ? ` · ${t.weight}` : ''}
                    </div>
                    <div
                      style={{
                        fontFamily: t.family,
                        fontWeight: t.weight ? Number(t.weight) : 500,
                        fontSize: 28,
                        lineHeight: 1.1,
                        color: 'var(--cf-fg)',
                      }}
                    >
                      {t.sample ?? 'Aa Bb Cc 123'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      {brandBook && <ArtifactTile artifact={brandBook} aspect="landscape" />}
      <style>{`
        @media (max-width: 768px) {
          .cf-portal-brand-split { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
