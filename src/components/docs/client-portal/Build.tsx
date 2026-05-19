import * as React from 'react';
import type { PortalBuildProps } from '../ClientPortalPanel.schema';
import { SectionHeading } from './SectionHeading';
import { ArtifactTile } from './ArtifactTile';

/* ============================================================
   ClientPortalPanel.Build
   ============================================================
   Bento variance: 60 / 40.
   - 60% repos as typographic list (NOT mono table)
     each row: repo name (display 18px) · updated hint (mono small caps)
     deploy URL if present
   - 40% Vikunja stacked progress bar (done / in-progress / backlog)
     + cronograma PDF tile below
   ============================================================ */

const wrap: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '1.5em' };

const grid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '60fr 40fr',
  gap: 'clamp(24px, 4vw, 48px)',
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

const repoRow: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.3em',
  padding: '1em 0',
  borderBottom: '1px solid var(--cf-border)',
  textDecoration: 'none',
  color: 'inherit',
};

const repoName: React.CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontSize: 18,
  fontWeight: 600,
  color: 'var(--cf-fg)',
};

const repoMeta: React.CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: 11,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: 'var(--cf-muted)',
  display: 'flex',
  gap: '1.2em',
  alignItems: 'center',
};

const deployLink: React.CSSProperties = {
  color: 'var(--portal-accent, var(--cf-primary))',
  textDecoration: 'none',
};

const barWrap: React.CSSProperties = {
  display: 'flex',
  height: 12,
  width: '100%',
  background: 'var(--cf-card)',
  border: '1px solid var(--cf-border)',
  overflow: 'hidden',
};

const barLegend: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5em',
  marginTop: '0.85em',
};

const legendRow: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '0.5em',
  fontFamily: 'var(--font-mono)',
  fontSize: 11,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: 'var(--cf-muted)',
};

const legendDot = (bg: string): React.CSSProperties => ({
  display: 'inline-block',
  width: 8,
  height: 8,
  borderRadius: '50%',
  background: bg,
  marginRight: '0.5em',
});

export function Build({ heading = 'Construcción', repos, stats, cronograma }: PortalBuildProps) {
  const hasRepos = repos && repos.length > 0;
  const hasStats = !!stats;
  if (!hasRepos && !hasStats && !cronograma) return null;

  const total = stats ? stats.done + stats.inProgress + stats.backlog : 0;
  const pct = (n: number) => (total === 0 ? 0 : (n / total) * 100);

  return (
    <section data-slot="portal-build" style={wrap}>
      <SectionHeading>{heading}</SectionHeading>
      <div className="cf-portal-build-grid" style={grid}>
        <div style={{ minWidth: 0 }}>
          {hasRepos && (
            <>
              <h3 style={subhead}>Repositorios</h3>
              <div>
                {repos!.map((r) => (
                  <a key={r.name} href={r.url} target="_blank" rel="noopener noreferrer" style={repoRow}>
                    <div style={repoName}>{r.name}</div>
                    <div style={repoMeta}>
                      {r.updatedHint && <span>{r.updatedHint}</span>}
                      {r.deployUrl && (
                        <a href={r.deployUrl} target="_blank" rel="noopener noreferrer" style={deployLink}>
                          Deploy ↗
                        </a>
                      )}
                    </div>
                  </a>
                ))}
              </div>
            </>
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5em', minWidth: 0 }}>
          {hasStats && (
            <div>
              <h3 style={subhead}>Tareas</h3>
              <div style={barWrap} aria-label="Estado de tareas">
                <div
                  style={{
                    width: `${pct(stats!.done)}%`,
                    background: 'var(--portal-accent, var(--cf-primary))',
                  }}
                />
                <div
                  style={{
                    width: `${pct(stats!.inProgress)}%`,
                    background: 'color-mix(in srgb, var(--portal-accent, var(--cf-primary)) 45%, transparent)',
                  }}
                />
                <div
                  style={{
                    width: `${pct(stats!.backlog)}%`,
                    background: 'var(--cf-border)',
                  }}
                />
              </div>
              <div style={barLegend}>
                <div style={legendRow}>
                  <span><span style={legendDot('var(--portal-accent, var(--cf-primary))')} />Hecho</span>
                  <span>{stats!.done}</span>
                </div>
                <div style={legendRow}>
                  <span><span style={legendDot('color-mix(in srgb, var(--portal-accent, var(--cf-primary)) 45%, transparent)')} />En curso</span>
                  <span>{stats!.inProgress}</span>
                </div>
                <div style={legendRow}>
                  <span><span style={legendDot('var(--cf-border)')} />Backlog</span>
                  <span>{stats!.backlog}</span>
                </div>
              </div>
            </div>
          )}
          {cronograma && <ArtifactTile artifact={cronograma} aspect="landscape" />}
        </div>
      </div>
      <style>{`
        @media (max-width: 768px) {
          .cf-portal-build-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
