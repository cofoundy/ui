// WorkspaceShell — the canonical showcase for the workspace governance system.
//
// STRATEGIC BRIEF (why this component is shaped this way — keep for maintainers):
//   The "Ledger × Rail-Shell" winner: an editorial inline-sentence body grafted onto a
//   persistent left-rail desktop shell. Three critique fixes are baked into the primitives:
//     1. OWN THE DESKTOP WIDTH — persistent ~272px rail + a filled content well (~1040px
//        inner measure, real right edge). WorkspaceShell + WorkspaceShellWell encode this.
//     2. PERMISSION LEGIBLE AT A GLANCE — role/visibility/access state promoted to a
//        higher-contrast TINTED CHIP (RoleChip). The row spine = NAME + CHIP.
//     3. REAL DEPTH + LEGIBLE NOTE — one elevation tier; the activation note lifted off
//        AA-failing gray to a calm legible tone (ActivationNote, --doc-ink-note).
//
// SCORECARD (final, accepted): desktop-width ownership ✓, permission glance-legibility ✓,
//   AA in light + dark ✓ (per-tone --chip-fg-* overrides), mobile collapse to sticky top-bar
//   with 44px targets + 16px inputs ✓, one real elevation tier ✓.
//
// GAP-MAP REUSE: the shell is product-agnostic — identity wordmark, nav items, counts and
//   all copy are props/children. Inbox AI / Timely / Pulse can reuse it by swapping the
//   identity + nav + well content (see InboxAIReuse story).

import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";

import {
  WorkspaceShell,
  WorkspaceShellRail,
  WorkspaceShellIdentity,
  WorkspaceShellNav,
  WorkspaceShellNavItem,
  WorkspaceShellRailFooter,
  WorkspaceShellWell,
} from "../../components/ui/workspace-shell";
import { RoleChip } from "../../components/ui/role-chip";
import { ActivationNote } from "../../components/ui/activation-note";

/* ------------------------------------------------------------------ */
/* Demo-local icons (product-supplied in real usage)                  */
/* ------------------------------------------------------------------ */
const MembersIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <circle cx="9" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.6" />
    <path d="M3.5 19c0-3 2.5-5 5.5-5s5.5 2 5.5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    <path d="M16 5.2a3 3 0 0 1 0 5.6M17.5 19c0-2.2-1-3.9-2.6-4.7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.65" />
  </svg>
);
const TeamsIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <rect x="3.5" y="4" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.6" />
    <rect x="13.5" y="4" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.6" opacity="0.7" />
    <rect x="8.5" y="13" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.6" opacity="0.85" />
  </svg>
);

/* ------------------------------------------------------------------ */
/* Demo well: a ledger of members built from the canonical primitives  */
/* ------------------------------------------------------------------ */
const MEMBERS = [
  { name: "Owner", email: "owner-e2e@cofoundy.dev", tone: "owner" as const, clause: "Full control of this workspace.", you: true },
  { name: "Admin", email: "admin-e2e@cofoundy.dev", tone: "admin" as const, clause: "Can manage members, teams and access." },
  { name: "Member", email: "invitee-e2e@cofoundy.dev", tone: "member" as const, clause: "Can read docs shared with them." },
];

function MembersWell() {
  return (
    <>
      <header style={{ marginBottom: 26 }}>
        <h1 style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: 30, fontWeight: 600, letterSpacing: "-0.02em", color: "var(--doc-ink)" }}>
          Members
        </h1>
        <p style={{ margin: "9px 0 0", maxWidth: "56ch", fontFamily: "var(--font-sans)", fontSize: 14.5, lineHeight: 1.5, color: "var(--doc-ink-soft)" }}>
          People with access to this workspace, kept as a plain record. Each role states what that person can read, comment on, or change.
        </p>
      </header>

      {/* Raised invite panel + ActivationNote (inset) */}
      <div
        style={{
          marginBottom: 22,
          padding: 20,
          background: "var(--doc-paper-raised)",
          border: "1px solid var(--doc-rule-strong)",
          borderRadius: 14,
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04), 0 1px 2px rgba(2,11,27,0.4), 0 20px 44px -24px rgba(2,11,27,0.9)",
        }}
      >
        <div style={{ fontFamily: "var(--font-sans)", fontSize: 14, color: "var(--doc-ink-soft)", marginBottom: 14 }}>
          Invite by email · Role · Invite
        </div>
        <ActivationNote variant="inset">
          Access activates when this email signs in; accounts are provisioned by Cofoundy.
        </ActivationNote>
      </div>

      {/* Ledger */}
      <section style={{ background: "var(--doc-tint)", border: "1px solid var(--doc-rule)", borderRadius: 14, overflow: "hidden" }}>
        <div style={{ padding: "18px 22px 6px", fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 600, color: "var(--doc-ink)" }}>
          Of record
        </div>
        <div style={{ padding: "0 22px 14px" }}>
          {MEMBERS.map((m, i) => (
            <React.Fragment key={m.email}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr auto", alignItems: "center", columnGap: 18, padding: "15px 0" }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontFamily: "var(--font-sans)", fontSize: 15.5, fontWeight: 600, color: "var(--doc-ink)" }}>{m.name}</span>
                    {m.you && (
                      <span style={{ fontFamily: "var(--font-sans)", fontSize: 10.5, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--doc-accent)", border: "1px solid var(--doc-rule-strong)", borderRadius: 4, padding: "1px 6px" }}>You</span>
                    )}
                  </div>
                  <div style={{ marginTop: 4, fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--doc-ink-soft)" }}>{m.clause}</div>
                  <div style={{ marginTop: 4, fontFamily: "var(--font-mono)", fontSize: 12.5, color: "var(--doc-ink-muted)" }}>{m.email}</div>
                </div>
                <RoleChip tone={m.tone} />
              </div>
              {i < MEMBERS.length - 1 && <div style={{ height: 1, background: "var(--doc-rule)" }} />}
            </React.Fragment>
          ))}
        </div>
      </section>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Composed system                                                     */
/* ------------------------------------------------------------------ */
function System({ mode, well }: { mode?: "light"; well?: React.ReactNode }) {
  const [active, setActive] = React.useState<"Members" | "Teams">("Members");
  return (
    <div data-theme={mode === "light" ? "light" : undefined} style={{ minHeight: "100vh", background: "var(--well-bg)" }}>
      <WorkspaceShell>
        <WorkspaceShellRail>
          <WorkspaceShellIdentity wordmark="Cofoundy" glyph="C" chip={<RoleChip tone="owner" />} />
          <WorkspaceShellNav label="Workspace access">
            <WorkspaceShellNavItem icon={MembersIcon} count={3} active={active === "Members"} onClick={() => setActive("Members")}>
              Members
            </WorkspaceShellNavItem>
            <WorkspaceShellNavItem icon={TeamsIcon} count={3} active={active === "Teams"} onClick={() => setActive("Teams")}>
              Teams
            </WorkspaceShellNavItem>
          </WorkspaceShellNav>
          <WorkspaceShellRailFooter>Accounts provisioned by Cofoundy</WorkspaceShellRailFooter>
        </WorkspaceShellRail>
        <WorkspaceShellWell>{well ?? <MembersWell />}</WorkspaceShellWell>
      </WorkspaceShell>
    </div>
  );
}

const meta: Meta<typeof WorkspaceShell> = {
  title: "Navigation/WorkspaceShell",
  component: WorkspaceShell,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    backgrounds: { default: "deep", values: [{ name: "deep", value: "#020b1b" }] },
  },
};
export default meta;
type Story = StoryObj<typeof WorkspaceShell>;

export const FullSystem: Story = { render: () => <System /> };

export const Light: Story = {
  parameters: { backgrounds: { default: "light", values: [{ name: "light", value: "#ffffff" }] } },
  render: () => <System mode="light" />,
};

/* Gap-map reuse: same shell, different product identity + nav.
   Demonstrates Inbox AI consuming WorkspaceShell with no docs-ai copy. */
export const InboxAIReuse: Story = {
  render: () => (
    <div style={{ minHeight: "100vh", background: "var(--well-bg)" }}>
      <WorkspaceShell>
        <WorkspaceShellRail>
          <WorkspaceShellIdentity wordmark="Inbox AI" glyph="I" chip={<RoleChip tone="admin" />} />
          <WorkspaceShellNav label="Workspace">
            <WorkspaceShellNavItem icon={MembersIcon} count={12} active>
              Agents
            </WorkspaceShellNavItem>
            <WorkspaceShellNavItem icon={TeamsIcon} count={4}>
              Channels
            </WorkspaceShellNavItem>
          </WorkspaceShellNav>
          <WorkspaceShellRailFooter>Routing handled by Inbox AI</WorkspaceShellRailFooter>
        </WorkspaceShellRail>
        <WorkspaceShellWell>
          <h1 style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: 30, fontWeight: 600, color: "var(--doc-ink)" }}>Agents</h1>
          <p style={{ margin: "9px 0 0", color: "var(--doc-ink-soft)", fontSize: 14.5 }}>
            The same rail + well primitive, re-skinned for Inbox AI. No docs-ai copy — identity, nav and well are all props.
          </p>
        </WorkspaceShellWell>
      </WorkspaceShell>
    </div>
  ),
};
