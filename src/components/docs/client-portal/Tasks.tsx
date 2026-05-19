import * as React from 'react';
import type { PortalTasksProps, TaskColumn } from '../ClientPortalPanel.schema';
import { SectionHeading } from './SectionHeading';

/* ============================================================
   ClientPortalPanel.Tasks — BOARD/SNAPSHOT archetype
   ============================================================
   Vikunja v1 snapshot. NOT a live board — digest only.
   "kanban" → horizontal columns, each shows count + top 4
   recent tasks. "list" → single grouped vertical list.
   Optional projectUrl footer link opens full Vikunja board.
   ============================================================ */

const wrap: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '1.5em' };

const kanbanGrid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  gap: 'clamp(16px, 2vw, 24px)',
};

const colWrap: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.85em',
  padding: '1em',
  border: '1px solid var(--cf-border)',
  background: 'var(--cf-card)',
  minWidth: 0,
};

const colHead: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'baseline',
  gap: '0.5em',
  paddingBottom: '0.75em',
  borderBottom: '1px solid var(--cf-border)',
};

const colLabel: React.CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: 10,
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  color: 'var(--cf-muted)',
  margin: 0,
};

const colCount: React.CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: 22,
  fontWeight: 500,
  color: 'var(--cf-fg)',
  letterSpacing: '-0.02em',
};

const taskRow: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.25em',
  padding: '0.4em 0',
};

const taskTitle: React.CSSProperties = {
  fontFamily: 'var(--font-sans)',
  fontSize: 13,
  color: 'var(--cf-fg)',
  lineHeight: 1.4,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
};

const taskMeta: React.CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: 9,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color: 'var(--cf-muted)',
};

const listGroup: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.85em',
  marginBottom: '1.5em',
};

const footer: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'baseline',
  gap: '0.5em',
  marginTop: '0.5em',
  paddingTop: '1em',
  borderTop: '1px solid var(--cf-border)',
};

const projectIdStyle: React.CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: 10,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color: 'var(--cf-muted)',
};

const projectLinkStyle: React.CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: 10,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color: 'var(--portal-accent, var(--cf-primary))',
  textDecoration: 'none',
};

function KanbanColumn({ col }: { col: TaskColumn }) {
  return (
    <div style={colWrap} data-slot="portal-task-column" data-column={col.label}>
      <div style={colHead}>
        <h3 style={colLabel}>{col.label}</h3>
        <span style={colCount}>{col.count}</span>
      </div>
      <div>
        {(col.recent ?? []).slice(0, 4).map((t, i) => (
          <div key={i} style={taskRow}>
            <span style={taskTitle}>{t.title}</span>
            {t.updatedHint && <span style={taskMeta}>{t.updatedHint}</span>}
          </div>
        ))}
        {(col.recent ?? []).length === 0 && col.count > 0 && (
          <span style={taskMeta}>{col.count} tarea{col.count === 1 ? '' : 's'}</span>
        )}
      </div>
    </div>
  );
}

export function Tasks({
  heading = 'Tareas',
  projectId,
  view = 'kanban',
  columns,
  projectUrl,
}: PortalTasksProps) {
  if (!columns || columns.length === 0) return null;

  return (
    <section data-slot="portal-tasks" data-view={view} style={wrap}>
      <SectionHeading>{heading}</SectionHeading>
      {view === 'kanban' ? (
        <div style={kanbanGrid}>
          {columns.map((c) => (
            <KanbanColumn key={c.label} col={c} />
          ))}
        </div>
      ) : (
        <div>
          {columns.map((c) => (
            <div key={c.label} style={listGroup}>
              <div style={colHead}>
                <h3 style={colLabel}>{c.label}</h3>
                <span style={colCount}>{c.count}</span>
              </div>
              <div>
                {(c.recent ?? []).slice(0, 4).map((t, i) => (
                  <div key={i} style={taskRow}>
                    <span style={taskTitle}>{t.title}</span>
                    {t.updatedHint && <span style={taskMeta}>{t.updatedHint}</span>}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      <div style={footer}>
        <span style={projectIdStyle}>Vikunja · proyecto #{projectId}</span>
        {projectUrl && (
          <a href={projectUrl} target="_blank" rel="noopener noreferrer" style={projectLinkStyle}>
            Abrir board ↗
          </a>
        )}
      </div>
    </section>
  );
}
