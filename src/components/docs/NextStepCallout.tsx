import type { ReactNode } from 'react';

export interface NextStepCalloutProps {
  label: string;
  body?: ReactNode;
  href?: string;
  ctaText?: string;
  children?: ReactNode;
}

export function NextStepCallout({ label, body, href, ctaText = 'Continuar →', children }: NextStepCalloutProps) {
  return (
    <div
      data-slot="next-step"
      style={{
        margin: '1.75em 0',
        padding: '1.25em 1.5em',
        background: 'linear-gradient(135deg, rgba(70,160,208,0.10), rgba(27,87,126,0.05))',
        border: '1px solid var(--cf-primary)',
        borderRadius: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.85em',
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-brand)',
          fontWeight: 600,
          fontSize: '0.78em',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'var(--cf-primary)',
        }}
      >
        {label}
      </div>
      {(body || children) && (
        <div style={{ fontSize: '1em', color: 'var(--cf-fg)', lineHeight: 1.6 }}>{body ?? children}</div>
      )}
      {href && (
        <a
          href={href}
          style={{
            display: 'inline-block',
            alignSelf: 'flex-start',
            padding: '0.6em 1.25em',
            background: 'var(--cf-primary)',
            color: '#fff',
            borderRadius: '8px',
            fontFamily: 'var(--font-brand)',
            fontWeight: 600,
            fontSize: '0.92em',
            textDecoration: 'none',
          }}
        >
          {ctaText}
        </a>
      )}
    </div>
  );
}
