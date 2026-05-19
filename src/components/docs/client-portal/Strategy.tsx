import * as React from 'react';
import type { PortalStrategyProps } from '../ClientPortalPanel.schema';
import { SectionHeading } from './SectionHeading';
import { ArtifactTile } from './ArtifactTile';

/* ============================================================
   ClientPortalPanel.Strategy
   ============================================================
   Bento variance: 45 / 30 / 25 desktop.
   - 45% propuesta PDF tile (portrait aspect)
   - 30% personas as portrait + name + role list
   - 25% sitemap (minimal tree)
   Each sub-block hides if absent. Section hides if all absent.
   ============================================================ */

const wrap: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '1.5em' };

const grid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '45fr 30fr 25fr',
  gap: 'clamp(20px, 3vw, 40px)',
  alignItems: 'start',
};

const subhead: React.CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: 11,
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  color: 'var(--cf-muted)',
  margin: '0 0 1em',
};

const personaRow: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.85em',
  padding: '0.85em 0',
  borderBottom: '1px solid var(--cf-border)',
};

const avatarStyle: React.CSSProperties = {
  width: 48,
  height: 48,
  borderRadius: '50%',
  background: 'var(--cf-card)',
  border: '1px solid var(--cf-border)',
  flexShrink: 0,
  objectFit: 'cover',
};

const personaName: React.CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontSize: 16,
  fontWeight: 600,
  color: 'var(--cf-fg)',
  margin: 0,
};

const personaRole: React.CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: 11,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: 'var(--cf-muted)',
  marginTop: '0.2em',
};

const personaBio: React.CSSProperties = {
  fontFamily: 'Georgia, "Times New Roman", serif',
  fontStyle: 'italic',
  fontSize: 12,
  color: 'var(--cf-muted)',
  marginTop: '0.4em',
  lineHeight: 1.4,
};

const treeRoot: React.CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: 12,
  color: 'var(--cf-fg)',
  lineHeight: 1.8,
};

const treeChild: React.CSSProperties = {
  paddingLeft: '1.2em',
  color: 'var(--cf-muted)',
};

export function Strategy({ heading = 'Estrategia', proposal, personas, sitemap }: PortalStrategyProps) {
  const hasPersonas = personas && personas.length > 0;
  const hasSitemap = sitemap && sitemap.length > 0;
  if (!proposal && !hasPersonas && !hasSitemap) return null;

  return (
    <section data-slot="portal-strategy" style={wrap}>
      <SectionHeading>{heading}</SectionHeading>
      <div className="cf-portal-strategy-grid" style={grid}>
        <div style={{ minWidth: 0 }}>
          {proposal && (
            <>
              <h3 style={subhead}>Propuesta</h3>
              <ArtifactTile artifact={proposal} aspect="portrait" />
            </>
          )}
        </div>
        <div style={{ minWidth: 0 }}>
          {hasPersonas && (
            <>
              <h3 style={subhead}>Personas</h3>
              <div>
                {personas!.map((p) => (
                  <div key={p.name} style={personaRow}>
                    {p.avatar ? (
                      <img src={p.avatar} alt={p.name} style={avatarStyle} loading="lazy" />
                    ) : (
                      <div style={avatarStyle} aria-hidden="true" />
                    )}
                    <div style={{ minWidth: 0 }}>
                      <div style={personaName}>{p.name}</div>
                      <div style={personaRole}>{p.role}</div>
                      {p.bio && <div style={personaBio}>{p.bio}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
        <div style={{ minWidth: 0 }}>
          {hasSitemap && (
            <>
              <h3 style={subhead}>Sitemap</h3>
              <div style={treeRoot}>
                {sitemap!.map((s) => (
                  <div key={s.label}>
                    <div>{s.label}</div>
                    {s.children?.map((c) => (
                      <div key={c.label} style={treeChild}>↳ {c.label}</div>
                    ))}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
      <style>{`
        @media (max-width: 1024px) {
          .cf-portal-strategy-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 640px) {
          .cf-portal-strategy-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
