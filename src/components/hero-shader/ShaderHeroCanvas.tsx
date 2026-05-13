'use client';

import * as React from 'react';
import { ShaderGradientCanvas, ShaderGradient } from '@shadergradient/react';
import { useFrame } from '@react-three/fiber';

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
  /** Fired the first time three.js paints a frame into the WebGL canvas. */
  onPainted?: () => void;
}

/**
 * Mounted INSIDE the r3f scene. useFrame runs in three.js's render loop after
 * each frame is drawn — firing it the first time gives the exact moment the
 * shader has produced pixels in the WebGL backbuffer.
 */
function FirstFramePing({ onPainted }: { onPainted?: () => void }) {
  const firedRef = React.useRef(false);
  useFrame(() => {
    if (firedRef.current || !onPainted) return;
    firedRef.current = true;
    onPainted();
  });
  return null;
}

export function ShaderHeroCanvas({
  config,
  pixelDensity = 1,
  onPainted,
}: ShaderHeroCanvasProps) {
  return (
    <ShaderGradientCanvas
      style={{ width: '100%', height: '100%' }}
      pixelDensity={pixelDensity}
      pointerEvents="none"
      lazyLoad={false}
    >
      <ShaderGradient {...config} />
      <FirstFramePing onPainted={onPainted} />
    </ShaderGradientCanvas>
  );
}
