import * as React from 'react';
import type { PortalPhaseProps } from '../ClientPortalPanel.schema';

/* ============================================================
   ClientPortalPanel.Phase
   ============================================================
   "Estado" moment. Centered typographic block:
   - thin 40px top-rule + small-caps eyebrow "Estado"
   - giant percent (display, mono numbers, clamp)
   - hairline horizontal timeline with 5 nodes
   - current node = 12px filled accent; others 6px open
   - optional next-milestone (serif italic)

   No chrome, no admin panels. Calm.
   ============================================================ */

const wrapStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  paddingTop: 'clamp(24px, 4vw, 48px)',
  paddingBottom: 'clamp(24px, 4vw, 48px)',
};

const ruleStyle: React.CSSProperties = {
  width: 40,
  height: 1,
  background: 'var(--cf-border)',
  border: 0,
  margin: '0 0 1em',
};

const eyebrowStyle: React.CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: 11,
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  color: 'var(--cf-muted)',
  margin: 0,
};

const percentStyle: React.CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: 'clamp(80px, 18vw, 180px)',
  fontWeight: 500,
  lineHeight: 1,
  letterSpacing: '-0.04em',
  color: 'var(--cf-fg)',
  margin: '0.2em 0 0.4em',
};

const timelineStyle: React.CSSProperties = {
  position: 'relative',
  width: '100%',
  maxWidth: 720,
  margin: '0 auto',
  display: 'grid',
  gridTemplateColumns: 'repeat(var(--phase-count, 5), 1fr)',
  alignItems: 'center',
};

const lineStyle: React.CSSProperties = {
  position: 'absolute',
  left: '10%',
  right: '10%',
  top: '50%',
  height: 1,
  background: 'var(--cf-border)',
  zIndex: 0,
};

const nodeColStyle: React.CSSProperties = {
  position: 'relative',
  zIndex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '0.65em',
};

const labelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: 10,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color: 'var(--cf-muted)',
};

const milestoneStyle: React.CSSProperties = {
  marginTop: '2em',
  fontFamily: 'Georgia, "Times New Roman", serif',
  fontStyle: 'italic',
  fontSize: 18,
  color: 'var(--cf-muted)',
};

function node(status: 'done' | 'current' | 'upcoming'): React.CSSProperties {
  if (status === 'current') {
    return {
      width: 12,
      height: 12,
      borderRadius: '50%',
      background: 'var(--portal-accent, var(--cf-primary))',
      boxShadow: '0 0 0 4px var(--cf-bg)',
    };
  }
  if (status === 'done') {
    return {
      width: 6,
      height: 6,
      borderRadius: '50%',
      background: 'var(--cf-fg)',
      boxShadow: '0 0 0 4px var(--cf-bg)',
    };
  }
  return {
    width: 6,
    height: 6,
    borderRadius: '50%',
    background: 'transparent',
    border: '1px solid var(--cf-border)',
    boxShadow: '0 0 0 4px var(--cf-bg)',
  };
}

export function Phase({ percent, phases, nextMilestone }: PortalPhaseProps) {
  const safePercent = Math.max(0, Math.min(100, Math.round(percent)));
  return (
    <section data-slot="portal-phase" style={wrapStyle}>
      <hr style={ruleStyle} aria-hidden="true" />
      <p style={eyebrowStyle}>Estado</p>
      <div style={percentStyle}>{safePercent}%</div>
      <div style={{ ...timelineStyle, ['--phase-count' as any]: phases.length }}>
        <div style={lineStyle} aria-hidden="true" />
        {phases.map((p) => (
          <div key={p.key} style={nodeColStyle}>
            <span style={node(p.status)} aria-hidden="true" />
            <span style={labelStyle}>{p.label}</span>
          </div>
        ))}
      </div>
      {nextMilestone && <p style={milestoneStyle}>{nextMilestone}</p>}
    </section>
  );
}
