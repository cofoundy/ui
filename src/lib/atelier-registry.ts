// Atelier component registry — SSOT for the Atelier-flavored MDX allowlist
// shipped by `@cofoundy/ui` to docs-ai and downstream consumers.
//
// One static `Record` so:
//   1. TypeScript `satisfies` catches drift at compile time
//   2. The AGENTS.md generator (`scripts/gen-atelier-agents-md.ts`) reads
//      a single deterministic source
//   3. Consumers (e.g. `docs-ai/mdx-components.tsx`) wire all 9 components
//      with one spread.
//
// Per ceo-agent decisions (architecture-v1.md §7):
//   Q1 = B  → schemas access ONLY via `ATELIER_COMPONENTS[name].schema`.
//             Do NOT add named exports for individual schemas to `src/index.ts`.
//   Q2 = SKIP — 7 existing components keep inline styles this cycle.
//   Q3 = MANUAL — BuildProgress phase data is a manual snapshot in MDX.
//
// Order: alphabetical (diff stability). The 9 entries below are the registry
// contract surface — adding/removing requires a registry edit + AGENTS.md
// regeneration (CI gate `verify-agents-md.yml`).

import type { ComponentType } from 'react';
import type { ZodTypeAny } from 'zod';

import {
  BuildProgress,
  ComparisonMatrix,
  DesignSystemPanel,
  KPIBoard,
  MoodBoard,
  PersonaCard,
  QuoteCard,
  Sitemap,
  TestimonialCard,
} from '../components/docs';

import {
  buildProgressSchema,
  comparisonMatrixSchema,
  designSystemPanelSchema,
  kpiBoardSchema,
  moodBoardSchema,
  personaCardSchema,
  quoteCardSchema,
  sitemapSchema,
  testimonialCardSchema,
} from './atelier-schemas';

export interface AtelierEntry {
  /** React component rendered by the consumer's MDX provider. */
  component: ComponentType<any>;
  /**
   * Runtime Zod contract for the component's props. Consumers may call
   * `schema.parse(...)` for validation gates (e.g. artifact-render M1).
   * The Vitest type-match test guarantees parity with `interface XProps`.
   */
  schema: ZodTypeAny;
  /**
   * One-paragraph description surfaced verbatim into `AGENTS.md` for LLM
   * authoring guidance. Keep ≤200 chars.
   */
  description: string;
  /**
   * Canonical MDX example used by `AGENTS.md` and the generator's smoke
   * test (`schema.parse(example)` must succeed). Keep small but exercising
   * every patched-prop dimension.
   */
  example: Record<string, unknown>;
}

export const ATELIER_COMPONENTS = {
  BuildProgress: {
    component: BuildProgress,
    schema: buildProgressSchema,
    description:
      'Phased delivery timeline (L0-L9 phases, owner, dates) for cronograma/handoff docs. Manual snapshot of Vikunja state.',
    example: {
      steps: [
        {
          label: 'L1 — Discovery + Brief',
          status: 'done',
          phase: 'L1',
          owner: 'Andre',
          started_at: '2026-04-12',
          completed_at: '2026-04-18',
        },
        {
          label: 'L4 — UX Research',
          status: 'current',
          phase: 'L4',
          owner: 'Percy',
          started_at: '2026-05-02',
          vikunja_project_id: 22,
        },
        { label: 'L7 — Build + QA', status: 'pending', phase: 'L7', owner: 'Juan' },
      ],
    },
  },
  ComparisonMatrix: {
    component: ComparisonMatrix,
    schema: comparisonMatrixSchema,
    description:
      'Side-by-side trade-off table with per-cell traffic-light enum (green/yellow/red) and per-row provenance source.',
    example: {
      columns: ['Dirección A', 'Dirección B', 'Dirección C'],
      rows: [
        {
          feature: 'Academic feel',
          options: [
            { name: 'Dirección A', value: 'Strong', traffic_light: 'green' },
            { name: 'Dirección B', value: 'Mixed', traffic_light: 'yellow' },
            { name: 'Dirección C', value: 'Weak', traffic_light: 'red' },
          ],
          source: 'visual-design/DECISIONS.md',
        },
        {
          feature: 'Mobile perf budget',
          options: [
            { name: 'Dirección A', value: '95', highlight: true, traffic_light: 'green' },
            { name: 'Dirección B', value: '88', traffic_light: 'yellow' },
            { name: 'Dirección C', value: '92', traffic_light: 'green' },
          ],
        },
      ],
    },
  },
  DesignSystemPanel: {
    component: DesignSystemPanel,
    schema: designSystemPanelSchema,
    description:
      'Renders a brand direction (colors, typography, spacing, radius) with optional `direction` label for A/B comparison.',
    example: {
      direction: 'Emerald Academic',
      colors: [
        { name: 'Primary', value: '#0F5132', usage_note: 'Headlines + CTAs' },
        { name: 'Accent', value: '#E2B007', usage_note: 'Decorative only' },
      ],
      typography: [{ name: 'Display', family: 'Fraunces', sample: 'Aa' }],
      spacing: [{ name: 'md', value: '16px' }],
    },
  },
  KPIBoard: {
    component: KPIBoard,
    schema: kpiBoardSchema,
    description:
      'Grid of KPI tiles with value, trend, target, baseline, and provenance source. Use for delivery/marketing dashboards.',
    example: {
      kpis: [
        {
          label: 'Time-to-MQL',
          value: '36h',
          trend: { direction: 'down', value: '-12h' },
          target: '<48h',
          baseline: '60h (Q1)',
          status: 'good',
          source: 'docs/16-cro-plan.md',
        },
        { label: 'Cierres / mes', value: 3, target: '5', status: 'warn', baseline: '2 (Q1)' },
      ],
      columns: 3,
    },
  },
  MoodBoard: {
    component: MoodBoard,
    schema: moodBoardSchema,
    description:
      'Image grid for brand/visual concept exploration. Each item supports optional `source_url` (provenance) and `concept_tag` (A/B/C/D grouping).',
    example: {
      items: [
        { src: '/xgodel/concept-A.png', alt: 'Concept A — editorial', concept_tag: 'A', source_url: 'https://example.com/a' },
        { src: '/xgodel/concept-B.png', alt: 'Concept B — historic', concept_tag: 'B' },
        { src: '/xgodel/concept-C.png', alt: 'Concept C — premium', concept_tag: 'C' },
      ],
      columns: 3,
    },
  },
  PersonaCard: {
    component: PersonaCard,
    schema: personaCardSchema,
    description:
      'Target persona card with demographics, painPoints, goals, JTBD, objections, journeyStage, and provenance source.',
    example: {
      name: 'John Medina',
      role: 'Cofounder, XGodel',
      demographics: ['Lima, Peru', '32 años'],
      painPoints: ['Leads no calificados', 'Branding inconsistente'],
      goals: ['Cerrar 3 enterprise en Q3'],
      quote: 'Necesito que mi sitio refleje seriedad académica.',
      jtbd: 'Cuando un VC visita la landing, quiero que perciba rigor inmediato.',
      objections: ['No tenemos presupuesto este mes'],
      journeyStage: 'decision',
      age: '30-35',
      incomeRange: 'S/.12k-20k/mes',
      source: 'ux-research/02-user-personas.md',
    },
  },
  QuoteCard: {
    component: QuoteCard,
    schema: quoteCardSchema,
    description:
      'Itemized quote/cotización with milestones (hito), per-hito amounts, total, payment terms, and optional notes.',
    example: {
      client_name: 'XGodel',
      prepared_for: 'John Medina',
      valid_until: '2026-06-30',
      milestones: [
        { label: 'Hito 1 — Discovery + Brief', deliverable: 'Brief + Sitemap + Personas', amount: 'S/. 1,500', due: 'Semana 1' },
        { label: 'Hito 2 — Build', deliverable: 'Landing v1 + QA', amount: 'S/. 3,500', due: 'Semana 4' },
      ],
      total: 'S/. 5,000',
      payment_terms: '50% adelanto, 50% al aprobar Hito 2.',
      notes: 'Incluye revisiones ilimitadas hasta aprobación de cada hito.',
    },
  },
  Sitemap: {
    component: Sitemap,
    schema: sitemapSchema,
    description:
      'Hierarchical site map (collapsible tree) with optional intent and nav_group labels per node.',
    example: {
      nodes: [
        {
          path: '/',
          label: 'Home',
          intent: 'transactional',
          nav_group: 'primary',
          children: [
            { path: '/about', label: 'About', nav_group: 'primary' },
            { path: '/products', label: 'Products', intent: 'informational', nav_group: 'primary' },
          ],
        },
        { path: '/contact', label: 'Contact', nav_group: 'footer' },
      ],
      defaultExpanded: true,
      density: 'comfortable',
    },
  },
  TestimonialCard: {
    component: TestimonialCard,
    schema: testimonialCardSchema,
    description:
      'Single client testimonial with quote, author, role, optional avatar, and provenance source (sourceUrl).',
    example: {
      quote: 'Cofoundy lanzó nuestra landing en 2 semanas y triplicó nuestras MQL.',
      author: 'Cliente Demo',
      role: 'CEO, Demo SAC',
      source: 'Email — 2026-04-15',
    },
  },
} satisfies Record<string, AtelierEntry>;

/** Union of registry keys — useful for narrowing consumer code. */
export type AtelierComponentName = keyof typeof ATELIER_COMPONENTS;
