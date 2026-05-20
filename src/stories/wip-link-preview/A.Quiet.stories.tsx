import type { Meta, StoryObj } from '@storybook/react';
import { LinkPreviewProvider } from '../../components/docs/link-preview';
import { DocFrame } from './_DocFrame';
import { makeFetchPreview, makeGetPreview } from './_fixtures';

const meta: Meta = {
  title: 'WIP / LinkPreview / A — Quiet',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Concept A — Sage-pure. Single hairline border, deep popover surface, no accent stripe. The preview almost isn’t there.',
      },
    },
  },
};
export default meta;
type Story = StoryObj;

export const CacheHit: Story = {
  render: () => (
    <LinkPreviewProvider variant="quiet" getPreview={makeGetPreview()}>
      <DocFrame />
    </LinkPreviewProvider>
  ),
};

export const CacheMiss: Story = {
  render: () => (
    <LinkPreviewProvider variant="quiet" fetchPreview={makeFetchPreview()}>
      <DocFrame />
    </LinkPreviewProvider>
  ),
};

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
