import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { RoleChip } from "../../components/ui/role-chip";

const TONES = ["owner", "admin", "member", "open", "private", "public"] as const;

describe("RoleChip", () => {
  it("renders with data-slot on the root", () => {
    const { container } = render(<RoleChip tone="owner">OWNER</RoleChip>);
    expect(container.querySelector('[data-slot="role-chip"]')).toBeInTheDocument();
  });

  it.each(TONES)("renders the %s tone with its data-tone attribute", (tone) => {
    const { container } = render(<RoleChip tone={tone}>{tone}</RoleChip>);
    const chip = container.querySelector('[data-slot="role-chip"]');
    expect(chip).toHaveAttribute("data-tone", tone);
  });

  it("falls back to the upper-cased tone when no children are given", () => {
    render(<RoleChip tone="public" />);
    expect(screen.getByText("PUBLIC")).toBeInTheDocument();
  });

  it("renders the leading status dot by default", () => {
    const { container } = render(<RoleChip tone="owner">OWNER</RoleChip>);
    // dot is the first aria-hidden span inside the chip
    const chip = container.querySelector('[data-slot="role-chip"]')!;
    expect(chip.querySelector("[aria-hidden]")).toBeInTheDocument();
  });

  it("omits the dot when dot={false}", () => {
    const { container } = render(
      <RoleChip tone="owner" dot={false}>
        OWNER
      </RoleChip>
    );
    const chip = container.querySelector('[data-slot="role-chip"]')!;
    expect(chip.querySelector("[aria-hidden]")).toBeNull();
  });

  it("applies the sm size variant", () => {
    const { container } = render(
      <RoleChip tone="member" size="sm">
        MEMBER
      </RoleChip>
    );
    const chip = container.querySelector('[data-slot="role-chip"]')!;
    expect(chip.className).toContain("text-[10px]");
  });

  it("forwards a ref to the span element", () => {
    let node: HTMLSpanElement | null = null;
    render(
      <RoleChip
        tone="admin"
        ref={(el) => {
          node = el;
        }}
      >
        ADMIN
      </RoleChip>
    );
    expect(node).toBeInstanceOf(HTMLSpanElement);
  });
});
