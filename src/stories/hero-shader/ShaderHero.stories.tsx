import type { Meta, StoryObj } from '@storybook/react';
import { ShaderHero } from '../../components/hero-shader';

const meta: Meta<typeof ShaderHero> = {
  title: 'Hero/ShaderHero',
  component: ShaderHero,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Hero background with animated shadergradient + perf gates (poster on mobile / reduced-motion / offscreen). Config must come from shadergradient.co/customize URLs — see cofoundy-toolkit:hero-shader SKILL.md.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof ShaderHero>;

const xgodelConfig = {
  type: 'sphere' as const,
  animate: 'on' as const,
  uTime: 0,
  uSpeed: 0.105,
  uStrength: 0.3,
  uDensity: 0.8,
  uFrequency: 5.5,
  uAmplitude: 3.2,
  positionX: -0.1,
  positionY: 0,
  positionZ: 0,
  rotationX: 0,
  rotationY: 130,
  rotationZ: 70,
  cAzimuthAngle: 270,
  cPolarAngle: 180,
  cDistance: 0.5,
  cameraZoom: 15.1,
  color1: '#FBCFE8',
  color2: '#38BDF8',
  color3: '#0E0B2E',
  reflection: 0.4,
  brightness: 0.65,
  grain: 'on' as const,
  lightType: 'env',
  envPreset: 'city',
};

export const Default: Story = {
  args: {
    config: xgodelConfig,
    posterSrc: '/hero-poster.webp',
    mobileBreakpoint: 1024,
    canvasClassName: 'sb-shader-canvas',
    posterClassName: 'sb-shader-poster',
  },
  render: (args) => (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100vh',
        background: '#0E0B2E',
        overflow: 'hidden',
      }}
    >
      <style>{`
        .sb-shader-canvas, .sb-shader-poster {
          position: absolute; inset: 0;
          width: 100%; height: 100%;
          object-fit: cover; pointer-events: none;
        }
      `}</style>
      <ShaderHero {...args} />
    </div>
  ),
};
