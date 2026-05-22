'use client';
/**
 * CommandPalette — generalized vault/search palette.
 *
 * Extracted from docs-ai-vault-search (2026-05-20). The consumer supplies:
 *   - searchFn(query, signal) → Promise<SearchResponse>
 *   - onNavigate?(url, hit)   — defaults to window.location assignment
 *   - recents / recentSearches / emptyActions  — optional data slots
 *
 * No router lock-in, no `/api/search` baked in. Visual treatment, a11y, and
 * variants (`mobileVariant`) are preserved from the source.
 */

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react';
import { createPortal } from 'react-dom';

// ─── Public types ─────────────────────────────────────────────────────────────

/** Doc role taxonomy. Consumers may pass any string; common values are listed. */
export type DocRole = 'team' | 'client' | 'public' | (string & {});

export interface SearchHit {
  project: string;
  slug: string;
  title: string;
  /**
   * Doc role taxonomy (team/client/public/custom). Optional — rendered as a
   * small badge next to the title when present. Consumers can omit when their
   * vault has no role concept.
   */
  role?: DocRole;
  /** FTS5 snippet() output — HTML-escaped except for `<mark>` wrapper. */
  snippet: string;
  /** BM25 rank — lower is better. */
  score: number;
  /** Canonical doc URL — SSOT for navigation. */
  url: string;
}

export interface SearchResponse {
  query: string;
  hits: SearchHit[];
  total: number;
  took_ms?: number;
}

export type SearchFn = (query: string, signal: AbortSignal) => Promise<SearchResponse>;

export interface RecentDoc {
  title: string;
  path: string;
  /** Human label, e.g. "2d ago". */
  date: string;
  /** Optional URL for click-through. */
  url?: string;
}

export interface RecentSearch {
  q: string;
  ago: string;
}

export interface EmptyAction {
  label: string;
  /**
   * Single-key hint shown as a kbd chip, e.g. "1", "I". Decorative only —
   * the library does not bind global single-character keys from the search
   * input (would conflict with typing). Consumers needing keyboard activation
   * should attach their own listener at the document level.
   */
  kbd?: string;
  /** Click/Enter handler. The chip is rendered as a button when supplied. */
  onSelect?: () => void;
}

export interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Required fetcher — consumer wires search backend. */
  searchFn?: SearchFn;
  /**
   * Navigation handler. Receives the destination URL + the hit. If omitted,
   * the palette falls back to `window.location.href = url`.
   */
  onNavigate?: (url: string, hit: SearchHit) => void;
  /** Scope label rendered in the footer pill (e.g. 'team', 'client'). */
  scope?: DocRole;
  /** Project slug rendered in the footer pill. */
  project?: string;
  /** Mobile variant — bottom-sheet for <768px, modal otherwise. Default 'auto'. */
  mobileVariant?: 'auto' | 'modal' | 'sheet';
  /** Debounce in ms before firing searchFn. Default 200. */
  debounceMs?: number;
  /**
   * Minimum query length before the palette fires `searchFn`. Sub-min queries
   * render the idle state instead of firing the backend or showing a stale
   * "no matches" empty state. Default 2.
   */
  minQueryLength?: number;
  /** Input placeholder. Default 'Search docs, briefs, notes…'. */
  placeholder?: string;
  /** Idle-state recent docs list. Empty by default. */
  recents?: RecentDoc[];
  /** No-results recent searches list. Empty by default. */
  recentSearches?: RecentSearch[];
  /** No-results action chips. Empty by default. */
  emptyActions?: EmptyAction[];
  /**
   * Pass `true` to render `hit.snippet` as raw HTML via `dangerouslySetInnerHTML`.
   * Default `false`: the palette runs the snippet through an allow-only-`<mark>`
   * sanitizer that strips every other tag. Only opt in when your backend is
   * trusted (e.g. you control the search index and emit FTS5 snippets directly).
   */
  trustSnippetHtml?: boolean;
  /**
   * Fires after each successful fetch. Lets consumers wire analytics without
   * wrapping `searchFn`. Not called for sub-min queries (those skip the fetch
   * entirely) or aborted requests.
   */
  onSearch?: (query: string, hits: SearchHit[], took_ms?: number) => void;
  /**
   * Fires before `onNavigate` when the user selects a hit. `source` indicates
   * how the selection happened — useful for distinguishing keyboard-only users
   * from mouse-only users in analytics.
   */
  onSelect?: (hit: SearchHit, idx: number, source: 'click' | 'enter') => void;
}

export interface CommandPaletteTriggerProps {
  onClick: () => void;
  compact?: boolean;
  'aria-label'?: string;
}

// ─── Trigger pill ─────────────────────────────────────────────────────────────

export function CommandPaletteTrigger({
  onClick,
  compact = false,
  'aria-label': ariaLabel = 'Open search',
}: CommandPaletteTriggerProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      data-slot="command-palette-trigger"
      className="cp-trigger"
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
        focusable="false"
      >
        <circle cx="11" cy="11" r="7" />
        <path d="m21 21-4.3-4.3" />
      </svg>
      {!compact && <span className="cp-trigger-label">Search docs…</span>}
      <kbd className="cp-trigger-kbd" aria-hidden>
        <span className="cp-kbd-meta">⌘</span>K
      </kbd>
    </button>
  );
}

// ─── Hotkeys hook ─────────────────────────────────────────────────────────────

/**
 * Bind the canonical command-palette hotkeys (`Cmd+K` / `Ctrl+K`, `/`, `Esc`)
 * to a controlled `open` state. Consumers wire it once next to their palette
 * mount so the global keys work even when the modal is closed.
 *
 * Behaviour matches docs-ai-vault-search architecture §5.2:
 *   - `Cmd+K` / `Ctrl+K` opens; suppressed only inside contenteditable.
 *   - `/` opens, but only when no INPUT/TEXTAREA/contenteditable is focused
 *     (so native typeahead inside form fields keeps working).
 *   - `Esc` closes when open.
 */
export function useCommandPaletteHotkeys({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
}): void {
  useEffect(() => {
    function onKey(e: KeyboardEvent): void {
      if (e.key === 'Escape') {
        if (open) {
          e.preventDefault();
          setOpen(false);
        }
        return;
      }
      const target = (e.target ?? null) as HTMLElement | null;
      const tag = target?.tagName;
      const inInputOrTextarea = tag === 'INPUT' || tag === 'TEXTAREA';
      const inContentEditable = target?.isContentEditable === true;
      if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
        if (inContentEditable) return;
        e.preventDefault();
        setOpen(true);
        return;
      }
      if (e.key === '/' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        if (inInputOrTextarea || inContentEditable) return;
        if (open) return;
        e.preventDefault();
        setOpen(true);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, setOpen]);
}

// ─── Module-scope CSS injection + scroll-lock refcount ────────────────────────

/**
 * The component used to inject its CSS via `<style dangerouslySetInnerHTML>`
 * inside the portal — every Cmd+K re-parsed the rules, two parallel instances
 * duplicated them. Now we append a singleton `<style id="cp-styles">` to
 * `<head>` on first mount and reuse it forever.
 */
let stylesInjected = false;
function ensureCommandPaletteStyles() {
  if (stylesInjected || typeof document === 'undefined') return;
  if (document.getElementById('cp-styles')) {
    stylesInjected = true;
    return;
  }
  const el = document.createElement('style');
  el.id = 'cp-styles';
  el.textContent = COMMAND_PALETTE_CSS;
  document.head.appendChild(el);
  stylesInjected = true;
}
// NOTE: the eager-inject call lives at the bottom of this file, after
// COMMAND_PALETTE_CSS is initialized. Calling it here would hit a TDZ since
// the const-style template literal isn't bound yet at module-evaluation top.

/**
 * Body scroll-lock counter. Composes safely with sibling modals — the lock
 * is applied only on the 0→1 transition and released only on 1→0, so closing
 * one modal while another is still open doesn't restore body scroll prematurely.
 */
let scrollLockCount = 0;
let prevBodyOverflow = '';
function acquireBodyScrollLock() {
  if (typeof document === 'undefined') return;
  if (scrollLockCount === 0) {
    prevBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
  }
  scrollLockCount += 1;
}
function releaseBodyScrollLock() {
  if (typeof document === 'undefined') return;
  scrollLockCount = Math.max(0, scrollLockCount - 1);
  if (scrollLockCount === 0) {
    document.body.style.overflow = prevBodyOverflow;
  }
}

// ─── Main palette ─────────────────────────────────────────────────────────────

const DEFAULT_DEBOUNCE = 200;

/**
 * `true` when `url` resolves to a different origin than the current page.
 * Returns `false` in SSR (no `window`) so server-rendered markup is stable.
 * Relative URLs and malformed inputs are treated as same-origin (safe default).
 */
function isExternalUrl(url: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return new URL(url, window.location.origin).origin !== window.location.origin;
  } catch {
    return false;
  }
}

/**
 * Sanitize an FTS5 snippet so only `<mark>` survives. Drops any other tags
 * (incl. attributes) and leaves text content as-is. The backend is expected
 * to have HTML-escaped &/</> already; this is a defense-in-depth pass for
 * library consumers wiring untrusted backends. Opt out via `trustSnippetHtml`.
 */
function sanitizeSnippetHtml(snippet: string): string {
  // Strip every tag except `<mark>` / `</mark>` (case-insensitive, no attrs).
  return snippet.replace(/<(?!\/?mark>)[^>]*>/gi, '');
}

export function CommandPalette({
  open,
  onOpenChange,
  searchFn,
  onNavigate,
  scope,
  project,
  mobileVariant = 'auto',
  debounceMs = DEFAULT_DEBOUNCE,
  minQueryLength = 2,
  placeholder = 'Search docs, briefs, notes…',
  recents = [],
  recentSearches = [],
  emptyActions = [],
  trustSnippetHtml = false,
  onSearch,
  onSelect,
}: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchHit[]>([]);
  const [loading, setLoading] = useState(false);
  const [errored, setErrored] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  // `stale` covers the window between a query change and the next fetch
  // resolving — the previous results are still on screen but no longer
  // reflect the input. PaletteSurface dims them via [data-stale].
  const [stale, setStale] = useState(false);
  // Bump to force the search effect to re-fire for the same query (retry on
  // error). `setQuery(query)` is a no-op because React bails on equal state.
  const [retryNonce, setRetryNonce] = useState(0);

  // Dev-only warning if the palette is mounted without a fetcher. Silent
  // breakage is worse than a console line that points at the missing prop.
  useEffect(() => {
    if (open && !searchFn && process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.warn(
        '[@cofoundy/ui] <CommandPalette> opened without a `searchFn` prop — ' +
          'typing will not surface any results. Pass `searchFn` to wire a backend.',
      );
    }
  }, [open, searchFn]);

  // Debounced fetch
  useEffect(() => {
    if (!open || !searchFn) return;
    const trimmed = query.trim();

    // Below the min-query threshold: clear results, surface the idle state,
    // do not fire the backend (saves bandwidth + avoids "no matches for a").
    if (trimmed.length < minQueryLength) {
      setResults([]);
      setErrored(false);
      setLoading(false);
      setStale(false);
      return;
    }

    setStale(true);
    const controller = new AbortController();
    const t = setTimeout(async () => {
      setLoading(true);
      setErrored(false);
      try {
        const response = await searchFn(trimmed, controller.signal);
        if (controller.signal.aborted) return;
        const hits = Array.isArray(response?.hits) ? response.hits : [];
        setResults(hits);
        setSelectedIndex(0);
        setStale(false);
        onSearch?.(trimmed, hits, response?.took_ms);
      } catch {
        if (!controller.signal.aborted) {
          setErrored(true);
          setResults([]);
          setStale(false);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, debounceMs);
    return () => {
      clearTimeout(t);
      controller.abort();
    };
  }, [query, open, searchFn, debounceMs, minQueryLength, retryNonce, onSearch]);

  // Reset transient state when the palette closes. Matches the docs-ai
  // useCommandPalette hook teardown (use-command-palette.ts §setOpen) so
  // reopening starts clean instead of showing stale query + results.
  useEffect(() => {
    if (!open) {
      setQuery('');
      setResults([]);
      setLoading(false);
      setErrored(false);
      setSelectedIndex(0);
      setStale(false);
    }
  }, [open]);

  const handleNavigate = useCallback(
    (hit: SearchHit) => {
      // External URLs always escape to a new tab regardless of onNavigate —
      // a consumer's router can't safely handle cross-origin nav anyway.
      if (isExternalUrl(hit.url) && typeof window !== 'undefined') {
        window.open(hit.url, '_blank', 'noopener,noreferrer');
        return;
      }
      if (onNavigate) {
        onNavigate(hit.url, hit);
      } else if (typeof window !== 'undefined') {
        window.location.href = hit.url;
      }
    },
    [onNavigate],
  );

  return (
    <PaletteSurface
      open={open}
      query={query}
      setQuery={setQuery}
      results={results}
      loading={loading}
      errored={errored}
      stale={stale}
      minQueryLength={minQueryLength}
      onRetry={() => setRetryNonce((n) => n + 1)}
      selectedIndex={selectedIndex}
      setSelectedIndex={setSelectedIndex}
      onClose={() => onOpenChange(false)}
      onNavigate={handleNavigate}
      onSelect={onSelect}
      scope={scope}
      project={project}
      mobileVariant={mobileVariant}
      placeholder={placeholder}
      recents={recents}
      recentSearches={recentSearches}
      emptyActions={emptyActions}
      trustSnippetHtml={trustSnippetHtml}
    />
  );
}

// ─── Presentational surface ───────────────────────────────────────────────────

interface PaletteSurfaceProps {
  open: boolean;
  query: string;
  setQuery: (q: string) => void;
  results: SearchHit[];
  loading: boolean;
  errored: boolean;
  stale: boolean;
  minQueryLength: number;
  onRetry: () => void;
  selectedIndex: number;
  setSelectedIndex: (n: number) => void;
  onClose: () => void;
  onNavigate: (hit: SearchHit) => void;
  scope?: DocRole;
  project?: string;
  mobileVariant: 'auto' | 'modal' | 'sheet';
  placeholder: string;
  recents: RecentDoc[];
  recentSearches: RecentSearch[];
  emptyActions: EmptyAction[];
  trustSnippetHtml: boolean;
  onSelect?: (hit: SearchHit, idx: number, source: 'click' | 'enter') => void;
}

function PaletteSurface({
  open,
  query,
  setQuery,
  results,
  loading,
  errored,
  stale,
  minQueryLength,
  onRetry,
  selectedIndex,
  setSelectedIndex,
  onClose,
  onNavigate,
  scope,
  project,
  mobileVariant,
  placeholder,
  recents,
  recentSearches,
  emptyActions,
  trustSnippetHtml,
  onSelect,
}: PaletteSurfaceProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const surfaceRef = useRef<HTMLDivElement>(null);
  const lastFocusRef = useRef<HTMLElement | null>(null);
  const reactId = useId();
  const listboxId = `cp-listbox-${reactId}`;

  // Portal mount guard — overlay must render into document.body so backdrop-filter
  // ancestors don't pin position:fixed children to a stale containing block.
  // Also inject the singleton stylesheet on first mount (T23).
  const [portalReady, setPortalReady] = useState(false);
  useEffect(() => {
    ensureCommandPaletteStyles();
    setPortalReady(true);
  }, []);

  // Focus management + body scroll lock
  useEffect(() => {
    if (open) {
      lastFocusRef.current = document.activeElement as HTMLElement | null;
      const t = setTimeout(() => inputRef.current?.focus(), 0);
      return () => clearTimeout(t);
    } else {
      // Only restore focus if the prior element is still in the document —
      // route changes / sidebar collapses can unmount the trigger while the
      // palette is open, and `.focus()` on a detached node is a silent no-op
      // (or throws on legacy WebKit).
      const last = lastFocusRef.current;
      if (last && last.isConnected) last.focus();
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    acquireBodyScrollLock();
    return () => {
      releaseBodyScrollLock();
    };
  }, [open]);

  // Focus trap — keep Tab cycling inside the dialog. role="dialog"
  // aria-modal="true" promises modality; the markup has to enforce it.
  useEffect(() => {
    if (!open) return;
    function onTab(e: KeyboardEvent) {
      if (e.key !== 'Tab') return;
      const root = surfaceRef.current;
      if (!root) return;
      const focusable = root.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement as HTMLElement | null;
      if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    }
    document.addEventListener('keydown', onTab);
    return () => document.removeEventListener('keydown', onTab);
  }, [open]);

  const onInputKey = useCallback(
    (e: ReactKeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(Math.min(selectedIndex + 1, Math.max(0, results.length - 1)));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(Math.max(0, selectedIndex - 1));
      } else if (e.key === 'Enter') {
        const hit = results[selectedIndex];
        if (hit) {
          e.preventDefault();
          onSelect?.(hit, selectedIndex, 'enter');
          // Cmd/Ctrl + Enter → open in a new tab without leaving the palette.
          if ((e.metaKey || e.ctrlKey) && typeof window !== 'undefined') {
            window.open(hit.url, '_blank', 'noopener,noreferrer');
            return;
          }
          onNavigate(hit);
        }
      } else if (e.key === 'Home') {
        e.preventDefault();
        setSelectedIndex(0);
      } else if (e.key === 'End') {
        e.preventDefault();
        setSelectedIndex(Math.max(0, results.length - 1));
      }
    },
    [results, selectedIndex, setSelectedIndex, onClose, onNavigate, onSelect],
  );

  useEffect(() => {
    const node = listRef.current?.querySelector<HTMLElement>(
      `[data-cp-index="${selectedIndex}"]`,
    );
    node?.scrollIntoView?.({ block: 'nearest' });
  }, [selectedIndex]);

  if (!open) return null;
  if (!portalReady) return null;

  const isSheet = mobileVariant === 'sheet';
  const trimmedLength = query.trim().length;
  // showEmpty fires only when we actually ran a search (query >= min) and it
  // returned no hits. Below-min queries fall into showInitial so the user
  // doesn't see a misleading "No matches for `a`" before the search runs.
  const showEmpty =
    !loading && !errored && results.length === 0 && trimmedLength >= minQueryLength;
  const showInitial =
    !loading && !errored && results.length === 0 && trimmedLength < minQueryLength;

  return createPortal(
    <div
      className={`cp-overlay ${isSheet ? 'cp-overlay-sheet' : ''} ${
        mobileVariant === 'auto' ? 'cp-overlay-auto' : ''
      }`}
      onClick={onClose}
      data-mobile-variant={mobileVariant}
    >
      <div
        ref={surfaceRef}
        role="dialog"
        aria-modal="true"
        aria-label="Search documentation"
        className="cp-surface"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="cp-input-row">
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden
            focusable="false"
            className="cp-input-icon"
          >
            <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
            <path
              d="m11 11 3 3"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onInputKey}
            placeholder={placeholder}
            aria-label="Search query"
            // aria-controls only references the listbox when it's mounted.
            // Pointing at a non-existent element confuses screen readers.
            aria-controls={results.length > 0 ? listboxId : undefined}
            aria-activedescendant={
              results[selectedIndex] ? `cp-opt-${reactId}-${selectedIndex}` : undefined
            }
            aria-autocomplete="list"
            className="cp-input"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
          />
          {query.length > 0 && (
            <button
              type="button"
              className="cp-input-clear"
              aria-label="Clear search"
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
                focusable="false"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
          )}
        </div>

        <div className="cp-results-wrap" data-stale={stale ? '' : undefined}>
          {loading && <SkeletonRows />}
          {errored && <ErrorState onRetry={onRetry} />}
          {showInitial && <InitialState recents={recents} />}
          {showEmpty && (
            <EmptyState
              query={query}
              emptyActions={emptyActions}
              recentSearches={recentSearches}
            />
          )}
          {!loading && !errored && results.length > 0 && (
            <>
              <div className="cp-results-meta" aria-hidden>
                <span className="cp-results-meta-label">Results</span>
                <span className="cp-results-meta-count">
                  · {results.length} {results.length === 1 ? 'match' : 'matches'}
                </span>
              </div>
              <ul
                ref={listRef}
                id={listboxId}
                role="listbox"
                aria-label="Search results"
                className="cp-results"
              >
                {results.map((hit, i) => {
                  const selected = i === selectedIndex;
                  const external = isExternalUrl(hit.url);
                  const breadcrumb = hit.url
                    .replace(/^\/+/, '')
                    .replace(/\/[^/]+$/, '')
                    .replace(/\//g, ' / ');
                  return (
                    <li key={`${hit.project}/${hit.slug}`} role="presentation">
                      <a
                        id={`cp-opt-${reactId}-${i}`}
                        href={hit.url}
                        target={external ? '_blank' : undefined}
                        rel={external ? 'noopener noreferrer' : undefined}
                        role="option"
                        aria-selected={selected}
                        data-cp-index={i}
                        data-selected={selected ? '' : undefined}
                        className="cp-result"
                        onClick={(e) => {
                          // Let Cmd/Ctrl-click open in a new tab (browser default).
                          if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
                            onSelect?.(hit, i, 'click');
                            return;
                          }
                          e.preventDefault();
                          onSelect?.(hit, i, 'click');
                          onNavigate(hit);
                          onClose();
                        }}
                      >
                        <svg
                          className="cp-result-icon"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden
                          focusable="false"
                        >
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <path d="M14 2v6h6" />
                        </svg>
                        <div className="cp-result-main">
                          <div className="cp-result-title">
                            <span className="cp-result-title-text">{hit.title}</span>
                            {hit.role && (
                              <span className="cp-result-role" data-role={hit.role}>
                                {hit.role}
                              </span>
                            )}
                          </div>
                          <div className="cp-result-path">{breadcrumb}</div>
                          {hit.snippet && (
                            <div
                              className="cp-result-snippet"
                              dangerouslySetInnerHTML={{
                                __html: trustSnippetHtml
                                  ? hit.snippet
                                  : sanitizeSnippetHtml(hit.snippet),
                              }}
                            />
                          )}
                        </div>
                        <div className="cp-result-aside">
                          {selected && (
                            <kbd className="cp-kbd cp-kbd-enter" aria-hidden>
                              ↵
                            </kbd>
                          )}
                        </div>
                      </a>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </div>

        <div className="cp-footer">
          <span className="cp-footer-hint">
            <kbd className="cp-kbd">↑</kbd>
            <kbd className="cp-kbd">↓</kbd>
            <span className="cp-footer-hint-label">navigate</span>
          </span>
          <span className="cp-footer-hint">
            <kbd className="cp-kbd">↵</kbd>
            <span className="cp-footer-hint-label">open</span>
          </span>
          <span className="cp-footer-hint">
            <kbd className="cp-kbd">esc</kbd>
            <span className="cp-footer-hint-label">close</span>
          </span>
          {(scope || project) && (
            <span className="cp-footer-scope" data-scope={scope}>
              <span className="cp-scope-dot" aria-hidden />
              <span>Scoped to</span>
              <span className="cp-scope-label">
                {project ? `${scope ?? ''}${scope ? '/' : ''}${project}` : scope}
              </span>
              {results.length > 0 && (
                <span className="cp-scope-count" aria-hidden>
                  {results.length}
                </span>
              )}
            </span>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}

// ─── State components ─────────────────────────────────────────────────────────

function SkeletonRows() {
  return (
    <ul className="cp-results cp-skeleton-list" aria-busy="true" aria-label="Loading results">
      {[0, 1, 2].map((i) => (
        <li key={i} className="cp-skeleton">
          <div className="cp-skeleton-title" />
          <div className="cp-skeleton-path" />
          <div className="cp-skeleton-snippet" />
        </li>
      ))}
    </ul>
  );
}

function InitialState({ recents }: { recents: RecentDoc[] }) {
  if (recents.length === 0) {
    return (
      <div className="cp-state cp-state-initial">
        <div className="cp-state-title">Start typing to search the vault</div>
        <div className="cp-state-body">
          Results stream as you type. Press <kbd className="cp-kbd">esc</kbd> to close.
        </div>
      </div>
    );
  }
  return (
    <>
      <div className="cp-results-meta" aria-hidden>
        <span className="cp-results-meta-label">Recent</span>
        <span className="cp-results-meta-count">· {recents.length} indexed</span>
      </div>
      <ul className="cp-recent-list" aria-label="Recent docs">
        {recents.map((row, i) => (
          <li key={`${row.path}-${i}`}>
            <a
              href={row.url ?? '#'}
              className="cp-result cp-result-recent"
              onClick={(e) => {
                if (!row.url) e.preventDefault();
              }}
            >
              <svg
                className="cp-result-icon"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
                focusable="false"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <path d="M14 2v6h6" />
              </svg>
              <div className="cp-result-main">
                <div className="cp-result-title">{row.title}</div>
                <div className="cp-result-path">{row.path}</div>
              </div>
              <div className="cp-result-aside cp-recent-date">{row.date}</div>
            </a>
          </li>
        ))}
      </ul>
    </>
  );
}

function EmptyState({
  query,
  emptyActions,
  recentSearches,
}: {
  query: string;
  emptyActions: EmptyAction[];
  recentSearches: RecentSearch[];
}) {
  return (
    <div className="cp-empty">
      <div className="cp-empty-line1">
        No matches for <span className="cp-empty-q">{query}</span> in this vault.
      </div>
      <div className="cp-empty-hint">
        Try a shorter query, switch scopes, or jump to the index.
      </div>
      {emptyActions.length > 0 && (
        <div className="cp-empty-chips">
          {emptyActions.map((a) =>
            a.onSelect ? (
              <button
                type="button"
                key={a.label}
                className="cp-empty-chip cp-empty-chip-button"
                onClick={a.onSelect}
              >
                {a.label}
                {a.kbd && <span className="cp-chip-kbd">{a.kbd}</span>}
              </button>
            ) : (
              <span key={a.label} className="cp-empty-chip">
                {a.label}
                {a.kbd && <span className="cp-chip-kbd">{a.kbd}</span>}
              </span>
            ),
          )}
        </div>
      )}
      {recentSearches.length > 0 && (
        <div className="cp-empty-recent">
          <div className="cp-empty-recent-label">Recent searches</div>
          {recentSearches.map((row) => (
            <div key={row.q} className="cp-empty-recent-row">
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
                focusable="false"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <span className="cp-empty-recent-q">{row.q}</span>
              <span className="cp-empty-recent-ago">{row.ago}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="cp-state">
      <div className="cp-state-title">Search is unavailable right now</div>
      <div className="cp-state-body">
        The vault index didn&rsquo;t respond.{' '}
        <button type="button" onClick={onRetry} className="cp-state-retry">
          Retry
        </button>
      </div>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
// Source preserved from docs-ai-vault-search verbatim. `:global(...)` wrappers
// dropped (now plain global CSS, all class names are `cp-*` prefixed).
//
// CSS variables consumed: --cf-primary, --cf-bg, --cf-fg, --cf-muted, --cf-card,
// --font-sans, --font-mono. When @cofoundy/ui's brand-tokens stylesheet is
// loaded, these resolve from :root. The :where(...) defaults below provide a
// safe-but-bland baseline for consumers using this component in isolation —
// zero specificity, so any consumer-defined value overrides cleanly.

const COMMAND_PALETTE_CSS = `
:where(.cp-overlay, .cp-trigger) {
  --cf-primary: #14b8a6;
  --cf-bg: #0a0e1a;
  --cf-fg: #e2e8f0;
  --cf-muted: #94a3b8;
  --cf-card: #1e293b;
  --font-sans: ui-sans-serif, system-ui, -apple-system, sans-serif;
  --font-mono: ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace;
}

.cp-result-snippet mark,
.cp-result-title mark {
  background: color-mix(in srgb, var(--cf-primary) 22%, transparent);
  color: color-mix(in srgb, var(--cf-primary) 35%, var(--cf-fg));
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--cf-primary) 30%, transparent);
  padding: 1px 5px 0;
  border-radius: 3px;
  font-weight: 600;
  line-height: inherit;
  vertical-align: baseline;
  box-decoration-break: clone;
  -webkit-box-decoration-break: clone;
}
[data-theme="light"] .cp-result-snippet mark,
[data-theme="light"] .cp-result-title mark {
  background: color-mix(in srgb, var(--cf-primary) 14%, transparent);
  color: color-mix(in srgb, var(--cf-primary) 70%, #0c1729);
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--cf-primary) 28%, transparent);
}

.cp-overlay {
  position: fixed;
  inset: 0;
  z-index: 200;
  background:
    radial-gradient(ellipse at center,
      color-mix(in srgb, var(--cf-bg) 78%, #000) 0%,
      color-mix(in srgb, var(--cf-bg) 92%, #000) 80%);
  backdrop-filter: blur(28px) saturate(140%);
  -webkit-backdrop-filter: blur(28px) saturate(140%);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 14vh;
  padding-inline: 1rem;
  animation: cp-overlay-in 140ms ease-out;
}
[data-theme="light"] .cp-overlay {
  background:
    radial-gradient(ellipse at center,
      rgba(15, 23, 42, 0.45) 0%,
      rgba(15, 23, 42, 0.62) 80%);
}
@keyframes cp-overlay-in { from { opacity: 0; } to { opacity: 1; } }

.cp-surface {
  width: min(40rem, 100%);
  background:
    linear-gradient(180deg,
      color-mix(in srgb, var(--cf-bg) 90%, white) 0%,
      var(--cf-bg) 100%);
  border: 1px solid rgba(255, 255, 255, 0.10);
  border-radius: 14px;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.08),
    inset 0 -1px 0 rgba(0, 0, 0, 0.4),
    0 0 0 1px rgba(0, 0, 0, 0.55),
    0 4px 8px rgba(0, 0, 0, 0.25),
    0 12px 24px rgba(0, 0, 0, 0.35),
    0 32px 64px -8px rgba(0, 0, 0, 0.55),
    0 64px 120px -24px rgba(0, 0, 0, 0.6);
  overflow: hidden;
  font-family: var(--font-sans);
  animation: cp-surface-in 180ms cubic-bezier(0.16, 1, 0.3, 1);
  display: flex;
  flex-direction: column;
  max-height: 72vh;
}
[data-theme="light"] .cp-surface {
  background:
    linear-gradient(180deg,
      #ffffff 0%,
      color-mix(in srgb, var(--cf-bg) 96%, #000) 100%);
  border-color: rgba(15, 23, 42, 0.08);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.6),
    0 0 0 1px rgba(15, 23, 42, 0.05),
    0 4px 8px rgba(15, 23, 42, 0.06),
    0 12px 24px rgba(15, 23, 42, 0.10),
    0 32px 64px -8px rgba(15, 23, 42, 0.18),
    0 64px 120px -24px rgba(15, 23, 42, 0.22);
}
@keyframes cp-surface-in {
  from { opacity: 0; transform: translateY(-6px); }
  to   { opacity: 1; transform: translateY(0); }
}

@media (max-width: 767px) {
  .cp-overlay-sheet, .cp-overlay-auto {
    align-items: flex-end;
    padding-top: 0;
    padding-inline: 0;
  }
  .cp-overlay-sheet .cp-surface, .cp-overlay-auto .cp-surface {
    width: 100%;
    max-height: 88vh;
    border-radius: 16px 16px 0 0;
    border-bottom: 0;
    animation: cp-sheet-in 220ms cubic-bezier(0.16, 1, 0.3, 1);
  }
}
@keyframes cp-sheet-in {
  from { transform: translateY(100%); }
  to   { transform: translateY(0); }
}

.cp-input-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 18px;
  height: 56px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
  flex-shrink: 0;
}
[data-theme="light"] .cp-input-row {
  border-bottom-color: rgba(15, 23, 42, 0.08);
}
.cp-input-icon {
  color: var(--cf-muted);
  flex-shrink: 0;
  width: 16px;
  height: 16px;
}
.cp-input {
  flex: 1;
  min-width: 0;
  background: transparent;
  border: 0;
  outline: none;
  color: var(--cf-fg);
  font-size: 16px;
  line-height: 1;
  font-family: var(--font-sans);
  font-weight: 500;
  letter-spacing: -0.01em;
  caret-color: var(--cf-primary);
  padding: 0;
}
.cp-input::placeholder {
  color: color-mix(in srgb, var(--cf-muted) 70%, transparent);
  opacity: 1;
  font-weight: 400;
}
.cp-input-clear {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  flex-shrink: 0;
  border: 0;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.04);
  color: var(--cf-muted);
  cursor: pointer;
  padding: 0;
  transition: background 100ms ease, color 100ms ease;
}
.cp-input-clear:hover {
  background: rgba(255, 255, 255, 0.10);
  color: var(--cf-fg);
}
.cp-input-clear:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--cf-primary) 60%, transparent);
  outline-offset: 1px;
}
[data-theme="light"] .cp-input-clear {
  background: rgba(15, 23, 42, 0.04);
}
[data-theme="light"] .cp-input-clear:hover {
  background: rgba(15, 23, 42, 0.10);
}

.cp-results-wrap {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  min-height: 0;
  scrollbar-width: thin;
  transition: opacity 80ms ease-out;
}
/* Previous results are still on screen but no longer reflect the input —
   dim them while the debounce timer waits to fire the next fetch. */
.cp-results-wrap[data-stale] { opacity: 0.55; }
.cp-results-meta {
  padding: 14px 20px 8px;
  display: flex;
  align-items: baseline;
  gap: 10px;
  font-family: var(--font-sans);
  font-weight: 600;
  font-size: 10.5px;
  line-height: 1;
  color: color-mix(in srgb, var(--cf-muted) 75%, transparent);
  text-transform: uppercase;
  letter-spacing: 0.12em;
}
.cp-results-meta-label { color: color-mix(in srgb, var(--cf-muted) 90%, var(--cf-fg)); }
.cp-results-meta-count {
  font-family: var(--font-mono);
  font-weight: 500;
  font-size: 10.5px;
  color: color-mix(in srgb, var(--cf-muted) 65%, transparent);
  letter-spacing: 0;
  text-transform: none;
}
.cp-results {
  list-style: none;
  margin: 0;
  padding: 4px 8px 10px;
}
.cp-result {
  position: relative;
  display: grid;
  grid-template-columns: 26px 1fr auto;
  column-gap: 12px;
  align-items: start;
  padding: 11px 14px;
  color: var(--cf-fg);
  text-decoration: none;
  cursor: pointer;
  border-radius: 8px;
  transition: background 80ms ease-out;
  min-height: 44px;
}
.cp-result:hover { background: rgba(255, 255, 255, 0.025); }
[data-theme="light"] .cp-result:hover { background: rgba(15, 23, 42, 0.03); }
.cp-result[data-selected] {
  background:
    linear-gradient(90deg,
      color-mix(in srgb, var(--cf-primary) 16%, transparent) 0%,
      color-mix(in srgb, var(--cf-primary) 6%, transparent) 60%,
      transparent 100%);
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--cf-primary) 16%, transparent);
}
.cp-result[data-selected]::before {
  content: "";
  position: absolute;
  left: 0;
  top: 10px;
  bottom: 10px;
  width: 3px;
  border-radius: 0 2px 2px 0;
  background:
    linear-gradient(180deg,
      color-mix(in srgb, var(--cf-primary) 75%, white) 0%,
      var(--cf-primary) 100%);
  box-shadow: 0 0 8px color-mix(in srgb, var(--cf-primary) 45%, transparent);
}
.cp-result-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.04);
  color: var(--cf-muted);
  margin-top: 1px;
  flex-shrink: 0;
}
[data-theme="light"] .cp-result-icon {
  background: rgba(15, 23, 42, 0.025);
  border-color: rgba(15, 23, 42, 0.06);
}
.cp-result[data-selected] .cp-result-icon {
  background: color-mix(in srgb, var(--cf-primary) 18%, transparent);
  border-color: color-mix(in srgb, var(--cf-primary) 32%, transparent);
  color: color-mix(in srgb, var(--cf-primary) 30%, var(--cf-fg));
}
.cp-result-icon svg { width: 14px; height: 14px; }
.cp-result-main { min-width: 0; display: flex; flex-direction: column; gap: 3px; }
.cp-result-title {
  font-family: var(--font-sans);
  font-weight: 600;
  font-size: 14px;
  line-height: 1.35;
  letter-spacing: -0.012em;
  color: color-mix(in srgb, var(--cf-fg) 96%, white);
  display: flex;
  align-items: baseline;
  gap: 8px;
  min-width: 0;
}
.cp-result-title-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
}
.cp-result-role {
  display: inline-flex;
  align-items: center;
  height: 16px;
  padding: 0 6px;
  border-radius: 3px;
  font-family: var(--font-mono);
  font-weight: 500;
  font-size: 9.5px;
  line-height: 1;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--cf-muted) 25%, var(--cf-fg));
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  flex-shrink: 0;
}
[data-theme="light"] .cp-result-role {
  background: rgba(15, 23, 42, 0.04);
  border-color: rgba(15, 23, 42, 0.10);
}
.cp-result-role[data-role="team"] {
  color: color-mix(in srgb, var(--cf-primary) 35%, var(--cf-fg));
  background: color-mix(in srgb, var(--cf-primary) 10%, transparent);
  border-color: color-mix(in srgb, var(--cf-primary) 22%, transparent);
}
.cp-result[data-selected] .cp-result-title { color: #ffffff; }
[data-theme="light"] .cp-result[data-selected] .cp-result-title { color: var(--cf-fg); }
.cp-result-path {
  font-family: var(--font-mono);
  font-weight: 400;
  font-size: 11px;
  line-height: 1.3;
  color: color-mix(in srgb, var(--cf-muted) 50%, transparent);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  letter-spacing: 0;
}
.cp-result-snippet {
  font-family: var(--font-sans);
  font-weight: 400;
  font-size: 12.5px;
  line-height: 1.45;
  color: color-mix(in srgb, var(--cf-fg) 68%, transparent);
  margin-top: 3px;
  /* 2-line clamp keeps the FTS5 <mark> visible even when it lands mid-snippet. */
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: break-word;
}
.cp-result[data-selected] .cp-result-snippet {
  color: color-mix(in srgb, var(--cf-fg) 88%, white);
}
[data-theme="light"] .cp-result[data-selected] .cp-result-snippet {
  color: color-mix(in srgb, var(--cf-fg) 90%, transparent);
}
.cp-result-aside {
  color: var(--cf-muted);
  align-self: center;
}

.cp-kbd {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-mono);
  font-weight: 600;
  font-size: 10.5px;
  line-height: 1;
  border: 1px solid rgba(255, 255, 255, 0.10);
  border-radius: 4px;
  padding: 0 5px;
  color: var(--cf-fg);
  background:
    linear-gradient(180deg,
      rgba(255, 255, 255, 0.07) 0%,
      rgba(255, 255, 255, 0.035) 100%);
  min-width: 20px;
  height: 20px;
  letter-spacing: 0;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.06),
    0 1px 0 rgba(0, 0, 0, 0.3);
}
[data-theme="light"] .cp-kbd {
  background: linear-gradient(180deg, #ffffff 0%, rgba(15, 23, 42, 0.04) 100%);
  border-color: rgba(15, 23, 42, 0.12);
  color: var(--cf-fg);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.5),
    0 1px 0 rgba(15, 23, 42, 0.04);
}
.cp-kbd-enter {
  min-width: 26px;
  height: 22px;
  padding: 0 8px;
  border-radius: 5px;
  border-color: color-mix(in srgb, var(--cf-primary) 40%, transparent);
  color: color-mix(in srgb, var(--cf-primary) 30%, var(--cf-fg));
  background:
    linear-gradient(180deg,
      color-mix(in srgb, var(--cf-primary) 22%, transparent),
      color-mix(in srgb, var(--cf-primary) 10%, transparent));
  font-weight: 600;
  font-size: 11px;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.08),
    0 1px 0 rgba(0, 0, 0, 0.25);
}

.cp-footer {
  display: flex;
  align-items: center;
  height: 40px;
  padding: 0 14px;
  background: rgba(255, 255, 255, 0.015);
  border-top: 1px solid rgba(255, 255, 255, 0.07);
  gap: 0;
  font-family: var(--font-sans);
  font-weight: 500;
  font-size: 11px;
  line-height: 1;
  color: color-mix(in srgb, var(--cf-muted) 85%, var(--cf-fg));
  flex-shrink: 0;
}
[data-theme="light"] .cp-footer {
  background: rgba(15, 23, 42, 0.02);
  border-top-color: rgba(15, 23, 42, 0.08);
}
.cp-footer-hint {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 0 10px;
}
.cp-footer-hint:first-child { padding-left: 4px; }
.cp-footer-hint-label {
  font-family: var(--font-sans);
  font-weight: 400;
  font-size: 11.5px;
  color: color-mix(in srgb, var(--cf-muted) 65%, transparent);
}
.cp-footer-hint + .cp-footer-hint::before {
  content: "";
  width: 1px;
  height: 14px;
  background: rgba(255, 255, 255, 0.10);
  display: inline-block;
  margin-right: 10px;
  margin-left: -2px;
}
[data-theme="light"] .cp-footer-hint + .cp-footer-hint::before {
  background: rgba(15, 23, 42, 0.10);
}
.cp-footer-hint .cp-kbd { margin: 0; }
.cp-footer-scope {
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 22px;
  padding: 0 10px;
  color: color-mix(in srgb, var(--cf-muted) 70%, transparent);
  font-family: var(--font-sans);
  font-weight: 500;
  font-size: 11px;
  letter-spacing: -0.005em;
}
.cp-scope-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--cf-primary);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--cf-primary) 18%, transparent);
}
.cp-scope-label {
  font-family: var(--font-mono);
  font-weight: 600;
  font-size: 10.5px;
  color: color-mix(in srgb, var(--cf-muted) 30%, var(--cf-fg));
  letter-spacing: 0;
}
.cp-scope-count {
  color: color-mix(in srgb, var(--cf-muted) 70%, transparent);
  font-family: var(--font-mono);
  font-size: 10.5px;
  padding-left: 6px;
  margin-left: 2px;
  border-left: 1px solid rgba(255, 255, 255, 0.10);
}
[data-theme="light"] .cp-scope-count {
  border-left-color: rgba(15, 23, 42, 0.10);
}
@media (max-width: 767px) {
  .cp-footer {
    flex-wrap: wrap;
    height: auto;
    padding: 8px 14px 10px;
    row-gap: 6px;
  }
  .cp-footer-scope { margin-left: 0; width: max-content; }
}

.cp-skeleton-list { padding: 10px 8px; }
.cp-skeleton { display: grid; gap: 6px; padding: 12px 14px; }
.cp-skeleton-title,
.cp-skeleton-path,
.cp-skeleton-snippet {
  background: var(--cf-card);
  border-radius: 4px;
  height: 14px;
  animation: cp-shimmer 1.4s ease-in-out infinite;
}
.cp-skeleton-title { width: 60%; height: 16px; }
.cp-skeleton-path  { width: 35%; height: 11px; }
.cp-skeleton-snippet { width: 90%; height: 14px; }
@keyframes cp-shimmer {
  0%, 100% { opacity: 0.5; }
  50%      { opacity: 0.9; }
}

/* WCAG 2.3.3 — honor the OS-level motion preference. Replace flourish
   animations with instant cuts and stop the loading shimmer pulse. */
@media (prefers-reduced-motion: reduce) {
  .cp-overlay,
  .cp-surface,
  .cp-overlay-sheet .cp-surface,
  .cp-overlay-auto .cp-surface,
  .cp-skeleton-title,
  .cp-skeleton-path,
  .cp-skeleton-snippet,
  .cp-results-wrap {
    animation: none !important;
    transition: none !important;
  }
}

.cp-state {
  padding: 2.25rem 1.25rem;
  text-align: center;
}
.cp-state-initial { padding-top: 3rem; }
.cp-state-title {
  font-family: var(--font-sans);
  font-weight: 500;
  font-size: 0.95rem;
  color: var(--cf-fg);
  letter-spacing: -0.005em;
}
.cp-state-body {
  margin-top: 6px;
  font-size: 0.85rem;
  color: var(--cf-muted);
  line-height: 1.55;
}
.cp-state-retry {
  background: none;
  border: 0;
  color: var(--cf-primary);
  cursor: pointer;
  font: inherit;
  padding: 0;
  margin-left: 4px;
  text-decoration: underline;
  text-underline-offset: 2px;
}
.cp-state-retry:hover { color: var(--cf-fg); }

.cp-recent-list { list-style: none; margin: 0; padding: 0 0 4px; }
.cp-recent-date {
  font-family: var(--font-mono);
  font-size: 11.5px;
  color: color-mix(in srgb, var(--cf-muted) 60%, transparent);
}
.cp-recent-list .cp-result {
  min-height: 44px;
  padding: 7px 16px 7px 18px;
  align-items: center;
}
.cp-recent-list .cp-result-icon { margin-top: 0; }

.cp-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 88px 32px 24px;
  text-align: center;
  gap: 14px;
}
.cp-empty-line1 {
  font-family: var(--font-sans);
  font-weight: 500;
  font-size: 14px;
  line-height: 1.4;
  color: var(--cf-fg);
  letter-spacing: -0.005em;
}
.cp-empty-q {
  font-family: var(--font-mono);
  font-weight: 500;
  color: color-mix(in srgb, var(--cf-primary) 65%, var(--cf-fg));
  background: color-mix(in srgb, var(--cf-primary) 18%, transparent);
  padding: 0 6px;
  border-radius: 3px;
  margin: 0 1px;
}
.cp-empty-hint {
  font-family: var(--font-sans);
  font-weight: 400;
  font-size: 12.5px;
  line-height: 1.5;
  color: var(--cf-muted);
  max-width: 360px;
}
.cp-empty-chips {
  margin-top: 6px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;
}
.cp-empty-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 24px;
  padding: 0 10px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: var(--cf-muted);
  font-family: var(--font-sans);
  font-weight: 500;
  font-size: 11.5px;
  line-height: 1;
  letter-spacing: -0.005em;
}
[data-theme="light"] .cp-empty-chip {
  background: rgba(0, 0, 0, 0.02);
  border-color: rgba(15, 23, 42, 0.08);
}
.cp-empty-chip-button {
  cursor: pointer;
  transition: background 100ms ease, border-color 100ms ease, color 100ms ease;
}
.cp-empty-chip-button:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.14);
  color: var(--cf-fg);
}
.cp-empty-chip-button:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--cf-primary) 60%, transparent);
  outline-offset: 2px;
}
[data-theme="light"] .cp-empty-chip-button:hover {
  background: rgba(15, 23, 42, 0.06);
  border-color: rgba(15, 23, 42, 0.16);
}
.cp-chip-kbd {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  margin-left: 8px;
  border-radius: 3px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
  font-family: var(--font-mono);
  font-weight: 500;
  font-size: 10px;
  line-height: 1;
  color: var(--cf-fg);
}
[data-theme="light"] .cp-chip-kbd {
  background: rgba(0, 0, 0, 0.06);
  border-color: rgba(15, 23, 42, 0.08);
}
.cp-empty-recent {
  margin-top: 28px;
  width: 100%;
  max-width: 380px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  padding-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
[data-theme="light"] .cp-empty-recent {
  border-top-color: rgba(15, 23, 42, 0.08);
}
.cp-empty-recent-label {
  font-family: var(--font-sans);
  font-weight: 500;
  font-size: 10.5px;
  line-height: 1;
  color: color-mix(in srgb, var(--cf-muted) 70%, transparent);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 8px;
  text-align: left;
}
.cp-empty-recent-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 4px;
  font-family: var(--font-sans);
  font-weight: 400;
  font-size: 12.5px;
  line-height: 1.3;
  color: var(--cf-muted);
  text-align: left;
}
.cp-empty-recent-row svg {
  color: color-mix(in srgb, var(--cf-muted) 70%, transparent);
  flex-shrink: 0;
}
.cp-empty-recent-q { flex: 1; }
.cp-empty-recent-ago {
  font-family: var(--font-mono);
  font-size: 11.5px;
  color: color-mix(in srgb, var(--cf-muted) 60%, transparent);
  margin-left: auto;
}

.cp-trigger {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  height: 32px;
  padding: 0 10px 0 12px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  color: var(--cf-muted);
  font-family: var(--font-sans);
  font-size: 13px;
  cursor: pointer;
  transition: background 120ms ease, border-color 120ms ease, color 120ms ease;
}
/* Touch devices need a 44×44 hit target. Apply only on coarse pointers so
   desktop mouse users keep the 32px-tall pill we visually designed for. */
@media (pointer: coarse) {
  .cp-trigger { min-width: 44px; min-height: 44px; padding: 0 12px; }
}
.cp-trigger:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.14);
  color: var(--cf-fg);
}
[data-theme="light"] .cp-trigger {
  background: rgba(15, 23, 42, 0.03);
  border-color: rgba(15, 23, 42, 0.08);
}
[data-theme="light"] .cp-trigger:hover {
  background: rgba(15, 23, 42, 0.06);
  border-color: rgba(15, 23, 42, 0.16);
}
.cp-trigger-label {
  font-weight: 500;
}
.cp-trigger-kbd {
  display: inline-flex;
  align-items: center;
  gap: 1px;
  height: 18px;
  padding: 0 5px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 4px;
  font-family: var(--font-mono);
  font-size: 10.5px;
  font-weight: 600;
  color: var(--cf-muted);
  background: rgba(255, 255, 255, 0.03);
}
[data-theme="light"] .cp-trigger-kbd {
  background: rgba(15, 23, 42, 0.04);
  border-color: rgba(15, 23, 42, 0.10);
}
.cp-kbd-meta { font-size: 11px; margin-right: 1px; }
`;

// Eager-inject the singleton stylesheet on client-side module import so
// `CommandPaletteTrigger` renders styled even before the palette has ever
// opened. Without this, the trigger pill loses its `.cp-trigger` rules until
// the user fires Cmd+K once — every consumer's header pill flashes unstyled
// on first paint. SSR-safe via the `typeof document` guard inside the helper.
if (typeof document !== 'undefined') ensureCommandPaletteStyles();

export default CommandPalette;
