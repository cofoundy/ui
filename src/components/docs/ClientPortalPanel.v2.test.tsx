import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ClientPortalPanel } from './ClientPortalPanel';
import type {
  ApprovalItem,
  DocumentItem,
  MeetingItem,
  MilestoneItem,
  AccessEntry,
  ChecklistItem,
  TaskColumn,
  GuideItem,
  DownloadItem,
} from './ClientPortalPanel.schema';

/* v2 test suite — 10 new slots (library extension). */

describe('ClientPortalPanel.Approvals', () => {
  const items: ApprovalItem[] = [
    { title: 'Aprobar copy del hero', status: 'pending', url: 'https://x/1', what: 'Texto principal de la landing.', dueLabel: 'vence 22 may' },
    { title: 'Firmar cotización v2', status: 'pending', url: 'https://x/2' },
    { title: 'Brand book aprobado', status: 'approved', url: 'https://x/3' },
    { title: 'Concept rechazado', status: 'rejected', url: 'https://x/4' },
  ];

  it('hides when empty', () => {
    const { container } = render(
      <ClientPortalPanel.Root slug="x">
        <ClientPortalPanel.Approvals items={[]} />
      </ClientPortalPanel.Root>
    );
    expect(container.querySelector('[data-slot="portal-approvals"]')).toBeNull();
  });

  it('renders pending items as full cards + resolved as compact rows', () => {
    const { container } = render(
      <ClientPortalPanel.Root slug="x">
        <ClientPortalPanel.Approvals items={items} />
      </ClientPortalPanel.Root>
    );
    expect(container.querySelectorAll('[data-slot="portal-approval-card"]')).toHaveLength(2);
    expect(container.querySelectorAll('[data-slot="portal-approval-row"]')).toHaveLength(2);
    expect(screen.getByText('Aprobar copy del hero')).toBeInTheDocument();
    expect(screen.getByText('Brand book aprobado')).toBeInTheDocument();
  });

  it('sorts pending first regardless of input order', () => {
    const reversed = [items[2], items[3], items[0], items[1]];
    const { container } = render(
      <ClientPortalPanel.Root slug="x">
        <ClientPortalPanel.Approvals items={reversed} />
      </ClientPortalPanel.Root>
    );
    const cards = container.querySelectorAll('[data-slot="portal-approval-card"]');
    expect(cards[0].textContent).toContain('Aprobar copy del hero');
  });
});

describe('ClientPortalPanel.Documents', () => {
  const items: DocumentItem[] = [
    { type: 'quote', title: 'Cotización v1', url: 'https://x/q1', status: 'Firmado', amount: '$3,000', date: '01 may' },
    { type: 'contract', title: 'Contrato MSA', url: 'https://x/c1', status: 'Firmado', date: '05 may' },
    { type: 'invoice', title: 'Factura F001-23', url: 'https://x/i1', amount: '$1,500', status: 'Pagado' },
    { type: 'nda', title: 'NDA mutuo', url: 'https://x/n1' },
  ];

  it('hides when empty', () => {
    const { container } = render(
      <ClientPortalPanel.Root slug="x">
        <ClientPortalPanel.Documents items={[]} />
      </ClientPortalPanel.Root>
    );
    expect(container.querySelector('[data-slot="portal-documents"]')).toBeNull();
  });

  it('groups by type and renders all', () => {
    render(
      <ClientPortalPanel.Root slug="x">
        <ClientPortalPanel.Documents items={items} />
      </ClientPortalPanel.Root>
    );
    expect(screen.getByText('Cotizaciones')).toBeInTheDocument();
    expect(screen.getByText('Contratos')).toBeInTheDocument();
    expect(screen.getByText('NDAs')).toBeInTheDocument();
    expect(screen.getByText('Facturas')).toBeInTheDocument();
    expect(screen.getByText('$3,000')).toBeInTheDocument();
  });

  it('respects custom group order', () => {
    const { container } = render(
      <ClientPortalPanel.Root slug="x">
        <ClientPortalPanel.Documents items={items} groupOrder={['invoice', 'quote']} />
      </ClientPortalPanel.Root>
    );
    // Only invoice + quote groups should appear; contract + nda hidden by groupOrder filter.
    expect(screen.getByText('Facturas')).toBeInTheDocument();
    expect(screen.getByText('Cotizaciones')).toBeInTheDocument();
    expect(screen.queryByText('Contratos')).toBeNull();
    expect(screen.queryByText('NDAs')).toBeNull();
  });
});

describe('ClientPortalPanel.Meetings', () => {
  const items: MeetingItem[] = [
    { title: 'Kickoff', whenLabel: '01 may · 10:00', kind: 'past', primaryUrl: 'https://x/rec', secondaryUrl: 'https://x/transcript' },
    { title: 'Review semanal', whenLabel: '22 may · 16:00', kind: 'upcoming', primaryUrl: 'https://x/cal' },
  ];

  it('hides when empty', () => {
    const { container } = render(
      <ClientPortalPanel.Root slug="x">
        <ClientPortalPanel.Meetings items={[]} />
      </ClientPortalPanel.Root>
    );
    expect(container.querySelector('[data-slot="portal-meetings"]')).toBeNull();
  });

  it('separates upcoming and past', () => {
    const { container } = render(
      <ClientPortalPanel.Root slug="x">
        <ClientPortalPanel.Meetings items={items} />
      </ClientPortalPanel.Root>
    );
    expect(screen.getByText('Próximas')).toBeInTheDocument();
    expect(screen.getByText('Anteriores')).toBeInTheDocument();
    expect(container.querySelectorAll('[data-kind="upcoming"]')).toHaveLength(1);
    expect(container.querySelectorAll('[data-kind="past"]')).toHaveLength(1);
  });
});

describe('ClientPortalPanel.Tasks', () => {
  const columns: TaskColumn[] = [
    { label: 'Backlog', count: 12, recent: [{ title: 'Auth flow', column: 'Backlog' }] },
    { label: 'En curso', count: 3 },
    { label: 'Hecho', count: 47 },
  ];

  it('hides when no columns', () => {
    const { container } = render(
      <ClientPortalPanel.Root slug="x">
        <ClientPortalPanel.Tasks projectId={15} columns={[]} />
      </ClientPortalPanel.Root>
    );
    expect(container.querySelector('[data-slot="portal-tasks"]')).toBeNull();
  });

  it('renders kanban view by default with project id footer', () => {
    const { container } = render(
      <ClientPortalPanel.Root slug="x">
        <ClientPortalPanel.Tasks projectId={15} columns={columns} projectUrl="https://vikunja/15" />
      </ClientPortalPanel.Root>
    );
    expect(container.querySelector('[data-view="kanban"]')).not.toBeNull();
    expect(screen.getByText('Backlog')).toBeInTheDocument();
    expect(screen.getByText('47')).toBeInTheDocument();
    expect(screen.getByText(/Vikunja.*proyecto.*15/)).toBeInTheDocument();
    expect(screen.getByText('Abrir board ↗')).toBeInTheDocument();
  });

  it('supports list view', () => {
    const { container } = render(
      <ClientPortalPanel.Root slug="x">
        <ClientPortalPanel.Tasks projectId={15} view="list" columns={columns} />
      </ClientPortalPanel.Root>
    );
    expect(container.querySelector('[data-view="list"]')).not.toBeNull();
  });
});

describe('ClientPortalPanel.Milestones', () => {
  const items: MilestoneItem[] = [
    { title: 'Brand book v2 entregado', status: 'done', date: '14 may', deliverableUrl: 'https://x/bb' },
    { title: 'LMS MVP live', status: 'in-progress', date: 'jun 2026' },
    { title: 'Pago final', status: 'pending' },
    { title: 'Tienda pago', status: 'blocked', date: 'requiere acción' },
  ];

  it('hides when empty', () => {
    const { container } = render(
      <ClientPortalPanel.Root slug="x">
        <ClientPortalPanel.Milestones items={[]} />
      </ClientPortalPanel.Root>
    );
    expect(container.querySelector('[data-slot="portal-milestones"]')).toBeNull();
  });

  it('renders deliverable link only when done', () => {
    render(
      <ClientPortalPanel.Root slug="x">
        <ClientPortalPanel.Milestones items={items} />
      </ClientPortalPanel.Root>
    );
    expect(screen.getByText('Ver entrega ↗')).toBeInTheDocument();
    expect(screen.getAllByText('Ver entrega ↗')).toHaveLength(1);
  });

  it('exposes status data attr per row', () => {
    const { container } = render(
      <ClientPortalPanel.Root slug="x">
        <ClientPortalPanel.Milestones items={items} />
      </ClientPortalPanel.Root>
    );
    expect(container.querySelector('[data-status="done"]')).not.toBeNull();
    expect(container.querySelector('[data-status="blocked"]')).not.toBeNull();
  });
});

describe('ClientPortalPanel.Guides', () => {
  const items: GuideItem[] = [
    { title: 'Cómo usar el LMS', kind: 'video', url: 'https://x/v1', duration: '8 min' },
    { title: 'Setup inicial', kind: 'article', url: 'https://x/a1', duration: '5 min lectura' },
    { title: 'Onboarding profesores', kind: 'tutorial', url: 'https://x/t1' },
  ];

  it('hides when empty', () => {
    const { container } = render(
      <ClientPortalPanel.Root slug="x">
        <ClientPortalPanel.Guides items={[]} />
      </ClientPortalPanel.Root>
    );
    expect(container.querySelector('[data-slot="portal-guides"]')).toBeNull();
  });

  it('renders kind chips and durations', () => {
    render(
      <ClientPortalPanel.Root slug="x">
        <ClientPortalPanel.Guides items={items} />
      </ClientPortalPanel.Root>
    );
    expect(screen.getByText('Video')).toBeInTheDocument();
    expect(screen.getByText('Artículo')).toBeInTheDocument();
    expect(screen.getByText('Tutorial')).toBeInTheDocument();
    expect(screen.getByText('8 min')).toBeInTheDocument();
  });
});

describe('ClientPortalPanel.Downloads', () => {
  const items: DownloadItem[] = [
    { title: 'Brand kit', url: 'https://x/zip', format: 'ZIP', size: '24 MB', description: 'Logos + tipografías' },
    { title: 'Deck inversores', url: 'https://x/pdf', format: 'PDF', size: '4 MB' },
  ];

  it('hides when empty', () => {
    const { container } = render(
      <ClientPortalPanel.Root slug="x">
        <ClientPortalPanel.Downloads items={[]} />
      </ClientPortalPanel.Root>
    );
    expect(container.querySelector('[data-slot="portal-downloads"]')).toBeNull();
  });

  it('renders format chip + size and download anchor', () => {
    const { container } = render(
      <ClientPortalPanel.Root slug="x">
        <ClientPortalPanel.Downloads items={items} />
      </ClientPortalPanel.Root>
    );
    expect(screen.getByText('ZIP')).toBeInTheDocument();
    expect(screen.getByText('Brand kit')).toBeInTheDocument();
    expect(screen.getByText('24 MB')).toBeInTheDocument();
    const rows = container.querySelectorAll('[data-slot="portal-download-row"]');
    expect(rows).toHaveLength(2);
    expect((rows[0] as HTMLAnchorElement).hasAttribute('download')).toBe(true);
  });
});

describe('ClientPortalPanel.AccessRegistry', () => {
  const items: AccessEntry[] = [
    { system: 'Vikunja', status: 'granted', dateLabel: '01 may' },
    { system: 'Vercel', status: 'pending', contactUrl: 'https://wa.me/51947633203' },
    { system: 'Cloudflare', status: 'bitwarden-send-issued', dateLabel: '14 may' },
    { system: 'AWS', status: 'not-applicable' },
  ];

  it('hides when empty', () => {
    const { container } = render(
      <ClientPortalPanel.Root slug="x">
        <ClientPortalPanel.AccessRegistry items={[]} />
      </ClientPortalPanel.Root>
    );
    expect(container.querySelector('[data-slot="portal-access-registry"]')).toBeNull();
  });

  it('shows Bitwarden policy notice', () => {
    render(
      <ClientPortalPanel.Root slug="x">
        <ClientPortalPanel.AccessRegistry items={items} />
      </ClientPortalPanel.Root>
    );
    expect(screen.getByText(/nunca aparecen aquí/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Bitwarden/i).length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText(/nunca aparecen aquí/i)).toBeInTheDocument();
  });

  it('renders all status chips + contact CTA only for pending', () => {
    const { container } = render(
      <ClientPortalPanel.Root slug="x">
        <ClientPortalPanel.AccessRegistry items={items} />
      </ClientPortalPanel.Root>
    );
    expect(screen.getByText('Tienes acceso')).toBeInTheDocument();
    expect(screen.getByText('Pendiente')).toBeInTheDocument();
    expect(screen.getByText('Enviado vía Bitwarden')).toBeInTheDocument();
    expect(screen.getByText('No aplica')).toBeInTheDocument();
    // contact CTA only for pending
    const ctas = container.querySelectorAll('a[href="https://wa.me/51947633203"]');
    expect(ctas).toHaveLength(1);
  });

  it('sorts pending first', () => {
    const { container } = render(
      <ClientPortalPanel.Root slug="x">
        <ClientPortalPanel.AccessRegistry items={items} />
      </ClientPortalPanel.Root>
    );
    const rows = container.querySelectorAll('[data-slot="portal-access-row"]');
    expect(rows[0].getAttribute('data-status')).toBe('pending');
  });

  it('NEVER exposes credential value props — schema does not allow value/secret/password fields', () => {
    // Compile-time guard via type system; runtime guard via no rendered "password"/"secret" text.
    const { container } = render(
      <ClientPortalPanel.Root slug="x">
        <ClientPortalPanel.AccessRegistry items={items} />
      </ClientPortalPanel.Root>
    );
    expect(container.textContent?.toLowerCase()).not.toContain('password');
    expect(container.textContent?.toLowerCase()).not.toContain('secret');
  });
});

describe('ClientPortalPanel.OnboardingChecklist', () => {
  const items: ChecklistItem[] = [
    { title: 'Firmar contrato', owner: 'client', status: 'done', dueLabel: 'completado' },
    { title: 'Compartir accesos a Cloudflare', owner: 'client', status: 'pending', dueLabel: 'vence 24 may' },
    { title: 'Crear repos GitHub', owner: 'cofoundy', status: 'done' },
    { title: 'Habilitar dominio', owner: 'cofoundy', status: 'blocked', dueLabel: 'esperando DNS' },
  ];

  it('hides when empty', () => {
    const { container } = render(
      <ClientPortalPanel.Root slug="x">
        <ClientPortalPanel.OnboardingChecklist items={[]} />
      </ClientPortalPanel.Root>
    );
    expect(container.querySelector('[data-slot="portal-onboarding"]')).toBeNull();
  });

  it('summarizes done count', () => {
    render(
      <ClientPortalPanel.Root slug="x">
        <ClientPortalPanel.OnboardingChecklist items={items} />
      </ClientPortalPanel.Root>
    );
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText(/de 4 completados/)).toBeInTheDocument();
  });

  it('shows owner chips and status data attrs', () => {
    const { container } = render(
      <ClientPortalPanel.Root slug="x">
        <ClientPortalPanel.OnboardingChecklist items={items} />
      </ClientPortalPanel.Root>
    );
    expect(screen.getAllByText('tú')).toHaveLength(2);
    expect(screen.getAllByText('cofoundy')).toHaveLength(2);
    expect(container.querySelectorAll('[data-status="done"]')).toHaveLength(2);
    expect(container.querySelector('[data-status="blocked"]')).not.toBeNull();
  });
});

describe('ClientPortalPanel.ScheduleCTA', () => {
  it('renders message + person + CTA + fallback channels', () => {
    render(
      <ClientPortalPanel.Root slug="x">
        <ClientPortalPanel.ScheduleCTA
          personName="André Pacheco"
          personRole="CEO · Cofoundy"
          scheduleUrl="https://cal.cofoundy.dev/andre/meet"
          message="¿Necesitas hablar?"
          fallbacks={[
            { label: 'WhatsApp', value: '+51 947 633 203', href: 'https://wa.me/51947633203' },
            { label: 'Email', value: 'andre@cofoundy.dev', href: 'mailto:andre@cofoundy.dev' },
          ]}
        />
      </ClientPortalPanel.Root>
    );
    expect(screen.getByText('¿Necesitas hablar?')).toBeInTheDocument();
    expect(screen.getByText('André Pacheco')).toBeInTheDocument();
    expect(screen.getByText('Agenda una llamada')).toBeInTheDocument();
    expect(screen.getByText('+51 947 633 203')).toBeInTheDocument();
    expect(screen.getByText('andre@cofoundy.dev')).toBeInTheDocument();
  });

  it('uses custom CTA label when provided', () => {
    render(
      <ClientPortalPanel.Root slug="x">
        <ClientPortalPanel.ScheduleCTA
          personName="André"
          scheduleUrl="https://cal/x"
          ctaLabel="Quiero llamada"
        />
      </ClientPortalPanel.Root>
    );
    expect(screen.getByText('Quiero llamada')).toBeInTheDocument();
  });
});
