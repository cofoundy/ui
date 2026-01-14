import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta = {
  title: "Foundation/Spacing",
  parameters: {
    layout: "padded",
  },
};

export default meta;
type Story = StoryObj;

const SpacingSwatch = ({
  name,
  size,
  pixels,
}: {
  name: string;
  size: string;
  pixels: string;
}) => (
  <div className="flex items-center gap-4 mb-3">
    <div
      className="bg-[#46A0D0] rounded"
      style={{ width: size, height: "24px" }}
    />
    <div className="flex items-baseline gap-2">
      <span className="font-mono text-sm font-medium w-12">{name}</span>
      <span className="text-gray-500 text-sm">{pixels}</span>
    </div>
  </div>
);

export const SpacingScale: Story = {
  name: "Spacing Scale",
  render: () => (
    <div className="p-6 bg-white rounded-xl">
      <h2 className="text-2xl font-bold mb-2">Spacing Scale</h2>
      <p className="text-gray-600 mb-8">
        Tailwind CSS spacing scale (4px base unit)
      </p>

      <div className="space-y-1">
        <SpacingSwatch name="0" size="0px" pixels="0px" />
        <SpacingSwatch name="0.5" size="2px" pixels="2px" />
        <SpacingSwatch name="1" size="4px" pixels="4px" />
        <SpacingSwatch name="1.5" size="6px" pixels="6px" />
        <SpacingSwatch name="2" size="8px" pixels="8px" />
        <SpacingSwatch name="2.5" size="10px" pixels="10px" />
        <SpacingSwatch name="3" size="12px" pixels="12px" />
        <SpacingSwatch name="4" size="16px" pixels="16px" />
        <SpacingSwatch name="5" size="20px" pixels="20px" />
        <SpacingSwatch name="6" size="24px" pixels="24px" />
        <SpacingSwatch name="8" size="32px" pixels="32px" />
        <SpacingSwatch name="10" size="40px" pixels="40px" />
        <SpacingSwatch name="12" size="48px" pixels="48px" />
        <SpacingSwatch name="16" size="64px" pixels="64px" />
        <SpacingSwatch name="20" size="80px" pixels="80px" />
        <SpacingSwatch name="24" size="96px" pixels="96px" />
      </div>
    </div>
  ),
};

export const BorderRadius: Story = {
  name: "Border Radius",
  render: () => (
    <div className="p-6 bg-white rounded-xl">
      <h2 className="text-2xl font-bold mb-2">Border Radius</h2>
      <p className="text-gray-600 mb-8">
        Radius tokens used across components
      </p>

      <div className="flex flex-wrap gap-6">
        <div className="text-center">
          <div className="w-20 h-20 bg-[#46A0D0] rounded-none mb-2" />
          <span className="text-xs font-mono">rounded-none</span>
          <span className="text-xs text-gray-500 block">0px</span>
        </div>
        <div className="text-center">
          <div className="w-20 h-20 bg-[#46A0D0] rounded-sm mb-2" />
          <span className="text-xs font-mono">rounded-sm</span>
          <span className="text-xs text-gray-500 block">2px</span>
        </div>
        <div className="text-center">
          <div className="w-20 h-20 bg-[#46A0D0] rounded mb-2" />
          <span className="text-xs font-mono">rounded</span>
          <span className="text-xs text-gray-500 block">4px</span>
        </div>
        <div className="text-center">
          <div className="w-20 h-20 bg-[#46A0D0] rounded-md mb-2" />
          <span className="text-xs font-mono">rounded-md</span>
          <span className="text-xs text-gray-500 block">6px</span>
        </div>
        <div className="text-center">
          <div className="w-20 h-20 bg-[#46A0D0] rounded-lg mb-2" />
          <span className="text-xs font-mono">rounded-lg</span>
          <span className="text-xs text-gray-500 block">8px</span>
        </div>
        <div className="text-center">
          <div className="w-20 h-20 bg-[#46A0D0] rounded-xl mb-2" />
          <span className="text-xs font-mono">rounded-xl</span>
          <span className="text-xs text-gray-500 block">12px</span>
        </div>
        <div className="text-center">
          <div className="w-20 h-20 bg-[#46A0D0] rounded-2xl mb-2" />
          <span className="text-xs font-mono">rounded-2xl</span>
          <span className="text-xs text-gray-500 block">16px</span>
        </div>
        <div className="text-center">
          <div className="w-20 h-20 bg-[#46A0D0] rounded-3xl mb-2" />
          <span className="text-xs font-mono">rounded-3xl</span>
          <span className="text-xs text-gray-500 block">24px</span>
        </div>
        <div className="text-center">
          <div className="w-20 h-20 bg-[#46A0D0] rounded-full mb-2" />
          <span className="text-xs font-mono">rounded-full</span>
          <span className="text-xs text-gray-500 block">9999px</span>
        </div>
      </div>

      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-semibold mb-2">Common Usage</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• <strong>Buttons:</strong> rounded-md to rounded-lg</li>
          <li>• <strong>Cards:</strong> rounded-xl to rounded-2xl</li>
          <li>• <strong>Chat bubbles:</strong> rounded-2xl with rounded-tl-sm/tr-sm</li>
          <li>• <strong>Avatars:</strong> rounded-full</li>
          <li>• <strong>Inputs:</strong> rounded-md</li>
        </ul>
      </div>
    </div>
  ),
};

export const Shadows: Story = {
  name: "Shadows",
  render: () => (
    <div className="p-6 bg-gray-100 rounded-xl">
      <h2 className="text-2xl font-bold mb-2">Shadows</h2>
      <p className="text-gray-600 mb-8">
        Shadow tokens for depth and elevation
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="text-center">
          <div className="w-24 h-24 bg-white rounded-lg shadow-sm mb-2 mx-auto" />
          <span className="text-xs font-mono">shadow-sm</span>
        </div>
        <div className="text-center">
          <div className="w-24 h-24 bg-white rounded-lg shadow mb-2 mx-auto" />
          <span className="text-xs font-mono">shadow</span>
        </div>
        <div className="text-center">
          <div className="w-24 h-24 bg-white rounded-lg shadow-md mb-2 mx-auto" />
          <span className="text-xs font-mono">shadow-md</span>
        </div>
        <div className="text-center">
          <div className="w-24 h-24 bg-white rounded-lg shadow-lg mb-2 mx-auto" />
          <span className="text-xs font-mono">shadow-lg</span>
        </div>
        <div className="text-center">
          <div className="w-24 h-24 bg-white rounded-lg shadow-xl mb-2 mx-auto" />
          <span className="text-xs font-mono">shadow-xl</span>
        </div>
        <div className="text-center">
          <div className="w-24 h-24 bg-white rounded-lg shadow-2xl mb-2 mx-auto" />
          <span className="text-xs font-mono">shadow-2xl</span>
        </div>
      </div>

      <div className="mt-8">
        <h4 className="font-semibold mb-4">Chat Widget Shadow</h4>
        <div className="flex gap-6">
          <div className="text-center">
            <div
              className="w-32 h-24 bg-[#020b1b] rounded-2xl mb-2"
              style={{ boxShadow: "0 4px 24px rgba(0, 0, 0, 0.4)" }}
            />
            <span className="text-xs font-mono block">--chat-shadow</span>
            <span className="text-xs text-gray-500">Dark theme</span>
          </div>
          <div className="text-center">
            <div
              className="w-32 h-24 bg-white rounded-2xl mb-2"
              style={{ boxShadow: "0 4px 24px rgba(0, 0, 0, 0.08)" }}
            />
            <span className="text-xs font-mono block">--chat-shadow</span>
            <span className="text-xs text-gray-500">Light theme</span>
          </div>
        </div>
      </div>
    </div>
  ),
};

export const LayoutPatterns: Story = {
  name: "Layout Patterns",
  render: () => (
    <div className="p-6 bg-white rounded-xl">
      <h2 className="text-2xl font-bold mb-2">Layout Patterns</h2>
      <p className="text-gray-600 mb-8">
        Common spacing patterns used in components
      </p>

      <div className="space-y-8">
        <div>
          <h4 className="font-semibold mb-4">Card Padding</h4>
          <div className="flex gap-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg">
              <div className="bg-gray-100 p-3 rounded-lg">
                <span className="text-xs">p-3 (12px)</span>
              </div>
            </div>
            <div className="border-2 border-dashed border-gray-300 rounded-lg">
              <div className="bg-gray-100 p-4 rounded-lg">
                <span className="text-xs">p-4 (16px)</span>
              </div>
            </div>
            <div className="border-2 border-dashed border-gray-300 rounded-lg">
              <div className="bg-gray-100 p-6 rounded-lg">
                <span className="text-xs">p-6 (24px)</span>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-4">Gap Spacing</h4>
          <div className="space-y-4">
            <div className="flex gap-1 items-center">
              <div className="w-8 h-8 bg-[#46A0D0] rounded" />
              <div className="w-8 h-8 bg-[#46A0D0] rounded" />
              <div className="w-8 h-8 bg-[#46A0D0] rounded" />
              <span className="text-xs text-gray-500 ml-2">gap-1 (4px) - Tight</span>
            </div>
            <div className="flex gap-2 items-center">
              <div className="w-8 h-8 bg-[#46A0D0] rounded" />
              <div className="w-8 h-8 bg-[#46A0D0] rounded" />
              <div className="w-8 h-8 bg-[#46A0D0] rounded" />
              <span className="text-xs text-gray-500 ml-2">gap-2 (8px) - Compact</span>
            </div>
            <div className="flex gap-4 items-center">
              <div className="w-8 h-8 bg-[#46A0D0] rounded" />
              <div className="w-8 h-8 bg-[#46A0D0] rounded" />
              <div className="w-8 h-8 bg-[#46A0D0] rounded" />
              <span className="text-xs text-gray-500 ml-2">gap-4 (16px) - Default</span>
            </div>
            <div className="flex gap-6 items-center">
              <div className="w-8 h-8 bg-[#46A0D0] rounded" />
              <div className="w-8 h-8 bg-[#46A0D0] rounded" />
              <div className="w-8 h-8 bg-[#46A0D0] rounded" />
              <span className="text-xs text-gray-500 ml-2">gap-6 (24px) - Spacious</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
};
