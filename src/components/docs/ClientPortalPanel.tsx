import { Root } from './client-portal/Root';
import { Hero } from './client-portal/Hero';
import { Phase } from './client-portal/Phase';
import { LiveSites } from './client-portal/LiveSites';
import { Brand } from './client-portal/Brand';
import { Strategy } from './client-portal/Strategy';
import { Concepts } from './client-portal/Concepts';
import { Build } from './client-portal/Build';
import { Payments } from './client-portal/Payments';
import { Activity } from './client-portal/Activity';
import { Team } from './client-portal/Team';
// v2 slots
import { Approvals } from './client-portal/Approvals';
import { Documents } from './client-portal/Documents';
import { Meetings } from './client-portal/Meetings';
import { Tasks } from './client-portal/Tasks';
import { Milestones } from './client-portal/Milestones';
import { Guides } from './client-portal/Guides';
import { Downloads } from './client-portal/Downloads';
import { AccessRegistry } from './client-portal/AccessRegistry';
import { OnboardingChecklist } from './client-portal/OnboardingChecklist';
import { ScheduleCTA } from './client-portal/ScheduleCTA';

/* ============================================================
   ClientPortalPanel — namespaced compound component
   ============================================================
   23 slots total: 13 v1 + 10 v2 library extension.

   Usage:
     <ClientPortalPanel.Root slug="…" accentColor="#…">
       <ClientPortalPanel.Hero … />
       <ClientPortalPanel.Approvals items={…} />
       … pick whichever slots apply per client.
     </ClientPortalPanel.Root>

   Slot composition IS the per-portal craft. Sections without
   data render `null`. Theme inherits from chrome via
   [data-theme]; per-client accent via --portal-accent.
   ============================================================ */

export const ClientPortalPanel = {
  Root,
  // v1
  Hero,
  Phase,
  LiveSites,
  Brand,
  Strategy,
  Concepts,
  Build,
  Payments,
  Activity,
  Team,
  // v2
  Approvals,
  Documents,
  Meetings,
  Tasks,
  Milestones,
  Guides,
  Downloads,
  AccessRegistry,
  OnboardingChecklist,
  ScheduleCTA,
};

// Named exports for tree-shaking-friendly imports.
export {
  Root as ClientPortalPanelRoot,
  // v1
  Hero as ClientPortalHero,
  Phase as ClientPortalPhase,
  LiveSites as ClientPortalLiveSites,
  Brand as ClientPortalBrand,
  Strategy as ClientPortalStrategy,
  Concepts as ClientPortalConcepts,
  Build as ClientPortalBuild,
  Payments as ClientPortalPayments,
  Activity as ClientPortalActivity,
  Team as ClientPortalTeam,
  // v2
  Approvals as ClientPortalApprovals,
  Documents as ClientPortalDocuments,
  Meetings as ClientPortalMeetings,
  Tasks as ClientPortalTasks,
  Milestones as ClientPortalMilestones,
  Guides as ClientPortalGuides,
  Downloads as ClientPortalDownloads,
  AccessRegistry as ClientPortalAccessRegistry,
  OnboardingChecklist as ClientPortalOnboardingChecklist,
  ScheduleCTA as ClientPortalScheduleCTA,
};
