import { describe, it, expect, expectTypeOf } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Sitemap, type SitemapProps } from './Sitemap';
import { sitemapSchema, type SitemapInput } from './Sitemap.schema';

const canonical: SitemapInput = {
  nodes: [
    {
      path: '/',
      label: 'Home',
      depth: 0,
      intent: 'informational',
      nav_group: 'primary',
      children: [
        { path: '/about', label: 'About', depth: 1, intent: 'trust', nav_group: 'primary' },
        {
          path: '/products',
          label: 'Products',
          depth: 1,
          nav_group: 'primary',
          children: [
            { path: '/products/inbox', label: 'Inbox AI', depth: 2, intent: 'transactional' },
            { path: '/products/agenda', label: 'Agenda AI', depth: 2, intent: 'transactional' },
          ],
        },
      ],
    },
    { path: '/contact', label: 'Contact', depth: 0, intent: 'transactional' },
  ],
  defaultExpanded: true,
};

describe('Sitemap schema', () => {
  it('parses canonical recursive example', () => {
    expect(() => sitemapSchema.parse(canonical)).not.toThrow();
  });

  it('types align with component props (subset)', () => {
    expectTypeOf<SitemapInput['nodes']>().toMatchTypeOf<SitemapProps['nodes']>();
  });

  it('rejects empty nodes', () => {
    expect(sitemapSchema.safeParse({ nodes: [] }).success).toBe(false);
  });

  it('rejects node missing required `path`', () => {
    expect(sitemapSchema.safeParse({ nodes: [{ label: 'x' }] }).success).toBe(false);
  });

  it('rejects node missing required `label`', () => {
    expect(sitemapSchema.safeParse({ nodes: [{ path: 'x' }] }).success).toBe(false);
  });

  it('rejects invalid density', () => {
    expect(sitemapSchema.safeParse({ nodes: [{ path: '/', label: 'x' }], density: 'tight' }).success).toBe(false);
  });
});

describe('Sitemap render', () => {
  it('renders tree with ARIA roles', () => {
    const { container } = render(<Sitemap nodes={canonical.nodes as any} />);
    expect(container.querySelector('[role="tree"]')).toBeTruthy();
    expect(container.querySelectorAll('[role="treeitem"]').length).toBeGreaterThan(0);
  });

  it('renders labels and paths', () => {
    render(<Sitemap nodes={canonical.nodes as any} />);
    expect(screen.getByText('Home')).toBeTruthy();
    expect(screen.getByText('/contact')).toBeTruthy();
  });

  it('renders intent + nav_group slots', () => {
    const { container } = render(<Sitemap nodes={canonical.nodes as any} />);
    expect(container.querySelectorAll('[data-slot="sitemap-intent"]').length).toBeGreaterThan(0);
    expect(container.querySelectorAll('[data-slot="sitemap-nav-group"]').length).toBeGreaterThan(0);
  });

  it('toggles open state on click', () => {
    const { container } = render(<Sitemap nodes={canonical.nodes as any} defaultExpanded={false} />);
    const homeRow = container.querySelectorAll('[role="treeitem"]')[0];
    expect(homeRow.getAttribute('aria-expanded')).toBe('false');
    fireEvent.click(homeRow.querySelector('div')!);
    expect(homeRow.getAttribute('aria-expanded')).toBe('true');
  });

  it('keyboard ArrowRight expands branch', () => {
    const { container } = render(<Sitemap nodes={canonical.nodes as any} defaultExpanded={false} />);
    const row = container.querySelector('[role="treeitem"] > div') as HTMLElement;
    fireEvent.keyDown(row, { key: 'ArrowRight' });
    const homeRow = container.querySelectorAll('[role="treeitem"]')[0];
    expect(homeRow.getAttribute('aria-expanded')).toBe('true');
  });

  it('keyboard Enter toggles branch', () => {
    const { container } = render(<Sitemap nodes={canonical.nodes as any} defaultExpanded={false} />);
    const row = container.querySelector('[role="treeitem"] > div') as HTMLElement;
    fireEvent.keyDown(row, { key: 'Enter' });
    const homeRow = container.querySelectorAll('[role="treeitem"]')[0];
    expect(homeRow.getAttribute('aria-expanded')).toBe('true');
  });

  it('respects density variant', () => {
    const { container } = render(<Sitemap nodes={canonical.nodes as any} density="compact" />);
    expect(container.querySelector('[data-slot="sitemap"]')?.className).toMatch(/text-\[0\.85em\]/);
  });

  it('keyboard ArrowLeft collapses branch', () => {
    const { container } = render(<Sitemap nodes={canonical.nodes as any} defaultExpanded={true} />);
    const row = container.querySelector('[role="treeitem"] > div') as HTMLElement;
    fireEvent.keyDown(row, { key: 'ArrowLeft' });
    const homeRow = container.querySelectorAll('[role="treeitem"]')[0];
    expect(homeRow.getAttribute('aria-expanded')).toBe('false');
  });

  it('keyboard on leaf node is no-op', () => {
    const { container } = render(<Sitemap nodes={[{ path: '/leaf', label: 'Leaf' }]} />);
    const row = container.querySelector('[role="treeitem"] > div') as HTMLElement;
    fireEvent.keyDown(row, { key: 'ArrowRight' });
    const item = container.querySelector('[role="treeitem"]');
    expect(item?.getAttribute('aria-expanded')).toBeNull();
  });

  it('renders leaf nodes without chevron interaction', () => {
    const { container } = render(<Sitemap nodes={[{ path: '/leaf', label: 'Leaf' }]} />);
    const item = container.querySelector('[role="treeitem"]');
    expect(item?.getAttribute('aria-expanded')).toBeNull();
  });
});
