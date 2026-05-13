'use client';

import * as React from 'react';
import { ShaderGradientCanvas, ShaderGradient } from '@shadergradient/react';

export type ShaderHeroType = 'sphere' | 'waves' | 'plane';
export type ShaderHeroGrain = 'on' | 'off';
export type ShaderHeroAnimate = 'on' | 'off';

export interface ShaderHeroConfig {
  type: ShaderHeroType;
  animate?: ShaderHeroAnimate;
  uTime?: number;
  uSpeed?: number;
  uStrength?: number;
  uDensity?: number;
  uFrequency?: number;
  uAmplitude?: number;
  positionX?: number;
  positionY?: number;
  positionZ?: number;
  rotationX?: number;
  rotationY?: number;
  rotationZ?: number;
  cAzimuthAngle?: number;
  cPolarAngle?: number;
  cDistance?: number;
  cameraZoom?: number;
  color1: string;
  color2: string;
  color3: string;
  reflection?: number;
  brightness?: number;
  grain?: ShaderHeroGrain;
  lightType?: string;
  envPreset?: string;
}

export interface ShaderHeroCanvasProps {
  config: ShaderHeroConfig;
  pixelDensity?: number;
  /** Fired after component mounts + 2 animation frames (≈ when WebGL has painted). */
  onPainted?: () => void;
}

export function ShaderHeroCanvas({
  config,
  pixelDensity = 1,
  onPainted,
}: ShaderHeroCanvasProps) {
  React.useEffect(() => {
    if (!onPainted) return;
    // Two rAFs: first to let the component commit, second to let three.js
    // run its initial render. By the time the second rAF fires, the WebGL
    // backbuffer has the shader frame — safe to reveal.
    const id1 = requestAnimationFrame(() => {
      const id2 = requestAnimationFrame(() => onPainted());
      (id1 as unknown as { _id2?: number })._id2 = id2;
    });
    return () => cancelAnimationFrame(id1);
  }, [onPainted]);

  return (
    <ShaderGradientCanvas
      style={{ width: '100%', height: '100%' }}
      pixelDensity={pixelDensity}
      pointerEvents="none"
      lazyLoad={false}
    >
      <ShaderGradient {...config} />
    </ShaderGradientCanvas>
  );
}
