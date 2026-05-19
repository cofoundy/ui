import * as React from 'react';
import type { MilestoneItem, MilestoneStatus, PortalMilestonesProps } from '../ClientPortalPanel.schema';
import { SectionHeading } from './SectionHeading';

/* ============================================================
   ClientPortalPanel.Milestones — LIST archetype
   ============================================================
   Concrete deliverables (vs. Phase which is abstract project
   stages). Each row: status node + title (display 18px) +
   date (mono) + deliverable link when done. List, not grid.
   Visually distinct from Phase: rows have status indicators
   and deliverable CTAs, no big percent number.
   ============================================================ */

const wrap: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '1.5em' };

const list: React.CSSProperties = { display: 'flex', flexDirection: 'column' };

const row: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '24px 1fr auto',
  gap: 'clamp(12px, 2vw, 24px)',
  alignItems: 'center',
  padding: '1.1em 0',
  borderBottom: '1px solid var(--cf-border)',
};

const title: React.CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontSize: 18,
  fontWeight: 600,
  color: 'var(--cf-fg)',
  margin: 0,
  lineHeight: 1.3,
};

const meta: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '1em',
  flexWrap: 'wrap',
  fontFamily: 'var(--font-mono)',
  fontSize: 10,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
};

const dateStyle: React.CSSProperties = {
  color: 'var(--cf-muted)',
};

const deliverableLink: React.CSSProperties = {
  color: 'var(--portal-accent, var(--cf-primary))',
  textDecoration: 'none',
};

function statusNode(status: MilestoneStatus): React.CSSProperties {
  const base: React.CSSProperties = {
    width: 12,
    height: 12,
    borderRadius: '50%',
    border: '1px solid var(--cf-border)',
  };
  if (status === 'done') return { ...base, background: 'var(--portal-accent, var(--cf-primary))', borderColor: 'var(--portal-accent, var(--cf-primary))' };
  if (status === 'in-progress') return { ...base, background: 'color-mix(in srgb, var(--portal-accent, var(--cf-primary)) 50%, transparent)' };
  if (status === 'blocked') return { ...base, background: 'var(--cf-error)', borderColor: 'var(--cf-error)' };
  return { ...base, background: 'transparent' };
}

const statusLabel: Record<MilestoneStatus, string> = {
  done: 'Entregado',
  'in-progress': 'En curso',
  pending: 'Pendiente',
  blocked: 'Bloqueado',
};

function statusLabelStyle(status: MilestoneStatus): React.CSSProperties {
  const colorMap: Record<MilestoneStatus, string> = {
    done: 'var(--portal-accent, var(--cf-primary))',
    'in-progress': 'var(--cf-fg)',
    pending: 'var(--cf-muted)',
    blocked: 'var(--cf-error)',
  };
  return {
    fontFamily: 'var(--font-mono)',
    fontSize: 10,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    color: colorMap[status],
  };
}

export function Milestones({ heading = 'Hitos', items }: PortalMilestonesProps) {
  if (!items || items.length === 0) return null;

  return (
    <section data-slot="portal-milestones" style={wrap}>
      <SectionHeading>{heading}</SectionHeading>
      <div style={list}>
        {items.map((m, i) => (
          <div key={`${m.title}-${i}`} style={row} data-status={m.status}>
            <span style={statusNode(m.status)} aria-hidden="true" />
            <div style={{ minWidth: 0 }}>
              <h3 style={title}>{m.title}</h3>
              <div style={{ ...meta, marginTop: '0.4em' }}>
                <span style={statusLabelStyle(m.status)}>{statusLabel[m.status]}</span>
                {m.date && <span style={dateStyle}>{m.date}</span>}
              </div>
            </div>
            <div>
              {m.status === 'done' && m.deliverableUrl && (
                <a href={m.deliverableUrl} target="_blank" rel="noopener noreferrer" style={deliverableLink}>
                  {m.deliverableLabel ?? 'Ver entrega ↗'}
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
