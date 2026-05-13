import type { ReactNode } from 'react';

export type ScopeStatus = 'check' | 'cross' | 'pending';

export interface ScopeItem {
  text: ReactNode;
  status?: ScopeStatus;
}

export interface ScopeListProps {
  items: Array<ScopeItem | string>;
  defaultStatus?: ScopeStatus;
}

const STATUS_COLOR: Record<ScopeStatus, string> = {
  check: 'var(--cf-success)',
  cross: 'var(--cf-error)',
  pending: 'var(--cf-muted)',
};

const STATUS_GLYPH: Record<ScopeStatus, string> = {
  check: '✓',
  cross: '✕',
  pending: '○',
};

function normalize(items: ScopeListProps['items'], defaultStatus: ScopeStatus): ScopeItem[] {
  return items.map((it) =>
    typeof it === 'string' ? { text: it, status: defaultStatus } : { ...it, status: it.status ?? defaultStatus }
  );
}

export function ScopeList({ items, defaultStatus = 'check' }: ScopeListProps) {
  const list = normalize(items, defaultStatus);
  return (
    <div
      data-slot="scope-list"
      style={{
        margin: '1em 0 1.5em',
        background: 'var(--cf-card)',
        border: '1px solid var(--cf-border)',
        borderRadius: '10px',
        overflow: 'hidden',
      }}
    >
      {list.map((item, i) => {
        const status = item.status ?? 'check';
        return (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.85em',
              padding: '0.85em 1.1em',
              borderBottom: i < list.length - 1 ? '1px solid var(--cf-border)' : 'none',
            }}
          >
            <span
              aria-hidden
              style={{
                flex: '0 0 1.4em',
                height: '1.4em',
                width: '1.4em',
                borderRadius: '50%',
                background: STATUS_COLOR[status],
                color: '#fff',
                fontSize: '0.75em',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                marginTop: '0.15em',
              }}
            >
              {STATUS_GLYPH[status]}
            </span>
            <div style={{ fontSize: '0.95em', lineHeight: 1.55, color: 'var(--cf-fg)' }}>{item.text}</div>
          </div>
        );
      })}
    </div>
  );
}
