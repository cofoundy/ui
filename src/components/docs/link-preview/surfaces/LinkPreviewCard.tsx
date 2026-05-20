'use client';

import { forwardRef } from 'react';
import type { SurfaceRenderProps } from '../LinkPreviewSurface';

/**
 * Concept B — Index-Card
 *
 * Brand stance: Sage-academic. The preview reads like a library reference
 * card — a horizontal-rule "kind tag" at the top in mono caps, then the
 * title in display weight, then the excerpt, then a slim footnote-style
 * meta line. Card-stock background (slightly warmer than --popover), thin
 * 1px border. The metaphor: "this is a *citation* to a doc, not a window
 * into it."
 *
 * Why this design: matches the docs.cofoundy.dev posture where every doc
 * is a *referenced artifact* (proposals, deliverables, client portals).
 * The card form factor implies "this is a discrete item you can read
 * about, then go to." Sage owns the framing without performing authority.
 */
export const LinkPreviewCard = forwardRef<HTMLDivElement, SurfaceRenderProps>(
  function LinkPreviewCard(
    { result, href, position, onMouseEnter, onMouseLeave, reduceMotion },
    ref,
  ) {
    const enterTranslate = position?.placement === 'top' ? '0px' : '0px';
    const initialTranslate = position?.placement === 'top' ? '6px' : '-6px';

    return (
      <div
        ref={ref}
        role="tooltip"
        data-slot="link-preview"
        data-variant="card"
        data-placement={position?.placement ?? 'bottom'}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        style={{
          position: 'fixed',
          top: position?.top ?? -9999,
          left: position?.left ?? -9999,
          width: 360,
          maxWidth: 'calc(100vw - 24px)',
          background: 'var(--popover, #0f172a)',
          color: 'var(--popover-foreground, #ffffff)',
          border: '1px solid var(--cf-border, rgba(255,255,255,0.14))',
          borderRadius: 4,
          boxShadow: '0 12px 32px -10px rgba(0,0,0,0.55), 0 2px 4px -2px rgba(0,0,0,0.3)',
          padding: '16px 18px 14px',
          fontFamily: 'var(--font-sans, Inter, system-ui, sans-serif)',
          zIndex: 1000,
          opacity: position ? 1 : 0,
          transform: position ? `translateY(${enterTranslate})` : `translateY(${initialTranslate})`,
          transition: reduceMotion
            ? 'none'
            : 'opacity 180ms var(--cf-ease-default, cubic-bezier(0.19,1,0.22,1)), transform 180ms var(--cf-ease-default, cubic-bezier(0.19,1,0.22,1))',
          willChange: 'transform, opacity',
          pointerEvents: position ? 'auto' : 'none',
        }}
      >
        <Content result={result} href={href} />
      </div>
    );
  },
);

function Content({ result, href }: { result: SurfaceRenderProps['result']; href: string }) {
  if (result.state === 'loading') {
    return (
      <div aria-busy="true" aria-label="Loading preview">
        <div style={skel(20, 8)} />
        <div style={{ ...skel(70, 16), marginTop: 10 }} />
        <div style={{ ...skel(98, 10), marginTop: 12 }} />
        <div style={{ ...skel(94, 10), marginTop: 6 }} />
        <div style={{ ...skel(60, 10), marginTop: 6 }} />
      </div>
    );
  }
  if (result.state === 'error') {
    return (
      <div style={{ fontSize: 13, color: 'var(--cf-muted, #94a3b8)' }}>
        <div style={{ fontFamily: 'var(--font-brand)', fontWeight: 600, color: 'var(--cf-fg, #fff)', marginBottom: 6 }}>
          Preview unavailable
        </div>
        <div style={{ fontSize: 12 }}>Click to open the page directly.</div>
      </div>
    );
  }
  const { title, excerpt, meta, kind = 'doc' } = result.data;
  const kindLabel = kind === 'proposal' ? 'Proposal' : kind === 'deliverable' ? 'Deliverable' : kind === 'client-portal' ? 'Client Portal' : 'Document';
  return (
    <>
      <div
        style={{
          fontFamily: 'var(--font-mono, JetBrains Mono, monospace)',
          fontSize: 10,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'var(--cf-muted, #94a3b8)',
          paddingBottom: 8,
          borderBottom: '1px solid var(--cf-border, rgba(255,255,255,0.10))',
        }}
      >
        {kindLabel}
      </div>
      <div
        style={{
          fontFamily: 'var(--font-display, Space Grotesk), system-ui',
          fontWeight: 600,
          fontSize: 16,
          lineHeight: 1.3,
          color: 'var(--cf-fg, #fff)',
          marginTop: 10,
          marginBottom: 10,
          letterSpacing: '-0.01em',
        }}
      >
        {title}
      </div>
      <div
        style={{
          fontSize: 13,
          lineHeight: 1.6,
          color: 'var(--cf-fg, rgba(255,255,255,0.86))',
          opacity: 0.88,
          display: '-webkit-box',
          WebkitLineClamp: 4,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        {excerpt}
      </div>
      {meta && meta.length > 0 && (
        <div
          style={{
            marginTop: 12,
            paddingTop: 10,
            borderTop: '1px solid var(--cf-border, rgba(255,255,255,0.10))',
            fontSize: 11,
            color: 'var(--cf-muted, #94a3b8)',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '4px 14px',
          }}
        >
          {meta.map((m, i) => (
            <span key={i}>
              <span style={{ opacity: 0.7 }}>{m.label}:</span> <span style={{ color: 'var(--cf-fg, rgba(255,255,255,0.86))' }}>{m.value}</span>
            </span>
          ))}
        </div>
      )}
      <div
        style={{
          marginTop: 10,
          fontFamily: 'var(--font-mono, JetBrains Mono, monospace)',
          fontSize: 10,
          color: 'var(--cf-muted, #94a3b8)',
          letterSpacing: '0.03em',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '70%' }}>
          {href}
        </span>
        <span style={{ opacity: 0.75 }}>Click to open ↗</span>
      </div>
    </>
  );
}

function skel(widthPct: number, height: number): React.CSSProperties {
  return {
    width: `${widthPct}%`,
    height,
    borderRadius: 3,
    background:
      'linear-gradient(90deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0.06) 100%)',
    backgroundSize: '200% 100%',
    animation: 'cf-link-preview-shimmer 1.4s ease-in-out infinite',
  };
}
