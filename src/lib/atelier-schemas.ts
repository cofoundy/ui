// Atelier schemas barrel — package-internal re-export of all 9 per-component
// Zod schemas. Consumed by `atelier-registry.ts` only.
//
// Per ceo-agent Q1=B (architecture-v1.md §7): individual schemas are NOT
// publicly named-exported from `@cofoundy/ui`. Consumers go through
// `ATELIER_COMPONENTS[name].schema`. Promote on real consumer ask.
//
// Auto-edited by /atelier; manual edits welcome — keep alphabetical.

export { buildProgressSchema, type BuildProgressInput } from '../components/docs/BuildProgress.schema';
export { comparisonMatrixSchema, type ComparisonMatrixInput } from '../components/docs/ComparisonMatrix.schema';
export { designSystemPanelSchema, type DesignSystemPanelInput } from '../components/docs/DesignSystemPanel.schema';
export { kpiBoardSchema, type KPIBoardInput } from '../components/docs/KPIBoard.schema';
export { moodBoardSchema, type MoodBoardInput } from '../components/docs/MoodBoard.schema';
export { personaCardSchema, type PersonaCardInput } from '../components/docs/PersonaCard.schema';
export { quoteCardSchema, type QuoteCardInput } from '../components/docs/QuoteCard.schema';
export { sitemapSchema, type SitemapInput } from '../components/docs/Sitemap.schema';
export { testimonialCardSchema, type TestimonialCardInput } from '../components/docs/TestimonialCard.schema';
