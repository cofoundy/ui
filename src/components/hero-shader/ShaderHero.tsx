'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import type { ShaderHeroConfig, ShaderHeroCanvasProps } from './ShaderHeroCanvas';

const ShaderHeroCanvas = dynamic<ShaderHeroCanvasProps>(
  () => import('./ShaderHeroCanvas').then((m) => m.ShaderHeroCanvas),
  { ssr: false, loading: () => null },
);

export interface ShaderHeroProps {
  /** Shader params — copy LITERAL from a shadergradient.co/customize URL. */
  config: ShaderHeroConfig;
  /** WebP/JPG poster shown on mobile, reduced-motion, offscreen, and during shader load. */
  posterSrc: string;
  /** Below this CSS width (px) the shader never loads — poster only. Default 1024. */
  mobileBreakpoint?: number;
  /** CSS class applied to the canvas wrapper. */
  canvasClassName?: string;
  /** CSS class applied to the poster <img>. */
  posterClassName?: string;
  /** Pixel density passed to ShaderGradientCanvas. Default 1. */
  pixelDensity?: number;
  /** Optional ref to the parent section for IntersectionObserver. If omitted, the shader is treated as always in view. */
  observeRef?: React.RefObject<HTMLElement | null>;
}

/**
 * Hero background renderer with three perf gates:
 *   1. viewport < mobileBreakpoint → poster only, lib never loaded
 *   2. prefers-reduced-motion → poster only
 *   3. parent offscreen (if observeRef given) → unmount canvas
 *
 * The poster always stays mounted as a base layer. The canvas is overlaid on
 * top once gates pass — while the three.js chunk loads, the canvas wrapper is
 * transparent and the poster bleeds through, so there's no flash to background
 * color before the first shader paint.
 *
 * The poster should be a frame-canonical capture of `config` so the transition
 * from poster → live shader is seamless. Use the capture-shader-poster script.
 */
export function ShaderHero({
  config,
  posterSrc,
  mobileBreakpoint = 1024,
  canvasClassName,
  posterClassName,
  pixelDensity = 1,
  observeRef,
}: ShaderHeroProps) {
  const [mounted, setMounted] = React.useState(false);
  const [shouldRender, setShouldRender] = React.useState(false);
  const [inView, setInView] = React.useState(true);

  React.useEffect(() => {
    setMounted(true);
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const isMobile =
      typeof window !== 'undefined' && window.innerWidth < mobileBreakpoint;
    setShouldRender(!(prefersReduced || isMobile));
  }, [mobileBreakpoint]);

  React.useEffect(() => {
    if (!shouldRender || !observeRef?.current) return;
    if (typeof IntersectionObserver === 'undefined') return;
    const el = observeRef.current;
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0, rootMargin: '100px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [shouldRender, observeRef]);

  const showCanvas = mounted && shouldRender && inView;

  // Crossfade gate: only reveal the canvas once the shader has actually
  // painted (avoids a black flash from WebGL's pre-paint opaque backbuffer).
  const [painted, setPainted] = React.useState(false);
  React.useEffect(() => {
    if (!showCanvas) setPainted(false);
  }, [showCanvas]);

  return (
    <>
      <img
        className={posterClassName}
        src={posterSrc}
        alt=""
        aria-hidden="true"
        decoding="async"
        loading="eager"
      />
      {showCanvas && (
        <div
          className={canvasClassName}
          style={{
            opacity: painted ? 1 : 0,
            transition: 'opacity 350ms ease-out',
          }}
        >
          <ShaderHeroCanvas
            config={config}
            pixelDensity={pixelDensity}
            onPainted={() => setPainted(true)}
          />
        </div>
      )}
    </>
  );
}
