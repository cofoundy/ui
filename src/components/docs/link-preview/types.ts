/**
 * LinkPreview — types
 *
 * Public data contract. The component is data-agnostic: it accepts either
 * a synchronous `getPreview` (cache hit) or an async `fetchPreview`
 * (cache miss → skeleton → resolve). Consumers wire whichever they have.
 */

export interface PreviewData {
  /** Title from frontmatter (`title:` field). Falls back to slug if missing. */
  title: string;
  /** First ~200 chars of body, plaintext. */
  excerpt: string;
  /** Optional meta line — render order is what the consumer provides. */
  meta?: ReadonlyArray<{ label: string; value: string }>;
  /** Optional kind hint — for surface accents (Deliverable, Proposal, Doc). */
  kind?: 'doc' | 'proposal' | 'deliverable' | 'client-portal';
}

/** Result of a preview lookup. */
export type PreviewResult =
  | { state: 'ready'; data: PreviewData }
  | { state: 'loading' }
  | { state: 'error'; reason: 'not-found' | 'forbidden' | 'network' };

/** Synchronous cache reader. Returns `null` on miss; caller will try `fetchPreview`. */
export type GetPreview = (href: string) => PreviewData | null;

/** Async fallback. Called only on cache miss. */
export type FetchPreview = (href: string) => Promise<PreviewData>;

/** Visual variant — selects which surface renderer mounts. */
export type LinkPreviewVariant = 'quiet' | 'card' | 'glass';

export interface LinkPreviewProviderProps {
  children: React.ReactNode;
  /** Sync cache reader (e.g., backed by `window.__docCache`). */
  getPreview?: GetPreview;
  /** Async fallback for cache miss. */
  fetchPreview?: FetchPreview;
  /** Hover delay before showing, ms. Default 180. */
  openDelay?: number;
  /** Grace delay before hiding when cursor leaves trigger, ms. Default 120. */
  closeDelay?: number;
  /** Visual variant. Default 'quiet'. */
  variant?: LinkPreviewVariant;
  /** Disable previews entirely (e.g., on touch devices). Auto-detected if undefined. */
  disabled?: boolean;
  /** CSS selector for opt-in trigger anchors. Default: 'a[data-link-preview]'. */
  selector?: string;
}
