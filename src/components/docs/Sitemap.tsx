import * as React from 'react';
import { useState, useCallback, useId, type KeyboardEvent } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';

export interface SitemapNode {
  /** Canonical path / slug (e.g. `/about`, `/products/inbox-ai`). */
  path: string;
  /** Human-readable label rendered in the tree. */
  label: string;
  /** Tree depth — 0 for root pages. Used for indentation when explicit. */
  depth?: number;
  /** Search/marketing intent (e.g. `informational`, `transactional`). */
  intent?: string;
  /** Nav grouping (e.g. `primary`, `footer`, `legal`). */
  nav_group?: string;
  /** Nested children. */
  children?: SitemapNode[];
}

const sitemapVariants = cva(
  'cf-sitemap font-[var(--font-brand)] text-[0.95em] text-[var(--cf-fg)] my-6 rounded-xl border border-[var(--cf-border)] bg-[var(--cf-card)] p-4',
  {
    variants: {
      density: {
        compact: 'text-[0.85em] p-3',
        comfortable: 'text-[0.95em] p-4',
      },
    },
    defaultVariants: {
      density: 'comfortable',
    },
  },
);

export interface SitemapProps extends VariantProps<typeof sitemapVariants> {
  nodes: SitemapNode[];
  /** Optional className passthrough. */
  className?: string;
  /** Initial open/closed state for branch nodes. */
  defaultExpanded?: boolean;
}

interface TreeItemProps {
  node: SitemapNode;
  level: number;
  defaultExpanded: boolean;
}

function TreeItem({ node, level, defaultExpanded }: TreeItemProps) {
  const hasChildren = !!node.children && node.children.length > 0;
  const [open, setOpen] = useState(defaultExpanded);
  const toggle = useCallback(() => setOpen((v) => !v), []);
  const onKey = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (!hasChildren) return;
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        setOpen(true);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setOpen(false);
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggle();
      }
    },
    [hasChildren, toggle],
  );

  return (
    <li
      role="treeitem"
      aria-expanded={hasChildren ? open : undefined}
      aria-level={level + 1}
      className="cf-sitemap__item list-none"
    >
      <div
        tabIndex={0}
        onClick={hasChildren ? toggle : undefined}
        onKeyDown={onKey}
        className={cn(
          'cf-sitemap__row flex items-center gap-2 rounded-md px-2 py-1.5',
          'outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[var(--cf-primary)]',
          hasChildren && 'cursor-pointer hover:bg-[rgba(70,160,208,0.08)]',
        )}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
      >
        <span
          aria-hidden
          className={cn(
            'cf-sitemap__chevron inline-block w-3 text-center text-[var(--cf-muted)]',
            hasChildren ? '' : 'opacity-0',
          )}
        >
          {hasChildren ? (open ? '▾' : '▸') : '·'}
        </span>
        <span className="cf-sitemap__label font-semibold text-[var(--cf-fg)]">{node.label}</span>
        <code className="cf-sitemap__path font-mono text-[0.78em] text-[var(--cf-muted)]">{node.path}</code>
        {node.intent && (
          <span
            data-slot="sitemap-intent"
            className="cf-sitemap__intent rounded-full bg-[rgba(70,160,208,0.12)] px-2 py-0.5 text-[0.7em] font-semibold uppercase tracking-wider text-[var(--cf-primary)]"
          >
            {node.intent}
          </span>
        )}
        {node.nav_group && (
          <span
            data-slot="sitemap-nav-group"
            className="cf-sitemap__nav-group rounded-full border border-[var(--cf-border)] px-2 py-0.5 text-[0.7em] uppercase tracking-wider text-[var(--cf-muted)]"
          >
            {node.nav_group}
          </span>
        )}
      </div>
      {hasChildren && open && (
        <ul role="group" className="cf-sitemap__children list-none p-0 m-0">
          {node.children!.map((child, i) => (
            <TreeItem key={`${child.path}-${i}`} node={child} level={level + 1} defaultExpanded={defaultExpanded} />
          ))}
        </ul>
      )}
    </li>
  );
}

export function Sitemap({ nodes, density, className, defaultExpanded = true }: SitemapProps) {
  const id = useId();
  return (
    <nav
      data-slot="sitemap"
      aria-labelledby={`${id}-label`}
      className={cn(sitemapVariants({ density }), className)}
    >
      <span id={`${id}-label`} className="sr-only">
        Sitemap
      </span>
      <ul role="tree" className="list-none p-0 m-0">
        {nodes.map((n, i) => (
          <TreeItem key={`${n.path}-${i}`} node={n} level={0} defaultExpanded={defaultExpanded} />
        ))}
      </ul>
    </nav>
  );
}

export { sitemapVariants };
