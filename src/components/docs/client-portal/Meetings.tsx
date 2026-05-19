import * as React from 'react';
import type { MeetingItem, PortalMeetingsProps } from '../ClientPortalPanel.schema';
import { SectionHeading } from './SectionHeading';

/* ============================================================
   ClientPortalPanel.Meetings — TIMELINE archetype
   ============================================================
   Vertical timeline. Upcoming above past. Each row is a left
   gutter (vertical hairline + node dot + date) and right
   content (title + attendees row + 1-2 links).
   ============================================================ */

const wrap: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '1.5em' };

const groupHead: React.CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: 11,
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  color: 'var(--cf-muted)',
  margin: '0 0 1em',
};

const list: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
};

const row: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '140px 1fr',
  gap: 'clamp(16px, 2.5vw, 32px)',
  alignItems: 'start',
  padding: '1.5em 0',
  borderBottom: '1px solid var(--cf-border)',
  position: 'relative',
};

const gutter: React.CSSProperties = {
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.4em',
};

const date: React.CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: 11,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color: 'var(--cf-muted)',
};

const upcomingNode: React.CSSProperties = {
  display: 'inline-block',
  width: 10,
  height: 10,
  borderRadius: '50%',
  background: 'var(--portal-accent, var(--cf-primary))',
};

const pastNode: React.CSSProperties = {
  display: 'inline-block',
  width: 6,
  height: 6,
  borderRadius: '50%',
  background: 'var(--cf-muted)',
};

const title: React.CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontSize: 18,
  fontWeight: 600,
  color: 'var(--cf-fg)',
  margin: 0,
  lineHeight: 1.3,
};

const attendees: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5em',
  marginTop: '0.8em',
};

const attendeeAvatar: React.CSSProperties = {
  width: 28,
  height: 28,
  borderRadius: '50%',
  background: 'var(--cf-card)',
  border: '1px solid var(--cf-border)',
  marginLeft: -8,
  objectFit: 'cover',
};

const links: React.CSSProperties = {
  display: 'flex',
  gap: '1.2em',
  marginTop: '0.9em',
  flexWrap: 'wrap',
};

const linkStyle: React.CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: 11,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: 'var(--portal-accent, var(--cf-primary))',
  textDecoration: 'none',
};

export function Meetings({ heading = 'Reuniones', items }: PortalMeetingsProps) {
  if (!items || items.length === 0) return null;

  const upcoming = items.filter((i) => i.kind === 'upcoming');
  const past = items.filter((i) => i.kind === 'past');

  const renderRow = (m: MeetingItem, kind: 'upcoming' | 'past', key: string) => (
    <div key={key} style={row} data-slot="portal-meeting-row" data-kind={kind} className="cf-portal-meeting-row">
      <div style={gutter}>
        <span style={kind === 'upcoming' ? upcomingNode : pastNode} aria-hidden="true" />
        <span style={date}>{m.whenLabel}</span>
      </div>
      <div style={{ minWidth: 0 }}>
        <h3 style={title}>{m.title}</h3>
        {m.attendees && m.attendees.length > 0 && (
          <div style={attendees}>
            {m.attendees.slice(0, 5).map((a, i) =>
              a.avatar ? (
                <img key={i} src={a.avatar} alt={a.name} style={{ ...attendeeAvatar, marginLeft: i === 0 ? 0 : -8 }} loading="lazy" />
              ) : (
                <div key={i} style={{ ...attendeeAvatar, marginLeft: i === 0 ? 0 : -8 }} aria-label={a.name} />
              )
            )}
            <span style={{ marginLeft: '0.5em', fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--cf-muted)' }}>
              {m.attendees.map((a) => a.name).join(', ')}
            </span>
          </div>
        )}
        {(m.primaryUrl || m.secondaryUrl) && (
          <div style={links}>
            {m.primaryUrl && (
              <a href={m.primaryUrl} target="_blank" rel="noopener noreferrer" style={linkStyle}>
                {m.primaryLabel ?? (kind === 'upcoming' ? 'Calendario ↗' : 'Grabación ↗')}
              </a>
            )}
            {m.secondaryUrl && (
              <a href={m.secondaryUrl} target="_blank" rel="noopener noreferrer" style={{ ...linkStyle, color: 'var(--cf-muted)' }}>
                {m.secondaryLabel ?? (kind === 'upcoming' ? 'Prep doc ↗' : 'Transcript ↗')}
              </a>
            )}
          </div>
        )}
      </div>
      <style>{`
        @media (max-width: 640px) {
          .cf-portal-meeting-row { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );

  return (
    <section data-slot="portal-meetings" style={wrap}>
      <SectionHeading>{heading}</SectionHeading>
      {upcoming.length > 0 && (
        <div>
          <h3 style={groupHead}>Próximas</h3>
          <div style={list}>
            {upcoming.map((m, i) => renderRow(m, 'upcoming', `u-${i}`))}
          </div>
        </div>
      )}
      {past.length > 0 && (
        <div>
          <h3 style={groupHead}>Anteriores</h3>
          <div style={list}>
            {past.map((m, i) => renderRow(m, 'past', `p-${i}`))}
          </div>
        </div>
      )}
    </section>
  );
}
