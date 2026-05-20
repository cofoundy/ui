import type { Meta, StoryObj } from '@storybook/react';
import { LinkPreviewProvider } from '../../components/docs/link-preview';
import { DocFrame } from './_DocFrame';
import { makeFetchPreview, makeGetPreview } from './_fixtures';

const meta: Meta = {
  title: 'WIP / LinkPreview / B — Index Card',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Concept B — Index-card / citation. Kind-tag in mono caps, display title, footnote-style meta. Sage-academic.',
      },
    },
  },
};
export default meta;
type Story = StoryObj;

export const CacheHit: Story = {
  render: () => (
    <LinkPreviewProvider variant="card" getPreview={makeGetPreview()}>
      <DocFrame />
    </LinkPreviewProvider>
  ),
};

export const CacheMiss: Story = {
  render: () => (
    <LinkPreviewProvider variant="card" fetchPreview={makeFetchPreview()}>
      <DocFrame />
    </LinkPreviewProvider>
  ),
};

export const Hybrid: Story = {
  render: () => (
    <LinkPreviewProvider
      variant="card"
      getPreview={makeGetPreview()}
      fetchPreview={makeFetchPreview()}
    >
      <DocFrame />
    </LinkPreviewProvider>
  ),
};
