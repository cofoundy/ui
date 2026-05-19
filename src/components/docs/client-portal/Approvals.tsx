import * as React from 'react';
import type { ApprovalItem, ApprovalStatus, PortalApprovalsProps } from '../ClientPortalPanel.schema';
import { SectionHeading } from './SectionHeading';

/* ============================================================
   ClientPortalPanel.Approvals  — QUEUE-CARDS archetype
   ============================================================
   The action driver. Visually heaviest of the v2 slots.
   Pending items render first (sorted by status), each as a
   full-width card with optional thumbnail (left), title +
   context (center), action CTA (right). Approved/rejected
   collapse to a thinner row with status chip.
   ============================================================ */

const wrap: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '1.5em' };

const card = (status: ApprovalStatus): React.CSSProperties => ({
  display: 'grid',
  gridTemplateColumns: '180px 1fr auto',
  gap: 'clamp(16px, 2.5vw, 32px)',
  alignItems: 'center',
  padding: 'clamp(16px, 2vw, 24px)',
  border: `1px solid ${status === 'pending' ? 'var(--portal-accent, var(--cf-primary))' : 'var(--cf-border)'}`,
  background: status === 'pending'
    ? 'var(--portal-accent-soft, color-mix(in srgb, var(--cf-primary) 6%, transparent))'
    : 'var(--cf-card)',
  minWidth: 0,
});

const compactCard = (status: ApprovalStatus): React.CSSProperties => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '1em',
  padding: '0.85em clamp(12px, 2vw, 20px)',
  borderBottom: '1px solid var(--cf-border)',
  opacity: status === 'rejected' ? 0.6 : 0.85,
});

const thumbWrap: React.CSSProperties = {
  position: 'relative',
  width: '100%',
  aspectRatio: '4 / 3',
  background: 'var(--cf-card)',
  border: '1px solid var(--cf-border)',
  overflow: 'hidden',
  minWidth: 0,
};

const thumbImg: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  objectFit: 'cover',
};

const titleStyle: React.CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontSize: 20,
  fontWeight: 600,
  color: 'var(--cf-fg)',
  margin: 0,
  lineHeight: 1.2,
};

const whatStyle: React.CSSProperties = {
  fontFamily: 'Georgia, "Times New Roman", serif',
  fontStyle: 'italic',
  fontSize: 14,
  color: 'var(--cf-muted)',
  margin: '0.5em 0 0',
  lineHeight: 1.4,
};

const dueStyle: React.CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: 10,
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  color: 'var(--portal-accent, var(--cf-primary))',
  marginTop: '0.6em',
  display: 'inline-block',
};

const ctaStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  padding: '0.7em 1.2em',
  background: 'var(--portal-accent, var(--cf-primary))',
  color: '#fff',
  fontFamily: 'var(--font-mono)',
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  textDecoration: 'none',
  transition: 'opacity var(--cf-duration-fast, 150ms) var(--cf-ease-default, ease)',
  whiteSpace: 'nowrap',
};

const statusChip = (status: ApprovalStatus): React.CSSProperties => {
  const map: Record<ApprovalStatus, { bg: string; fg: string; label: string }> = {
    pending: {
      bg: 'var(--portal-accent-soft, color-mix(in srgb, var(--cf-primary) 12%, transparent))',
      fg: 'var(--portal-accent, var(--cf-primary))',
      label: 'Pendiente',
    },
    approved: {
      bg: 'color-mix(in srgb, var(--cf-success) 15%, transparent)',
      fg: 'var(--cf-success)',
      label: 'Aprobado',
    },
    rejected: {
      bg: 'color-mix(in srgb, var(--cf-error) 15%, transparent)',
      fg: 'var(--cf-error)',
      label: 'Rechazado',
    },
  };
  return {
    display: 'inline-flex',
    padding: '0.3em 0.7em',
    background: map[status].bg,
    color: map[status].fg,
    fontFamily: 'var(--font-mono)',
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
  };
};

function PendingCard({ item }: { item: ApprovalItem }) {
  return (
    <div data-slot="portal-approval-card" data-status={item.status} style={card(item.status)} className="cf-portal-approval-card">
      <div>
        {item.thumbnail ? (
          <div style={thumbWrap}>
            <img src={item.thumbnail} alt={item.title} style={thumbImg} loading="lazy" />
          </div>
        ) : (
          <div style={{ ...thumbWrap, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--cf-muted)' }}>
              {item.title.slice(0, 2).toUpperCase()}
            </span>
          </div>
        )}
      </div>
      <div style={{ minWidth: 0 }}>
        <span style={statusChip(item.status)}>Pendiente</span>
        <h3 style={{ ...titleStyle, marginTop: '0.6em' }}>{item.title}</h3>
        {item.what && <p style={whatStyle}>{item.what}</p>}
        {item.dueLabel && <span style={dueStyle}>{item.dueLabel}</span>}
      </div>
      <a href={item.url} target="_blank" rel="noopener noreferrer" style={ctaStyle} className="cf-portal-approval-cta">
        {item.ctaLabel ?? 'Revisar'}
      </a>
      <style>{`
        .cf-portal-approval-cta:hover { opacity: 0.85; }
        @media (max-width: 640px) {
          .cf-portal-approval-card {
            grid-template-columns: 1fr !important;
            text-align: left;
          }
          .cf-portal-approval-card > div:first-child { max-width: 160px; }
        }
      `}</style>
    </div>
  );
}

function CompactRow({ item }: { item: ApprovalItem }) {
  return (
    <a
      data-slot="portal-approval-row"
      data-status={item.status}
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      style={{ ...compactCard(item.status), textDecoration: 'none', color: 'inherit' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85em', minWidth: 0 }}>
        <span style={statusChip(item.status)}>{item.status === 'approved' ? 'Aprobado' : 'Rechazado'}</span>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 15, color: 'var(--cf-fg)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {item.title}
        </span>
      </div>
      {item.dueLabel && (
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--cf-muted)' }}>
          {item.dueLabel}
        </span>
      )}
    </a>
  );
}

export function Approvals({ heading = 'Pendientes de tu aprobación', items }: PortalApprovalsProps) {
  if (!items || items.length === 0) return null;

  const order: Record<ApprovalStatus, number> = { pending: 0, approved: 1, rejected: 2 };
  const sorted = [...items].sort((a, b) => order[a.status] - order[b.status]);

  const pending = sorted.filter((i) => i.status === 'pending');
  const resolved = sorted.filter((i) => i.status !== 'pending');

  return (
    <section data-slot="portal-approvals" style={wrap}>
      <SectionHeading>{heading}</SectionHeading>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1em' }}>
        {pending.map((it, i) => (
          <PendingCard key={`p-${i}`} item={it} />
        ))}
      </div>
      {resolved.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {resolved.map((it, i) => (
            <CompactRow key={`r-${i}`} item={it} />
          ))}
        </div>
      )}
    </section>
  );
}
