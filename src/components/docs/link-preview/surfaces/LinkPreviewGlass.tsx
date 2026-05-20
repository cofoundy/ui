'use client';

import { forwardRef } from 'react';
import type { SurfaceRenderProps } from '../LinkPreviewSurface';

/**
 * Concept C — Glass
 *
 * Brand stance: Sage + Caregiver, with a single brand-blue accent ribbon
 * on the leading edge (4px wide, matches the Cofoundy --cf-primary). Soft
 * backdrop-filter blur for surface depth. Title in Space Grotesk; an
 * outlined ↗ icon top-right. The brand-blue is the *only* color note —
 * everything else is greyscale. This earns Cofoundy-identity without
 * declaring it.
 *
 * Why this design: matches docs.cofoundy.dev's gradient hero + branded
 * accent strips on AuthorNote / NextStepCallout. The preview reads as
 * part of the same family. The 4px leading ribbon is the same convention
 * already used in AuthorNote — visual consistency, not invention.
 */
export const LinkPreviewGlass = forwardRef<HTMLDivElement, SurfaceRenderProps>(
  function LinkPreviewGlass(
    { result, href, position, onMouseEnter, onMouseLeave, reduceMotion },
    ref,
  ) {
    const enterTranslate = position?.placement === 'top' ? '0px' : '0px';
    const initialTranslate = position?.placement === 'top' ? '4px' : '-4px';

    return (
      <div
        ref={ref}
        role="tooltip"
        data-slot="link-preview"
        data-variant="glass"
        data-placement={position?.placement ?? 'bottom'}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        style={{
          position: 'fixed',
          top: position?.top ?? -9999,
          left: position?.left ?? -9999,
          width: 360,
          maxWidth: 'calc(100vw - 24px)',
          background: 'color-mix(in oklab, var(--popover, #0f172a) 88%, transparent)',
          backdropFilter: 'blur(10px) saturate(140%)',
          WebkitBackdropFilter: 'blur(10px) saturate(140%)',
          color: 'var(--popover-foreground, #ffffff)',
          border: '1px solid var(--cf-border, rgba(255,255,255,0.12))',
          borderLeft: '4px solid var(--cf-primary, #46A0D0)',
          borderRadius: 8,
          boxShadow:
            '0 16px 40px -12px rgba(0,0,0,0.55), 0 2px 4px -2px rgba(0,0,0,0.3), 0 0 0 1px rgba(70,160,208,0.04)',
          padding: '14px 16px 12px',
          fontFamily: 'var(--font-sans, Inter, system-ui, sans-serif)',
          zIndex: 1000,
          opacity: position ? 1 : 0,
          transform: position ? `translateY(${enterTranslate})` : `translateY(${initialTranslate})`,
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
        <div style={skel(65, 14)} />
        <div style={{ ...skel(96, 10), marginTop: 10 }} />
        <div style={{ ...skel(90, 10), marginTop: 6 }} />
        <div style={{ ...skel(70, 10), marginTop: 6 }} />
      </div>
    );
  }
  if (result.state === 'error') {
    return (
      <div style={{ fontSize: 13, color: 'var(--cf-muted, #94a3b8)' }}>
        <div style={{ fontFamily: 'var(--font-brand)', fontWeight: 600, color: 'var(--cf-fg, #fff)', marginBottom: 4 }}>
          Preview unavailable
        </div>
        <div style={{ fontSize: 12 }}>Click to open the page directly.</div>
      </div>
    );
  }
  const { title, excerpt, meta } = result.data;
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
        <div
          style={{
            flex: 1,
            fontFamily: 'var(--font-brand, Space Grotesk), system-ui',
            fontWeight: 600,
            fontSize: 14.5,
            lineHeight: 1.35,
            color: 'var(--cf-fg, #fff)',
            letterSpacing: '-0.005em',
          }}
        >
          {title}
        </div>
        <span
          aria-hidden="true"
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            color: 'var(--cf-primary, #46A0D0)',
            opacity: 0.85,
            paddingTop: 1,
            flexShrink: 0,
          }}
        >
          ↗
        </span>
      </div>
      {meta && meta.length > 0 && (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '4px 12px',
            fontFamily: 'var(--font-mono, JetBrains Mono, monospace)',
            fontSize: 10.5,
            color: 'var(--cf-muted, #94a3b8)',
            marginBottom: 8,
            letterSpacing: '0.03em',
          }}
        >
          {meta.map((m, i) => (
            <span key={i}>
              <span style={{ opacity: 0.65 }}>{m.label}</span>{' '}
              <span>{m.value}</span>
            </span>
          ))}
        </div>
      )}
      <div
        style={{
          fontSize: 13,
          lineHeight: 1.58,
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
          marginTop: 10,
          paddingTop: 8,
          borderTop: '1px solid var(--cf-border, rgba(255,255,255,0.08))',
          fontFamily: 'var(--font-mono, JetBrains Mono, monospace)',
          fontSize: 10,
          color: 'var(--cf-muted, #94a3b8)',
          letterSpacing: '0.03em',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {href}
      </div>
    </>
  );
}

function skel(widthPct: number, height: number): React.CSSProperties {
  return {
    width: `${widthPct}%`,
    height,
    borderRadius: 4,
    background:
      'linear-gradient(90deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.14) 50%, rgba(255,255,255,0.06) 100%)',
    backgroundSize: '200% 100%',
    animation: 'cf-link-preview-shimmer 1.4s ease-in-out infinite',
  };
}
