import type { Meta, StoryObj } from '@storybook/react';
import { ClientPortalPanel } from '../../components/docs/ClientPortalPanel';
import type {
  PhaseNode,
  ApprovalItem,
  DocumentItem,
  MeetingItem,
  TaskColumn,
  MilestoneItem,
  GuideItem,
  DownloadItem,
  AccessEntry,
  ChecklistItem,
} from '../../components/docs/ClientPortalPanel.schema';

/* Composed stories for ClientPortalPanel (23 slots, v1 + v2).

   Four canonical compositions to dogfood per-stage layouts:
   1. XGodel-Full — every slot used (mid-build, paying client)
   2. XGodel-Onboarding — Approvals + OnboardingChecklist + Documents
   3. Acme-Mid-Build — Tasks + Milestones + Activity heavy
   4. Acme-Post-Launch — AccessRegistry + Guides + Downloads heavy

   Acme is generic; XGodel is the first real dogfood. */

const meta: Meta = {
  title: 'Docs/ClientPortalPanel',
  parameters: { layout: 'fullscreen' },
};
export default meta;
type Story = StoryObj;

/* ============================================================
   Shared sample data (used across stories)
   ============================================================ */
const xgodelPhases: PhaseNode[] = [
  { key: 'discovery', label: 'Discovery', status: 'done' },
  { key: 'design', label: 'Diseño', status: 'done' },
  { key: 'build', label: 'Construcción', status: 'current' },
  { key: 'launch', label: 'Lanzamiento', status: 'upcoming' },
  { key: 'handover', label: 'Entrega', status: 'upcoming' },
];

const xgodelApprovals: ApprovalItem[] = [
  {
    title: 'Aprobar copy del hero de la landing',
    what: 'Texto principal + sub-titular del home en xgodel.com. 3 variantes para revisar.',
    status: 'pending',
    url: 'https://example.com/copy-review',
    thumbnail: 'https://placehold.co/800x600/0F5132/F8F5EC/png?text=Hero+Copy',
    dueLabel: 'vence 22 may',
  },
  {
    title: 'Firmar cotización ampliada (módulo evaluaciones)',
    what: 'Diferencial sobre cotización original — $800 USD adicional.',
    status: 'pending',
    url: 'https://example.com/cot-v2',
    dueLabel: 'vence 24 may',
  },
  {
    title: 'Brand book v2 aprobado',
    status: 'approved',
    url: 'https://example.com/bb-v2',
    dueLabel: 'aprobado 14 may',
  },
  {
    title: 'Concept C (Minimal) descartado',
    status: 'rejected',
    url: 'https://example.com/concept-c',
  },
];

const xgodelDocuments: DocumentItem[] = [
  { type: 'quote', title: 'Cotización XGodel v3', url: '#', date: '01 may', status: 'Firmada', amount: '$3,000', thumbnail: 'https://placehold.co/600x800/F8F5EC/0F5132/png?text=Cot' },
  { type: 'quote', title: 'Cotización ampliación', url: '#', date: '12 may', status: 'Pendiente firma', amount: '$800' },
  { type: 'contract', title: 'Contrato MSA', url: '#', date: '03 may', status: 'Firmado', thumbnail: 'https://placehold.co/600x800/F8F5EC/1A1D1A/png?text=MSA' },
  { type: 'nda', title: 'NDA mutuo', url: '#', date: '01 may', status: 'Firmado' },
  { type: 'invoice', title: 'Factura F001-23', url: '#', date: '05 may', status: 'Pagada', amount: '$1,500' },
  { type: 'invoice', title: 'Factura F001-24', url: '#', date: '12 may', status: 'Pendiente pago', amount: '$900' },
];

const xgodelMeetings: MeetingItem[] = [
  {
    title: 'Review semanal — sprint 4',
    whenLabel: '22 may · 16:00',
    kind: 'upcoming',
    primaryUrl: 'https://cal.cofoundy.dev/andre/meet',
    primaryLabel: 'Calendario ↗',
    secondaryUrl: '#',
    secondaryLabel: 'Prep doc ↗',
    attendees: [
      { name: 'André' },
      { name: 'Ana XGodel' },
      { name: 'Diego XGodel' },
    ],
  },
  {
    title: 'Demo módulo evaluaciones',
    whenLabel: '14 may · 11:00',
    kind: 'past',
    primaryUrl: '#',
    primaryLabel: 'Grabación ↗',
    secondaryUrl: '#',
    secondaryLabel: 'Transcript ↗',
    attendees: [{ name: 'André' }, { name: 'Melissa' }, { name: 'Ana XGodel' }],
  },
  {
    title: 'Kickoff de proyecto',
    whenLabel: '01 may · 10:00',
    kind: 'past',
    primaryUrl: '#',
    primaryLabel: 'Grabación ↗',
    attendees: [{ name: 'André' }, { name: 'Ana XGodel' }, { name: 'Diego' }, { name: 'María' }],
  },
];

const xgodelTasks: TaskColumn[] = [
  { label: 'Backlog', count: 13, recent: [
    { title: 'Integración con Google Drive', column: 'Backlog', updatedHint: 'creado hace 3d' },
    { title: 'Diseño módulo certificados', column: 'Backlog', updatedHint: 'creado hace 5d' },
  ]},
  { label: 'En curso', count: 8, recent: [
    { title: 'Refactor de auth a JWT con refresh', column: 'En curso', updatedHint: 'hace 6h' },
    { title: 'Módulo de evaluaciones — corrección automática', column: 'En curso', updatedHint: 'hace 1d' },
    { title: 'Editor de cursos — drag & drop', column: 'En curso', updatedHint: 'hace 2d' },
  ]},
  { label: 'Hecho', count: 47, recent: [
    { title: 'Onboarding profesores', column: 'Hecho', updatedHint: 'cerrado hace 2d' },
    { title: 'Deploy de plataforma a prod', column: 'Hecho', updatedHint: 'cerrado hace 4d' },
  ]},
];

const xgodelMilestones: MilestoneItem[] = [
  { title: 'Brand book v2 entregado', status: 'done', date: '14 may', deliverableUrl: '#', deliverableLabel: 'Ver brand book ↗' },
  { title: 'Plataforma MVP live (interno)', status: 'done', date: '08 may', deliverableUrl: 'https://plataforma.xgodel.com', deliverableLabel: 'Ir al sitio ↗' },
  { title: 'Módulo evaluaciones', status: 'in-progress', date: 'ETA 28 may' },
  { title: 'Landing público (xgodel.com)', status: 'in-progress', date: 'ETA 02 jun' },
  { title: 'Lanzamiento público', status: 'pending', date: 'jun 2026' },
];

const xgodelGuides: GuideItem[] = [
  { title: 'Cómo crear tu primer curso', kind: 'video', url: '#', duration: '8 min' },
  { title: 'Setup inicial de profesores', kind: 'article', url: '#', duration: '5 min lectura' },
  { title: 'Configurar evaluaciones automáticas', kind: 'tutorial', url: '#', duration: '12 min' },
];

const xgodelDownloads: DownloadItem[] = [
  { title: 'Brand kit XGodel', url: '#', format: 'ZIP', size: '24 MB', description: 'Logos, tipografías, mockups.' },
  { title: 'Deck de inversores', url: '#', format: 'PDF', size: '4 MB' },
  { title: 'Logo en alta resolución', url: '#', format: 'PNG', size: '2 MB' },
];

const xgodelAccess: AccessEntry[] = [
  { system: 'Vikunja', status: 'granted', dateLabel: '01 may', note: 'rol: editor' },
  { system: 'Plataforma XGodel (admin)', status: 'granted', dateLabel: '08 may' },
  { system: 'Cloudflare DNS', status: 'bitwarden-send-issued', dateLabel: '14 may' },
  { system: 'Vercel (deploys)', status: 'pending', contactUrl: 'https://wa.me/51947633203', contactLabel: 'WhatsApp André' },
  { system: 'AWS S3 (backups)', status: 'not-applicable', note: 'gestionado por Cofoundy' },
];

const xgodelChecklist: ChecklistItem[] = [
  { title: 'Firmar contrato MSA', owner: 'client', status: 'done' },
  { title: 'Compartir accesos a Cloudflare DNS', owner: 'client', status: 'done' },
  { title: 'Confirmar dueños técnico + comercial', owner: 'client', status: 'done' },
  { title: 'Aprobar brand book v2', owner: 'client', status: 'done' },
  { title: 'Crear repos en GitHub', owner: 'cofoundy', status: 'done' },
  { title: 'Habilitar entorno staging', owner: 'cofoundy', status: 'done' },
  { title: 'Compartir cuentas de prueba con profesores', owner: 'client', status: 'pending', dueLabel: 'vence 24 may' },
  { title: 'Confirmar cuenta Stripe para checkout', owner: 'client', status: 'blocked', dueLabel: 'esperando docs SUNAT' },
];

/* ============================================================
   Story 1 — XGodel-Full (all 23 slots)
   ============================================================ */
export const XGodelFull: Story = {
  name: 'XGodel — Full (all 23 slots)',
  render: () => (
    <ClientPortalPanel.Root slug="xgodel" accentColor="#0F5132">
      <ClientPortalPanel.Hero
        category="XGodel · LMS Plataforma"
        projectName="XGodel"
        subtitle="Plataforma académica con LMS, evaluaciones automatizadas y landing público para captación."
        statusChip="Build · 78%"
        heroImage="https://placehold.co/1600x1000/0F5132/F8F5EC/png?text=plataforma.xgodel.com"
        heroUrl="plataforma.xgodel.com"
        heroUpdatedHint="hace 2d"
      />
      <ClientPortalPanel.Approvals items={xgodelApprovals} />
      <ClientPortalPanel.Phase percent={78} phases={xgodelPhases} nextMilestone="Lanzamiento jun 2026" />
      <ClientPortalPanel.Milestones items={xgodelMilestones} />
      <ClientPortalPanel.LiveSites
        sites={[
          { label: 'Plataforma', url: 'plataforma.xgodel.com', screenshot: 'https://placehold.co/1600x1000/0F5132/E2B007/png?text=Plataforma+LMS', updatedHint: 'hace 2d' },
          { label: 'Landing', url: 'xgodel.com', screenshot: 'https://placehold.co/1600x1000/F8F5EC/0F5132/png?text=xgodel.com', updatedHint: 'hace 5d' },
        ]}
      />
      <ClientPortalPanel.Brand
        palette={[
          { name: 'Primary', value: '#0F5132', usage: 'Titulares + CTAs primarios' },
          { name: 'Accent', value: '#E2B007', usage: 'Solo decorativo' },
          { name: 'Surface', value: '#F8F5EC', usage: 'Fondo de página' },
          { name: 'Ink', value: '#1A1D1A', usage: 'Texto principal' },
        ]}
        typography={[
          { slot: 'Display', family: 'Playfair Display', weight: '600', sample: 'XGodel Academia' },
          { slot: 'Body', family: 'Inter', weight: '400', sample: 'Educación con propósito' },
          { slot: 'Mono', family: 'JetBrains Mono', weight: '400', sample: 'const xgodel = true' },
        ]}
        brandBook={{ title: 'Brand Book — XGodel · v2', url: '#', thumbnail: 'https://placehold.co/1600x1000/F8F5EC/0F5132/png?text=Brand+Book', caption: '24 pp · 4.2 MB' }}
      />
      <ClientPortalPanel.Strategy
        proposal={{ title: 'Propuesta XGodel · v3', url: '#', thumbnail: 'https://placehold.co/900x1200/F8F5EC/0F5132/png?text=Propuesta', caption: '18 pp' }}
        personas={[
          { name: 'Ana, profesora universitaria', role: 'Crea y evalúa cursos', bio: 'Necesita un LMS que no requiera capacitación técnica.' },
          { name: 'Diego, estudiante de postgrado', role: 'Consume contenido', bio: 'Estudia desde móvil entre turnos laborales.' },
          { name: 'María, coordinadora académica', role: 'Supervisa cohortes' },
        ]}
        sitemap={[
          { label: 'Landing', children: [{ label: 'Cursos' }, { label: 'Sobre nosotros' }, { label: 'Contacto' }] },
          { label: 'Plataforma', children: [{ label: 'Dashboard' }, { label: 'Cursos' }, { label: 'Evaluaciones' }] },
        ]}
      />
      <ClientPortalPanel.Concepts
        concepts={[
          { label: 'A — Editorial', thumbnail: 'https://placehold.co/800x600/F8F5EC/0F5132/png?text=A' },
          { label: 'B — Academic', thumbnail: 'https://placehold.co/800x600/0F5132/E2B007/png?text=B', chosen: true },
          { label: 'C — Minimal', thumbnail: 'https://placehold.co/800x600/1A1D1A/F8F5EC/png?text=C' },
          { label: 'D — Vibrant', thumbnail: 'https://placehold.co/800x600/E2B007/0F5132/png?text=D' },
        ]}
      />
      <ClientPortalPanel.Tasks
        projectId={42}
        view="kanban"
        columns={xgodelTasks}
        projectUrl="https://vikunja.cofoundy.dev/projects/42"
      />
      <ClientPortalPanel.Build
        repos={[
          { name: 'xgodel-platform', url: '#', updatedHint: 'última actualización: hace 4h', deployUrl: '#' },
          { name: 'xgodel-landing', url: '#', updatedHint: 'última actualización: hace 5d', deployUrl: '#' },
        ]}
        stats={{ done: 47, inProgress: 8, backlog: 13 }}
        cronograma={{ title: 'Cronograma — XGodel', url: '#', thumbnail: 'https://placehold.co/1600x1000/F8F5EC/1A1D1A/png?text=Cronograma', caption: '4 sprints' }}
      />
      <ClientPortalPanel.Documents items={xgodelDocuments} />
      <ClientPortalPanel.Payments
        state={{ percentPaid: 80, amountLabel: '$2,400 / $3,000', nextMilestone: 'Lanzamiento — jun 2026' }}
        cotizacion={{ title: 'Cotización · XGodel', url: '#', thumbnail: 'https://placehold.co/900x1200/F8F5EC/0F5132/png?text=Cot', caption: '$3,000 USD' }}
      />
      <ClientPortalPanel.Meetings items={xgodelMeetings} />
      <ClientPortalPanel.OnboardingChecklist items={xgodelChecklist} />
      <ClientPortalPanel.AccessRegistry items={xgodelAccess} />
      <ClientPortalPanel.Guides items={xgodelGuides} />
      <ClientPortalPanel.Downloads items={xgodelDownloads} />
      <ClientPortalPanel.Activity
        items={[
          { date: '16 may', description: 'Deploy de plataforma.xgodel.com con módulo de evaluaciones.' },
          { date: '14 may', description: 'Brand Book v2 aprobado y publicado.' },
          { date: '12 may', description: 'Onboarding de cohorte de prueba (12 estudiantes).' },
          { date: '08 may', description: 'Cierre de sprint 3 — 8 tareas entregadas.' },
          { date: '02 may', description: 'Diseño de módulo de evaluaciones aprobado.' },
        ]}
      />
      <ClientPortalPanel.ScheduleCTA
        personName="André Pacheco"
        personRole="CEO · Cofoundy"
        scheduleUrl="https://cal.cofoundy.dev/andre/meet"
        message="¿Necesitas hablar sobre algún tema del proyecto?"
        fallbacks={[
          { label: 'WhatsApp', value: '+51 947 633 203', href: 'https://wa.me/51947633203' },
          { label: 'Email', value: 'andre@cofoundy.dev', href: 'mailto:andre@cofoundy.dev' },
        ]}
      />
      <ClientPortalPanel.Team
        members={[
          { name: 'André Pacheco', role: 'CEO · Estrategia' },
          { name: 'Melissa Iman', role: 'PMgineer' },
          { name: 'Percy', role: 'Design + Marketing' },
          { name: 'Juan Silva', role: 'Full Dev' },
        ]}
      />
    </ClientPortalPanel.Root>
  ),
};

/* ============================================================
   Story 2 — XGodel-Onboarding (early-stage, heavy onboarding)
   ============================================================ */
export const XGodelOnboarding: Story = {
  name: 'XGodel — Onboarding (early-stage)',
  render: () => (
    <ClientPortalPanel.Root slug="xgodel" accentColor="#0F5132">
      <ClientPortalPanel.Hero
        category="XGodel · LMS Plataforma"
        projectName="XGodel"
        subtitle="Estamos en los primeros pasos. Aquí lo que necesitamos de tu lado para arrancar bien."
        statusChip="Onboarding · semana 1"
      />
      <ClientPortalPanel.Approvals
        items={[
          {
            title: 'Firmar contrato MSA',
            what: 'Documento marco de la relación. Léelo con calma.',
            status: 'pending',
            url: '#',
            dueLabel: 'vence 20 may',
            ctaLabel: 'Revisar y firmar',
          },
          {
            title: 'Firmar NDA mutuo',
            what: 'Protección de información durante el proyecto.',
            status: 'pending',
            url: '#',
          },
        ]}
      />
      <ClientPortalPanel.OnboardingChecklist
        items={[
          { title: 'Firmar contrato MSA', owner: 'client', status: 'pending', dueLabel: 'vence 20 may' },
          { title: 'Firmar NDA mutuo', owner: 'client', status: 'pending' },
          { title: 'Pagar adelanto (50%)', owner: 'client', status: 'pending', dueLabel: 'vence 22 may' },
          { title: 'Compartir accesos a Cloudflare DNS', owner: 'client', status: 'pending' },
          { title: 'Confirmar dueños técnico + comercial', owner: 'client', status: 'done' },
          { title: 'Crear repos en GitHub', owner: 'cofoundy', status: 'done' },
          { title: 'Habilitar entorno staging', owner: 'cofoundy', status: 'blocked', dueLabel: 'esperando DNS' },
          { title: 'Setup Vikunja del proyecto', owner: 'cofoundy', status: 'done' },
        ]}
      />
      <ClientPortalPanel.Documents
        items={[
          { type: 'contract', title: 'Contrato MSA', url: '#', date: '17 may', status: 'Pendiente firma', thumbnail: 'https://placehold.co/600x800/F8F5EC/1A1D1A/png?text=MSA' },
          { type: 'nda', title: 'NDA mutuo', url: '#', date: '17 may', status: 'Pendiente firma' },
          { type: 'quote', title: 'Cotización XGodel v3', url: '#', date: '15 may', status: 'Firmada', amount: '$3,000' },
        ]}
      />
      <ClientPortalPanel.ScheduleCTA
        personName="André Pacheco"
        personRole="CEO · Cofoundy"
        scheduleUrl="https://cal.cofoundy.dev/andre/meet"
        message="¿Necesitas resolver algo antes de firmar?"
        fallbacks={[
          { label: 'WhatsApp', value: '+51 947 633 203', href: 'https://wa.me/51947633203' },
        ]}
      />
      <ClientPortalPanel.Team
        members={[
          { name: 'André Pacheco', role: 'CEO · Estrategia' },
          { name: 'Melissa Iman', role: 'PMgineer' },
        ]}
      />
    </ClientPortalPanel.Root>
  ),
};

/* ============================================================
   Story 3 — Acme-Mid-Build (generic client, mid-build heavy)
   ============================================================ */
const acmePhases: PhaseNode[] = [
  { key: 'discovery', label: 'Discovery', status: 'done' },
  { key: 'design', label: 'Diseño', status: 'done' },
  { key: 'build', label: 'Construcción', status: 'current' },
  { key: 'launch', label: 'Lanzamiento', status: 'upcoming' },
  { key: 'handover', label: 'Entrega', status: 'upcoming' },
];

export const AcmeMidBuild: Story = {
  name: 'Acme — Mid-Build (Tasks + Milestones)',
  render: () => (
    <ClientPortalPanel.Root slug="acme" accentColor="#7C3AED">
      <ClientPortalPanel.Hero
        category="Acme · Plataforma de pedidos"
        projectName="Acme Orders"
        subtitle="Sistema multi-tenant para gestión de pedidos en tiempo real."
        statusChip="Build · 62%"
        heroImage="https://placehold.co/1600x1000/7C3AED/F5F3FF/png?text=Acme+Orders"
        heroUrl="app.acme.example"
        heroUpdatedHint="hace 1d"
      />
      <ClientPortalPanel.Phase
        percent={62}
        phases={acmePhases}
        nextMilestone="MVP interno — 30 may"
      />
      <ClientPortalPanel.Milestones
        items={[
          { title: 'Arquitectura multi-tenant definida', status: 'done', date: '02 may', deliverableUrl: '#', deliverableLabel: 'Doc técnico ↗' },
          { title: 'Auth + roles implementados', status: 'done', date: '08 may', deliverableUrl: '#' },
          { title: 'API de pedidos v1', status: 'in-progress', date: 'ETA 24 may' },
          { title: 'Dashboard de admin', status: 'in-progress', date: 'ETA 27 may' },
          { title: 'Integración con POS', status: 'blocked', date: 'esperando docs vendor' },
          { title: 'Tests E2E', status: 'pending', date: 'jun 2026' },
        ]}
      />
      <ClientPortalPanel.Tasks
        projectId={88}
        view="kanban"
        columns={[
          {
            label: 'Backlog',
            count: 24,
            recent: [
              { title: 'Integración con POS de Square', column: 'Backlog' },
              { title: 'Reporte mensual de ventas', column: 'Backlog' },
            ],
          },
          {
            label: 'En curso',
            count: 5,
            recent: [
              { title: 'API de pedidos — endpoints CRUD', column: 'En curso', updatedHint: 'hace 2h' },
              { title: 'Dashboard admin — gráficos', column: 'En curso', updatedHint: 'hace 8h' },
              { title: 'Auth con OAuth Google', column: 'En curso', updatedHint: 'hace 1d' },
            ],
          },
          {
            label: 'Hecho',
            count: 31,
            recent: [
              { title: 'Modelo de datos definitivo', column: 'Hecho', updatedHint: 'cerrado hace 2d' },
              { title: 'Setup de CI/CD', column: 'Hecho', updatedHint: 'cerrado hace 3d' },
            ],
          },
        ]}
        projectUrl="https://vikunja.cofoundy.dev/projects/88"
      />
      <ClientPortalPanel.Build
        repos={[
          { name: 'acme-orders-api', url: '#', updatedHint: 'última actualización: hace 2h', deployUrl: 'https://api.acme.example' },
          { name: 'acme-orders-web', url: '#', updatedHint: 'última actualización: hace 6h', deployUrl: 'https://app.acme.example' },
          { name: 'acme-orders-mobile', url: '#', updatedHint: 'última actualización: hace 3d' },
        ]}
        stats={{ done: 31, inProgress: 5, backlog: 24 }}
      />
      <ClientPortalPanel.Activity
        items={[
          { date: '19 may', description: 'Endpoint /orders/create funcional en staging.' },
          { date: '18 may', description: 'Dashboard admin: gráfico de ventas semanal lista.' },
          { date: '17 may', description: 'Migración a Postgres 16 sin downtime.' },
          { date: '16 may', description: 'Setup CI/CD con GitHub Actions completo.' },
          { date: '14 may', description: 'Modelo de datos final aprobado por equipo Acme.' },
          { date: '12 may', description: 'Cierre de sprint 2.' },
        ]}
      />
      <ClientPortalPanel.Meetings
        items={[
          {
            title: 'Sync semanal — sprint 3',
            whenLabel: '22 may · 14:00',
            kind: 'upcoming',
            primaryUrl: '#',
          },
          {
            title: 'Demo MVP interno',
            whenLabel: '15 may · 11:00',
            kind: 'past',
            primaryUrl: '#',
            secondaryUrl: '#',
          },
        ]}
      />
      <ClientPortalPanel.Team
        members={[
          { name: 'André Pacheco', role: 'CEO · Estrategia' },
          { name: 'Juan Silva', role: 'Full Dev' },
          { name: 'Melissa Iman', role: 'PMgineer' },
        ]}
      />
    </ClientPortalPanel.Root>
  ),
};

/* ============================================================
   Story 4 — Acme-Post-Launch (handover heavy)
   ============================================================ */
const acmeLaunchedPhases: PhaseNode[] = [
  { key: 'discovery', label: 'Discovery', status: 'done' },
  { key: 'design', label: 'Diseño', status: 'done' },
  { key: 'build', label: 'Construcción', status: 'done' },
  { key: 'launch', label: 'Lanzamiento', status: 'done' },
  { key: 'handover', label: 'Entrega', status: 'current' },
];

export const AcmePostLaunch: Story = {
  name: 'Acme — Post-Launch (AccessRegistry + Guides + Downloads)',
  render: () => (
    <ClientPortalPanel.Root slug="acme" accentColor="#7C3AED">
      <ClientPortalPanel.Hero
        category="Acme · Plataforma de pedidos"
        projectName="Acme Orders"
        subtitle="Plataforma en producción desde abril. Handover en curso — todo lo que necesitas para operarla."
        statusChip="Live · v1.2"
        heroImage="https://placehold.co/1600x1000/7C3AED/F5F3FF/png?text=app.acme.example+%E2%97%8F+LIVE"
        heroUrl="app.acme.example"
        heroUpdatedHint="hace 1d"
      />
      <ClientPortalPanel.Phase
        percent={97}
        phases={acmeLaunchedPhases}
        nextMilestone="Handover técnico completo — 31 may"
      />
      <ClientPortalPanel.AccessRegistry
        items={[
          { system: 'Vikunja (PM)', status: 'granted', dateLabel: '01 may', note: 'rol: admin' },
          { system: 'Dashboard admin Acme', status: 'granted', dateLabel: '12 may' },
          { system: 'Repos GitHub (read)', status: 'granted', dateLabel: '03 may' },
          { system: 'Vercel (deploys)', status: 'bitwarden-send-issued', dateLabel: '18 may', note: 'token compartido por WhatsApp' },
          { system: 'Postgres (managed)', status: 'bitwarden-send-issued', dateLabel: '18 may' },
          { system: 'Stripe (dashboard)', status: 'pending', contactUrl: 'https://wa.me/51947633203', contactLabel: 'WhatsApp André' },
          { system: 'Sentry (errores)', status: 'pending', contactUrl: 'mailto:andre@cofoundy.dev', contactLabel: 'Email' },
          { system: 'AWS S3 (backups)', status: 'not-applicable', note: 'gestionado por Cofoundy hasta fin de handover' },
        ]}
      />
      <ClientPortalPanel.Guides
        items={[
          { title: 'Cómo gestionar usuarios y roles', kind: 'video', url: '#', duration: '6 min', thumbnail: 'https://placehold.co/800x500/7C3AED/F5F3FF/png?text=Video' },
          { title: 'Manejo de pedidos en tiempo real', kind: 'tutorial', url: '#', duration: '15 min', thumbnail: 'https://placehold.co/800x500/F5F3FF/7C3AED/png?text=Tutorial' },
          { title: 'Setup de nuevos tenants', kind: 'article', url: '#', duration: '8 min lectura' },
          { title: 'Integración con POS — guía', kind: 'article', url: '#', duration: '12 min lectura' },
          { title: 'Reportes y métricas', kind: 'video', url: '#', duration: '10 min', thumbnail: 'https://placehold.co/800x500/7C3AED/F5F3FF/png?text=Reportes' },
        ]}
      />
      <ClientPortalPanel.Downloads
        items={[
          { title: 'Brand kit Acme', url: '#', format: 'ZIP', size: '32 MB', description: 'Logos, paleta, tipografías, mockups.' },
          { title: 'Documentación técnica completa', url: '#', format: 'PDF', size: '8 MB', description: 'Arquitectura, APIs, deployment.' },
          { title: 'Runbook operacional', url: '#', format: 'PDF', size: '3 MB' },
          { title: 'Backup de base de datos (snapshot)', url: '#', format: 'SQL', size: '180 MB' },
          { title: 'Diagramas de arquitectura', url: '#', format: 'PNG', size: '4 MB' },
        ]}
      />
      <ClientPortalPanel.Documents
        items={[
          { type: 'contract', title: 'Contrato MSA', url: '#', date: '01 may', status: 'Firmado' },
          { type: 'contract', title: 'Anexo handover', url: '#', date: '15 may', status: 'Firmado' },
          { type: 'invoice', title: 'Factura F002-15', url: '#', date: '15 may', amount: '$5,000', status: 'Pagada' },
          { type: 'invoice', title: 'Factura F002-16 (handover)', url: '#', date: '18 may', amount: '$1,200', status: 'Pendiente pago' },
        ]}
      />
      <ClientPortalPanel.Activity
        items={[
          { date: '18 may', description: 'Tokens de Vercel y Postgres compartidos vía Bitwarden Send.' },
          { date: '15 may', description: 'Documentación técnica publicada.' },
          { date: '12 may', description: 'Dashboard admin entregado al equipo Acme.' },
          { date: '08 may', description: 'Lanzamiento público de app.acme.example.' },
        ]}
      />
      <ClientPortalPanel.ScheduleCTA
        personName="André Pacheco"
        personRole="CEO · Cofoundy"
        scheduleUrl="https://cal.cofoundy.dev/andre/long-meet"
        message="¿Algo del handover que quieras revisar en vivo?"
        fallbacks={[
          { label: 'WhatsApp', value: '+51 947 633 203', href: 'https://wa.me/51947633203' },
          { label: 'Email', value: 'andre@cofoundy.dev', href: 'mailto:andre@cofoundy.dev' },
        ]}
      />
      <ClientPortalPanel.Team
        members={[
          { name: 'André Pacheco', role: 'CEO · Estrategia' },
          { name: 'Juan Silva', role: 'Full Dev' },
        ]}
      />
    </ClientPortalPanel.Root>
  ),
};

/* ============================================================
   Story 5 — Minimal (early kickoff, very few slots)
   ============================================================ */
export const Minimal: Story = {
  name: 'Minimal — Hero + Phase + Team only',
  render: () => (
    <ClientPortalPanel.Root slug="early-client">
      <ClientPortalPanel.Hero
        category="Cliente · MVP"
        projectName="Proyecto en kickoff"
        subtitle="Discovery completado; pasamos a diseño esta semana."
        statusChip="Discovery · 100%"
      />
      <ClientPortalPanel.Phase
        percent={15}
        phases={[
          { key: 'discovery', label: 'Discovery', status: 'done' },
          { key: 'design', label: 'Diseño', status: 'current' },
          { key: 'build', label: 'Construcción', status: 'upcoming' },
          { key: 'launch', label: 'Lanzamiento', status: 'upcoming' },
          { key: 'handover', label: 'Entrega', status: 'upcoming' },
        ]}
        nextMilestone="Concepts iniciales — 25 may"
      />
      <ClientPortalPanel.Team
        members={[
          { name: 'André Pacheco', role: 'CEO · Estrategia' },
          { name: 'Melissa Iman', role: 'PMgineer' },
        ]}
      />
    </ClientPortalPanel.Root>
  ),
};

/* ============================================================
   Story 6 — Light theme variant (XGodel-Full chrome=light)
   ============================================================ */
export const LightTheme: Story = {
  name: 'Light theme — XGodel-Full',
  parameters: { backgrounds: { default: 'light' } },
  decorators: [
    (StoryFn) => (
      <div data-theme="light" style={{ background: '#ffffff', minHeight: '100vh' }}>
        <StoryFn />
      </div>
    ),
  ],
  render: () => (
    <ClientPortalPanel.Root slug="xgodel" accentColor="#0F5132">
      <ClientPortalPanel.Hero
        category="XGodel · LMS Plataforma"
        projectName="XGodel"
        subtitle="Plataforma académica con LMS y landing público."
        statusChip="Build · 78%"
        heroImage="https://placehold.co/1600x1000/0F5132/F8F5EC/png?text=plataforma.xgodel.com"
        heroUrl="plataforma.xgodel.com"
        heroUpdatedHint="hace 2d"
      />
      <ClientPortalPanel.Approvals items={xgodelApprovals} />
      <ClientPortalPanel.Phase percent={78} phases={xgodelPhases} nextMilestone="Lanzamiento jun 2026" />
      <ClientPortalPanel.Brand
        palette={[
          { name: 'Primary', value: '#0F5132', usage: 'Titulares + CTAs' },
          { name: 'Accent', value: '#E2B007', usage: 'Solo decorativo' },
          { name: 'Surface', value: '#F8F5EC', usage: 'Fondo de página' },
          { name: 'Ink', value: '#1A1D1A', usage: 'Texto principal' },
        ]}
      />
      <ClientPortalPanel.AccessRegistry items={xgodelAccess} />
      <ClientPortalPanel.ScheduleCTA
        personName="André Pacheco"
        personRole="CEO · Cofoundy"
        scheduleUrl="https://cal.cofoundy.dev/andre/meet"
        message="¿Necesitas hablar?"
      />
    </ClientPortalPanel.Root>
  ),
};
