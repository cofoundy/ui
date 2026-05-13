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
}

export function ShaderHeroCanvas({
  config,
  pixelDensity = 1,
}: ShaderHeroCanvasProps) {
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
