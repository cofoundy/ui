import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Logo } from "../../components/ui/logo";

const paths = (el: Element) => Array.from(el.querySelectorAll("path"));

describe("Logo", () => {
  it("color por defecto, con colores de marca y nombre accesible", () => {
    const { container } = render(<Logo />);
    const svg = container.querySelector("svg")!;
    expect(svg.dataset.variant).toBe("color");
    expect(svg.getAttribute("role")).toBe("img");
    expect(svg.getAttribute("aria-label")).toBe("Cofoundy");
    expect(svg.classList.contains("cf-logo")).toBe(true);
    expect(paths(svg)).toHaveLength(10);
    expect(paths(svg).some((p) => p.getAttribute("fill") === "currentColor")).toBe(false);
  });

  it("mono: currentColor con relieve por opacidad (y el prop mono deprecado igual)", () => {
    for (const el of [<Logo variant="mono" key="v" />, <Logo mono key="m" />]) {
      const { container, unmount } = render(el);
      const svg = container.querySelector("svg")!;
      expect(svg.dataset.variant).toBe("mono");
      expect(paths(svg).every((p) => p.getAttribute("fill") === "currentColor")).toBe(true);
      expect(paths(svg).filter((p) => p.getAttribute("opacity")).length).toBeGreaterThan(0);
      unmount();
    }
  });

  it("flat: 10 caras planas en currentColor, sin opacidades", () => {
    const { container } = render(<Logo variant="flat" />);
    const svg = container.querySelector("svg")!;
    expect(paths(svg)).toHaveLength(10);
    expect(paths(svg).every((p) => p.getAttribute("fill") === "currentColor")).toBe(true);
    expect(paths(svg).some((p) => p.getAttribute("opacity"))).toBe(false);
  });

  it("variant gana sobre mono", () => {
    const { container } = render(<Logo mono variant="flat" />);
    expect(container.querySelector("svg")!.dataset.variant).toBe("flat");
  });

  it("aria-hidden lo vuelve decorativo (sin role ni aria-label)", () => {
    const { container } = render(<Logo aria-hidden />);
    const svg = container.querySelector("svg")!;
    expect(svg.getAttribute("role")).toBeNull();
    expect(svg.getAttribute("aria-label")).toBeNull();
  });
});
