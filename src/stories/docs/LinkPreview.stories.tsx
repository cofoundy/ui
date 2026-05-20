import type { Meta, StoryObj } from '@storybook/react';
import { LinkPreviewProvider } from '../../components/docs/link-preview';
import { DocFrame } from '../wip-link-preview/_DocFrame';
import { makeFetchPreview, makeGetPreview } from '../wip-link-preview/_fixtures';

/**
 * Wikilink hover preview for docs.cofoundy.dev — Sage-pure variant.
 *
 * Mount `<LinkPreviewProvider>` once around any region with previewable
 * anchors (e.g., inside <DocLayout> wrapping the precompiled HTML article).
 * Anchors opt in via `data-link-preview=""` — same-origin only, never
 * previews external links. The component is data-agnostic: pass
 * `getPreview` (sync cache hit) and/or `fetchPreview` (async fallback).
 */
const meta: Meta<typeof LinkPreviewProvider> = {
  title: 'Docs / LinkPreview',
  component: LinkPreviewProvider,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof LinkPreviewProvider>;

/** Cache map hit — instant render, no skeleton. The 95% path. */
export const CacheHit: Story = {
  render: () => (
    <LinkPreviewProvider variant="quiet" getPreview={makeGetPreview()}>
      <DocFrame />
    </LinkPreviewProvider>
  ),
};

/** Cache miss — skeleton → resolved content after ~600ms. The fallback path. */
export const CacheMiss: Story = {
  render: () => (
    <LinkPreviewProvider variant="quiet" fetchPreview={makeFetchPreview()}>
      <DocFrame />
    </LinkPreviewProvider>
  ),
};

/** Hybrid — sync cache first, async fallback if cache miss. The production setup. */
export const Hybrid: Story = {
  render: () => (
    <LinkPreviewProvider
      variant="quiet"
      getPreview={makeGetPreview()}
      fetchPreview={makeFetchPreview()}
    >
      <DocFrame />
    </LinkPreviewProvider>
  ),
};

/** Light theme — same surface tokens, contrast preserved. */
export const LightTheme: Story = {
  decorators: [
    (Story) => (
      <div data-theme="light" style={{ minHeight: '100vh', background: '#ffffff' }}>
        <Story />
      </div>
    ),
  ],
  render: () => (
    <LinkPreviewProvider variant="quiet" getPreview={makeGetPreview()}>
      <DocFrame />
    </LinkPreviewProvider>
  ),
};

/** Reduced motion — instant show/hide, no translate-Y. */
export const ReducedMotion: Story = {
  decorators: [
    (Story) => (
      <>
        <style>{`@media (prefers-reduced-motion: no-preference) { html { } } html { } /* simulated by setting motion-reduce */`}</style>
        <Story />
      </>
    ),
  ],
  render: () => (
    <LinkPreviewProvider variant="quiet" getPreview={makeGetPreview()}>
      <DocFrame />
    </LinkPreviewProvider>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'When `prefers-reduced-motion: reduce` is set at the OS level, the popover appears instantly with no translate or opacity transition. Test by toggling OS motion settings.',
      },
    },
  },
};

/** Slow network — emulates 1.6s fetch latency to show skeleton state clearly. */
export const SlowFetch: Story = {
  render: () => (
    <LinkPreviewProvider variant="quiet" fetchPreview={makeFetchPreview(undefined, 1600)}>
      <DocFrame />
    </LinkPreviewProvider>
  ),
};

/** Error path — fetchPreview rejects on unknown href. */
export const ErrorState: Story = {
  render: () => (
    <LinkPreviewProvider
      variant="quiet"
      fetchPreview={async () => {
        await new Promise((r) => setTimeout(r, 400));
        throw new Error('not-found');
      }}
    >
      <DocFrame />
    </LinkPreviewProvider>
  ),
};
