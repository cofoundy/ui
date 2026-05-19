import * as React from 'react';
import type { AccessEntry, AccessStatus, PortalAccessRegistryProps } from '../ClientPortalPanel.schema';
import { SectionHeading } from './SectionHeading';

/* ============================================================
   ClientPortalPanel.AccessRegistry — LIST archetype
   ============================================================
   STRICT INVENTORY — never credentials. Lists which systems
   exist + access status. Credentials flow via Bitwarden Send
   out-of-band (WhatsApp/email). NO password, NO secret, NO
   copy-to-clipboard for values. Status chips drive the row
   color: pending = accent (action), granted = success,
   bitwarden-send-issued = neutral, not-applicable = muted.

   Pending items sort first regardless of input order.
   ============================================================ */

const wrap: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '1.5em' };

const notice: React.CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: '0.75em',
  padding: '1em 1.2em',
  background: 'var(--cf-card)',
  border: '1px solid var(--cf-border)',
  fontFamily: 'Georgia, "Times New Roman", serif',
  fontStyle: 'italic',
  fontSize: 13,
  color: 'var(--cf-muted)',
  lineHeight: 1.5,
};

const noticeMark: React.CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontStyle: 'normal',
  fontSize: 10,
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  color: 'var(--portal-accent, var(--cf-primary))',
  padding: '0.2em 0.5em',
  background: 'var(--portal-accent-soft, color-mix(in srgb, var(--cf-primary) 12%, transparent))',
  flexShrink: 0,
};

const list: React.CSSProperties = { display: 'flex', flexDirection: 'column' };

const row: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr auto auto',
  gap: 'clamp(12px, 2vw, 24px)',
  alignItems: 'center',
  padding: '1.1em 0',
  borderBottom: '1px solid var(--cf-border)',
};

const systemName: React.CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontSize: 16,
  fontWeight: 600,
  color: 'var(--cf-fg)',
  margin: 0,
  lineHeight: 1.3,
};

const note: React.CSSProperties = {
  fontFamily: 'Georgia, "Times New Roman", serif',
  fontStyle: 'italic',
  fontSize: 12,
  color: 'var(--cf-muted)',
  marginTop: '0.3em',
};

const dateLabel: React.CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: 10,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color: 'var(--cf-muted)',
};

const contactLink: React.CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: 10,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color: 'var(--portal-accent, var(--cf-primary))',
  textDecoration: 'none',
  padding: '0.5em 0.85em',
  border: '1px solid var(--portal-accent, var(--cf-primary))',
  whiteSpace: 'nowrap',
};

const statusMap: Record<AccessStatus, { label: string; bg: string; fg: string }> = {
  granted: {
    label: 'Tienes acceso',
    bg: 'color-mix(in srgb, var(--cf-success) 15%, transparent)',
    fg: 'var(--cf-success)',
  },
  'bitwarden-send-issued': {
    label: 'Enviado vía Bitwarden',
    bg: 'var(--cf-card)',
    fg: 'var(--cf-fg)',
  },
  pending: {
    label: 'Pendiente',
    bg: 'var(--portal-accent-soft, color-mix(in srgb, var(--cf-primary) 12%, transparent))',
    fg: 'var(--portal-accent, var(--cf-primary))',
  },
  'not-applicable': {
    label: 'No aplica',
    bg: 'transparent',
    fg: 'var(--cf-muted)',
  },
};

function chipStyle(status: AccessStatus): React.CSSProperties {
  const m = statusMap[status];
  return {
    display: 'inline-flex',
    padding: '0.35em 0.7em',
    background: m.bg,
    color: m.fg,
    fontFamily: 'var(--font-mono)',
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    border: status === 'not-applicable' ? '1px solid var(--cf-border)' : 'none',
    whiteSpace: 'nowrap',
  };
}

export function AccessRegistry({ heading = 'Accesos', items }: PortalAccessRegistryProps) {
  if (!items || items.length === 0) return null;

  const order: Record<AccessStatus, number> = {
    pending: 0,
    granted: 1,
    'bitwarden-send-issued': 2,
    'not-applicable': 3,
  };
  const sorted = [...items].sort((a, b) => order[a.status] - order[b.status]);

  return (
    <section data-slot="portal-access-registry" style={wrap}>
      <SectionHeading>{heading}</SectionHeading>
      <div style={notice}>
        <span style={noticeMark}>política</span>
        <span>
          Esta lista solo refleja qué sistemas ya tienes activos. Las credenciales viajan por Bitwarden Send (caducan tras
          un solo uso) por WhatsApp o email — nunca aparecen aquí.
        </span>
      </div>
      <div style={list}>
        {sorted.map((a, i) => (
          <div key={`${a.system}-${i}`} style={row} data-slot="portal-access-row" data-status={a.status}>
            <div style={{ minWidth: 0 }}>
              <h3 style={systemName}>{a.system}</h3>
              {a.note && <p style={note}>{a.note}</p>}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.4em' }}>
              <span style={chipStyle(a.status)}>{statusMap[a.status].label}</span>
              {a.dateLabel && <span style={dateLabel}>{a.dateLabel}</span>}
            </div>
            <div>
              {a.status === 'pending' && a.contactUrl && (
                <a href={a.contactUrl} target="_blank" rel="noopener noreferrer" style={contactLink}>
                  {a.contactLabel ?? 'Contactar'}
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
