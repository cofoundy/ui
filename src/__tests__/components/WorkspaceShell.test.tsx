import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  WorkspaceShell,
  WorkspaceShellRail,
  WorkspaceShellIdentity,
  WorkspaceShellNav,
  WorkspaceShellNavItem,
  WorkspaceShellRailFooter,
  WorkspaceShellWell,
} from "../../components/ui/workspace-shell";

function System() {
  return (
    <WorkspaceShell>
      <WorkspaceShellRail>
        <WorkspaceShellIdentity wordmark="Cofoundy" glyph="C" chip={<span>OWNER</span>} />
        <WorkspaceShellNav label="Workspace access">
          <WorkspaceShellNavItem count={3} active>
            Members
          </WorkspaceShellNavItem>
          <WorkspaceShellNavItem count={2}>Teams</WorkspaceShellNavItem>
        </WorkspaceShellNav>
        <WorkspaceShellRailFooter>Accounts provisioned by Cofoundy</WorkspaceShellRailFooter>
      </WorkspaceShellRail>
      <WorkspaceShellWell>
        <h1>Members</h1>
      </WorkspaceShellWell>
    </WorkspaceShell>
  );
}

describe("WorkspaceShell", () => {
  it("renders rail + well with their data-slots", () => {
    const { container } = render(<System />);
    expect(
      container.querySelector('[data-slot="workspace-shell"]')
    ).toBeInTheDocument();
    expect(
      container.querySelector('[data-slot="workspace-shell-rail"]')
    ).toBeInTheDocument();
    expect(
      container.querySelector('[data-slot="workspace-shell-well"]')
    ).toBeInTheDocument();
  });

  it("renders well children", () => {
    render(<System />);
    expect(screen.getByRole("heading", { name: "Members" })).toBeInTheDocument();
  });

  it("renders identity wordmark and glyph", () => {
    render(<System />);
    expect(screen.getByText("Cofoundy")).toBeInTheDocument();
    expect(screen.getByText("C")).toBeInTheDocument();
  });

  it("renders the mobile collapse classes on rail (flex-row → md:flex-col)", () => {
    const { container } = render(<System />);
    const rail = container.querySelector('[data-slot="workspace-shell-rail"]')!;
    // mobile-first: horizontal top bar by default, vertical rail at md+
    expect(rail.className).toContain("flex-row");
    expect(rail.className).toContain("md:flex-col");
    expect(rail.className).toContain("sticky");
    expect(rail.className).toContain("md:w-[272px]");
  });

  it("marks the active nav item with data-active and renders count pills", () => {
    const { container } = render(<System />);
    const items = container.querySelectorAll(
      '[data-slot="workspace-shell-nav-item"]'
    );
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveAttribute("data-active");
    expect(items[1]).not.toHaveAttribute("data-active");
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("nav items render at least the 44px touch-target height (h-11)", () => {
    const { container } = render(<System />);
    const item = container.querySelector(
      '[data-slot="workspace-shell-nav-item"]'
    )!;
    expect(item.className).toContain("h-11");
  });

  it("supports asChild to deep-link a nav item via an anchor", () => {
    render(
      <WorkspaceShellNav>
        <WorkspaceShellNavItem asChild active count={5}>
          <a href="/workspace/members">Members</a>
        </WorkspaceShellNavItem>
      </WorkspaceShellNav>
    );
    const link = screen.getByRole("link", { name: /members/i });
    expect(link).toHaveAttribute("href", "/workspace/members");
    expect(link).toHaveAttribute("data-slot", "workspace-shell-nav-item");
    expect(link).toHaveAttribute("data-active");
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("respects a custom well maxWidth", () => {
    const { container } = render(
      <WorkspaceShellWell maxWidth={1100}>x</WorkspaceShellWell>
    );
    const inner = container
      .querySelector('[data-slot="workspace-shell-well"]')!
      .querySelector("div")!;
    expect(inner.getAttribute("style")).toContain("max-width: 1100px");
  });
});
