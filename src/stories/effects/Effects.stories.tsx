import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";

import { ShimmerText } from "../../components/effects/ShimmerText";
import { GradientBorder } from "../../components/effects/GradientBorder";

// ============================================
// ShimmerText Stories
// ============================================

const shimmerMeta: Meta<typeof ShimmerText> = {
  title: "Effects/ShimmerText",
  component: ShimmerText,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <div
        className="p-12 rounded-xl min-h-[200px] flex items-center justify-center"
        style={{ backgroundColor: "#020916" }}
      >
        <Story />
      </div>
    ),
  ],
};

export default shimmerMeta;
type ShimmerStory = StoryObj<typeof ShimmerText>;

export const GoldShimmer: ShimmerStory = {
  args: {
    children: "🍗 Pollada Virtual",
    variant: "gold",
  },
  render: (args) => (
    <ShimmerText {...args} className="text-2xl font-bold" />
  ),
};

export const BrandShimmer: ShimmerStory = {
  args: {
    children: "Cofoundy",
    variant: "brand",
  },
  render: (args) => (
    <ShimmerText {...args} className="text-2xl font-bold" />
  ),
};

export const SilverShimmer: ShimmerStory = {
  args: {
    children: "Premium Feature",
    variant: "silver",
  },
  render: (args) => (
    <ShimmerText {...args} className="text-2xl font-bold" />
  ),
};

export const ShimmerTextSizes: ShimmerStory = {
  render: () => (
    <div className="flex flex-col gap-4 items-center">
      <ShimmerText variant="gold" className="text-sm font-medium">
        Small Text
      </ShimmerText>
      <ShimmerText variant="gold" className="text-lg font-semibold">
        Medium Text
      </ShimmerText>
      <ShimmerText variant="gold" className="text-2xl font-bold">
        Large Text
      </ShimmerText>
      <ShimmerText variant="gold" className="text-4xl font-black">
        Extra Large
      </ShimmerText>
    </div>
  ),
};

export const ShimmerInContext: ShimmerStory = {
  render: () => (
    <div className="text-white text-center">
      <p className="text-lg mb-2">¡No te pierdas nuestra</p>
      <ShimmerText variant="gold" className="text-3xl font-bold">
        🍗 Pollada Virtual
      </ShimmerText>
      <p className="text-white/60 text-sm mt-2">Apoya al equipo desde S/.50</p>
    </div>
  ),
};

// ============================================
// GradientBorder Stories
// ============================================

export const BrandGradientBorder: StoryObj<typeof GradientBorder> = {
  render: () => (
    <GradientBorder variant="brand" borderRadius={12} className="inline-block">
      <div className="px-6 py-4">
        <p className="text-white font-semibold">🍗 Pollada Virtual</p>
        <p className="text-white/60 text-sm">¡Apoya al equipo!</p>
      </div>
    </GradientBorder>
  ),
};

export const GoldGradientBorder: StoryObj<typeof GradientBorder> = {
  render: () => (
    <GradientBorder variant="gold" borderRadius={12} className="inline-block">
      <div className="px-6 py-4">
        <p className="text-[#fbbf24] font-semibold">🍗 Pollada Virtual</p>
        <p className="text-[#fbbf24]/60 text-sm">¡Apoya al equipo!</p>
      </div>
    </GradientBorder>
  ),
};

export const RainbowGradientBorder: StoryObj<typeof GradientBorder> = {
  render: () => (
    <GradientBorder variant="rainbow" borderRadius={12} className="inline-block">
      <div className="px-6 py-4">
        <p className="text-white font-semibold">🌈 Special Item</p>
        <p className="text-white/60 text-sm">Rainbow border effect</p>
      </div>
    </GradientBorder>
  ),
};

export const WithGlow: StoryObj<typeof GradientBorder> = {
  render: () => (
    <div className="flex flex-col gap-8">
      <GradientBorder variant="brand" borderRadius={12} glow className="inline-block">
        <div className="px-6 py-4">
          <p className="text-white font-semibold">Brand Glow</p>
          <p className="text-white/60 text-sm">With blur glow effect</p>
        </div>
      </GradientBorder>
      <GradientBorder variant="gold" borderRadius={12} glow className="inline-block">
        <div className="px-6 py-4">
          <p className="text-[#fbbf24] font-semibold">Gold Glow</p>
          <p className="text-[#fbbf24]/60 text-sm">With blur glow effect</p>
        </div>
      </GradientBorder>
      <GradientBorder variant="rainbow" borderRadius={12} glow className="inline-block">
        <div className="px-6 py-4">
          <p className="text-white font-semibold">Rainbow Glow</p>
          <p className="text-white/60 text-sm">With blur glow effect</p>
        </div>
      </GradientBorder>
    </div>
  ),
};

export const GradientBorderSizes: StoryObj<typeof GradientBorder> = {
  render: () => (
    <div className="flex flex-col gap-6">
      <GradientBorder variant="brand" borderRadius={4} borderWidth={1}>
        <div className="px-4 py-2 text-white text-sm">Small rounded, thin border</div>
      </GradientBorder>
      <GradientBorder variant="brand" borderRadius={8} borderWidth={2}>
        <div className="px-4 py-2 text-white text-sm">Large rounded, medium border</div>
      </GradientBorder>
      <GradientBorder variant="brand" borderRadius={12} borderWidth={3}>
        <div className="px-4 py-2 text-white text-sm">XL rounded, thick border</div>
      </GradientBorder>
    </div>
  ),
};

// ============================================
// Combined Effects
// ============================================

export const CombinedEffects: StoryObj = {
  render: () => (
    <div className="flex flex-col gap-8">
      <div>
        <h3 className="text-white/60 text-xs uppercase tracking-wide mb-3">
          Shimmer Text + Gradient Border
        </h3>
        <GradientBorder variant="gold" borderRadius={12} className="inline-block">
          <div className="px-6 py-4">
            <ShimmerText variant="gold" className="text-lg font-bold">
              🍗 Pollada Virtual
            </ShimmerText>
            <p className="text-[#fbbf24]/60 text-sm mt-1">¡Apoya al equipo! Desde S/.50</p>
          </div>
        </GradientBorder>
      </div>

      <div>
        <h3 className="text-white/60 text-xs uppercase tracking-wide mb-3">
          Brand Shimmer + Brand Border
        </h3>
        <GradientBorder variant="brand" borderRadius={12} className="inline-block">
          <div className="px-6 py-4">
            <ShimmerText variant="brand" className="text-lg font-bold">
              TimelyAI Premium
            </ShimmerText>
            <p className="text-white/60 text-sm mt-1">Scheduling inteligente</p>
          </div>
        </GradientBorder>
      </div>
    </div>
  ),
};

// Light background version
export const LightBackground: StoryObj = {
  decorators: [
    (Story) => (
      <div
        className="p-12 rounded-xl min-h-[200px] flex items-center justify-center"
        style={{ backgroundColor: "#f8fafc" }}
      >
        <Story />
      </div>
    ),
  ],
  render: () => (
    <div className="flex flex-col gap-6">
      <ShimmerText variant="gold" className="text-2xl font-bold">
        🍗 Pollada Virtual
      </ShimmerText>
      <GradientBorder variant="brand" borderRadius={12} background="#ffffff" className="inline-block">
        <div className="px-6 py-4">
          <p className="text-[#0f172a] font-semibold">Featured Item</p>
          <p className="text-[#64748b] text-sm">Works on light backgrounds too</p>
        </div>
      </GradientBorder>
    </div>
  ),
};
