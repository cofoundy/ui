// Docs components — ported from docs-ai 2026-05-13
export { BuildProgress } from './BuildProgress';
export type { BuildProgressProps, BuildStep, StepStatus, BuildPhase } from './BuildProgress';

export { ComparisonMatrix } from './ComparisonMatrix';
export type { ComparisonMatrixProps, ComparisonRow, ComparisonOption, TrafficLight } from './ComparisonMatrix';

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
export type { PersonaCardProps, JourneyStage } from './PersonaCard';

// NEW Atelier components (2026-05-16, T-002)
export { Sitemap, sitemapVariants } from './Sitemap';
export type { SitemapProps, SitemapNode } from './Sitemap';

export { QuoteCard, quoteCardVariants } from './QuoteCard';
export type { QuoteCardProps, QuoteMilestone } from './QuoteCard';

// AuthorNote (was DocsPersonalNote) — renamed to avoid clash with the email
// template's PersonalNote, which is a different concept (full email layout).
export { AuthorNote } from './AuthorNote';
export type { AuthorNoteProps } from './AuthorNote';

export { ScopeList } from './ScopeList';
export type { ScopeListProps, ScopeItem, ScopeStatus } from './ScopeList';

export { TestimonialCard } from './TestimonialCard';
export type { TestimonialCardProps } from './TestimonialCard';

// ClientPortalPanel — slot-composable client dashboard (2026-05-18, T-003)
export {
  ClientPortalPanel,
  ClientPortalPanelRoot,
  ClientPortalHero,
  ClientPortalPhase,
  ClientPortalLiveSites,
  ClientPortalBrand,
  ClientPortalStrategy,
  ClientPortalConcepts,
  ClientPortalBuild,
  ClientPortalPayments,
  ClientPortalActivity,
  ClientPortalTeam,
} from './ClientPortalPanel';
export type {
  ClientPortalPanelRootProps,
  PortalHeroProps,
  PortalPhaseProps,
  PortalLiveSitesProps,
  PortalBrandProps,
  PortalStrategyProps,
  PortalConceptsProps,
  PortalBuildProps,
  PortalPaymentsProps,
  PortalActivityProps,
  PortalTeamProps,
  PhaseKey,
  PhaseNode,
  LiveSiteEntry,
  PaletteChip,
  TypeSpecimen,
  PersonaEntry,
  ConceptEntry,
  RepoEntry,
  BuildStats,
  ArtifactRef,
  PaymentState,
  ActivityEntry,
  TeamMember,
} from './ClientPortalPanel.schema';

// ClientPortalPanel v2 (library extension, 2026-05-19) — 10 new slots
export {
  ClientPortalApprovals,
  ClientPortalDocuments,
  ClientPortalMeetings,
  ClientPortalTasks,
  ClientPortalMilestones,
  ClientPortalGuides,
  ClientPortalDownloads,
  ClientPortalAccessRegistry,
  ClientPortalOnboardingChecklist,
  ClientPortalScheduleCTA,
} from './ClientPortalPanel';
export type {
  // v2 schemas
  PortalApprovalsProps,
  ApprovalItem,
  ApprovalStatus,
  PortalDocumentsProps,
  DocumentItem,
  DocumentType,
  PortalMeetingsProps,
  MeetingItem,
  MeetingAttendee,
  PortalTasksProps,
  TaskItem,
  TaskColumn,
  PortalMilestonesProps,
  MilestoneItem,
  MilestoneStatus,
  PortalGuidesProps,
  GuideItem,
  GuideKind,
  PortalDownloadsProps,
  DownloadItem,
  PortalAccessRegistryProps,
  AccessEntry,
  AccessStatus,
  PortalOnboardingChecklistProps,
  ChecklistItem,
  ChecklistStatus,
  ChecklistOwner,
  PortalScheduleCTAProps,
  ScheduleFallback,
} from './ClientPortalPanel.schema';
