import type { Meta, StoryObj } from '@storybook/react';
import { LinkPreviewProvider } from '../../components/docs/link-preview';
import { DocFrame } from './_DocFrame';
import { makeFetchPreview, makeGetPreview } from './_fixtures';

const meta: Meta = {
  title: 'WIP / LinkPreview / C — Glass',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Concept C — Brand-glass. 4px Cofoundy-blue leading ribbon, backdrop blur, single accent ↗. Matches AuthorNote family.',
      },
    },
  },
};
export default meta;
type Story = StoryObj;

export const CacheHit: Story = {
  render: () => (
    <LinkPreviewProvider variant="glass" getPreview={makeGetPreview()}>
      <DocFrame />
    </LinkPreviewProvider>
  ),
};

export const CacheMiss: Story = {
  render: () => (
    <LinkPreviewProvider variant="glass" fetchPreview={makeFetchPreview()}>
      <DocFrame />
    </LinkPreviewProvider>
  ),
};

export const Hybrid: Story = {
  render: () => (
    <LinkPreviewProvider
      variant="glass"
      getPreview={makeGetPreview()}
      fetchPreview={makeFetchPreview()}
    >
      <DocFrame />
    </LinkPreviewProvider>
  ),
};
