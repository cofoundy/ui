import * as React from 'react';
import type { ReactNode } from 'react';

export type StepStatus = 'done' | 'current' | 'pending';

export type BuildPhase = 'L0' | 'L1' | 'L2' | 'L3' | 'L4' | 'L5' | 'L6' | 'L7' | 'L8' | 'L9';

export interface BuildStep {
  label: string;
  status?: StepStatus;
  body?: ReactNode;
  /** Atelier delivery phase L0–L9. */
  phase?: BuildPhase;
  /** Step owner display label. */
  owner?: string;
  /** ISO date when work began. */
  started_at?: string;
  /** ISO date when work completed. */
  completed_at?: string;
  /** Vikunja project id for traceability. */
  vikunja_project_id?: number;
}

export interface BuildProgressProps {
  steps: BuildStep[];
}

const STATUS_BG: Record<StepStatus, string> = {
  done: 'var(--cf-success)',
  current: 'var(--cf-primary)',
  pending: 'var(--cf-card)',
};

const STATUS_FG: Record<StepStatus, string> = {
  done: '#fff',
  current: '#fff',
  pending: 'var(--cf-muted)',
};

export function BuildProgress({ steps }: BuildProgressProps) {
  return (
    <ol
      data-slot="build-progress"
      style={{
        margin: '1.5em 0',
        padding: 0,
        listStyle: 'none',
        position: 'relative',
      }}
    >
      {steps.map((step, i) => {
        const status = step.status ?? 'pending';
        const isLast = i === steps.length - 1;
        return (
          <li
            key={i}
            style={{
              position: 'relative',
              paddingLeft: '3em',
              paddingBottom: isLast ? 0 : '1.5em',
            }}
          >
            {!isLast && (
              <span
                aria-hidden
                style={{
                  position: 'absolute',
                  left: '1.1em',
                  top: '2.2em',
                  bottom: 0,
                  width: 2,
                  background: 'var(--cf-border)',
                }}
              />
            )}
            <span
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                width: '2.2em',
                height: '2.2em',
                borderRadius: '50%',
                background: STATUS_BG[status],
                color: STATUS_FG[status],
                border: status === 'pending' ? '1px solid var(--cf-border)' : 'none',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'var(--font-brand)',
                fontWeight: 700,
                fontSize: '0.95em',
              }}
            >
              {status === 'done' ? '✓' : i + 1}
            </span>
            <div
              style={{
                fontFamily: 'var(--font-brand)',
                fontWeight: 600,
                fontSize: '1.05em',
                color: 'var(--cf-fg)',
                marginBottom: step.body || step.owner || step.started_at || step.completed_at ? '0.35em' : 0,
                paddingTop: '0.1em',
                display: 'flex',
                alignItems: 'center',
                gap: '0.55em',
                flexWrap: 'wrap',
              }}
            >
              {step.phase && (
                <span
                  data-slot="build-progress-phase"
                  style={{
                    padding: '0.1em 0.5em',
                    borderRadius: 999,
                    background: 'rgba(70,160,208,0.12)',
                    color: 'var(--cf-primary)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.72em',
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                  }}
                >
                  {step.phase}
                </span>
              )}
              <span>{step.label}</span>
            </div>
            {(step.owner || step.started_at || step.completed_at) && (
              <div
                data-slot="build-progress-meta"
                style={{ fontSize: '0.78em', color: 'var(--cf-muted)', display: 'flex', flexWrap: 'wrap', gap: '0.85em', marginBottom: step.body ? '0.4em' : 0 }}
              >
                {step.owner && <span>owner: {step.owner}</span>}
                {step.started_at && <span>started: {step.started_at}</span>}
                {step.completed_at && <span>completed: {step.completed_at}</span>}
                {step.vikunja_project_id && <span>vikunja: #{step.vikunja_project_id}</span>}
              </div>
            )}
            {step.body && (
              <div style={{ fontSize: '0.95em', color: 'var(--cf-fg)', opacity: 0.85, lineHeight: 1.6 }}>{step.body}</div>
            )}
          </li>
        );
      })}
    </ol>
  );
}
