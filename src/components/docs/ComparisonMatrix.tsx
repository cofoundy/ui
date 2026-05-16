import type { ReactNode } from 'react';

export type TrafficLight = 'green' | 'yellow' | 'red';

export interface ComparisonOption {
  name: string;
  value: ReactNode;
  highlight?: boolean;
  /** Traffic-light convergence indicator per cell (R-A7 §comparison). */
  traffic_light?: TrafficLight;
}

export interface ComparisonRow {
  feature: string;
  options: ComparisonOption[];
  /** Provenance for this row — research doc, benchmark, citation. */
  source?: string;
}

export interface ComparisonMatrixProps {
  columns: string[];
  rows: ComparisonRow[];
}

const TRAFFIC_COLOR: Record<TrafficLight, string> = {
  green: 'var(--cf-success)',
  yellow: 'var(--cf-warning)',
  red: 'var(--cf-error)',
};

export function ComparisonMatrix({ columns, rows }: ComparisonMatrixProps) {
  return (
    <div
      data-slot="comparison-matrix"
      style={{
        margin: '1.5em 0',
        overflow: 'auto',
        border: '1px solid var(--cf-border)',
        borderRadius: '12px',
        background: 'var(--cf-card)',
      }}
    >
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '0.95em',
        }}
      >
        <thead>
          <tr>
            <th
              style={{
                textAlign: 'left',
                padding: '0.85em 1em',
                color: 'var(--cf-muted)',
                fontWeight: 600,
                fontSize: '0.82em',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                borderBottom: '1px solid var(--cf-border)',
              }}
            />
            {columns.map((col, i) => (
              <th
                key={i}
                style={{
                  textAlign: 'left',
                  padding: '0.85em 1em',
                  color: 'var(--cf-fg)',
                  fontFamily: 'var(--font-brand)',
                  fontWeight: 600,
                  borderBottom: '1px solid var(--cf-border)',
                }}
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri}>
              <th
                scope="row"
                style={{
                  textAlign: 'left',
                  padding: '0.85em 1em',
                  color: 'var(--cf-muted)',
                  fontWeight: 500,
                  borderBottom: ri < rows.length - 1 ? '1px solid var(--cf-border)' : 'none',
                  verticalAlign: 'top',
                  whiteSpace: 'nowrap',
                }}
              >
                <span>{row.feature}</span>
                {row.source && (
                  <div
                    data-slot="comparison-matrix-source"
                    style={{ fontSize: '0.7em', fontFamily: 'var(--font-mono)', color: 'var(--cf-muted)', marginTop: '0.25em', fontWeight: 400 }}
                  >
                    source: {row.source}
                  </div>
                )}
              </th>
              {row.options.map((opt, oi) => (
                <td
                  key={oi}
                  style={{
                    padding: '0.85em 1em',
                    color: 'var(--cf-fg)',
                    borderBottom: ri < rows.length - 1 ? '1px solid var(--cf-border)' : 'none',
                    background: opt.highlight ? 'rgba(70,160,208,0.10)' : 'transparent',
                    fontWeight: opt.highlight ? 600 : 400,
                    verticalAlign: 'top',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5em' }}>
                    {opt.traffic_light && (
                      <span
                        data-slot="comparison-matrix-traffic-light"
                        aria-label={`status: ${opt.traffic_light}`}
                        style={{
                          marginTop: '0.4em',
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          background: TRAFFIC_COLOR[opt.traffic_light],
                          flexShrink: 0,
                        }}
                      />
                    )}
                    <div>{opt.value}</div>
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
