import * as React from 'react';
import type { ReactNode } from 'react';

export interface KPI {
  label: string;
  value: ReactNode;
  trend?: { direction: 'up' | 'down' | 'flat'; value: string };
  target?: string;
  status?: 'good' | 'warn' | 'bad';
  /** Reference baseline this KPI is compared against. */
  baseline?: string;
  /** Provenance — research doc citation or benchmark URL. */
  source?: string;
}

export interface KPIBoardProps {
  kpis: KPI[];
  columns?: number;
}

const STATUS_COLOR: Record<NonNullable<KPI['status']>, string> = {
  good: 'var(--cf-success)',
  warn: 'var(--cf-warning)',
  bad: 'var(--cf-error)',
};

const TREND_GLYPH = { up: '▲', down: '▼', flat: '→' } as const;

export function KPIBoard({ kpis, columns }: KPIBoardProps) {
  const cols = columns ?? Math.min(kpis.length, 4);
  return (
    <div
      data-slot="kpi-board"
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fit, minmax(180px, 1fr))`,
        gap: '0.85em',
        margin: '1.5em 0',
      }}
    >
      {kpis.map((kpi, i) => (
        <div
          key={i}
          style={{
            padding: '1em 1.15em',
            background: 'var(--cf-card)',
            border: '1px solid var(--cf-border)',
            borderRadius: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.45em',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {kpi.status && (
            <span
              aria-hidden
              style={{
                position: 'absolute',
                top: 12,
                right: 12,
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: STATUS_COLOR[kpi.status],
              }}
            />
          )}
          <div style={{ fontSize: '0.78em', color: 'var(--cf-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
            {kpi.label}
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.7em', fontWeight: 600, color: 'var(--cf-fg)', lineHeight: 1.1 }}>
            {kpi.value}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.25em', flexWrap: 'wrap', gap: '0.4em' }}>
            {kpi.trend && (
              <span
                style={{
                  fontSize: '0.82em',
                  fontWeight: 600,
                  color:
                    kpi.trend.direction === 'up'
                      ? 'var(--cf-success)'
                      : kpi.trend.direction === 'down'
                      ? 'var(--cf-error)'
                      : 'var(--cf-muted)',
                }}
              >
                {TREND_GLYPH[kpi.trend.direction]} {kpi.trend.value}
              </span>
            )}
            <div style={{ display: 'flex', gap: '0.6em', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              {kpi.baseline && (
                <span data-slot="kpi-baseline" style={{ fontSize: '0.78em', color: 'var(--cf-muted)' }}>
                  baseline: {kpi.baseline}
                </span>
              )}
              {kpi.target && (
                <span style={{ fontSize: '0.78em', color: 'var(--cf-muted)' }}>target: {kpi.target}</span>
              )}
            </div>
          </div>
          {kpi.source && (
            <div
              data-slot="kpi-source"
              style={{ fontSize: '0.72em', color: 'var(--cf-muted)', fontFamily: 'var(--font-mono)', marginTop: '0.1em' }}
            >
              source: {kpi.source}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
