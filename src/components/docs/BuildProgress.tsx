import type { ReactNode } from 'react';

export type StepStatus = 'done' | 'current' | 'pending';

export interface BuildStep {
  label: string;
  status?: StepStatus;
  body?: ReactNode;
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
                marginBottom: step.body ? '0.4em' : 0,
                paddingTop: '0.1em',
              }}
            >
              {step.label}
            </div>
            {step.body && (
              <div style={{ fontSize: '0.95em', color: 'var(--cf-fg)', opacity: 0.85, lineHeight: 1.6 }}>{step.body}</div>
            )}
          </li>
        );
      })}
    </ol>
  );
}
