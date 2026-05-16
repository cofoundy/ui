import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { NotFound } from "../../components/ui/NotFound";

describe("NotFound", () => {
  const baseProps = {
    primaryAction: { label: "Volver al inbox", href: "/inbox" },
  };

  describe("Rendering", () => {
    it("renders without crashing", () => {
      const { container } = render(<NotFound {...baseProps} />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it('marks the root element with data-slot="not-found"', () => {
      const { container } = render(<NotFound {...baseProps} />);
      const root = container.querySelector('[data-slot="not-found"]');
      expect(root).toBeInTheDocument();
    });

    it("renders the primary CTA with the supplied label and href", () => {
      render(<NotFound {...baseProps} />);
      const link = screen.getByRole("link", { name: /volver al inbox/i });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute("href", "/inbox");
    });

    it("renders the default Cofoundy footer text", () => {
      render(<NotFound {...baseProps} />);
      expect(screen.getByText("cofoundy.dev")).toBeInTheDocument();
    });

    it("renders the default why-clause subline when no secondaryMessage is given", () => {
      render(<NotFound {...baseProps} />);
      expect(
        screen.getByText(/Se movió, expiró, o el enlace tenía un typo\./i)
      ).toBeInTheDocument();
    });
  });

  describe("productContext variants", () => {
    it("renders Inbox AI kicker and scope wording for productContext='inbox'", () => {
      render(<NotFound {...baseProps} productContext="inbox" />);
      expect(screen.getByText("Inbox AI")).toBeInTheDocument();
      expect(screen.getByText(/ya no existe en tu inbox/i)).toBeInTheDocument();
    });

    it("renders Timely AI kicker and scope wording for productContext='timely'", () => {
      render(<NotFound {...baseProps} productContext="timely" />);
      expect(screen.getByText("Timely AI")).toBeInTheDocument();
      expect(screen.getByText(/ya no existe en tu agenda/i)).toBeInTheDocument();
    });

    it("renders Pulse AI kicker and scope wording for productContext='pulse'", () => {
      render(<NotFound {...baseProps} productContext="pulse" />);
      expect(screen.getByText("Pulse AI")).toBeInTheDocument();
      expect(screen.getByText(/ya no existe en tu tablero/i)).toBeInTheDocument();
    });

    it("renders landing kicker and scope wording for productContext='landing'", () => {
      render(<NotFound {...baseProps} productContext="landing" />);
      expect(screen.getByText("Cofoundy")).toBeInTheDocument();
      expect(screen.getByText(/ya no existe en el sitio/i)).toBeInTheDocument();
    });

    it("falls back to white-label defaults when no productContext is provided", () => {
      render(<NotFound {...baseProps} />);
      expect(screen.getByText("Cofoundy")).toBeInTheDocument();
      expect(screen.getByText(/ya no existe en el sitio/i)).toBeInTheDocument();
    });

    it("renders unknown productContext strings as-is in the kicker", () => {
      render(<NotFound {...baseProps} productContext="acme-portal" />);
      expect(screen.getByText("acme-portal")).toBeInTheDocument();
    });
  });

  describe("Copy overrides", () => {
    it("replaces the default subline when secondaryMessage is provided", () => {
      const override = "El host pudo haber movido este enlace.";
      render(<NotFound {...baseProps} secondaryMessage={override} />);
      expect(screen.getByText(override)).toBeInTheDocument();
      expect(
        screen.queryByText(/Se movió, expiró, o el enlace tenía un typo\./i)
      ).not.toBeInTheDocument();
    });

    it("replaces the default headline when title is provided", () => {
      const headline = "Esta conversación ya no está disponible.";
      render(<NotFound {...baseProps} title={headline} />);
      expect(screen.getByRole("heading", { name: headline })).toBeInTheDocument();
      expect(
        screen.queryByText(/Pasa que esta URL ya no existe/i)
      ).not.toBeInTheDocument();
    });

    it("uses a custom footerText when supplied", () => {
      render(<NotFound {...baseProps} footerText="acme.example" />);
      expect(screen.getByText("acme.example")).toBeInTheDocument();
      expect(screen.queryByText("cofoundy.dev")).not.toBeInTheDocument();
    });
  });

  describe("Variants and className passthrough", () => {
    it("accepts and applies a custom className on the root", () => {
      const { container } = render(
        <NotFound {...baseProps} className="custom-not-found" />
      );
      const root = container.querySelector('[data-slot="not-found"]');
      expect(root?.className).toContain("custom-not-found");
    });

    it("supports the compact density variant", () => {
      const { container } = render(
        <NotFound {...baseProps} density="compact" />
      );
      const root = container.querySelector('[data-slot="not-found"]');
      // CVA injects the bracketed grid-rows utility; verifying via class match
      // keeps the test resilient to Tailwind version drift.
      expect(root?.className).toMatch(/grid-template-rows:24vh/);
    });
  });
});
