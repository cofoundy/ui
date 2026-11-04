import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { LogoHeader } from "../../components/ui/logo-header";

describe("LogoHeader", () => {
  it("es horizontal por defecto (API sin cambios)", () => {
    const { container } = render(<LogoHeader />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.dataset.layout).toBe("horizontal");
    expect(root.className).toContain("flex-row");
    expect(root.className).not.toContain("flex-col");
    expect(screen.getByText("Cofoundy")).toBeTruthy();
    // el isologo es decorativo junto al wordmark
    expect(root.querySelector("svg")?.getAttribute("aria-hidden")).toBe("true");
  });

  it("apila isologo arriba y wordmark debajo con layout='stacked'", () => {
    const { container } = render(<LogoHeader layout="stacked" />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.dataset.layout).toBe("stacked");
    expect(root.className).toContain("flex-col");
    // orden: primero el svg del isologo, luego el wordmark
    expect(root.children[0].tagName.toLowerCase()).toBe("svg");
    expect(root.children[1].textContent).toBe("Cofoundy");
    // en apilado el isologo sube un escalón (default → lg = w-16)
    expect(root.children[0].getAttribute("class")).toContain("w-16");
  });

  it("respeta isologoOnly en apilado", () => {
    const { container } = render(<LogoHeader layout="stacked" isologoOnly />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.children).toHaveLength(1);
    expect(root.children[0].tagName.toLowerCase()).toBe("svg");
  });

  it("mono (deprecado) equivale a variant='mono' y deja el wordmark en currentColor", () => {
    const { container } = render(<LogoHeader mono />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.dataset.variant).toBe("mono");
    expect(root.querySelector("span")?.className).toContain("text-current");
  });

  it("variant='flat' usa el isologo plano", () => {
    const { container } = render(<LogoHeader variant="flat" layout="stacked" />);
    expect(container.querySelector("svg")?.dataset.variant).toBe("flat");
  });
});
