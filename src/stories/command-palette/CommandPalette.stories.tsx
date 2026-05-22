import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import {
  CommandPalette,
  type SearchHit,
  type SearchResponse,
  type SearchFn,
} from '../../components/command-palette/CommandPalette';

const VIEWPORT_MOBILE = { defaultViewport: 'mobile1' };

const FIXTURE: SearchHit[] = [
  {
    project: 'cofoundy',
    slug: 'engineering/brand-validator-guide',
    role: 'team',
    title: 'Brand Validator Guide',
    snippet:
      '<CustomPanel> violates the <mark>allowlist</mark> when colors fall outside brand tokens. Nearest match suggestion lands in stderr.',
    score: 0.42,
    url: '/team/cofoundy/engineering/brand-validator-guide',
  },
  {
    project: 'handbook',
    slug: 'positioning/voice-and-persona',
    role: 'team',
    title: 'Voice & Persona',
    snippet:
      'Cofoundy is <mark>Sage-Caregiver</mark> with Hero notes. Earns trust through clarity. Owns the constraint instead of citing authority.',
    score: 0.71,
    url: '/team/handbook/positioning/voice-and-persona',
  },
  {
    project: 'cofoundy-gtm',
    slug: 'decisions/channel-stack',
    role: 'team',
    title: 'Channel Stack — Decisions',
    snippet:
      'WhatsApp first, then email; <mark>Discord</mark> for ops; Slack rejected for client comms. Rationale: register fit + read latency.',
    score: 0.95,
    url: '/team/cofoundy-gtm/decisions/channel-stack',
  },
  {
    project: 'client-xgodel',
    slug: 'meetings/kickoff-recap-2026-05-12',
    role: 'client',
    title: 'Kickoff Recap — XGodel',
    snippet:
      'Phase 1 scope locked at <mark>landing</mark> + brand. Approval gate at concept C. Next checkpoint: shader config Friday.',
    score: 1.12,
    url: '/client/client-xgodel/meetings/kickoff-recap-2026-05-12',
  },
  {
    project: 'core',
    slug: 'finance/pricing-q2',
    role: 'team',
    title: 'Pricing — Q2 review',
    snippet:
      'Tier ladder revised. <mark>Partner-tier</mark> unchanged. Consultant rates indexed to USD floor.',
    score: 1.38,
    url: '/team/core/finance/pricing-q2',
  },
];

const makeResponse = (query: string, hits: SearchHit[]): SearchResponse => ({
  query,
  hits,
  total: hits.length,
  took_ms: 4,
});

const instantSearch =
  (hits: SearchHit[]): SearchFn =>
  async (q) => {
    const needle = q.trim().toLowerCase();
    if (!needle) return makeResponse(q, hits);
    const filtered = hits.filter(
      (h) =>
        h.title.toLowerCase().includes(needle) ||
        h.url.toLowerCase().includes(needle) ||
        h.snippet.toLowerCase().includes(needle),
    );
    return makeResponse(q, filtered);
  };

const slowSearch =
  (hits: SearchHit[], delayMs = 1500): SearchFn =>
  (q, signal) =>
    new Promise<SearchResponse>((resolve, reject) => {
      const t = setTimeout(() => resolve(makeResponse(q, hits)), delayMs);
      signal.addEventListener('abort', () => {
        clearTimeout(t);
        reject(new DOMException('aborted', 'AbortError'));
      });
    });

const emptySearch: SearchFn = async (q) => makeResponse(q, []);

const erroringSearch: SearchFn = async () => {
  throw new Error('upstream search index unavailable');
};

// Stories use a no-op onNavigate so clicking a hit doesn't actually navigate
// away from the Storybook frame. Wire onSelect to Storybook's actions panel
// when iterating on telemetry behaviour locally.
function Harness(props: Parameters<typeof CommandPalette>[0]) {
  const [open, setOpen] = useState(true);
  return (
    <CommandPalette
      {...props}
      open={open}
      onOpenChange={setOpen}
      onNavigate={() => {}}
    />
  );
}

const meta: Meta<typeof CommandPalette> = {
  title: 'Command Palette/CommandPalette',
  component: CommandPalette,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof CommandPalette>;

export const Idle: Story = {
  render: () => <Harness open onOpenChange={() => {}} searchFn={instantSearch(FIXTURE)} scope="team" />,
};

export const Loading: Story = {
  render: () => (
    <Harness
      open
      onOpenChange={() => {}}
      searchFn={slowSearch(FIXTURE, 60_000)}
      debounceMs={0}
      scope="team"
    />
  ),
};

export const Results: Story = {
  render: () => {
    const [open, setOpen] = useState(true);
    return (
      <CommandPalette
        open={open}
        onOpenChange={setOpen}
        searchFn={instantSearch(FIXTURE)}
        scope="team"
        project="cofoundy"
        debounceMs={0}
        // Pre-fill input on mount via auto-focus + simulated keystroke
        // is not possible declaratively — keep manual: open + type to see Results.
      />
    );
  },
};

export const NoResults: Story = {
  render: () => {
    const [open, setOpen] = useState(true);
    const fn: SearchFn = async (q) => makeResponse(q || 'asdfasdf', []);
    return (
      <CommandPalette
        open={open}
        onOpenChange={setOpen}
        searchFn={fn}
        scope="team"
        debounceMs={0}
        emptyActions={[
          { label: 'All scopes', kbd: '1' },
          { label: 'Team only', kbd: '2' },
          { label: 'Browse index', kbd: 'I' },
        ]}
        recentSearches={[
          { q: 'onboarding', ago: '2m ago' },
          { q: 'tag:strategy', ago: '12m ago' },
          { q: 'pets kickoff', ago: '1h ago' },
        ]}
      />
    );
  },
};

export const Error_: Story = {
  name: 'Error',
  render: () => <Harness open onOpenChange={() => {}} searchFn={erroringSearch} debounceMs={0} scope="team" />,
};

export const WithRecents: Story = {
  render: () => (
    <Harness
      open
      onOpenChange={() => {}}
      searchFn={instantSearch(FIXTURE)}
      scope="team"
      recents={[
        { title: 'Onboarding playbook v2', path: 'vault / team / onboarding.md', date: '2d ago' },
        { title: 'Q2 priorities', path: 'vault / strategy / q2-priorities.md', date: '3d ago' },
        { title: 'Pets — kickoff brief', path: 'clients / pets / kickoff.md', date: '4d ago' },
      ]}
    />
  ),
};

export const MobileBaseline: Story = {
  parameters: { viewport: VIEWPORT_MOBILE },
  render: () => (
    <Harness
      open
      onOpenChange={() => {}}
      searchFn={instantSearch(FIXTURE)}
      scope="team"
      mobileVariant="sheet"
    />
  ),
};
