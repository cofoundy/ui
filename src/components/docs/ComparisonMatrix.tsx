import type { ReactNode } from 'react';

export interface ComparisonOption {
  name: string;
  value: ReactNode;
  highlight?: boolean;
}

export interface ComparisonRow {
  feature: string;
  options: ComparisonOption[];
}

export interface ComparisonMatrixProps {
  columns: string[];
  rows: ComparisonRow[];
}

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
                {row.feature}
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
                  {opt.value}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
