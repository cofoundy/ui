'use client';

import { forwardRef } from 'react';
import type { SurfaceRenderProps } from '../LinkPreviewSurface';

/**
 * Canonical LinkPreview surface — variant `quiet`.
 *
 * Brand stance: Sage-pure. Warmth lives in attention (title, excerpt
 * present, meta if given), not in declaration (no accent stripe, no
 * brand-blue ribbon, no "↗" suffix). Decoration would be a Lover-drift
 * tell — the preview's job is to inform without competing with the body
 * text being read.
 *
 * Refinements from critique:
 *  - Dropped the redundant "↗" suffix; the title itself is the affordance.
 *    The trigger anchor in body text is already styled with hover affordance.
 *  - Meta line: title-case, comma-separated, not mono-uppercase. Reads as
 *    information, not as a debug label.
 *  - Footer: friendly slug ("/{project}/{...slug}" trimmed) at low opacity,
 *    not raw URL. Skipped entirely if href is the same as title context.
 *  - Padding slightly opened (16px vertical, 18px horizontal). 360px width.
 *  - Light-theme: surface flips via --popover token (already light-friendly
 *    on docs.cofoundy.dev's light theme); muted text uses --cf-muted alias.
 */
export const LinkPreviewQuiet = forwardRef<HTMLDivElement, SurfaceRenderProps>(
  function LinkPreviewQuiet(
    { result, href, position, onMouseEnter, onMouseLeave, reduceMotion },
    ref,
  ) {
    const initialTranslate = position?.placement === 'top' ? '4px' : '-4px';

    return (
      <div
        ref={ref}
        role="tooltip"
        data-slot="link-preview"
        data-variant="quiet"
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
          border: '1px solid var(--cf-border, rgba(255,255,255,0.12))',
          borderRadius: 10,
          boxShadow:
            '0 10px 28px -10px rgba(0, 0, 0, 0.5), 0 1px 0 0 rgba(255,255,255,0.04) inset',
          padding: '16px 18px',
          fontFamily: 'var(--font-sans, Inter, system-ui, sans-serif)',
          zIndex: 1000,
          opacity: position ? 1 : 0,
          transform: position ? 'translateY(0)' : `translateY(${initialTranslate})`,
          transition: reduceMotion
            ? 'none'
            : 'opacity 160ms var(--cf-ease-default, cubic-bezier(0.19,1,0.22,1)), transform 160ms var(--cf-ease-default, cubic-bezier(0.19,1,0.22,1))',
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
        <div style={skel(58, 13)} />
        <div style={{ ...skel(100, 9), marginTop: 12 }} />
        <div style={{ ...skel(95, 9), marginTop: 6 }} />
        <div style={{ ...skel(72, 9), marginTop: 6 }} />
      </div>
    );
  }
  if (result.state === 'error') {
    return (
      <div style={{ fontSize: 13, color: 'var(--cf-muted, #94a3b8)' }}>
        <div
          style={{
            fontFamily: 'var(--font-brand, Space Grotesk)',
            fontWeight: 600,
            color: 'var(--cf-fg, #fff)',
            marginBottom: 4,
            fontSize: 14,
          }}
        >
          Preview unavailable
        </div>
        <div style={{ fontSize: 12.5 }}>Click to open the page directly.</div>
      </div>
    );
  }
  const { title, excerpt, meta } = result.data;
  return (
    <>
      <div
        style={{
          fontFamily: 'var(--font-brand, Space Grotesk), system-ui',
          fontWeight: 600,
          fontSize: 14.5,
          lineHeight: 1.35,
          color: 'var(--cf-fg, #fff)',
          marginBottom: 6,
        }}
      >
        {title}
      </div>
      {meta && meta.length > 0 && (
        <div
          style={{
            fontFamily: 'var(--font-sans, Inter, system-ui, sans-serif)',
            fontSize: 11.5,
            color: 'var(--cf-muted, #94a3b8)',
            marginBottom: 10,
          }}
        >
          {meta.map((m, i) => (
            <span key={i}>
              {i > 0 && (
                <span aria-hidden="true" style={{ margin: '0 6px', opacity: 0.5 }}>
                  ·
                </span>
              )}
              <span style={{ opacity: 0.75 }}>{m.label}</span>{' '}
              <span style={{ color: 'var(--cf-fg, rgba(255,255,255,0.88))' }}>{m.value}</span>
            </span>
          ))}
        </div>
      )}
      <div
        style={{
          fontSize: 13,
          lineHeight: 1.6,
          color: 'var(--cf-fg, rgba(255,255,255,0.85))',
          opacity: 0.86,
          display: '-webkit-box',
          WebkitLineClamp: 4,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        {excerpt}
      </div>
      <div
        style={{
          marginTop: 12,
          paddingTop: 10,
          borderTop: '1px solid var(--cf-border, rgba(255,255,255,0.08))',
          fontFamily: 'var(--font-mono, JetBrains Mono, monospace)',
          fontSize: 10.5,
          color: 'var(--cf-muted, #94a3b8)',
          letterSpacing: '0.02em',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          opacity: 0.7,
        }}
      >
        {humanizeHref(href)}
      </div>
    </>
  );
}

/**
 * Trim raw URLs to a friendly relative slug. `/xgodel/deliverables/concept-c`
 * stays as-is; absolute URLs get reduced to pathname.
 */
function humanizeHref(href: string): string {
  try {
    if (href.startsWith('/')) return href;
    const u = new URL(href, typeof window !== 'undefined' ? window.location.origin : 'http://localhost');
    return u.pathname || href;
  } catch {
    return href;
  }
}

function skel(widthPct: number, height: number): React.CSSProperties {
  return {
    width: `${widthPct}%`,
    height,
    borderRadius: 4,
    background:
      'linear-gradient(90deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.13) 50%, rgba(255,255,255,0.06) 100%)',
    backgroundSize: '200% 100%',
    animation: 'cf-link-preview-shimmer 1.4s ease-in-out infinite',
  };
}
