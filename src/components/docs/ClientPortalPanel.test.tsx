import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ClientPortalPanel } from './ClientPortalPanel';
import type { PhaseNode } from './ClientPortalPanel.schema';

const minimalHero = {
  category: 'LMS Plataforma',
  projectName: 'XGodel',
  subtitle: 'Plataforma académica con LMS y landing público.',
  statusChip: 'Build · 78%',
};

const phaseProps = {
  percent: 78,
  phases: [
    { key: 'discovery', label: 'Discovery', status: 'done' },
    { key: 'design', label: 'Diseño', status: 'done' },
    { key: 'build', label: 'Construcción', status: 'current' },
    { key: 'launch', label: 'Lanzamiento', status: 'upcoming' },
    { key: 'handover', label: 'Entrega', status: 'upcoming' },
  ] as PhaseNode[],
  nextMilestone: 'Lanzamiento jun 2026',
};

describe('ClientPortalPanel', () => {
  it('renders Root with slug data-attr and hydrates --portal-accent', () => {
    const { container } = render(
      <ClientPortalPanel.Root slug="xgodel" accentColor="#0F5132">
        <ClientPortalPanel.Hero {...minimalHero} />
      </ClientPortalPanel.Root>
    );
    const root = container.querySelector('[data-slot="client-portal-panel"]') as HTMLElement;
    expect(root).toBeTruthy();
    expect(root.getAttribute('data-client-slug')).toBe('xgodel');
    expect(root.style.getPropertyValue('--portal-accent')).toContain('#0F5132');
  });

  it('renders Hero with eyebrow + name + chip + subtitle', () => {
    render(
      <ClientPortalPanel.Root slug="xgodel">
        <ClientPortalPanel.Hero {...minimalHero} />
      </ClientPortalPanel.Root>
    );
    expect(screen.getByText('LMS Plataforma')).toBeInTheDocument();
    expect(screen.getByText('XGodel')).toBeInTheDocument();
    expect(screen.getByText('Build · 78%')).toBeInTheDocument();
    expect(screen.getByText(/Plataforma académica/)).toBeInTheDocument();
  });

  it('renders Phase with percent + all phase labels + next milestone', () => {
    render(
      <ClientPortalPanel.Root slug="xgodel">
        <ClientPortalPanel.Phase {...phaseProps} />
      </ClientPortalPanel.Root>
    );
    expect(screen.getByText('78%')).toBeInTheDocument();
    expect(screen.getByText('Discovery')).toBeInTheDocument();
    expect(screen.getByText('Construcción')).toBeInTheDocument();
    expect(screen.getByText('Entrega')).toBeInTheDocument();
    expect(screen.getByText(/Lanzamiento jun 2026/)).toBeInTheDocument();
  });

  it('clamps percent to 0-100', () => {
    render(
      <ClientPortalPanel.Root slug="x">
        <ClientPortalPanel.Phase percent={142} phases={phaseProps.phases} />
      </ClientPortalPanel.Root>
    );
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('LiveSites hides when empty array', () => {
    const { container } = render(
      <ClientPortalPanel.Root slug="x">
        <ClientPortalPanel.LiveSites sites={[]} />
      </ClientPortalPanel.Root>
    );
    expect(container.querySelector('[data-slot="portal-live-sites"]')).toBeNull();
  });

  it('LiveSites renders primary + secondary with 65/35 grid', () => {
    render(
      <ClientPortalPanel.Root slug="x">
        <ClientPortalPanel.LiveSites
          sites={[
            { label: 'Landing', url: 'https://xgodel.com', screenshot: '/x1.png', updatedHint: 'hace 2d' },
            { label: 'Plataforma', url: 'https://plataforma.xgodel.com', screenshot: '/x2.png' },
          ]}
        />
      </ClientPortalPanel.Root>
    );
    expect(screen.getByText('Landing')).toBeInTheDocument();
    expect(screen.getByText('Plataforma')).toBeInTheDocument();
    expect(screen.getByText('https://xgodel.com')).toBeInTheDocument();
    expect(screen.getByText('hace 2d')).toBeInTheDocument();
  });

  it('Brand hides entirely when palette/typography/brandBook all absent', () => {
    const { container } = render(
      <ClientPortalPanel.Root slug="x">
        <ClientPortalPanel.Brand />
      </ClientPortalPanel.Root>
    );
    expect(container.querySelector('[data-slot="portal-brand"]')).toBeNull();
  });

  it('Brand renders palette with hex values', () => {
    render(
      <ClientPortalPanel.Root slug="x">
        <ClientPortalPanel.Brand
          palette={[
            { name: 'Primary', value: '#0F5132', usage: 'Headlines + CTAs' },
            { name: 'Accent', value: '#E2B007' },
          ]}
        />
      </ClientPortalPanel.Root>
    );
    expect(screen.getByText('Primary')).toBeInTheDocument();
    expect(screen.getByText('#0F5132')).toBeInTheDocument();
    expect(screen.getByText('Headlines + CTAs')).toBeInTheDocument();
  });

  it('Concepts highlights chosen + labels others as Exploración', () => {
    render(
      <ClientPortalPanel.Root slug="x">
        <ClientPortalPanel.Concepts
          concepts={[
            { label: 'A', thumbnail: '/a.png' },
            { label: 'B', thumbnail: '/b.png', chosen: true },
            { label: 'C', thumbnail: '/c.png' },
          ]}
        />
      </ClientPortalPanel.Root>
    );
    expect(screen.getByText('Final')).toBeInTheDocument();
    expect(screen.getAllByText('Exploración')).toHaveLength(2);
  });

  it('Activity caps at 6 items even if more provided', () => {
    const items = Array.from({ length: 10 }, (_, i) => ({ date: `${i + 1} may`, description: `item ${i}` }));
    render(
      <ClientPortalPanel.Root slug="x">
        <ClientPortalPanel.Activity items={items} />
      </ClientPortalPanel.Root>
    );
    expect(screen.getByText('item 0')).toBeInTheDocument();
    expect(screen.getByText('item 5')).toBeInTheDocument();
    expect(screen.queryByText('item 6')).toBeNull();
  });

  it('Activity hides when 0 items', () => {
    const { container } = render(
      <ClientPortalPanel.Root slug="x">
        <ClientPortalPanel.Activity items={[]} />
      </ClientPortalPanel.Root>
    );
    expect(container.querySelector('[data-slot="portal-activity"]')).toBeNull();
  });

  it('Team hides when 0 members; renders names + roles when present', () => {
    const { container, rerender } = render(
      <ClientPortalPanel.Root slug="x">
        <ClientPortalPanel.Team members={[]} />
      </ClientPortalPanel.Root>
    );
    expect(container.querySelector('[data-slot="portal-team"]')).toBeNull();

    rerender(
      <ClientPortalPanel.Root slug="x">
        <ClientPortalPanel.Team members={[{ name: 'André', role: 'CEO' }]} />
      </ClientPortalPanel.Root>
    );
    expect(screen.getByText('André')).toBeInTheDocument();
    expect(screen.getByText('CEO')).toBeInTheDocument();
  });

  it('Payments clamps percent + renders next milestone', () => {
    render(
      <ClientPortalPanel.Root slug="x">
        <ClientPortalPanel.Payments
          state={{ percentPaid: 80, amountLabel: '$2,400 / $3,000', nextMilestone: 'Lanzamiento jun' }}
        />
      </ClientPortalPanel.Root>
    );
    expect(screen.getByText('$2,400 / $3,000')).toBeInTheDocument();
    expect(screen.getByText('80%')).toBeInTheDocument();
    expect(screen.getByText(/Hito siguiente:.*Lanzamiento jun/)).toBeInTheDocument();
  });

  it('Build hides when repos, stats, cronograma all absent', () => {
    const { container } = render(
      <ClientPortalPanel.Root slug="x">
        <ClientPortalPanel.Build />
      </ClientPortalPanel.Root>
    );
    expect(container.querySelector('[data-slot="portal-build"]')).toBeNull();
  });

  it('Strategy hides when proposal, personas, sitemap all absent', () => {
    const { container } = render(
      <ClientPortalPanel.Root slug="x">
        <ClientPortalPanel.Strategy />
      </ClientPortalPanel.Root>
    );
    expect(container.querySelector('[data-slot="portal-strategy"]')).toBeNull();
  });
});
