import * as React from 'react';

/* Shared section heading — display family, large weight, no trailing period. */
export function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2
      data-slot="portal-section-heading"
      style={{
        fontFamily: 'var(--portal-display-font, var(--font-display))',
        fontSize: 'clamp(28px, 4vw, 44px)',
        fontWeight: 600,
        letterSpacing: '-0.02em',
        lineHeight: 1.1,
        color: 'var(--cf-fg)',
        margin: '0 0 0.5em',
      }}
    >
      {children}
    </h2>
  );
}
