import * as React from 'react';
import type { ChecklistItem, ChecklistStatus, ChecklistOwner, PortalOnboardingChecklistProps } from '../ClientPortalPanel.schema';
import { SectionHeading } from './SectionHeading';

/* ============================================================
   ClientPortalPanel.OnboardingChecklist — LIST archetype
   ============================================================
   Checkbox-style list. Each row: checkbox (visual) · title +
   owner chip · due date. Done items: strikethrough title +
   muted opacity. Visual sense of completion via filled vs
   empty boxes.
   ============================================================ */

const wrap: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '1.5em' };

const summary: React.CSSProperties = {
  display: 'flex',
  alignItems: 'baseline',
  gap: '1em',
  marginBottom: '0.5em',
};

const summaryNumber: React.CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: 32,
  fontWeight: 500,
  letterSpacing: '-0.02em',
  color: 'var(--cf-fg)',
};

const summaryLabel: React.CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: 11,
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  color: 'var(--cf-muted)',
};

const list: React.CSSProperties = { display: 'flex', flexDirection: 'column' };

const row = (done: boolean): React.CSSProperties => ({
  display: 'grid',
  gridTemplateColumns: '32px 1fr auto',
  gap: 'clamp(12px, 2vw, 20px)',
  alignItems: 'center',
  padding: '1em 0',
  borderBottom: '1px solid var(--cf-border)',
  opacity: done ? 0.55 : 1,
});

const box = (status: ChecklistStatus): React.CSSProperties => {
  const base: React.CSSProperties = {
    width: 20,
    height: 20,
    border: '1.5px solid var(--cf-border)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'var(--font-mono)',
    fontSize: 14,
    fontWeight: 700,
    color: '#fff',
  };
  if (status === 'done') {
    return { ...base, background: 'var(--portal-accent, var(--cf-primary))', borderColor: 'var(--portal-accent, var(--cf-primary))' };
  }
  if (status === 'blocked') {
    return { ...base, background: 'transparent', borderColor: 'var(--cf-error)' };
  }
  return base;
};

const title = (done: boolean): React.CSSProperties => ({
  fontFamily: 'var(--font-display)',
  fontSize: 16,
  fontWeight: 600,
  color: 'var(--cf-fg)',
  margin: 0,
  lineHeight: 1.3,
  textDecoration: done ? 'line-through' : 'none',
  textDecorationColor: 'var(--cf-muted)',
});

const ownerChip = (owner: ChecklistOwner): React.CSSProperties => ({
  display: 'inline-flex',
  padding: '0.2em 0.55em',
  marginLeft: '0.6em',
  background: owner === 'client'
    ? 'var(--portal-accent-soft, color-mix(in srgb, var(--cf-primary) 12%, transparent))'
    : 'var(--cf-card)',
  color: owner === 'client' ? 'var(--portal-accent, var(--cf-primary))' : 'var(--cf-muted)',
  border: owner === 'cofoundy' ? '1px solid var(--cf-border)' : 'none',
  fontFamily: 'var(--font-mono)',
  fontSize: 9,
  fontWeight: 600,
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  verticalAlign: 'middle',
});

const due: React.CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: 10,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color: 'var(--cf-muted)',
};

const blockedDue: React.CSSProperties = {
  ...due,
  color: 'var(--cf-error)',
};

const ownerLabel: Record<ChecklistOwner, string> = {
  client: 'tú',
  cofoundy: 'cofoundy',
};

export function OnboardingChecklist({ heading = 'Onboarding · primeras 2 semanas', items }: PortalOnboardingChecklistProps) {
  if (!items || items.length === 0) return null;

  const done = items.filter((i) => i.status === 'done').length;

  return (
    <section data-slot="portal-onboarding" style={wrap}>
      <SectionHeading>{heading}</SectionHeading>
      <div style={summary}>
        <span style={summaryNumber}>{done}</span>
        <span style={summaryLabel}>de {items.length} completados</span>
      </div>
      <div style={list}>
        {items.map((it, i) => {
          const isDone = it.status === 'done';
          return (
            <div key={`${it.title}-${i}`} style={row(isDone)} data-slot="portal-checklist-row" data-status={it.status}>
              <span style={box(it.status)} aria-hidden="true">{isDone ? '✓' : it.status === 'blocked' ? '!' : ''}</span>
              <div style={{ minWidth: 0 }}>
                <h3 style={title(isDone)}>
                  {it.title}
                  <span style={ownerChip(it.owner)}>{ownerLabel[it.owner]}</span>
                </h3>
              </div>
              {it.dueLabel && (
                <span style={it.status === 'blocked' ? blockedDue : due}>{it.dueLabel}</span>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
