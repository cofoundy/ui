import * as React from 'react';
import type { PortalScheduleCTAProps } from '../ClientPortalPanel.schema';

/* ============================================================
   ClientPortalPanel.ScheduleCTA — CTA-BLOCK archetype
   ============================================================
   Single prominent block. NOT a full calendar embed.
   - Left: large avatar
   - Center: message (display serif italic) + person + role
   - Right: primary CTA button + fallback channels
   No section heading here — the message IS the heading.
   ============================================================ */

const wrap: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'auto 1fr auto',
  gap: 'clamp(20px, 3vw, 40px)',
  alignItems: 'center',
  padding: 'clamp(24px, 4vw, 40px)',
  border: '1px solid var(--cf-border)',
  background: 'var(--portal-accent-soft, color-mix(in srgb, var(--cf-primary) 6%, transparent))',
};

const avatarStyle: React.CSSProperties = {
  width: 96,
  height: 96,
  borderRadius: '50%',
  background: 'var(--cf-card)',
  border: '1px solid var(--cf-border)',
  objectFit: 'cover',
  display: 'block',
};

const message: React.CSSProperties = {
  fontFamily: 'Georgia, "Times New Roman", serif',
  fontStyle: 'italic',
  fontSize: 'clamp(20px, 2.8vw, 28px)',
  fontWeight: 400,
  lineHeight: 1.3,
  color: 'var(--cf-fg)',
  margin: 0,
};

const person: React.CSSProperties = {
  marginTop: '0.85em',
  display: 'flex',
  alignItems: 'baseline',
  gap: '0.7em',
  flexWrap: 'wrap',
};

const personName: React.CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontSize: 16,
  fontWeight: 600,
  color: 'var(--cf-fg)',
};

const personRole: React.CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: 10,
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  color: 'var(--cf-muted)',
};

const ctaWrap: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
  gap: '0.85em',
  minWidth: 220,
};

const cta: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '0.95em 1.4em',
  background: 'var(--portal-accent, var(--cf-primary))',
  color: '#fff',
  fontFamily: 'var(--font-mono)',
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  textDecoration: 'none',
  transition: 'opacity var(--cf-duration-fast, 150ms) var(--cf-ease-default, ease)',
};

const fallbacks: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.4em',
  marginTop: '0.3em',
};

const fallbackRow: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'baseline',
  gap: '0.75em',
  fontFamily: 'var(--font-mono)',
  fontSize: 11,
  letterSpacing: '0.06em',
  color: 'var(--cf-muted)',
  textDecoration: 'none',
};

const fallbackLabel: React.CSSProperties = {
  textTransform: 'uppercase',
  letterSpacing: '0.14em',
  fontSize: 9,
};

const fallbackValue: React.CSSProperties = {
  color: 'var(--cf-fg)',
  fontSize: 12,
};

export function ScheduleCTA({
  personName: name,
  personRole: role,
  personAvatar,
  scheduleUrl,
  ctaLabel,
  message: msg,
  fallbacks: fallbackList,
}: PortalScheduleCTAProps) {
  return (
    <section data-slot="portal-schedule-cta" style={wrap} className="cf-portal-schedule">
      <div>
        {personAvatar ? (
          <img src={personAvatar} alt={name} style={avatarStyle} loading="lazy" />
        ) : (
          <div style={avatarStyle} aria-hidden="true" />
        )}
      </div>
      <div style={{ minWidth: 0 }}>
        <p style={message}>{msg ?? '¿Necesitas hablar?'}</p>
        <div style={person}>
          <span style={personName}>{name}</span>
          {role && <span style={personRole}>{role}</span>}
        </div>
      </div>
      <div style={ctaWrap}>
        <a href={scheduleUrl} target="_blank" rel="noopener noreferrer" style={cta} className="cf-portal-schedule-cta">
          {ctaLabel ?? 'Agenda una llamada'}
        </a>
        {fallbackList && fallbackList.length > 0 && (
          <div style={fallbacks}>
            {fallbackList.map((f, i) => {
              const content = (
                <>
                  <span style={fallbackLabel}>{f.label}</span>
                  <span style={fallbackValue}>{f.value}</span>
                </>
              );
              return f.href ? (
                <a key={i} href={f.href} target="_blank" rel="noopener noreferrer" style={fallbackRow}>
                  {content}
                </a>
              ) : (
                <div key={i} style={fallbackRow}>{content}</div>
              );
            })}
          </div>
        )}
      </div>
      <style>{`
        .cf-portal-schedule-cta:hover { opacity: 0.85; }
        @media (max-width: 768px) {
          .cf-portal-schedule { grid-template-columns: auto 1fr !important; }
          .cf-portal-schedule > div:last-child { grid-column: 1 / -1; min-width: 0 !important; }
        }
        @media (max-width: 480px) {
          .cf-portal-schedule { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
