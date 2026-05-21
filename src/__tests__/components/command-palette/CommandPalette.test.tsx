import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useState } from 'react';
import {
  CommandPalette,
  type SearchHit,
  type SearchResponse,
  type SearchFn,
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
});
