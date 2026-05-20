import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { LinkPreviewProvider } from '../../../components/docs/link-preview';
import type { PreviewData } from '../../../components/docs/link-preview';

const sample: PreviewData = {
  title: 'Test Doc',
  excerpt: 'A short excerpt for the preview.',
  meta: [{ label: 'Estado', value: 'firmado' }],
  kind: 'doc',
};

function renderWith(props: Partial<React.ComponentProps<typeof LinkPreviewProvider>>) {
  return render(
    <LinkPreviewProvider openDelay={20} closeDelay={20} {...props}>
      <a href="/foo" data-link-preview="">
        target link
      </a>
      <a href="/no-preview">non-opt-in</a>
      <a href="https://external.example.com/foo" data-link-preview="">
        external
      </a>
    </LinkPreviewProvider>,
  );
}

afterEach(() => vi.useRealTimers());

describe('LinkPreviewProvider', () => {
  it('shows a cached preview on hover after openDelay', async () => {
    const getPreview = vi.fn().mockReturnValue(sample);
    renderWith({ getPreview });
    fireEvent.mouseOver(screen.getByText('target link'));
    expect(getPreview).not.toHaveBeenCalled();
    await waitFor(() => expect(screen.getByRole('tooltip')).toBeInTheDocument(), { timeout: 200 });
    expect(getPreview).toHaveBeenCalledWith('/foo');
    expect(screen.getByText('Test Doc')).toBeInTheDocument();
  });

  it('falls back to fetchPreview on cache miss and shows skeleton then content', async () => {
    const getPreview = vi.fn().mockReturnValue(null);
    let resolveFn!: (d: PreviewData) => void;
    const fetchPreview = vi.fn().mockImplementation(
      () =>
        new Promise<PreviewData>((res) => {
          resolveFn = res;
        }),
    );
    renderWith({ getPreview, fetchPreview });
    fireEvent.mouseOver(screen.getByText('target link'));
    await waitFor(() => expect(screen.getByRole('tooltip')).toBeInTheDocument(), { timeout: 200 });
    // skeleton state — aria-busy element
    expect(screen.getByLabelText('Loading preview')).toBeInTheDocument();
    await act(async () => {
      resolveFn(sample);
    });
    await waitFor(() => expect(screen.getByText('Test Doc')).toBeInTheDocument());
  });

  it('ignores anchors without data-link-preview', async () => {
    const getPreview = vi.fn().mockReturnValue(sample);
    renderWith({ getPreview });
    fireEvent.mouseOver(screen.getByText('non-opt-in'));
    await new Promise((r) => setTimeout(r, 80));
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('ignores external links (cross-origin)', async () => {
    const getPreview = vi.fn().mockReturnValue(sample);
    renderWith({ getPreview });
    fireEvent.mouseOver(screen.getByText('external'));
    await new Promise((r) => setTimeout(r, 80));
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('dismisses on Escape', async () => {
    const getPreview = vi.fn().mockReturnValue(sample);
    renderWith({ getPreview });
    fireEvent.mouseOver(screen.getByText('target link'));
    await waitFor(() => expect(screen.getByRole('tooltip')).toBeInTheDocument(), { timeout: 200 });
    fireEvent.keyDown(window, { key: 'Escape' });
    await waitFor(() => expect(screen.queryByRole('tooltip')).not.toBeInTheDocument());
  });

  it('does nothing when disabled', async () => {
    const getPreview = vi.fn().mockReturnValue(sample);
    renderWith({ getPreview, disabled: true });
    fireEvent.mouseOver(screen.getByText('target link'));
    await new Promise((r) => setTimeout(r, 80));
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('honors openDelay before mounting popover', async () => {
    const getPreview = vi.fn().mockReturnValue(sample);
    render(
      <LinkPreviewProvider openDelay={200} closeDelay={20} getPreview={getPreview}>
        <a href="/foo" data-link-preview="">
          target link
        </a>
      </LinkPreviewProvider>,
    );
    fireEvent.mouseOver(screen.getByText('target link'));
    await new Promise((r) => setTimeout(r, 50));
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    await waitFor(() => expect(screen.getByRole('tooltip')).toBeInTheDocument(), { timeout: 400 });
  });
});
