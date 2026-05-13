// Docs components — ported from docs-ai 2026-05-13
export { BuildProgress } from './BuildProgress';
export type { BuildProgressProps, BuildStep, StepStatus } from './BuildProgress';

export { ComparisonMatrix } from './ComparisonMatrix';
export type { ComparisonMatrixProps, ComparisonRow, ComparisonOption } from './ComparisonMatrix';

export { DesignSystemPanel } from './DesignSystemPanel';
export type { DesignSystemPanelProps, ColorToken, TypeToken } from './DesignSystemPanel';

export { InfoBox, InfoBoxRow } from './InfoBox';
export type { InfoBoxProps, InfoBoxRowProps } from './InfoBox';

export { KPIBoard } from './KPIBoard';
export type { KPIBoardProps, KPI } from './KPIBoard';

export { MetadataCard } from './MetadataCard';
export type { MetadataCardProps, MetadataItem } from './MetadataCard';

export { MoodBoard } from './MoodBoard';
export type { MoodBoardProps, MoodBoardItem } from './MoodBoard';

export { NextStepCallout } from './NextStepCallout';
export type { NextStepCalloutProps } from './NextStepCallout';

export { PersonaCard } from './PersonaCard';
export type { PersonaCardProps } from './PersonaCard';

// AuthorNote (was DocsPersonalNote) — renamed to avoid clash with the email
// template's PersonalNote, which is a different concept (full email layout).
export { AuthorNote } from './AuthorNote';
export type { AuthorNoteProps } from './AuthorNote';

export { ScopeList } from './ScopeList';
export type { ScopeListProps, ScopeItem, ScopeStatus } from './ScopeList';

export { TestimonialCard } from './TestimonialCard';
export type { TestimonialCardProps } from './TestimonialCard';
