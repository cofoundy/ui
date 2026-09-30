import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";

// `DropdownMenuItem asChild` wrapping a link is how consumers put a router link in a menu.
// With the highlight slot rendered as a sibling (`{false}{children}`) the Slot got two
// children and `React.Children.only` threw the moment the menu opened.
describe("DropdownMenuItem asChild", () => {
  it("renders its single child as the menu item when the menu opens", () => {
    render(
      <DropdownMenu open>
        <DropdownMenuTrigger>open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem asChild>
            <a href="/settings">Ajustes</a>
          </DropdownMenuItem>
          <DropdownMenuItem>Plain</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    const link = screen.getByRole("menuitem", { name: "Ajustes" });
    expect(link.tagName).toBe("A");
    expect(link.getAttribute("href")).toBe("/settings");
    expect(screen.getByRole("menuitem", { name: "Plain" })).toBeTruthy();
  });
});
