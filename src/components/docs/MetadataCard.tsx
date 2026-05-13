import type { ReactNode } from 'react';

export interface MetadataItem {
  label: string;
  value: string;
  icon?: ReactNode;
}

export interface MetadataCardProps {
  items: MetadataItem[];
}

export function MetadataCard({ items }: MetadataCardProps) {
  return (
    <div
      data-slot="metadata-card"
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.6em',
        margin: '1.25em 0 1.75em',
      }}
    >
      {items.map((item, i) => (
        <div
          key={i}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45em',
            padding: '0.45em 0.85em',
            background: 'var(--cf-card)',
            border: '1px solid var(--cf-border)',
            borderRadius: '999px',
            fontSize: '0.88em',
            color: 'var(--cf-fg)',
          }}
        >
          {item.icon && <span style={{ display: 'inline-flex' }}>{item.icon}</span>}
          <span style={{ color: 'var(--cf-muted)', fontWeight: 500 }}>{item.label}:</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{item.value}</span>
        </div>
      ))}
    </div>
  );
}
