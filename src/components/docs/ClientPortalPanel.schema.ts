import * as React from 'react';

/* ============================================================
   ClientPortalPanel — shared schemas
   ============================================================
   Slot-composable client portal. Each subcomponent is rendered
   conditionally; sections without data render `null`.

   Reuse: XGodel (first), Frutvitas, Callejón, Lorena pharma.
   Per-client visual identity: `accentColor` prop on Root
   hydrates `--portal-accent` CSS variable.
   ============================================================ */

export type PhaseKey = 'discovery' | 'design' | 'build' | 'launch' | 'handover';

export interface PhaseNode {
  key: PhaseKey;
  label: string;
  status: 'done' | 'current' | 'upcoming';
}

export interface LiveSiteEntry {
  /** Display label for the site (e.g. "Landing", "Plataforma"). */
  label: string;
  /** Public URL — the card is clickable. */
  url: string;
  /** Static screenshot URL/path. If absent, a muted "soon" tile is shown. */
  screenshot?: string;
  /** Optional human-friendly freshness label, e.g. "hace 2d". */
  updatedHint?: string;
}

export interface PaletteChip {
  /** Display name (e.g. "Primary", "Surface"). */
  name: string;
  /** Hex or token value used as the swatch fill (always raw CSS for the swatch). */
  value: string;
  /** Short usage note (italic caption). */
  usage?: string;
}

export interface TypeSpecimen {
  /** Slot label (e.g. "Display", "Body", "Mono"). */
  slot: string;
  /** CSS family name. */
  family: string;
  /** Optional weight. */
  weight?: string;
  /** Sample to render — defaults to "Aa Bb Cc". */
  sample?: string;
}

export interface PersonaEntry {
  name: string;
  role: string;
  /** Optional avatar URL. */
  avatar?: string;
  /** Optional bio — kept short, single-line preferred. */
  bio?: string;
}

export interface ConceptEntry {
  label: string;
  /** Thumbnail image URL. */
  thumbnail: string;
  /** Whether this is the chosen final direction. */
  chosen?: boolean;
}

export interface RepoEntry {
  name: string;
  /** Repo URL (clickable). */
  url: string;
  /** Human-friendly last-activity label (e.g. "última actualización: hace 2d"). */
  updatedHint?: string;
  /** Optional deploy URL. */
  deployUrl?: string;
}

export interface BuildStats {
  done: number;
  inProgress: number;
  backlog: number;
}

export interface ArtifactRef {
  /** Display title (e.g. "Brand Book — XGodel · v2"). */
  title: string;
  /** Public link. */
  url: string;
  /** Thumbnail image URL (PDF first-page preview). */
  thumbnail?: string;
  /** Optional caption (e.g. "12 páginas · 2.4 MB"). */
  caption?: string;
}

export interface PaymentState {
  /** 0-100. */
  percentPaid: number;
  /** Currency-formatted display (e.g. "$2,400 / $3,000"). */
  amountLabel?: string;
  /** Next milestone description. */
  nextMilestone?: string;
}

export interface ActivityEntry {
  /** Already-formatted date label (e.g. "16 may"). */
  date: string;
  /** One-line description. */
  description: string;
}

export interface TeamMember {
  name: string;
  role: string;
  avatar?: string;
}

/* ----- Root ----- */
export interface ClientPortalPanelRootProps {
  /** Client slug, used for data-attr + analytics. */
  slug: string;
  /** Per-client brand accent color (hex or CSS color). Hydrates --portal-accent. */
  accentColor?: string;
  /** Optional override for display font (rare; per-client brand). */
  displayFont?: string;
  children: React.ReactNode;
}

/* ----- Section: Hero ----- */
export interface PortalHeroProps {
  /** Short category eyebrow (e.g. "LMS Plataforma"). */
  category?: string;
  /** Project name (display). */
  projectName: string;
  /** One-line subtitle (serif italic). */
  subtitle?: string;
  /** Status chip (e.g. "Build · 78%"). */
  statusChip?: string;
  /** Primary live screenshot to feature in the hero. */
  heroImage?: string;
  /** Public URL caption under the image. */
  heroUrl?: string;
  /** Freshness label (e.g. "hace 2d"). */
  heroUpdatedHint?: string;
}

/* ----- Section: Phase ----- */
export interface PortalPhaseProps {
  /** Whole-project percent complete (0-100). */
  percent: number;
  /** Ordered phase nodes. */
  phases: PhaseNode[];
  /** Optional next-milestone label (serif italic). */
  nextMilestone?: string;
}

/* ----- Section: LiveSites ----- */
export interface PortalLiveSitesProps {
  /** Heading override (default "Dónde vive el sitio"). */
  heading?: string;
  sites: LiveSiteEntry[];
}

/* ----- Section: Brand ----- */
export interface PortalBrandProps {
  heading?: string;
  palette?: PaletteChip[];
  typography?: TypeSpecimen[];
  brandBook?: ArtifactRef;
}

/* ----- Section: Strategy ----- */
export interface PortalStrategyProps {
  heading?: string;
  proposal?: ArtifactRef;
  personas?: PersonaEntry[];
  /** Optional sitemap as an array of section labels (rendered as a minimal tree). */
  sitemap?: { label: string; children?: { label: string }[] }[];
}

/* ----- Section: Concepts ----- */
export interface PortalConceptsProps {
  heading?: string;
  concepts: ConceptEntry[];
}

/* ----- Section: Build ----- */
export interface PortalBuildProps {
  heading?: string;
  repos?: RepoEntry[];
  stats?: BuildStats;
  cronograma?: ArtifactRef;
}

/* ----- Section: Payments ----- */
export interface PortalPaymentsProps {
  heading?: string;
  state: PaymentState;
  cotizacion?: ArtifactRef;
}

/* ----- Section: Activity ----- */
export interface PortalActivityProps {
  heading?: string;
  /** Most recent first; component caps at 6. */
  items: ActivityEntry[];
}

/* ----- Section: Team ----- */
export interface PortalTeamProps {
  heading?: string;
  members: TeamMember[];
}

/* ============================================================
   v2 schemas (library extension) — 10 new slots
   ============================================================ */

/* ----- Section: Approvals ----- */
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface ApprovalItem {
  /** Human title of what needs sign-off (e.g. "Aprobar copy del hero"). */
  title: string;
  /** Short single-line context (what + why). */
  what?: string;
  /** Status — drives chip color + sort order (pending first). */
  status: ApprovalStatus;
  /** Optional thumbnail (artifact preview). */
  thumbnail?: string;
  /** Action URL — opens the artifact to review. */
  url: string;
  /** CTA label (default "Revisar"). */
  ctaLabel?: string;
  /** Deadline as already-formatted label (e.g. "vence 22 may"). */
  dueLabel?: string;
}

export interface PortalApprovalsProps {
  heading?: string;
  items: ApprovalItem[];
}

/* ----- Section: Documents ----- */
export type DocumentType = 'quote' | 'contract' | 'nda' | 'invoice' | 'other';

export interface DocumentItem {
  type: DocumentType;
  title: string;
  url: string;
  /** Already-formatted date (e.g. "12 may 2026"). */
  date?: string;
  /** Human-readable status (e.g. "Firmado", "Pendiente firma"). */
  status?: string;
  /** Currency-formatted amount label (invoices/quotes). */
  amount?: string;
  /** PDF cover thumbnail. */
  thumbnail?: string;
}

export interface PortalDocumentsProps {
  heading?: string;
  items: DocumentItem[];
  /** Override default group order. Default: quote, contract, nda, invoice, other. */
  groupOrder?: DocumentType[];
}

/* ----- Section: Meetings ----- */
export interface MeetingAttendee {
  name: string;
  avatar?: string;
}

export interface MeetingItem {
  title: string;
  /** Already-formatted timestamp (e.g. "22 may · 16:00"). */
  whenLabel: string;
  /** Determines section (upcoming above past). */
  kind: 'upcoming' | 'past';
  /** Cal/Calendar URL for upcoming; recording URL for past. */
  primaryUrl?: string;
  primaryLabel?: string;
  /** Secondary URL — prep doc (upcoming) or transcript (past). */
  secondaryUrl?: string;
  secondaryLabel?: string;
  attendees?: MeetingAttendee[];
}

export interface PortalMeetingsProps {
  heading?: string;
  items: MeetingItem[];
}

/* ----- Section: Tasks (Vikunja snapshot) ----- */
export interface TaskItem {
  title: string;
  /** Vikunja column label (e.g. "Hecho", "En curso", "Backlog"). */
  column: string;
  /** Optional already-formatted updated label. */
  updatedHint?: string;
}

export interface TaskColumn {
  label: string;
  count: number;
  /** Top N recent tasks in this column (component caps at 4). */
  recent?: TaskItem[];
}

export interface PortalTasksProps {
  heading?: string;
  /** Hardcoded Vikunja v1 project ID (display only). */
  projectId: number;
  /** "kanban" = horizontal columns; "list" = single grouped list. */
  view?: 'kanban' | 'list';
  columns: TaskColumn[];
  /** Optional Vikunja project URL — opens full board. */
  projectUrl?: string;
}

/* ----- Section: Milestones ----- */
export type MilestoneStatus = 'done' | 'in-progress' | 'pending' | 'blocked';

export interface MilestoneItem {
  title: string;
  /** Already-formatted date label (e.g. "14 may 2026"). */
  date?: string;
  status: MilestoneStatus;
  /** Optional deliverable URL — only shown when status=done. */
  deliverableUrl?: string;
  deliverableLabel?: string;
}

export interface PortalMilestonesProps {
  heading?: string;
  items: MilestoneItem[];
}

/* ----- Section: Guides ----- */
export type GuideKind = 'video' | 'article' | 'tutorial';

export interface GuideItem {
  title: string;
  kind: GuideKind;
  url: string;
  /** Human-readable duration (e.g. "8 min", "5 min lectura"). */
  duration?: string;
  /** Optional preview/thumbnail. */
  thumbnail?: string;
}

export interface PortalGuidesProps {
  heading?: string;
  items: GuideItem[];
}

/* ----- Section: Downloads ----- */
export interface DownloadItem {
  title: string;
  url: string;
  /** Format chip label (e.g. "ZIP", "PDF", "PNG"). */
  format: string;
  /** Human-readable size (e.g. "12 MB"). */
  size?: string;
  /** Optional short description. */
  description?: string;
}

export interface PortalDownloadsProps {
  heading?: string;
  items: DownloadItem[];
}

/* ----- Section: AccessRegistry -----
   STRICT: this is an INVENTORY of system access status.
   NEVER contains credential values. No password/secret fields.
   Credentials flow via Bitwarden Send out-of-band (WhatsApp/email).
   ============================================================ */
export type AccessStatus =
  | 'granted'              // tienes acceso
  | 'bitwarden-send-issued' // enviado via bitwarden send (TTL/single-fetch)
  | 'pending'               // pendiente — falta acción
  | 'not-applicable';       // no aplica

export interface AccessEntry {
  /** System name (e.g. "Vikunja", "Vercel", "Cloudflare"). */
  system: string;
  status: AccessStatus;
  /** Optional already-formatted date when granted/issued. */
  dateLabel?: string;
  /** Optional contact CTA URL for pending items (e.g. WhatsApp link, mailto). */
  contactUrl?: string;
  /** Optional CTA label (default "Contactar"). */
  contactLabel?: string;
  /** Optional short note (e.g. "rol: editor"). */
  note?: string;
}

export interface PortalAccessRegistryProps {
  heading?: string;
  /** Items render in pending-first order regardless of input order. */
  items: AccessEntry[];
}

/* ----- Section: OnboardingChecklist ----- */
export type ChecklistStatus = 'done' | 'pending' | 'blocked';
export type ChecklistOwner = 'client' | 'cofoundy';

export interface ChecklistItem {
  title: string;
  owner: ChecklistOwner;
  status: ChecklistStatus;
  /** Already-formatted due date (e.g. "vence 24 may"). */
  dueLabel?: string;
}

export interface PortalOnboardingChecklistProps {
  heading?: string;
  items: ChecklistItem[];
}

/* ----- Section: ScheduleCTA ----- */
export interface ScheduleFallback {
  /** Channel label (e.g. "WhatsApp", "Email"). */
  label: string;
  /** Channel value as displayed (e.g. "+51 947 633 203", "andre@cofoundy.dev"). */
  value: string;
  /** Optional href — wraps the row in an anchor (wa.me/, mailto:). */
  href?: string;
}

export interface PortalScheduleCTAProps {
  heading?: string;
  /** Person name for the CTA (e.g. "André Pacheco"). */
  personName: string;
  /** Role / title (e.g. "CEO · Cofoundy"). */
  personRole?: string;
  /** Avatar URL. */
  personAvatar?: string;
  /** Scheduling URL (Cal.com etc.). */
  scheduleUrl: string;
  /** CTA label (default "Agenda una llamada"). */
  ctaLabel?: string;
  /** Short single-line message (e.g. "¿necesitas hablar?"). */
  message?: string;
  /** Fallback contact channels. */
  fallbacks?: ScheduleFallback[];
}
