import type { ReactNode, CSSProperties } from 'react';

export interface InfoBoxProps {
  label: string;
  value: ReactNode;
  link?: string;
  emphasis?: 'default' | 'positive' | 'negative';
}

const ACCENT: Record<NonNullable<InfoBoxProps['emphasis']>, string> = {
  default: 'var(--cf-fg)',
  positive: 'var(--cf-success)',
  negative: 'var(--cf-error)',
};

export function InfoBox({ label, value, link, emphasis = 'default' }: InfoBoxProps) {
  const valueStyle: CSSProperties = {
    fontFamily: 'var(--font-mono)',
    fontSize: '1.5em',
    fontWeight: 600,
    color: ACCENT[emphasis],
    lineHeight: 1.1,
  };
  const inner = (
    <>
      <div style={{ fontSize: '0.78em', color: 'var(--cf-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>{label}</div>
      <div style={valueStyle}>{value}</div>
    </>
  );
  const containerStyle: CSSProperties = {
    flex: '1 1 0',
    minWidth: 0,
    padding: '0.95em 1.1em',
    background: 'var(--cf-card)',
    border: '1px solid var(--cf-border)',
    borderRadius: '10px',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4em',
  };
  if (link) {
    return (
      <a href={link} style={{ ...containerStyle, textDecoration: 'none' }}>
        {inner}
      </a>
    );
  }
  return <div data-slot="info-box" style={containerStyle}>{inner}</div>;
}

export interface InfoBoxRowProps {
  children: ReactNode;
}

export function InfoBoxRow({ children }: InfoBoxRowProps) {
  return (
    <div
      data-slot="info-box-row"
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.85em',
        margin: '1.25em 0 1.5em',
      }}
    >
      {children}
    </div>
  );
}
