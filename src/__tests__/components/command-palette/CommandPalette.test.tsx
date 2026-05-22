import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { useState } from 'react';
import {
  CommandPalette,
  useCommandPaletteHotkeys,
  type SearchHit,
  type SearchResponse,
  type SearchFn,
  type EmptyAction,
  type RecentDoc,
} from '../../../components/command-palette/CommandPalette';

const FIXTURE: SearchHit[] = [
  {
    project: 'a',
    slug: 'one',
    role: 'team',
    title: 'Brand Validator',
    snippet: 'token allow<mark>list</mark>',
    score: 0.42,
    url: '/team/a/one',
  },
  {
    project: 'b',
    slug: 'two',
    role: 'team',
    title: 'Voice & Persona',
    snippet: 'Sage-<mark>Caregiver</mark>',
    score: 0.71,
    url: '/team/b/two',
  },
];

const instant =
  (hits: SearchHit[]): SearchFn =>
  async (query): Promise<SearchResponse> => ({
    query,
    hits,
    total: hits.length,
    took_ms: 1,
  });

function Harness({
  searchFn,
  onNavigate,
}: {
  searchFn?: SearchFn;
  onNavigate?: (url: string, hit: SearchHit) => void;
}) {
  const [open, setOpen] = useState(true);
  return (
    <CommandPalette
      open={open}
      onOpenChange={setOpen}
      searchFn={searchFn}
      onNavigate={onNavigate}
      scope="team"
      debounceMs={0}
      minQueryLength={1}
    />
  );
}

describe('CommandPalette', () => {
  beforeEach(() => {
    document.body.style.overflow = '';
  });

  it('renders the dialog with input + footer', async () => {
    render(<Harness searchFn={instant(FIXTURE)} />);
    expect(await screen.findByRole('dialog', { name: /search documentation/i })).toBeTruthy();
    expect(screen.getByLabelText(/search query/i)).toBeTruthy();
    expect(screen.getByText(/navigate/i)).toBeTruthy();
  });

  it('renders the idle empty state when no recents are supplied', async () => {
    render(<Harness searchFn={instant([])} />);
    expect(await screen.findByText(/start typing to search the vault/i)).toBeTruthy();
  });

  it('shows results after typing', async () => {
    render(<Harness searchFn={instant(FIXTURE)} />);
    const input = screen.getByLabelText(/search query/i) as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'brand' } });
    await waitFor(() => expect(screen.getByRole('listbox')).toBeTruthy());
    expect(screen.getByText('Brand Validator')).toBeTruthy();
    expect(screen.getByText('Voice & Persona')).toBeTruthy();
  });

  it('calls onNavigate when Enter is pressed on a selected hit', async () => {
    const onNavigate = vi.fn();
    render(<Harness searchFn={instant(FIXTURE)} onNavigate={onNavigate} />);
    const input = screen.getByLabelText(/search query/i) as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'voice' } });
    await waitFor(() => expect(screen.getByRole('listbox')).toBeTruthy());
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onNavigate).toHaveBeenCalledWith(
      '/team/a/one',
      expect.objectContaining({ title: 'Brand Validator' }),
    );
  });

  it('arrow-down advances selected index', async () => {
    const onNavigate = vi.fn();
    render(<Harness searchFn={instant(FIXTURE)} onNavigate={onNavigate} />);
    const input = screen.getByLabelText(/search query/i) as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'a' } });
    await waitFor(() => expect(screen.getByRole('listbox')).toBeTruthy());
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onNavigate).toHaveBeenCalledWith(
      '/team/b/two',
      expect.objectContaining({ title: 'Voice & Persona' }),
    );
  });

  it('shows the error state when searchFn rejects', async () => {
    const failing: SearchFn = async () => {
      throw new Error('boom');
    };
    render(<Harness searchFn={failing} />);
    const input = screen.getByLabelText(/search query/i) as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'x' } });
    expect(await screen.findByText(/search is unavailable right now/i)).toBeTruthy();
  });

  it('Escape closes the palette', async () => {
    render(<Harness searchFn={instant(FIXTURE)} />);
    const input = screen.getByLabelText(/search query/i) as HTMLInputElement;
    fireEvent.keyDown(input, { key: 'Escape' });
    await waitFor(() =>
      expect(screen.queryByRole('dialog', { name: /search documentation/i })).toBeNull(),
    );
  });

  it('does not fire searchFn for sub-minQueryLength queries', async () => {
    const searchFn = vi.fn(instant(FIXTURE));
    function GatedHarness() {
      const [open, setOpen] = useState(true);
      return (
        <CommandPalette
          open={open}
          onOpenChange={setOpen}
          searchFn={searchFn}
          scope="team"
          debounceMs={0}
          minQueryLength={3}
        />
      );
    }
    render(<GatedHarness />);
    const input = screen.getByLabelText(/search query/i) as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'ab' } });
    await waitFor(() =>
      expect(screen.queryByText(/start typing to search the vault/i)).toBeTruthy(),
    );
    expect(searchFn).not.toHaveBeenCalled();
  });

  it('sanitizes <script> out of snippet HTML by default', async () => {
    const dangerous: SearchHit = {
      project: 'p',
      slug: 's',
      role: 'team',
      title: 'Dangerous',
      snippet: 'hello <script>alert(1)</script> <mark>world</mark>',
      score: 0,
      url: '/x',
    };
    render(<Harness searchFn={instant([dangerous])} />);
    const input = screen.getByLabelText(/search query/i) as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'hello' } });
    await waitFor(() => expect(screen.getByRole('listbox')).toBeTruthy());
    const snippet = document.querySelector('.cp-result-snippet');
    expect(snippet?.innerHTML.includes('<script>')).toBe(false);
    expect(snippet?.innerHTML.includes('<mark>world</mark>')).toBe(true);
  });

  it('preserves raw snippet HTML when trustSnippetHtml is true', async () => {
    const trusted: SearchHit = {
      project: 'p',
      slug: 's',
      role: 'team',
      title: 'Trusted',
      snippet: '<mark>kept</mark> <em>and emphasized</em>',
      score: 0,
      url: '/x',
    };
    function TrustingHarness() {
      const [open, setOpen] = useState(true);
      return (
        <CommandPalette
          open={open}
          onOpenChange={setOpen}
          searchFn={instant([trusted])}
          scope="team"
          debounceMs={0}
          minQueryLength={1}
          trustSnippetHtml
        />
      );
    }
    render(<TrustingHarness />);
    const input = screen.getByLabelText(/search query/i) as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'kept' } });
    await waitFor(() => expect(screen.getByRole('listbox')).toBeTruthy());
    const snippet = document.querySelector('.cp-result-snippet');
    expect(snippet?.innerHTML.includes('<em>and emphasized</em>')).toBe(true);
  });

  it('clear button empties the query and refocuses input', async () => {
    render(<Harness searchFn={instant(FIXTURE)} />);
    const input = screen.getByLabelText(/search query/i) as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'brand' } });
    await waitFor(() => expect(screen.getByRole('listbox')).toBeTruthy());
    const clearBtn = screen.getByLabelText(/clear search/i);
    fireEvent.click(clearBtn);
    expect(input.value).toBe('');
  });

  it('fires onSearch + onSelect telemetry callbacks', async () => {
    const onSearch = vi.fn();
    const onSelect = vi.fn();
    function TelemetryHarness() {
      const [open, setOpen] = useState(true);
      return (
        <CommandPalette
          open={open}
          onOpenChange={setOpen}
          searchFn={instant(FIXTURE)}
          onNavigate={() => {}}
          onSearch={onSearch}
          onSelect={onSelect}
          scope="team"
          debounceMs={0}
          minQueryLength={1}
        />
      );
    }
    render(<TelemetryHarness />);
    const input = screen.getByLabelText(/search query/i) as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'brand' } });
    await waitFor(() => expect(onSearch).toHaveBeenCalled());
    expect(onSearch).toHaveBeenCalledWith('brand', expect.any(Array), 1);
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onSelect).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Brand Validator' }),
      0,
      'enter',
    );
  });

  it('emptyActions chip with onSelect fires when clicked', async () => {
    const onChip = vi.fn();
    const actions: EmptyAction[] = [{ label: 'Switch scope', kbd: '2', onSelect: onChip }];
    function EmptyHarness() {
      const [open, setOpen] = useState(true);
      return (
        <CommandPalette
          open={open}
          onOpenChange={setOpen}
          searchFn={instant([])}
          scope="team"
          debounceMs={0}
          minQueryLength={1}
          emptyActions={actions}
        />
      );
    }
    render(<EmptyHarness />);
    const input = screen.getByLabelText(/search query/i) as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'nothing' } });
    const chip = await screen.findByRole('button', { name: /switch scope/i });
    fireEvent.click(chip);
    expect(onChip).toHaveBeenCalled();
  });

  it('Cmd+Enter on a hit opens in a new tab via window.open', async () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    const onNavigate = vi.fn();
    render(<Harness searchFn={instant(FIXTURE)} onNavigate={onNavigate} />);
    const input = screen.getByLabelText(/search query/i) as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'brand' } });
    await waitFor(() => expect(screen.getByRole('listbox')).toBeTruthy());
    fireEvent.keyDown(input, { key: 'Enter', metaKey: true });
    expect(openSpy).toHaveBeenCalledWith('/team/a/one', '_blank', 'noopener,noreferrer');
    expect(onNavigate).not.toHaveBeenCalled();
    openSpy.mockRestore();
  });

  it('renders the role badge when SearchHit.role is set', async () => {
    render(<Harness searchFn={instant(FIXTURE)} />);
    const input = screen.getByLabelText(/search query/i) as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'brand' } });
    await waitFor(() => expect(screen.getByRole('listbox')).toBeTruthy());
    const badges = document.querySelectorAll('.cp-result-role');
    expect(badges.length).toBeGreaterThan(0);
    expect(badges[0].getAttribute('data-role')).toBe('team');
  });

  it('recents are clickable links when supplied', async () => {
    const recents: RecentDoc[] = [
      { title: 'Recent A', path: 'vault/a.md', date: '2d ago', url: '/team/a/recent' },
    ];
    function RecentHarness() {
      const [open, setOpen] = useState(true);
      return (
        <CommandPalette
          open={open}
          onOpenChange={setOpen}
          searchFn={instant(FIXTURE)}
          scope="team"
          debounceMs={0}
          minQueryLength={1}
          recents={recents}
        />
      );
    }
    render(<RecentHarness />);
    const link = await screen.findByText('Recent A');
    const anchor = link.closest('a');
    expect(anchor?.getAttribute('href')).toBe('/team/a/recent');
  });

  it('options namespace IDs so two palettes do not collide', async () => {
    function DualHarness() {
      return (
        <>
          <CommandPalette
            open
            onOpenChange={() => {}}
            searchFn={instant(FIXTURE)}
            scope="team"
            debounceMs={0}
            minQueryLength={1}
          />
        </>
      );
    }
    render(<DualHarness />);
    const input = screen.getByLabelText(/search query/i) as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'brand' } });
    await waitFor(() => expect(screen.getByRole('listbox')).toBeTruthy());
    const options = document.querySelectorAll('[role="option"]');
    for (const opt of options) {
      expect(opt.id).toMatch(/^cp-opt-.+-\d+$/);
    }
  });

  it('warns to console when opened without a searchFn (dev mode)', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(<Harness />);
    expect(warn).toHaveBeenCalledWith(expect.stringMatching(/without a `searchFn`/));
    warn.mockRestore();
  });
});

describe('useCommandPaletteHotkeys', () => {
  function HookHarness({ initialOpen = false }: { initialOpen?: boolean }) {
    const [open, setOpen] = useState(initialOpen);
    useCommandPaletteHotkeys({ open, setOpen });
    return <div data-testid="status">{open ? 'open' : 'closed'}</div>;
  }

  it('Cmd+K opens the palette', () => {
    render(<HookHarness />);
    expect(screen.getByTestId('status').textContent).toBe('closed');
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }));
    });
    expect(screen.getByTestId('status').textContent).toBe('open');
  });

  it('Slash opens the palette when no input is focused', () => {
    render(<HookHarness />);
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: '/' }));
    });
    expect(screen.getByTestId('status').textContent).toBe('open');
  });

  it('Escape closes the palette when open', () => {
    render(<HookHarness initialOpen />);
    expect(screen.getByTestId('status').textContent).toBe('open');
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    });
    expect(screen.getByTestId('status').textContent).toBe('closed');
  });
});
