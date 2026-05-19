import * as React from 'react';
import type { PortalTeamProps } from '../ClientPortalPanel.schema';
import { SectionHeading } from './SectionHeading';

/* ============================================================
   ClientPortalPanel.Team
   ============================================================
   Auto-fit face cards, min 200px each. Avatar (80px round)
   + name (display 22px) + role chip (mono small caps).
   ============================================================ */

const wrap: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '1.5em' };

const grid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: 'clamp(20px, 3vw, 40px)',
};

const card: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  gap: '0.85em',
};

const avatar: React.CSSProperties = {
  width: 80,
  height: 80,
  borderRadius: '50%',
  background: 'var(--cf-card)',
  border: '1px solid var(--cf-border)',
  objectFit: 'cover',
};

const name: React.CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontSize: 22,
  fontWeight: 600,
  color: 'var(--cf-fg)',
  margin: 0,
  lineHeight: 1.1,
};

const role: React.CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: 10,
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  color: 'var(--portal-accent, var(--cf-primary))',
  background: 'var(--portal-accent-soft, color-mix(in srgb, var(--cf-primary) 12%, transparent))',
  padding: '0.3em 0.6em',
  display: 'inline-block',
};

export function Team({ heading = 'Equipo', members }: PortalTeamProps) {
  if (!members || members.length === 0) return null;
  return (
    <section data-slot="portal-team" style={wrap}>
      <SectionHeading>{heading}</SectionHeading>
      <div style={grid}>
        {members.map((m) => (
          <div key={m.name} style={card}>
            {m.avatar ? (
              <img src={m.avatar} alt={m.name} style={avatar} loading="lazy" />
            ) : (
              <div style={avatar} aria-hidden="true" />
            )}
            <h3 style={name}>{m.name}</h3>
            <span style={role}>{m.role}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
